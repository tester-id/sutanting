import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.product.deleteMany({});
  await prisma.topping.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.setting.deleteMany({});

  // Seed Products
  const products = [
    {
      name: 'SUTANTING Classic - Keju',
      description: 'Perpaduan ketan pulen tradisional dengan susu gurih evaporasi dan kental manis yang creamy, disajikan hangat dan higienis.',
      price: 13000,
      category: 'CLASSIC',
      imageUrl: '/menu1_topping_keju.png', // Default preview image
      isAvailable: true,
    },{
      name: 'SUTANTING Classic - Meses',
      description: 'Perpaduan ketan pulen tradisional dengan susu gurih evaporasi dan kental manis yang creamy, disajikan hangat dan higienis.',
      price: 13000,
      category: 'CLASSIC',
      imageUrl: '/menu2_topping_meses.png', // Default preview image
      isAvailable: true,
    },
    {
      name: 'SUTANTING Premium - Mangga',
      description: 'Susu Ketan Topping edisi premium dengan ketan super pulen, kuah susu racikan spesial premium, tekstur super creamy dan kaya rasa.',
      price: 15000,
      category: 'PREMIUM',
      imageUrl: '/menu3_topping_mangga.png', // Default preview image
      isAvailable: true,
    },
    {
      name: 'SUTANTING Premium - Nangka',
      description: 'Susu Ketan Topping edisi premium dengan ketan super pulen, kuah susu racikan spesial premium, tekstur super creamy dan kaya rasa.',
      price: 15000,
      category: 'PREMIUM',
      imageUrl: '/menu4_topping_nangka.png', // Default preview image
      isAvailable: true,
    },
    {
      name: 'SUTANTING Premium Mix - Keju Meses',
      description: 'Susu Ketan Topping edisi premium dengan ketan super pulen, kuah susu racikan spesial premium, tekstur super creamy dan kaya rasa.',
      price: 14000,
      category: 'PREMIUM',
      imageUrl: '/menu5_topping_MixKejuMeses.png', // Default preview image
      isAvailable: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // Seed Toppings
  const toppings = [
    { name: 'Keju Parut (Grated Cheese)', extraPrice: 3000, isAvailable: true },
    { name: 'Cokelat Meses (Chocolate Sprinkles)', extraPrice: 2000, isAvailable: true },
    { name: 'Mangga Segar (Fresh Mango)', extraPrice: 4000, isAvailable: true },
    { name: 'Nangka Manis (Sweet Jackfruit)', extraPrice: 4000, isAvailable: true },
    { name: 'Mix Keju Meses', extraPrice: 4000, isAvailable: true },
    { name: 'Oreo Crumb', extraPrice: 3000, isAvailable: false },
    { name: 'Matcha Glaze', extraPrice: 3000, isAvailable: false },
    { name: 'Boba Pearl', extraPrice: 3000, isAvailable: false },
  ];

  for (const topping of toppings) {
    await prisma.topping.create({ data: topping });
  }

  // Seed a mock order for admin panel demo
  const mockOrders = [
    {
      customerName: 'Budi Santoso',
      whatsappNumber: '628123456789',
      address: 'Jl. Mawar No. 12',
      city: 'Jakarta',
      notes: 'Ketan tolong dipisah dengan toppingnya.',
      items: JSON.stringify([
        {
          productName: 'SUTANTING Classic',
          price: 12000,
          quantity: 2,
          toppings: [
            { name: 'Keju Parut (Grated Cheese)', extraPrice: 3000 },
            { name: 'Cokelat Meses (Chocolate Sprinkles)', extraPrice: 2000 }
          ]
        }
      ]),
      totalPrice: 34000, // (12000 + 3000 + 2000) * 2 = 34000
      status: 'PENDING',
    },
    {
      customerName: 'Siti Rahma',
      whatsappNumber: '628987654321',
      address: 'Perumahan Indah Blok C4',
      city: 'Surabaya',
      notes: 'Kirim sore hari ya.',
      items: JSON.stringify([
        {
          productName: 'SUTANTING Premium',
          price: 17000,
          quantity: 1,
          toppings: [
            { name: 'Mangga Segar (Fresh Mango)', extraPrice: 4000 }
          ]
        }
      ]),
      totalPrice: 21000, // 17000 + 4000 = 21000
      status: 'COMPLETED',
    }
  ];

  for (const order of mockOrders) {
    await prisma.order.create({ data: order });
  }

  // Seed Settings
  const adminPasswordHash = crypto.createHash('sha256').update('admin').digest('hex');
  const settings = [
    { key: 'shipping_fee', value: '0' },
    { key: 'tax_percentage', value: '0' },
    { key: 'promo_codes', value: JSON.stringify([{ code: 'SUTANTINGHALAL', discount: 5000 }]) },
    { key: 'admin_password_hash', value: adminPasswordHash },
  ];

  for (const setting of settings) {
    await prisma.setting.create({ data: setting });
  }

  console.log('Seeding complete! Seeding summary:');
  console.log(`- Created ${products.length} products`);
  console.log(`- Created ${toppings.length} toppings`);
  console.log(`- Created ${mockOrders.length} mock orders`);
  console.log(`- Created ${settings.length} settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
