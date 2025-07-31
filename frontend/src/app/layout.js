// File: frontend/src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

// --- UPDATE: Use relative paths to import components ---
// This is a more direct way to import and avoids any alias configuration issues.
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import GoogleAnalytics from '../components/utility/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dakshina Dance Company',
  description: 'Exploring classical and contemporary Indian dance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Google Analytics component */}
        <GoogleAnalytics />

        {/* Navbar will be at the top of every page */}
        <Navbar />
        
        {/* The 'children' prop is where the content of each individual page will go */}
        <main>{children}</main>
        
        {/* Footer will be at the bottom of every page */}
        <Footer />
      </body>
    </html>
  );
}
