// File: frontend/src/components/layout/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#28401c] text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-serif font-bold text-[#dcc7b0] mb-4">The Dakshina Dance Repertory</h3>
            <p className="text-sm text-gray-400">Exploring the boundaries of classical and contemporary Indian dance.</p>
            <p className="text-sm italic text-gray-500 mt-4">
              &ldquo;The artist&rsquo;s task is to deepen the mystery.&rdquo;
              <span className="block not-italic mt-1">— Francis Bacon</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-[#dcc7b0]">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/productions" className="hover:text-[#acae2c]">Our Work</Link></li>
              <li><Link href="/events" className="hover:text-[#acae2c]">Events</Link></li>
              <li><Link href="/workshops" className="hover:text-[#acae2c]">Workshops</Link></li>
              <li><Link href="/classes" className="hover:text-[#acae2c]">Classes</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-[#dcc7b0]">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="mailto:contact@dakshina.com" className="hover:text-[#acae2c]">contact@dakshina.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-[#55682f] pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} The Dakshina Dance Repertory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
