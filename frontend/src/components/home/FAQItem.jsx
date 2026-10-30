import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { brand } from "../../components/data/theme";

export default function FAQItem({ q, a, colors }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
      }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span
          className="font-semibold text-sm sm:text-base"
          style={{ color: colors.text }}
        >
          {q}
        </span>

        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-300"
          style={{
            color: brand[500],
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      <div
        className="grid transition-all duration-300 ease-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <p
            className="px-5 pb-5 text-sm leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}
