import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../../components/data/theme";
import { getFeaturedCenters } from "../../services/centerService";

export default function FeaturedCenters() {
  const { colors } = useTheme();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeaturedCenters();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.centers)
          ? data.centers
          : [];
      setCenters(list);
    } catch (err) {
      console.error("Failed to load featured centers:", err);
      setError("Unable to load featured centers at the moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <section
      id="centers"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.surfaceAlt }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <Reveal className="max-w-2xl">
            <Eyebrow>Featured centers</Eyebrow>

            <h2
              className="text-3xl sm:text-4xl font-semibold"
              style={{
                color: colors.text,
                fontFamily: "Fraunces, serif",
              }}
            >
              Licensed centers our families love.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Link
              to="/centers"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
              style={{ color: brand[500] }}
            >
              Browse all centers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-2xl overflow-hidden h-72 flex flex-col animate-pulse"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: colors.border }}
                />
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div
                    className="h-5 w-3/4 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                  <div
                    className="h-3 w-1/2 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                  <div className="flex gap-2 mt-auto">
                    <div
                      className="h-5 w-16 rounded-full"
                      style={{ backgroundColor: colors.border }}
                    />
                    <div
                      className="h-5 w-16 rounded-full"
                      style={{ backgroundColor: colors.border }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl p-8 text-center flex flex-col items-center justify-center border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <AlertCircle className="w-10 h-10 mb-3 text-amber-500" />
            <p className="text-sm font-medium mb-4" style={{ color: colors.text }}>
              {error}
            </p>
            <button
              onClick={fetchCenters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: brand[500],
                color: "#FFFFFF",
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        ) : centers.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center flex flex-col items-center justify-center border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <p className="text-base font-medium mb-2" style={{ color: colors.text }}>
              No featured centers available right now
            </p>
            <p className="text-xs mb-6 max-w-sm" style={{ color: colors.textMuted }}>
              Explore our full directory to discover verified and licensed childcare centers in your area.
            </p>
            <Link
              to="/centers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: brand[500],
                color: "#FFFFFF",
              }}
            >
              Explore All Centers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {centers.slice(0, 4).map((c, i) => {
              const name = c.centerName || c.name || "Childcare Center";
              const identifier = c.slug || c._id;
              const locationText = c.city
                ? c.state
                  ? `${c.city}, ${c.state}`
                  : c.city
                : "Verified Location";
              const ratingDisplay =
                c.rating && c.rating > 0 ? Number(c.rating).toFixed(1) : "New";
              const reviewsCount = c.reviewCount || 0;
              const tags =
                Array.isArray(c.facilities) && c.facilities.length > 0
                  ? c.facilities.slice(0, 2)
                  : c.is24Hours
                    ? ["24/7 Care", "Licensed"]
                    : ["Licensed Care", "Verified"];
              const imageUrl =
                c.thumbnail?.url ||
                c.centerImages?.[0]?.url ||
                "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80";

              return (
                <Reveal key={identifier} delay={(i % 4) * 0.07}>
                  <Link
                    to={`/centers/${identifier}`}
                    className="block group rounded-2xl overflow-hidden h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="h-32 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,.25), rgba(0,0,0,.05), transparent)",
                        }}
                      />

                      <span
                        className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm"
                        style={{
                          backgroundColor: colors.surface,
                          color: brand.ink,
                        }}
                      >
                        <Star
                          className="w-3 h-3 fill-current"
                          style={{ color: brand[500] }}
                        />
                        {ratingDisplay}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3
                        className="font-semibold mb-1 text-base group-hover:text-amber-600 transition-colors line-clamp-1"
                        style={{ color: colors.text }}
                      >
                        {name}
                      </h3>

                      <p
                        className="text-xs flex items-center gap-1 mb-3 line-clamp-1"
                        style={{ color: colors.textMuted }}
                      >
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>
                          {locationText}
                          {reviewsCount > 0 ? ` · ${reviewsCount} reviews` : ""}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: colors.surfaceAlt,
                              color: colors.textMuted,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
