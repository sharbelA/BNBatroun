/**
 * Footer — site-wide footer with link columns and social icons.
 * Data-driven: add/remove links by editing the `columns` array.
 */

import Link from "next/link";
import { Icon, Container } from "@/components/ui";
import { SITE } from "@/lib/constants";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Batroun", href: "#" },
      { label: "Faraya", href: "#" },
      { label: "The Cedars", href: "#" },
      { label: "Ehden", href: "#" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "List your property", href: "#" },
      { label: "Host resources", href: "#" },
      { label: "Responsible hosting", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Safety information", href: "#" },
      { label: "Cancellation policy", href: "#" },
    ],
  },
  {
    title: SITE.name,
    links: [
      { label: "About us", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Terms & Privacy", href: "#" },
    ],
  },
] as const;

const socials = [
  { name: "instagram" as const, href: "#", label: "Instagram" },
  { name: "whatsapp" as const, href: "#", label: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-light)] bg-[var(--surface)]">
      <Container className="py-10">
        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label={social.label}
              >
                <Icon name={social.name} size={18} />
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
