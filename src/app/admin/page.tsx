import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/AdminDashboard';
import { isAuthenticated } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminPage() {
  // 1. Verify authentication state on the server
  if (!(await isAuthenticated())) {
    redirect('/admin/login');
  }


  // 2. Fetch all required dashboard records directly from the database
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const toppings = await prisma.topping.findMany({
    orderBy: { name: 'asc' },
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-sand text-ink flex flex-col">
      <AdminDashboard
        initialProducts={products}
        initialToppings={toppings}
        initialOrders={orders}
      />
    </div>
  );
}
