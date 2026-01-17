'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCategories,
  createCategory,
  deleteCategory,
  type Category,
} from '@/lib/api/categories';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  async function loadCategories() {
    const response = await getCategories();
    if (response.data) {
      setCategories(response.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const color = formData.get('color') as string;
    const parentId = (formData.get('parentId') as string) || undefined;

    const response = await createCategory({ name, color, parentId });

    if (response.data) {
      toast.success('Categoria criada com sucesso!');
      setShowForm(false);
      loadCategories();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao criar categoria');
    }

    setIsCreating(false);
  }

  async function handleDelete(id: string, transactionCount: number) {
    if (transactionCount > 0) {
      toast.error(
        `Esta categoria possui ${transactionCount} transacao(es). Remova-as antes de excluir.`
      );
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    const response = await deleteCategory(id);

    if (response.data) {
      toast.success('Categoria excluida com sucesso!');
      loadCategories();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao excluir categoria');
    }
  }

  // Separate parent categories (no parentId) from child categories
  const parentCategories = categories.filter((c) => !c.parent);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">{categories.length} categoria(s)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Alimentacao"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  defaultValue="#6B7280"
                  className="w-16 h-9 p-1"
                  disabled={isCreating}
                />
              </div>
              <div className="min-w-[200px] space-y-2">
                <Label htmlFor="parentId">Categoria Pai (opcional)</Label>
                <select
                  id="parentId"
                  name="parentId"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  disabled={isCreating}
                >
                  <option value="">Nenhuma (categoria principal)</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma categoria</h3>
          <p className="text-muted-foreground mb-4">
            Crie categorias para organizar suas transacoes
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Categoria
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-base font-medium">{category.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(category.id, category._count.transactions)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category._count.transactions} transacao(es)
                </p>
                {category.children.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {category.children.map((child) => (
                      <span
                        key={child.id}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: `${child.color}20`,
                          color: child.color,
                        }}
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
