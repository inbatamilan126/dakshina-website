// File: frontend/src/components/layout/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4">Dakshina</h3>
            <p className="text-sm">Exploring the boundaries of classical and contemporary Indian dance.</p>
            {/* --- NEW QUOTE --- */}
            <p className="text-sm italic text-gray-500 mt-4">
              "The artist’s task is to deepen the mystery."
              <span className="block not-italic mt-1">— Francis Bacon</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {/* --- UPDATE: Simplified links --- */}
              <li><Link href="/productions" className="hover:text-white">Our Work</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              {/* We can add a 'Workshops' link here later */}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="mailto:contact@dakshina.com" className="hover:text-white">contact@dakshina.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          {/* --- UPDATE: Changed company name --- */}
          <p>&copy; {new Date().getFullYear()} The Dakshina Dance Repertory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
