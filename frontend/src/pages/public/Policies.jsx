import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Search, ArrowRight, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/home/Footer";
import { getPublicPolicies } from "../../services/policyService";

const CATEGORIES = [
  "All",
  "Safety & Health",
  "Emergency Protocols",
  "Staff & Caregivers",
  "Platform Rules",
  "Billing & Cancellation",
  "General",
];

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPublicPolicies();
      setPolicies(res.policies || []);
    } catch (err) {
      console.error("Failed to load policies:", err);
      setError(err?.response?.data?.message || "Failed to load policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col font-sans text-neutral-800">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FFF5E6] to-[#FFFDF9] border-b border-[#F0E6D3] pt-14 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Childcare Safety & Compliance
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-4"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Safety Standards & Platform Policies
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Our commitment to child safety, caregiver vetting, and transparent childcare standards. All platform rules are publicly available and strictly enforced.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search safety standards, protocols, terms..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#E4D9C7] text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF9500] shadow-sm text-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white border border-[#E9DFCE] text-neutral-600 hover:bg-[#F9F4EC]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-[#F5ECE0] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-[#EADCC8] rounded w-1/3 mb-3" />
                  <div className="h-6 bg-[#EADCC8] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#EADCC8] rounded w-full mb-1" />
                  <div className="h-4 bg-[#EADCC8] rounded w-2/3" />
                </div>
                <div className="h-4 bg-[#EADCC8] rounded w-1/4 mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-800 mb-1">Unable to Load Policies</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPolicies}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPolicies.length === 0 && (
          <div className="bg-white border border-[#EFE5D5] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3
              className="text-xl font-bold text-neutral-800 mb-2"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              No Policies Found
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              {searchQuery || selectedCategory !== "All"
                ? "No published standards match your filter criteria. Try searching for a different keyword or category."
                : "Policies are currently being updated by the Little Steps safety administration. Please check back shortly."}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="px-5 py-2 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Policy Grid */}
        {!loading && !error && filteredPolicies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((p) => (
              <Link
                key={p._id || p.slug}
                to={`/policies/${p.slug}`}
                className="group flex flex-col justify-between bg-white border border-[#EBE2D3] hover:border-amber-400 rounded-2xl p-6 transition-all duration-200 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                      {p.category}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(p.updatedAt || p.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold text-neutral-900 group-hover:text-amber-700 transition-colors mb-2 line-clamp-2"
                    style={{ fontFamily: "Fraunces, serif" }}
                  >
                    {p.title}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {p.summary || "Click to view the full details of this Little Steps platform policy."}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F2EAE0] flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                  <span>Read Full Policy</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
