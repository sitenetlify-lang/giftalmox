import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function RecentActivity({ entries, exits, movements }) {
  const allItems = [
    ...entries.map(e => ({ ...e, _type: 'entry', _date: e.entry_date || e.created_date })),
    ...exits.map(e => ({ ...e, _type: 'exit', _date: e.exit_date || e.created_date })),
    ...movements.map(m => ({ ...m, _type: 'movement', _date: m.movement_date || m.created_date })),
  ]
    .sort((a, b) => new Date(b._date) - new Date(a._date))
    .slice(0, 8);

  const typeConfig = {
    entry: { icon: ArrowDownToLine, label: 'Entrada', color: 'text-success bg-success/10' },
    exit: { icon: ArrowUpFromLine, label: 'Saída', color: 'text-destructive bg-destructive/10' },
    movement: { icon: ArrowLeftRight, label: 'Movimentação', color: 'text-accent bg-accent/10' },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {allItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade recente</p>
        ) : (
          <div className="space-y-3">
            {allItems.map((item, i) => {
              const config = typeConfig[item._type];
              const Icon = config.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product_name || 'Produto'}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} · {item.quantity} un
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {moment(item._date).fromNow()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}