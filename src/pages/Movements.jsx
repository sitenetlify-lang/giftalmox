import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/client';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ArrowLeftRight, Loader2, Search } from 'lucide-react';
import moment from 'moment';

export default function Movements() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: '', type: 'Transferência', origin: '', destination: '', quantity: 0, responsible: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: movements = [] } = useQuery({
    queryKey: ['movements'],
    queryFn: () => appClient.entities.StockMovement.list('-created_date', 200),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => appClient.entities.Product.list(),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const product = products.find(p => p.id === form.product_id);
    await appClient.entities.StockMovement.create({
      ...form,
      product_name: product?.name,
      product_code: product?.code,
      movement_date: new Date().toISOString(),
    });
    // Update location if transfer
    if (form.type === 'Transferência' && product && form.destination) {
      await appClient.entities.Product.update(product.id, { location: form.destination });
    }
    queryClient.invalidateQueries({ queryKey: ['movements'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setSaving(false);
    setFormOpen(false);
    setForm({ product_id: '', type: 'Transferência', origin: '', destination: '', quantity: 0, responsible: '', notes: '' });
  };

  const typeColors = {
    'Transferência': 'bg-accent/10 text-accent-foreground border-accent/20',
    'Ajuste': 'bg-warning/10 text-warning border-warning/20',
    'Inventário': 'bg-primary/10 text-primary border-primary/20',
  };

  const filtered = movements.filter(m =>
    !search || m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.responsible?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Movimentações Internas" subtitle={`${movements.length} registros`} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar movimentações..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setFormOpen(true)} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />Nova Movimentação
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12">
                  <ArrowLeftRight className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
                </TableCell></TableRow>
              ) : filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm">{moment(m.movement_date || m.created_date).format('DD/MM/YY HH:mm')}</TableCell>
                  <TableCell><Badge variant="outline" className={typeColors[m.type]}>{m.type}</Badge></TableCell>
                  <TableCell className="font-medium text-sm">{m.product_name}</TableCell>
                  <TableCell className="text-center font-semibold">{m.quantity}</TableCell>
                  <TableCell className="text-sm">{m.origin || '—'}</TableCell>
                  <TableCell className="text-sm">{m.destination || '—'}</TableCell>
                  <TableCell className="text-sm">{m.responsible || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{m.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Movimentação</DialogTitle></DialogHeader>
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
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Ajuste">Ajuste</SelectItem>
                  <SelectItem value="Inventário">Inventário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade *</Label>
              <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Input value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="Local de origem" />
            </div>
            <div className="space-y-1.5">
              <Label>Destino</Label>
              <Input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Local de destino" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.responsible} onChange={e => set('responsible', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.product_id || !form.quantity}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}