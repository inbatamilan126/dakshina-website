// File: frontend/src/components/layout/Navbar.js
'use client'; // This is an interactive component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/productions', label: 'Our Work' },
    { href: '/events', label: 'Events' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/classes', label: 'Classes' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full backdrop-blur-md z-50 text-[#dcc7b0] transition-colors duration-300 ${scrolled ? 'bg-[rgba(13,13,13,0.85)]' : 'bg-[rgba(13,13,13,0.4)]'}`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Section: Logo */}
          <div className="flex-shrink-0 md:pl-4"> {/* Added padding for medium screens and up */}
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png"
                alt="The Dakshina Dance Repertory Logo"
                width={64} 
                height={64}
                className="h-16 w-auto"
              /> 
            </Link>
          </div>

          {/* Center Section: Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium tracking-wider uppercase transition-all duration-200 hover:bg-[#8A993F] hover:text-[#111111]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Placeholder for Desktop, Mobile Menu Button for Mobile */}
          <div className="flex items-center">
            {/* This invisible placeholder has a width equal to the logo to ensure the center nav is perfectly aligned */}
            <div className="hidden md:block w-16 md:w-[80px]"></div> {/* Adjusted width to account for new padding */}

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-[#ffefbd] hover:bg-[#1a1a1a] hover:opacity-90 transition"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  // Close Icon (X)
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger Icon
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-right">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)} // Close menu on click
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
