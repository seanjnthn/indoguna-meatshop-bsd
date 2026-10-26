## 2026-10-26 - Keyboard-Driven Search Clearing & ARIA Search Landmark
**Learning:** Adding standard `Escape` key handling on search inputs allows keyboard and screen reader users to quickly dismiss search filters without needing mouse interaction or tabbing to clear controls, while explicit `role="search"` and `aria-controls` clarify search structure.
**Action:** When implementing filterable inputs, listen for `Escape` to reset query state and ensure search fields are explicitly wrapped in search landmarks that point to filtered list containers.
