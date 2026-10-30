import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

import { Button } from "@/components/ui/button";

const ParentProfile = () => {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
          My Profile
        </h1>

        <p className="mt-2" style={{ color: colors.textMuted }}>
          View and manage your account information.
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-3xl p-8 shadow-lg"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderAccent}`,
        }}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Full Name
            </p>

            <h2
              className="mt-2 text-xl font-semibold"
              style={{ color: colors.text }}
            >
              {user?.name}
            </h2>
          </div>

          <div>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Email
            </p>

            <h2
              className="mt-2 text-xl font-semibold break-all"
              style={{ color: colors.text }}
            >
              {user?.email}
            </h2>
          </div>

          <div>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Role
            </p>

            <h2
              className="mt-2 text-xl font-semibold capitalize"
              style={{ color: colors.text }}
            >
              {user?.role}
            </h2>
          </div>

          <div>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Account Status
            </p>

            <h2
              className="mt-2 text-xl font-semibold capitalize"
              style={{ color: colors.text }}
            >
              {user?.status || "Active"}
            </h2>
          </div>

          <div>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Approval
            </p>

            <h2
              className="mt-2 text-xl font-semibold"
              style={{ color: colors.text }}
            >
              {user?.isApproved ? "Approved" : "Pending"}
            </h2>
          </div>
        </div>

        <div className="mt-10">
          <Button asChild className="text-white">
            <Link to="/parent/profile/edit">Edit Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;
