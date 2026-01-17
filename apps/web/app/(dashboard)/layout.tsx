import { redirect } from 'next/navigation';
import { getToken } from '@/lib/cookies';
import { UserProvider } from '@/contexts/user-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  if (!token) {
    redirect('/auth/login');
  }

  return (
    <UserProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
