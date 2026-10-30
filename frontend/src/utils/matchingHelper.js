/**
 * Compiles parent requirements wizard form state into supported query parameters
 * for Little Steps center and caregiver discovery APIs.
 */
export const buildDiscoveryParamsFromRequirements = (requirements) => {
  const centerParams = {};
  const caregiverParams = {};

  if (!requirements) {
    return { centerParams, caregiverParams };
  }

  // 1. Age Group Mapping
  if (requirements.ageGroup) {
    centerParams.ageGroup = requirements.ageGroup;
  }

  // 2. Schedule & Shift Mapping
  if (requirements.careSchedule === "overnight") {
    centerParams.shift = "overnight";
  } else if (requirements.careSchedule === "emergency") {
    centerParams.emergencyCare = true;
    centerParams.is24Hours = true;
  } else if (requirements.careSchedule === "24hours") {
    centerParams.is24Hours = true;
  }

  // 3. Service Type Keyword Mapping
  if (requirements.serviceType) {
    if (requirements.serviceType === "Special Needs Care") {
      centerParams.search = "Special Needs";
      caregiverParams.search = "Special Needs";
    } else if (requirements.serviceType === "After-School & Homework") {
      centerParams.ageGroup = "School Age";
      caregiverParams.search = "Homework";
    } else if (requirements.serviceType === "Live-In Nanny") {
      caregiverParams.search = "Live-in";
    }
  }

  // 4. Location Proximity (if GPS or manual coords are provided)
  if (
    requirements.location &&
    !isNaN(Number(requirements.location.lat)) &&
    !isNaN(Number(requirements.location.lng))
  ) {
    centerParams.lat = Number(requirements.location.lat);
    centerParams.lng = Number(requirements.location.lng);
    centerParams.radius = requirements.radiusKm || 50;
  }

  // 5. Budget Constraints
  if (requirements.maxMonthlyPrice) {
    centerParams.maxPrice = requirements.maxMonthlyPrice;
  }

  return { centerParams, caregiverParams };
};

/**
 * Validates requirements step by step.
 */
export const validateStep = (stepIndex, data) => {
  if (stepIndex === 0) {
    // Step 1: Child age & service type
    if (!data.ageGroup) return "Please select your child's age group";
    if (!data.serviceType) return "Please choose a required service type";
  } else if (stepIndex === 1) {
    // Step 2: Schedule & Timing
    if (!data.careSchedule) return "Please select your preferred care schedule";
    if (!data.selectedDays || data.selectedDays.length === 0) {
      return "Please select at least one day of the week";
    }
  } else if (stepIndex === 2) {
    // Step 3: Location preference
    // Optional or location selection
    return null;
  }
  return null;
};
