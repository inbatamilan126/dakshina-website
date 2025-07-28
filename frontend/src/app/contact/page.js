// File: frontend/src/app/contact/page.js
'use client'; // This is an interactive page because of the form

import { useState } from 'react';

// This is our main Contact page component.
export default function ContactPage() {
  // State to hold the form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  // State to manage submission status
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Sending...');

    // For now, we'll just log the data to the console.
    // Later, we can replace this with a call to an API endpoint that sends an email.
    console.log('Form Submitted:', formData);

    // Simulate a successful submission
    setTimeout(() => {
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
  };

  return (
    <main className="min-h-screen flex-col items-center bg-gray-900 text-white p-8 md:p-24">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold">Get in Touch</h1>
          <p className="text-lg text-gray-300 mt-4">
            We'd love to hear from you. Whether you have a question about our performances, workshops, or collaborations, please feel free to reach out.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-green-400">General Inquiries</h3>
              <a href="mailto:contact@dakshina.com" className="text-lg text-gray-300 hover:text-white">
                contact@dakshina.com
              </a>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-green-400">Press & Media</h3>
              <a href="mailto:press@dakshina.com" className="text-lg text-gray-300 hover:text-white">
                press@dakshina.com
              </a>
            </div>
            {/* We can add a physical address here later */}
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea
                name="message"
                id="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-green-700 disabled:bg-gray-500"
                disabled={status === 'Sending...'}
              >
                {status === 'Sending...' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {status && status !== 'Sending...' && (
              <p className="text-center text-green-400">{status}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
