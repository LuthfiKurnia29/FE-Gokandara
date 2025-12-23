import { type ReactNode } from 'react';

import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { ThemeProvider } from 'next-themes';

// Import localStorage polyfill for SSR
import '@/lib/localStorage-polyfill';
import '@/app/globals.css';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { LoginScreen } from '@/components/login-screen';
import { AuthProvider } from '@/components/providers/auth-provider';
import QueryProvider from '@/components/providers/query-provider';
import { TitleProvider } from '@/components/providers/title-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
});

export const metadata: Metadata = {
  title: 'Gokandara',
  description: 'Sistem Informasi Pengelolaan Data Gokandara'
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    // ? https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    // ? https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} text-foreground bg-white antialiased`}
        suppressHydrationWarning>
        <QueryProvider>
          <TitleProvider>
            <AuthProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </AuthProvider>
          </TitleProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default Layout;
