import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appClient } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const categories = ['Embalagens', 'Papelaria', 'Brindes', 'Eletrônicos', 'Tecidos', 'Acessórios', 'Ferramentas', 'Limpeza', 'Escritório', 'Outros'];
const units = ['UN', 'CX', 'KG', 'MT', 'LT', 'PC', 'RL', 'FD', 'PT', 'GL'];
const statuses = ['Ativo', 'Inativo', 'Descontinuado'];

const emptyProduct = {
  code: '', name: '', description: '', category: '', subcategory: '',
  unit: 'UN', current_stock: 0, min_stock: 0, max_stock: 0,
  location: '', supplier: '', unit_cost: 0, status: 'Ativo', barcode: '', image_url: ''
};

export default function ProductFormDialog({ open, onOpenChange, product }) {
  const [form, setForm] = useState(product || emptyProduct);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    if (isEdit) {
      await appClient.entities.Product.update(product.id, form);
    } else {
      await appClient.entities.Product.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setSaving(false);
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1.5">
            <Label>Código *</Label>
            <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="EX: MAT-001" />
          </div>
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do produto" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descrição detalhada" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subcategoria</Label>
            <Input value={form.subcategory} onChange={e => set('subcategory', e.target.value)} placeholder="Subcategoria" />
          </div>
          <div className="space-y-1.5">
            <Label>Unidade *</Label>
            <Select value={form.unit} onValueChange={v => set('unit', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Qtd. Atual</Label>
            <Input type="number" value={form.current_stock} onChange={e => set('current_stock', Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Estoque Mínimo</Label>
            <Input type="number" value={form.min_stock} onChange={e => set('min_stock', Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Estoque Máximo</Label>
            <Input type="number" value={form.max_stock} onChange={e => set('max_stock', Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Custo Unitário (R$)</Label>
            <Input type="number" step="0.01" value={form.unit_cost} onChange={e => set('unit_cost', Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Localização</Label>
            <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ex: Prateleira A3" />
          </div>
          <div className="space-y-1.5">
            <Label>Fornecedor</Label>
            <Input value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="Nome do fornecedor" />
          </div>
          <div className="space-y-1.5">
            <Label>Código de Barras</Label>
            <Input value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="Código de barras" />
          </div>
          <div className="space-y-1.5">
            <Label>URL da Imagem</Label>
            <Input value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
            {form.image_url && <img src={form.image_url} alt="" className="h-16 w-16 rounded-lg object-cover mt-1" />}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.code || !form.name || !form.category}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}