# Idea details and one pager

After a spin, the chosen idea shows its title (h1), a markdown summary and a collapsible one pager.

## Sub-features

- `details-title` second `h1` on the page is the idea title.
- `details-onepager` `View one pager` expands (`aria-expanded=true`) to `Hide one pager`.

## How to get to it (user POV)

- Spin, then read the card; click `View one pager`.

## Driving it with appctl

Preconditions:

- A chosen idea (after `spin`).

- **Expand.** Journey step 3: click `View one pager`, then button `Hide one pager` appears; `04-tasklist-ready.aria.txt` shows the one-pager paragraphs.
- **Collapse.** `appctl journey panel-actions` step 1: click `Hide one pager`, then `View one pager` returns with `aria-expanded=false` (`checks.onePagerCollapse`).

## Gotchas

- The title `h1` is the second `h1` on the page; the page header is the first.
