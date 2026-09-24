# MindToDo Worklog

Running log of what's been built and why, written so another AI session (or
a human) can pick this up cold. Update this file as work continues — append
new dated sections rather than rewriting history.

For setup/run instructions see `README.md`. This file is about *decisions
and state*, not how to `npm install`.

## Project in one paragraph

Mind-map task manager that syncs with Google Tasks. Frontend-only: no
backend, no database, no Next.js API routes — the browser calls the Google
Tasks REST API directly and holds the mind map only in React state (nothing
persists locally; refresh = gone until you re-import). One mind map == one
Google TaskList. Depth 0 = the list itself, depth 1 = Task, depth 2 =
Subtask — this 3-level cap is a hard Google Tasks API limitation, not a
choice.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4 — every
  component is `"use client"`, nothing server-rendered fetches data
- `@xyflow/react` (React Flow) + `d3-hierarchy` for the mind-map canvas
- Google Identity Services (`initTokenClient`) for auth — access token lives
  in memory only, expires in ~1h, no silent refresh (see
  `src/lib/useGoogleAuth.ts`)
- No test suite. Verification is `npx tsc --noEmit` + `npm run lint` +
  `npm run build` + manual Playwright smoke tests (see "How this was
  verified" below) — there is nothing else checking correctness.

## Data model & sync policy

`src/lib/types.ts`: `MindMap { taskListId, title, nodes: TaskNode[] }`,
`TaskNode extends LeafNode { children: LeafNode[] }`. `Selection` is a
depth-tagged union (`{depth:0}` / `{depth:1,nodeId}` /
`{depth:2,nodeId,parentId}`).

- **Import** (`src/lib/sync.ts` `importMindMap`): GET all tasks, rebuild the
  tree from the `parent` field. Pure read, no side effects.
- **Export** (`exportMindMap`): **delete-all-then-recreate**. Every task in
  the target TaskList is deleted, then the whole local tree is POSTed back
  in order (using the `previous` param to preserve sibling order). This is
  a deliberate policy, not a bug — completion timestamps and other
  Tasks-side metadata are accepted as lost on every export. Both import and
  export are always gated behind a `ConfirmModal`, never fired directly,
  because export is destructive.

## What's been built (roughly chronological)

1. **Scaffold** — Next.js app, Google OAuth login, Sidebar (TaskList CRUD),
   list-style indented tree canvas, PropertiesPanel (title/notes/due/done),
   Toolbar (import/export/show-completed).
2. **Canvas → React Flow rewrite** — replaced the indented list with a real
   mind-map: `src/lib/mindmapLayout.ts` builds a `d3-hierarchy` tree (LR
   direction) and converts it to React Flow nodes/edges;
   `src/components/mindmap/MindMapNodeBox.tsx` is the one custom node
   component used for all three depths (root/task/leaf), styled per kind.
   `src/components/MindMapCanvas.tsx` hosts the `<ReactFlow>` instance.
3. **Keyboard control pass** — researched `oorzc/vscode-mindmap` (wraps
   KityMinder) for prior art, then implemented a trimmed-down set (no
   hotbox, no bold/italic, no parent-add; zoom explicitly deferred):
   Tab/Enter add nodes, Delete/Backspace remove, arrow keys navigate,
   F2/Escape/double-click/typing-directly all enter inline edit. See the
   shortcut table below.
4. **Undo/redo** — local edits only (add/delete/title/notes/due/status),
   *not* import/export. Lives in `src/app/page.tsx`.
5. **Modal + save/reload shortcuts** — `Cmd/Ctrl+S` → export confirm,
   `Cmd/Ctrl+R` → import confirm (both still go through `ConfirmModal`,
   never skip it). Fixed `ConfirmModal` to actually trap focus.
6. **Light theme + responsive panels** — full light theme (indigo-600
   accent), Sidebar/PropertiesPanel collapse to width 0 on desktop and
   become slide-in overlay drawers with a backdrop under `md` (768px).

## Current keyboard shortcuts (canvas focused, a node selected)

| Key | Action |
|---|---|
| `Tab` | add child (hidden past depth 2) |
| `Enter` | add sibling |
| `Delete` / `Backspace` | delete node + subtree; selection falls back to previous sibling, else parent |
| `← → ↑ ↓` | navigate: left=parent, right=first child, up/down=prev/next in that depth column (crosses branches at the ends) |
| `F2` / `Escape` (not editing) | enter inline edit, select-all existing text |
| any printable key (not editing) | enter inline edit, seeded with the typed character (replaces old title) |
| double-click | enter inline edit |
| `Enter` (editing) | commit |
| `Escape` (editing) | cancel, revert |
| blur | auto-commit |
| `Ctrl/Cmd+Z` | undo (skipped if focus is in a text field — native field undo wins) |
| `Ctrl/Cmd+Y` or `Ctrl/Cmd+Shift+Z` | redo |
| `Ctrl/Cmd+S` | open export confirm modal |
| `Ctrl/Cmd+R` | open import confirm modal |

Adding a node (Tab/Enter/`+` button) always drops straight into edit mode —
this was a deliberate fix so keyboard flow never breaks stride.

## Non-obvious bugs found & fixed (read before re-touching the canvas)

These cost real debugging time — don't reintroduce them:

1. **React Flow nodes need explicit `width`/`height` on the `Node` object**
   (not just inline CSS on the rendered element). Without it, RF's
   ResizeObserver auto-measure pass can race a `.focus()` call in the same
   tick and silently eat it. Set in `mindmapLayout.ts`.
2. **Never set `elementsSelectable={false}`** on `<ReactFlow>` — it also
   blocks pointer events from reaching custom node content, so clicks stop
   working entirely. Node selection highlighting is done manually via our
   own `selected` field instead.
3. **`zoomOnDoubleClick` (RF default: `true`) fights double-click-to-edit.**
   Must be `false` — otherwise a double-click zooms the canvas instead of
   opening the inline editor.
4. **Safari/WebKit doesn't give a `<button>` real DOM focus on a plain
   mouse click.** All our keyboard shortcuts depend on the selected node's
   button having actual focus, so `MindMapNodeBox` explicitly calls
   `.focus()` on select in a `useEffect` rather than relying on the
   browser's native click-focus behavior.
5. **Korean (IME) composition fires two `Enter` keydown events** — one with
   `isComposing: true` that finalizes the syllable, immediately followed by
   a "real" one. If you don't ignore the `isComposing` one, it commits the
   edit and closes the input, and the second Enter then leaks through to
   the canvas as "add sibling". Guarded in `MindMapNodeBox`'s input
   `onKeyDown`. This is also why `Escape` was added as an F2 alternative —
   it's not a composable character, so it sidesteps the IME
   first-character-loss issue that plain "type to edit" has.
6. **Modal dialogs need explicit focus management.** `ConfirmModal` wasn't
   grabbing focus on open, so keyboard focus stayed on whatever was
   selected behind it — pressing Enter in the modal actually hit the
   canvas underneath. Fixed by auto-focusing the confirm button + handling
   `Escape` in the modal.
7. **Padding directly on a width-collapsing container blocks true 0-width
   collapse** (padding can't shrink the box below itself even at
   `width: 0`). `PropertiesPanel`'s collapse animation looked broken (a
   thin sliver stayed visible) until padding was moved to an inner
   fixed-width wrapper, leaving the outer `<aside>` free to actually hit 0.

## Known limitations / accepted gaps

- **Korean IME first-character loss**: typing directly on a *selected but
  not-yet-editing* node to start editing can lose the first jamo, because
  the button→input focus handoff races the IME composition start. Typing
  after `F2`/`Escape` (input already focused first) avoids this entirely.
  Not fully fixed — would need a KityMinder-style persistent hidden
  input/receiver element to fix properly.
- **Zoom controls**: explicitly deferred by the user ("다음 섹션 때 다시
  검토하자") — not implemented at all yet.
- **Mobile drawers don't auto-close**: selecting a list or a node doesn't
  auto-close the corresponding drawer on mobile; the user has to tap the
  toolbar toggle or the backdrop. Flagged as a possible follow-up, not
  requested yet.
- **Undo/redo** only covers local mindmap edits (add/delete/title/notes/
  due/status). Import/export are intentionally excluded (they're Google API
  calls, not locally reversible). History resets on list switch/import/
  create/delete.
- Descoped earlier by explicit request: hotbox radial menu, bold/italic,
  "add parent" node.

## How this was verified (repeat this pattern for new work)

No test suite exists, so every change in this project was verified by:

1. `npx tsc --noEmit` and `npm run lint` — must be clean.
2. `npm run build` — must succeed.
3. Manual browser testing via a scratch Playwright install (not a repo
   dependency — installed ad hoc into a scratchpad dir with
   `npm install playwright` + `npx playwright install chromium` [+`webkit`
   when testing Safari-specific behavior]). Real interactions were scripted
   (click, keyboard.press, type) and asserted against, not just screenshot
   eyeballing.
4. To drive the app without real Google auth: temporarily seed
   `useState` initial values for `taskLists`/`mindMap`/`selectedTaskListId`
   with fake data at the top of `src/app/page.tsx`, and change
   `if (!auth.accessToken) {` to `if (!auth.accessToken && false) {` to
   bypass the login gate. **Always revert both before finishing** — grep
   for `&& false` before calling anything done.
5. `.env.local` already has a real `NEXT_PUBLIC_GOOGLE_CLIENT_ID` configured
   (gitignored, not committed) — real end-to-end login/import/export can
   also be tested by hand in an actual browser if needed.

## Git state

Commits so far (check `git log` for current HEAD — this list will go
stale):

```
5854b1d style: update color scheme and improve component styling for better UI consistency
deebe93 refactor: replace Canvas component with MindMapCanvas and MindMapNodeBox for improved structure and functionality
e5d6e95 feat: add Canvas, ConfirmModal, LoginScreen, PropertiesPanel, Sidebar, ToastProvider, Toolbar components
```

Note: commits in this repo appear to happen automatically (not via explicit
`git commit` requests in the conversations that produced this log) — don't
assume uncommitted work is lost, but don't assume it's committed either;
check `git status` first.
