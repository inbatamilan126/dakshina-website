// File: frontend/src/app/classes/page.js
'use client'; // This is now an interactive page because of the form

import { useState, useEffect } from 'react';
import Image from 'next/image';

// This is our main Classes page component.
export default function ClassesPage() {
  // State for the page's descriptive content
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '', 
    message: '',
  });
  const [status, setStatus] = useState('');
  
  const strapiUrl = 'http://localhost:1337';

  // Fetch the page content when the component mounts
  useEffect(() => {
    async function getClassesPageContent() {
      try {
        const res = await fetch('http://localhost:1337/api/classes-page?populate=*');
        if (!res.ok) throw new Error('Failed to fetch data');
        const responseData = await res.json();
        setPageData(responseData.data);
      } catch (error) {
        console.error("Error fetching classes page content:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getClassesPageContent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- UPDATED: This function now sends the data to your backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const res = await fetch('http://localhost:1337/api/inquiries/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Something went wrong. Please try again.');
      }

      const result = await res.json();
      setStatus('Inquiry sent successfully! We will get in touch with you soon.');
      setFormData({ name: '', email: '', countryCode: '+91', phone: '', message: '' });

    } catch (error) {
      console.error("Inquiry submission failed:", error);
      setStatus(`Error: ${error.message}`);
    }
  };
  
  const countryCodes = [
      { name: 'India', code: '+91' },
      { name: 'United States', code: '+1' },
      { name: 'United Kingdom', code: '+44' },
      { name: 'Australia', code: '+61' },
      // ... (full list of countries)
  ];

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><h1 className="text-4xl">Loading...</h1></main>;
  }

  if (!pageData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-4xl">Could not load page content.</h1>
      </main>
    );
  }

  const { title, description, image } = pageData;
  const imageUrl = strapiUrl + image.url;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Banner Image */}
      <div className="relative w-full h-80">
        <Image src={imageUrl} alt={title || 'A dancer in motion'} fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-6xl font-serif font-bold text-center">{title}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-8 md:p-16">
        <div className="prose prose-invert lg:prose-xl max-w-none text-lg text-gray-300 mb-12">
          {description.map((block, index) => (
            <p key={index} className="mb-4">{block.children.map(child => child.text).join('')}</p>
          ))}
        </div>
        
        {/* --- Inquiry Form --- */}
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-6">Inquire About Classes</h2>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="flex">
                <select 
                  name="countryCode" 
                  value={formData.countryCode} 
                  onChange={handleChange}
                  className="bg-gray-700 text-white p-3 rounded-l-lg border border-r-0 border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {countryCodes.map(country => (
                    <option key={country.code} value={country.code}>{country.name} ({country.code})</option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  name="phone" 
                  id="phone" 
                  required
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full bg-gray-700 text-white p-3 rounded-r-lg border border-gray-600 focus:ring-2 focus:ring-green-500" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Your Message or Question</label>
              <textarea name="message" id="message" required rows="5" value={formData.message} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-green-500"></textarea>
            </div>
            <div>
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-green-700 disabled:bg-gray-500" disabled={status === 'Sending...'}>
                {status === 'Sending...' ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
            {status && status !== 'Sending...' && (
              <p className="text-center text-green-400 mt-4">{status}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
