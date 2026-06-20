/**
 * Seasonal / holiday effect switches.
 *
 * These are manual on/off switches. Flip the boolean and rebuild the frontend
 * to enable or disable the effect — no backend or admin config involved.
 */

/** Father's Day falling gift boxes on the home page. */
export const FATHERS_DAY_GIFTS_ENABLED = true;

/**
 * Destination for the fixed gift entry shown at the top of the page.
 * Leave empty to keep the gift visible but inert (no navigation on click).
 * Set to an internal path ("/subscription") or full URL ("https://...").
 */
export const FATHERS_DAY_GIFT_LINK = "/fathers-day";

/**
 * Which subscription plan to feature on the Father's Day letter page.
 * Pinned to the production "父亲节套餐" plan (id 6). The page looks this id up
 * from the raw plan list, so it is shown even though it is not an "AI coding"
 * plan. Set to null to fall back to the first available plan.
 */
export const FATHERS_DAY_PLAN_ID: number | null = 6;
