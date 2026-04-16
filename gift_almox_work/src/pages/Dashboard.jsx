import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/client';
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Boxes } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/dashboard/StatCard';
import MovementChart from '@/components/dashboard/MovementChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LowStockTable from '@/components/dashboard/LowStockTable';

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => appClient.entities.Product.list(),
  });
  const { data: entries = [] } = useQuery({
    queryKey: ['entries'],
    queryFn: () => appClient.entities.StockEntry.list('-created_date', 100),
  });
  const { data: exits = [] } = useQuery({
    queryKey: ['exits'],
    queryFn: () => appClient.entities.StockExit.list('-created_date', 100),
  });
  const { data: movements = [] } = useQuery({
    queryKey: ['movements'],
    queryFn: () => appClient.entities.StockMovement.list('-created_date', 50),
  });

  const today = new Date().toISOString().split('T')[0];
  const activeProducts = products.filter(p => p.status === 'Ativo');
  const lowStockCount = activeProducts.filter(p => p.min_stock > 0 && p.current_stock <= p.min_stock).length;
  const todayEntries = entries.filter(e => (e.entry_date || e.created_date)?.split('T')[0] === today);
  const todayExits = exits.filter(e => (e.exit_date || e.created_date)?.split('T')[0] === today);
  return (
    <div>
      <TopBar title="Dashboard" subtitle="Visão geral do almoxarifado" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard title="Total de Itens" value={activeProducts.length} icon={Package} variant="default" />
          <StatCard title="Estoque Baixo" value={lowStockCount} icon={AlertTriangle} variant={lowStockCount > 0 ? 'warning' : 'default'} />
          <StatCard title="Entradas Hoje" value={todayEntries.length} icon={ArrowDownToLine} variant="success" />
          <StatCard title="Saídas Hoje" value={todayExits.length} icon={ArrowUpFromLine} variant="destructive" />
          <StatCard title="Categorias" value={new Set(products.map(p => p.category)).size} icon={Boxes} variant="default" />
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MovementChart entries={entries} exits={exits} />
          </div>
          <RecentActivity entries={entries} exits={exits} movements={movements} />
        </div>

        {/* Low Stock */}
        <LowStockTable products={products} />
      </div>
    </div>
  );
}