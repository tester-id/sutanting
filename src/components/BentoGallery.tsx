'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useCartStore } from '@/store/cartStore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface Topping {
  id: string;
  name: string;
  extraPrice: number;
  isAvailable: boolean;
}

interface BentoGalleryProps {
  products: Product[];
  toppings: Topping[];
}

export default function BentoGallery({ products, toppings }: BentoGalleryProps) {
  const { addItem } = useCartStore();
  
  // Customizer Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chosenToppings, setChosenToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const openCustomizer = (product: Product) => {
    setSelectedProduct(product);
    setChosenToppings([]);
    setQuantity(1);
    setNotes('');
  };

  const closeCustomizer = () => {
    setSelectedProduct(null);
  };

  const toggleTopping = (topping: Topping) => {
    const isChosen = chosenToppings.some((t) => t.id === topping.id);
    if (isChosen) {
      setChosenToppings(chosenToppings.filter((t) => t.id !== topping.id));
    } else {
      setChosenToppings([...chosenToppings, topping]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    addItem({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      description: selectedProduct.description,
      price: selectedProduct.price,
      category: selectedProduct.category,
      imageUrl: selectedProduct.imageUrl,
      selectedToppings: chosenToppings.map((t) => ({
        id: t.id,
        name: t.name,
        extraPrice: t.extraPrice,
      })),
      quantity,
      notes,
    });

    closeCustomizer();
    // Open Cart sidebar dynamically by dispatching a custom event or letting the user know
    // In our case, we can trigger the Navbar open event or show a notification.
    // For now we will just alert/toast, or let them open it.
  };

  const getCustomizerTotal = () => {
    if (!selectedProduct) return 0;
    const toppingsPrice = chosenToppings.reduce((sum, t) => sum + t.extraPrice, 0);
    return (selectedProduct.price + toppingsPrice) * quantity;
  };

  // Find products based on category
  const classicProduct = products.find((p) => p.category === 'CLASSIC') || products[0];
  const premiumProduct = products.find((p) => p.category === 'PREMIUM') || products[1];

  return (
    <section id="bento-gallery" className="py-16 mx-auto max-w-[1180px] px-4 sm:px-6">
      
      {/* Heading Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs font-700 uppercase tracking-[0.22em] text-terradk">
            PILIHAN TERBAIK UNTUK ANDA
          </span>
          <h2 className="text-4xl font-800 tracking-tight text-ink mt-2">
            Eksplorasi Rasa SUTANTING
          </h2>
        </div>
        <p className="max-w-md text-sm text-inkmut leading-relaxed">
          Pilih varian ketan favorit Anda, tambahkan topping kreasi sesuka hati, dan kami siap mengantarkan kenikmatan hangat ke lokasi Anda.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Dynamic Product Cards */}
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-[40px] border border-sanddk bg-white p-8 shadow-soft flex flex-col justify-between group transition-all duration-300 hover:shadow-card hover:-translate-y-1"
          >
            <div>
              {/* Product Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={`rounded-full px-3 py-1 text-xs font-700 uppercase tracking-wider ${
                  product.category === 'PREMIUM'
                    ? 'bg-terra/10 text-terra'
                    : 'bg-sand text-inkmut'
                }`}>
                  Kategori {product.category === 'PREMIUM' ? 'Premium' : 'Classic'}
                </span>
                {product.category === 'PREMIUM' ? (
                  <span className="flex items-center gap-1 text-xs font-700 text-terra bg-white border border-terra/20 px-2.5 py-0.5 rounded-full shadow-xs">
                    <Icon icon="ph:sparkle-fill" className="h-3 w-3 text-terra animate-pulse" />
                    Premium Mix
                  </span>
                ) : (
                  <span className="text-xs font-600 text-terra bg-terra/10 px-2.5 py-0.5 rounded-full">
                    Original Recipe
                  </span>
                )}
              </div>

              {/* Swatch & Zoom Photo */}
              <div className="aspect-square w-full rounded-[32px] bg-sandlt border border-sanddk overflow-hidden flex items-center justify-center p-4 relative">
                <img
                  src={product.imageUrl || '/menu1_topping_keju.png'}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-800 text-ink mt-6 leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-inkmut mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Buy CTA */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-sandlt">
              <div>
                <p className="text-[10px] font-600 text-inkmut uppercase tracking-wider">Mulai dari</p>
                <p className="text-xl font-800 text-ink">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                disabled={!product.isAvailable}
                onClick={() => openCustomizer(product)}
                className={`flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-700 text-white shadow-btn transition-colors cursor-pointer ${
                  product.isAvailable
                    ? 'bg-terradk hover:bg-terraxd'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Icon icon="ph:plus-bold" className="h-4 w-4" />
                {product.isAvailable ? 'Sesuaikan & Pesan' : 'Habis'}
              </button>
            </div>
          </div>
        ))}

        {/* High Contrast Dark Nutritional Card */}
        <div
          id="nutrition-card"
          className="rounded-[40px] bg-ink p-8 shadow-card flex flex-col justify-between text-white relative overflow-hidden group min-h-[380px]"
        >
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 bg-grain opacity-25 pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <span className="rounded-full bg-terra px-3 py-1 text-xs font-700 uppercase tracking-wider text-white">
                Fakta Nutrisi
              </span>
            </div>

            <h3 className="text-3xl font-800 text-white leading-tight">
              Energi Alami Untuk Hari Anda.
            </h3>
            <p className="text-xs text-sand/70 mt-3 leading-relaxed">
              SUTANTING bukan sekadar kudapan lezat biasa. Tiap porsinya diramu untuk memberikan asupan energi dan nutrisi yang baik bagi tubuh Anda.
            </p>

            {/* Highlights Grid */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terra text-white shadow-btn">
                  <Icon icon="ph:lightning-fill" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-700 text-white">Karbohidrat Ketan Pulen</h4>
                  <p className="text-[11px] text-sand/60 mt-0.5">
                    Sumber energi kompleks yang tahan lama dari beras ketan pilihan berkualitas tinggi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terra text-white shadow-btn">
                  <Icon icon="ph:shield-check-fill" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-700 text-white">Kalsium & Protein Susu</h4>
                  <p className="text-[11px] text-sand/60 mt-0.5">
                    Kuah susu evaporasi kaya kalsium dan vitamin untuk kesehatan tulang dan kekuatan tubuh.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-500 text-sand/60">
              Higienis · 100% Halal · Tanpa Pengawet
            </span>
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Icon icon="ph:leaf-bold" className="h-4 w-4 text-terra" />
            </div>
          </div>
        </div>

      </div>

      {/* Customize Toppings Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          {/* Backdrop closer */}
          <div className="absolute inset-0" onClick={closeCustomizer} />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-sanddk bg-sandlt p-6 shadow-card overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-sanddk pb-4 mb-4">
              <div>
                <span className="text-[10px] font-700 uppercase tracking-widest text-terra">Kustomisasi Menu</span>
                <h3 className="text-xl font-800 text-ink leading-tight mt-1">{selectedProduct.name}</h3>
                <p className="text-xs text-inkmut mt-1">Sesuaikan pesanan Anda dengan topping melimpah.</p>
              </div>
              <button
                onClick={closeCustomizer}
                className="flex h-8 w-8 items-center justify-center rounded-full text-inkmut hover:bg-sanddk hover:text-ink transition-colors cursor-pointer"
              >
                <Icon icon="ph:x-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="max-h-[380px] overflow-y-auto space-y-5 pr-1">
              
              {/* Toppings Picker Section */}
              <div>
                <h4 className="text-xs font-700 text-ink uppercase tracking-wider mb-3">1. Pilihan Topping Tambahan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {toppings.map((topping) => {
                    const isChosen = chosenToppings.some((t) => t.id === topping.id);
                    return (
                      <div
                        key={topping.id}
                        onClick={() => topping.isAvailable && toggleTopping(topping)}
                        className={`flex items-center justify-between border rounded-xl p-3.5 bg-white cursor-pointer select-none transition-all ${
                          !topping.isAvailable
                            ? 'opacity-50 cursor-not-allowed'
                            : isChosen
                            ? 'border-terra bg-terra/5 shadow-inner'
                            : 'border-field-border hover:border-terra/40 hover:shadow-soft'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Checked Checkbox Affordance */}
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                              isChosen
                                ? 'bg-terra border-terra text-white'
                                : 'border-field-border bg-white text-transparent'
                            }`}
                          >
                            <Icon icon="ph:check-bold" className="h-3 w-3" />
                          </div>
                          <div>
                            <span className="text-xs font-700 text-ink">{topping.name}</span>
                            {!topping.isAvailable && (
                              <span className="text-[9px] font-600 text-red-500 ml-1.5 uppercase tracking-wide">
                                Habis
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-600 text-inkmut shrink-0">
                          +Rp {topping.extraPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Counter */}
              <div>
                <h4 className="text-xs font-700 text-ink uppercase tracking-wider mb-2">2. Jumlah Pesanan</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-field-border bg-white p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand text-ink transition-colors cursor-pointer"
                    >
                      <Icon icon="ph:minus-bold" className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-800 text-ink">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sand text-ink transition-colors cursor-pointer"
                    >
                      <Icon icon="ph:plus-bold" className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-inkmut">Porsi SUTANTING hangat</span>
                </div>
              </div>

              {/* Delivery Notes / Special Instructions */}
              <div>
                <h4 className="text-xs font-700 text-ink uppercase tracking-wider mb-2">3. Catatan Khusus (Opsional)</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Susu dipisah, minta sendok plastik ekstra, atau request lainnya..."
                  className="w-full rounded-xl border border-field-border bg-white p-3 text-xs text-ink outline-none focus:border-terra focus:ring-4 focus:ring-terra/14 placeholder:text-placeholder-color resize-none min-h-[70px]"
                />
              </div>

            </div>

            {/* Modal Footer (Live price details & Cart CTA) */}
            <div className="border-t border-sanddk pt-4 mt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-600 text-inkmut uppercase tracking-wider">Total Harga</p>
                <p className="text-2xl font-800 text-terra">
                  Rp {getCustomizerTotal().toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeCustomizer}
                  className="rounded-xl border border-field-border bg-white px-4 py-2.5 text-xs font-700 text-ink transition-colors hover:bg-sanddk cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 rounded-xl bg-terradk px-5 py-2.5 text-xs font-700 text-white shadow-btn transition-colors hover:bg-terraxd cursor-pointer"
                >
                  <Icon icon="ph:bag-fill" className="h-4 w-4" />
                  Masukkan Keranjang
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
