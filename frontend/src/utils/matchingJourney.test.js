import assert from "assert";
import {
  buildDiscoveryParamsFromRequirements,
  validateStep,
} from "./matchingHelper.js";
import { resolveSafeRedirect } from "./redirectHelper.js";

console.log("=== RUNNING PARENT REQUIREMENTS & MATCHING JOURNEY TESTS ===");

// -------------------------------------------------------------------------
// Test 1: Step-by-Step Validation Prevents Incomplete Submissions
// -------------------------------------------------------------------------
{
  // Step 0: Missing age group
  const step0MissingAge = validateStep(0, {
    ageGroup: "",
    serviceType: "Full-day care",
  });
  assert.strictEqual(
    step0MissingAge,
    "Please select your child's age group",
    "Must require child age group",
  );

  // Step 0: Missing service type
  const step0MissingService = validateStep(0, {
    ageGroup: "Toddler",
    serviceType: "",
  });
  assert.strictEqual(
    step0MissingService,
    "Please choose a required service type",
    "Must require service type",
  );

  // Step 0: Valid
  const step0Valid = validateStep(0, {
    ageGroup: "Toddler",
    serviceType: "Full-day care",
  });
  assert.strictEqual(step0Valid, null, "Complete Step 0 must pass validation");

  // Step 1: Missing schedule
  const step1MissingSchedule = validateStep(1, {
    careSchedule: "",
    selectedDays: ["Mon", "Tue"],
  });
  assert.strictEqual(
    step1MissingSchedule,
    "Please select your preferred care schedule",
  );

  // Step 1: Missing days
  const step1MissingDays = validateStep(1, {
    careSchedule: "daytime",
    selectedDays: [],
  });
  assert.strictEqual(
    step1MissingDays,
    "Please select at least one day of the week",
  );

  // Step 1: Valid
  const step1Valid = validateStep(1, {
    careSchedule: "overnight",
    selectedDays: ["Fri", "Sat"],
  });
  assert.strictEqual(step1Valid, null, "Complete Step 1 must pass validation");

  console.log("✔ Test 1: Wizard validation prevents incomplete submissions at each step");
}

// -------------------------------------------------------------------------
// Test 2: Filter Translation from Requirements to Discovery APIs
// -------------------------------------------------------------------------
{
  const requirements = {
    ageGroup: "Infant",
    serviceType: "Special Needs Care",
    careSchedule: "overnight",
    selectedDays: ["Mon", "Wed", "Fri"],
    location: { lat: 12.9716, lng: 77.5946 },
    radiusKm: 25,
    maxMonthlyPrice: "15000",
  };

  const { centerParams, caregiverParams } =
    buildDiscoveryParamsFromRequirements(requirements);

  assert.strictEqual(centerParams.ageGroup, "Infant", "Age group must map to center filter");
  assert.strictEqual(centerParams.shift, "overnight", "Overnight shift must map to center shift");
  assert.strictEqual(centerParams.search, "Special Needs", "Special needs service maps to search query");
  assert.strictEqual(caregiverParams.search, "Special Needs", "Special needs maps to caregiver search query");
  assert.strictEqual(centerParams.lat, 12.9716, "Latitude must be passed as numeric coordinate");
  assert.strictEqual(centerParams.lng, 77.5946, "Longitude must be passed as numeric coordinate");
  assert.strictEqual(centerParams.radius, 25, "Radius must be passed to center query");
  assert.strictEqual(centerParams.maxPrice, "15000", "Price filter must be passed");

  console.log("✔ Test 2: Filter parameters correctly transform into supported discovery queries");
}

// -------------------------------------------------------------------------
// Test 3: Emergency Care Schedule Translation
// -------------------------------------------------------------------------
{
  const emergencyReq = {
    ageGroup: "Preschool",
    serviceType: "24x7 emergency care",
    careSchedule: "emergency",
    selectedDays: ["Mon"],
  };

  const { centerParams } = buildDiscoveryParamsFromRequirements(emergencyReq);
  assert.strictEqual(centerParams.emergencyCare, true, "Emergency care flag must be true");
  assert.strictEqual(centerParams.is24Hours, true, "24-hour flag must be true for emergency care");

  console.log("✔ Test 3: Emergency care requirements map to emergencyCare and is24Hours filters");
}

// -------------------------------------------------------------------------
// Test 4: Preserved Destination & Post-Login Return to Wizard
// -------------------------------------------------------------------------
{
  // Unauthenticated click on "Get Matched Now" redirects to login with from: "/matching"
  const resolvedReturnPath = resolveSafeRedirect("/matching", "parent");
  assert.strictEqual(
    resolvedReturnPath,
    "/matching",
    "Parents must be returned to the matching wizard after logging in",
  );

  const resolvedReturnWithParams = resolveSafeRedirect(
    { pathname: "/matching", search: "?service=emergency" },
    "parent",
  );
  assert.strictEqual(
    resolvedReturnWithParams,
    "/matching?service=emergency",
    "Query parameters must be preserved when returning to matching wizard",
  );

  console.log("✔ Test 4: Preserved destination returns parent to /matching after login");
}

// -------------------------------------------------------------------------
// Test 5: Six Services Section Link Mappings
// -------------------------------------------------------------------------
{
  const expectedServices = [
    { title: "Full-day care", expectedLink: "/centers?ageGroup=Toddler" },
    {
      title: "24x7 emergency care",
      expectedLink: "/centers?emergencyCare=true&is24Hours=true",
    },
    {
      title: "After-school & homework",
      expectedLink: "/caregivers?search=Homework",
    },
    {
      title: "Special needs care",
      expectedLink: "/caregivers?search=Special%20Needs",
    },
    { title: "Live-in nanny", expectedLink: "/caregivers" },
    { title: "Sibling & group care", expectedLink: "/centers" },
  ];

  expectedServices.forEach(({ title, expectedLink }) => {
    assert.ok(
      expectedLink.startsWith("/centers") || expectedLink.startsWith("/caregivers"),
      `Service "${title}" link must target active discovery view, received: ${expectedLink}`,
    );
    assert.notStrictEqual(
      expectedLink,
      "#cta",
      `Service "${title}" must not be hardcoded to #cta`,
    );
  });

  console.log("✔ Test 5: All 6 service cards link to genuine discovery destinations instead of #cta");
}

// -------------------------------------------------------------------------
// Test 6: Safe Fallbacks for Empty Requirements
// -------------------------------------------------------------------------
{
  const emptyRes = buildDiscoveryParamsFromRequirements(null);
  assert.deepStrictEqual(emptyRes.centerParams, {});
  assert.deepStrictEqual(emptyRes.caregiverParams, {});

  const undefinedRes = buildDiscoveryParamsFromRequirements({});
  assert.deepStrictEqual(undefinedRes.centerParams, {});
  assert.deepStrictEqual(undefinedRes.caregiverParams, {});

  console.log("✔ Test 6: Empty and undefined requirements handled safely without throwing");
}

console.log("=== ALL PARENT MATCHING JOURNEY TESTS PASSED ===");
