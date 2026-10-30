# 🌈 Little Steps — Trusted 24×7 Childcare Platform

<p align="center">
  <strong>Making childcare discovery and management simpler, more accessible, and convenient.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Runtime-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?logo=cloudinary&logoColor=white" />
</p>

---

## 📌 1. Project Overview

**Little Steps — Trusted 24×7 Childcare Platform** is a web-based childcare management system developed to make childcare discovery and management more accessible, organized, and convenient.

The platform aims to connect parents with childcare centers and caregivers while providing dedicated dashboards for parents, childcare providers, and administrators.

The project follows a full-stack architecture with separate frontend and backend applications.

### 👥 Primary User Roles

- 👨‍👩‍👧 **Parent:** Discovers childcare centers, views center and caregiver information, creates bookings, and manages bookings and subscriptions.
- 🏢 **Provider:** Manages provider information, childcare centers, caregivers, and incoming booking requests.
- 🛡️ **Admin:** Manages users, providers, centers, bookings, subscriptions, and platform operations.
- 🌐 **Guest:** Can access public pages and authentication screens.

---

## 🎯 2. Problem Statement

Childcare services are often managed through phone calls, personal references, and offline communication. This can make it difficult for parents to find suitable childcare services, understand availability, and compare available options.

Common challenges include:

- Limited visibility into childcare center information.
- Difficulty finding suitable childcare services.
- Lack of convenient online booking management.
- Limited transparency in caregiver and provider information.
- Fixed childcare arrangements that may not suit working parents and shift-based schedules.
- Manual management of childcare center operations.

Little Steps aims to address these challenges through a centralized digital platform for childcare discovery and management.

---

## 🚀 3. Project Objectives

### 🎯 Primary Objectives

- Develop a digital platform for childcare services.
- Allow parents to discover and explore childcare centers.
- Support childcare booking management.
- Provide dedicated dashboards for parents, providers, and administrators.
- Organize provider, caregiver, and center information.
- Support childcare availability and subscription management.

### 💡 Secondary Objectives

- Improve the accessibility of childcare information.
- Simplify communication and booking-related workflows.
- Support flexible childcare arrangements.
- Improve the organization of childcare center operations.
- Provide a foundation for future expansion across cities and regions.

---

## ✨ 4. Key Features

### 👨‍👩‍👧 4.1 Parent Module

The parent module provides functionality for users to:

- Register and log in.
- Access a protected parent dashboard.
- Browse available childcare centers.
- View individual childcare center details.
- Browse caregiver information.
- Create childcare booking requests.
- View booking history.
- View individual booking details.
- Cancel eligible pending bookings.
- Manage subscriptions.
- Manage parent profile information.

### 🏢 4.2 Childcare Provider Module

The provider module supports childcare providers in managing their services.

Features include:

- Provider registration.
- Provider approval workflow.
- Provider dashboard.
- Provider profile management.
- Childcare center creation and management.
- Editing and deleting provider centers.
- Caregiver management.
- Caregiver profile image uploads.
- Viewing caregiver details.
- Viewing parent booking requests.
- Approving or rejecting booking requests.
- Viewing booking details.

### 🛡️ 4.3 Admin Module

The administration module provides centralized management functionality.

Features include:

- Dashboard statistics.
- User management.
- Provider management.
- Provider approval and rejection.
- Childcare center management.
- Center status management.
- Booking management.
- Booking status filtering.
- Subscription management.
- Subscription status filtering.
- Platform reporting and overview statistics.

### 🖼️ 4.4 Image and Media Management

The application uses Cloudinary for media storage.

The backend includes:

- Cloudinary configuration.
- Multer upload middleware.
- Cloudinary storage integration.
- Upload utility functions.

Media uploads support relevant childcare center and caregiver profile images.

### 🔐 4.5 Authentication and Authorization

The application uses role-based authentication and authorization.

The authentication implementation includes:

- JSON Web Tokens (JWT).
- HTTP-only authentication cookies.
- bcrypt password hashing.
- Authentication middleware.
- Role-based authorization middleware.
- Protected routes.
- Guest routes.
- Provider approval checks.
- Blocked-account checks.

Supported user roles:

- `parent`
- `provider`
- `admin`

---

## 📂 5. Project Scope

### ✅ In Scope

The project focuses on:

- A responsive web application.
- Parent, provider, and administrator dashboards.
- User registration and authentication.
- Childcare center discovery and management.
- Caregiver information management.
- Booking management.
- Availability-related management.
- Subscription management.
- Provider approval workflows.
- Administrative operations and reporting.

### 🚧 Out of Scope

The following are outside the current implementation scope or are intended for future development:

- Native Android and iOS applications.
- Live CCTV streaming.
- Medical emergency integrations.
- Online payment processing and payment gateway integration.
- Advanced emergency childcare integrations.

---

## 🧰 6. Technology Stack

The following technologies are identified in the supplied project documentation.

### 💻 Frontend

| Technology | Purpose |
|---|---|
| React 19 | User interface development |
| Vite | Development and build tooling |
| React Router | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | API communication |
| React Hook Form | Form handling |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Icons | Additional icons |
| Recharts | Administrative charts |
| Sonner | Toast notifications |
| Shadcn/UI | Reusable UI components |
| js-cookie | Client-side cookie utilities |

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | Backend REST API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Cookie Parser | Cookie handling |
| CORS | Cross-origin request handling |
| Multer | File upload handling |
| Cloudinary | Image and media storage |
| multer-storage-cloudinary | Cloudinary upload integration |
| Validator | Input validation |
| dotenv | Environment configuration |

---

## 🏗️ 7. High-Level System Architecture

The application follows a client-server architecture.

```text
              ┌──────────────────────────┐
              │      React Frontend      │
              │    Vite + Tailwind CSS   │
              └────────────┬─────────────┘
                           │
                         Axios
                           │
                           ▼
              ┌──────────────────────────┐
              │     Express Backend     │
              │        REST APIs         │
              └────────────┬─────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌──────────────┐          ┌──────────────┐
       │   MongoDB    │          │  Cloudinary  │
       │  + Mongoose  │          │ Media Storage│
       └──────────────┘          └──────────────┘
```

### 🔍 Architecture Components

- **Frontend:** Provides the user interface and communicates with the backend through HTTP requests.
- **Backend:** Handles application logic, authentication, authorization, and API requests.
- **Database:** Stores user, provider, center, caregiver, booking, and subscription information.
- **Cloudinary:** Stores supported uploaded images and media.

---

## 📁 8. Project Structure

The project contains separate frontend and backend applications.

```text
Little-Steps-Trusted-24-7-Childcare-Platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── caregiverController.js
│   │   │   ├── centerController.js
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

*Note: This structure is based on the project structure supplied for documentation. Individual files and folders may change as development continues.*

---

## 🔑 9. Authentication Flow

### 📝 Registration

Backend registration endpoint:

```http
POST /auth/register
```

Parents can register using their account information.

Provider registration additionally supports provider-related information, including:

- Phone number.
- Address.
- Qualification.
- Experience.
- Government identification information.
- Profile image.

Provider accounts follow an approval workflow.

### 🔐 Login

Backend login endpoint:

```http
POST /auth/login
```

The authentication process includes:

1. Validating the submitted email and password.
2. Finding the corresponding user account.
3. Comparing the password using bcrypt.
4. Checking account status.
5. Checking provider approval status where applicable.
6. Generating a JWT.
7. Storing the authentication token in an HTTP-only cookie.
8. Returning authenticated user information.

### 🔗 Additional Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/auth/me` | Retrieve current authenticated user |
| POST | `/auth/logout` | Log out the user |
| PUT | `/auth/profile` | Update user profile |

---

## 🛡️ 10. Role-Based Access

The application separates functionality according to user roles.

### 🌐 Guest

- Public landing page.
- Login.
- Registration.

### 👨‍👩‍👧 Parent

- Dashboard.
- Childcare centers.
- Caregivers.
- Bookings.
- Subscriptions.
- Profile management.

### 🏢 Provider

- Dashboard.
- Center management.
- Caregiver management.
- Booking management.
- Provider profile.

### 🛡️ Admin

- Dashboard.
- User management.
- Provider management.
- Center management.
- Booking management.
- Subscription management.
- Reports.

Protected operations use authentication and role-based middleware.

---

## 🔌 11. Main API Modules

The backend organizes its APIs into the following modules:

| API Route | Purpose |
|---|---|
| `/auth` | Registration, login, logout, and authentication |
| `/users` | User-related operations |
| `/bookings` | Booking management |
| `/caregivers` | Caregiver management |
| `/centers` | Childcare center management |
| `/providers` | Provider-related operations |
| `/subscriptions` | Subscription management |
| `/admin` | Administrative operations |

### 📅 Booking APIs

The supplied README describes the following booking operations:

| Method | Example Endpoint | Purpose |
|---|---|---|
| POST | `/bookings` | Create a booking |
| GET | `/bookings/my-bookings` | Retrieve parent bookings |
| PATCH | `/bookings/cancel/:id` | Cancel an eligible booking |
| GET | `/bookings/provider` | Retrieve provider bookings |
| PATCH | `/bookings/approve/:id` | Approve a booking |
| PATCH | `/bookings/reject/:id` | Reject a booking |
| GET | `/bookings/:id` | Retrieve booking details |

### 👶 Caregiver APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/caregivers` | Retrieve caregivers |
| GET | `/caregivers/provider` | Retrieve provider caregivers |
| POST | `/caregivers` | Create a caregiver |
| PUT | `/caregivers/:id` | Update a caregiver |
| DELETE | `/caregivers/:id` | Delete a caregiver |
| GET | `/caregivers/:id` | Retrieve caregiver details |

### ⚙️ Admin APIs

The administrative service includes operations for dashboard statistics, users, providers, centers, bookings, subscriptions, and reports.

Example endpoints:

```http
GET   /admin/dashboard
GET   /admin/users
GET   /admin/users/:id
PATCH /admin/users/:id/status
GET   /admin/providers
GET   /admin/centers
GET   /admin/bookings
GET   /admin/subscriptions
```

Administrative operations are intended to be protected by authentication and administrator-role authorization.

---

## 🗄️ 12. Database Models

The backend uses Mongoose models to organize application data.

The primary models listed in the supplied project documentation are:

| Model | Purpose |
|---|---|
| User | Stores user account information and roles |
| Provider | Stores childcare provider information |
| Center | Stores childcare center details |
| Caregiver | Stores caregiver information |
| Booking | Stores childcare booking information |
| Subscription | Stores subscription information |

### 👤 User Roles

The User model supports:

- `parent`
- `provider`
- `admin`

### 📊 Account States

The supplied documentation identifies the following account states:

- `active`
- `blocked`
- `pending`

### 📆 Subscription Information

The supplied subscription documentation identifies these subscription statuses:

- Pending
- Active
- Expired
- Cancelled

Subscription plan durations described in the existing documentation include:

- Monthly
- Quarterly
- Yearly

---

## ⚙️ 13. Environment Variables

Environment variables should be configured separately for the backend and frontend.

### 🔧 Backend

Create a `.env` file inside the `backend/` directory.

The supplied `.env.example` identifies the following configuration variables:

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

### 💻 Frontend

Create a `.env` file inside the `frontend/` directory.

Configure the backend API URL:

```env
VITE_API_URL=<backend-api-url>/api
```

For local development, configure this variable to point to the locally running backend API.

> 🔒 **Security reminder:** Never commit real environment variables, database credentials, JWT secrets, or Cloudinary API secrets to Git.

---

## 🚀 14. Installation and Local Development

### 📋 Prerequisites

Install the following before running the application:

- Node.js.
- npm.
- MongoDB connection.
- Cloudinary account and credentials for supported media uploads.

### 1️⃣ Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd Little-Steps-Trusted-24-7-Childcare-Platform
```

### 2️⃣ Step 2: Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create `backend/.env` and configure the required environment variables.

Start the backend development server:

```bash
npm run dev
```

The backend package also provides:

```bash
npm start
```

### 3️⃣ Step 3: Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Configure the frontend environment:

```env
VITE_API_URL=<backend-api-url>/api
```

Start the frontend development server:

```bash
npm run dev
```

### 4️⃣ Step 4: Production Build

Build the frontend:

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

## ☁️ 15. Deployment

### 🖥️ Backend

The supplied backend project includes a Vercel configuration.

The configuration identifies the backend entry point as:

```text
src/index.js
```

The backend entry point initializes the database connection for the serverless request handler.

### 🌐 Frontend

The frontend is configured as a Vite application.

It can be deployed to a static hosting platform that supports Vite production builds.

Production build command:

```bash
npm run build
```

Output directory:

```text
dist/
```

The frontend must be configured with the correct deployed backend API URL.

---

## 🎨 16. UI and Design System

The frontend uses a warm, childcare-oriented visual style.

The supplied stylesheet identifies the following primary theme values:

| Theme Element | Color |
|---|---|
| 🟠 Primary | `#FF9500` |
| 🟡 Secondary | `#FFAA00` |
| 🟨 Accent | `#FFC300` |

The application also supports a dark theme.

The documented interface elements include:

- Rounded cards.
- Responsive layouts.
- Animated sections.
- Toast notifications.
- Responsive dashboards.
- Modal and dialog interfaces.
- Search and filter interfaces.
- Administrative charts and reporting components.

---

## 📝 17. Functional Requirements and Future Development

The original Product Requirements Document (PRD) describes the broader intended scope of Little Steps.

The following requirements should be treated as planned capabilities unless their implementation has been separately verified.

### 👨‍👩‍👧 Parent-Side Requirements

- Search for nearby daycare and crèche centers.
- Filter by availability, age group, timings, pricing, and plans.
- View center photos, infrastructure, caregiver profiles, safety measures, and certifications.
- Support hourly, daily, and monthly childcare booking arrangements.
- Receive booking-related notifications.
- View booking history.

### 🏢 Provider-Side Requirements

- Manage center operating hours and availability.
- Manage caregiver profiles and center information.
- Configure hourly, daily, and monthly pricing plans.
- Manage center capacity and schedules.
- Review booking requests.
- View earnings and booking analytics.

### 🛡️ Admin-Side Requirements

- Review provider and parent information.
- Verify submitted documents and certifications.
- Manage service categories and age groups.
- Monitor bookings and disputes.
- Manage platform content and safety policies.
- View platform analytics and reports.

### 💡 Additional Planned Capabilities

- Advanced childcare search and filtering.
- More detailed safety and verification workflows.
- Improved availability tracking.
- Expanded notifications.
- Multi-city support.

---

## 📈 18. Non-Functional Requirements

The original PRD identifies the following non-functional requirements.

### ⚡ Performance

- Target page load time under three seconds.

### 🔐 Security

- Secure authentication.
- Encrypted data.
- Role-based access control.
- Protected application routes.

### 📱 Usability

- Simple and parent-friendly interface.
- Responsive, mobile-first design.
- Easy navigation.

### 🔄 Reliability

- Accurate availability management.
- Reduced risk of booking conflicts and overbooking.

### 🌍 Scalability

- Modular application architecture.
- Support for future expansion across multiple cities and regions.

*These are project requirements and targets, not claims that every target has already been measured or achieved.*

---

## 🧪 19. Testing Checklist

The following checklist can be used to verify the application.

### 🔐 Authentication

- [ ] Parent registration works.
- [ ] Provider registration works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Protected routes reject unauthenticated requests.
- [ ] Blocked users cannot access protected functionality.
- [ ] Pending providers cannot access restricted provider functionality before approval.

### 👨‍👩‍👧 Parent

- [ ] Childcare centers load correctly.
- [ ] Center details load correctly.
- [ ] Caregiver information loads correctly.
- [ ] Booking creation works.
- [ ] Booking cancellation works for eligible bookings.
- [ ] Booking history loads correctly.
- [ ] Subscription information loads correctly.

### 🏢 Provider

- [ ] Provider dashboard loads.
- [ ] Center creation works.
- [ ] Center update and deletion work.
- [ ] Caregiver creation works.
- [ ] Caregiver image upload works.
- [ ] Caregiver update and deletion work.
- [ ] Booking approval works.
- [ ] Booking rejection works.

### 🛡️ Admin

- [ ] Dashboard statistics load.
- [ ] Users can be viewed.
- [ ] User status can be updated.
- [ ] Providers can be approved or rejected.
- [ ] Centers can be viewed.
- [ ] Center status can be updated.
- [ ] Bookings can be viewed.
- [ ] Subscriptions can be viewed.
- [ ] Reports load correctly.

### ☁️ Deployment

- [ ] Environment variables are configured.
- [ ] MongoDB connection works.
- [ ] Cloudinary credentials are configured.
- [ ] Frontend API URL is correct.
- [ ] CORS origins are configured.
- [ ] Production authentication cookies work over HTTPS.

---

## 🔒 20. Security Notes

- Do not commit `.env` files.
- Keep `JWT_SECRET` private.
- Keep Cloudinary API secrets private.
- Use HTTPS in production.
- Keep authentication cookies HTTP-only.
- Configure production CORS with trusted origins.
- Never expose backend secrets through frontend `VITE_*` variables.
- Restrict protected operations through authentication and role-based authorization.

---

## 📌 21. Assumptions and Constraints

### 💭 Assumptions

- Childcare providers will share valid information and documents.
- Parents may prefer convenient digital childcare discovery and booking.
- Stakeholder feedback will be available during development.
- Childcare providers will maintain accurate center and caregiver information.

### ⚠️ Constraints

- Compliance with applicable childcare safety regulations.
- Fixed development timeline.
- Limited scope during the initial development phase.
- Dependence on third-party services for selected application functionality.

---

## 🔮 22. Future Enhancements

The original PRD identifies the following possible future improvements:

- 📱 Native Android and iOS applications.
- 📹 Live CCTV access for parents.
- 🚑 Emergency medical support integration.
- 🤖 AI-based caregiver recommendations.
- 💳 Online payment processing and refunds.
- 🔎 Expanded childcare discovery and filtering.
- 📊 Improved provider analytics.
- 🌍 Additional city and regional support.

Online payments and refunds are future enhancements and are not documented as currently implemented functionality.

---

## 🌟 23. Expected Impact

Little Steps aims to contribute to a more organized and accessible childcare ecosystem by:

- Improving access to childcare information.
- Reducing the effort required to discover childcare services.
- Supporting working parents and families with flexible schedules.
- Helping childcare providers organize their operations.
- Improving transparency in childcare service management.
- Providing a foundation for a scalable childcare platform.

---

## 👨‍💻 24. Author

**Author:** Md Abdul Bari

**Project Name:** Little Steps — Trusted 24×7 Childcare Platform

**Repository Name:**

```text
Little-Steps-Trusted-24-7-Childcare-Platform
```

---

## 📄 25. License

The supplied backend `package.json` identifies the project license as:

**ISC License**

---

## 💛 26. Project Summary

Little Steps is a full-stack childcare management platform designed to bring parents, childcare providers, caregivers, and administrators together through a centralized web application.

The project focuses on childcare discovery, provider and center management, caregiver information, booking workflows, subscription management, authentication, cloud-based media storage, and administrative operations.

The platform is designed to provide a foundation for safer, more convenient, and more organized childcare service management while leaving advanced capabilities for future development.

---

<p align="center">
  <strong>🌈 Little Steps — Supporting Families, Simplifying Childcare. 💛</strong>
</p>
