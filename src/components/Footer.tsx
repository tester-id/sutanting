'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Footer() {
  return (
    <footer className="w-full bg-sandlt border-t border-field-border mt-auto">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Left: Brand logo & wordmark */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden border border-field-border bg-white shadow-sm">
              <img src="/logo_sutanting.png" alt="SUTANTING Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-700 tracking-tight text-ink">
              SUTAN<span className="text-terra">TING</span>
            </span>
          </div>

          {/* Center: Copyright */}
          <p className="text-xs text-inkmut font-400">
            &copy; {new Date().getFullYear()} SUTANTING. Handmade goods, shipped with care.
          </p>

          {/* Right: Social icons */}
          <div className="flex items-center gap-4 text-inkmut">
            <a
              href="https://instagram.com/sutanting.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terra transition-colors"
              aria-label="Instagram SUTANTING"
            >
              <Icon icon="ph:instagram-logo-fill" className="h-5 w-5" />
            </a>
            <a
              href="https://wa.me/6283151180769"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terra transition-colors"
              aria-label="WhatsApp SUTANTING"
            >
              <Icon icon="ph:whatsapp-logo-fill" className="h-5 w-5" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
