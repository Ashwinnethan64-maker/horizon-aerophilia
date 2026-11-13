# Prompt Logging Policy

1. **Immediate Capture:** Every submitted Antigravity prompt must be captured immediately via `PreInvocation` before model execution.
2. **Verbatim Preservation:** Exact prompt wording, line breaks, punctuation, Markdown, and code must be preserved, except when sensitive credentials are detected—in which case sensitive values must be redacted and the redaction explicitly disclosed.
3. **Separate Refinement Records:** Every refinement or repeated prompt submission must be recorded as its own sequential entry.
4. **Authentic Metadata:** Record actual contributor identity (`getpass.getuser()`, `git config user.name`), actual Antigravity `modelName` (`Antigravity (<modelName>)`), conversation ID, and invocation ID. Mark unavailable fields explicitly; never fabricate metadata.
5. **AI Outputs & Execution Evidence:** Record assistant-visible outputs, executed tools, and verifiable file modifications on `PostInvocation` and `Stop`. Never record private internal reasoning (`thinking`).
6. **Single Authoritative Log:** Maintain one central, append-only `PROMPTS.md`. Never create per-member prompt logs or `.agent-log-user` files.
7. **Append-Only Integrity:** Never delete, truncate, or rewrite earlier prompt records.
8. **Visible Failures:** Report prompt logger failures to `stderr` and queue undelivered events for retry rather than silently dropping prompts.

