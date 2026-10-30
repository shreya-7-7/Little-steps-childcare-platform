# Little Steps — Trusted 24/7 Childcare Platform

> A full-stack childcare management platform connecting parents, childcare providers, caregivers, and administrators through a role-based web application.

---

## 📌 Project Overview

**Little Steps — Trusted 24/7 Childcare Platform** is a MERN-style full-stack childcare management system designed around four primary roles:

- **Parent** — discovers childcare centers and caregivers, creates bookings, manages bookings, subscriptions, and payments.
- **Provider** — manages childcare centers, caregivers, provider profile, and parent bookings.
- **Admin** — manages users, providers, centers, bookings, subscriptions, payments, and reports.
- **Guest** — can access the public landing page and authentication pages.

The supplied source code contains separate `backend/` and `frontend/` applications, with Express/Mongoose APIs, React/Vite UI, role-based authentication, Cloudinary image handling, and Razorpay payment processing.

---

## ✨ Key Features

### 👨‍👩‍👧 Parent Module

- Parent registration and login
- Protected parent dashboard
- Browse childcare centers
- View detailed center information
- Browse caregiver profiles
- Create childcare bookings
- View booking history
- View individual booking details
- Cancel pending bookings
- Payment workflow through Razorpay
- View payment history
- Subscription management
- Parent profile management

### 🏢 Provider Module

- Provider registration
- Provider approval workflow
- Provider dashboard
- Provider profile management
- Create and manage childcare centers
- Edit/delete provider centers
- Manage caregivers
- Upload caregiver profile images
- View caregiver details
- View parent bookings
- Approve/reject bookings
- Provider booking details

### 🛡️ Admin Module

The admin dashboard provides management and reporting functionality for:

- Dashboard statistics
- Users
- Providers
- Provider approval/rejection
- Childcare centers
- Center status
- Bookings
- Booking status filtering
- Subscriptions
- Subscription status filtering
- Payments
- Payment status filtering
- Revenue reporting
- Booking reporting
- Subscription reporting
- Overview reporting

The backend dashboard statistics aggregate users, parents, providers, verified/pending providers, centers, caregivers, bookings, subscriptions, successful payments, and revenue.

### 💳 Razorpay Payments

The payment implementation includes:

1. Create Razorpay order
2. Save pending payment record
3. Complete Razorpay checkout
4. Receive Razorpay order/payment/signature information
5. Verify the Razorpay HMAC signature on the backend
6. Mark the payment as successful
7. Update the related booking payment status
8. Create/activate subscription data when the payment represents a subscription

The source code uses INR for payment transactions.

### 🖼️ Cloudinary Media Uploads

Cloudinary is used for uploaded media such as provider/caregiver profile images and childcare center images.

The backend contains:

- Cloudinary configuration
- Multer upload middleware
- Cloudinary storage
- Upload utility functions

### 🔐 Authentication & Authorization

Authentication is implemented with:

- JWT
- HTTP-only cookies
- bcrypt password hashing
- Authentication middleware
- Role middleware
- Protected routes
- Guest routes
- Provider approval checks
- Blocked-account checks

Supported user roles in the supplied User model:

```text
parent
provider
admin
```

---

## 🧰 Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Development/build tooling |
| React Router | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | API communication |
| React Hook Form | Form handling |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Icons | Additional icons |
| Recharts | Admin/report charts |
| Sonner | Toast notifications |
| Shadcn/UI | Reusable UI components |
| js-cookie | Client-side cookie utilities |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express 5 | REST API |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Cookie Parser | Cookie handling |
| CORS | Cross-origin requests |
| Multer | File uploads |
| Cloudinary | Media storage |
| multer-storage-cloudinary | Multer/Cloudinary integration |
| Razorpay | Online payments |
| Validator | Input validation |
| dotenv | Environment configuration |

The backend dependency list and frontend dependency list are present in the supplied source material.

---

## 🏗️ High-Level Architecture

```text
                    ┌──────────────────────────┐
                    │       React Frontend      │
                    │      Vite + Tailwind     │
                    └────────────┬─────────────┘
                                 │
                              Axios
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      Express Backend     │
                    │       REST APIs           │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌───────────┐      ┌────────────┐     ┌────────────┐
        │ MongoDB   │      │ Cloudinary │     │ Razorpay   │
        │ + Mongoose│      │   Media    │     │ Payments   │
        └───────────┘      └────────────┘     └────────────┘
```

---

## 📁 Project Structure

```text
Little-Steps-Trusted-24-7-Childcare-Platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   └── razorpay.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── caregiverController.js
│   │   │   ├── centerController.js
│   │   │   ├── paymentController.js
│   │   │   ├── providerController.js
│   │   │   ├── subscriptionController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Booking.js
│   │   │   ├── Caregiver.js
│   │   │   ├── Center.js
│   │   │   ├── Payment.js
│   │   │   ├── Provider.js
│   │   │   ├── Subscription.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── caregiverRoutes.js
│   │   │   ├── centerRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── providerRoutes.js
│   │   │   ├── subscriptionRoutes.js
│   │   │   └── userRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── cloudinaryUplaod.js
│   │   │   ├── generateSlug.js
│   │   │   └── generateToken.js
│   │   │
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── components.json
│   └── README.md
│
└── README.md
```

---

## 🔑 Authentication Flow

### Registration

The backend supports:

```text
POST /auth/register
```

Parents can register with the basic account information.

Providers additionally submit provider information such as:

- Phone
- Address
- Qualification
- Experience
- Government ID
- Profile image

Provider accounts are initially placed into a pending/approval workflow.

### Login

```text
POST /auth/login
```

The backend:

1. Validates the email/password.
2. Looks up the user.
3. Compares the password with bcrypt.
4. Checks blocked status.
5. Checks provider verification status when applicable.
6. Generates a JWT.
7. Stores the JWT in an HTTP-only cookie.
8. Returns the authenticated user information.

### Current User

```text
GET /auth/me
```

### Logout

```text
POST /auth/logout
```

### Profile Update

```text
PUT /auth/profile
```

---

## 🔒 Role-Based Access

The application uses middleware to restrict protected operations.

```text
Guest
  │
  ├── Public landing page
  ├── Login
  └── Register

Parent
  │
  ├── Dashboard
  ├── Centers
  ├── Caregivers
  ├── Bookings
  ├── Payments
  └── Subscriptions

Provider
  │
  ├── Dashboard
  ├── Centers
  ├── Caregivers
  ├── Bookings
  └── Profile

Admin
  │
  ├── Dashboard
  ├── Users
  ├── Providers
  ├── Centers
  ├── Bookings
  ├── Subscriptions
  ├── Payments
  └── Reports
```

---

## 🔌 Main API Modules

The backend is organized into the following route modules:

```text
/auth
/users
/bookings
/caregivers
/centers
/providers
/subscriptions
/payments
/admin
```

### Booking APIs

The supplied implementation includes operations for:

- Creating a booking
- Getting a parent's bookings
- Getting provider bookings
- Getting booking details
- Cancelling a pending booking
- Approving a booking
- Rejecting a booking

Example route patterns include:

```text
POST   /bookings
GET    /bookings/my-bookings
PATCH  /bookings/cancel/:id
GET    /bookings/provider
PATCH  /bookings/approve/:id
PATCH  /bookings/reject/:id
GET    /bookings/:id
```

### Caregiver APIs

```text
GET    /caregivers
GET    /caregivers/provider
POST   /caregivers
PUT    /caregivers/:id
DELETE /caregivers/:id
GET    /caregivers/:id
```

### Admin APIs

The admin service includes dashboard, user, provider, center, booking, subscription, payment, and reporting operations.

Examples include:

```text
GET   /admin/dashboard
GET   /admin/users
GET   /admin/users/:id
PATCH /admin/users/:id/status
GET   /admin/providers
GET   /admin/centers
GET   /admin/bookings
GET   /admin/subscriptions
GET   /admin/payments
```

All admin operations are protected by authentication and admin-role middleware.

---

## 💰 Booking Amount Calculation

The booking controller calculates the amount based on the selected plan:

```text
Hourly  → monthlyFee / 160
Daily   → monthlyFee / 30
Monthly → monthlyFee
```

The calculated amount is stored with the booking and later used by the payment flow.

---

## 💳 Payment Verification

The backend verifies Razorpay payments using the Razorpay order ID, payment ID, and signature.

The verification process uses an HMAC SHA-256 signature generated from:

```text
razorpay_order_id|razorpay_payment_id
```

A successfully verified payment is marked:

```text
Success
```

For booking payments, the related booking is updated to:

```text
Paid
```

For subscription payments, the supplied implementation creates an active subscription record after successful verification.

---

## ⚙️ Environment Variables

### Backend

Create:

```text
backend/.env
```

The supplied `.env.example` contains these variables:

```env
PORT=

MONGODB_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=
ADMIN_URL=
```

The payment implementation additionally reads Razorpay credentials:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

> Never commit real secrets, API keys, database credentials, JWT secrets, or Razorpay secret keys to Git.

### Frontend

Create:

```text
frontend/.env
```

The supplied frontend configuration uses:

```env
VITE_API_URL=https://little-steps-trusted-24-7-childcare.vercel.app/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

For local development, `VITE_API_URL` should point to the local backend API.

---

## 🚀 Installation & Local Development

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Little-Steps-Trusted-24-7-Childcare-Platform
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` and configure MongoDB, JWT, Cloudinary, Razorpay, and client/admin URLs.

Start the development server:

```bash
npm run dev
```

The backend package provides:

```bash
npm run dev
npm start
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Configure:

```env
VITE_API_URL=<backend-api-url>/api
VITE_RAZORPAY_KEY_ID=<razorpay-key-id>
```

Start Vite:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

---

## ☁️ Deployment

### Backend

The supplied backend contains a Vercel configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

The backend `src/index.js` initializes the database connection for the serverless request handler.

### Frontend

The frontend is configured as a Vite application and can be deployed to a static hosting platform supporting Vite builds.

Production build command:

```bash
npm run build
```

Output directory:

```text
dist/
```

---

## 🗄️ Database Models

The backend contains these primary Mongoose models:

```text
User
Provider
Center
Caregiver
Booking
Subscription
Payment
```

### User

Supported roles:

```text
parent
provider
admin
```

Supported account states:

```text
active
blocked
pending
```

### Subscription

Supported subscription statuses:

```text
Pending
Active
Expired
Cancelled
```

The supplied subscription model supports:

```text
Monthly
Quarterly
Yearly
```

---

## 🎨 UI & Design System

The frontend uses a warm childcare-oriented visual language.

Primary theme values in the supplied stylesheet include:

```text
Primary:   #FF9500
Secondary: #FFAA00
Accent:    #FFC300
```

The application also supports a dark theme.

The frontend uses:

- Rounded cards
- Responsive layouts
- Animated sections
- Toast notifications
- Responsive dashboards
- Modal/dialog interfaces
- Search/filter interfaces
- Charts for administrative reporting

---

# 📸 Screenshots

## Landing Page

![Landing Page](https://res.cloudinary.com/drwflyyk/image/upload/v1786779327/screencapture-little-steps-trusted-24-7-childcare-onrender-2026-08-14-23_47_16.png)

---

## 🔐 Authentication

### Parent Registration / Login

![Parent Login](https://res.cloudinary.com/drwflyyk/image/upload/v1786779296/parent-Login-page.png)

### Provider Registration

![Provider Registration](https://res.cloudinary.com/drwflyyk/image/upload/v1786779298/Provider-register.png)

### Login

![Login](https://res.cloudinary.com/drwflyyk/image/upload/v1786779295/Login-page.png)

---

# 👨‍👩‍👧 Parent Screens

### Parent Dashboard

![Parent Dashboard](https://res.cloudinary.com/drwflyyk/image/upload/v1786777974/Parents-Dashboard.png)

### My Bookings

![Parent Bookings](https://res.cloudinary.com/drwflyyk/image/upload/v1786777973/Parents-bookings.png)

### Browse Centers

![Browse Centers](https://res.cloudinary.com/drwflyyk/image/upload/v1786777976/Parents-Browsing_centers.png)

### Center Details

![Center Details](https://res.cloudinary.com/drwflyyk/image/upload/v1786777978/Centers-details.png)

### Booking Form

![Booking Now](https://res.cloudinary.com/drwflyyk/image/upload/v1786778822/Parents-booking-now.jpg)

---

# 💳 Parent Payment Flow

### Pay Now

![Pay Now](https://res.cloudinary.com/drwflyyk/image/upload/v1786778793/0_My-booking-paynow_button.jpg)

### Razorpay Checkout

![Razorpay Payment](https://res.cloudinary.com/drwflyyk/image/upload/v1786778793/1_Razorpay-payments.jpg)

### OTP

![Payment OTP](https://res.cloudinary.com/drwflyyk/image/upload/v1786778793/2_otp.jpg)

### Bank Acceptance

![Bank Acceptance](https://res.cloudinary.com/drwflyyk/image/upload/v1786778794/3_accepts.jpg)

### Payment Confirmation

![Payment Confirmation](https://res.cloudinary.com/drwflyyk/image/upload/v1786778795/4_success.jpg)

### Successful Payment

![Payment Success](https://res.cloudinary.com/drwflyyk/image/upload/v1786778797/5_payments_-success-and_paid.jpg)

---

# 🏢 Provider Screens

### Provider Dashboard

![Provider Dashboard](https://res.cloudinary.com/drwflyyk/image/upload/v1786778048/Providers-dashboards.png)

### My Centers

![Provider Centers](https://res.cloudinary.com/drwflyyk/image/upload/v1786778045/My-centers.png)

### Caregivers

![Provider Caregivers](https://res.cloudinary.com/drwflyyk/image/upload/v1786778047/Providers-Caregvers-table.png)

### Caregiver Details

![Caregiver Details](https://res.cloudinary.com/drwflyyk/image/upload/v1786778044/Caregivers-details.png)

### Parent Bookings

![Provider Bookings](https://res.cloudinary.com/drwflyyk/image/upload/v1786778043/Bookings.png)

### Booking Details

![Provider Booking Details](https://res.cloudinary.com/drwflyyk/image/upload/v1786778042/Booking-details.png)

---

# 🛡️ Admin Screens

### Admin Dashboard

![Admin Dashboard](https://res.cloudinary.com/drwflyyk/image/upload/v1786779191/Admin-dashboard.png)

### Users

![Admin Users](https://res.cloudinary.com/drwflyyk/image/upload/v1786779192/admin-user-dashboard.png)

### Providers

![Admin Providers](https://res.cloudinary.com/drwflyyk/image/upload/v1786779191/Admin-provider-dashboard.png)

### Centers

![Admin Centers](https://res.cloudinary.com/drwflyyk/image/upload/v1786779189/Admin-centers-dashboard.png)

### Center Bookings

![Admin Center Bookings](https://res.cloudinary.com/drwflyyk/image/upload/v1786779189/Admin-centers-booking.png)

### Payments

![Admin Payments](https://res.cloudinary.com/drwflyyk/image/upload/v1786779193/Admin-user-payments.png)

---

## 🧪 Testing Checklist

Before deployment, verify the following:

### Authentication

- [ ] Parent registration works
- [ ] Provider registration works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes reject unauthenticated requests
- [ ] Blocked users cannot access protected functionality
- [ ] Pending providers cannot access provider functionality before approval

### Parent

- [ ] Centers load correctly
- [ ] Center details load correctly
- [ ] Caregivers load correctly
- [ ] Booking creation works
- [ ] Booking cancellation works
- [ ] Payment flow works
- [ ] Payment verification works
- [ ] Subscription flow works

### Provider

- [ ] Provider dashboard loads
- [ ] Center creation works
- [ ] Center update/delete works
- [ ] Caregiver creation works
- [ ] Caregiver image upload works
- [ ] Caregiver update/delete works
- [ ] Booking approval works
- [ ] Booking rejection works

### Admin

- [ ] Dashboard statistics load
- [ ] Users can be viewed
- [ ] User status can be updated
- [ ] Providers can be approved/rejected
- [ ] Centers can be viewed
- [ ] Center status can be updated
- [ ] Bookings can be viewed
- [ ] Subscriptions can be viewed
- [ ] Payments can be viewed
- [ ] Reports load correctly

### Deployment

- [ ] Environment variables configured
- [ ] MongoDB connection works
- [ ] Cloudinary credentials configured
- [ ] Razorpay credentials configured
- [ ] Frontend API URL configured
- [ ] CORS origins configured
- [ ] Production cookies work with HTTPS
- [ ] Production payment verification works

---

## 🔐 Security Notes

- Do not commit `.env` files.
- Keep `JWT_SECRET` private.
- Keep `RAZORPAY_KEY_SECRET` private.
- Keep Cloudinary API secrets private.
- Use HTTPS in production.
- Keep authentication cookies HTTP-only.
- Configure production CORS with trusted origins.
- Never expose backend secrets through frontend `VITE_*` variables.

Only public client-side values such as a Razorpay key ID should be exposed to the frontend.

---

## 📝 Important Source-Code Notes

This README is based on the supplied project source material and screenshots. It intentionally does not invent deployment credentials, administrator email addresses, administrator passwords, database credentials, or API secrets because those values were not provided as verified project information.

The source contains some naming inconsistencies/typos in existing files (for example, `cloudinaryUplaod.js` and some historical route/status code). This README documents the supplied implementation rather than silently modifying or correcting the source code.

---

## 👨‍💻 Author

**md abdul bari**

Repository/project name:

```text
Little-Steps-Trusted-24-7-Childcare-Platform
```

---

## 📄 License

The supplied backend `package.json` identifies the project license as:

```text
ISC
```

---

## ⭐ Project Summary

**Little Steps — Trusted 24/7 Childcare Platform** combines childcare discovery, provider management, caregiver management, bookings, subscriptions, online payments, authentication, cloud image storage, and administrative reporting into one role-based web platform.

```text
Parent
  ↓
Discover Center
  ↓
View Details
  ↓
Create Booking
  ↓
Provider Reviews Booking
  ↓
Booking Approved
  ↓
Razorpay Payment
  ↓
Payment Verification
  ↓
Booking / Subscription Updated
```
