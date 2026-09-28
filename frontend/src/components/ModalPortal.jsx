import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Global ModalPortal Component
 * Teleports dialogs directly to document.body, creates an isolated stacking context,
 * locks background scrolling, intercepts backdrop clicks, and enforces the centralized z-index hierarchy.
 */
export default function ModalPortal({
  isOpen,
  onClose,
  children,
  isEmergency = false,
  preventBackdropClose = false,
  backdropClassName = ''
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scrolling while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose && !preventBackdropClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventBackdropClose]);

  if (!isOpen) return null;

  const zIndexClass = isEmergency ? 'z-[1100]' : 'z-[1000]';
  const defaultBackdrop = isEmergency 
    ? 'bg-[#0B1E36]/50 backdrop-blur-[2px]' 
    : 'bg-[#0B1E36]/40 backdrop-blur-[2px]';

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-3 sm:p-4 overflow-y-auto ${defaultBackdrop} ${backdropClassName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose && !preventBackdropClose) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative z-10 w-full flex justify-center max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
