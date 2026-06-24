import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BentoGallery from '@/components/BentoGallery';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

// Ensure the page fetches dynamic data on every request (SSR)
export const revalidate = 0;

export default async function Home() {
  // Fetch products and toppings directly from database (RSC)
  const products = await prisma.product.findMany({
    orderBy: { imageUrl: 'asc' },
  });
  
  const toppings = await prisma.topping.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3D Floating Hero */}
        <Hero />

        {/* Product Bento Gallery & Nutrition Showcase */}
        <BentoGallery products={products} toppings={toppings} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
