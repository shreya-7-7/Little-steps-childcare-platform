import assert from "assert";
import mongoose from "mongoose";
import Center from "../models/Center.js";
import Booking from "../models/Booking.js";
import { resolveSafeRedirect } from "../../../frontend/src/utils/redirectHelper.js";
import { getCenterCoordinates } from "../../../frontend/src/utils/mapHelper.js";

console.log("=== RUNNING PARENT DISCOVERY, MAP & AUTHENTICATION TESTS ===");

const createMockRes = () => {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
};

const runTests = async () => {
  // -------------------------------------------------------------------------
  // Test 1: Coordinate extraction from Mongoose location subdocument
  // -------------------------------------------------------------------------
  {
    // Primary Mongoose Center schema format
    const center1 = {
      centerName: "Sunrise Center",
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };
    const coords1 = getCenterCoordinates(center1);
    assert.deepStrictEqual(
      coords1,
      [28.6139, 77.2090],
      "Should extract coordinates from center.location.latitude/longitude"
    );

    // GeoJSON coordinates format [lng, lat]
    const center2 = {
      centerName: "Bengaluru Center",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716],
      },
    };
    const coords2 = getCenterCoordinates(center2);
    assert.deepStrictEqual(
      coords2,
      [12.9716, 77.5946],
      "Should extract coordinates from center.location.coordinates [lng, lat]"
    );

    // Flat root fields
    const center3 = {
      centerName: "Mumbai Center",
      latitude: 19.0760,
      longitude: 72.8777,
    };
    const coords3 = getCenterCoordinates(center3);
    assert.deepStrictEqual(
      coords3,
      [19.0760, 72.8777],
      "Should extract coordinates from root latitude/longitude"
    );

    // Invalid / missing coordinates return null
    const center4 = {
      centerName: "Unmapped Center",
      location: { latitude: null, longitude: null },
    };
    assert.strictEqual(
      getCenterCoordinates(center4),
      null,
      "Center with null coordinates must return null"
    );

    const center5 = { centerName: "Empty Center" };
    assert.strictEqual(
      getCenterCoordinates(center5),
      null,
      "Center with no location field must return null"
    );

    console.log("✔ Passed: Coordinate extraction handles all schemas & rejects invalid values");
  }

  // -------------------------------------------------------------------------
  // Test 2: Redirect preservation preserves destination and search queries
  // -------------------------------------------------------------------------
  {
    // 2A. Preservation of service discovery filters
    const fromPath1 = "/centers?emergencyCare=true&is24Hours=true";
    const resolvedPath1 = resolveSafeRedirect(fromPath1, "parent");
    assert.strictEqual(
      resolvedPath1,
      "/centers?emergencyCare=true&is24Hours=true",
      "Should preserve discovery query parameters across login"
    );

    // 2B. Preservation of direct booking URL
    const fromPath2 = "/book/little-blossoms";
    const resolvedPath2 = resolveSafeRedirect(fromPath2, "parent");
    assert.strictEqual(
      resolvedPath2,
      "/book/little-blossoms",
      "Should preserve center booking target across login"
    );

    // 2C. Role protection prevents parent from accessing provider dashboard
    const fromPath3 = "/provider/dashboard";
    const resolvedPath3 = resolveSafeRedirect(fromPath3, "parent");
    assert.strictEqual(
      resolvedPath3,
      "/parent/dashboard",
      "Parent must be redirected to parent dashboard instead of provider"
    );

    // 2D. Role protection prevents provider from accessing parent center discovery
    const fromPath4 = "/centers";
    const resolvedPath4 = resolveSafeRedirect(fromPath4, "provider");
    assert.strictEqual(
      resolvedPath4,
      "/provider/dashboard",
      "Provider must be kept in provider dashboard"
    );

    console.log("✔ Passed: Redirect helper preserves intended discovery targets & blocks cross-role access");
  }

  // -------------------------------------------------------------------------
  // Test 3: Backend Booking Creation Defense-in-Depth Authorization
  // -------------------------------------------------------------------------
  {
    // Dynamically import createBooking to test controller directly
    const { createBooking } = await import(
      "../controllers/bookingController.js"
    );

    // 3A. Unauthenticated request (no user)
    const reqUnauth = {
      user: null,
      body: {
        center: new mongoose.Types.ObjectId(),
        childName: "Aarav",
        childAge: 3,
        bookingDate: "2027-01-01",
        startTime: "09:00",
        endTime: "12:00",
        planType: "Hourly",
      },
    };
    const resUnauth = createMockRes();
    await createBooking(reqUnauth, resUnauth);
    assert.strictEqual(
      resUnauth.statusCode,
      403,
      "Unauthenticated booking creation request must be rejected with 403"
    );
    assert.strictEqual(resUnauth.body.success, false);

    // 3B. Provider user attempting to create parent booking
    const reqProvider = {
      user: {
        _id: new mongoose.Types.ObjectId(),
        role: "provider",
      },
      body: {
        center: new mongoose.Types.ObjectId(),
        childName: "Aarav",
        childAge: 3,
        bookingDate: "2027-01-01",
        startTime: "09:00",
        endTime: "12:00",
        planType: "Hourly",
      },
    };
    const resProvider = createMockRes();
    await createBooking(reqProvider, resProvider);
    assert.strictEqual(
      resProvider.statusCode,
      403,
      "Provider user must be rejected from creating parent booking with 403"
    );

    // 3C. Admin user attempting to create parent booking
    const reqAdmin = {
      user: {
        _id: new mongoose.Types.ObjectId(),
        role: "admin",
      },
      body: {
        center: new mongoose.Types.ObjectId(),
        childName: "Aarav",
        childAge: 3,
        bookingDate: "2027-01-01",
        startTime: "09:00",
        endTime: "12:00",
        planType: "Hourly",
      },
    };
    const resAdmin = createMockRes();
    await createBooking(reqAdmin, resAdmin);
    assert.strictEqual(
      resAdmin.statusCode,
      403,
      "Admin user must be rejected from creating parent booking with 403"
    );

    console.log("✔ Passed: Backend booking creation strictly blocks unauthenticated, provider, and admin users");
  }

  // -------------------------------------------------------------------------
  // Test 4: Nearby Proximity Calculation & Distance Filtering
  // -------------------------------------------------------------------------
  {
    const { getCenters } = await import("../controllers/centerController.js");

    const originalFind = Center.find;

    try {
      // Mock center documents located in New Delhi, Pune, and unmapped
      const mockCenters = [
        {
          _id: new mongoose.Types.ObjectId(),
          centerName: "Delhi Little Steps",
          status: "active",
          location: { latitude: 28.6139, longitude: 77.2090 }, // New Delhi
        },
        {
          _id: new mongoose.Types.ObjectId(),
          centerName: "Noida Care Center",
          status: "active",
          location: { latitude: 28.5355, longitude: 77.3910 }, // ~22 km from CP Delhi
        },
        {
          _id: new mongoose.Types.ObjectId(),
          centerName: "Mumbai Cradle Care",
          status: "active",
          location: { latitude: 19.0760, longitude: 72.8777 }, // ~1150 km from Delhi
        },
        {
          _id: new mongoose.Types.ObjectId(),
          centerName: "Unmapped Center",
          status: "active",
          location: { latitude: null, longitude: null },
        },
      ];

      Center.find = () => ({
        populate: () => ({
          sort: () => ({
            lean: async () => mockCenters,
          }),
        }),
      });

      // 4A. Query from Connaught Place Delhi (28.6315, 77.2167) with 30 km radius
      const reqDelhi = {
        query: {
          lat: "28.6315",
          lng: "77.2167",
          radius: "30",
        },
      };
      const resDelhi = createMockRes();
      await getCenters(reqDelhi, resDelhi);

      assert.strictEqual(resDelhi.statusCode, 200);
      assert.strictEqual(resDelhi.body.success, true);
      assert.strictEqual(resDelhi.body.isNearbySearch, true);

      // Should only include centers within 30 km (Delhi & Noida), excluding Mumbai and Unmapped
      const resultNames = resDelhi.body.centers.map((c) => c.centerName);
      assert.ok(
        resultNames.includes("Delhi Little Steps"),
        "Delhi center must be included"
      );
      assert.ok(
        resultNames.includes("Noida Care Center"),
        "Noida center within 30km must be included"
      );
      assert.ok(
        !resultNames.includes("Mumbai Cradle Care"),
        "Mumbai center (1150km away) must be excluded from 30km search"
      );
      assert.ok(
        !resultNames.includes("Unmapped Center"),
        "Unmapped center must be excluded from nearby radius search"
      );

      // Verify sorted by ascending distance
      assert.ok(
        resDelhi.body.centers[0].distanceKm <= resDelhi.body.centers[1].distanceKm,
        "Centers must be sorted by ascending proximity"
      );

      // 4B. Invalid coordinates reject with 400
      const reqInvalid = {
        query: {
          lat: "999.0", // Out of range
          lng: "77.2167",
        },
      };
      const resInvalid = createMockRes();
      await getCenters(reqInvalid, resInvalid);
      assert.strictEqual(
        resInvalid.statusCode,
        400,
        "Invalid coordinates must be rejected with 400"
      );

      console.log("✔ Passed: Proximity search calculates distances, filters by radius, and sorts correctly");
    } finally {
      Center.find = originalFind;
    }
  }

  console.log("\nALL PARENT DISCOVERY, MAP & AUTHENTICATION TESTS PASSED! ✔✔✔");
};

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
