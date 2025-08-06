// File: frontend/src/components/layout/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#DADADA]">
      <div className="max-w-full mx-auto px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-4">The Dakshina Dance Repertory</h3>
            <p className="text-sm">Exploring the boundaries of classical and contemporary Indian dance.</p>
            <p className="text-sm italic text-gray-500 mt-4">
              &ldquo;The artist&rsquo;s task is to deepen the mystery.&rdquo;
              <span className="block not-italic mt-1">— Francis Bacon</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="hover:text-[#8A993F] transition-colors">Home</Link></li>
              <li><Link href="/productions" className="hover:text-[#8A993F] transition-colors">Our Work</Link></li>
              <li><Link href="/events" className="hover:text-[#8A993F] transition-colors">Events</Link></li>
              <li><Link href="/workshops" className="hover:text-[#8A993F] transition-colors">Workshops</Link></li>
              <li><Link href="/classes" className="hover:text-[#8A993F] transition-colors">Classes</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="mailto:contact@dakshinadance.com" className="hover:text-[#8A993F] transition-colors">contact@dakshinadance.com</a></li>
              {/* Add social media links here later */}
            </ul>
          </div>

        </div>
        <div className="mt-0 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} The Dakshina Dance Repertory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
