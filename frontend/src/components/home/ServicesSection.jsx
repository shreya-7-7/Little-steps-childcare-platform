import {
  Baby,
  Clock,
  BookOpen,
  Stethoscope,
  Utensils,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../data/theme";

export default function ServicesSection() {
  const { colors } = useTheme();

  const services = [
    {
      icon: Baby,
      title: "Full-day care",
      body: "Structured play, meals and naps for infants to age 5, at a licensed center or your home.",
      tag: "From ₹800/day",
      link: "/centers?ageGroup=Toddler",
    },
    {
      icon: Clock,
      title: "24x7 emergency care",
      body: "Last-minute shift, red-eye flight or hospital visit — a caregiver arrives within the hour.",
      tag: "From ₹250/hr",
      link: "/centers?emergencyCare=true&is24Hours=true",
    },
    {
      icon: BookOpen,
      title: "After-school & homework",
      body: "Pickup, snacks and homework support from caregivers trained in early education.",
      tag: "From ₹500/day",
      link: "/caregivers?search=Homework",
    },
    {
      icon: Stethoscope,
      title: "Special needs care",
      body: "Caregivers trained for developmental, medical or sensory support needs.",
      tag: "Custom plan",
      link: "/caregivers?search=Special%20Needs",
    },
    {
      icon: Utensils,
      title: "Live-in nanny",
      body: "A dedicated, background-verified caregiver who lives with your family full-time.",
      tag: "From ₹22,000/mo",
      link: "/caregivers",
    },
    {
      icon: Users,
      title: "Sibling & group care",
      body: "Shared care for multiple children, at reduced per-child rates.",
      tag: "From ₹650/day",
      link: "/centers",
    },
  ];

  return (
    <section
      id="services"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.surfaceAlt }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-2xl mb-14">
          <Eyebrow>Services</Eyebrow>

          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Care for every hour of your family's day.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.08}>
              <div
                className="h-full p-6 rounded-2xl flex flex-col"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${brand[500]}, ${brand[300]})`,
                    }}
                  >
                    <s.icon className="w-5 h-5" style={{ color: brand.ink }} />
                  </div>

                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      color: brand[500],
                    }}
                  >
                    {s.tag}
                  </span>
                </div>

                <h3
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  {s.title}
                </h3>

                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: colors.textMuted }}
                >
                  {s.body}
                </p>

                <Link
                  to={s.link}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: brand[500] }}
                >
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
