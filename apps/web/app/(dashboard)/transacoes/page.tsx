'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  type Transaction,
} from '@/lib/api/transactions';
import { getWallets, type Wallet } from '@/lib/api/wallets';
import { getCategories, type Category } from '@/lib/api/categories';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  async function loadData() {
    const [txResponse, walletsResponse, categoriesResponse] = await Promise.all([
      getTransactions(),
      getWallets(),
      getCategories(),
    ]);

    if (txResponse.data) setTransactions(txResponse.data);
    if (walletsResponse.data) setWallets(walletsResponse.data);
    if (categoriesResponse.data) setCategories(categoriesResponse.data);

    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const value = parseFloat(formData.get('value') as string);
    const type = formData.get('type') as 'INCOME' | 'EXPENSE';
    const accountId = formData.get('accountId') as string;
    const categoryId = (formData.get('categoryId') as string) || undefined;
    const date = (formData.get('date') as string) || undefined;

    const response = await createTransaction({
      name,
      value,
      type,
      accountId,
      categoryId,
      date: date ? new Date(date).toISOString() : undefined,
    });

    if (response.data) {
      toast.success('Transacao criada com sucesso!');
      setShowForm(false);
      loadData();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao criar transacao');
    }

    setIsCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta transacao?')) {
      return;
    }

    const response = await deleteTransaction(id);

    if (response.data) {
      toast.success('Transacao excluida com sucesso!');
      loadData();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao excluir transacao');
    }
  }

  // Get all accounts from all wallets
  const allAccounts = wallets.flatMap((w) =>
    w.accounts.map((a) => ({ ...a, walletName: w.name, walletColor: w.color }))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacoes</h1>
          <p className="text-muted-foreground">{transactions.length} transacao(es)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transacao
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Transacao</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Descricao</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Supermercado"
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                    disabled={isCreating}
                  >
                    <option value="EXPENSE">Despesa</option>
                    <option value="INCOME">Receita</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountId">Conta</Label>
                  <select
                    id="accountId"
                    name="accountId"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                    disabled={isCreating}
                  >
                    <option value="">Selecione uma conta</option>
                    {allAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.walletName} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria (opcional)</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    disabled={isCreating}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data (opcional)</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {transactions.length === 0 ? (
        <Card className="p-8 text-center">
          <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma transacao</h3>
          <p className="text-muted-foreground mb-4">
            Registre sua primeira transacao para comecar a acompanhar suas financas
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transacao
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: transaction.category?.color
                        ? `${transaction.category.color}20`
                        : '#6B728020',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: transaction.category?.color || '#6B7280' }}
                    >
                      {transaction.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.account.wallet.name} - {transaction.account.name} |{' '}
                      {formatDate(transaction.date)}
                      {transaction.category && (
                        <span
                          className="ml-2 px-2 py-0.5 rounded-full text-xs"
                          style={{
                            backgroundColor: `${transaction.category.color}20`,
                            color: transaction.category.color,
                          }}
                        >
                          {transaction.category.name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold text-lg ${
                      transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(transaction.value))}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
