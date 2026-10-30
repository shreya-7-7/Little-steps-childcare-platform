import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";

import { HiOutlineMail } from "react-icons/hi";

import LogoMark from "./LogoMark";
import { brand } from "../../components/data/theme";

export default function Footer() {
  const cols = [
    {
      title: "Company",
      links: ["About us", "Careers", "Press", "Blog"],
    },
    {
      title: "Services",
      links: [
        "Full-day care",
        "Emergency care",
        "Live-in nanny",
        "Special needs",
      ],
    },
    {
      title: "Support",
      links: [
        "Help center",
        "Safety standards",
        "Trust & verification",
        "Contact us",
      ],
    },
  ];

  return (
    <footer
      style={{ backgroundColor: brand.ink }}
      className="pt-16 pb-8 px-5 sm:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          <div className="lg:col-span-2">
            <div
              className="flex items-center gap-2 font-bold text-lg mb-4"
              style={{
                color: "#FFF6E2",
                fontFamily: "Fraunces, serif",
              }}
            >
              <LogoMark />
              Little Steps
            </div>

            <p
              className="text-sm leading-relaxed mb-5 max-w-xs"
              style={{ color: "#C9B896" }}
            >
              Verified, warm, always-on childcare — because trust shouldn't have
              office hours.
            </p>

            <div className="flex gap-3">
              {[FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social link"
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "#2A2210",
                      color: "#FFF6E2",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ),
              )}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: "#FFF6E2" }}
              >
                {c.title}
              </h4>

              <ul className="grid gap-3">
                {c.links.map((l) => (
                  <li key={l}>
                    {l === "Safety standards" ? (
                      <Link
                        to="/policies"
                        className="text-sm hover:text-amber-300 transition"
                        style={{ color: "#C9B896" }}
                      >
                        {l}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-sm"
                        style={{ color: "#C9B896" }}
                      >
                        {l}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4
              className="text-sm font-semibold mb-4"
              style={{ color: "#FFF6E2" }}
            >
              Stay updated
            </h4>

            <p className="text-sm mb-4" style={{ color: "#C9B896" }}>
              Parenting tips and safety updates, once a month.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 min-w-0 rounded-full px-4 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: "#2A2210",
                  color: "#FFF6E2",
                  border: "1px solid #3A2E17",
                }}
              />

              <button
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${brand[500]}, ${brand[300]})`,
                }}
                aria-label="Subscribe"
              >
                <HiOutlineMail
                  className="w-4 h-4"
                  style={{ color: brand.ink }}
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            borderTop: "1px solid #3A2E17",
          }}
        >
          <p className="text-xs" style={{ color: "#8A7A5C" }}>
            © 2026 Little Steps. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs" style={{ color: "#8A7A5C" }}>
            <Link to="/policies" className="hover:text-amber-200 transition">Policies & Safety</Link>
            <Link to="/policies" className="hover:text-amber-200 transition">Privacy policy</Link>
            <Link to="/policies" className="hover:text-amber-200 transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
