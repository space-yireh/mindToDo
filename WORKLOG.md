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
7. **Zoom control & fitView bounds** (Branch: `feat/zoom-controls-and-fitview`) — bounded `fitView` with `maxZoom: 1.0` (prevents huge nodes when few tasks exist) and `minZoom: 0.35` (prevents tiny unreadable nodes when many tasks exist). Added floating `ZoomControls` overlay panel (`-`, `100%` reset, `+`, `Fit`), `Cmd/Ctrl + +/-/0` keyboard shortcuts, smooth auto-centering on active node selection, default `showCompleted` set to `false`, and automatic `fitView` re-calculation on toggling completed tasks. (No longer deferred — superseded the "zoom explicitly deferred" note from step 3/6.)
8. **Theme system (Light / Dark / System)** (Branch: `feat/theme-system`) — implemented `ThemeProvider` with `useTheme` hook supporting 3 modes (`light`, `dark`, `system`), persistent `localStorage` storage, OS `prefers-color-scheme` auto-switching, dark mode CSS variables for React Flow edges & grid background dots, theme toggle segment control in toolbar, and dark theme styling across all UI panels, nodes, and modals.
9. **Mobile UX pass** (`d9293ef` and follow-ups) — Sidebar becomes a full-screen drawer on mobile, PropertiesPanel becomes a bottom sheet (`fixed bottom-0`, `max-h-[60vh]`, drag handle, slide up/down) that **auto-opens whenever `selection` changes while `isMobile`** (see the `prevSelectionRef` effect in `page.tsx`), compact toolbar, mobile-aware `fitView`/`maxZoom`, loading spinners on import/export.
10. **Mobile touch-add/delete fix** — after step 9 shipped, node add/delete silently did nothing on a real touch device. Root cause and fix in the bugs list below (#8). Short version: the node's own `+`/`×` buttons were hover-only (invisible on touch) *and*, even after making them selection-visible, the auto-opening bottom sheet from step 9 sits on top of them (`z-40`, fixed, covers the bottom 60vh) the instant a node is selected. Fixed by adding matching `+ 하위 항목 추가` / `삭제` buttons directly inside `PropertiesPanel` (mobile-only, `md:hidden`), wired through new `handleAddTaskNode`/`handleAddLeafNode`/`handleDeleteTaskNode`/`handleDeleteLeafNode` callbacks in `page.tsx` that are now shared between the canvas and the panel. `Tab`/`Enter` keyboard add-node still won't work on mobile — that's expected, not a bug, since there's no hardware keyboard; the panel buttons are mobile's equivalent path, not a keyboard emulation.
11. **"완료된 할일 보기" unlabeled-checkbox fix** — the compact mobile toolbar (step 9) hid the label text below `sm` (`hidden sm:inline`) to save space, but left a bare checkbox with zero indication of what it did. Replaced the checkbox+label with an icon toggle button (`EyeIcon`/`EyeIcon off` in `Toolbar.tsx`) matching the existing sidebar/properties-panel toggle button style (`aria-pressed`, highlighted background when active) — consistent with how the rest of the compact toolbar already communicates state through icons, not hidden text.
12. **v1 public-launch-readiness pass** (2026-09-24) — polish targeted at a
    first-time/unfamiliar visitor, not the developer. Explicitly out of
    scope and untouched: payments, Claude MCP (`mindtodo-mcp` — this
    frontend must never reference it), real Terms/Privacy documents, Vercel
    infra. What changed:
    - **Auth error differentiation** (`useGoogleAuth.ts`): GIS's token
      callback previously showed the same generic `t.loginFailed` for both
      "user closed the popup / denied consent" (`response.error` set) and
      "unexpected empty response" (`!response.access_token`, no `error`).
      Split into `t.loginCancelled` vs `t.loginFailed` — since in practice
      almost every `response.error` in the implicit-grant flow *is* user
      action, not a technical fault.
    - **Transient-error detection** (`page.tsx`'s `handleApiError`): 429s,
      5xxs, and raw network failures (`fetch()` throws a plain `TypeError`,
      never `GoogleTasksApiError`) now show the generic `t.toastTransientError`
      ("일시적인 오류가 발생했습니다…") instead of a raw `fallback: message`
      string. Checked in this order: 401 (session expiry) → transient →
      everything else falls through to the existing specific message.
    - **Busy-guard audit**: `doImport`, `handleDeleteTaskList`'s
      `onConfirm`, and `handleExportClick`'s `onConfirm` were missing the
      `|| busy` early-return that `handleCreateTaskList` already had —
      added, purely to prevent double-submit from a fast double-tap/click,
      not real rate limiting.
    - **Onboarding copy**: `noLists` (sidebar) and a new
      `emptyStateHintNoLists` (center canvas empty state, shown only when
      `taskLists.length === 0`, distinct from `emptyStateHint` for
      "lists exist, none selected") now speak to someone who's never used
      the app.
    - **Empty-canvas first-node hint**: brand-new lists (0 depth-1 nodes)
      now auto-select the root node (`setSelection({ depth: 0 })`, both in
      `handleCreateTaskList` and in `doImport` when the imported list turns
      out empty) instead of leaving `selection` at `null`. This was a real
      mobile-blocking gap, not just cosmetic: the root's `+` button is
      hover-only-when-unselected (bug #8 above), and nothing was
      auto-selected for a fresh list, so a first-time **mobile** user had
      *no visible way* to add their first task at all (no hover on touch,
      nothing selected to reveal the button via the `selected`-based
      fallback either). Auto-selecting root fixes it for both desktop and
      mobile, and on mobile it also auto-opens the properties bottom sheet
      (existing behavior) so the "+ 하위 항목 추가" button is right there.
      Also added a floating `<Panel position="top-center">` hint
      (`t.emptyCanvasHint`) in `MindMapCanvas.tsx` on top of that, as a
      visual nudge even before anyone touches anything.
    - **Legal link placeholders**: `src/lib/legal.ts` exports
      `LEGAL_LINKS = { terms: "#", privacy: "#" }` as the single place to
      later swap in real URLs. `src/components/LegalFooter.tsx` renders
      both links; a `"#"` href intercepts the click and shows a
      `t.legalComingSoon` toast instead of navigating, a real URL opens
      normally in a new tab. Mounted in `LoginScreen.tsx` (pre-login) and
      `Sidebar.tsx`'s footer (post-login) — both via the same component, no
      duplicated link logic.
    - **Mobile bug fix — Sidebar delete button was permanently invisible on
      touch**: `opacity-0 group-hover:opacity-100` with no
      touch-visible fallback (same species of bug as #8, never actually
      fixed here despite being flagged). Changed to
      `opacity-100 md:opacity-0 md:group-hover:opacity-100` — always
      visible below `md`, hover-gated only on desktop.
    - **Mobile bug fix — Toolbar center button group could clip the
      "완료된 할일 보기" toggle out of reach entirely**: the center flex
      section (`가져오기`/`내보내기`/show-completed) used `overflow-hidden`
      while none of its buttons or the right-side language/theme/properties
      controls shrink; at real phone widths (tested at 390px, iPhone 13)
      their combined natural width exceeds the available space and
      `overflow-hidden` silently ate the rest — the show-completed toggle
      was rendered but not clickable by any real gesture. Changed to
      `overflow-x-auto` so it scrolls instead of clipping. Confirmed via
      Playwright that the toggle is reachable/clickable again. This is a
      minimal fix, not a redesign — the visually-truncated button at the
      edge acts as a "there's more" affordance, but a fuller mobile toolbar
      layout (e.g. collapsing language/theme into one menu) would be a
      cleaner fix if this needs revisiting.
    - **ZoomControls i18n gap**: `MindMapCanvas.tsx`'s zoom button tooltips
      and the "Fit" button label were hardcoded English, missed by the
      original i18n pass. Now route through `t.zoomOut`/`t.zoomIn`/
      `t.zoomReset`/`t.zoomFit`/`t.fit`.
    - Confirmed already adequate, no change needed: `LoginScreen.tsx`'s
      explanatory copy (only reworded slightly), React Flow's touch pan/
      pinch-zoom (no `panOnDrag`/`zoomOnPinch` overrides present, so RF's
      touch-enabled defaults apply), and the 401→session-expired→
      re-login-button flow (already wired via `auth.handleUnauthorized()` +
      `t.toastSessionExpired`).
13. **Zoom-snap-to-200%-on-select bug** (2026-09-24) — clicking/selecting
    any node (e.g. to start editing it) snapped the canvas zoom to 200%
    every time, regardless of what zoom the user was actually at. Root
    cause: `MindMapCanvas.tsx`'s "smoothly center on selected node" effect
    calls React Flow's `setCenter(x, y, { duration })` without a `zoom`
    option. Traced into `node_modules/@xyflow/react`'s source
    (`setCenter: async (x, y, options) => { const nextZoom =
    options?.zoom ?? maxZoom; ... }`) — when `zoom` is omitted it defaults
    to the `<ReactFlow maxZoom={2.0}>` prop, not the current zoom. Fixed by
    reading `getZoom()` (React Flow's non-reactive imperative getter, not
    the reactive `useViewport().zoom` — using the reactive one would add an
    unwanted effect dependency and re-center on every zoom change) and
    passing it explicitly: `setCenter(x, y, { zoom: getZoom(), duration })`.
    Also added a `Ctrl/Cmd+1` shortcut for "reset to exactly 100%"
    (`zoomTo(1)`) alongside the existing `Ctrl/Cmd+0` (fit view), `+`/`-`
    (zoom in/out) — previously only reachable by clicking the `100%` button
    in `ZoomControls`. Verified via Playwright: zoomed out to 83%, selected
    two different nodes in turn, confirmed zoom stayed at 83% both times
    (previously would have jumped to 200%); confirmed `Ctrl+1` resets to
    exactly 100%.
14. **Mobile touch/zoom cluster fix** (2026-09-24) — user reported three
    related mobile symptoms in one sitting: pinch-zoom worked but one-finger
    drag-to-pan didn't, selecting a node didn't visually center it, and
    (from the earlier "focus zooms to 200%" report) suspected the zoom-on-
    focus issue was actually mobile, not desktop. Investigation found four
    separate, independently real causes:
    - **Native page pinch-zoom was never disabled.** No `viewport` export
      existed in `layout.tsx`, so `user-scalable` defaulted to allowed.
      This meant a pinch gesture over the canvas could be captured by the
      *browser's own* page zoom instead of (or competing with) React Flow's
      internal canvas zoom — likely explaining both "pinch zooms something,
      but not reliably the canvas" and interference with drag-gesture
      recognition (the two gesture recognizers compete for the same touch
      sequence). Fixed by adding `export const viewport: Viewport = {
      width: "device-width", initialScale: 1, maximumScale: 1,
      userScalable: false }` to `layout.tsx` — now all zoom/pan on the
      canvas goes through React Flow's own system exclusively (ZoomControls,
      pinch, `Ctrl +/-/0/1`).
    - **Mobile input auto-zoom, the real cause of the original "focus zooms
      the screen" report.** `PropertiesPanel.tsx`'s shared `inputClass` and
      `MindMapNodeBox.tsx`'s inline-edit `<input>` both rendered at 14px/
      12px (`text-sm`/inherited from `KIND_STYLES`) — under the 16px
      threshold iOS/Android use to decide whether to auto-zoom the page on
      focus. This is a well-known, universally-applicable mobile web
      pattern, unrelated to the earlier (also real, still correctly fixed)
      desktop `setCenter`-defaults-to-`maxZoom` bug from entry #13 — that
      one only affects desktop since the centering effect used to skip
      mobile entirely. Fixed by bumping both to `text-base` (16px).
    - **The properties bottom sheet's backdrop covered the full screen**
      (`fixed inset-0`), not just the sheet's own `max-h-[60vh]` footprint,
      so the ~40% of canvas still visible above the sheet was non-
      interactive (dead to touch) the instant a node was selected and the
      sheet auto-opened. Changed to `fixed inset-x-0 bottom-0 h-[60vh]` to
      match the sheet exactly, leaving the visible top strip pannable/
      pinchable again.
    - **Mobile centering was unconditionally disabled** (`if (!selection ||
      isMobile) return;`) — likely originally skipped specifically because
      a literal screen-center would have placed the node right behind the
      (previously full-screen) backdrop/sheet. Re-enabled for mobile, but
      targeting ~25% down from the top (inside the visible strip above the
      sheet) instead of true center: `centerY = nodeCenterY + (height / 2 -
      height * 0.25) / zoom`, using `useStoreApi().getState().height` for
      the container height and the already-fixed `getZoom()` for zoom.
      **Known tradeoff**: this pan can now displace a node mid-gesture, so
      double-*tap*-to-edit on mobile can occasionally miss if the node
      animates away between the two taps of the gesture. Accepted as minor
      since mobile's primary edit path is the auto-opened properties sheet,
      not double-tap.
    - Verified fixes 1–3 and the centering direction via Playwright
      (`devices["iPhone 13"]`, `hasTouch: true`): viewport meta content,
      computed `font-size` on both input types (16px), the backdrop's
      `getBoundingClientRect()` matching 60% of window height, and the
      `.react-flow__viewport` transform actually changing on selection.
      **Could not conclusively verify the drag-to-pan fix itself** —
      Playwright's synthetic `TouchEvent` dispatch bypasses the browser's
      real `touch-action`-driven native gesture recognition entirely
      (confirmed empirically: panning "worked" via dispatched events even
      *before* any of these fixes), so it can't distinguish "real native
      zoom was stealing the gesture" from "it always worked" in a headless
      test. The native-zoom-disable + backdrop fixes are the best-
      substantiated candidates from source-level investigation
      (`@xyflow/react`/`@xyflow/system`'s d3-zoom-based filter, touch-action
      computed styles down the node/pane DOM chain), but this one
      genuinely needs a real-device re-test to confirm.
15. **Sidebar brand header + mobile-home-screen + node-select mobile
    cleanup** (2026-09-24) — three fixes from a real-device screenshot:
    - **Sidebar redesign**: added a "MindToDo" brand row at the top,
      replacing the old "📋 목록" sub-header entirely (not just visually —
      the `sidebarTitle`/`closeSidebar` i18n keys and the explicit close
      (X) button were removed too, since the user asked for both the
      header row and its X to go). Closing the drawer on mobile now relies
      on: tapping any list row (including the already-selected one — the
      Sidebar's list `onClick` already calls `onClose()` unconditionally,
      even when `onSelect` itself no-ops for an unchanged selection), or
      the Toolbar's own sidebar-toggle button once a list is open.
    - **Mobile home screen**: `page.tsx`'s `applyMobileDefaults` effect
      used to force `setSidebarOpen(false)` on mobile mount, so first-time
      users landed on an empty canvas placeholder with the list hidden
      behind a hamburger. Removed that line (state's own default is
      already `true`) so the full-screen list is what mobile users see
      immediately after login, matching desktop's "browse then pick" flow
      instead of hiding it behind an extra tap.
    - **Node-selection mobile visual bugs** (both traced from a single
      screenshot): (1) the properties bottom sheet's backdrop (added in
      entry #14, sized `h-[60vh]` to match the sheet) drifted out of sync
      whenever the sheet's actual rendered content was shorter than its
      `max-h-[60vh]` cap — `max-h` is a ceiling, not a fixed height, so a
      separately-sized sibling can never reliably track it — leaving a
      dimmed gray gap with no sheet under it. Removed the backdrop
      entirely rather than chase the sync problem further; the sheet's own
      `PanelHeader` close (X) button was already a sufficient, always-
      visible dismiss affordance. (2) Once entry #13's mobile auto-
      centering reliably placed a selected node in the visible strip above
      the sheet, `MindMapNodeBox.tsx`'s own floating delete button (red
      circular ×) started appearing *at the same time* as
      `PropertiesPanel`'s dedicated mobile "삭제" button for the same
      node — two different-styled delete controls for one action,
      simultaneously visible. The floating canvas buttons were always
      meant to be mobile's fallback only when the panel's own buttons
      couldn't reach them (see entry #10's original comment); now that the
      panel's buttons are reliably reachable, hid the floating canvas
      buttons entirely below `md` (`hidden md:flex`) so there's exactly
      one delete/add control per platform.
    - Verified via Playwright (`devices["iPhone 13"]`): first-load
      screenshot shows the brand row with no X and the full list
      immediately visible; selecting a node no longer shows the floating
      red × on the node itself, confirmed programmatically via
      `getComputedStyle(...).display === "none"` on that button's wrapper.
16. **`LanguageProvider` SSR hydration mismatch fix** (2026-09-24) — dev
    console showed `Hydration failed because the server rendered text
    didn't match the client` on `LoginScreen`'s description text
    (server: Korean, client: English). Root cause: `LanguageProvider`'s
    `useState` initializer read `localStorage` synchronously (gated only
    on `typeof window === "undefined"`), so a browser with `"en"` already
    saved from earlier language-toggle testing rendered English on the
    client's *first* paint while the server (no `window`, always "ko")
    had rendered Korean — this affects every piece of text `t` touches,
    not just one component, since it's the provider's own state that
    diverges, unlike the narrower/cosmetic version of this same class of
    bug already fixed once for `ThemeToggle` (`c96198e`) by gating the
    *display* with a `useIsMounted`/`useSyncExternalStore` check in that
    one component. Fixed at the source instead: `language` now always
    initializes to `"ko"` (a plain constant, matching on both server and
    client), and the `localStorage` read moved into a `useEffect` that
    only ever runs post-mount, syncing to the saved value one render
    later if it differs — hydration always succeeds because the first
    render is identical everywhere, and the (unavoidable) brief ko→en
    flash for returning English-preferring users happens strictly after
    hydration, not during it. The `setLanguageState` call inside that
    effect trips the newer `react-hooks/set-state-in-effect` lint rule;
    suppressed with a scoped `eslint-disable-next-line` (matching the
    existing `exhaustive-deps` suppression precedent in `page.tsx`) since
    syncing from an external store post-mount is exactly what the rule's
    own guidance describes as the valid case for calling `setState` in an
    effect. Verified via Playwright across a real SSR round-trip (not
    just a client-side state flip): saved `"en"` to `localStorage`,
    reloaded the page fresh, and confirmed zero hydration-related console
    errors while the English text still rendered correctly after the
    sync; repeated with no saved preference to confirm the Korean default
    still renders cleanly too.
17. **Real Terms/Privacy pages** (2026-09-25) — the launch-readiness pass
    (entry #12) only added `LEGAL_LINKS` placeholder (`"#"`) links with a
    "coming soon" toast. Replaced with actual content: `/terms` and
    `/privacy` are plain Next.js Server Components (`src/app/terms/page.tsx`,
    `src/app/privacy/page.tsx` — no `"use client"`, no hooks needed, since
    the content is static Korean text with just a back-to-app link), sharing
    a small `LegalPageLayout`/`LegalSection` wrapper
    (`src/components/LegalPageLayout.tsx`) for the scrollable column +
    heading/date-line chrome. `LEGAL_LINKS` in `src/lib/legal.ts` now points
    to these real paths instead of `"#"`, so `LegalFooter.tsx`'s existing
    placeholder-detection (`href === "#"`) automatically stops intercepting
    the click and lets them navigate normally (opens in a new tab, per that
    component's existing `target="_blank"` logic for non-placeholder hrefs
    — no changes needed there). **Korean only**, not translated to English
    — a deliberate, user-confirmed choice: legal text in two languages
    means keeping both in sync on every future wording change, and neither
    Google's OAuth verification nor Korean law requires an English version;
    an English one can be added later if actually needed. Operator identity
    (공간이레 / space.yireh@gmail.com) and the 2026-09-25 effective date are
    hardcoded directly in both pages' JSX, not pulled from any shared
    constant — they're one-time legal facts, not app config that changes
    at runtime.
    **Correction to the source draft** (a `# MindToDo 이용약관 및
    개인정보처리방침 (초안).md` file the user had open, not authored by an
    earlier session of this project): its 개인정보처리방침 §6 claimed the
    app stores nothing in `localStorage`. Grepped the codebase
    (`ThemeProvider.tsx`, `LanguageProvider.tsx`) and confirmed it actually
    *does* — theme (`mindtodo_theme`) and language (`mindtodo_language`)
    preferences, added after that draft was written. Rewrote that section
    to accurately disclose this (non-personal UI preferences only, never
    sent to a server) rather than publish a factually wrong privacy policy
    — this mattered enough to flag explicitly since Google's OAuth
    verification review will read this exact page.
18. **Sibling reordering, drag-and-drop reparenting, collapsed-sidebar quick
    switch** (2026-09-25) — three UX requests from actual use:
    - **`Ctrl/Cmd+↑/↓` reorders the selected node among its siblings**
      (swaps array position with the previous/next sibling — order in
      `MindMap.nodes`/`TaskNode.children` *is* the display/export order,
      no separate order field). New `treeOps.ts` functions `moveTaskNode`/
      `moveLeafNode`. Distinct from plain `↑/↓`, which already navigated
      selection between siblings (`getNavigationTarget`) — the ctrl-check
      had to be added as its own branch inside `MindMapCanvas.tsx`'s
      existing `if (e.ctrlKey || e.metaKey)` zoom-shortcut block, *before*
      falling through to the plain-arrow-key switch below, otherwise
      Ctrl+↑ was indistinguishable from bare ↑ (navigated instead of
      reordering).
    - **Drag-and-drop reparenting for leaves (depth 2 only)**: drag a leaf
      onto a *different* task to move it there (still depth 2), or onto
      the root to promote it to a top-level task (depth 1). Dragging onto
      its own current parent is explicitly excluded (no-op). Deliberately
      not implemented: dragging a task to become a leaf (demotion) — user
      confirmed this isn't needed. Built on the native HTML5 Drag and Drop
      API (`draggable`, `dragstart`/`dragover`/`drop`/`dragend`) on the
      node's own `<button>` in `MindMapNodeBox.tsx`, *not* React Flow's
      own `nodesDraggable` (left `false`, as before — that's for freely
      repositioning nodes, which this fixed-auto-layout tree never allows;
      the two systems are unrelated and don't conflict). Drag state
      (`draggingLeaf`, `dropTargetId`) lives in `MindMapCanvasInner` and
      flows into every node via new `computeMindMapLayout` per-node data
      (`draggable`, `isDragging`, `isDropTarget`, `isDropHighlighted` +
      matching callbacks) — same threading pattern the existing
      `onSelect`/`onAddChild`/`onDelete` closures already use. New
      `treeOps.ts` functions `reparentLeafToTask`/`promoteLeafToTask`.
      Visual feedback: every eligible drop target gets a subtle emerald
      ring the instant a drag starts (so users see *where* they can drop
      before hovering anywhere), upgraded to a solid ring on whichever one
      is actually under the pointer; the dragged leaf itself dims to 40%
      opacity. Desktop-only by design (native HTML5 DnD doesn't fire from
      touch gestures at all) — same precedent as Tab/Enter/F2 keyboard
      shortcuts already being desktop-only, mobile already has its own
      equivalent affordances elsewhere.
      **Testing gotcha**: dispatching `dragstart`→`dragover`→`drop`
      synchronously in one `page.evaluate()` call fails — React needs an
      actual render tick between `dragstart` (which calls `setDraggingLeaf`)
      and `dragover` (whose handler only exists on the target once
      `isDropTarget` recomputes from that state), so `dragover`'s
      `preventDefault()` never fires and the browser never treats it as a
      valid drop target. Real mouse-drag input naturally has this gap
      (moving the pointer takes multiple frames); only synthetic same-tick
      dispatch doesn't. Fixed by `await page.waitForTimeout(...)` between
      each dispatched event.
    - **Collapsed-sidebar hover popover**: hovering the sidebar toggle
      button while the sidebar is collapsed (desktop only — mobile's
      sidebar has no "collapsed" state, it's full-screen-or-hidden) shows
      a quick-switch list of task lists without fully reopening the panel.
      Pure CSS (`group` + `group-hover:opacity-100`), same idiom as the
      node box's hover-revealed +/× buttons — no JS hover state needed,
      and it naturally never appears on touch. New shared
      `src/components/SidebarToggle.tsx`, replacing two previously-
      duplicated raw toggle-button implementations (one in `Toolbar.tsx`,
      one inline in `page.tsx`'s no-`mindMap` branch). Consolidating them
      surfaced and fixed a real pre-existing gap as a side effect: the
      `page.tsx` copy was `md:hidden` (mobile-only), so a desktop user who
      collapsed the sidebar and then lost the active list (e.g. deleted
      it) had *no way to reopen it* — that branch's toggle simply didn't
      render on desktop. Removed the `md:hidden` restriction; the shared
      component is now the only reachable toggle in both branches.
19. **Drag-and-drop vs. canvas pan conflict** (2026-09-25) — user reported
    that real mouse drags on a leaf node just panned the whole canvas
    instead of dragging the leaf, immediately after entry #18 shipped
    drag-and-drop reparenting. Root cause: React Flow's own pan-on-drag
    (`panOnDrag`, on by default, never overridden) starts its pan gesture
    from a `mousedown` handler attached at the pane level, which also
    fires for a `mousedown` originating on a descendant node's content —
    racing the browser's native HTML5 drag-and-drop gesture recognition on
    that same `draggable=true` element and winning, since React Flow's
    d3-zoom pan handling needs to (and does) call `preventDefault()` on
    that `mousedown` to do its own thing, which suppresses the browser
    from ever recognizing the subsequent movement as a native drag.
    Fixed with React Flow's own purpose-built escape hatch rather than
    anything bespoke: `noPanClassName` (default class `"nopan"`, confirmed
    in `@xyflow/react`'s and `@xyflow/system`'s source — its pane-gesture
    `createFilter` explicitly rejects pan for any `mousedown` wrapped in an
    element carrying that class) added to the leaf node's button in
    `MindMapNodeBox.tsx`, conditional on `draggable` (only leaves need it —
    other node kinds were never draggable, so their normal pan-on-drag-from
    behavior is untouched and, since `nopan` only affects the d3-zoom pan
    filter, plain clicks/selection on a leaf are unaffected too). No
    long-press/mode-switch UI needed, which the user had floated as an
    alternative (à la iOS icon-rearrange) — the underlying issue was a
    solvable event-filtering conflict, not a fundamental incompatibility
    between the two gesture systems.
    **This also explains why entry #18's own verification missed it**:
    that testing used either `page.mouse`-synthesized mouse events (which,
    per widely-documented Playwright/Puppeteer/CDP limitations, don't
    reliably trigger Chromium's native drag-gesture recognition in the
    first place — so it couldn't have hit this race either way) or
    directly-dispatched synthetic `DragEvent`s (which skip the
    `mousedown`-based pan-vs-drag race entirely, since they don't go
    through real mousedown→native-drag-decision at all). Neither test path
    was capable of exercising the actual bug. Re-verified this fix with a
    realistic multi-step `page.mouse` drag sequence and confirmed: (1) the
    canvas's `.react-flow__viewport` transform stays completely unchanged
    throughout the drag (no pan hijack), (2) the leaf correctly reparents
    on drop, (3) plain background panning elsewhere is unaffected, and (4)
    a plain click-to-select on a leaf still works. **Caveat for future
    testing of this exact interaction**: `page.mouse`-based drags were
    apparently sufficient to trigger real native DnD in *this* Chromium/
    Playwright combination once the pan conflict was removed (verified
    above), even though that contradicts the general limitation cited —
    treat `page.mouse`-based drag-and-drop testing as unreliable to depend
    on across environments/versions regardless, and prefer a real-device/
    real-browser check for anything drag-and-drop related before calling
    it done.
20. **Notes badge on the canvas** (2026-09-25/26) — user's idea: memos on a
    node weren't visible anywhere except the properties panel, and they'd
    started writing more of them. Original pitch was a literal extra
    "3rd-level node" hanging off any leaf with notes — reviewed and
    steered toward a lighter alternative instead (offered via
    `AskUserQuestion`, user picked it): a small badge icon on the node
    itself rather than a whole separate connected box. Rationale given:
    Google Tasks has a hard 2-level cap (task/subtask), so a "3rd node"
    could only ever be decorative, never a real tree node — and a full
    extra box per annotated node would meaningfully widen already-dense
    maps and need truncation/layout-math changes, where a badge needs
    neither.
    - `mindmapLayout.ts`: `HierarchyDatum` and `MindMapNodeData` both gained
      `notes`/`notesPreview` (root always `null` — `MindMap` has no notes
      field at all, only tasks/leaves do). `notesPreview` is the trimmed
      `notes` string, or `null` when empty.
    - `MindMapNodeBox.tsx`: a small circular badge (note-lines icon)
      renders at the node's bottom-left corner — opposite corner from the
      existing +/× buttons at top-right, so they never overlap — whenever
      `notesPreview` is non-null. Native `title` attribute shows the full
      note text on hover (simplest possible preview, no custom tooltip
      component); clicking the badge calls the same `onSelect` the node
      itself uses, opening the properties panel already showing that note.
    - **Scope decision, changed from the user's original framing**: shown
      on *both* task (depth 1) and leaf (depth 2) nodes with notes, not
      leaf-only. The user's original idea had an explicit rule — hide it
      if a leaf gets promoted to a task (depth 1) via entry #18's
      drag-and-drop promotion — but that rule was motivated by the
      *full-node* design (a promoted leaf's memo-node could be confused
      with a real depth-2 child at task level). A badge has no such
      collision risk, so showing it uniformly at both levels is simpler
      *and* means promotion needs no special-case: `promoteLeafToTask`
      already preserves `notes` unchanged, so the badge just keeps
      showing after promotion with no extra logic.
    - Verified via Playwright: badge appears only on nodes with non-empty
      notes (confirmed both a task and a leaf show it, and their
      note-less siblings don't); hover `title` attribute matches the note
      text; clicking the badge opens the properties panel with that exact
      note content.
21. **Login screen logo, Ctrl/Cmd+C copies markdown** (2026-09-26) — two
    quick asks, plus a third (Google-Tasks-style favorite/star) that was
    investigated and explicitly declined by the user once the constraint
    was clear:
    - **Login screen logo**: `public/logo.svg` (added in entry #15 for the
      sidebar brand row) now also renders above the "MindToDo" heading in
      `LoginScreen.tsx` — same plain `<img>` pattern (no `next/image`,
      same reasoning as `Sidebar.tsx`'s existing comment: not worth an
      image-config change for one small static SVG).
    - **`Ctrl/Cmd+C` copies the canvas as GFM markdown** — new
      `src/lib/markdownExport.ts` (`mindMapToMarkdown`), wired into
      `MindMapCanvas.tsx`'s existing `handleKeyDown` inside the same
      `if (e.ctrlKey || e.metaKey)` block the zoom/reorder shortcuts live
      in. Scope follows the current selection: a leaf copies just that
      item, a task copies it plus its subtasks, and no selection (or the
      root) copies the whole map — deliberately *not* gated behind
      `if (editingNodeId || !selection) return;` like the shortcuts below
      it, since the no-selection case is a real, valid whole-map copy, not
      a no-op to skip. Output format: `- [ ]`/`- [x]` checkboxes per
      status, nested one level for subtasks, notes as a `>` blockquote
      line under the item, due dates appended in parens using the
      existing `t.fieldDueDate` label (so it's already correctly
      localized, no new key needed there) — a `Clipboard.writeText()`
      call, confirmed/failed via new `t.toastCopiedMarkdown`/
      `t.toastCopyFailed` toasts. Verified via Playwright (with the
      `clipboard-read`/`clipboard-write` context permissions granted) for
      all three scopes plus the toast.
    - **Favorite/star toggle — investigated, not built.** Checked the
      actual `RemoteTask` shape this app already round-trips
      (`googleTasksApi.ts`): `id, title, notes, due, status, parent,
      position` — the Google Tasks REST API has no starred/favorite/
      priority field at all, so anything called "favorite" here could
      only ever be (a) hacked into `title`/`notes` as a prefix marker to
      survive export/import, or (b) a purely local flag that resets on
      every re-import (this app holds no other storage — see the "Data
      model & sync policy" section up top). Asked the user which,
      expecting they'd want (a); they picked neither — "if it's not in
      the API, let's not do it" — and the feature was dropped rather than
      built as a compromise. Worth remembering if this comes up again:
      don't default to the title/notes-prefix hack without asking, this
      user has already said no to it once for this exact reason.
22. **Login screen logo layout, Cmd/Ctrl+A selects root, zoom shortcuts
    made global** (2026-09-26):
    - **Login screen logo**: was stacked (icon above the "MindToDo"
      heading, entry #21); changed to match the sidebar brand row's
      side-by-side layout (icon left of the text) per explicit request to
      make the two consistent.
    - **`Cmd/Ctrl+A` selects the root node** — this app's "select all",
      chosen specifically because selecting root is also what scopes
      entry #21's `Ctrl+C` markdown copy to the whole map, so the two
      shortcuts compose naturally (`Cmd+A` then `Cmd+C` = copy everything).
      `e.preventDefault()` is load-bearing here, not decorative — without
      it the browser's own native "select all page text" still fires
      alongside it and highlights the whole UI; verified via
      `window.getSelection().toString()` staying empty after the shortcut.
    - **Zoom shortcuts (`Ctrl +/-/0/1`) moved from the canvas div's local
      `onKeyDown` to a global `window` keydown listener.** User reported
      a vague "keymap conflict" with these from earlier testing; traced it
      by comparing canvas zoom before/after the shortcut with and without
      the canvas div having actual DOM focus first. Confirmed: the local
      `onKeyDown` only ever fires once the canvas has been explicitly
      clicked into, so any time focus was elsewhere (the sidebar, or
      nothing yet right after page load) `Ctrl+0/+/-/1` silently did
      nothing in the app — free to fall through to the *browser's own*
      native zoom shortcuts instead, which is the conflict. Fixed by
      moving just the zoom branch into a `useEffect`-registered global
      listener in `MindMapCanvas.tsx`, mirroring the existing
      undo/redo/save/import global shortcuts already in `page.tsx`
      (including their same "skip while `document.activeElement` is an
      input/textarea" guard). Left the *other* canvas shortcuts
      (Tab/Enter/Delete/arrows/F2/type-to-edit/reorder/copy/select-root)
      as canvas-focus-scoped, deliberately — those are about the
      currently-selected *node*, which is a meaningfully different
      concept than "the app is open, zoom whatever's in view," and
      widening all of them to global was a bigger, riskier change than
      this specific complaint called for. Verified the fix doesn't
      double-fire when the canvas *does* have focus (both the
      global-listener case and the already-focused case) by checking the
      zoom's per-keypress multiplicative factor stayed consistent
      (~1.2×) across both.
23. **i18n (Korean + English)** — a lightweight custom system, not a framework (`next-intl`/`react-i18next` were considered and rejected as overkill for this app's scale). `src/lib/i18n.ts` holds two flat dictionary objects (`ko`, `en`) typed against each other (`en: typeof ko`, so TS enforces both stay in sync — no runtime key-lookup, no missing-translation risk); `src/components/LanguageProvider.tsx` is a Context provider (`localStorage` under `mindtodo_language`, `useLanguage()` hook returning `{ language, setLanguage, t }` where `t` is the whole resolved dictionary object — call sites read `t.someKey`, not `t('someKey')`). **Note**: it originally read `localStorage` synchronously in its `useState` initializer, matching `ThemeProvider.tsx`'s pattern at the time — entry #16 changed that (SSR hydration mismatch), so the two providers' initialization no longer match; see #16 before assuming they're identical. A `한`/`EN` segmented-control toggle sits in the toolbar next to the theme toggle. **Scope: UI chrome only** — buttons, labels, toasts, confirm-modal text, aria-labels, and the *default* title given to a newly created list/task/subtask (`t.newList`/`t.newTaskDefault`/`t.newSubtaskDefault`, threaded through `addTaskNode`/`addLeafNode`/`makeTaskNode`/`makeLeafNode` as an optional `title` param). **Never translated: user-entered content** — existing task/list titles, notes, dates are exactly what the user typed, in whatever language that is; this app is not a translation tool. `useGoogleAuth.ts` also pulls `useLanguage()` for its own error strings, since it's a hook (not just components) and hooks can call other hooks freely. One gotcha: several `useCallback` dependency arrays initially listed individual `t.xxx` keys, which is unnecessary (fixed to depend on the whole `t` object instead) and tripped `react-hooks/exhaustive-deps` on a member-expression call site (`t.deleteListMessage(...)`) — just depend on `t` itself everywhere, since it's one atomic object swap per language change anyway.

## Current keyboard shortcuts (canvas focused, a node selected)

| Key | Action |
|---|---|
| `Tab` | add child (hidden past depth 2) |
| `Enter` | add sibling |
| `Delete` / `Backspace` | delete node + subtree; selection falls back to previous sibling, else parent |
| `← → ↑ ↓` | navigate: left=parent, right=first child, up/down=prev/next in that depth column (crosses branches at the ends) |
| `Ctrl/Cmd+↑ / ↓` | reorder: swap the selected node with its previous/next sibling (not navigation — the node itself moves) |
| `Ctrl/Cmd+C` | copy as markdown: selected leaf, or task+subtasks, or (no selection/root) the whole map |
| `Ctrl/Cmd+A` | select root ("select all" for this app — pairs with `Ctrl/Cmd+C` above to copy everything) |
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
| `Ctrl/Cmd +` / `-` / `0` / `1` | zoom in/out, fit view, reset to 100% — **global**, not canvas-focus-scoped like the rows above (entry #22), same "skip in a text field" guard as Z/Y/S/R |

Adding a node (Tab/Enter/`+` button) always drops straight into edit mode —
this was a deliberate fix so keyboard flow never breaks stride.

**None of this table applies on mobile** — there's no hardware keyboard.
The touch equivalents are: tap a node to select (auto-opens the properties
bottom sheet), then use that sheet's `+ 하위 항목 추가` / `삭제` buttons and
its title/notes/due/complete fields. See "What's been built" #9–10.

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
8. **`group-hover:opacity-100` has no touch equivalent, and a mobile overlay
   can sit on top of what it does reveal.** The node's `+`/`×` buttons were
   gated purely on CSS `:hover`, so on a touchscreen they were permanently
   invisible — tapping a node "did nothing" because there was nothing
   visible to tap. Fixed the visibility (`selected` now also reveals them,
   not just hover), but that alone wasn't sufficient: `PropertiesPanel`'s
   mobile bottom sheet (added later, `z-40`, `fixed bottom-0`) auto-opens on
   selection and physically covers those same buttons on a phone-sized
   screen. **General lesson: any hover-only affordance needs a
   selection/tap-based equivalent, and every mobile overlay needs to be
   checked against what it might cover on real device viewport sizes, not
   just resized-desktop-browser testing** — this one only showed up when
   testing was switched from `page.locator(...).click()` (mouse event) to
   `page.locator(...).tap()` (real touch event) in an emulated mobile
   device context; a resized desktop browser click wouldn't have caught it.

## Known limitations / accepted gaps

- **Korean IME first-character loss**: typing directly on a *selected but
  not-yet-editing* node to start editing can lose the first jamo, because
  the button→input focus handoff races the IME composition start. Typing
  after `F2`/`Escape` (input already focused first) avoids this entirely.
  Not fully fixed — would need a KityMinder-style persistent hidden
  input/receiver element to fix properly.
- **Mobile drawers don't auto-close**: selecting a list doesn't auto-close
  the Sidebar drawer on mobile (the user has to tap the toolbar toggle or
  the backdrop). The PropertiesPanel bottom sheet *does* now auto-open on
  node selection (step 9) — just not the reverse.
- **Korean IME on the properties-panel text fields** (title/notes) hasn't
  been specifically re-tested since the mobile pass — the canvas inline
  editor's IME fix (bug #5) doesn't apply there since it's a normal
  controlled `<input>`/`<textarea>`, which should be IME-safe by default,
  but hasn't been explicitly verified on a real device.
- **Undo/redo** only covers local mindmap edits (add/delete/title/notes/
  due/status). Import/export are intentionally excluded (they're Google API
  calls, not locally reversible). History resets on list switch/import/
  create/delete.
- Descoped earlier by explicit request: hotbox radial menu, bold/italic,
  "add parent" node.
- **`layout.tsx`'s `<meta name="description">` stays Korean always** —
  it's server-rendered metadata, generated before the client-side language
  preference (localStorage) is known, and there's no SEO need to solve this
  properly for a personal single-user app. Everything else respects the
  language toggle; just this one `<head>` tag doesn't.
- Only Korean and English exist (`src/lib/i18n.ts`). Adding a third
  language means adding a matching `Record<string, ...>` object there and a
  third button in `Toolbar.tsx`'s `LanguageToggle` — no other files need to
  change, since every component already reads through `t`.

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

Don't rely on any commit list pasted here — it goes stale immediately. Run
`git log --oneline -15` and `git status` yourself before assuming what's
committed vs. in-progress.

Note: commits in this repo appear to happen automatically in some sessions
(not via an explicit `git commit` request in the conversation that produced
them) — don't assume uncommitted work is lost, but don't assume it's
committed either; always check `git status` first.
