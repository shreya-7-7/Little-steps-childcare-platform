import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  Clock3,
  CheckCircle,
  IndianRupee,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/common/Loading";
import Button from "@/components/common/Button";
import Reveal from "@/components/common/Reveal";
import Eyebrow from "@/components/common/Eyebrow";

import { useTheme } from "../../context/ThemeContext";

import { getDashboardStats } from "@/services/providerService";

const DashboardHome = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await getDashboardStats();

      setStats(data.stats);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const cards = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
    },
    {
      title: "Pending Bookings",
      value: stats?.pendingBookings ?? 0,
      icon: Clock3,
    },
    {
      title: "Completed Bookings",
      value: stats?.completedBookings ?? 0,
      icon: CheckCircle,
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats?.monthlyRevenue ?? 0}`,
      icon: IndianRupee,
    },
    {
      title: "Caregivers",
      value: stats?.totalCaregivers ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-10">
      <Reveal>
        <div
          className="overflow-hidden rounded-[30px] border p-8 lg:p-10"
          style={{
            background: "linear-gradient(135deg,#FF9500 0%,#FFC300 100%)",
            borderColor: "#FFB000",
          }}
        >
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <Eyebrow>Provider Dashboard</Eyebrow>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-[#241C0F]">
                Welcome back,
                <span className="ml-2">let's grow your childcare center.</span>
              </h1>

              <p className="mt-4 max-w-xl text-[15px] text-[#4D3C16]">
                Monitor bookings, caregivers, revenue and center performance
                from one beautiful dashboard.
              </p>

              <div className="mt-8">
                <Link to="/provider/bookings">
                  <Button icon={ArrowUpRight}>View Bookings</Button>
                </Link>
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="grid w-full max-w-md grid-cols-2 gap-4"
            >
              <div className="rounded-3xl bg-white/90 p-5">
                <p className="text-sm text-gray-500">Revenue</p>

                <h2 className="mt-2 text-3xl font-bold text-[#241C0F]">
                  ₹{stats?.totalRevenue ?? 0}
                </h2>
              </div>

              <div className="rounded-3xl bg-white/90 p-5">
                <p className="text-sm text-gray-500">Bookings</p>

                <h2 className="mt-2 text-3xl font-bold text-[#241C0F]">
                  {stats?.totalBookings ?? 0}
                </h2>
              </div>

              <div className="rounded-3xl bg-white/90 p-5">
                <p className="text-sm text-gray-500">Caregivers</p>

                <h2 className="mt-2 text-3xl font-bold text-[#241C0F]">
                  {stats?.totalCaregivers ?? 0}
                </h2>
              </div>

              <div className="rounded-3xl bg-white/90 p-5">
                <p className="text-sm text-gray-500">Completed</p>

                <h2 className="mt-2 text-3xl font-bold text-[#241C0F]">
                  {stats?.completedBookings ?? 0}
                </h2>
              </div>
            </motion.div>
          </div>
        </div>
      </Reveal>

      {/* Pending Booking Alerts */}
      {stats?.pendingBookings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50/80 p-5 dark:border-orange-900/50 dark:bg-orange-950/20"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                Pending Booking Requests
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                You have {stats.pendingBookings} pending booking request{stats.pendingBookings > 1 ? "s" : ""} awaiting your confirmation.
              </p>
            </div>
          </div>
          <Link
            to="/provider/bookings"
            className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
          >
            Review Bookings &rarr;
          </Link>
        </motion.div>
      )}

      {/* Stats */}

      <Reveal delay={0.1}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ title, value, icon: Icon }) => (
            <motion.div
              whileHover={{
                y: -5,
              }}
              key={title}
              className="rounded-3xl border p-6 transition-all"
              style={{
                background: colors.surface,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: colors.textMuted,
                    }}
                  >
                    {title}
                  </p>

                  <h2
                    className="mt-3 text-4xl font-bold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {value}
                  </h2>
                </div>

                <div className="rounded-2xl bg-orange-100 p-3">
                  <Icon className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* Summary */}

      <h2 className="mb-4 text-xl font-semibold">Center Summary</h2>
      <Reveal delay={0.2}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Booking Summary */}

          <div
            className="rounded-[28px] border p-7"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: colors.text,
              }}
            >
              Booking Summary
            </h2>

            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm"
                    style={{
                      color: colors.textMuted,
                    }}
                  >
                    Approved Bookings
                  </p>

                  <h3
                    className="mt-2 text-4xl font-bold"
                    style={{
                      color: colors.text,
                    }}
                  >
                    {stats?.approvedBookings ?? 0}
                  </h3>
                </div>

                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div
                className="border-t pt-6"
                style={{
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm"
                      style={{
                        color: colors.textMuted,
                      }}
                    >
                      Rejected Bookings
                    </p>

                    <h3
                      className="mt-2 text-4xl font-bold"
                      style={{
                        color: colors.text,
                      }}
                    >
                      {stats?.rejectedBookings ?? 0}
                    </h3>
                  </div>

                  <div className="rounded-full bg-red-100 p-4">
                    <Clock3 className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Overview */}

          <div
            className="rounded-[28px] border p-7"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: colors.text,
              }}
            >
              Quick Overview
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-5">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: colors.surfaceAlt,
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Total Revenue
                </p>

                <h3
                  className="mt-2 text-3xl font-bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  ₹{stats?.totalRevenue ?? 0}
                </h3>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  background: colors.surfaceAlt,
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Active Caregivers
                </p>

                <h3
                  className="mt-2 text-3xl font-bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {stats?.totalCaregivers ?? 0}
                </h3>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  background: colors.surfaceAlt,
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Pending
                </p>

                <h3
                  className="mt-2 text-3xl font-bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {stats?.pendingBookings ?? 0}
                </h3>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  background: colors.surfaceAlt,
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Completed
                </p>

                <h3
                  className="mt-2 text-3xl font-bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  {stats?.completedBookings ?? 0}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div>
        <Reveal delay={0.3}>
          <div
            className="rounded-[30px] border p-8"
            style={{
              background: colors.surface,
              borderColor: colors.border,
            }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Eyebrow>Little Steps</Eyebrow>

                <h2
                  className="text-3xl font-bold"
                  style={{
                    color: colors.text,
                  }}
                >
                  Keep Growing Your Childcare Business
                </h2>

                <p
                  className="mt-3 max-w-2xl"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Manage caregivers, bookings and revenue from one beautiful
                  dashboard experience.
                </p>
              </div>

              <Link to="/provider/center">
                <Button>Manage Center</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default DashboardHome;
