import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Razorpay from "razorpay";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;

if (key_id && key_secret) {
  razorpay = new Razorpay({
    key_id,
    key_secret,
  });
} else {
  console.log("Razorpay credentials not set; Razorpay client uninitialized");
}

export default razorpay;
