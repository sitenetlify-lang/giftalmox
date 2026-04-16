import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { appClient } from '@/api/client';
import TopBar from '@/components/layout/TopBar';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

export default function Products() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => appClient.entities.Product.list('-created_date'),
  });

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = async () => {
    await appClient.entities.Product.delete(deleteId);
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setDeleteId(null);
  };

  const statusColors = {
    'Ativo': 'bg-success/10 text-success border-success/20',
    'Inativo': 'bg-muted text-muted-foreground border-border',
    'Descontinuado': 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div>
      <TopBar title="Produtos e Materiais" subtitle={`${filtered.length} itens cadastrados`} />
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, código, fornecedor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {['Embalagens', 'Papelaria', 'Brindes', 'Eletrônicos', 'Tecidos', 'Acessórios', 'Ferramentas', 'Limpeza', 'Escritório', 'Outros'].map(c =>
                <SelectItem key={c} value={c}>{c}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Descontinuado">Descontinuado</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditProduct(null); setFormOpen(true); }} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />Novo Produto
          </Button>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Estoque</TableHead>
                <TableHead className="text-center">Mínimo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Custo Un.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-12">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                </TableCell></TableRow>
              ) : (
                filtered.map(p => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">{p.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.image_url && <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />}
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          {p.supplier && <p className="text-xs text-muted-foreground">{p.supplier}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.category}</TableCell>
                    <TableCell className="text-center">
                      <span className={p.min_stock > 0 && p.current_stock <= p.min_stock ? 'text-destructive font-semibold' : 'font-medium'}>
                        {p.current_stock} {p.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{p.min_stock}</TableCell>
                    <TableCell className="text-sm">{p.location || '—'}</TableCell>
                    <TableCell className="text-sm">R$ {(p.unit_cost || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[p.status]}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(p); setFormOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {formOpen && (
        <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}