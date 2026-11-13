# Memory Update Protocol

1. **Record Every Execution Turn:** Synchronize structured implementation history to the single authoritative `MEMORY.md` across `PreInvocation`, `PostInvocation`, and `Stop`.
2. **Distinguish Human vs. Agent:** Clearly separate `User (Prompted by)` from `Implementer (Executed by)`.
3. **Actual Evidence Only:** Capture only tools actually executed, files verifiably modified, and tests actually run based on transcript evidence. Never invent actions or results.
4. **Approved Statuses Only:** Use only:
   - `In Progress`
   - `Completed`
   - `Completed (Current Final Prompt in Session)`
5. **Append-Only History:** Preserve all historical entries; never rewrite earlier records silently.
6. **No Credentials:** Redact and disclose any sensitive credentials before writing.
7. **Central Synchronization:** Route events through the central LAN collector when configured, with offline queuing and deduplication on failure.

