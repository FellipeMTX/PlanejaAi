'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getWallet, deleteWallet, type Wallet } from '@/lib/api/wallets';
import { createAccount, deleteAccount } from '@/lib/api/accounts';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function WalletDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  async function loadWallet() {
    const response = await getWallet(params.id as string);
    if (response.data) {
      setWallet(response.data);
    } else {
      toast.error('Carteira nao encontrada');
      router.push('/carteiras');
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleCreateAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCreatingAccount(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const balance = parseFloat(formData.get('balance') as string) || 0;

    const response = await createAccount(params.id as string, { name, balance });

    if (response.data) {
      toast.success('Conta criada com sucesso!');
      setShowAccountForm(false);
      loadWallet();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao criar conta');
    }

    setIsCreatingAccount(false);
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta? Todas as transacoes serao excluidas.')) {
      return;
    }

    const response = await deleteAccount(accountId);

    if (response.data) {
      toast.success('Conta excluida com sucesso!');
      loadWallet();
    } else {
      toast.error(response.errors?.[0] || 'Erro ao excluir conta');
    }
  }

  async function handleDeleteWallet() {
    if (!confirm('Tem certeza que deseja excluir esta carteira? Todas as contas e transacoes serao excluidas.')) {
      return;
    }

    const response = await deleteWallet(params.id as string);

    if (response.data) {
      toast.success('Carteira excluida com sucesso!');
      router.push('/carteiras');
    } else {
      toast.error(response.errors?.[0] || 'Erro ao excluir carteira');
    }
  }

  if (isLoading || !wallet) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const totalBalance = wallet.accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/carteiras">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${wallet.color}20` }}
            >
              <CreditCard className="h-5 w-5" style={{ color: wallet.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{wallet.name}</h1>
              <p className="text-muted-foreground">
                Saldo total: {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </div>
        <Button variant="destructive" size="icon" onClick={handleDeleteWallet}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contas</h2>
        <Button onClick={() => setShowAccountForm(!showAccountForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {showAccountForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="account-name">Nome</Label>
                <Input
                  id="account-name"
                  name="name"
                  placeholder="Ex: Conta Corrente"
                  required
                  disabled={isCreatingAccount}
                />
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor="balance">Saldo Inicial</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isCreatingAccount}
                />
              </div>
              <Button type="submit" disabled={isCreatingAccount}>
                {isCreatingAccount ? 'Criando...' : 'Criar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {wallet.accounts.length === 0 ? (
        <Card className="p-8 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma conta</h3>
          <p className="text-muted-foreground mb-4">
            Adicione uma conta para comecar a registrar transacoes
          </p>
          <Button onClick={() => setShowAccountForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Conta
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {wallet.accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">{account.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteAccount(account.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    Number(account.balance) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatCurrency(Number(account.balance))}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
