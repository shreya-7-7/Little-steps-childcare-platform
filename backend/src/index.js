import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend/.env regardless of starting working directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

let dbConnected = false;

const handler = async (req, res) => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Vercel Backend Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  try {
    await connectDB();
    dbConnected = true;
    console.log("MongoDB Database Connected Successfully");

    // Periodic background runner for continuous non-serverless runtime
    import("./utils/subscriptionExpiryHelper.js")
      .then(({ processSubscriptionExpirations }) => {
        setInterval(() => {
          processSubscriptionExpirations().catch((err) =>
            console.error(
              "[BACKGROUND_SUBSCRIPTION_EXPIRY_ERROR]",
              err.message,
            ),
          );
        }, 12 * 60 * 60 * 1000);
      })
      .catch(() => {});

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      "Database connection was not established during startup:",
      err.message,
    );
  }
}

export default handler;
