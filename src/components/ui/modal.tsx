'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

/**
 * Modal - Dialog modal (wrapper around Dialog)
 *
 * Re-exports Dialog components with more intuitive naming for modal use case
 *
 * @example
 * ```tsx
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <ModalTrigger asChild>
 *     <Button>Delete Item</Button>
 *   </ModalTrigger>
 *   <ModalContent>
 *     <ModalHeader>
 *       <ModalTitle>Are you sure?</ModalTitle>
 *       <ModalDescription>This action cannot be undone.</ModalDescription>
 *     </ModalHeader>
 *     <ModalFooter>
 *       <ModalClose asChild>
 *         <Button variant="outline">Cancel</Button>
 *       </ModalClose>
 *       <Button variant="destructive">Delete</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * ```
 */
export const Modal = Dialog
export const ModalTrigger = DialogTrigger
export const ModalContent = DialogContent
export const ModalHeader = DialogHeader
export const ModalFooter = DialogFooter
export const ModalTitle = DialogTitle
export const ModalDescription = DialogDescription
export const ModalClose = DialogClose
