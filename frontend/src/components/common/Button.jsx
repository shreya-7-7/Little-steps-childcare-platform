import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { brand } from "../data/theme";

export default function Button({
  children,
  variant = "primary",
  icon: Icon,
  className = "",
  asChild = false,
  ...props
}) {
  const { colors } = useTheme();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-200 active:scale-95 hover:-translate-y-0.5";

  const style =
    variant === "primary"
      ? {
          backgroundImage: `linear-gradient(120deg, ${brand[500]}, ${brand[300]})`,
          color: brand.ink,
          boxShadow: `0 10px 24px -10px ${brand[500]}88`,
        }
      : {
          backgroundColor: "transparent",
          color: colors.text,
          border: `1.5px solid ${colors.border}`,
        };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: `${base} ${className} ${children.props.className || ""}`.trim(),
      style: { ...style, ...children.props.style },
      children: (
        <>
          {children.props.children}
          {Icon && <Icon className="w-4 h-4" />}
        </>
      ),
    });
  }

  return (
    <button className={`${base} ${className}`} style={style} {...props}>
      {children}
      {Icon && <Icon className="w-4 h-4" />}
    </button>
  );
}
