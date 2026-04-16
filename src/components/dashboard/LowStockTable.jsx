import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function LowStockTable({ products }) {
  const lowStock = products
    .filter(p => p.status === 'Ativo' && p.min_stock > 0 && p.current_stock <= p.min_stock)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <CardTitle className="text-sm font-semibold">Estoque Baixo</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum item com estoque baixo</p>
        ) : (
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.code} · {p.location || '—'}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">
                    {p.current_stock} / {p.min_stock} {p.unit}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}