'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

interface MenuItem {
  id: string;
  label: string;
  action: () => void;
}

interface SidebarProps {
  activeTab: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  menuItems: MenuItem[];
}

export default function Sidebar({ activeTab, isMenuOpen, setIsMenuOpen, menuItems }: SidebarProps) {
  const router = useRouter();

  return (
    <div className={`${isMenuOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-gray-950 shadow-lg relative z-20`}>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Menú
          </h2>
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.action();
                setIsMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-500'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-4">
            <div onClick={() => setIsMenuOpen(false)}>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

