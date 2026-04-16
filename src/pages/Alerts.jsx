import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/client';
import TopBar from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, PackageX, Clock, TrendingDown, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function Alerts() {
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => appClient.entities.Product.list() });
  const { data: entries = [] } = useQuery({ queryKey: ['entries'], queryFn: () => appClient.entities.StockEntry.list('-created_date', 500) });
  const { data: exits = [] } = useQuery({ queryKey: ['exits'], queryFn: () => appClient.entities.StockExit.list('-created_date', 500) });
  const { data: checks = [] } = useQuery({ queryKey: ['inventory_checks'], queryFn: () => appClient.entities.InventoryCheck.list('-created_date', 100) });

  const activeProducts = products.filter(p => p.status === 'Ativo');

  // Low stock alerts
  const lowStock = activeProducts.filter(p => p.min_stock > 0 && p.current_stock <= p.min_stock);

  // Out of stock
  const outOfStock = activeProducts.filter(p => p.current_stock === 0);

  // No movement in 30 days
  const thirtyDaysAgo = moment().subtract(30, 'days').toISOString();
  const recentProductIds = new Set([
    ...entries.filter(e => (e.entry_date || e.created_date) >= thirtyDaysAgo).map(e => e.product_id),
    ...exits.filter(e => (e.exit_date || e.created_date) >= thirtyDaysAgo).map(e => e.product_id),
  ]);
  const noMovement = activeProducts.filter(p => !recentProductIds.has(p.id) && p.current_stock > 0);

  // Unresolved inventory divergences
  const unresolvedChecks = checks.filter(c => !c.adjusted && c.difference !== 0);

  const alertSections = [
    {
      title: 'Estoque Baixo',
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      items: lowStock.map(p => ({
        title: p.name,
        subtitle: `${p.code} · ${p.current_stock}/${p.min_stock} ${p.unit}`,
        badge: 'Baixo',
        badgeClass: 'bg-warning/10 text-warning border-warning/20',
      })),
    },
    {
      title: 'Produto em Falta',
      icon: PackageX,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      items: outOfStock.map(p => ({
        title: p.name,
        subtitle: `${p.code} · Localização: ${p.location || '—'}`,
        badge: 'Sem estoque',
        badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
      })),
    },
    {
      title: 'Sem Movimentação (30 dias)',
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      items: noMovement.map(p => ({
        title: p.name,
        subtitle: `${p.code} · Estoque: ${p.current_stock} ${p.unit}`,
        badge: 'Parado',
        badgeClass: 'bg-muted text-muted-foreground border-border',
      })),
    },
    {
      title: 'Divergências de Inventário',
      icon: TrendingDown,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      items: unresolvedChecks.map(c => ({
        title: c.product_name,
        subtitle: `Sistema: ${c.system_quantity} · Físico: ${c.physical_quantity} · Dif: ${c.difference}`,
        badge: 'Pendente',
        badgeClass: 'bg-accent/10 text-accent-foreground border-accent/20',
      })),
    },
  ];

  const totalAlerts = alertSections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div>
      <TopBar title="Alertas e Notificações" subtitle={`${totalAlerts} alertas ativos`} />
      <div className="p-6 space-y-6">
        {totalAlerts === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">Nenhum alerta ativo</p>
              <p className="text-sm text-muted-foreground mt-1">Todos os indicadores estão dentro dos parâmetros normais.</p>
            </div>
          </Card>
        ) : (
          alertSections.map(section => {
            if (section.items.length === 0) return null;
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', section.bgColor)}>
                      <Icon className={cn('h-4 w-4', section.color)} />
                    </div>
                    <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
                    <Badge variant="secondary" className="ml-auto">{section.items.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <Badge variant="outline" className={item.badgeClass}>{item.badge}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}