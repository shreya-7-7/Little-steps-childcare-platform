import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import UserMenu from "../common/UserMenu";
import NotificationBell from "./NotificationBell";
import { Sun, Moon, Menu, X } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import LogoMark from "./LogoMark";
import Button from "./Button";

export default function Navbar({ onSidebarOpen }) {
  const { colors, dark: isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const links = ["About", "Services", "How it works", "Centers", "FAQ"];
  const { user } = useAuth();

  const handleNavClick = (e, hashId) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById(hashId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${hashId}`);
      }
    } else {
      navigate(`/#${hashId}`);
      setTimeout(() => {
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById("top");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", "#top");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        backgroundColor: colors.nav,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 font-bold text-lg"
          style={{
            color: colors.text,
            fontFamily: "Fraunces, serif",
          }}
        >
          <LogoMark />
          Little Steps
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => {
            const hashId = l.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={l}
                to={`/#${hashId}`}
                onClick={(e) => handleNavClick(e, hashId)}
                className="hover:opacity-70 transition-opacity"
                style={{ color: colors.text }}
              >
                {l}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle dark mode"
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {!user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Button variant="secondary" asChild>
                <Link to="/login">Login</Link>
              </Button>

              <Button variant="primary" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          )}

          <button
            className="md:hidden w-9 h-9 flex items-center justify-center"
            style={{ color: colors.text }}
            onClick={() => {
              if (onSidebarOpen) {
                onSidebarOpen();
              } else {
                setOpen(!open);
              }
            }}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden px-5 pb-5 flex flex-col gap-4"
          style={{
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {links.map((l) => {
            const hashId = l.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={l}
                to={`/#${hashId}`}
                onClick={(e) => {
                  setOpen(false);
                  handleNavClick(e, hashId);
                }}
                style={{ color: colors.text }}
                className="text-sm font-medium pt-4"
              >
                {l}
              </Link>
            );
          })}

          {!user ? (
            <>
              <Button variant="secondary" className="w-full mt-1" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              </Button>

              <Button variant="primary" className="w-full" asChild>
                <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
              </Button>
            </>
          ) : (
            <UserMenu />
          )}
        </div>
      )}
    </header>
  );
}
