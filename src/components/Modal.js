import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

export default function Modal({ open, onClose, children }) {
  const modalRoot = typeof window !== "undefined" ? document.body : null;
  const ref = useRef();

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && ref.current) ref.current.focus();
  }, [open]);

  if (!open || !modalRoot) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        tabIndex={-1}
      >
        <motion.div
          ref={ref}
          className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full relative border border-gray-700 max-h-[70vh] overflow-y-auto pt-10 outline-none"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          tabIndex={0}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    modalRoot
  );
}
