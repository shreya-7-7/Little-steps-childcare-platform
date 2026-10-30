import Reveal from "../common/Reveal";
import Eyebrow from "../common/Eyebrow";
import FAQItem from "./FAQItem";
import { useTheme } from "../../context/ThemeContext";

export default function FAQ() {
  const { colors } = useTheme();

  const faqs = [
    {
      q: "How are caregivers verified?",
      a: "Every caregiver clears ID verification, a police background check, two reference calls, a health screening and an in-person interview before they're listed on Little Steps.",
    },
    {
      q: "Can I really book care at 3 a.m.?",
      a: "Yes. Our on-call desk operates 24x7 and typically dispatches a verified caregiver within 45–90 minutes for emergency requests, depending on your city.",
    },
    {
      q: "What ages do you cover?",
      a: "From 6-month-old infants through age 12, including specialized support for children with developmental or medical needs.",
    },
    {
      q: "What if I'm not happy with a caregiver?",
      a: "You can end any booking with no penalty and request a rematch — we'll have an alternate caregiver's profile to you within the hour.",
    },
    {
      q: "How is pricing calculated?",
      a: "Rates depend on care type, hours and city. You'll see the exact price before confirming — no hidden fees, no surge pricing on emergencies.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: colors.surfaceAlt }}
    >
      <div className="max-w-3xl mx-auto">
        <Reveal className="mb-14 text-center">
          <Eyebrow>FAQ</Eyebrow>

          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{
              color: colors.text,
              fontFamily: "Fraunces, serif",
            }}
          >
            Questions parents ask us first.
          </h2>
        </Reveal>

        <div className="grid gap-4">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} colors={colors} />
          ))}
        </div>
      </div>
    </section>
  );
}
