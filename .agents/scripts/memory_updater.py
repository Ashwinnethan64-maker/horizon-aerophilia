#!/usr/bin/env python3
"""Execution memory journal updater synchronized with Antigravity hooks and transcripts."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prompt_logger  # noqa: E402


def _diag(msg: str) -> None:
    sys.stderr.write(f"[memory-updater] {msg}\n")


def _summarize_title(prompt_text: str, turn_seq: int) -> str:
    """Derive a concise task title from the first non-empty line of the prompt."""
    for line in prompt_text.splitlines():
        cleaned = line.strip().lstrip("#").strip()
        if cleaned:
            return cleaned[:72] + ("..." if len(cleaned) > 72 else "")
    return f"Execution Turn #{turn_seq:03d}"


def handle_hook(payload: dict[str, Any]) -> dict[str, Any]:
    """Process an Antigravity hook event for MEMORY.md."""
    event_name = str(payload.get("hookEventName") or "")
    repo_root = prompt_logger.resolve_repo_root(payload)
    state_path = repo_root / ".agents" / ".memory_updater_state.json"
    lock_path = repo_root / ".agents" / ".logger.lock"

    conv_id = str(payload.get("conversationId") or "Unavailable")
    inv_num = payload.get("invocationNum")
    init_steps = payload.get("initialNumSteps")
    model_str = prompt_logger.format_model(payload)
    user_str = prompt_logger.format_user_line(prompt_logger.get_contributor_info(repo_root))
    steps = prompt_logger.read_transcript_steps(payload.get("transcriptPath"))

    state = prompt_logger.load_state(state_path)
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
            "last_title": None,
            "emitted_event_ids": [],
        },
    )

    events_to_send: list[dict[str, Any]] = []
    emitted: list[str] = c_state.setdefault("emitted_event_ids", [])

    if event_name == "PreInvocation":
        step_idx, step_prompt = prompt_logger.extract_latest_user_step(steps)
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

        if prompt_text is not None:
            c_state["turn_seq"] = int(c_state.get("turn_seq", 0)) + 1
            c_state["turn_active"] = True
            c_state["last_invocation_num"] = inv_num
            c_state["last_initial_steps"] = init_steps
            if step_idx is not None:
                c_state["last_prompt_step_idx"] = step_idx
            c_state["last_prompt_text"] = prompt_text
            c_state["last_title"] = _summarize_title(prompt_text, c_state["turn_seq"])

            turn_seq = c_state["turn_seq"]
            ev_id = f"memory:pre:{conv_id}:turn:{turn_seq}"
            if ev_id not in emitted:
                emitted.append(ev_id)
                why_text = (
                    "Initial requirement"
                    if turn_seq == 1
                    else f"Refinement / Iteration #{turn_seq - 1}"
                )
                events_to_send.append(
                    {
                        "event_id": ev_id,
                        "event_type": "memory_entry",
                        "payload": {
                            "turn_key": f"{conv_id}:turn:{turn_seq}",
                            "title": c_state["last_title"],
                            "timestamp": prompt_logger.now_iso(),
                            "user": user_str,
                            "model": model_str,
                            "what": prompt_text,
                            "why": why_text,
                            "tools": [],
                            "files_modified": [],
                            "status": "In Progress",
                            "ai_output": "Pending model execution",
                        },
                    }
                )
            prompt_logger.save_state(state_path, state, lock_path)

    elif event_name in ("PostInvocation", "Stop"):
        turn_seq = int(c_state.get("turn_seq", 0))
        if turn_seq == 0:
            turn_seq = 1
            c_state["turn_seq"] = 1
        turn_key = f"{conv_id}:turn:{turn_seq}"
        after_idx = c_state.get("last_prompt_step_idx")
        out = prompt_logger.extract_turn_ai_output(steps, after_idx)

        why_text = (
            "Initial requirement"
            if turn_seq == 1
            else f"Refinement / Iteration #{turn_seq - 1}"
        )
        what_text = c_state.get("last_prompt_text") or "Unavailable"
        title = c_state.get("last_title") or f"Execution Turn #{turn_seq:03d}"

        if event_name == "PostInvocation":
            if out["response_text"] or out["tools"] or out["files_modified"]:
                digest = hashlib.sha256(
                    json.dumps(out, sort_keys=True, ensure_ascii=False).encode("utf-8")
                ).hexdigest()[:16]
                ev_id = f"memory:post:{conv_id}:turn:{turn_seq}:{digest}"
                if ev_id not in emitted:
                    emitted.append(ev_id)
                    events_to_send.append(
                        {
                            "event_id": ev_id,
                            "event_type": "memory_entry",
                            "payload": {
                                "turn_key": turn_key,
                                "title": title,
                                "timestamp": prompt_logger.now_iso(),
                                "user": user_str,
                                "model": model_str,
                                "what": what_text,
                                "why": why_text,
                                "tools": out["tools"],
                                "files_modified": out["files_modified"],
                                "status": "In Progress",
                                "ai_output": out["response_text"]
                                or "Tools executed; awaiting final response.",
                            },
                        }
                    )
        else:
            # Stop event
            c_state["turn_active"] = False
            term_reason = str(payload.get("terminationReason") or "Unavailable")
            status = (
                "Completed (Current Final Prompt in Session)"
                if term_reason == "NO_TOOL_CALL"
                else "Completed"
            )
            ev_id = f"memory:stop:{conv_id}:turn:{turn_seq}"
            if ev_id not in emitted:
                emitted.append(ev_id)
                events_to_send.append(
                    {
                        "event_id": ev_id,
                        "event_type": "memory_entry",
                        "payload": {
                            "turn_key": turn_key,
                            "title": title,
                            "timestamp": prompt_logger.now_iso(),
                            "user": user_str,
                            "model": model_str,
                            "what": what_text,
                            "why": why_text,
                            "tools": out["tools"],
                            "files_modified": out["files_modified"],
                            "termination_reason": term_reason,
                            "status": status,
                            "ai_output": out["response_text"]
                            or "Turn stopped (no assistant-visible output recorded).",
                        },
                    }
                )

        prompt_logger.save_state(state_path, state, lock_path)

    prompt_logger.send_or_queue_events(repo_root, state_path, events_to_send)

    if event_name == "Stop":
        return {"decision": "allow"}
    return {}


def main() -> None:
    raw_stdin = sys.stdin.read()
    try:
        payload = json.loads(raw_stdin) if raw_stdin.strip() else {}
        if not isinstance(payload, dict):
            raise ValueError("Hook payload must be a JSON object")
    except Exception as exc:
        _diag(f"Invalid JSON on stdin: {exc}")
        sys.stdout.write("{}\n")
        return

    try:
        response = handle_hook(payload)
    except Exception as exc:
        _diag(f"Hook execution error: {exc}")
        response = {"decision": "allow"} if payload.get("hookEventName") == "Stop" else {}

    sys.stdout.write(json.dumps(response) + "\n")


if __name__ == "__main__":
    main()

