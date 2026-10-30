import { brand } from "../data/theme";

export default function Eyebrow({ children }) {
  return (
    <p
      className="text-xs font-bold tracking-widest uppercase mb-3"
      style={{ color: brand[500] }}
    >
      {children}
    </p>
  );
}
