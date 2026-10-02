import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { TestProvider } from '@/context/TestContext';
import { ProjectSubmissionsProvider } from '@/context/ProjectSubmissionsContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AIvalytics LMS - Learning Management System',
  description: 'Enterprise Course Management and AI Learning Analytics Platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8faf9] text-gray-900">
        <AuthProvider>
          <SidebarProvider>
            <TestProvider>
              <ProjectSubmissionsProvider>{children}</ProjectSubmissionsProvider>
            </TestProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
