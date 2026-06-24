'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Center point coordinates of the container
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Mouse relative position to center
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    // rotateX = (mouseY - center) / 20, rotateY = -(mouseX - center) / 20
    const rotateX = dy / 20;
    const rotateY = -dx / 20;

    setRotate({ x: rotateX, y: rotateY });
    
    // Normalized position relative to center (-1 to 1) for the cards' additional 3D separation effect
    setMousePos({
      x: dx / (rect.width / 2),
      y: dy / (rect.height / 2),
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setMousePos({ x: 0, y: 0 });
  };

  const scrollToMenu = () => {
    document.getElementById('bento-gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-grain py-16 lg:py-24 border-b border-field-border">
      {/* Background glow behind 3D stack */}
      <div className="absolute top-1/2 left-1/2 lg:left-[75%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-gradient-to-tr from-terra/10 to-terra/5 blur-3xl opacity-60 rounded-full pointer-events-none z-0" />

      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Side: Tagline, Description, CTA, and Social Proof */}
          <div className="lg:col-span-6 flex flex-col space-y-6 text-left">
            {/* Eyebrow */}
            <span className="text-xs font-700 uppercase tracking-[0.22em] text-terradk">
              KULINER NUSANTARA MODERN
            </span>

            {/* Headline */}
            <h1 className="text-5xl font-800 leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Tradisi dalam <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-terra to-terradk bg-clip-text text-transparent">
                Setiap Suapan.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-sm md:text-base font-400 text-inkmut leading-relaxed">
              SUTANTING (Susu Ketan Topping) memadukan pulennya ketan tradisional dengan siraman susu evaporasi gurih dan aneka topping modern premium. Dibuat fresh tanpa bahan pengawet demi cita rasa higienis berkelas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={scrollToMenu}
                className="flex items-center gap-2 rounded-xl bg-terradk px-6 py-3.5 text-sm font-700 text-white shadow-btn transition-transform duration-200 hover:bg-terraxd hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Icon icon="ph:bag-fill" className="h-5 w-5" />
                Pesan Sekarang
              </button>
              <button
                onClick={() => {
                  document.getElementById('nutrition-card')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 rounded-xl border border-field-border bg-white/70 backdrop-blur-xs px-6 py-3.5 text-sm font-700 text-ink transition-all hover:bg-white hover:shadow-soft cursor-pointer"
              >
                Manfaat Nutrisi
              </button>
            </div>

            {/* Social Proof Stacked Avatars */}
            <div className="flex items-center gap-4 pt-4 border-t border-field-border/60 mt-4 max-w-sm">
              <div className="flex -space-x-3 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-sand"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-sand"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-sand"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 3"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-sand"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar 4"
                />
              </div>
              <div className="text-xs">
                <p className="font-700 text-ink leading-none">1,000+ Suapan Terjual</p>
                <p className="text-inkmut mt-0.5">Rating 4.9/5 dari penikmat ketan susu</p>
              </div>
            </div>
          </div>

          {/* Right Side: 3D Parallax Floating Card Stack */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            {/* Decorative Floating Elements (Anim-float keyframes) */}
            <div className="absolute top-12 left-auto z-0 animate-hero-float-1 text-terra/30 pointer-events-none hidden md:block">
              <Icon icon="ph:leaf-fill" className="h-11 w-11 animate-bounce" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute bottom-8 right-12 z-0 animate-hero-float-2 text-terradk/20 pointer-events-none hidden md:block">
              <Icon icon="ph:diamonds-four-fill" className="h-12 w-12" />
            </div>

            {/* 3D Wrapper Container */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="perspective-1000 preserve-3d relative flex h-[360px] w-[320px] sm:h-[420px] sm:w-[360px] items-center justify-center cursor-pointer select-none"
            >
              
              {/* Card A: Classic (Bottom layer, Emerald theme) */}
              <div
                style={{
                  transform: `translate3d(${-45 - mousePos.x * 8}px, ${-12 - mousePos.y * 8}px, 0px) rotateY(${-15 + mousePos.x * 4}deg) rotateX(${10 - mousePos.y * 4}deg)`,
                  transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
                className="mb-30 absolute h-[300px] w-[216px] rounded-2xl border border-emerald-500/20 bg-emerald-50/95 p-5 shadow-card flex flex-col justify-between transition-shadow duration-300 hover:shadow-soft"
              >
                <div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-700 uppercase tracking-wider text-emerald-800 border border-emerald-300">
                    Classic
                  </span>
                  <h3 className="mt-3 text-lg font-800 text-emerald-950 leading-tight">
                    Susu Ketan Keju
                  </h3>
                  <p className="mt-1 text-xs text-emerald-900/70 leading-relaxed">
                    Ketan hangat disiram susu gurih evaporasi dan parutan keju cheddar melimpah.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-800 text-emerald-950">Rp 13.000</span>
                  <div className="h-20 w-20 rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-500/10 relative shadow-inner">
                    <img
                      src="/menu1_topping_keju.png"
                      alt="Susu Ketan Keju"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Card B: Premium (Top Layer, Orange/Terra theme offset) */}
              <div
                style={{
                  transform: `translate3d(${45 + mousePos.x * 8}px, ${12 + mousePos.y * 8}px, 50px) rotateY(${15 + mousePos.x * 4}deg) rotateX(${-5 - mousePos.y * 4}deg)`,
                  transition: isHovered ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                }}
                className="mt-30 absolute h-[300px] w-[216px] rounded-2xl border border-terra/20 bg-ink p-5 shadow-card flex flex-col justify-between text-white transition-shadow duration-300 hover:shadow-soft"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-terra px-2.5 py-0.5 text-[10px] font-700 uppercase tracking-wider text-white">
                      Best Seller
                    </span>
                    <Icon icon="ph:sparkle-fill" className="text-terra h-4 w-4 animate-pulse" />
                  </div>
                  <h3 className="mt-3 text-lg font-800 text-white leading-tight">
                    Premium Mix Special
                  </h3>
                  <p className="mt-1 text-xs text-sand/65 leading-relaxed">
                    Susu ketan premium dengan mix toping parutan keju gurih dan cokelat meses manis.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-800 text-white">Rp 14.000</span>
                  <div className="h-20 w-20 rounded-xl overflow-hidden border border-white/10 bg-white/5 relative shadow-md">
                    <img
                      src="/menu5_topping_MixKejuMeses.png"
                      alt="Premium Mix Special"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
