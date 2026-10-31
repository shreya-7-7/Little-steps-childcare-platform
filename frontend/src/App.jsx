import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import Loading from "./components/common/Loading";
import RouteLoadingBar from "./components/common/RouteLoadingBar";

// Core immediate routes for fast initial landing & authentication
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

// Lazy-loaded Public Pages
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const PublicPolicies = lazy(() => import("./pages/public/Policies"));
const PolicyDetail = lazy(() => import("./pages/public/PolicyDetail"));

// Lazy-loaded Parent Pages & Layout
const ParentLayout = lazy(() => import("./components/parent/ParentLayout"));
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentProfile = lazy(() => import("./pages/parent/ParentProfile"));
const EditProfile = lazy(() => import("./pages/parent/EditProfile"));
const MatchingWizard = lazy(() => import("./pages/parent/MatchingWizard"));
const Centers = lazy(() => import("./pages/parent/Centers"));
const CenterDetails = lazy(() => import("./pages/parent/CenterDetails"));
const BookingForm = lazy(() => import("./pages/parent/BookingForm"));
const MyBookings = lazy(() => import("./pages/parent/MyBookings"));
const MySubscriptions = lazy(() => import("./pages/parent/MySubscriptions"));
const Payments = lazy(() => import("./pages/parent/Payments"));
const BookingDetails = lazy(() => import("./pages/parent/BookingDetails"));
const CaregiverDetails = lazy(() => import("./pages/parent/CaregiverDetails"));
const ParentCaregivers = lazy(() => import("./pages/parent/Caregivers"));
const MyDisputes = lazy(() => import("./pages/parent/MyDisputes"));

// Lazy-loaded Provider Pages & Layout
const Dashboard = lazy(() => import("./pages/provider/Dashboard"));
const DashboardHome = lazy(() => import("./pages/provider/DashboardHome"));
const MyCenter = lazy(() => import("./pages/provider/MyCenter"));
const Caregivers = lazy(() => import("./pages/provider/Caregivers"));
const CreateCaregiver = lazy(() => import("./pages/provider/CreateCaregivers"));
const EditCaregiver = lazy(() => import("./pages/provider/EditCaregiver"));
const Bookings = lazy(() => import("./pages/provider/Bookings"));
const Profile = lazy(() => import("./pages/provider/Profile"));
const EditProviderProfile = lazy(() => import("./pages/provider/EditProviderProfile"));
const ProviderBookingDetails = lazy(() => import("./pages/provider/BookingDetails"));
const ProviderCaregiverDetails = lazy(() => import("./pages/provider/CaregiverDetails"));
const CreateCenter = lazy(() => import("./pages/provider/CreateCenter"));
const ProviderCenterDetails = lazy(() => import("./pages/provider/CenterDetails"));
const EditCenter = lazy(() => import("./pages/provider/EditCenter"));

// Lazy-loaded Admin Pages & Layout (heaviest module with Recharts)
const AdminLayout = lazy(() => import("./components/admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdmnDashboardHome = lazy(() => import("./pages/admin/DashboardHome"));
const AdminProviders = lazy(() => import("./pages/admin/Providers"));
const AdminCenters = lazy(() => import("./pages/admin/Centers"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminDisputes = lazy(() => import("./pages/admin/Disputes"));
const AdminPolicies = lazy(() => import("./pages/admin/Policies"));

function App() {
  return (
    <Suspense fallback={<RouteLoadingBar />}>
      <Routes>
        {/* ================= Public Routes ================= */}

        <Route path="/" element={<Home />} />
        <Route path="/policies" element={<PublicPolicies />} />
        <Route path="/policies/:slug" element={<PolicyDetail />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/matching"
          element={
            <ProtectedRoute roles={["parent"]}>
              <MatchingWizard />
            </ProtectedRoute>
          }
        />

        {/* ================= Parent Portal & Services ================= */}

        <Route
          path="/parent"
          element={
            <ProtectedRoute roles={["parent"]}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="profile" element={<ParentProfile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="disputes" element={<MyDisputes />} />
          <Route path="matching" element={<MatchingWizard />} />
          <Route path="centers" element={<Centers />} />
          <Route path="centers/:slug" element={<CenterDetails />} />
          <Route path="caregivers" element={<ParentCaregivers />} />
          <Route path="caregivers/:id" element={<CaregiverDetails />} />
          <Route path="book/:slug" element={<BookingForm />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="my-subscriptions" element={<MySubscriptions />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="payments" element={<Payments />} />
        </Route>

        {/* Direct Parent Service Routes — Gated for authenticated parents */}
        <Route
          path="centers"
          element={
            <ProtectedRoute roles={["parent"]}>
              <Centers />
            </ProtectedRoute>
          }
        />
        <Route
          path="centers/:slug"
          element={
            <ProtectedRoute roles={["parent"]}>
              <CenterDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="caregivers"
          element={
            <ProtectedRoute roles={["parent"]}>
              <ParentCaregivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="caregivers/:id"
          element={
            <ProtectedRoute roles={["parent"]}>
              <CaregiverDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="book/:slug"
          element={
            <ProtectedRoute roles={["parent"]}>
              <BookingForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-bookings"
          element={
            <ProtectedRoute roles={["parent"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-subscriptions"
          element={
            <ProtectedRoute roles={["parent"]}>
              <MySubscriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="bookings/:id"
          element={
            <ProtectedRoute roles={["parent"]}>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="payments"
          element={
            <ProtectedRoute roles={["parent"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* ================= Provider ================= */}

        <Route
          path="/provider"
          element={
            <ProtectedRoute roles={["provider"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="center" element={<MyCenter />} />
          <Route path="center/create" element={<CreateCenter />} />
          <Route path="center/:id" element={<ProviderCenterDetails />} />
          <Route path="center/edit/:id" element={<EditCenter />} />

          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProviderProfile />} />

          <Route path="caregivers" element={<Caregivers />} />
          <Route path="caregivers/create" element={<CreateCaregiver />} />
          <Route path="caregivers/:id" element={<ProviderCaregiverDetails />} />
          <Route path="caregivers/edit/:id" element={<EditCaregiver />} />

          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<ProviderBookingDetails />} />
        </Route>

        {/* ================= Admin ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdmnDashboardHome />} />
          <Route path="dashboard" element={<AdmnDashboardHome />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="centers" element={<AdminCenters />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="policies" element={<AdminPolicies />} />
        </Route>

        {/* ================= 404 ================= */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
