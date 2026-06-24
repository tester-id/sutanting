'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleProductsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      document.getElementById('bento-gallery')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 h-16 w-full border-b border-field-border bg-sand/85 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Logo Image & Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden border border-field-border bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <img src="/logo_sutanting.png" alt="SUTANTING Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-800 tracking-tight text-ink">
              SUTAN<span className="text-terra">TING</span>
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-500 transition-colors duration-200 ${
                pathname === '/' ? 'text-terra font-600' : 'text-inkmut hover:text-ink'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/#bento-gallery"
              onClick={handleProductsClick}
              className="text-sm font-500 text-inkmut hover:text-ink transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              href="/checkout"
              className={`text-sm font-500 transition-colors duration-200 ${
                pathname === '/checkout' ? 'text-terra font-600' : 'text-inkmut hover:text-ink'
              }`}
            >
              Checkout
            </Link>
            {/* <Link
              href="/admin"
              className={`text-sm font-500 transition-colors duration-200 ${
                pathname.startsWith('/admin') ? 'text-terra font-600' : 'text-inkmut hover:text-ink'
              }`}
            >
              Admin Panel
            </Link> */}
          </nav>

          {/* Right: Cart Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-field-border bg-white shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Keranjang Belanja"
            >
              <Icon icon="ph:bag-fill" className="h-5 w-5 text-ink" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terra text-[10px] font-700 text-white shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-field-border bg-white text-inkmut hover:text-ink hover:bg-sand/30 cursor-pointer"
              title="Menu"
            >
              <Icon icon={mobileMenuOpen ? "ph:x-bold" : "ph:list-bold"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 border-b border-field-border bg-sandlt/95 backdrop-blur-md shadow-card transition-all duration-300 animate-in slide-in-from-top-4">
            <nav className="flex flex-col p-4 space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-700 transition-colors ${
                  pathname === '/' ? 'bg-terra/10 text-terra' : 'text-ink hover:bg-sand'
                }`}
              >
                <Icon icon="ph:house-line-bold" className="h-5 w-5" />
                Beranda
              </Link>
              <Link
                href="/#bento-gallery"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (pathname === '/') {
                    e.preventDefault();
                    document.getElementById('bento-gallery')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-700 text-ink hover:bg-sand transition-colors"
              >
                <Icon icon="ph:bowl-food-bold" className="h-5 w-5" />
                Products
              </Link>
              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-700 transition-colors ${
                  pathname === '/checkout' ? 'bg-terra/10 text-terra' : 'text-ink hover:bg-sand'
                }`}
              >
                <Icon icon="ph:shopping-cart-bold" className="h-5 w-5" />
                Checkout
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-700 transition-colors ${
                  pathname.startsWith('/admin') ? 'bg-terra/10 text-terra' : 'text-ink hover:bg-sand'
                }`}
              >
                <Icon icon="ph:gear-six-bold" className="h-5 w-5" />
                Admin Panel
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs transition-opacity duration-300">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Drawer Container */}
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-sandlt shadow-card border-l border-sanddk transition-transform duration-300 animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sanddk px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Icon icon="ph:bag-bold" className="h-5 w-5 text-terra" />
                <h2 className="text-lg font-700 text-ink">Keranjang Belanja</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-inkmut hover:bg-sanddk hover:text-ink transition-colors cursor-pointer"
              >
                <Icon icon="ph:x-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <Icon icon="ph:shopping-cart-light" className="h-16 w-16 text-inkmut/40 mb-3" />
                  <p className="text-sm font-500 text-inkmut">Keranjang Anda masih kosong</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-4 text-xs font-700 text-terra hover:underline cursor-pointer"
                  >
                    Mulai Belanja &rarr;
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const toppingsCost = item.selectedToppings.reduce(
                    (sum, topping) => sum + topping.extraPrice,
                    0
                  );
                  const itemTotal = (item.price + toppingsCost) * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-sanddk bg-white p-3 shadow-sm transition-all hover:shadow-soft"
                    >
                      {/* Image / Icon Swatch */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-sand border border-sanddk overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon icon="ph:bowl-food" className="h-8 w-8 text-terra" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-700 text-ink truncate leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-inkmut hover:text-red-500 transition-colors p-1"
                            title="Hapus"
                          >
                            <Icon icon="ph:trash-bold" className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Selected Toppings */}
                        {item.selectedToppings.length > 0 ? (
                          <p className="text-[11px] text-inkmut mt-1 leading-relaxed">
                            Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                          </p>
                        ) : (
                          <p className="text-[11px] text-inkmut/70 mt-1 italic">
                            Tanpa topping tambahan
                          </p>
                        )}

                        {/* Item Notes */}
                        {item.notes && (
                          <p className="text-[11px] text-terra mt-0.5 italic truncate">
                            Catatan: "{item.notes}"
                          </p>
                        )}

                        {/* Controls & Price */}
                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Incrementor */}
                          <div className="flex items-center rounded-lg border border-field-border bg-sandlt p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-sanddk text-ink transition-colors cursor-pointer"
                            >
                              <Icon icon="ph:minus-bold" className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-700 text-ink">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-sanddk text-ink transition-colors cursor-pointer"
                            >
                              <Icon icon="ph:plus-bold" className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-sm font-700 text-ink">
                            Rp {itemTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary / CTA */}
            {items.length > 0 && (
              <div className="border-t border-sanddk bg-white p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-500 text-inkmut">Subtotal</span>
                  <span className="font-700 text-ink text-lg">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-inkmut border-b border-sandlt pb-3">
                  <span>Pajak & Pengiriman</span>
                  <span>Dihitung saat checkout</span>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-terradk px-5 py-3 text-sm font-700 text-white shadow-btn transition-colors duration-200 hover:bg-terraxd cursor-pointer"
                >
                  <Icon icon="ph:credit-card-bold" className="h-4 w-4" />
                  Lanjut ke Checkout
                </Link>
                
                <p className="text-[10px] text-center text-inkmut">
                  Pesanan akan diselesaikan secara instan melalui integrasi WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
