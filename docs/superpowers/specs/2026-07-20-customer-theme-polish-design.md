# Customer Theme Progressive Polish Design

## Goal

Progressively improve the `web/customer/` theme without changing its existing light neutral palette, green brand accent, routes, API contracts, form field names, payment behavior, or user-visible feature set.

The work must make the customer experience more consistent, accessible, responsive, testable, and maintainable while preserving all current authentication, setup, billing, API-key, usage, referral, settings, localization, support, and marketing flows.

## Design Read

This is a redesign-preserve project for an AI API gateway customer portal and marketing site. The intended language is modern, technical, trustworthy, and restrained rather than experimental.

- Design variance: 6/10
- Motion intensity: 4/10
- Visual density: 5/10
- Redesign mode: targeted evolution
- Theme mode: existing light theme only for this scope

## Non-Negotiable Constraints

- Modify only `web/customer/` and customer-theme documentation or tests.
- Preserve the existing light gray/white surfaces and green accent centered on `#0fb477`.
- Preserve official provider colors for Claude, Gemini, and other model/provider marks.
- Do not add dark mode in this scope.
- Do not change customer route paths or aliases.
- Do not change backend APIs, request payloads, response parsing, or billing/payment behavior.
- Do not rename or reorder authentication, payment, API-key, setup, or account form fields unless required for accessibility markup without changing submitted data.
- Do not remove login, registration, email-code login, 2FA, backup codes, passkeys, OAuth, Turnstile, password reset, subscription, top-up, redemption, payment launch, API-key, usage, referral, settings, setup, legal, support, or localization behavior.
- Preserve the homepage provider and pricing order already approved: Claude, Codex, Grok, Gemini.
- Preserve explicit `enable_groups` pricing membership and production API-driven pricing.
- Use Bun for customer-frontend scripts and dependency management.
- Follow existing customer formatting conventions: double quotes and semicolons.
- Deliver independent, rollback-friendly commits. Every increment must leave the customer frontend buildable and testable.

## Scope

### Included

1. Functional regression coverage and a unified customer test command.
2. Existing customer formatting baseline cleanup.
3. Shared accessible dialog behavior and background modality.
4. Shared dropdown/menu keyboard behavior and mobile-navigation improvements.
5. Route focus, skip navigation, route metadata, and reduced-motion-aware scrolling.
6. Field-level form errors and accessible form state.
7. Touch-target, mobile input, focus-ring, and reduced-motion consistency.
8. Loading, empty, and error state separation.
9. Responsive and accessible table behavior.
10. Semantic design tokens and staged CSS decomposition.
11. Route-level lazy loading and bundle reduction.
12. Homepage information hierarchy, copy, feature composition, and pricing clarification.

### Excluded

- Backend or API changes.
- Route renames or information-architecture removal.
- A new dark theme.
- Replacing React, Rsbuild, Lucide, or `@lobehub/icons`.
- Introducing a production UI framework or design-system dependency.
- Rewriting all customer pages at once.
- Replacing existing brand assets.
- Changing seasonal campaign enablement or commercial configuration.

## Existing Function Inventory to Protect

The test and migration plan must preserve these paths:

- Marketing: homepage, model pricing, plan pricing, support, FAQ, setup entry, legal pages, seasonal route.
- Authentication: password login, registration, email-code login, forgot password, password reset, 2FA, backup code, passkey, OAuth, WeChat flow, Turnstile, agreement consent.
- Customer console: overview, balance/top-up, subscription purchase, redemption, payment progress, usage filtering and details, API-key create/edit/delete/copy, CC Switch configuration, referrals, account settings.
- Navigation: internal links, browser back/forward, protected-route fallback, preserved return path for authentication and setup overlays.
- Localization: simplified Chinese, traditional Chinese, English, and Russian.

## Delivery Architecture

The work is divided into independently testable phases. A later phase may depend on stable interfaces from an earlier phase, but no phase may require a partially migrated user flow to remain broken.

### Phase 0: Functional Safety Net

- Add a standard `test` script to `web/customer/package.json`.
- Add a lightweight DOM test environment and React component testing utilities as development dependencies only.
- Preserve the existing Gemini pricing and hero tests.
- Add behavior tests for shared navigation, protected routes, overlays, critical submit actions, and public-page rendering before changing those behaviors.
- Add a dedicated formatting-only commit for the six currently failing customer files so `bun run format:check` becomes a reliable gate.

### Phase 1: Accessible Interaction Foundation

Add shared customer primitives without introducing a production component library.

#### AccessibleDialog

Responsibilities:

- Provide `role="dialog"` and `aria-modal="true"`.
- Associate title and description through stable IDs.
- Move focus into the dialog when it opens.
- Cycle Tab and Shift+Tab within the dialog.
- Close on Escape only when closing is allowed.
- Restore focus to the element that opened the dialog.
- Mark background page content inert and hidden from assistive technology while modal UI is active.
- Preserve current body/root scroll locking.
- Support non-dismissible processing states.

The first migration targets confirmation, account-action, purchase-plan, purchase-progress, top-up, authentication, and setup overlays. Existing component props and business callbacks remain stable wherever practical.

#### DropdownMenu

Responsibilities:

- Provide a trigger with `aria-expanded`, `aria-controls`, and `aria-haspopup`.
- Support ArrowUp, ArrowDown, Home, End, Enter, Space, Tab, and Escape.
- Move focus to the selected or first item on open.
- Restore focus to the trigger on Escape.
- Close on outside pointer interaction.
- Preserve internal-link, account-action, support, sign-out, and language-change callbacks.

The initial consumers are the language menu and account menu. Mobile navigation receives the same Escape, focus-return, and inert-background guarantees without being forced into menu semantics.

#### RouteFocus and SkipLink

Responsibilities:

- Add one skip link before repeated navigation.
- Give the primary main region a stable focus target.
- Update `document.title` and the description meta element per route.
- Move focus to the new page heading after internal route navigation.
- Preserve browser back/forward behavior and authentication/setup return paths.
- Use instant scrolling when `prefers-reduced-motion: reduce` is active.

### Phase 2: Forms and Feedback

#### FormField

Extend the existing `AuthInput` pattern instead of replacing business forms.

Responsibilities:

- Keep a visible label.
- Associate helper and error text with the control.
- Set `aria-invalid` only when the field has an error.
- Preserve `autocomplete`, input type, maxlength, input mode, controlled value, and action-button slots.
- Support password visibility, verification-code, and cooldown controls.
- Allow submit handlers to focus the first invalid field.

Field-validation errors appear next to the field. Toasts remain for global request failures, success confirmations, and transient system messages.

#### Interaction Baseline

- Primary interactive targets provide at least a 44-by-44-pixel effective hit area on touch layouts.
- Mobile form controls use a minimum 16-pixel input font size.
- Existing visible control sizes may stay smaller when padding or pseudo-elements safely enlarge the hit area.
- Focus rings use the existing green accent and remain visible on marketing, console, auth, table, menu, and dialog controls.
- Loading buttons stay disabled and visibly indicate progress.
- Request failures preserve the user's entered data.

### Phase 3: Data and Async States

Split the current generic empty presentation into three shared states:

- `LoadingState`: skeleton geometry matching the destination content.
- `EmptyState`: explanation plus an optional next action.
- `ErrorState`: concise failure message, optional detail, and retry action.

Queries that can be retried keep their existing API functions and receive an explicit retry control. Mutations keep their existing submission logic and field contents.

Tables gain:

- An accessible caption or labelled relationship.
- `scope="col"` for column headers.
- A focusable horizontal-scroll container when scrolling is required.
- Mobile-priority layouts for API keys, usage, billing, and model pricing without removing columns from desktop.
- Existing copy/detail actions and tabular number formatting.

### Phase 4: Design Tokens and CSS Structure

The palette is migrated, not replaced.

#### Color Tokens

- Brand accent: existing `#0fb477` family.
- Page background: existing light gray customer background.
- Panels: existing white and subtle gray surfaces.
- Text: existing near-black primary and neutral gray secondary colors.
- Semantic states: existing success, warning, danger, and informational colors.
- Provider marks retain official provider colors.

#### Shape and Elevation Rules

- Controls: 10px radius.
- Cards and panels: 14px radius.
- Dialogs and large floating surfaces: 20-22px radius.
- Pills: full radius only for tags, compact selectors, and pill buttons.
- Static panels use the existing subtle card shadow.
- Clickable cards may gain the existing hover elevation.
- Focus uses one green translucent ring token.

#### CSS Migration

Split the monolithic stylesheet incrementally into responsibility-based files:

- `styles/tokens.css`
- `styles/base.css`
- `styles/marketing.css`
- `styles/console.css`
- `styles/auth.css`
- `styles/dialogs.css`
- `styles/billing.css`
- `styles/seasonal.css`

`src/styles.css` remains the ordered entry point while migration is in progress. A selector moves only when its complete responsive and reduced-motion rules move with it. Each migration commit must produce visual-equivalent output before further polish.

### Phase 5: Performance

- Replace eager page imports with route-level `React.lazy` boundaries.
- Keep the homepage shell and minimal routing state lightweight.
- Lazy-load heavy protected pages, authentication, setup, billing dialogs, API-key tools, usage details, seasonal content, and language conversion where practical.
- Provide route-level loading UI that uses the shared loading state.
- Preserve custom history, protected-route fallback, overlays, browser back/forward, and return-path behavior.
- Compare production build output before and after route splitting.

The target is a materially smaller initial JavaScript payload without changing route behavior. No arbitrary size target is required if it would encourage fragile chunking.

## Homepage Design

The homepage keeps its existing light palette, green accent, official provider marks, centered composition, and approved provider order.

### Final Section Order

1. Hero.
2. Support-group benefit strip.
3. Core capabilities.
4. Model rates.
5. Plans and balance.
6. Conversion CTA.
7. Support channels.
8. FAQ.
9. Footer.

### Hero

Preserve:

- Claude, Codex, Grok, Gemini animation and reduced-motion fallback.
- macOS, Windows, and Linux support marks.
- Primary start/dashboard action.
- Secondary setup-guide action.

Change:

- Replace the generic headline with a concise gateway value proposition.
- Use the supporting line to explain unified balance, usage-based billing, and unchanged workflows.
- Use one consistent unauthenticated primary action label across header, hero, and lower CTA.
- Move the support-group benefit card out of the hero.

The exact localized copy must remain functional and plain. It must not make unsupported uptime, savings, security, or provider-availability claims.

### Support Benefit Strip

The mascot, benefit text, destination, and support entry remain intact. The component becomes a separate section directly below the hero so it remains prominent without competing with the primary CTA.

### Core Capabilities

Keep the four existing capabilities and their icons:

- One-key switch.
- Usage-based billing.
- Visual usage.
- Security controls.

Recompose them as a responsive two-plus-two layout with clearer hierarchy. One-key switch and usage-based billing receive primary emphasis; visual usage and security remain equally available but visually quieter. Mobile remains a single readable column.

### Model Rates

- Title the section as model rates.
- Explain that it shows model input, output, cache, or per-call rates depending on the provider data.
- Preserve API-driven groups, hidden empty groups, group multipliers, status link, table columns, and model ordering.

### Plans and Balance

- Title the existing plan section as plans and balance.
- Explain that plans and pay-as-you-go balance are purchase methods, distinct from model-unit rates.
- Preserve plan filtering, promotions, purchase dialogs, top-up entry, redemption, currency behavior, and unauthenticated redirects.

### CTA Consistency

Use one label per intent:

- Primary onboarding intent: one consistent localized label.
- Setup intent: one consistent localized label.
- Existing authenticated dashboard intent remains distinct.

Support, legal, pricing-detail, and status links remain separate intents.

## Error Handling

- Query loading, empty, and failure states must be distinguishable.
- Retry controls call the same existing query function.
- Mutation errors preserve input state and remain associated with the affected field when applicable.
- Global failures and confirmations continue to use the toast live region.
- Payment and account actions continue preventing duplicate submissions.
- Dialogs in non-dismissible processing states must ignore backdrop and Escape closure.
- Any new route-loading failure must render a recoverable error state rather than a blank page.

## Testing Strategy

### Tooling

- Bun remains the script runner.
- Add React Testing Library, User Event, and a lightweight DOM environment as development dependencies.
- Do not add a production UI dependency for testing purposes.

### Required Automated Coverage

- Existing Gemini pricing and hero order.
- Internal navigation and browser back/forward behavior.
- Protected-route fallback and authentication return path.
- Authentication and setup overlay modality.
- Dialog initial focus, Tab loop, Escape behavior, disabled close, and focus restoration.
- Language and account-menu keyboard behavior.
- Skip link and route focus.
- Reduced-motion scroll selection.
- Field error semantics and first-invalid-field focus.
- Loading, empty, error, and retry behavior.
- Accessible table headers and scroll-region labelling.
- Homepage section order and retained feature/CTA destinations.

### Per-Increment Verification

Run after each behavior or styling increment:

- `bun test`
- `bun run typecheck`
- `bun run build`
- `bun run format:check`
- `git diff --check`

Run responsive browser checks when a browser runtime is available. Required viewports are 375px, 390px, 700px, 768px, 1024px, and 1440px, including reduced-motion coverage for the homepage, menus, dialogs, and setup flow.

## Commit and Rollback Strategy

The expected commit sequence is:

1. Test tooling and existing-behavior tests.
2. Existing customer formatting baseline.
3. Dialog foundation and modal-background behavior.
4. Menus, mobile navigation, route focus, and skip link.
5. Form errors, touch targets, mobile input size, and reduced motion.
6. Async states and responsive tables.
7. Design-token migration and CSS decomposition in multiple focused commits.
8. Route lazy loading and build-size comparison.
9. Homepage hierarchy and copy.
10. Final regression and polish fixes.

Every commit must be independently buildable. Functional migrations are additive before old behavior is removed. If an increment introduces a regression, revert that increment without reverting completed earlier phases.

## Acceptance Criteria

- All existing customer routes still resolve to the same user flows.
- All protected routes, return paths, dialogs, forms, payment actions, API-key actions, usage controls, referrals, settings, setup steps, and localizations remain functional.
- The existing light neutral and green visual identity remains recognizable across every page.
- Marketing, console, auth, dialog, and billing controls use a consistent focus, radius, elevation, and state system.
- Keyboard-only users can navigate menus, dialogs, route changes, forms, and mobile navigation.
- Screen-reader users receive correct dialog, field-error, table, route, toast, and loading semantics.
- Touch controls meet the effective target requirement on mobile layouts.
- Reduced-motion users do not receive automatic smooth scrolling or essential information hidden by animation fallbacks.
- Loading, empty, and error states are distinguishable and recoverable.
- The initial production JavaScript payload is reduced through route-level loading without route regressions.
- The homepage support benefit remains available below the hero, all four capabilities remain present, and model rates are clearly distinguished from plans and balance.
- `bun test`, `bun run typecheck`, `bun run build`, `bun run format:check`, and `git diff --check` pass at completion.
