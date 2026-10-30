import { Quote } from "lucide-react";

import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../data/theme";

export default function Testimonials() {
  const { colors } = useTheme();

  const quotes = [
    {
      name: "Ananya Sen",
      role: "Mother of 2, Kolkata",
      quote:
        "Our night-shift caregiver has been a lifesaver during my ICU rotations. I get photo updates every two hours.",
    },
    {
      name: "Rahul Verma",
      role: "Father, Pune",
      quote:
        "Booked emergency care at 11pm and someone verified was at our door in 40 minutes. Genuinely trustworthy.",
    },
    {
      name: "Fatima Sheikh",
      role: "Mother, Mumbai",
      quote:
        "The background checks and GPS check-ins made the decision easy for my in-laws too. Everyone feels at ease now.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-2xl mb-14">
          <Eyebrow>Parent stories</Eyebrow>

          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Trusted by thousands of little steps.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.1}>
              <div
                className="h-full p-6 rounded-2xl flex flex-col"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Quote className="w-6 h-6 mb-4" style={{ color: brand[300] }} />

                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: colors.text }}
                >
                  "{q.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${brand[500]}, ${brand[300]})`,
                      color: brand.ink,
                    }}
                  >
                    {q.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      {q.name}
                    </p>

                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      {q.role}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
