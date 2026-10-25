'use client';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui';

/** Uses the native <dialog> element: focus trapping, Escape to close and inert background come from the browser. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-labelledby="modal-title"
      className="w-[min(92vw,34rem)] rounded-lg p-0 shadow-xl backdrop:bg-black/50">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4"><h2 id="modal-title" className="text-xl font-semibold text-brand">{title}</h2><Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">✕</Button></div>
        {open && children}
      </div>
    </dialog>
  );
}
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }: { open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</Button></div>
    </Modal>
  );
}
