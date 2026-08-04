# Customer Dashboard Wallet and Plans Design

## Goal

Clarify the relationship between wallet balance, current subscriptions, and top-up actions on the Customer Dashboard while preserving the locked Customer color system and every existing business function. The plan presentation must remain usable when an account owns 20 or more active subscriptions.

## Locked baseline

- Keep the existing light theme, emerald accent, neutral surfaces, radii, borders, shadows, and status colors unchanged.
- Keep all Dashboard routes, API requests, data sources, payment flows, top-up behavior, plan purchase behavior, translations, keyboard behavior, and mobile navigation unchanged.
- Do not change PostgreSQL data or backend behavior.
- Do not remove any currently displayed wallet or subscription data. Repositioning is allowed only to remove duplication and improve hierarchy.

## Current problem

- Wallet balance and current plan appear in the top summary and then appear again in detailed panels.
- The top-up button is placed in the page header, visually separated from the wallet balance it affects.
- The standalone wallet panel immediately follows the current-plan cards without its own section hierarchy, so it can look like part of the plan card.
- Every active subscription is rendered as a full detail card. This works for one or two plans but produces an excessively long page for accounts with 20 or more plans.

## Considered approaches

### 1. Move only the top-up button

Move the existing button from the page header into the wallet panel and leave the rest of the Dashboard unchanged.

This is the smallest change, but the duplicated wallet and plan summaries would remain and large plan collections would still scale poorly.

### 2. Independent wallet card plus progressive plan disclosure

Recommended. Give wallet data one clear home, keep current-plan data inside the plan section, and progressively disclose large plan collections.

This removes the confusing duplication while preserving every field and action. It also scales from one plan to dozens of plans without a nested scroll area.

### 3. Fixed-height plan scroller or pagination

A fixed-height plan scroller creates competing page and panel scroll regions. Pagination keeps the page short but makes it harder to compare plans and adds unnecessary navigation state for data that is already loaded.

Neither option is preferred for the existing Dashboard.

## Selected structure

### Page header

The Dashboard page header keeps its title and description. The top-up button moves out of the header so its action is visually attached to wallet balance.

### Wallet card

The wallet becomes the first primary account panel after the page header. The existing `dashboard-wallet` anchor moves with this panel so hash navigation remains unchanged.

The card contains exactly one presentation of:

- Wallet balance
- Today's usage
- Request count
- The existing CNY and USD 1:1 settlement note
- The existing top-up button and dialog trigger

Wallet balance is the dominant value. Today's usage and request count are supporting values. The top-up button aligns with the balance on desktop and stacks below the wallet values on narrow screens.

The previous four-item `ConsoleSummary` is removed from the Dashboard because wallet balance and current plan already have dedicated, more useful homes. No value is removed from the page.

### Quick actions

Billing, Usage, API Keys, and Docs shortcuts remain in their current order and keep their existing destinations and accessible navigation label.

### Current plans section

The section heading shows the existing localized `Current plan` label together with the number of active plans. A single plan remains visually simple; a large collection stays compact.

Plan ordering continues to use the backend response order after the existing active-subscription filtering. No new sorting rule is introduced.

#### Primary plan

The first active plan remains expanded and preserves all current details:

- Plan title
- Valid-until time
- Received amount
- Active status
- Duration and reset information
- Next reset time
- Used quota and percentage
- Remaining quota
- Existing purchase action

#### Additional plans

Additional plans render as compact disclosure rows. Each collapsed row shows:

- Plan title
- Valid-until time
- Remaining quota
- Active status

Expanding a row reveals the same complete plan detail currently shown by a full plan card. The disclosure control uses a real button with `aria-expanded` and an accessible name containing the plan title.

The initial collection displays at most five plans in total, including the primary plan. When more plans exist, a localized `Show more plans` action reveals the next five. The action reports the remaining count. It disappears when all plans are visible.

This progressive disclosure avoids a fixed-height nested scroll region and remains predictable for keyboard, touch, and screen-reader users. Users can expand more than one plan when they need to compare details.

### Empty, loading, and error states

- Loading and recoverable error behavior remain unchanged.
- The existing no-current-plan card and purchase destination remain unchanged.
- Wallet data is not rendered as fake zero values when the Dashboard request set fails.

## Typography and spacing

- Reuse the current system font stack and mono stack. Do not add a font dependency.
- Strengthen wallet balance through size, weight, and line height only.
- Keep supporting wallet values smaller and aligned on the existing spacing scale.
- Keep compact plan summaries dense enough for 20-plan accounts without reducing touch targets below the existing standard.
- Preserve the current 14px card radius and 9-10px control radius.
- Do not change any color token, color literal, gradient, opacity relationship, border color, shadow color, or asset color.

## Responsive behavior

- At desktop widths, wallet values and the top-up action share one horizontal panel.
- Below 760px, wallet content becomes a single-column stack and the top-up button spans the available width.
- Compact plan rows wrap metadata without hiding fields.
- Plan disclosure and show-more controls remain full-width touch targets on narrow screens.
- No horizontal page overflow or nested vertical scroll area is introduced.

## Accessibility

- Keep one `h1` on the Dashboard route.
- The wallet panel has a semantic heading and retains the `dashboard-wallet` anchor target.
- Plan disclosure buttons expose `aria-expanded` and the plan name.
- The show-more button announces how many plans remain.
- Existing focus-visible styles, keyboard navigation, reduced-motion behavior, and mobile sidebar behavior remain unchanged.
- All existing action labels and destinations remain intact.

## State and data behavior

- Continue using the existing five parallel Dashboard requests.
- Do not add a global store or another request.
- Visible-plan count is local presentation state initialized to five and increased by five.
- Expanded-plan identifiers are local presentation state and do not alter subscription data.
- Top-up dialog state and purchase links retain their current behavior.
- No API contract, route, query, mutation, or database value changes.

## Testing strategy

- Update the Dashboard success test to assert that wallet balance appears in one wallet region and the top-up button is inside that region.
- Confirm today's usage, request count, settlement note, current plan, and quick-action destinations remain visible.
- Add a 20-plan regression case that verifies only the first five plans are initially visible.
- Verify the show-more action reveals five additional plans and reports the updated remaining count.
- Verify an additional plan can expand to expose its full quota and reset details.
- Preserve the Dashboard error and retry test.
- Run the full Customer test suite, TypeScript check, formatting check, production build, and live 3010/5175 validation.

## Out of scope

- Color or theme changes
- New wallet, billing, subscription, or payment behavior
- Backend pagination or subscription sorting changes
- Database changes
- Changes to Billing, Usage, API Keys, Referrals, Settings, or public Subscription behavior
