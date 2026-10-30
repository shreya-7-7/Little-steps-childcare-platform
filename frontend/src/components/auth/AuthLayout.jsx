import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, ShieldCheck, Clock, Heart } from "lucide-react";

const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
    <defs>
      <linearGradient id="authLogoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#FF9500" />
        <stop offset="1" stopColor="#FFDD00" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="19" fill="url(#authLogoGrad)" />
    <path
      d="M14 26c0-5 3-8 6-8s6 3 6 8"
      stroke="#241C0F"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="20" cy="14" r="3.4" fill="#241C0F" />
  </svg>
);

const perks = [
  { icon: ShieldCheck, text: "7-point background verified caregivers" },
  { icon: Clock, text: "24x7 on-call support, every day of the year" },
  { icon: Heart, text: "Trusted by 12,400+ families" },
];

const AuthLayout = ({ title, subtitle, children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ls-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("ls-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFDF7] px-4 py-10 transition-colors duration-300 dark:bg-[#17130C]">
      {/* ambient glow — static, no animation loop, so it costs nothing on paint */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FFDD00]/20 blur-3xl dark:bg-[#FFAA00]/10" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#FF9500]/15 blur-3xl dark:bg-[#FF9500]/10" />

      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E1BE] text-[#241C0F] transition-colors hover:bg-[#FFF6E2] dark:border-[#3A2E17] dark:text-[#FFF6E2] dark:hover:bg-[#2A2210]"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[#F0E1BE] bg-white shadow-xl dark:border-[#3A2E17] dark:bg-[#211B10] md:grid-cols-2">
        {/* Left brand panel — desktop only */}
        <div
          className="relative hidden flex-col justify-between p-10 md:flex"
          style={{
            backgroundImage:
              "linear-gradient(160deg, #FF9500, #FFC300 55%, #FFEA00)",
          }}
        >
          <div>
            <div className="mb-8 flex items-center gap-2 text-lg font-bold text-[#241C0F]">
              <LogoMark />
              Little Steps
            </div>
            <h2
              className="mb-3 text-2xl font-semibold leading-snug text-[#241C0F]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Trusted childcare, awake when you are.
            </h2>
            <p className="text-sm text-[#241C0F]/80">
              Background-verified caregivers and licensed centers, available day
              or night.
            </p>
          </div>
          <div className="space-y-4">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70">
                  <p.icon className="h-4 w-4 text-[#241C0F]" />
                </div>
                <p className="text-sm font-medium text-[#241C0F]">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col justify-center p-8 sm:p-10"
        >
          <div className="mb-8 text-center md:text-left">
            <div className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-[#241C0F] dark:text-[#FFF6E2] md:hidden">
              <LogoMark />
              Little Steps
            </div>
            <h1
              className="text-2xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[#6B5D45] dark:text-[#C9B896]">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
