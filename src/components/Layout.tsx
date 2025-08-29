'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { Navigation } from '@/components/Navigation'
import { SectionProvider, type Section } from '@/components/SectionProvider'
import { useAuth } from '@/contexts/AuthContext'

export function Layout({
  children,
  allSections,
}: {
  children: React.ReactNode
  allSections: Record<string, Array<Section>>
}) {
  let pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const isLoginPage = pathname === '/login'
  const isBuildPage = pathname === '/build'
  const isStartPage = pathname === '/start'
  
  // Pages that should render without navigation
  const isFullscreenPage = isLoginPage || isBuildPage || isStartPage

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isAuthenticated && !isLoginPage) {
      router.push('/login')
    }
    // Redirect to home if authenticated and on login page
    if (isAuthenticated && isLoginPage) {
      router.push('/')
    }
  }, [isAuthenticated, isLoginPage, router])

  // If on a fullscreen page, render children without navigation
  if (isFullscreenPage) {
    return <>{children}</>
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Normal authenticated layout
  return (
    <SectionProvider sections={allSections[pathname] ?? []}>
      <div className="h-full lg:ml-72 xl:ml-80">
        <motion.header
          layoutScroll
          className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex"
        >
          <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pt-4 lg:pb-8 xl:w-80 lg:dark:border-white/10">
            <div className="hidden lg:flex">
              <Link href="/" aria-label="Home">
                <Logo className="h-6" />
              </Link>
            </div>
            <Header />
            <Navigation className="hidden lg:mt-10 lg:block" />
          </div>
        </motion.header>
        <div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8">
          <main className="flex-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </SectionProvider>
  )
}