import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Calendar,
  ChevronLeft,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  Share2,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/home/Footer";
import { getPublicPolicyBySlug } from "../../services/policyService";

export default function PolicyDetail() {
  const { slug } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPolicy = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPublicPolicyBySlug(slug);
        if (isMounted) {
          setPolicy(res.policy);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Policy fetch error:", err);
          setError(
            err?.response?.status === 404
              ? "This policy does not exist, has been removed, or is currently unpublished."
              : err?.response?.data?.message || "Failed to load policy. Please try again later."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchPolicy();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col font-sans text-neutral-800">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-amber-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Safety Standards & Policies
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-[#EBE2D3] rounded-3xl p-8 sm:p-12 animate-pulse shadow-sm">
            <div className="h-4 bg-[#EADCC8] rounded w-1/4 mb-4" />
            <div className="h-10 bg-[#EADCC8] rounded w-3/4 mb-6" />
            <div className="h-4 bg-[#EADCC8] rounded w-1/3 mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-[#EADCC8] rounded w-full" />
              <div className="h-4 bg-[#EADCC8] rounded w-full" />
              <div className="h-4 bg-[#EADCC8] rounded w-5/6" />
              <div className="h-4 bg-[#EADCC8] rounded w-4/5" />
            </div>
          </div>
        )}

        {/* Not Found / Error State */}
        {!loading && error && (
          <div className="bg-white border border-[#EFE5D5] rounded-3xl p-10 sm:p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2
              className="text-2xl font-bold text-neutral-900 mb-2"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Policy Not Found
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto mb-8 leading-relaxed">
              {error}
            </p>
            <Link
              to="/policies"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Published Policies
            </Link>
          </div>
        )}

        {/* Policy Content View */}
        {!loading && !error && policy && (
          <article className="bg-white border border-[#EBE2D3] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
            {/* Header info */}
            <div className="border-b border-[#F0E6D5] pb-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                    {policy.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Standard
                  </span>
                </div>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
                  title="Copy link to policy"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? "Link Copied!" : "Share"}
                </button>
              </div>

              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {policy.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  Effective Date:{" "}
                  {new Date(policy.updatedAt || policy.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Official Little Steps Compliance
                </span>
              </div>

              {/* Policy Summary Box */}
              {policy.summary && (
                <div className="mt-6 p-4 rounded-2xl bg-[#FFF9EE] border border-[#F5E6CC] text-amber-950 text-sm leading-relaxed font-medium">
                  <span className="font-bold block mb-1 text-xs uppercase tracking-wider text-amber-800">
                    Summary Overview
                  </span>
                  {policy.summary}
                </div>
              )}
            </div>

            {/* Main Policy Body */}
            <div className="prose prose-neutral max-w-none">
              <div className="text-neutral-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {policy.content}
              </div>
            </div>

            {/* Support / Dispute Footer Box */}
            <div className="mt-12 pt-8 border-t border-[#F0E6D5] bg-[#FDFBF7] -mx-6 sm:-mx-10 lg:-mx-12 -mb-6 sm:-mb-10 lg:-mb-12 p-6 sm:p-10 rounded-b-3xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">
                    Have questions about this policy?
                  </h4>
                  <p className="text-xs text-neutral-600">
                    If you have concerns about a childcare provider adhering to these standards, our team is here 24/7.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/parent/my-disputes"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition whitespace-nowrap shadow-sm"
                  >
                    File a Dispute
                  </Link>
                  <Link
                    to="/policies"
                    className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition whitespace-nowrap"
                  >
                    All Policies
                  </Link>
                </div>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
