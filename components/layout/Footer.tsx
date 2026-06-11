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
      { label: "Instagram", href: "https://instagram.com/manzeli.lb" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-warm-800 bg-warm-900 text-warm-300">
      <Container className="py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Icon name="home" size={16} stroke="white" fill="none" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                {SITE.name}
              </span>
            </div>
            <p className="text-sm text-warm-400 leading-relaxed">
              {SITE.tagline}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-3 text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-warm-400 hover:text-white hover:underline transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-warm-400 hover:text-white hover:underline transition-colors"
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
        <div className="mt-10 pt-6 border-t border-warm-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-warm-500">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/manzeli.lb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Icon name="instagram" size={18} />
            </a>
            {WA && (
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-400 hover:text-[#25D366] transition-colors"
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
