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
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-300">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {/* --- UPDATE: Added new link for Divya Nayar --- */}
              <li><Link href="/divya-nayar" className="hover:text-white">Divya Nayar</Link></li>
              <li><Link href="/productions" className="hover:text-white">Our Work</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              <li><Link href="/blog" className="hover:text-white">Reflections</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
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
          <p>&copy; {new Date().getFullYear()} Dakshina Dance Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
