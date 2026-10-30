import {
  ShieldCheck,
  Clock,
  Users,
  MapPin,
  Stethoscope,
  Star,
} from "lucide-react";

import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../data/theme";

export default function WhyChooseUs() {
  const { colors } = useTheme();

  const features = [
    {
      icon: ShieldCheck,
      title: "7-point verification",
      body: "ID, address, police record, references, health, training and a home interview.",
    },
    {
      icon: Clock,
      title: "24x7 live support",
      body: "A real human answers within 2 minutes, any hour, any day of the year.",
    },
    {
      icon: Users,
      title: "Matched to your family",
      body: "We pair caregivers by language, experience and your child's routine.",
    },
    {
      icon: MapPin,
      title: "GPS check-ins",
      body: "See arrival, activity updates and photos in real time from your phone.",
    },
    {
      icon: Stethoscope,
      title: "First-aid certified",
      body: "Every caregiver is trained in pediatric first aid and emergency response.",
    },
    {
      icon: Star,
      title: "Rated by real parents",
      body: "Transparent reviews after every booking, no filtering, no shortcuts.",
    },
  ];

  return (
    <section
      id="why-choose-us"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-2xl mb-14">
          <Eyebrow>Why families choose us</Eyebrow>

          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            The details that earn your trust, not just your booking.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <div
                className="h-full p-6 rounded-2xl transition-transform duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: colors.surfaceAlt,
                  }}
                >
                  <f.icon className="w-5 h-5" style={{ color: brand[500] }} />
                </div>

                <h3
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  {f.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.textMuted }}
                >
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
