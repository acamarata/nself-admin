import { type Metadata } from 'next'
import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProjectStateWrapper } from '@/components/ProjectStateWrapper'
import { GlobalDataProvider } from '@/components/GlobalDataProvider'
import { SSEProvider } from '@/components/SSEProvider'
import { ErrorSuppressor } from '@/components/ErrorSuppressor'
import { PWARegister } from '@/components/PWARegister'
import '@/styles/tailwind.css'
// DEV ONLY - REMOVE FOR PRODUCTION
import '@/services/DevLogger'

export const metadata: Metadata = {
  title: {
    template: '%s - nAdmin',
    default: 'nAdmin - nself Administration Overview',
  },
  description: 'Web-based administration interface for the nself CLI backend stack',
  manifest: '/site.webmanifest',
  themeColor: '#0066CC',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'nAdmin',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Empty sections for now since we're not using MDX
  const allSections = {}

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full antialiased bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 bg-fixed">
        <ErrorSuppressor />
        <PWARegister />
        <AuthProvider>
          <Providers>
            <ProjectStateWrapper>
              <GlobalDataProvider>
                <SSEProvider>
                  <div className="w-full">
                    <Layout allSections={allSections}>{children}</Layout>
                  </div>
                </SSEProvider>
              </GlobalDataProvider>
            </ProjectStateWrapper>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}