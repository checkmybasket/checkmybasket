"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";

const links = [
  ["/wishlists", "Create a wishlist"],
  ["/gifts", "Gift ideas"],
  ["#how-it-works", "How it works"],
  ["/return", "Return & sign in"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="receipt-header">
      <div className="receipt-container receipt-header-row">
        <Logo />
        <nav className="receipt-desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="receipt-header-actions">
          <Link
            className="receipt-button receipt-button-inverse receipt-header-create"
            href="/create"
          >
            Create a free draw
          </Link>
          <button
            className="receipt-menu-button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="receipt-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            Menu
          </button>
        </div>
        <nav
          id="receipt-mobile-nav"
          className="receipt-mobile-nav"
          aria-label="Mobile navigation"
          hidden={!open}
        >
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
