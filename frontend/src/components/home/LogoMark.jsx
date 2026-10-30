import { brand } from "../../components/data/theme";

export default function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor={brand[500]} />
          <stop offset="1" stopColor={brand[200]} />
        </linearGradient>
      </defs>

      <circle cx="20" cy="20" r="19" fill="url(#logoGrad)" />

      <path
        d="M14 26c0-5 3-8 6-8s6 3 6 8"
        stroke={brand.ink}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="20" cy="14" r="3.4" fill={brand.ink} />
    </svg>
  );
}
