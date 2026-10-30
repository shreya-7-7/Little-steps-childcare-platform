import { Building2, Heart, Clock } from "lucide-react";

import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../../components/data/theme";

export default function AboutSection() {
  const { colors } = useTheme();

  const pillars = [
    {
      icon: Building2,
      title: "Detailed Centre Profiles",
      body: "Explore transparent classroom information, curriculum details, operating hours, and facility photos in one directory.",
    },
    {
      icon: Heart,
      title: "Direct Provider Communication",
      body: "Submit specific care needs, age details, and emergency contacts directly to centre providers with clear status tracking.",
    },
    {
      icon: Clock,
      title: "Simple Online Scheduling",
      body: "Request daycare and preschool sessions, review clear fee breakdowns, and manage all confirmations from your family portal.",
    },
  ];

  return (
    <section
      id="about"
      className="py-20 sm:py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.surfaceAlt }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
        <Reveal>
          <Eyebrow>Our Mission</Eyebrow>

          <h2
            className="text-3xl sm:text-4xl font-bold mb-5 leading-tight tracking-tight"
            style={{
              color: colors.text,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Connecting families with trusted local childcare centres.
          </h2>

          <p
            className="leading-relaxed mb-6 text-base"
            style={{ color: colors.textMuted }}
          >
            Finding dependable, high-quality care for your child should be transparent
            and reassuring. Little Steps brings together verified local daycares,
            early learning centres, and preschool programs so parents can make informed
            choices and book care with complete confidence.
          </p>

          <p
            className="leading-relaxed text-sm"
            style={{ color: colors.textMuted }}
          >
            From browsing programs to tracking booking confirmations, every step is
            designed to keep parents informed and supported.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:gap-5">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div
                className="flex gap-4 p-5 rounded-2xl shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${brand[500]}, ${brand[300]})`,
                  }}
                >
                  <p.icon className="w-5 h-5" style={{ color: brand.ink }} />
                </div>

                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{
                      color: colors.text,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {p.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: colors.textMuted }}
                  >
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
