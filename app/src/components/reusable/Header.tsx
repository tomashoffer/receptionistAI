'use client';

import React from 'react';
import { Bars3Icon, CheckIcon } from '@heroicons/react/24/outline';
import LogoutButton from '@/components/LogoutButton';
import DarkModeToggle from '@/components/DarkModeToggle';

interface HeaderProps {
  user: any;
  activeBusiness: any;
  businesses: any[];
  isBusinessDropdownOpen: boolean;
  setIsBusinessDropdownOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  handleSetActiveBusiness: (businessId: string) => void;
}

export default function Header({
  user,
  activeBusiness,
  businesses,
  isBusinessDropdownOpen,
  setIsBusinessDropdownOpen,
  isMenuOpen,
  setIsMenuOpen,
  handleSetActiveBusiness,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-950 shadow dark:shadow-gray-900">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Left side - Logo and Menu button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
              title="Menú"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">AI</div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Recepcionista AI</span>
            </div>
          </div>
          
          {/* Right side - Business selector and user info */}
          <div className="flex items-center space-x-8">
            {/* Business Selector with Hover */}
            <div 
              className="relative"
              onMouseEnter={() => businesses.length > 1 && setIsBusinessDropdownOpen(true)}
              onMouseLeave={() => setIsBusinessDropdownOpen(false)}
            >
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition">
                    {activeBusiness.name}
                  </h1>
                </div>
                {businesses.length > 1 && (
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {/* Dropdown Menu */}
              {isBusinessDropdownOpen && businesses.length > 1 && (
                <div className="absolute right-0 pt-2 w-64 z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="py-2">
                      {businesses.map((business: any) => (
                        <button
                          key={business.id}
                          onClick={() => {
                            handleSetActiveBusiness(business.id);
                            setIsBusinessDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950 transition ${
                            activeBusiness.id === business.id ? 'bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium text-lg ${activeBusiness.id === business.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                {business.name}
                              </p>
                            </div>
                            {activeBusiness.id === business.id && (
                              <CheckIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* User info */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

