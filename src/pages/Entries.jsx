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
import { Plus, ArrowDownToLine, Loader2, Search } from 'lucide-react';
import moment from 'moment';

export default function Entries() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: '', quantity: 0, supplier: '', invoice_number: '', received_by: '', unit_cost: 0, notes: '' });
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ['entries'],
    queryFn: () => appClient.entities.StockEntry.list('-created_date', 200),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => appClient.entities.Product.list(),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const product = products.find(p => p.id === form.product_id);
    await appClient.entities.StockEntry.create({
      ...form,
      product_name: product?.name,
      product_code: product?.code,
      total_cost: form.quantity * form.unit_cost,
      entry_date: new Date().toISOString(),
    });
    // Update product stock
    if (product) {
      await appClient.entities.Product.update(product.id, {
        current_stock: (product.current_stock || 0) + Number(form.quantity),
      });
    }
    queryClient.invalidateQueries({ queryKey: ['entries'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setSaving(false);
    setFormOpen(false);
    setForm({ product_id: '', quantity: 0, supplier: '', invoice_number: '', received_by: '', unit_cost: 0, notes: '' });
  };

  const filtered = entries.filter(e =>
    !search || e.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Entradas de Material" subtitle={`${entries.length} registros`} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar entradas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setFormOpen(true)} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />Nova Entrada
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
                <TableHead>Fornecedor</TableHead>
                <TableHead>Nota Fiscal</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Custo Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12">
                  <ArrowDownToLine className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma entrada registrada</p>
                </TableCell></TableRow>
              ) : filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{moment(e.entry_date || e.created_date).format('DD/MM/YY HH:mm')}</TableCell>
                  <TableCell className="font-medium text-sm">{e.product_name}</TableCell>
                  <TableCell className="font-mono text-xs">{e.product_code}</TableCell>
                  <TableCell className="text-center font-semibold text-success">+{e.quantity}</TableCell>
                  <TableCell className="text-sm">{e.supplier || '—'}</TableCell>
                  <TableCell className="text-sm">{e.invoice_number || '—'}</TableCell>
                  <TableCell className="text-sm">{e.received_by || '—'}</TableCell>
                  <TableCell className="text-sm">R$ {(e.total_cost || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Registrar Entrada</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Produto *</Label>
              <Select value={form.product_id} onValueChange={v => set('product_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.status === 'Ativo').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade *</Label>
              <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Custo Unitário</Label>
              <Input type="number" step="0.01" value={form.unit_cost} onChange={e => set('unit_cost', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor</Label>
              <Input value={form.supplier} onChange={e => set('supplier', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nota Fiscal</Label>
              <Input value={form.invoice_number} onChange={e => set('invoice_number', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.received_by} onChange={e => set('received_by', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.product_id || !form.quantity}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}