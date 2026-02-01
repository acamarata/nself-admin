'use client'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

/**
 * Drawer - Slide-out panel from right/left (wrapper around Sheet)
 *
 * Re-exports Sheet components with more intuitive naming for drawer use case
 *
 * @example
 * ```tsx
 * <Drawer open={isOpen} onOpenChange={setIsOpen}>
 *   <DrawerTrigger asChild>
 *     <Button>Open Settings</Button>
 *   </DrawerTrigger>
 *   <DrawerContent side="right">
 *     <DrawerHeader>
 *       <DrawerTitle>Settings</DrawerTitle>
 *       <DrawerDescription>Configure your preferences</DrawerDescription>
 *     </DrawerHeader>
 *     <div className="p-4">Content here</div>
 *     <DrawerFooter>
 *       <Button>Save</Button>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 * ```
 */
export const Drawer = Sheet
export const DrawerTrigger = SheetTrigger
export const DrawerContent = SheetContent
export const DrawerHeader = SheetHeader
export const DrawerFooter = SheetFooter
export const DrawerTitle = SheetTitle
export const DrawerDescription = SheetDescription
export const DrawerClose = SheetClose
