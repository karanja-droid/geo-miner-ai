// @ts-ignore
import React from 'react';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  items: { label: string; icon?: React.ReactNode; onClick: () => void }[];
  title?: string;
  width?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, items, title, width = 'w-64' }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-40 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.aside
          className={`bg-white shadow-lg h-full ${width} relative`}
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-lg text-mining-primary">{title}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
          </div>
          <nav className="mt-4 space-y-1 px-4">
            {items.map((item, i) => (
              <button
                key={i}
                className="flex items-center w-full px-3 py-2 rounded hover:bg-mining-primary hover:text-white transition-colors"
                onClick={item.onClick}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </nav>
        </motion.aside>
        <div className="flex-1" />
      </motion.div>
    )}
  </AnimatePresence>
); 