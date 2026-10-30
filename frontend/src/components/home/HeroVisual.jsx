import { Building2 } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { brand } from "../data/theme";
import heroImg from "../../assets/hero-childcare.webp";

export default function HeroVisual() {
  const { colors } = useTheme();

  return (
    <div className="relative max-w-md mx-auto" style={{ aspectRatio: "4 / 5" }}>
      {/* Background ambient decorative card */}
      <div
        className="absolute inset-0 rounded-[2rem] transform rotate-1 scale-[1.02] opacity-70"
        style={{
          backgroundImage: `linear-gradient(145deg, ${brand[400]}, ${brand[200]})`,
        }}
      />

      {/* Main image container */}
      <div
        className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-xl"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        <img
          src={heroImg}
          alt="Children and educator playing with building blocks in a bright preschool classroom"
          className="w-full h-full object-cover select-none"
        />

        {/* Soft bottom gradient overlay for card readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-900/40 to-transparent pointer-events-none" />

        {/* Truthful platform highlight badge */}
        <div
          className="absolute left-5 right-5 bottom-5 rounded-2xl p-4 shadow-lg backdrop-blur-md"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.surfaceAlt }}
            >
              <Building2 className="w-5 h-5" style={{ color: brand[500] }} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>
                Childcare & Daycare Centres
              </p>
              <p className="text-xs truncate" style={{ color: colors.textMuted }}>
                Explore curriculum, capacity & book visits
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
