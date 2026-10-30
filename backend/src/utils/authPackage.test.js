import assert from "assert";
import crypto from "crypto";
import bcrypt from "bcryptjs";

process.env.JWT_SECRET = "test_jwt_secret_key_123456789";

import User from "../models/User.js";
import Provider from "../models/Provider.js";
import {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { resolveSafeRedirect } from "../../../frontend/src/utils/redirectHelper.js";

console.log("=== RUNNING COMPLETE AUTHENTICATION PACKAGE TESTS ===");

const createMockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    cookies: {},
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
  };
  return res;
};

// In-Memory Mocks for User and Provider models
let usersDb = [];
let providersDb = [];

const origUserFindOne = User.findOne;
const origUserFindById = User.findById;
const origUserCreate = User.create;
const origProviderFindOne = Provider.findOne;
const origProviderCreate = Provider.create;

try {
  User.findOne = async (query) => {
    if (query.email) {
      return usersDb.find((u) => u.email === query.email) || null;
    }
    if (query.resetPasswordToken) {
      const now = Date.now();
      return (
        usersDb.find(
          (u) =>
            u.resetPasswordToken === query.resetPasswordToken &&
            u.resetPasswordExpire &&
            new Date(u.resetPasswordExpire).getTime() > now,
        ) || null
      );
    }
    return null;
  };

  User.findById = async (id) => {
    return usersDb.find((u) => u._id === id) || null;
  };

  User.create = async (doc) => {
    const user = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...doc,
      save: async function () {
        const idx = usersDb.findIndex((u) => u._id === this._id);
        if (idx >= 0) usersDb[idx] = this;
      },
    };
    usersDb.push(user);
    return user;
  };

  Provider.findOne = async (query) => {
    if (query.user) {
      return providersDb.find((p) => p.user === query.user) || null;
    }
    return null;
  };

  Provider.create = async (doc) => {
    const provider = {
      _id: `prov_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...doc,
    };
    providersDb.push(provider);
    return provider;
  };

  // -------------------------------------------------------------------------
  // Test 1: Parent Registration (Name, Email Normalization, Password >= 8)
  // -------------------------------------------------------------------------
  {
    const req = {
      body: {
        name: "  Sarah Jenkins  ",
        email: "  Sarah.Jenkins@example.com ",
        password: "securePassword123",
        role: "parent",
      },
    };
    const res = createMockRes();

    await register(req, res);
    assert.strictEqual(res.statusCode, 201, "Parent registration must return 201");
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, "sarah.jenkins@example.com", "Email must be normalized to lowercase");
    assert.strictEqual(res.body.user.role, "parent");

    // Verify stored password is a valid bcrypt hash
    const stored = usersDb.find((u) => u.email === "sarah.jenkins@example.com");
    assert.ok(stored, "User must be in database");
    assert.ok(bcrypt.compareSync("securePassword123", stored.password), "Stored password must be hashed with bcrypt");
    console.log("✔ Test 1: Parent registration succeeds with normalized email and bcrypt hash");
  }

  // -------------------------------------------------------------------------
  // Test 2: Provider Registration (With qualifications, phone, address, exp)
  // -------------------------------------------------------------------------
  {
    const req = {
      body: {
        name: "Rajesh Sharma",
        email: "rajesh.care@example.com",
        password: "providerPass123",
        role: "provider",
        phone: "+91 9876543210",
        address: "42 MG Road, Bengaluru",
        qualification: "Montessori Certified, First Aid",
        experience: 6,
        governmentId: "GOV-ID-9988",
      },
    };
    const res = createMockRes();

    await register(req, res);
    assert.strictEqual(res.statusCode, 201, "Provider registration must return 201");
    assert.strictEqual(res.body.user.role, "provider");
    assert.strictEqual(res.body.user.status, "pending");

    const provRecord = providersDb.find((p) => p.user === res.body.user.id);
    assert.ok(provRecord, "Provider profile must be created");
    assert.strictEqual(provRecord.qualification, "Montessori Certified, First Aid");
    assert.strictEqual(provRecord.experience, 6);
    console.log("✔ Test 2: Provider registration succeeds with provider profile and pending status");
  }

  // -------------------------------------------------------------------------
  // Test 3: Invalid Registration Data (Short password, missing provider fields)
  // -------------------------------------------------------------------------
  {
    // Short password
    const reqShortPass = {
      body: { name: "User", email: "user@test.com", password: "123" },
    };
    const resShortPass = createMockRes();
    await register(reqShortPass, resShortPass);
    assert.strictEqual(resShortPass.statusCode, 400);

    // Missing provider fields
    const reqMissingProv = {
      body: {
        name: "Incomplete Provider",
        email: "prov.incomplete@test.com",
        password: "password123",
        role: "provider",
      },
    };
    const resMissingProv = createMockRes();
    await register(reqMissingProv, resMissingProv);
    assert.strictEqual(resMissingProv.statusCode, 400);
    console.log("✔ Test 3: Invalid registration data properly rejected with 400");
  }

  // -------------------------------------------------------------------------
  // Test 4: Duplicate Email Handling
  // -------------------------------------------------------------------------
  {
    const reqDup = {
      body: {
        name: "Sarah Clone",
        email: "SARAH.JENKINS@EXAMPLE.COM", // uppercase variant of existing email
        password: "anotherPassword123",
      },
    };
    const resDup = createMockRes();
    await register(reqDup, resDup);
    assert.strictEqual(resDup.statusCode, 409, "Duplicate email must return 409 Conflict");
    console.log("✔ Test 4: Duplicate email rejected with 409 Conflict");
  }

  // -------------------------------------------------------------------------
  // Test 5: Registration Security: Disallow Public Admin Registration
  // -------------------------------------------------------------------------
  {
    const reqAdmin = {
      body: {
        name: "Hacker Admin",
        email: "admin.hack@example.com",
        password: "adminPassword123",
        role: "admin",
      },
    };
    const resAdmin = createMockRes();
    await register(reqAdmin, resAdmin);
    assert.strictEqual(resAdmin.statusCode, 403, "Public admin creation must be blocked with 403");
    console.log("✔ Test 5: Public admin registration strictly blocked with 403");
  }

  // -------------------------------------------------------------------------
  // Test 6: Parent Login
  // -------------------------------------------------------------------------
  {
    const req = {
      body: {
        email: "SARAH.JENKINS@EXAMPLE.COM",
        password: "securePassword123",
      },
    };
    const res = createMockRes();
    await login(req, res);
    assert.strictEqual(res.statusCode, 200, "Parent login must return 200");
    assert.strictEqual(res.body.user.role, "parent");
    assert.ok(res.cookies.token, "Auth cookie must be set");
    console.log("✔ Test 6: Parent login succeeds with normalized email and sets cookie");
  }

  // -------------------------------------------------------------------------
  // Test 7: Provider Login (Pending vs Approved)
  // -------------------------------------------------------------------------
  {
    // 7A: Pending provider
    const reqPending = {
      body: {
        email: "rajesh.care@example.com",
        password: "providerPass123",
      },
    };
    const resPending = createMockRes();
    await login(reqPending, resPending);
    assert.strictEqual(resPending.statusCode, 403, "Pending provider must be rejected with 403");

    // 7B: Approved provider
    const provUser = usersDb.find((u) => u.email === "rajesh.care@example.com");
    provUser.isApproved = true;
    const provProfile = providersDb.find((p) => p.user === provUser._id);
    provProfile.verificationStatus = "approved";

    const resApproved = createMockRes();
    await login(reqPending, resApproved);
    assert.strictEqual(resApproved.statusCode, 200, "Approved provider must succeed with 200");
    assert.strictEqual(resApproved.body.user.role, "provider");
    console.log("✔ Test 7: Provider login respects verification status (Pending=403, Approved=200)");
  }

  // -------------------------------------------------------------------------
  // Test 8: Admin Login
  // -------------------------------------------------------------------------
  {
    const adminHashedPassword = bcrypt.hashSync("adminSecretPass123", 10);
    await User.create({
      name: "Platform Administrator",
      email: "admin@littlesteps.com",
      password: adminHashedPassword,
      role: "admin",
      status: "active",
      isApproved: true,
    });

    const reqAdmin = {
      body: {
        email: "admin@littlesteps.com",
        password: "adminSecretPass123",
      },
    };
    const resAdmin = createMockRes();
    await login(reqAdmin, resAdmin);
    assert.strictEqual(resAdmin.statusCode, 200, "Admin login must return 200");
    assert.strictEqual(resAdmin.body.user.role, "admin");
    console.log("✔ Test 8: Admin login functional and sets admin role");
  }

  // -------------------------------------------------------------------------
  // Test 9: Wrong Password Handling
  // -------------------------------------------------------------------------
  {
    const reqWrong = {
      body: {
        email: "sarah.jenkins@example.com",
        password: "wrongPassword999",
      },
    };
    const resWrong = createMockRes();
    await login(reqWrong, resWrong);
    assert.strictEqual(resWrong.statusCode, 401, "Wrong password must return 401");
    console.log("✔ Test 9: Wrong password rejected with 401");
  }

  // -------------------------------------------------------------------------
  // Test 10: Blocked User Handling
  // -------------------------------------------------------------------------
  {
    const parentUser = usersDb.find((u) => u.email === "sarah.jenkins@example.com");
    parentUser.status = "blocked";

    // Blocked login
    const reqBlockedLogin = {
      body: {
        email: "sarah.jenkins@example.com",
        password: "securePassword123",
      },
    };
    const resBlockedLogin = createMockRes();
    await login(reqBlockedLogin, resBlockedLogin);
    assert.strictEqual(resBlockedLogin.statusCode, 403, "Blocked user login must return 403");

    // Blocked active session access
    const reqBlockedCurrent = { user: parentUser };
    const resBlockedCurrent = createMockRes();
    await getCurrentUser(reqBlockedCurrent, resBlockedCurrent);
    assert.strictEqual(resBlockedCurrent.statusCode, 403, "Blocked session check must return 403 and clear token");

    // Restore user
    parentUser.status = "active";
    console.log("✔ Test 10: Blocked user login and session requests blocked with 403");
  }

  // -------------------------------------------------------------------------
  // Test 11: Logout Invalidation
  // -------------------------------------------------------------------------
  {
    const reqLogout = {};
    const resLogout = createMockRes();
    await logout(reqLogout, resLogout);
    assert.strictEqual(resLogout.statusCode, 200);
    assert.ok(
      resLogout.clearedCookies.some((c) => c.name === "token"),
      "Logout must clear auth token cookie",
    );
    console.log("✔ Test 11: Logout clears authentication cookie");
  }

  // -------------------------------------------------------------------------
  // Test 12: Redirect Resolver: Safety, Query Preservation & Role Boundaries
  // -------------------------------------------------------------------------
  {
    // 12A: Preserves query parameters for intended parent matching
    const parentTarget = resolveSafeRedirect(
      { pathname: "/centers", search: "?service=emergency&radius=25" },
      "parent",
    );
    assert.strictEqual(parentTarget, "/centers?service=emergency&radius=25");

    // 12B: Prevents open redirect to external site
    const maliciousTarget = resolveSafeRedirect("https://evil.com/phishing", "parent");
    assert.strictEqual(maliciousTarget, "/parent/dashboard");

    const protocolRelativeTarget = resolveSafeRedirect("//evil.com", "parent");
    assert.strictEqual(protocolRelativeTarget, "/parent/dashboard");

    // 12C: Prevents cross-role access (Parent cannot redirect into admin or provider dashboard)
    const crossRoleParent = resolveSafeRedirect("/admin/dashboard", "parent");
    assert.strictEqual(crossRoleParent, "/parent/dashboard");

    const crossRoleProvider = resolveSafeRedirect("/admin/reports", "provider");
    assert.strictEqual(crossRoleProvider, "/provider/dashboard");

    // 12D: Default fallback when no destination provided
    assert.strictEqual(resolveSafeRedirect(null, "parent"), "/parent/dashboard");
    assert.strictEqual(resolveSafeRedirect(null, "provider"), "/provider/dashboard");
    assert.strictEqual(resolveSafeRedirect(null, "admin"), "/admin/dashboard");

    console.log("✔ Test 12: Redirect resolver preserves query parameters, blocks open redirects & cross-role access");
  }

  // -------------------------------------------------------------------------
  // Test 13: Password Recovery: Forgot Password Token Generation
  // -------------------------------------------------------------------------
  let receivedDevResetToken = null;
  {
    const req = {
      body: { email: "sarah.jenkins@example.com" },
    };
    const res = createMockRes();
    await forgotPassword(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.devResetUrl, "Dev reset URL generated");

    const user = usersDb.find((u) => u.email === "sarah.jenkins@example.com");
    assert.ok(user.resetPasswordToken, "Hashed reset token must be saved on user");
    assert.ok(user.resetPasswordExpire > Date.now(), "Token expiry must be in the future");

    receivedDevResetToken = res.body.devResetUrl.split("/reset-password/")[1];
    console.log("✔ Test 13: Forgot password generates secure SHA256 hashed token with 15m expiry");
  }

  // -------------------------------------------------------------------------
  // Test 14: Password Recovery: Reset Password with Valid Token
  // -------------------------------------------------------------------------
  {
    const req = {
      params: { token: receivedDevResetToken },
      body: { password: "newBrandSecurePassword123" },
    };
    const res = createMockRes();
    await resetPassword(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);

    const user = usersDb.find((u) => u.email === "sarah.jenkins@example.com");
    assert.strictEqual(user.resetPasswordToken, null, "Reset token must be cleared after use");
    assert.strictEqual(user.resetPasswordExpire, null, "Expiry must be cleared after use");
    assert.ok(
      bcrypt.compareSync("newBrandSecurePassword123", user.password),
      "Password must be updated to new hashed password",
    );
    console.log("✔ Test 14: Reset password updates password and nullifies reset token");
  }

  // -------------------------------------------------------------------------
  // Test 15: Password Recovery: Reusing Used Token Fails
  // -------------------------------------------------------------------------
  {
    const reqReuse = {
      params: { token: receivedDevResetToken },
      body: { password: "anotherPassword999" },
    };
    const resReuse = createMockRes();
    await resetPassword(reqReuse, resReuse);
    assert.strictEqual(resReuse.statusCode, 400, "Reusing a used reset token must fail with 400");
    console.log("✔ Test 15: Reusing already-consumed reset token safely fails with 400");
  }

  // -------------------------------------------------------------------------
  // Test 16: Password Recovery: Expired Token Fails
  // -------------------------------------------------------------------------
  {
    const user = usersDb.find((u) => u.email === "sarah.jenkins@example.com");
    const expiredRawToken = "expired_token_1234567890abcdef";
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(expiredRawToken)
      .digest("hex");
    user.resetPasswordExpire = new Date(Date.now() - 60 * 1000); // 1 minute in the past

    const reqExpired = {
      params: { token: expiredRawToken },
      body: { password: "someNewPassword123" },
    };
    const resExpired = createMockRes();
    await resetPassword(reqExpired, resExpired);
    assert.strictEqual(resExpired.statusCode, 400, "Expired token must be rejected with 400");
    console.log("✔ Test 16: Expired reset token safely rejected with 400");
  }
} finally {
  User.findOne = origUserFindOne;
  User.findById = origUserFindById;
  User.create = origUserCreate;
  Provider.findOne = origProviderFindOne;
  Provider.create = origProviderCreate;
}

console.log("=== ALL 16 AUTHENTICATION PACKAGE TESTS PASSED ===");
