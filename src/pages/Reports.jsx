import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appClient } from '@/api/client';
import TopBar from '@/components/layout/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileBarChart, Download, Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, DollarSign, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import moment from 'moment';

const COLORS = ['hsl(222 47% 16%)', 'hsl(43 96% 56%)', 'hsl(162 63% 41%)', 'hsl(0 72% 51%)', 'hsl(220 14% 65%)', 'hsl(280 65% 60%)', 'hsl(30 80% 55%)'];

export default function Reports() {
  const [tab, setTab] = useState('stock');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => appClient.entities.Product.list() });
  const { data: entries = [] } = useQuery({ queryKey: ['entries'], queryFn: () => appClient.entities.StockEntry.list('-created_date', 500) });
  const { data: exits = [] } = useQuery({ queryKey: ['exits'], queryFn: () => appClient.entities.StockExit.list('-created_date', 500) });

  const filterByDate = (items, dateField) => {
    return items.filter(item => {
      const d = item[dateField] || item.created_date;
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo + 'T23:59:59') return false;
      return true;
    });
  };

  const filteredProducts = products.filter(p => categoryFilter === 'all' || p.category === categoryFilter);
  const filteredEntries = filterByDate(entries, 'entry_date');
  const filteredExits = filterByDate(exits, 'exit_date');

  // Category distribution
  const categoryData = Object.entries(
    filteredProducts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Stock value by category
  const valueByCategory = Object.entries(
    filteredProducts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + (p.current_stock || 0) * (p.unit_cost || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);

  // Consumption by department
  const deptData = Object.entries(
    filteredExits.reduce((acc, e) => { const dept = e.department || 'Sem setor'; acc[dept] = (acc[dept] || 0) + (e.quantity || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const lowStockProducts = filteredProducts.filter(p => p.status === 'Ativo' && p.min_stock > 0 && p.current_stock <= p.min_stock);

  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.current_stock || 0) * (p.unit_cost || 0), 0);

  return (
    <div>
      <TopBar title="Relatórios" subtitle="Análises e indicadores do almoxarifado" />
      <div className="p-6 space-y-4">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Data Início</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data Fim</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {['Embalagens', 'Papelaria', 'Brindes', 'Eletrônicos', 'Tecidos', 'Acessórios', 'Ferramentas', 'Limpeza', 'Escritório', 'Outros'].map(c =>
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="stock"><Package className="h-3.5 w-3.5 mr-1.5" />Estoque</TabsTrigger>
            <TabsTrigger value="entries"><ArrowDownToLine className="h-3.5 w-3.5 mr-1.5" />Entradas</TabsTrigger>
            <TabsTrigger value="exits"><ArrowUpFromLine className="h-3.5 w-3.5 mr-1.5" />Saídas</TabsTrigger>
            <TabsTrigger value="low"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Estoque Baixo</TabsTrigger>
            <TabsTrigger value="financial"><DollarSign className="h-3.5 w-3.5 mr-1.5" />Financeiro</TabsTrigger>
            <TabsTrigger value="departments"><Building2 className="h-3.5 w-3.5 mr-1.5" />Por Setor</TabsTrigger>
          </TabsList>

          {/* Stock Report */}
          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Categoria</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                          {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Total de Itens</p>
                    <p className="text-2xl font-bold">{filteredProducts.length}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Itens Ativos</p>
                    <p className="text-2xl font-bold">{filteredProducts.filter(p => p.status === 'Ativo').length}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead>Custo Un.</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.category}</TableCell>
                      <TableCell className="text-center">{p.current_stock} {p.unit}</TableCell>
                      <TableCell>R$ {(p.unit_cost || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">R$ {((p.current_stock || 0) * (p.unit_cost || 0)).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Entries Report */}
          <TabsContent value="entries">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{filteredEntries.length} entradas no período</CardTitle>
                </div>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>NF</TableHead>
                    <TableHead>Custo Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">{moment(e.entry_date || e.created_date).format('DD/MM/YY')}</TableCell>
                      <TableCell className="font-medium text-sm">{e.product_name}</TableCell>
                      <TableCell className="text-center font-semibold text-success">+{e.quantity}</TableCell>
                      <TableCell className="text-sm">{e.supplier || '—'}</TableCell>
                      <TableCell className="text-sm">{e.invoice_number || '—'}</TableCell>
                      <TableCell className="text-sm">R$ {(e.total_cost || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Exits Report */}
          <TabsContent value="exits">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{filteredExits.length} saídas no período</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExits.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">{moment(e.exit_date || e.created_date).format('DD/MM/YY')}</TableCell>
                      <TableCell className="font-medium text-sm">{e.product_name}</TableCell>
                      <TableCell className="text-center font-semibold text-destructive">-{e.quantity}</TableCell>
                      <TableCell className="text-sm">{e.department || '—'}</TableCell>
                      <TableCell className="text-sm">{e.responsible || '—'}</TableCell>
                      <TableCell className="text-sm">{e.reason || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Low Stock */}
          <TabsContent value="low">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{lowStockProducts.length} itens abaixo do estoque mínimo</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Atual</TableHead>
                    <TableHead className="text-center">Mínimo</TableHead>
                    <TableHead className="text-center">Faltam</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Fornecedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-center text-destructive font-semibold">{p.current_stock}</TableCell>
                      <TableCell className="text-center text-sm">{p.min_stock}</TableCell>
                      <TableCell className="text-center font-semibold">{p.min_stock - p.current_stock} {p.unit}</TableCell>
                      <TableCell className="text-sm">{p.location || '—'}</TableCell>
                      <TableCell className="text-sm">{p.supplier || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Financial */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Valor em Estoque por Categoria</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={valueByCategory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220 9% 46%)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(220 9% 46%)' }} />
                      <Tooltip formatter={(v) => `R$ ${v.toFixed(2)}`} />
                      <Bar dataKey="value" fill="hsl(43 96% 56%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments */}
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Consumo por Setor</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(220 9% 46%)' }} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(222 47% 16%)" radius={[0, 4, 4, 0]} name="Qtd. Retirada" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}