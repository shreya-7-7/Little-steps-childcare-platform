import { Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../common/Reveal";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../../components/data/theme";

export default function CTASection() {
  const { colors } = useTheme();
  return (
    <section
      id="cta"
      className="py-20 px-5 sm:px-8"
      style={{ backgroundColor: colors.bg }}
    >
      <Reveal>
        <div
          className="max-w-6xl mx-auto rounded-[2rem] p-10 sm:p-16 text-center relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(120deg, ${brand[500]}, ${brand[300]} 60%, ${brand[100]})`,
            backgroundColor: colors.bg,
          }}
        >
          <h2
            className="text-3xl sm:text-4xl font-semibold mb-4"
            style={{
              color: brand.ink,
              fontFamily: "Fraunces, serif",
            }}
          >
            Your child's next little step starts today.
          </h2>

          <p
            className="max-w-xl mx-auto mb-8"
            style={{
              color: brand.ink,
              opacity: 0.8,
            }}
          >
            Tell us what you need and we'll match you with verified childcare
            centers and certified caregivers tailored to your schedule.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/matching"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95"
              style={{
                backgroundColor: "#241C0F",
                color: "#FFF6E2",
              }}
            >
              Get matched now
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="tel:+918001234567"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold border-2"
              style={{
                borderColor: brand.ink,
                color: brand.ink,
              }}
            >
              <Phone className="w-4 h-4" />
              Talk to our team
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
