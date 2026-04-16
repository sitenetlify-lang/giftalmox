import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MovementChart({ entries, exits }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const data = last7Days.map(date => {
    const dayEntries = entries.filter(e => e.entry_date?.split('T')[0] === date || e.created_date?.split('T')[0] === date);
    const dayExits = exits.filter(e => e.exit_date?.split('T')[0] === date || e.created_date?.split('T')[0] === date);
    const label = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
    return {
      name: label,
      Entradas: dayEntries.reduce((sum, e) => sum + (e.quantity || 0), 0),
      Saídas: dayExits.reduce((sum, e) => sum + (e.quantity || 0), 0),
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Movimentação — Últimos 7 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(220 9% 46%)', fontSize: 11 }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(220 9% 46%)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 11%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Entradas" fill="hsl(162 63% 41%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Saídas" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}