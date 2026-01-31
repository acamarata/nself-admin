'use client'

import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import {
  navigation,
  type NavGroup,
  type NavLink as NavLinkType,
} from '@/lib/navigation'
import { remToPx } from '@/lib/remToPx'
import { CloseButton } from '@headlessui/react'

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
        'flex justify-between gap-2 py-1 pr-3 pl-7 text-sm transition',
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

function DisabledNavItem({ link }: { link: NavLinkType }) {
  const badgeText =
    typeof link.badge === 'string'
      ? link.badge
      : link.badge
        ? link.badge.text
        : 'Soon'

  return (
    <span
      className="flex cursor-not-allowed justify-between gap-2 py-1 pr-3 pl-4 text-sm text-zinc-400 select-none dark:text-zinc-600"
      title={link.description}
    >
      <span className="truncate">{link.title}</span>
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
        {badgeText}
      </span>
    </span>
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
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
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
    group.links.findIndex(
      (link) => link.href === pathname && !link.disabled,
    ) !== -1

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
        className="flex w-full items-center justify-between text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
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
                  <motion.li
                    key={link.href}
                    layout="position"
                    className="relative"
                  >
                    {link.disabled ? (
                      <DisabledNavItem link={link} />
                    ) : (
                      <>
                        <NavLink
                          href={link.href}
                          active={link.href === pathname}
                        >
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
                      </>
                    )}
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
        <TopLevelNavItem href="/help">Documentation</TopLevelNavItem>
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
