'use client'

import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'
import { CloseButton } from '@headlessui/react'
import { navigation, type NavGroup } from '@/lib/navigation'

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li className="md:hidden">
      <CloseButton
        as={Link}
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </CloseButton>
    </li>
  )
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
}: {
  href: string
  children: React.ReactNode
  tag?: string
  active?: boolean
  isAnchorLink?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pl-7 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation(),
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0],
    ),
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let activePageIndex = group.links.findIndex(
    (link) => link.href === pathname,
  )
  let top =
    activePageIndex !== -1
      ? activePageIndex * itemHeight
      : firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex(
    (link) => link.href === pathname,
  )
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-blue-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup
  className?: string
}) {
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [pathname, sections] = useInitialValue(
    [usePathname(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation,
  )
  
  let isActiveGroup =
    group.links.findIndex((link) => link.href === pathname) !== -1
  
  // Store collapsed state in localStorage
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  useEffect(() => {
    // If this group contains the active page, expand it by default
    if (isActiveGroup) {
      setIsCollapsed(false)
      localStorage.setItem(`nav-collapsed-${group.title}`, 'false')
    } else {
      const savedState = localStorage.getItem(`nav-collapsed-${group.title}`)
      if (savedState === null) {
        // Default to collapsed for non-active groups
        setIsCollapsed(true)
      } else {
        setIsCollapsed(savedState === 'true')
      }
    }
  }, [group.title, isActiveGroup, pathname])
  
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(`nav-collapsed-${group.title}`, String(newState))
  }

  return (
    <li className={clsx('relative mt-6', className)}>
      <button
        onClick={toggleCollapsed}
        className="flex w-full items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <span>{group.title}</span>
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>
      <AnimatePresence initial={!isInsideMobileNavigation}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative mt-3 pl-2">
              <AnimatePresence initial={false}>
                {isActiveGroup && (
                  <ActivePageMarker group={group} pathname={pathname} />
                )}
              </AnimatePresence>
              <ul
                role="list"
                className="border-l border-zinc-200 dark:border-zinc-800"
              >
                {group.links.map((link) => (
                  <motion.li key={link.href} layout="position" className="relative">
                    <NavLink href={link.href} active={link.href === pathname}>
                      {link.title}
                    </NavLink>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {link.href === pathname && sections.length > 0 && (
                        <motion.ul
                          role="list"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: { delay: 0.1 },
                          }}
                          exit={{
                            opacity: 0,
                            transition: { duration: 0.15 },
                          }}
                        >
                          {sections.map((section) => (
                            <li key={section.id}>
                              <NavLink
                                href={`${link.href}#${section.id}`}
                                tag={section.tag}
                                isAnchorLink
                              >
                                {section.title}
                              </NavLink>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}


export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="/">Overview</TopLevelNavItem>
        <TopLevelNavItem href="/docs">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="/support">Support</TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}