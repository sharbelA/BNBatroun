/**
 * Footer — all links point to real pages, socials use env vars.
 */

import Link from "next/link";
import { Icon, Container } from "@/components/ui";
import { SITE } from "@/lib/constants";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const columns = [
  {
    title: "Explore",
    links: [
      { label: "All chalets", href: "/chalets" },
      { label: "About us", href: "/about" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "List your property", href: "/list-your-chalet" },
      { label: "Host login", href: "/host/login" },
    ],
  },
  {
    title: "Contact",
    links: [
      ...(WA ? [{ label: "WhatsApp us", href: `https://wa.me/${WA}` }] : []),
      { label: "Instagram", href: "https://instagram.com/bnbatroun" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-warm-800 bg-warm-900 text-warm-300">
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Icon name="home" size={16} stroke="white" fill="none" />
              </div>
              <span
                className="text-lg font-semibold tracking-tight text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {SITE.name}
              </span>
            </div>
            <p className="text-sm text-warm-400 leading-relaxed max-w-xs">
              {SITE.tagline}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold mb-4 text-white uppercase tracking-widest">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-warm-400 hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-warm-400 hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-warm-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-warm-500">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/bnbatroun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm-400 hover:text-white transition-colors duration-200"
              aria-label="Instagram"
            >
              <Icon name="instagram" size={18} />
            </a>
            {WA && (
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-400 hover:text-white transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" size={18} />
              </a>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
