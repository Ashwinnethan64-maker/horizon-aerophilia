#!/usr/bin/env python3
"""Central append-only prompt logger and optional LAN collector for Antigravity."""

from __future__ import annotations

import argparse
from datetime import datetime
import fcntl
import getpass
import hashlib
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from typing import Any
from urllib import error as urllib_error
from urllib import request as urllib_request

DEFAULT_PORT = 8765
HTTP_TIMEOUT_SECONDS = 2.5
MAX_SEEN_IDS = 5000

SECRET_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b"), "[REDACTED]"),
    (re.compile(r"\b(sk-[A-Za-z0-9_-]{16,})\b"), "[REDACTED]"),
    (re.compile(r"\b(AIza[0-9A-Za-z_-]{20,})\b"), "[REDACTED]"),
    (re.compile(r"\b(AKIA[0-9A-Z]{16})\b"), "[REDACTED]"),
    (re.compile(r"(?i)(Bearer\s+)[A-Za-z0-9._~+/=-]{12,}"), r"\1[REDACTED]"),
    (
        re.compile(
            r"(?i)((?:PROMPT_BATTLE_LOG_TOKEN|api[_-]?key|secret|password|token)\s*[:=]\s*['\"]?)([^\s'\",;]{8,})(['\"]?)"
        ),
        r"\1[REDACTED]\3",
    ),
    (
        re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----"),
        "[REDACTED_PRIVATE_KEY]",
    ),
)

FILE_ARG_KEYS = ("Path", "TargetFile", "path", "file_path", "target_file")
WRITE_TOOLS = {"write_file", "edit_file", "replace_file_content", "multi_replace_file_content"}


def diag(msg: str) -> None:
    """Write diagnostics strictly to stderr."""
    sys.stderr.write(f"[prompt-logger] {msg}\n")


def now_iso() -> str:
    """Return current local timestamp with timezone in ISO 8601 format."""
    return datetime.now().astimezone().isoformat(timespec="seconds")


def redact_secrets(text: str) -> tuple[str, bool]:
    """Redact common credential patterns; return (text, was_redacted)."""
    if not text:
        return text, False
    redacted = False
    result = text
    for pattern, repl in SECRET_PATTERNS:
        new_result, count = pattern.subn(repl, result)
        if count > 0:
            redacted = True
            result = new_result
    return result, redacted


def resolve_repo_root(payload: dict[str, Any] | None = None) -> Path:
    """Resolve repository root from payload workspacePaths/cwd or script location."""
    candidates: list[Path] = []
    if payload:
        ws_paths = payload.get("workspacePaths")
        if isinstance(ws_paths, list):
            for p in ws_paths:
                if isinstance(p, str) and p.strip():
                    candidates.append(Path(p))
        cwd_val = payload.get("cwd")
        if isinstance(cwd_val, str) and cwd_val.strip():
            candidates.append(Path(cwd_val))
    candidates.append(Path(__file__).resolve().parent.parent.parent)

    for candidate in candidates:
        try:
            resolved = candidate.resolve()
            if (resolved / ".agents").is_dir() or (resolved / ".git").exists():
                return resolved
        except OSError:
            continue
    return Path(__file__).resolve().parent.parent.parent


def get_contributor_info(repo_root: Path) -> dict[str, str]:
    """Collect contributor identity using getpass and git config."""
    try:
        os_user = getpass.getuser() or "Unavailable"
    except Exception:
        os_user = "Unavailable"

    def _git_cfg(key: str) -> str:
        try:
            res = subprocess.run(
                ["git", "-C", str(repo_root), "config", key],
                capture_output=True,
                text=True,
                timeout=2,
                check=False,
            )
            val = res.stdout.strip()
            return val if val else "Unavailable"
        except Exception:
            return "Unavailable"

    return {
        "os_user": os_user,
        "git_name": _git_cfg("user.name"),
        "git_email": _git_cfg("user.email"),
    }


def format_user_line(info: dict[str, str]) -> str:
    """Format user display string from contributor info."""
    os_u = info.get("os_user") or "Unavailable"
    git_u = info.get("git_name") or "Unavailable"
    git_e = info.get("git_email") or "Unavailable"
    if git_e != "Unavailable":
        return f"{os_u} / {git_u} ({git_e})"
    return f"{os_u} / {git_u}"


def format_model(payload: dict[str, Any]) -> str:
    """Format Antigravity model string without fabricating missing values."""
    model_name = payload.get("modelName")
    if isinstance(model_name, str) and model_name.strip():
        return f"Antigravity ({model_name.strip()})"
    return "Antigravity (Unavailable)"


def durable_append(path: Path, entry: str, lock_path: Path) -> None:
    """Append entry to path with exclusive file lock and fsync."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with open(lock_path, "a+", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        try:
            with open(path, "a", encoding="utf-8") as f:
                f.write(entry)
                f.flush()
                os.fsync(f.fileno())
        finally:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


def load_state(state_path: Path) -> dict[str, Any]:
    """Load JSON state file safely."""
    if not state_path.exists():
        return {}
    try:
        with open(state_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception as exc:
        diag(f"Failed to read state {state_path}: {exc}")
        return {}


def save_state(state_path: Path, state: dict[str, Any], lock_path: Path) -> None:
    """Atomically persist JSON state file under file lock."""
    state_path.parent.mkdir(parents=True, exist_ok=True)
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = state_path.with_suffix(".tmp")
    with open(lock_path, "a+", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        try:
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp_path, state_path)
        finally:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


def _unwrap_user_request(content: str) -> str:
    """Extract inner prompt if wrapped in <USER_REQUEST> tags in transcript."""
    match = re.search(r"<USER_REQUEST>\s*\n?(.*?)\n?\s*</USER_REQUEST>", content, re.DOTALL)
    if match:
        return match.group(1)
    return content


def read_transcript_steps(transcript_path_str: str | None) -> list[dict[str, Any]]:
    """Read transcript.jsonl, merging full fields from transcript_full.jsonl if present."""
    if not transcript_path_str:
        return []
    t_path = Path(transcript_path_str)
    if not t_path.is_file():
        return []

    full_path = t_path.parent / "transcript_full.jsonl"
    full_lines: list[str] | None = None
    if full_path.is_file():
        try:
            full_lines = full_path.read_text(encoding="utf-8").splitlines()
        except Exception as exc:
            diag(f"Could not read transcript_full.jsonl: {exc}")

    steps: list[dict[str, Any]] = []
    try:
        lines = t_path.read_text(encoding="utf-8").splitlines()
    except Exception as exc:
        diag(f"Could not read transcript {t_path}: {exc}")
        return []

    for idx, line in enumerate(lines):
        if not line.strip():
            continue
        try:
            step = json.loads(line)
        except json.JSONDecodeError:
            continue
        if (
            isinstance(step, dict)
            and step.get("truncated_fields")
            and full_lines is not None
            and idx < len(full_lines)
        ):
            try:
                full_step = json.loads(full_lines[idx])
                if isinstance(full_step, dict):
                    step = full_step
            except json.JSONDecodeError:
                pass
        if isinstance(step, dict):
            steps.append(step)
    return steps


def extract_latest_user_step(steps: list[dict[str, Any]]) -> tuple[int | None, str | None]:
    """Return (step_index, prompt_text) for the latest USER_EXPLICIT step."""
    for step in reversed(steps):
        if step.get("source") == "USER_EXPLICIT" or step.get("type") == "USER_INPUT":
            raw = step.get("content")
            if isinstance(raw, str) and raw.strip():
                idx = step.get("step_index")
                return (int(idx) if isinstance(idx, int) else None), _unwrap_user_request(raw)
    return None, None


def extract_turn_ai_output(
    steps: list[dict[str, Any]], after_step_idx: int | None
) -> dict[str, Any]:
    """Extract assistant-visible output, tools executed, and files modified.

    Never reads private internal reasoning (`thinking`).
    """
    tools: list[str] = []
    files_modified: list[str] = []
    responses: list[str] = []

    for step in steps:
        s_idx = step.get("step_index")
        if after_step_idx is not None and isinstance(s_idx, int) and s_idx <= after_step_idx:
            continue
        if step.get("source") != "MODEL":
            continue
        if step.get("type") == "PLANNER_RESPONSE":
            content = step.get("content")
            if isinstance(content, str) and content.strip():
                responses.append(content.strip())
            tool_calls = step.get("tool_calls")
            if isinstance(tool_calls, list):
                for tc in tool_calls:
                    if not isinstance(tc, dict):
                        continue
                    t_name = tc.get("name")
                    if isinstance(t_name, str) and t_name:
                        if t_name not in tools:
                            tools.append(t_name)
                        args = tc.get("args")
                        if t_name in WRITE_TOOLS and isinstance(args, dict):
                            for key in FILE_ARG_KEYS:
                                val = args.get(key)
                                if isinstance(val, str) and val.strip():
                                    cleaned = val.strip().strip('"')
                                    if cleaned not in files_modified:
                                        files_modified.append(cleaned)
                                    break

    return {
        "tools": tools,
        "files_modified": files_modified,
        "response_text": "\n\n".join(responses).strip(),
    }


def prompt_title(seq_num: int) -> str:
    """Format sequential prompt heading."""
    if seq_num == 1:
        return f"Prompt #{seq_num:03d} — Initial Prompt"
    return f"Prompt #{seq_num:03d} — Refinement / Iteration #{seq_num - 1}"


def render_prompt_entry(seq_num: int, data: dict[str, Any]) -> str:
    """Render a PROMPTS.md entry from event data."""
    raw_prompt = data.get("prompt_text", "")
    safe_prompt, redacted = redact_secrets(raw_prompt)
    title = prompt_title(seq_num)
    redaction_line = (
        "\n\n**Redaction Notice:** Sensitive credentials were detected and redacted; "
        "this record is not verbatim."
        if redacted
        else ""
    )
    return (
        "\n---\n\n"
        f"### {title}\n\n"
        "`[LATEST PROMPT IN SESSION]`\n\n"
        f"- **Timestamp:** {data.get('timestamp', 'Unavailable')}\n"
        f"- **User:** {data.get('user', 'Unavailable')}\n"
        f"- **Tool:** {data.get('model', 'Antigravity (Unavailable)')}\n"
        f"- **Conversation ID:** {data.get('conversation_id', 'Unavailable')}\n"
        f"- **Invocation:** {data.get('invocation', 'Unavailable')}\n\n"
        "**Exact User Prompt:**\n\n"
        f"{safe_prompt}{redaction_line}\n\n"
        "**Status:** Captured\n\n"
        "---\n"
    )


def render_ai_output_entry(prompt_num: int | None, data: dict[str, Any]) -> str:
    """Render an AI Output section for PROMPTS.md."""
    tools = data.get("tools") or []
    files_mod = data.get("files_modified") or []
    raw_resp = data.get("response_text") or "Unavailable (no assistant-visible output recorded)"
    safe_resp, redacted = redact_secrets(raw_resp)
    p_label = f"Prompt #{prompt_num:03d}" if isinstance(prompt_num, int) else "Unavailable"
    tools_str = ", ".join(tools) if tools else "None recorded"
    files_str = ", ".join(files_mod) if files_mod else "None verified"
    redaction_note = (
        "\n\n**Redaction Notice:** Sensitive credentials were redacted from AI output."
        if redacted
        else ""
    )
    return (
        "\n---\n\n"
        f"#### AI Output ({p_label})\n\n"
        f"- **Timestamp:** {data.get('timestamp', 'Unavailable')}\n"
        f"- **Tool:** {data.get('model', 'Antigravity (Unavailable)')}\n"
        f"- **Conversation ID:** {data.get('conversation_id', 'Unavailable')}\n"
        f"- **Invocation:** {data.get('invocation', 'Unavailable')}\n"
        f"- **Tools Executed:** {tools_str}\n"
        f"- **Files Modified:** {files_str}\n\n"
        "**AI Response Text:**\n\n"
        f"{safe_resp}{redaction_note}\n\n"
        "---\n"
    )


def render_session_marker(prompt_num: int | None, data: dict[str, Any]) -> str:
    """Render session completion marker without rewriting prior entries."""
    p_label = f"Prompt #{prompt_num:03d}" if isinstance(prompt_num, int) else "Prompt #000"
    return (
        "\n---\n\n"
        f"`[FINAL PROMPT USED — {p_label}]`\n"
        f"- **Timestamp:** {data.get('timestamp', 'Unavailable')}\n"
        f"- **Conversation ID:** {data.get('conversation_id', 'Unavailable')}\n"
        f"- **Termination Reason:** {data.get('termination_reason', 'Unavailable')}\n\n"
        "---\n"
    )


def render_memory_entry(exec_num: int, data: dict[str, Any]) -> str:
    """Render a MEMORY.md execution entry."""
    raw_what = data.get("what") or "Unavailable"
    safe_what, red_what = redact_secrets(raw_what)
    raw_out = data.get("ai_output") or "Pending"
    safe_out, red_out = redact_secrets(raw_out)
    tools = data.get("tools") or []
    files_mod = data.get("files_modified") or []

    actions_lines = [
        f"- Tools Executed: {', '.join(tools) if tools else 'None recorded'}",
        f"- Files Modified: {', '.join(files_mod) if files_mod else 'None verified'}",
    ]
    if data.get("termination_reason"):
        actions_lines.append(f"- Termination Reason: {data['termination_reason']}")
    if red_what or red_out:
        actions_lines.append("- Redaction Notice: Sensitive credentials were redacted.")

    title = data.get("title") or f"Prompt #{exec_num:03d}"
    return (
        "\n---\n\n"
        f"## Execution #{exec_num:03d} — {title}\n\n"
        f"- **Date & Time:** {data.get('timestamp', 'Unavailable')}\n"
        f"- **User (Prompted by):** {data.get('user', 'Unavailable')}\n"
        f"- **Implementer (Executed by):** {data.get('model', 'Antigravity (Unavailable)')}\n\n"
        "### What\n\n"
        f"{safe_what}\n\n"
        "### Why\n\n"
        f"{data.get('why', 'Initial requirement')}\n\n"
        "### Fix / Actions\n\n"
        + "\n".join(actions_lines)
        + "\n\n### Status\n\n"
        f"{data.get('status', 'In Progress')}\n\n"
        "### AI Output\n\n"
        f"{safe_out}\n\n"
        "---\n"
    )


def apply_event_locally(repo_root: Path, event: dict[str, Any]) -> dict[str, Any]:
    """Apply a single event to PROMPTS.md or MEMORY.md with central state & dedup."""
    agents_dir = repo_root / ".agents"
    lock_path = agents_dir / ".logger.lock"
    state_path = agents_dir / ".prompt_logger_state.json"

    event_id = str(event.get("event_id") or "")
    event_type = str(event.get("event_type") or "")
    data = event.get("payload")
    if not event_id or not isinstance(data, dict):
        return {"status": "invalid", "error": "Missing event_id or payload"}

    state = load_state(state_path)
    seen: list[str] = state.setdefault("seen_event_ids", [])
    if event_id in seen:
        return {"status": "duplicate", "event_id": event_id}

    prompt_map: dict[str, int] = state.setdefault("turn_prompt_numbers", {})
    exec_map: dict[str, int] = state.setdefault("turn_exec_numbers", {})
    turn_key = str(data.get("turn_key") or event_id)

    if event_type == "prompt":
        seq = int(state.get("prompt_seq", 0)) + 1
        state["prompt_seq"] = seq
        prompt_map[turn_key] = seq
        entry = render_prompt_entry(seq, data)
        durable_append(repo_root / "PROMPTS.md", entry, lock_path)
    elif event_type == "ai_output":
        p_num = data.get("prompt_num") or prompt_map.get(turn_key)
        entry = render_ai_output_entry(p_num if isinstance(p_num, int) else None, data)
        durable_append(repo_root / "PROMPTS.md", entry, lock_path)
    elif event_type == "session_marker":
        p_num = data.get("prompt_num") or prompt_map.get(turn_key)
        entry = render_session_marker(p_num if isinstance(p_num, int) else None, data)
        durable_append(repo_root / "PROMPTS.md", entry, lock_path)
    elif event_type == "memory_entry":
        if turn_key in exec_map:
            exec_num = exec_map[turn_key]
        else:
            exec_num = int(state.get("exec_seq", 0)) + 1
            state["exec_seq"] = exec_num
            exec_map[turn_key] = exec_num
        entry = render_memory_entry(exec_num, data)
        durable_append(repo_root / "MEMORY.md", entry, lock_path)
    else:
        return {"status": "error", "error": f"Unsupported event_type: {event_type}"}

    seen.append(event_id)
    if len(seen) > MAX_SEEN_IDS:
        state["seen_event_ids"] = seen[-MAX_SEEN_IDS:]
    save_state(state_path, state, lock_path)
    return {"status": "ok", "event_id": event_id}


def send_or_queue_events(
    repo_root: Path, state_path: Path, new_events: list[dict[str, Any]]
) -> None:
    """Deliver events to central LAN collector if configured, else apply locally."""
    url = os.environ.get("PROMPT_BATTLE_LOG_URL", "").strip()
    if not url:
        for ev in new_events:
            apply_event_locally(repo_root, ev)
        return

    lock_path = repo_root / ".agents" / ".logger.lock"
    state = load_state(state_path)
    queue: list[dict[str, Any]] = state.setdefault("pending_queue", [])
    existing_ids = {ev.get("event_id") for ev in queue}
    for ev in new_events:
        if ev.get("event_id") not in existing_ids:
            queue.append(ev)
            existing_ids.add(ev.get("event_id"))
    save_state(state_path, state, lock_path)

    token = os.environ.get("PROMPT_BATTLE_LOG_TOKEN", "")
    endpoint = url.rstrip("/") + "/events"
    remaining: list[dict[str, Any]] = []
    failed = False

    for ev in queue:
        if failed:
            remaining.append(ev)
            continue
        body = json.dumps(ev, ensure_ascii=False).encode("utf-8")
        req = urllib_request.Request(
            endpoint,
            data=body,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
        )
        try:
            with urllib_request.urlopen(req, timeout=HTTP_TIMEOUT_SECONDS) as resp:
                if resp.status not in (200, 201):
                    diag(f"Central collector returned HTTP {resp.status}; keeping event queued.")
                    remaining.append(ev)
                    failed = True
        except urllib_error.HTTPError as exc:
            diag(f"Central collector HTTP error {exc.code}: {exc.reason}; keeping event queued.")
            remaining.append(ev)
            failed = True
        except Exception as exc:
            diag(f"Central collector unreachable ({exc}); keeping event queued for retry.")
            remaining.append(ev)
            failed = True

    state = load_state(state_path)
    state["pending_queue"] = remaining
    save_state(state_path, state, lock_path)


def handle_hook(payload: dict[str, Any]) -> dict[str, Any]:
    """Process an Antigravity hook event and return the required JSON response."""
    event_name = str(payload.get("hookEventName") or "")
    repo_root = resolve_repo_root(payload)
    state_path = repo_root / ".agents" / ".prompt_logger_state.json"
    lock_path = repo_root / ".agents" / ".logger.lock"

    # Flush any previously queued offline events even on SessionStart
    if event_name == "SessionStart":
        send_or_queue_events(repo_root, state_path, [])
        return {}

    conv_id = str(payload.get("conversationId") or "Unavailable")
    inv_num = payload.get("invocationNum")
    init_steps = payload.get("initialNumSteps")
    inv_str = str(inv_num) if inv_num is not None else "Unavailable"
    model_str = format_model(payload)
    user_str = format_user_line(get_contributor_info(repo_root))
    steps = read_transcript_steps(payload.get("transcriptPath"))

    state = load_state(state_path)
    convs: dict[str, Any] = state.setdefault("conversations", {})
    c_state: dict[str, Any] = convs.setdefault(
        conv_id,
        {
            "turn_active": False,
            "turn_seq": 0,
            "last_invocation_num": None,
            "last_initial_steps": None,
            "last_prompt_step_idx": None,
            "last_prompt_text": None,
            "emitted_output_hashes": [],
            "stop_marker_turns": [],
        },
    )

    events_to_send: list[dict[str, Any]] = []

    if event_name == "PreInvocation":
        step_idx, step_prompt = extract_latest_user_step(steps)
        last_user_input = payload.get("lastUserInput")
        has_last_input = isinstance(last_user_input, str) and last_user_input.strip() != ""

        new_step = step_idx is not None and step_idx != c_state.get("last_prompt_step_idx")
        turn_closed = not c_state.get("turn_active", False)
        steps_changed = (
            init_steps is not None
            and c_state.get("last_initial_steps") is not None
            and init_steps != c_state.get("last_initial_steps")
        )
        same_inv = (
            inv_num is not None
            and inv_num == c_state.get("last_invocation_num")
            and init_steps == c_state.get("last_initial_steps")
        )

        prompt_text: str | None = None
        if new_step and step_prompt is not None:
            prompt_text = step_prompt
        elif has_last_input and (turn_closed or steps_changed) and not same_inv:
            prompt_text = last_user_input
        elif not has_last_input and not new_step:
            diag("PreInvocation: missing lastUserInput and no new USER_EXPLICIT transcript step.")

        if prompt_text is not None:
            c_state["turn_seq"] = int(c_state.get("turn_seq", 0)) + 1
            c_state["turn_active"] = True
            c_state["last_invocation_num"] = inv_num
            c_state["last_initial_steps"] = init_steps
            if step_idx is not None:
                c_state["last_prompt_step_idx"] = step_idx
            c_state["last_prompt_text"] = prompt_text

            turn_seq = c_state["turn_seq"]
            turn_key = f"{conv_id}:turn:{turn_seq}"
            ev_id = (
                f"prompt:{conv_id}:step:{step_idx}"
                if new_step and step_idx is not None
                else f"prompt:{conv_id}:turn:{turn_seq}:inv:{inv_str}"
            )
            events_to_send.append(
                {
                    "event_id": ev_id,
                    "event_type": "prompt",
                    "payload": {
                        "turn_key": turn_key,
                        "timestamp": now_iso(),
                        "user": user_str,
                        "model": model_str,
                        "conversation_id": conv_id,
                        "invocation": inv_str,
                        "prompt_text": prompt_text,
                    },
                }
            )
            save_state(state_path, state, lock_path)

    elif event_name in ("PostInvocation", "Stop"):
        turn_seq = int(c_state.get("turn_seq", 0))
        if turn_seq == 0:
            turn_seq = 1
            c_state["turn_seq"] = 1
        turn_key = f"{conv_id}:turn:{turn_seq}"
        after_idx = c_state.get("last_prompt_step_idx")
        out = extract_turn_ai_output(steps, after_idx)

        if out["response_text"] or out["tools"] or out["files_modified"]:
            digest = hashlib.sha256(
                json.dumps(out, sort_keys=True, ensure_ascii=False).encode("utf-8")
            ).hexdigest()[:16]
            emitted: list[str] = c_state.setdefault("emitted_output_hashes", [])
            if digest not in emitted:
                emitted.append(digest)
                events_to_send.append(
                    {
                        "event_id": f"ai_output:{conv_id}:turn:{turn_seq}:{digest}",
                        "event_type": "ai_output",
                        "payload": {
                            "turn_key": turn_key,
                            "timestamp": now_iso(),
                            "model": model_str,
                            "conversation_id": conv_id,
                            "invocation": inv_str,
                            "tools": out["tools"],
                            "files_modified": out["files_modified"],
                            "response_text": out["response_text"],
                        },
                    }
                )

        if event_name == "Stop":
            c_state["turn_active"] = False
            stop_turns: list[int] = c_state.setdefault("stop_marker_turns", [])
            if turn_seq not in stop_turns:
                stop_turns.append(turn_seq)
                events_to_send.append(
                    {
                        "event_id": f"stop_marker:{conv_id}:turn:{turn_seq}",
                        "event_type": "session_marker",
                        "payload": {
                            "turn_key": turn_key,
                            "timestamp": now_iso(),
                            "conversation_id": conv_id,
                            "termination_reason": str(
                                payload.get("terminationReason") or "Unavailable"
                            ),
                        },
                    }
                )

        save_state(state_path, state, lock_path)

    send_or_queue_events(repo_root, state_path, events_to_send)

    if event_name == "Stop":
        return {"decision": "allow"}
    return {}


def make_handler(repo_root: Path, auth_token: str) -> type[BaseHTTPRequestHandler]:
    """Create HTTP handler class bound to repo_root and auth_token."""

    class CollectorHandler(BaseHTTPRequestHandler):
        def log_message(self, format: str, *args: Any) -> None:
            diag(format % args)

        def _send_json(self, code: int, body: dict[str, Any]) -> None:
            raw = json.dumps(body).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self) -> None:
            if self.path == "/health":
                self._send_json(200, {"status": "ok"})
            else:
                self._send_json(404, {"error": "Not found"})

        def do_POST(self) -> None:
            if self.path != "/events":
                self._send_json(404, {"error": "Not found"})
                return

            auth_header = self.headers.get("Authorization", "")
            expected = f"Bearer {auth_token}"
            if not auth_token or not hmac.compare_digest(auth_header, expected):
                self._send_json(401, {"error": "Unauthorized"})
                return

            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw_body = self.rfile.read(length)
                event = json.loads(raw_body.decode("utf-8"))
            except Exception:
                self._send_json(400, {"error": "Invalid JSON"})
                return

            if not isinstance(event, dict) or "event_id" not in event or "event_type" not in event:
                self._send_json(400, {"error": "Missing event_id or event_type"})
                return

            result = apply_event_locally(repo_root, event)
            if result.get("status") in ("ok", "duplicate"):
                self._send_json(200, result)
            else:
                self._send_json(400, result)

    return CollectorHandler


def run_server(host: str, port: int, repo_root: Path, token: str) -> None:
    """Start the central LAN collector HTTP server."""
    if not token:
        diag("ERROR: PROMPT_BATTLE_LOG_TOKEN must be set to start the collector.")
        sys.exit(1)
    if host == "0.0.0.0":
        diag("WARNING: Binding to 0.0.0.0. Ensure firewall restricts access to LAN only.")
    server = ThreadingHTTPServer((host, port), make_handler(repo_root, token))
    diag(f"Central collector listening on http://{host}:{port} (repo: {repo_root})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        diag("Central collector shutting down.")
        server.server_close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Prompt Battle Central Prompt Logger")
    parser.add_argument("--serve", action="store_true", help="Run central LAN collector server")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default: 127.0.0.1)")
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PROMPT_BATTLE_LOG_PORT", DEFAULT_PORT)),
        help=f"Listen port (default: {DEFAULT_PORT})",
    )
    args = parser.parse_args()

    if args.serve:
        repo_root = resolve_repo_root()
        token = os.environ.get("PROMPT_BATTLE_LOG_TOKEN", "")
        run_server(args.host, args.port, repo_root, token)
        return

    raw_stdin = sys.stdin.read()
    try:
        payload = json.loads(raw_stdin) if raw_stdin.strip() else {}
        if not isinstance(payload, dict):
            raise ValueError("Hook payload must be a JSON object")
    except Exception as exc:
        diag(f"Invalid JSON on stdin: {exc}")
        sys.stdout.write("{}\n")
        return

    try:
        response = handle_hook(payload)
    except Exception as exc:
        diag(f"Hook execution error: {exc}")
        response = {"decision": "allow"} if payload.get("hookEventName") == "Stop" else {}

    sys.stdout.write(json.dumps(response) + "\n")


if __name__ == "__main__":
    main()

