'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Wallet as WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getWallets, createWallet, type Wallet } from '@/lib/api/wallets';
import { formatCurrency } from '@/lib/utils';

export default function CarteirasPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadWallets() {
    const response = await getWallets();
    if (response.data) {
      setWallets(response.data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadWallets();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const color = formData.get('color') as string;

    const response = await createWallet({ name, color });

    if (response.data) {
      toast.success('Carteira criada com sucesso!');
      setShowForm(false);
      loadWallets();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao criar carteira');
    }

    setIsCreating(false);
  }

  const totalBalance = wallets.reduce((sum, wallet) => {
    return (
      sum + wallet.accounts.reduce((accSum, acc) => accSum + Number(acc.balance), 0)
    );
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carteiras</h1>
          <p className="text-muted-foreground">
            Saldo total: {formatCurrency(totalBalance)}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Carteira
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Nubank, Itau"
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
                  defaultValue="#8B5CF6"
                  className="w-16 h-9 p-1"
                  disabled={isCreating}
                />
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {wallets.length === 0 ? (
        <Card className="p-8 text-center">
          <WalletIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma carteira</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira carteira para comecar a gerenciar suas financas
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Carteira
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => {
            const walletBalance = wallet.accounts.reduce(
              (sum, acc) => sum + Number(acc.balance),
              0
            );

            return (
              <Link key={wallet.id} href={`/carteiras/${wallet.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${wallet.color}20` }}
                      >
                        <WalletIcon
                          className="h-5 w-5"
                          style={{ color: wallet.color }}
                        />
                      </div>
                      <CardTitle className="text-lg">{wallet.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(walletBalance)}</p>
                    <p className="text-sm text-muted-foreground">
                      {wallet.accounts.length} conta(s)
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
