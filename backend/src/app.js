import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import caregiverRoutes from "./routes/caregiverRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";

const app = express();

console.log("========== LITTLE STEPS BACKEND ==========");
console.log("Routes Loaded Successfully");

// ==============================
// CORS
// ==============================

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const allowedOrigins = Array.from(
  new Set([
    ...defaultOrigins,
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
  ].filter(Boolean)),
);

console.log("Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);
      return callback(null, false);
    },
    credentials: true,
  }),
);

// ==============================
// Body Parser
// ==============================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// ==============================
// Request Logger
// ==============================

app.use((req, res, next) => {
  console.log(`\n${req.method} ${req.originalUrl}`);
  next();
});

// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/caregivers", caregiverRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/policies", policyRoutes);

// ==============================
// Health Check
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Little Steps Backend Running 🚀",
  });
});

// ==============================
// 404 Handler
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use((err, req, res, next) => {
  console.error("\n========== GLOBAL ERROR ==========");
  console.error("Name:", err.name);
  console.error("Message:", err.message);

  if (err.errors) {
    console.error("Validation Errors:");
    console.dir(err.errors, { depth: null });
  }

  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
