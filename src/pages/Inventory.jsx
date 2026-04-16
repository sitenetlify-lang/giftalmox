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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ClipboardCheck, Loader2, Search, Check } from 'lucide-react';
import moment from 'moment';

export default function Inventory() {
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: '', physical_quantity: 0, responsible: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: checks = [] } = useQuery({
    queryKey: ['inventory_checks'],
    queryFn: () => appClient.entities.InventoryCheck.list('-created_date', 200),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => appClient.entities.Product.list(),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectedProduct = products.find(p => p.id === form.product_id);

  const handleSave = async () => {
    setSaving(true);
    const systemQty = selectedProduct?.current_stock || 0;
    const diff = Number(form.physical_quantity) - systemQty;
    await appClient.entities.InventoryCheck.create({
      product_id: form.product_id,
      product_name: selectedProduct?.name,
      product_code: selectedProduct?.code,
      system_quantity: systemQty,
      physical_quantity: Number(form.physical_quantity),
      difference: diff,
      responsible: form.responsible,
      notes: form.notes,
      check_date: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['inventory_checks'] });
    setSaving(false);
    setFormOpen(false);
    setForm({ product_id: '', physical_quantity: 0, responsible: '', notes: '' });
  };

  const handleAdjust = async (check) => {
    await appClient.entities.Product.update(check.product_id, { current_stock: check.physical_quantity });
    await appClient.entities.InventoryCheck.update(check.id, { adjusted: true });
    // Log the adjustment as a movement
    await appClient.entities.StockMovement.create({
      product_id: check.product_id,
      product_name: check.product_name,
      product_code: check.product_code,
      type: 'Inventário',
      quantity: Math.abs(check.difference),
      responsible: check.responsible,
      notes: `Ajuste de inventário: ${check.system_quantity} → ${check.physical_quantity}`,
      movement_date: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['inventory_checks'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['movements'] });
  };

  const filtered = checks.filter(c =>
    !search || c.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Controle de Inventário" subtitle={`${checks.length} conferências realizadas`} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conferências..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setFormOpen(true)} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />Nova Conferência
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Sistema</TableHead>
                <TableHead className="text-center">Físico</TableHead>
                <TableHead className="text-center">Diferença</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12">
                  <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma conferência registrada</p>
                </TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm">{moment(c.check_date || c.created_date).format('DD/MM/YY HH:mm')}</TableCell>
                  <TableCell className="font-medium text-sm">{c.product_name}</TableCell>
                  <TableCell className="text-center text-sm">{c.system_quantity}</TableCell>
                  <TableCell className="text-center text-sm">{c.physical_quantity}</TableCell>
                  <TableCell className="text-center">
                    <span className={c.difference === 0 ? 'text-success font-medium' : 'text-destructive font-semibold'}>
                      {c.difference > 0 ? '+' : ''}{c.difference}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{c.responsible || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.adjusted ? 'bg-success/10 text-success border-success/20' : c.difference !== 0 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-muted text-muted-foreground'}>
                      {c.adjusted ? 'Ajustado' : c.difference !== 0 ? 'Divergente' : 'OK'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!c.adjusted && c.difference !== 0 && (
                      <Button variant="outline" size="sm" onClick={() => handleAdjust(c)}>
                        <Check className="h-3.5 w-3.5 mr-1" />Ajustar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Conferência</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Produto *</Label>
              <Select value={form.product_id} onValueChange={v => set('product_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.status === 'Ativo').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.code} — {p.name} (Sistema: {p.current_stock})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Quantidade no sistema</p>
                <p className="text-lg font-bold">{selectedProduct.current_stock} {selectedProduct.unit}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Quantidade Física *</Label>
              <Input type="number" min="0" value={form.physical_quantity} onChange={e => set('physical_quantity', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input value={form.responsible} onChange={e => set('responsible', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.product_id}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Conferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}