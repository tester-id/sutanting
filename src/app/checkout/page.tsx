'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    whatsappNumber: '',
    address: '',
    city: '',
    deliveryNotes: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [settings, setSettings] = useState({
    shipping_fee: 10000,
    tax_percentage: 5,
    promo_codes: [] as Array<{ code: string; discount: number }>,
  });

  // Avoid hydration mismatch and load configurations
  useEffect(() => {
    setIsMounted(true);
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            shipping_fee: Number(data.shipping_fee) ?? 10000,
            tax_percentage: Number(data.tax_percentage) ?? 5,
            promo_codes: data.promo_codes ?? [],
          });
        }
      })
      .catch((err) => console.error('Error loading settings:', err));
  }, []);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col bg-sand">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Icon icon="ph:spinner-gap-bold" className="h-10 w-10 text-terra animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 0 ? settings.shipping_fee : 0;
  const tax = totalPrice > 0 ? Math.round(totalPrice * (settings.tax_percentage / 100)) : 0;
  const finalTotal = totalPrice + shipping + tax - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const applyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    const foundPromo = settings.promo_codes.find((p) => p.code.toUpperCase() === code);

    if (foundPromo) {
      setDiscount(foundPromo.discount);
      setPromoApplied(true);
    } else {
      setPromoError('Kode promo tidak valid.');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'Nama depan wajib diisi';
    if (!formData.lastName.trim()) errors.lastName = 'Nama belakang wajib diisi';
    if (!formData.whatsappNumber.trim()) {
      errors.whatsappNumber = 'No. WhatsApp wajib diisi';
    } else if (!/^[0-9+]{8,15}$/.test(formData.whatsappNumber.replace(/[\s-]/g, ''))) {
      errors.whatsappNumber = 'Nomor WhatsApp tidak valid (8-15 digit)';
    }
    if (!formData.address.trim()) errors.address = 'Alamat pengiriman wajib diisi';
    if (!formData.city.trim()) errors.city = 'Kota wajib diisi';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);

    const fullName = `${formData.firstName} ${formData.lastName}`;
    
    // Construct items details array for DB
    const itemsPayload = items.map((item) => ({
      productName: item.name,
      price: item.price,
      quantity: item.quantity,
      toppings: item.selectedToppings.map((t) => ({ name: t.name, extraPrice: t.extraPrice })),
      notes: item.notes,
    }));

    try {
      // 1. Save order to database for admin panel records
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          whatsappNumber: formData.whatsappNumber,
          address: formData.address,
          city: formData.city,
          notes: formData.deliveryNotes,
          items: itemsPayload,
          totalPrice: finalTotal,
        }),
      });

      if (!response.ok) {
        throw new Error('Server error when storing order');
      }

      // 2. Build WhatsApp redirect payload
      let itemsMessage = '';
      items.forEach((item, index) => {
        const toppingsString = item.selectedToppings.length > 0
          ? ` [Topping: ${item.selectedToppings.map((t) => t.name).join(', ')}]`
          : '';
        const notesString = item.notes ? ` (Catatan: "${item.notes}")` : '';
        
        itemsMessage += `${index + 1}. ${item.name} (x${item.quantity})${toppingsString}${notesString}\n`;
      });

      const waNumber = '6283151180769'; // SUTANTING Merchant WhatsApp
      const orderMessage = `Halo SUTANTING, saya ingin memesan:\n\n${itemsMessage}\nTotal Bayar: Rp ${finalTotal.toLocaleString('id-ID')}\n\n*Informasi Pengiriman*:\nNama: ${fullName}\nWhatsApp: ${formData.whatsappNumber}\nAlamat: ${formData.address}\nKota: ${formData.city}\nCatatan Pengiriman: ${formData.deliveryNotes || '-'}\n\nTerima kasih!`;

      // 3. Clear cart
      clearCart();

      // 4. Redirect to WhatsApp API
      const encodedMessage = encodeURIComponent(orderMessage);
      router.push(`https://wa.me/${waNumber}?text=${encodedMessage}`);

    } catch (err) {
      console.error(err);
      alert('Gagal menyambungkan ke sistem pemesanan. Kami akan tetap mengalihkan Anda ke WhatsApp.');
      
      // Fallback redirect directly
      const waNumber = '6283151180769';
      let itemsMessage = items.map(item => `${item.name} (x${item.quantity})`).join(', ');
      const orderMessage = `Halo SUTANTING, saya ingin memesan: ${itemsMessage}. Total: Rp ${finalTotal.toLocaleString('id-ID')}. Alamat: ${formData.address}. Nama: ${fullName}.`;
      clearCart();
      router.push(`https://wa.me/${waNumber}?text=${encodeURIComponent(orderMessage)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-sand">
      {/* Navigation */}
      <Navbar />

      {/* Hero Strip */}
      <div className="relative overflow-hidden bg-grain bg-gradient-to-b from-sandlt to-sand border-b border-field-border py-8">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-500 text-inkmut mb-3 select-none">
            <Link href="/" className="hover:text-ink transition-colors">
              Keranjang
            </Link>
            <Icon icon="ph:caret-right-bold" className="h-3 w-3 text-inkmut/60" />
            <span className="font-650 text-terra">Checkout</span>
            <Icon icon="ph:caret-right-bold" className="h-3 w-3 text-inkmut/60" />
            <span className="text-inkmut/50">Konfirmasi</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-700 uppercase tracking-[0.22em] text-terradk">
                HAMPIR SELESAI
              </span>
              <h1 className="text-3xl font-800 tracking-tight text-ink mt-1">
                Selesaikan Pesanan Anda
              </h1>
              <p className="text-xs text-inkmut mt-1.5 max-w-md">
                Lengkapi informasi pengiriman untuk membuat tagihan otomatis via WhatsApp.
              </p>
            </div>

            {/* SSL Trust Pill */}
            <div className="flex items-center gap-2 bg-white/70 border border-field-border rounded-full px-3.5 py-1.5 shadow-soft">
              <Icon icon="ph:shield-check-fill" className="h-4.5 w-4.5 text-terra" />
              <span className="text-[11px] font-600 text-ink">
                Aman · WhatsApp Terenkripsi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Layout */}
      <main className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-6 flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-sandlt border border-sanddk rounded-3xl p-8 max-w-xl mx-auto shadow-soft">
            <div className="h-16 w-16 bg-terra/10 rounded-full flex items-center justify-center mb-4">
              <Icon icon="ph:shopping-bag-bold" className="h-8 w-8 text-terra" />
            </div>
            <h2 className="text-xl font-800 text-ink">Keranjang Anda Kosong</h2>
            <p className="text-xs text-inkmut mt-1.5 max-w-sm">
              Silakan kembali ke halaman utama untuk menambahkan produk SUTANTING ke keranjang Anda sebelum melanjutkan.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terradk px-5 py-3 text-xs font-700 text-white shadow-btn hover:bg-terraxd transition-all"
            >
              <Icon icon="ph:arrow-left-bold" className="h-3.5 w-3.5" />
              Kembali Belanja
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Column 1: Billing & Delivery Details (Left) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Delivery Details Card */}
              <div className="rounded-2xl border border-sanddk bg-sandlt p-6 sm:p-8 shadow-soft">
                {/* Header */}
                <div className="flex items-center gap-3.5 border-b border-sanddk pb-4 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terra/10 text-terra font-700 text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-700 text-ink">Informasi Pengiriman</h2>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="lbl">Nama Depan</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g., Budi"
                      className={`field ${formErrors.firstName ? 'border-red-500 ring-4 ring-red-100' : ''}`}
                    />
                    {formErrors.firstName && (
                      <p className="text-[10px] text-red-500 mt-1 font-500">{formErrors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="lbl">Nama Belakang</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g., Santoso"
                      className={`field ${formErrors.lastName ? 'border-red-500 ring-4 ring-red-100' : ''}`}
                    />
                    {formErrors.lastName && (
                      <p className="text-[10px] text-red-500 mt-1 font-500">{formErrors.lastName}</p>
                    )}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="sm:col-span-2">
                    <label className="lbl">Nomor WhatsApp Penerima</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 z-10 pointer-events-none text-inkmut/70 text-sm font-600">
                        <Icon icon="ph:phone-fill" className="h-4 w-4 text-terra" />
                      </span>
                      <input
                        type="text"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleInputChange}
                        placeholder="Contoh: 08123456789 atau +628123456789"
                        className={`field ${formErrors.whatsappNumber ? 'border-red-500 ring-4 ring-red-100' : ''}`}
                        style={{ paddingLeft: '2.75rem' }}
                      />
                    </div>
                    {formErrors.whatsappNumber ? (
                      <p className="text-[10px] text-red-500 mt-1 font-500">{formErrors.whatsappNumber}</p>
                    ) : (
                      <p className="text-[10px] text-inkmut/60 mt-1">
                        Nomor aktif digunakan untuk konfirmasi kurir saat pengantaran.
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="sm:col-span-2">
                    <label className="lbl">Alamat Lengkap Pengiriman</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Nama jalan, nomor rumah, nomor RT/RW, nama kompleks, patokan, dll..."
                      className={`field min-h-[90px] resize-none ${formErrors.address ? 'border-red-500 ring-4 ring-red-100' : ''}`}
                    />
                    {formErrors.address && (
                      <p className="text-[10px] text-red-500 mt-1 font-500">{formErrors.address}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="lbl">Kota / Kabupaten</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Surabaya"
                      className={`field ${formErrors.city ? 'border-red-500 ring-4 ring-red-100' : ''}`}
                    />
                    {formErrors.city && (
                      <p className="text-[10px] text-red-500 mt-1 font-500">{formErrors.city}</p>
                    )}
                  </div>

                  {/* Postal Code / Country (Optional helper select) */}
                  <div>
                    <label className="lbl">Metode Pengiriman</label>
                    <div className="relative">
                      <select className="field appearance-none cursor-pointer pr-10">
                        <option>Kurir Instan SUTANTING (Same-day)</option>
                        <option>Ambil Sendiri di Outlet</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-inkmut">
                        <Icon icon="ph:caret-down-bold" className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div className="sm:col-span-2">
                    <label className="lbl">Catatan Tambahan untuk Kurir (Opsional)</label>
                    <input
                      type="text"
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      placeholder="e.g., Gerbang warna merah, atau titip di satpam."
                      className="field"
                    />
                  </div>
                </div>
              </div>

              {/* Segmented Payment Card / billing same check */}
              <div className="rounded-2xl border border-sanddk bg-sandlt p-6 sm:p-8 shadow-soft">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-sanddk pb-4 mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terra/10 text-terra font-700 text-sm">
                      2
                    </div>
                    <h2 className="text-lg font-700 text-ink">Metode Pembayaran</h2>
                  </div>
                  {/* Brand marks */}
                  <div className="hidden sm:flex gap-1.5 items-center text-[9px] font-800 select-none">
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded border border-red-600 shadow-xs tracking-wider">QRIS</span>
                    <span className="bg-[#008deb] text-white px-2 py-0.5 rounded border border-[#007cd0] shadow-xs tracking-wider">DANA</span>
                    <span className="bg-[#ff5722] text-white px-2 py-0.5 rounded border border-[#e64a19] shadow-xs tracking-wider">SHOPEEPAY</span>
                  </div>
                </div>

                {/* Segmented control */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center justify-center gap-2 border border-terra bg-terra/5 text-terradk ring-1 ring-terra/35 rounded-xl p-3 text-xs font-700 cursor-pointer select-none">
                    <Icon icon="ph:credit-card-fill" className="h-4.5 w-4.5 text-terra" />
                    Bayar COD / Transfer
                  </div>
                  <div className="flex items-center justify-center gap-2 border border-field-border bg-white text-inkmut hover:border-terra/40 rounded-xl p-3 text-xs font-600 cursor-not-allowed select-none opacity-60">
                    <Icon icon="ph:qr-code-bold" className="h-4.5 w-4.5 text-inkmut" />
                    QRIS / E-Wallet (Soon)
                  </div>
                </div>

                <div className="rounded-xl border border-field-border bg-white p-4 text-xs text-inkmut leading-relaxed">
                  <div className="flex items-center gap-2 font-700 text-ink mb-1.5">
                    <Icon icon="ph:info-bold" className="h-4 w-4 text-terra" />
                    Sistem WhatsApp Checkout:
                  </div>
                  Order Anda akan terkirim langsung ke admin SUTANTING. Anda bisa melakukan pembayaran via transfer bank setelah total pesanan dikonfirmasi oleh admin di WhatsApp, atau bayar langsung di tempat (COD) saat kurir kami tiba.
                </div>

                {/* Same-as-shipping Checkbox */}
                <div className="mt-6">
                  <label
                    onClick={() => setBillingSameAsShipping(!billingSameAsShipping)}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        billingSameAsShipping
                          ? 'bg-terra border-terra text-white'
                          : 'border-field-border bg-white text-transparent'
                      }`}
                    >
                      <Icon icon="ph:check-bold" className="h-3 w-3" />
                    </div>
                    <span className="text-xs text-ink font-500">
                      Alamat penagihan sama dengan alamat pengiriman barang
                    </span>
                  </label>
                </div>
              </div>

            </div>

            {/* Column 2: Sticky Order Summary (Right) */}
            <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              
              {/* Order Summary Card */}
              <div className="rounded-2xl bg-ink text-white p-6 sm:p-8 shadow-card overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <h2 className="text-base font-700 text-white">Ringkasan Pesanan</h2>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-600 text-sand/80">
                    {items.length} Menu
                  </span>
                </div>

                {/* Product List */}
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 border-b border-white/10 pb-4 mb-4">
                  {items.map((item, index) => {
                    const toppingsCost = item.selectedToppings.reduce(
                      (sum, topping) => sum + topping.extraPrice,
                      0
                    );
                    const itemTotal = (item.price + toppingsCost) * item.quantity;
                    
                    // Assign gradient based on index
                    const gradients = [
                      'from-[#caa37e] to-[#a87a52]',
                      'from-[#8f9c7a] to-[#5f6e4d]',
                      'from-[#c98a63] to-[#a3613c]'
                    ];
                    const gradientClass = gradients[index % gradients.length];

                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        {/* Swatch image */}
                        <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} shadow-md overflow-hidden`}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <Icon icon="ph:bowl-food" className="h-6 w-6 text-white/90" />
                          )}
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terra text-[10px] font-700 text-white shadow-sm">
                            {item.quantity}
                          </span>
                        </div>

                        {/* Title and toppings details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-700 text-white truncate">{item.name}</h4>
                          <p className="text-[10px] text-sand/60 truncate mt-0.5">
                            {item.selectedToppings.length > 0
                              ? item.selectedToppings.map(t => t.name).join(', ')
                              : 'Ketan + Susu Gurih'}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-700 text-white shrink-0">
                          Rp {itemTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Row */}
                <div className="flex gap-2 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Kode Promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.06] py-2 px-3 text-xs text-white outline-none focus:border-terra focus:ring-1 focus:ring-terra placeholder:text-sand/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoApplied || !promoCode}
                    className="rounded-xl border border-white/20 bg-transparent px-4 py-2 text-xs font-700 text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                  >
                    {promoApplied ? 'Applied' : 'Gunakan'}
                  </button>
                </div>
                {promoError && <p className="text-[10px] text-red-400 -mt-4 mb-4 font-500">{promoError}</p>}
                {promoApplied && (
                  <p className="text-[10px] text-emerald-400 -mt-4 mb-4 font-500">
                    Diskon Rp {discount.toLocaleString('id-ID')} digunakan! ({promoCode.trim().toUpperCase()})
                  </p>
                )}

                {/* Calculated Totals */}
                <div className="space-y-2 border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between text-xs text-sand/75">
                    <span>Subtotal</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-sand/75">
                    <span>Ongkos Kirim Flat</span>
                    <span>Rp {shipping.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-sand/75">
                    <span>Biaya Tambahan (Pajak {settings.tax_percentage}%)</span>
                    <span>Rp {tax.toLocaleString('id-ID')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>Potongan Promo</span>
                      <span>-Rp {discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  
                  {/* Total Line */}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-800 text-white">
                    <span>Total Keseluruhan</span>
                    <span className="text-lg">Rp {finalTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Checkout CTA Pay Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-terradk py-3.5 text-sm font-700 text-white shadow-btn hover:bg-terraxd transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Icon icon="ph:spinner-gap-bold" className="h-4.5 w-4.5 animate-spin" />
                      Memproses Pesanan...
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:lock-key-fill" className="h-4.5 w-4.5" />
                      Pesan Sekarang Rp {finalTotal.toLocaleString('id-ID')}
                    </>
                  )}
                </button>

                {/* Security Reassurance text */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-sand/70 mt-3.5">
                  <Icon icon="ph:shield-check-fill" className="h-3.5 w-3.5 text-terra" />
                  Selesai dalam 1 klik. Mengalihkan ke WhatsApp Anda.
                </div>
              </div>

              {/* Extra Trust indicators below summary card */}
              <div className="flex items-center justify-center gap-6 text-xs text-inkmut select-none py-2">
                <span className="flex items-center gap-1">
                  <Icon icon="ph:truck-fill" className="h-4.5 w-4.5 text-terra" />
                  Pengiriman Instan
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="ph:leaf-fill" className="h-4.5 w-4.5 text-terra" />
                  Ramah Lingkungan
                </span>
              </div>

            </aside>

          </form>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
