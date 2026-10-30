import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { brand } from "../../components/data/theme";

import Reveal from "../common/Reveal";
import Button from "../common/Button";
import HeroVisual from "./HeroVisual";
import SunArc from "../common/SunArc";

export default function HeroSection() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <section
      id="top"
      className="relative pt-16 pb-20 sm:pb-24 px-5 sm:px-8 overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full"
        style={{
          backgroundImage: `radial-gradient(circle, ${brand[200]}30, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 shadow-sm"
            style={{
              backgroundColor: colors.surface,
              color: brand[500],
              border: `1px solid ${colors.border}`,
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ backgroundColor: brand[500] }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: brand[500] }}
              />
            </span>
            Verified local childcare & early learning
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl leading-[1.12] font-bold mb-6 tracking-tight"
            style={{
              color: colors.text,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Trusted childcare,{" "}
            <span style={{ color: brand[500] }}>made simple</span> for families.
          </h1>

          <p
            className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
            style={{ color: colors.textMuted }}
          >
            Little Steps connects families with quality childcare centres and preschool
            programs. Discover local facilities, check real classroom availability, and
            request bookings with complete confidence.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate("/centers")}
            >
              Find care near you
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: brand[500] }} />
              <span>Real centre profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: brand[500] }} />
              <span>Direct online booking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: brand[500] }} />
              <span>Transparent fee details</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <HeroVisual />
        </Reveal>
      </div>

      <SunArc />
    </section>
  );
}
