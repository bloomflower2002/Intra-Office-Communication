import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={clsx('w-full rounded-xl bg-white dark:bg-ink-100 shadow-xl border border-ink-100', sizeClasses[size])}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
                <DialogTitle className="text-base font-semibold text-ink-900">{title}</DialogTitle>
                <button onClick={onClose} className="text-ink-400 hover:text-ink-700 rounded-md p-1 hover:bg-ink-100">
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-5 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>
              {footer && <div className="px-5 py-4 border-t border-ink-100 flex justify-end gap-2">{footer}</div>}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
