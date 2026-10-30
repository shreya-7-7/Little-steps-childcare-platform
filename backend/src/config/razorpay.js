import Razorpay from "razorpay";
import "dotenv/config";

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
