import assert from "assert";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Center from "../models/Center.js";
import { register, login } from "../controllers/authController.js";
import { getCenters } from "../controllers/centerController.js";
import { createBooking } from "../controllers/bookingController.js";
import { getCenterCoordinates } from "../../../frontend/src/utils/mapHelper.js";
import { resolveSafeRedirect } from "../../../frontend/src/utils/redirectHelper.js";

console.log("=== RUNNING REGISTRATION, MAP & NEARBY CENTRE E2E TEST SUITE ===");

const createMockRes = () => {
  return {
    statusCode: null,
    body: null,
    cookies: {},
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(d) {
      this.body = d;
      return this;
    },
    cookie(name, val, opts) {
      this.cookies[name] = { val, opts };
    },
  };
};

const runSuite = async () => {
  await connectDB();
  console.log("MongoDB Connected for Test Suite Execution.");

  // =========================================================================
  // TASK A: REGISTRATION & AUTHENTICATION END-TO-END TESTS
  // =========================================================================
  console.log("\n--- [TASK A] Testing Registration & Login ---");

  const testParentEmail = `parent.verify_${Date.now()}@testlittlesteps.com`;
  const testPassword = "StrongPassword123#";

  // Test 1: Register unique parent
  {
    const req = {
      body: {
        name: "Test Parent Verification",
        email: testParentEmail,
        password: testPassword,
        role: "parent",
      },
    };
    const res = createMockRes();

    await register(req, res);

    assert.strictEqual(res.statusCode, 201, "Registration must return 201 Created");
    assert.strictEqual(res.body.success, true, "Registration must succeed");
    assert.ok(res.body.token, "Parent registration must issue a JWT session token");
    assert.ok(res.cookies.token, "Parent registration must set an HTTP-only token cookie");
    assert.strictEqual(res.body.user.email, testParentEmail.toLowerCase());
    assert.strictEqual(res.body.user.role, "parent");

    // Verify document in MongoDB
    const savedUser = await User.findOne({ email: testParentEmail.toLowerCase() });
    assert.ok(savedUser, "User record must be persisted in MongoDB");
    assert.strictEqual(savedUser.status, "active");
    const passwordMatches = await bcrypt.compare(testPassword, savedUser.password);
    assert.strictEqual(passwordMatches, true, "Password must be correctly bcrypt-hashed");

    console.log("✔ Test 1 Passed: Parent registered, saved in MongoDB, password hashed, cookie issued");
  }

  // Test 2: Duplicate email registration rejected
  {
    const req = {
      body: {
        name: "Duplicate Parent Attempt",
        email: testParentEmail,
        password: "AnotherPassword123!",
        role: "parent",
      },
    };
    const res = createMockRes();

    await register(req, res);

    assert.strictEqual(res.statusCode, 409, "Duplicate email must return 409 Conflict");
    assert.strictEqual(res.body.success, false);
    assert.ok(
      res.body.message.includes("already exists"),
      "Error message must clearly inform duplicate email"
    );

    console.log("✔ Test 2 Passed: Duplicate email rejected with 409 Conflict");
  }

  // Test 3: Login with newly registered parent
  {
    const req = {
      body: {
        email: testParentEmail,
        password: testPassword,
      },
    };
    const res = createMockRes();

    await login(req, res);

    assert.strictEqual(res.statusCode, 200, "Login must return 200 OK");
    assert.strictEqual(res.body.success, true);
    assert.ok(res.cookies.token, "Login must set auth cookie");
    assert.strictEqual(res.body.user.email, testParentEmail.toLowerCase());

    console.log("✔ Test 3 Passed: Newly registered parent logs in successfully");
  }

  // Test 4: Admin public registration blocked
  {
    const req = {
      body: {
        name: "Rogue Admin",
        email: `admin.rogue_${Date.now()}@example.com`,
        password: "AdminPassword123!",
        role: "admin",
      },
    };
    const res = createMockRes();

    await register(req, res);

    assert.strictEqual(res.statusCode, 403, "Admin registration must return 403 Forbidden");
    assert.strictEqual(res.body.success, false);

    console.log("✔ Test 4 Passed: Admin creation via public registration strictly blocked");
  }

  // =========================================================================
  // TASK B: MAP & COORDINATES TESTS
  // =========================================================================
  console.log("\n--- [TASK B] Testing Map Coordinates & Extraction ---");

  // Test 5: Coordinate extraction across all schemas
  {
    const centerMongo = {
      centerName: "Barakhamba Care",
      location: { latitude: 28.6315, longitude: 77.2167 },
    };
    assert.deepStrictEqual(
      getCenterCoordinates(centerMongo),
      [28.6315, 77.2167],
      "Must extract from location.latitude & location.longitude"
    );

    const centerGeoJSON = {
      centerName: "Bengaluru Center",
      location: { type: "Point", coordinates: [77.6412, 12.9716] },
    };
    assert.deepStrictEqual(
      getCenterCoordinates(centerGeoJSON),
      [12.9716, 77.6412],
      "Must extract and invert GeoJSON [lng, lat] to [lat, lng]"
    );

    const centerFlat = {
      centerName: "Mumbai Center",
      latitude: 19.1136,
      longitude: 72.8697,
    };
    assert.deepStrictEqual(
      getCenterCoordinates(centerFlat),
      [19.1136, 72.8697],
      "Must extract from flat latitude & longitude"
    );

    const centerInvalid = {
      centerName: "Unmapped Center",
      location: { latitude: null, longitude: null },
    };
    assert.strictEqual(
      getCenterCoordinates(centerInvalid),
      null,
      "Invalid or null coordinates must safely return null"
    );

    console.log("✔ Test 5 Passed: Coordinate extractor correctly handles all schema formats");
  }

  // =========================================================================
  // TASK C: REAL NEARBY DISTANCE DISCOVERY TESTS
  // =========================================================================
  console.log("\n--- [TASK C] Testing Genuine Proximity & Distance Calculation ---");

  // Test 6: Distance discovery from Connaught Place, New Delhi
  {
    // Connaught Place: 28.6315, 77.2167
    const req = {
      query: {
        lat: "28.6315",
        lng: "77.2167",
        radius: "50",
      },
    };
    const res = createMockRes();

    await getCenters(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.isNearbySearch, true);
    assert.ok(res.body.centers.length >= 1, "Must find at least 1 center near Delhi");

    const nearestCenter = res.body.centers[0];
    assert.strictEqual(nearestCenter.centerName, "Sunrise Childcare Academy");
    assert.strictEqual(nearestCenter.distanceKm, 0, "Same coordinates must have distance 0 km");
    assert.ok(
      nearestCenter.distanceKm <= 50,
      "Center distance must be within requested radius"
    );

    console.log(`✔ Test 6 Passed: Found nearest center "${nearestCenter.centerName}" at ${nearestCenter.distanceKm} km`);
  }

  // Test 7: Distance discovery from Mumbai Marine Drive
  {
    // Marine Drive: 18.9438, 72.8231
    const req = {
      query: {
        lat: "18.9438",
        lng: "72.8231",
        radius: "50",
      },
    };
    const res = createMockRes();

    await getCenters(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.centers.length >= 1, "Must find Mumbai center");

    const nearestCenter = res.body.centers[0];
    assert.strictEqual(nearestCenter.centerName, "Cradle & Co. Childcare Haven");
    assert.ok(
      nearestCenter.distanceKm > 10 && nearestCenter.distanceKm < 30,
      `Calculated distance from Marine Drive to Andheri (${nearestCenter.distanceKm} km) is geographically accurate`
    );

    console.log(`✔ Test 7 Passed: Found nearest center "${nearestCenter.centerName}" at ${nearestCenter.distanceKm} km`);
  }

  // Test 8: Far-off coordinates with narrow radius returns 0 centers honestly
  {
    // Coordinates in Chennai (no Chennai center seeded, only Delhi, Mumbai, BLR, Pune, Kolkata)
    const req = {
      query: {
        lat: "13.0827",
        lng: "80.2707",
        radius: "50", // 50 km from Chennai
      },
    };
    const res = createMockRes();

    await getCenters(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.isNearbySearch, true);
    assert.strictEqual(
      res.body.centers.length,
      0,
      "Must honestly return 0 centers when none are within 50 km of Chennai"
    );

    console.log("✔ Test 8 Passed: Honestly returns 0 results when no center is within narrow radius");
  }

  // Test 9: Expanding radius from Chennai to 500 km includes Bengaluru
  {
    const req = {
      query: {
        lat: "13.0827",
        lng: "80.2707",
        radius: "500", // 500 km from Chennai
      },
    };
    const res = createMockRes();

    await getCenters(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(
      res.body.centers.length >= 1,
      "Expanding radius to 500km includes Bengaluru center"
    );
    const blrCenter = res.body.centers.find(
      (c) => c.centerName === "Little Blossoms Indiranagar"
    );
    assert.ok(blrCenter, "Bengaluru center must be found within 500 km of Chennai");
    assert.ok(
      blrCenter.distanceKm > 250 && blrCenter.distanceKm < 350,
      `Distance from Chennai to Bengaluru (${blrCenter.distanceKm} km) is accurate`
    );

    console.log(`✔ Test 9 Passed: Expanded radius found "${blrCenter.centerName}" at ${blrCenter.distanceKm} km`);
  }

  // =========================================================================
  // TASK D: SECURITY & BOOKING AUTHORIZATION TESTS
  // =========================================================================
  console.log("\n--- [TASK D] Testing Security & Booking Authorization ---");

  // Test 10: Unauthenticated booking creation rejected with 403
  {
    const req = {
      user: null,
      body: {
        center: new mongoose.Types.ObjectId(),
        childName: "Aarav",
        childAge: 4,
        bookingDate: "2027-02-01",
        startTime: "09:00",
        endTime: "13:00",
        planType: "Hourly",
      },
    };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 403, "Unauthenticated booking must be rejected with 403");
    assert.strictEqual(res.body.success, false);

    console.log("✔ Test 10 Passed: Unauthenticated direct booking request rejected with 403");
  }

  // Test 11: Provider account cannot create parent booking
  {
    const req = {
      user: {
        _id: new mongoose.Types.ObjectId(),
        role: "provider",
      },
      body: {
        center: new mongoose.Types.ObjectId(),
        childName: "Aarav",
        childAge: 4,
        bookingDate: "2027-02-01",
        startTime: "09:00",
        endTime: "13:00",
        planType: "Hourly",
      },
    };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 403, "Provider cannot create parent booking");
    assert.strictEqual(res.body.success, false);

    console.log("✔ Test 11 Passed: Provider blocked from creating parent booking");
  }

  // Test 12: Redirect resolver preserves query params and blocks cross-role access
  {
    assert.strictEqual(
      resolveSafeRedirect("/centers?lat=28.6139&lng=77.2090&radius=50", "parent"),
      "/centers?lat=28.6139&lng=77.2090&radius=50",
      "Should preserve proximity query parameters for parent"
    );

    assert.strictEqual(
      resolveSafeRedirect("/centers", "provider"),
      "/provider/dashboard",
      "Provider redirected to provider dashboard instead of parent centers"
    );

    console.log("✔ Test 12 Passed: Redirect helper preserves destination & enforces role separation");
  }

  console.log("\n=======================================================");
  console.log("ALL 12 TESTS IN REGISTRATION & NEARBY SUITE PASSED! ✔✔✔");
  console.log("=======================================================");
  process.exit(0);
};

runSuite().catch((err) => {
  console.error("Test Suite Failure:", err);
  process.exit(1);
});
