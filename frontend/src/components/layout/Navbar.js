// File: frontend/src/components/layout/Navbar.js
'use client'; // This is an interactive component

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/productions', label: 'Our Work' },
    { href: '/events', label: 'Events' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/classes', label: 'Classes' },
  ];

  return (
    <nav className="bg-[#0d0d0d] bg-opacity-95 backdrop-blur-md sticky top-0 z-50 text-[#dcc7b0]">
      <div className="max-w-full mx-auto px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo / Company Name */}
          <div className="flex-shrink-0 flex-1">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/logo.png"
                alt="The Dakshina Dance Repertory Logo"
                width={90} 
                height={90}
                className="h-24 w-auto"
              /> 
              <span className="text-xl font-bold font-serif tracking-wide text-[#8A993F]">
                The Dakshina Dance Repertory
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-[#8A993F] hover:text-[#0d0d0d]"
                >
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
              className="bg-[#8A993F] inline-flex items-center justify-center p-2 rounded-md text-[#0d0d0d] hover:opacity-90 transition"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 rounded-md text-base font-medium hover:bg-[#8A993F] hover:text-[#0d0d0d]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
