/**
 * Authoritative Subscription Packages & Benefits Configuration
 * Strictly grounded in existing Little Steps childcare capabilities.
 */

export const SUBSCRIPTION_TIERS = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export const BILLING_CYCLES = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export const TIER_MULTIPLIERS = {
  [SUBSCRIPTION_TIERS.BASIC]: 0.8,
  [SUBSCRIPTION_TIERS.STANDARD]: 1.0,
  [SUBSCRIPTION_TIERS.PREMIUM]: 1.3,
};

export const BILLING_CYCLE_MULTIPLIERS = {
  [BILLING_CYCLES.MONTHLY]: 1,
  [BILLING_CYCLES.QUARTERLY]: 3,
  [BILLING_CYCLES.YEARLY]: 12,
};

/**
 * Verified benefits supported by existing Little Steps models and controllers:
 * - Center operational schedule & attendance (Center model)
 * - Caregiver supervision (Caregiver model)
 * - Center facilities access (Center.facilities)
 * - In-app notifications & alerts (Notification model)
 * - Reviews & feedback privileges (Review model)
 * - Dispute resolution assistance (Dispute model)
 */
export const TIER_BENEFITS = {
  [SUBSCRIPTION_TIERS.BASIC]: [
    "Full childcare center enrollment during scheduled operational hours",
    "Care and supervision by verified, background-checked center caregivers",
    "In-app notifications for enrollment confirmation, billing, and renewal alerts",
  ],
  [SUBSCRIPTION_TIERS.STANDARD]: [
    "Full childcare center enrollment during scheduled operational hours",
    "Care and supervision by verified, background-checked center caregivers",
    "Full access to enrolled center amenities and play facilities",
    "In-app notifications for enrollment confirmation, billing, and renewal alerts",
    "Parent review submission and center rating privileges",
    "Dispute filing and resolution support access",
  ],
  [SUBSCRIPTION_TIERS.PREMIUM]: [
    "Full childcare center enrollment during scheduled operational hours",
    "Care and supervision by verified, background-checked center caregivers",
    "Full access to enrolled center amenities and play facilities",
    "In-app notifications for enrollment confirmation, billing, and renewal alerts",
    "Parent review submission and center rating privileges",
    "Priority dispute handling and resolution assistance",
    "Dedicated continuous enrollment status across the full subscription term",
  ],
};

/**
 * Calculate authoritative subscription amount.
 * Never trust prices from client.
 *
 * @param {number} baseMonthlyFee - Center's authoritative monthlyFee
 * @param {string} planType - "Monthly" | "Quarterly" | "Yearly"
 * @param {string|null} [tier] - Optional: "Basic" | "Standard" | "Premium" (null/undefined for legacy)
 * @returns {number} Calculated total amount in INR
 */
export const calculatePackagePrice = (baseMonthlyFee, planType, tier = null) => {
  const baseMonthly = Number(baseMonthlyFee) || 0;
  if (baseMonthly <= 0) {
    return 0;
  }

  // Tier multiplier (defaults to 1.0 for backward compatibility with existing subscriptions)
  const tierMultiplier = tier && TIER_MULTIPLIERS[tier] ? TIER_MULTIPLIERS[tier] : 1.0;

  // Monthly price for the tier, rounded to integer INR
  const packageMonthlyPrice = Math.round(baseMonthly * tierMultiplier);

  // Billing cycle multiplier
  const cycleMultiplier = BILLING_CYCLE_MULTIPLIERS[planType] || 1;

  return packageMonthlyPrice * cycleMultiplier;
};

/**
 * Retrieve verified benefits for a given tier.
 *
 * @param {string|null} tier
 * @returns {string[]} List of benefit descriptions
 */
export const getPackageBenefits = (tier) => {
  if (!tier || !TIER_BENEFITS[tier]) {
    return [];
  }
  return [...TIER_BENEFITS[tier]];
};

/**
 * Validate tier name if provided.
 *
 * @param {string} tier
 * @returns {boolean}
 */
export const isValidTier = (tier) => {
  return Object.values(SUBSCRIPTION_TIERS).includes(tier);
};

/**
 * Validate billing cycle planType.
 *
 * @param {string} planType
 * @returns {boolean}
 */
export const isValidPlanType = (planType) => {
  return Object.values(BILLING_CYCLES).includes(planType);
};
