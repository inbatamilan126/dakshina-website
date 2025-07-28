// File: frontend/src/components/layout/Navbar.js
'use client'; // This is an interactive component

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    // --- UPDATE: Added new link for Divya Nayar ---
    { href: '/divya-nayar', label: 'Divya Nayar' },
    { href: '/productions', label: 'Our Work' },
    { href: '/events', label: 'Events' },
    { href: '/blog', label: 'Reflections' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-sm sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Company Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold font-serif">
              Dakshina
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
