import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  CalendarDays,
  CreditCard,
  BadgeCheck,
  IndianRupee,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "../../components/common/Loading";
import { getDashboardStats } from "../../services/adminService";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useTheme } from "../../context/ThemeContext";
import { brand } from "../../components/data/theme";

const DashboardHome = () => {
  const { colors } = useTheme();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await getDashboardStats();

      setStats(response.stats);
    } catch (error) {
      console.error("Dashboard Error:", error);

      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!stats) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center rounded-3xl border p-8 text-center"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div>
          <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
            Failed to load dashboard statistics.
          </h2>

          <Button
            onClick={fetchDashboard}
            className="mt-5 rounded-xl"
            style={{
              backgroundColor: brand[500],
              color: brand.ink,
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers ?? 0,
      path: "/admin/users",
      icon: Users,
      accent: brand[500],
      soft: `${brand[500]}18`,
    },
    {
      title: "Providers",
      value: stats.totalProviders ?? 0,
      path: "/admin/providers",
      icon: BadgeCheck,
      accent: brand[400],
      soft: `${brand[400]}20`,
    },
    {
      title: "Centers",
      value: stats.totalCenters ?? 0,
      path: "/admin/centers",
      icon: Building2,
      accent: brand[300],
      soft: `${brand[300]}25`,
    },
    {
      title: "Bookings",
      value: stats.totalBookings ?? 0,
      path: "/admin/bookings",
      icon: CalendarDays,
      accent: brand[200],
      soft: `${brand[200]}35`,
    },
    {
      title: "Payments",
      value: stats.totalPayments ?? 0,
      path: "/admin/payments",
      icon: CreditCard,
      accent: brand[400],
      soft: `${brand[400]}20`,
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue ?? 0}`,
      path: "/admin/reports",
      icon: IndianRupee,
      accent: brand[500],
      soft: `${brand[500]}18`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${brand[500]}12`,
              borderColor: `${brand[500]}40`,
              color: brand[500],
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: brand[500] }}
            />
            Admin Dashboard
          </div>

          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Dashboard
          </h1>

          <p
            className="mt-2 max-w-2xl text-sm leading-6"
            style={{ color: colors.textMuted }}
          >
            Welcome back, Administrator. Here's a quick overview of your
            childcare platform.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchDashboard}
          className="w-fit rounded-xl px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* =====================================================
          OVERVIEW HERO
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <Card
          className="relative overflow-hidden rounded-3xl border-0"
          style={{
            background: `linear-gradient(135deg, ${brand[500]}, ${brand[300]}, ${brand[100]})`,
            boxShadow: `0 18px 45px ${brand[500]}20`,
          }}
        >
          {/* Decorative shapes */}

          <div
            className="absolute -right-16 -top-20 h-56 w-56 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.14)",
            }}
          />

          <div
            className="absolute -bottom-24 right-24 h-48 w-48 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
            }}
          />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  <BadgeCheck
                    className="h-6 w-6"
                    style={{ color: brand.ink }}
                  />
                </div>

                <h2
                  className="text-2xl font-bold sm:text-3xl"
                  style={{
                    color: brand.ink,
                    fontFamily: "Fraunces, serif",
                  }}
                >
                  Platform Overview
                </h2>

                <p
                  className="mt-2 max-w-xl text-sm leading-6"
                  style={{
                    color: `${brand.ink}CC`,
                  }}
                >
                  Keep track of your users, providers, childcare centers,
                  bookings and payment activity from one place.
                </p>
              </div>

              <div
                className="rounded-2xl border px-5 py-4 backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.28)",
                  borderColor: "rgba(255,255,255,0.35)",
                }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: `${brand.ink}B3` }}
                >
                  Total Revenue
                </p>

                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: brand.ink }}
                >
                  ₹{stats.revenue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.06,
              }}
              whileHover={{
                y: -5,
              }}
              className="h-full"
            >
              <Link to={card.path} className="block h-full">
                <Card
                className="group relative h-full overflow-hidden rounded-2xl border transition-all duration-300"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  boxShadow: `0 4px 18px ${colors.border}35`,
                }}
              >
                {/* Accent top line */}

                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    backgroundColor: card.accent,
                  }}
                />

                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left */}

                    <div className="space-y-4">
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: colors.textMuted,
                        }}
                      >
                        {card.title}
                      </p>

                      <div className="flex items-end gap-2">
                        <h2
                          className="text-3xl font-bold tracking-tight"
                          style={{
                            color: colors.text,
                          }}
                        >
                          {card.value}
                        </h2>

                        <ArrowUpRight
                          className="mb-1 h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{
                            color: card.accent,
                          }}
                        />
                      </div>
                    </div>

                    {/* Icon */}

                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: card.soft,
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{
                          color: card.accent,
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom accent */}

                  <div className="mt-7 flex items-center gap-2">
                    <div
                      className="h-1.5 w-8 rounded-full"
                      style={{
                        backgroundColor: card.accent,
                      }}
                    />

                    <div
                      className="h-1.5 flex-1 rounded-full"
                      style={{
                        backgroundColor: colors.surfaceAlt,
                      }}
                    />
                  </div>
                </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* =====================================================
          QUICK SUMMARY
      ====================================================== */}

      <Card
        className="overflow-hidden rounded-3xl"
        style={{
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        }}
      >
        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${brand[500]}20`,
                }}
              >
                <BadgeCheck
                  className="h-5 w-5"
                  style={{
                    color: brand[500],
                  }}
                />
              </div>

              <div>
                <h2
                  className="font-semibold"
                  style={{
                    color: colors.text,
                  }}
                >
                  Everything looks organized
                </h2>

                <p
                  className="mt-1 max-w-2xl text-sm leading-6"
                  style={{
                    color: colors.textMuted,
                  }}
                >
                  Monitor platform activity and keep your childcare operations
                  running smoothly from the admin dashboard.
                </p>
              </div>
            </div>

            <div
              className="h-2 w-full overflow-hidden rounded-full sm:w-32"
              style={{
                backgroundColor: `${brand[500]}20`,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${brand[500]}, ${brand[300]})`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardHome;
