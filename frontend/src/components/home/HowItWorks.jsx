import { UserCheck, Users, CalendarCheck, Sparkles } from "lucide-react";

import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import { useTheme } from "../../context/ThemeContext";

import { brand } from "../../components/data/theme";

export default function HowItWorks() {
  const { colors } = useTheme();

  const steps = [
    {
      icon: UserCheck,
      title: "Tell us your needs",
      body: "Ages, schedule, language and any medical notes — takes under 2 minutes.",
    },
    {
      icon: Users,
      title: "Meet your matches",
      body: "We shortlist 3 verified caregivers or centers based on your family.",
    },
    {
      icon: CalendarCheck,
      title: "Book a trial visit",
      body: "Meet in person or on video before you commit to a schedule.",
    },
    {
      icon: Sparkles,
      title: "Start with 24x7 backup",
      body: "Your primary caregiver is set, with on-call backup for every emergency.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-2xl mb-16">
          <Eyebrow>How it works</Eyebrow>

          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Four little steps to your first booking.
          </h2>
        </Reveal>

        <div className="relative grid md:grid-cols-4 gap-10 md:gap-6">
          <div
            className="hidden md:block absolute top-6 left-0 right-0 h-px"
            style={{
              backgroundImage: `linear-gradient(90deg, ${brand[500]}, ${brand[100]})`,
            }}
            aria-hidden
          />

          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative">
                <div
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-5 font-semibold"
                  style={{
                    backgroundColor: colors.surface,
                    border: `2px solid ${brand[500]}`,
                    color: brand[500],
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                  }}
                >
                  <s.icon className="w-4 h-4" style={{ color: brand[500] }} />
                </div>

                <h3
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  {s.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.textMuted }}
                >
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
