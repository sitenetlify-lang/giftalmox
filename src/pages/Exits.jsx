import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/client';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ArrowUpFromLine, Loader2, Search } from 'lucide-react';
import moment from 'moment';

export default function Exits() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: '', quantity: 0, department: '', responsible: '', reason: '', cost_center: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: exits = [] } = useQuery({
    queryKey: ['exits'],
    queryFn: () => appClient.entities.StockExit.list('-created_date', 200),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => appClient.entities.Product.list(),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const product = products.find(p => p.id === form.product_id);
    await appClient.entities.StockExit.create({
      ...form,
      product_name: product?.name,
      product_code: product?.code,
      exit_date: new Date().toISOString(),
    });
    if (product) {
      await appClient.entities.Product.update(product.id, {
        current_stock: Math.max(0, (product.current_stock || 0) - Number(form.quantity)),
      });
    }
    queryClient.invalidateQueries({ queryKey: ['exits'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setSaving(false);
    setFormOpen(false);
    setForm({ product_id: '', quantity: 0, department: '', responsible: '', reason: '', cost_center: '', notes: '' });
  };

  const filtered = exits.filter(e =>
    !search || e.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.responsible?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Saídas de Material" subtitle={`${exits.length} registros`} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar saídas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setFormOpen(true)} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />Nova Saída
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Centro de Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12">
                  <ArrowUpFromLine className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma saída registrada</p>
                </TableCell></TableRow>
              ) : filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{moment(e.exit_date || e.created_date).format('DD/MM/YY HH:mm')}</TableCell>
                  <TableCell className="font-medium text-sm">{e.product_name}</TableCell>
                  <TableCell className="font-mono text-xs">{e.product_code}</TableCell>
                  <TableCell className="text-center font-semibold text-destructive">-{e.quantity}</TableCell>
                  <TableCell className="text-sm">{e.department || '—'}</TableCell>
                  <TableCell className="text-sm">{e.responsible || '—'}</TableCell>
                  <TableCell className="text-sm">{e.reason || '—'}</TableCell>
                  <TableCell className="text-sm">{e.cost_center || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Registrar Saída</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Produto *</Label>
              <Select value={form.product_id} onValueChange={v => set('product_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.status === 'Ativo' && p.current_stock > 0).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code} — {p.name} ({p.current_stock} {p.unit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade *</Label>
              <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Setor Solicitante</Label>
              <Input value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.responsible} onChange={e => set('responsible', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Centro de Custo</Label>
              <Input value={form.cost_center} onChange={e => set('cost_center', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Motivo</Label>
              <Input value={form.reason} onChange={e => set('reason', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.product_id || !form.quantity}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}