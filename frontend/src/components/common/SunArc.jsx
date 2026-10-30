import { brand } from "../data/theme";

export default function SunArc({ flip = false }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 64 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 120"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        style={{ transform: flip ? "scaleY(-1)" : "none" }}
      >
        <defs>
          <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={brand[500]} />
            <stop offset="50%" stopColor={brand[300]} />
            <stop offset="100%" stopColor={brand[100]} />
          </linearGradient>
        </defs>

        <path
          d="M0,100 Q600,10 1200,100"
          fill="none"
          stroke="url(#sunArcGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
