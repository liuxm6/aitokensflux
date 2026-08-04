# Customer Dashboard Polish Design

## Design read

This is a preserve-mode redesign of an AI API customer portal for technical users. The visual language stays calm, credible, and operational, using the existing emerald accent and neutral surfaces. Marketing surfaces remain slightly expressive, while the authenticated console becomes denser and more task-oriented.

Design dials:

- Customer marketing: variance 6, motion 3, density 4
- Customer console: variance 4, motion 2, density 7
- Shared rule: one emerald accent, restrained shadows, 14px cards, 9-10px controls

The marketing-specific `design-taste-frontend` guidance applies to the public Customer surfaces. Dense Dashboard pages follow the existing product UI system and the production accessibility patterns in `frontend-ui-engineering`.

## Current-state audit

### Preserve

- Existing Customer routes and aliases
- Current emerald and neutral color tokens
- Brand lockup and logo treatment
- All API requests, payment flows, authentication flows, token operations, pagination, filters, account actions, dialogs, and support destinations
- Existing loading, empty, error, keyboard, focus, and mobile navigation behavior
- Current i18n architecture and locale coverage

### Improve

- The desktop console has no persistent top bar, account control, language control, or page-level shortcut actions.
- The Dashboard overview starts with plan details but does not give a fast operational summary of wallet, usage, keys, and account status.
- Page titles, section labels, toolbars, panels, tables, and action hierarchy vary between Billing, Usage, API Keys, Referrals, and Settings.
- Some long files carry duplicated dialog and page structure, but a full rewrite would add regression risk.
- Mobile navigation is accessible, but authenticated account and language actions are not available from the console shell.
- Existing CSS includes old and overlapping console rules, which makes further refinement harder.

## Considered approaches

### 1. CSS-only reskin

Lowest implementation risk, but it would not solve missing shell actions, weak Dashboard prioritization, or inconsistent interaction patterns.

### 2. Shared console system plus targeted page recomposition

Recommended. Upgrade the shell and shared primitives, recompose the Dashboard overview, and normalize the existing pages without replacing their business logic. This provides the highest visible and usability gain while keeping regression risk controlled.

### 3. Full console rewrite with a new component library

Potentially cleaner long term, but it would touch every form, dialog, table, and API flow. It is not justified for this polish pass and would increase bundle size and migration risk.

## Selected architecture

### Console shell

`CustomerShell` becomes the consistent authenticated frame:

- Stable desktop sidebar with grouped primary navigation
- Compact desktop top bar with localized page identity
- Language switcher and accessible account menu
- Account actions reuse `AccountActionDialog` and the existing sign-out flow
- Mobile top bar keeps the current focus restoration and inert-content behavior
- Content width, page padding, and breakpoints become consistent across all console pages

The shell owns global console navigation and account actions. Individual pages continue to own their data and business operations.

### Shared page hierarchy

Every console page follows this order:

1. Page header with title, optional description, and one primary action
2. Optional operational summary row
3. Main task panel
4. Secondary details or support content

The implementation will extend the current title and panel primitives rather than introduce a second component system.

### Dashboard overview

The Dashboard becomes an operational home rather than only a subscription detail page:

- Welcome and account context
- Four concise summary items: wallet balance, today's usage, request count, and current plan state
- Primary quick actions for top-up, API keys, usage, and setup documentation
- Current plan details remain complete, including resets, quota, validity, and purchase actions
- Support and tutorial content remain available but move below the operational content

No invented analytics or fake values are introduced. Every displayed number comes from the existing user, status, subscription, or log-stat responses.

### Billing

- Keep the current record source, tabs, pagination, and top-up dialog
- Improve balance prominence and record-type scanning
- Normalize toolbar, segmented control, status treatment, and mobile record layout
- Preserve top-up and subscription record distinctions

### Usage

- Keep all current filters, date range logic, pagination, usage statistics, and detail fields
- Make summary statistics visually distinct from filter controls
- Improve table scan order, responsive behavior, model/token identification, and empty/error placement
- Do not hide audit fields or reduce available usage information

### API Keys

- Preserve create, edit, enable/disable, reveal, copy, delete, group, model limit, IP allowlist, quota, and CC Switch behavior
- Strengthen separation between endpoint information and key management
- Make token status, quota, metadata, and actions easier to scan
- Keep all dialogs and validation behavior, while normalizing their layout and action hierarchy

### Referrals

- Preserve referral code copying, reward transfer, statistics, filters, records, and pagination
- Clarify the relationship between invite link, available reward, historical reward, and transfer action
- Use the same summary and toolbar language as the rest of the console

### Settings

- Preserve password, email, language, finance, support, and sign-out actions
- Reorganize settings into clear functional groups with stronger row labels and accessible action targets
- Reuse the same account dialogs exposed from the new shell account menu

### Subscription

- Keep the existing public plan and payment behavior
- Align cards, price hierarchy, loading/empty states, and purchase dialogs with the Customer system
- Preserve all payment providers and balance-payment logic

## State and data behavior

- Existing page-level requests remain the source of truth.
- Dashboard requests continue in parallel and retain the current retry path.
- Partial response failures must remain visible as recoverable errors.
- No new global state store is introduced.
- URL routes, pagination semantics, and server request shapes remain unchanged.
- No PostgreSQL data or backend behavior is modified by this work.

## Accessibility and responsive behavior

- Maintain semantic headings with one `h1` per route.
- All icon-only controls have localized accessible names.
- Desktop and mobile account menus support arrow navigation, Escape, Tab, and focus restoration.
- Sidebar overlay retains inert main content and Escape close behavior.
- Tables keep captions, focusable scroll regions, and mobile labels.
- Buttons and controls retain 44px touch targets where icon-only.
- All motion is limited to transform and opacity and respects reduced motion.
- Breakpoints are verified at 320px, 768px, 1024px, and 1440px.

## Visual rules

- Existing light theme remains locked across Customer and Dashboard.
- Emerald is the only primary accent.
- Cards use the existing 14px radius; controls use 9-10px radii; primary buttons may remain pill-shaped only on marketing surfaces.
- Console shadows remain subtle and communicate elevation only for menus, dialogs, and hovered interactive panels.
- No decorative gradients, fake metrics, status dots, or placeholder product UI are added.
- Console motion is functional feedback only.

## Testing strategy

- Add focused tests for the console shell account menu, language access, navigation, and mobile behavior.
- Add Dashboard rendering tests for summary data, partial failures, quick-action destinations, and empty subscription state.
- Preserve the existing navigation, dialog, async-state, table, and homepage regression tests.
- Run the full Customer test suite, TypeScript check, formatting check, and production build.
- Rebuild and restart the local Go server so port 3010 serves the latest embedded Customer bundle.
- Verify live API data and the rendered page structure on ports 3010 and 5175. If browser automation is unavailable, record that limitation and complete the available DOM and integration checks.

## Delivery sequence

1. Shared console shell and page header system
2. Dashboard operational overview
3. Billing, Usage, and API Keys normalization
4. Referrals, Settings, and Subscription normalization
5. Responsive, accessibility, test, build, and local-runtime verification
