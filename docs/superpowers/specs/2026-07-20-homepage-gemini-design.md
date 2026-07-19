# Homepage Gemini Integration Design

Date: 2026-07-20
Status: Approved

## Context

The customer homepage currently presents Claude Code, OpenAI Codex, and Grok Code in the hero brand rotation and exposes matching `claude`, `codex`, and `grok` pricing groups. Gemini should be added by following the existing Grok pattern without introducing a broader provider-system refactor.

## Goals

- Add Google Gemini to the customer homepage hero rotation.
- Add a `gemini` model-pricing group after `grok`.
- Use the official Gemini icon already provided by `@lobehub/icons`.
- Preserve the existing API-driven pricing behavior, responsive layout, reduced-motion behavior, and accessibility semantics.

## Non-goals

- Do not change backend pricing APIs or group configuration.
- Do not modify the default admin frontend under `web/default/`.
- Do not redesign the homepage or refactor all providers into a new abstraction.
- Do not hardcode production Gemini prices.

## Design

### Hero brand rotation

Extend the existing hero model list with a Gemini entry:

- ID: `gemini`
- Label: `Google Gemini`
- Logo: the official colored Gemini icon from `@lobehub/icons`

The visible brand order remains additive and stable:

1. Claude Code
2. OpenAI Codex
3. Grok Code
4. Google Gemini

The animated adjacent pairs become:

1. Claude Code / OpenAI Codex
2. OpenAI Codex / Grok Code
3. Grok Code / Google Gemini
4. Google Gemini / Claude Code

The hero accessibility label must include Google Gemini. Reduced-motion and mobile layouts must continue to show a readable, non-overlapping brand list.

### Pricing group

Extend `PricingGroup` with `gemini` and append it to `PRICING_GROUP_ORDER` after `grok`. Add Gemini metadata using the official Gemini logo and the lowercase tab label `gemini`, consistent with the existing pricing tabs.

The group uses:

- `group_ratio.gemini` for the displayed multiplier, defaulting to `1` when absent.
- `usable_group.gemini` for the optional group note.
- Models whose `enable_groups` contains `gemini` or `all`.
- Fallback classification for Gemini when explicit group data is absent, using Gemini/Google vendor identity and `gemini` model naming.

Explicit `enable_groups` remains authoritative. Fallback classification must not pull unrelated Google products into the Gemini group when the model identity is not Gemini-related.

### Development sample data

Add a Gemini vendor and representative Gemini models to `DEV_SAMPLE_PRICING`. This data is only used when the pricing API is unavailable in development. Production continues to render prices returned by `fetchModelPricing()`.

### Styling

Reuse the current Grok-compatible sizing and alignment rules for the hero, pricing tabs, and model marks. Add only Gemini-specific color handling required by the colored icon. The four-provider animation duration should keep approximately the same reading time per pair as the current three-provider cycle.

## Data flow

1. The homepage fetches pricing data through `fetchModelPricing()`.
2. `groupPricing()` creates `claude`, `codex`, `grok`, and `gemini` buckets.
3. Explicit `enable_groups` determines membership when available.
4. Vendor/model-name fallback is used only when explicit membership is missing.
5. The pricing section renders only groups that contain at least one model.

If the backend has no Gemini pricing models, the Gemini tab remains hidden. A missing Gemini ratio or note does not prevent Gemini models from rendering.

## Files in scope

- `web/customer/src/pages/Home/index.tsx`
- `web/customer/src/styles.css`

No translation file changes are expected because the new brand label is a proper name and existing pricing UI text is reused.

## Verification

- Run `bun run typecheck` from `web/customer/`.
- Run `bun run build` from `web/customer/`.
- Run `bun run format:check` from `web/customer/`.
- Verify the hero cycles through all four adjacent pairs in the approved order.
- Verify reduced-motion and mobile layouts remain readable.
- Verify the Gemini pricing tab appears only when Gemini models are present.
- Verify explicit `enable_groups: ['gemini']`, `enable_groups: ['all']`, and fallback Gemini classification.
- Verify Claude, Codex, and Grok grouping behavior is unchanged.

## Success criteria

- Google Gemini appears after Grok in the homepage hero rotation.
- A Gemini pricing group appears after Grok when Gemini pricing data exists.
- Gemini group multiplier, note, model prices, icon, responsive layout, and accessibility behavior match existing provider patterns.
- Existing homepage providers and pricing groups continue to work without behavioral regressions.
