1. Prototype overview
   A single-page Next.js prototype that lets users paste redirect rules, choose a rule format, and bulk-test sample URLs. The left panel contains a rules editor with line numbers and inline error indicators, plus a format selector. The right panel shows validation results, optimization hints, and a results table for URL tests; selecting a URL reveals its redirect chain and rule execution trace. Users click Validate to see syntax issues with suggested fixes, then Run Tests to simulate redirects up to a safe hop limit and detect loops. The prototype includes a lightweight client-side parser supporting common patterns from .htaccess, nginx, Netlify, Vercel-like, and a generic "source -> destination code" format. Storybook covers all atoms and organisms with controls, docs, and basic accessibility checks to validate UI and interactions.

2. Checklist

- Atoms

  - [ ] Build Button atom at src/components/atoms/Button.tsx. Props: variant: 'primary' | 'secondary' | 'danger'; size: 'sm' | 'md'; disabled?: boolean; onClick?: () => void; children: ReactNode; ariaLabel?: string. Acceptance: renders as a focus-visible button with role="button", supports keyboard activation (Enter/Space), conveys disabled state with aria-disabled and disabled attribute, variants apply distinct styles, size changes padding and font-size.
  - [ ] Create Storybook for Button at src/components/atoms/Button.stories.tsx using CSF3 with autodocs and controls. Stories: Default (primary, md), Edge cases (disabled, long label, danger variant), A11y (ensures focus ring visible and no axe violations). Include actions addon for onClick.

  - [ ] Build TextArea atom at src/components/atoms/TextArea.tsx. Props: value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; ariaLabel: string; invalid?: boolean; monospace?: boolean. Acceptance: renders textarea with label via aria-label, supports controlled usage, invalid state has aria-invalid and visible styling, monospace applies mono font, resizable vertical only.
  - [ ] Create Storybook for TextArea at src/components/atoms/TextArea.stories.tsx. Stories: Default (placeholder, rows=8), Edge cases (invalid state, very long content), A11y (axe passes; verify label/readability).

  - [ ] Build TextInput atom at src/components/atoms/TextInput.tsx. Props: value: string; onChange: (v: string) => void; placeholder?: string; ariaLabel: string; invalid?: boolean; prefixIconName?: 'search' | 'link' | 'hash'. Acceptance: input is keyboard accessible, announces label, invalid sets aria-invalid, prefix icon renders without breaking tab order.
  - [ ] Create Storybook for TextInput at src/components/atoms/TextInput.stories.tsx. Stories: Default, Edge cases (invalid, very long text), A11y (axe clean).

  - [ ] Build Select atom at src/components/atoms/Select.tsx. Props: options: { label: string; value: string }[]; value: string; onChange: (v: string) => void; ariaLabel: string. Acceptance: native <select> for accessibility, keyboard accessible, value updates via onChange, includes focus ring.
  - [ ] Create Storybook for Select at src/components/atoms/Select.stories.tsx. Stories: Default (5 options), Edge cases (empty options disabled state), A11y (axe clean, proper labeling).

  - [ ] Build Badge atom at src/components/atoms/Badge.tsx. Props: tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; children: ReactNode; ariaLabel?: string. Acceptance: small pill with contrasting colors per tone, readable text, optional aria-label for icon-only use.
  - [ ] Create Storybook for Badge at src/components/atoms/Badge.stories.tsx. Stories: Default (info), Edge cases (very long text, danger tone), A11y (contrast meets WCAG AA).

  - [ ] Build Card atom at src/components/atoms/Card.tsx. Props: title?: string; children: ReactNode; ariaLabel?: string. Acceptance: bordered container with padding and optional heading as <h3>, supports aria-label when title omitted, full-width responsive.
  - [ ] Create Storybook for Card at src/components/atoms/Card.stories.tsx. Stories: Default (with title), Edge cases (no title, tall content), A11y (heading is navigable; axe clean).

  - [ ] Build CodeBlock atom at src/components/atoms/CodeBlock.tsx. Props: text: string; highlightedLines?: number[]; lineNumbers?: boolean; ariaLabel?: string. Acceptance: monospace block with optional line numbers; highlightedLines visually distinct; scrolls when overflow; accessible role region with aria-label.
  - [ ] Create Storybook for CodeBlock at src/components/atoms/CodeBlock.stories.tsx. Stories: Default (lineNumbers true), Edge cases (highlight non-contiguous lines, very long lines wrapping/scrolling), A11y (axe passes; preserves text selection).

  - [ ] Build Divider atom at src/components/atoms/Divider.tsx. Props: orientation?: 'horizontal' | 'vertical'. Acceptance: renders <hr> for horizontal, appropriate aria role; vertical variant uses aria-hidden and proper height via parent constraints.
  - [ ] Create Storybook for Divider at src/components/atoms/Divider.stories.tsx. Stories: Default (horizontal), Edge cases (vertical inside flex row), A11y (axe clean).

  - [ ] Build Icon atom at src/components/atoms/Icon.tsx. Props: name: 'arrow-right' | 'error' | 'check' | 'loop' | 'info'; title?: string; size?: number. Acceptance: inline SVGs with currentColor fill/stroke, size defaults to 16, title maps to <title> for a11y, decorative icons can be aria-hidden.
  - [ ] Create Storybook for Icon at src/components/atoms/Icon.stories.tsx. Stories: Default (arrow-right), Edge cases (no title aria-hidden, larger size), A11y (labeled icon has accessible name).

  - [ ] Build ToggleSwitch atom at src/components/atoms/ToggleSwitch.tsx. Props: checked: boolean; onChange: (v: boolean) => void; label: string; id?: string. Acceptance: renders as checkbox with role="switch", space/enter toggles, label clickable, visible focus state.
  - [ ] Create Storybook for ToggleSwitch at src/components/atoms/ToggleSwitch.stories.tsx. Stories: Default (unchecked), Edge cases (checked, disabled variant if implemented), A11y (role switch announced; axe clean).

- Organisms

  - [ ] Build AppHeader organism at src/components/organisms/AppHeader.tsx. Composition: title, Select for format, two Buttons (Validate, Run Tests). Props: title: string; format: string; onFormatChange: (v: string) => void; onValidate: () => void; onRunTests: () => void; isBusy?: boolean. Acceptance: header is landmark <header>, buttons disabled while isBusy, Select lists 5 formats: htaccess, nginx, netlify, vercel, generic.
  - [ ] Create Storybook for AppHeader at src/components/organisms/AppHeader.stories.tsx. Stories: Default (format=htaccess), Edge cases (isBusy true disables actions), A11y (header landmark, buttons labeled; axe clean).

  - [ ] Build RuleEditor organism at src/components/organisms/RuleEditor.tsx. Composition: Card with TextArea and side panel showing per-line statuses (error/warning). Props: value: string; onChange: (v: string) => void; issues?: { line: number; type: 'error' | 'warning'; message: string; fix?: string }[]; placeholder?: string. Acceptance: shows total counts; lines with issues highlight in the TextArea gutter (simple right-side list keyed by line number is acceptable); updates onChange; aria-label "Redirect rules editor".
  - [ ] Create Storybook for RuleEditor at src/components/organisms/RuleEditor.stories.tsx. Stories: Default (no issues), Edge cases (multiple errors same line; mixed error/warning), A11y (textarea labeled; axe clean).

  - [ ] Build UrlListInput organism at src/components/organisms/UrlListInput.tsx. Composition: Card with TextArea and helper text; optional "Insert examples" Button. Props: value: string; onChange: (v: string) => void; onInsertExamples?: () => void. Acceptance: multiline input where each line is a URL; shows a character/line count; aria-label "Sample URLs".
  - [ ] Create Storybook for UrlListInput at src/components/organisms/UrlListInput.stories.tsx. Stories: Default, Edge cases (blank lines, duplicates), A11y (labels and helper text announced).

  - [ ] Build ValidationSummary organism at src/components/organisms/ValidationSummary.tsx. Composition: Card with counts via Badge and a list of issues. Props: issues: { line?: number; type: 'error' | 'warning' | 'info'; message: string; fix?: string }[]; onJumpToLine?: (line: number) => void. Acceptance: shows totals, groups by type, each list item displays type badge, optional "Go to line" button when line provided triggers onJumpToLine.
  - [ ] Create Storybook for ValidationSummary at src/components/organisms/ValidationSummary.stories.tsx. Stories: Default (mixed issues), Edge cases (no issues), A11y (list semantics correct; axe clean).

  - [ ] Build DataTableResults organism at src/components/organisms/DataTableResults.tsx. Composition: table for URL test results. Props: rows: { id: string; url: string; outcome: 'ok' | 'loop' | 'noMatch' | 'error'; finalUrl?: string; hops?: number; code?: number }[]; onSelectRow?: (id: string) => void; selectedRowId?: string. Acceptance: table uses semantic <table>, each outcome shows Badge tone: ok=success, loop=danger, noMatch=warning, error=danger; row clickable to select with aria-selected.
  - [ ] Create Storybook for DataTableResults at src/components/organisms/DataTableResults.stories.tsx. Stories: Default (varied outcomes), Edge cases (empty state), A11y (table headers with scope; keyboard row selection via tab-enter).

  - [ ] Build RedirectChainViewer organism at src/components/organisms/RedirectChainViewer.tsx. Composition: list of hops with Icon arrows. Props: chain: { from: string; to: string; code?: number }[]; isLoop?: boolean. Acceptance: vertical list showing from -> to for each hop, displays "Loop detected" with Icon 'loop' and danger Badge when isLoop true; scrolls on overflow; aria-label "Redirect chain".
  - [ ] Create Storybook for RedirectChainViewer at src/components/organisms/RedirectChainViewer.stories.tsx. Stories: Default (2-3 hops), Edge cases (loop with 10+ hops trims to 10 and shows loop), A11y (list semantics and aria-label present).

  - [ ] Build RuleExecutionTrace organism at src/components/organisms/RuleExecutionTrace.tsx. Composition: list of rules evaluated with matched/applied status. Props: steps: { line: number; ruleText: string; matched: boolean; applied: boolean; note?: string }[]; Acceptance: shows step number, line number, and status with Icon and Badge; applied steps emphasized; aria-label "Rule execution trace".
  - [ ] Create Storybook for RuleExecutionTrace at src/components/organisms/RuleExecutionTrace.stories.tsx. Stories: Default (mixed matches), Edge cases (no matches, many steps), A11y (axe clean; list and statuses announced).

  - [ ] Build OptimizationHints organism at src/components/organisms/OptimizationHints.tsx. Composition: Card with list of suggestions. Props: hints: { text: string; line?: number }[]; onJumpToLine?: (line: number) => void. Acceptance: displays each hint with info Badge; optional jump action when line exists; empty state message when no hints.
  - [ ] Create Storybook for OptimizationHints at src/components/organisms/OptimizationHints.stories.tsx. Stories: Default (3 hints), Edge cases (empty), A11y (axe clean; buttons labeled).

  - [ ] Build SplitPane organism at src/components/organisms/SplitPane.tsx. Composition: two responsive columns. Props: left: ReactNode; right: ReactNode; ratio?: number (0.3–0.7). Acceptance: CSS grid or flex that stacks on small screens; aria-label "Main content split"; respects ratio on desktop.
  - [ ] Create Storybook for SplitPane at src/components/organisms/SplitPane.stories.tsx. Stories: Default (ratio 0.5), Edge cases (narrow viewport stacking), A11y (landmark/region labeling; axe clean).

  - [ ] Build RedirectTesterPanel organism at src/components/organisms/RedirectTesterPanel.tsx. Composition: AppHeader + SplitPane with RuleEditor (left) and right column of ValidationSummary, OptimizationHints, DataTableResults, and details (RedirectChainViewer + RuleExecutionTrace). Props: none (manages internal state). Acceptance: includes "Validate" and "Run Tests" buttons; supports 5 formats; simulates redirects up to 10 hops; detects self/looping redirects; highlights rule issues by line; testing multiple URLs from UrlListInput; selecting a result reveals chain and trace; all interactive elements keyboard accessible.
  - [ ] Implement minimal client-side redirect engine utilities at src/lib/redirects.ts used by RedirectTesterPanel. Functions: parseRules(format: string, text: string) -> { rules: { pattern: RegExp; destination: string; code: number; line: number; raw: string }[]; issues: Issue[]; hints: Hint[] }; simulate(url: string, rules: Rule[]) -> { chain: Hop[]; isLoop: boolean; outcome: 'ok' | 'loop' | 'noMatch' | 'error'; finalUrl?: string; hops: number; code?: number; trace: Step[] }. Acceptance: support minimal patterns for htaccess ("Redirect 301 /a /b", "RewriteRule ^old$ /new [R=301,L]"), nginx ("rewrite ^/a$ /b permanent;"), netlify ("/a /b 301!"), vercel-like ("/a /b 308"), and generic ("/a -> /b 302"); basic regex validation; detect duplicate/overlapping rules for hints; loop detection up to 10 hops with isLoop flag.
  - [ ] Create Storybook for RedirectTesterPanel at src/components/organisms/RedirectTesterPanel.stories.tsx. Stories: Default (preloaded sample rules and URLs, format=generic), Edge cases (rules causing loop; invalid lines), A11y (run axe; keyboard flows for validate/run/select row).

- Page
  - [ ] Scaffold Next.js App Router layout at src/app/layout.tsx with basic global styles at src/styles/globals.css. Acceptance: sets lang="en", includes main landmark, applies a readable font stack and focus styles, loads styles globally; no external CSS frameworks required.
  - [ ] Implement Redirect Rule Validator & Tester page at src/app/page.tsx that renders RedirectTesterPanel. Acceptance: page has title "Redirect Rule Validator & Tester"; fully client-side; no persistence; responsive layout; no page-level Storybook per checklist convention.
  - [ ] Add sample content module at src/sample/data.ts exporting defaultRules, sampleUrls for demo and Storybook usage. Acceptance: includes at least 6 rules across formats and 6 sample URLs covering ok, loop, and noMatch outcomes.
