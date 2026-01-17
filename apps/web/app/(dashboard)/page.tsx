import { getTransactionSummary, getTransactions } from '@/lib/api/transactions';
import { getWallets } from '@/lib/api/wallets';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

export default async function DashboardPage() {
  const [summaryResponse, transactionsResponse, walletsResponse] = await Promise.all([
    getTransactionSummary(),
    getTransactions(),
    getWallets(),
  ]);

  const summary = summaryResponse.data;
  const transactions = transactionsResponse.data?.slice(0, 5) || [];
  const wallets = walletsResponse.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visao geral das suas financas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.totalBalance) : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Em {wallets.length} carteira(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {summary ? formatCurrency(summary.monthIncome) : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {summary ? formatCurrency(summary.monthExpense) : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balanco do Mes</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary && summary.monthIncome - summary.monthExpense >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {summary
                ? formatCurrency(summary.monthIncome - summary.monthExpense)
                : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transacoes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma transacao encontrada
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
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
                        {transaction.account.wallet.name} - {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Number(transaction.value))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
