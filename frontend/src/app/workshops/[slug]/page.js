'use client'; // This page is interactive for booking tickets

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from "framer-motion";

// --- Helper Functions ---
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(timeString) {
    if (!timeString) return '';
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// --- Animated Section Component ---
function AnimatedSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  return (
    <motion.section ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants} transition={{ duration: 0.8, ease: "easeOut" }}>
      {children}
    </motion.section>
  );
}

// --- Main Page Component ---
export default function WorkshopPage({ params }) {
  const [workshop, setWorkshop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRzpReady, setIsRzpReady] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });
  const [formError, setFormError] = useState('');
  
  const [selectedTier, setSelectedTier] = useState(null);

  const strapiUrl = 'http://localhost:1337';

  useEffect(() => {
    async function fetchData() {
      if (!params.slug) return;
      setIsLoading(true);
      try {
        const res = await fetch(`${strapiUrl}/api/workshops?filters[slug][$eq]=${params.slug}&populate=*`);
        const workshopData = await res.json();
        setWorkshop(workshopData.data?.[0] || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.slug]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRzpReady(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookClick = () => {
    if (!selectedTier) {
      alert("Please select a ticket tier.");
      return;
    }
    if (!formData.name.trim()) {
        setFormError('Please enter your full name.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError('');
    setShowConfirmModal(true);
  };
  
  const proceedToPayment = async () => {
    if (!isRzpReady || !window.Razorpay || !selectedTier || !workshop) return;
    setShowConfirmModal(false);

    try {
      const orderRes = await fetch(`${strapiUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTier.price * 100,
          workshopId: workshop.id,
          workshopSlug: workshop.slug,
          tierName: selectedTier.name,
          quantity: 1,
          userName: formData.name,
          userQuestion: formData.question
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create Razorpay order.');
      const orderDetails = await orderRes.json();
      
      const razorpayKeyId = 'rzp_test_tn3D5B6Bh0HPcH'; // Replace with your key

      const options = {
        key: razorpayKeyId,
        amount: orderDetails.amount,
        currency: "INR",
        name: "The Dakshina Dance Repertory",
        description: `Ticket: ${selectedTier.name} for ${workshop.title}`,
        image: "https://placehold.co/100x100/16a34a/white?text=D",
        order_id: orderDetails.id,
        
        handler: async (response) => {
          const verifyRes = await fetch(`${strapiUrl}/api/orders/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (!verifyRes.ok) {
             const errorResult = await verifyRes.json();
             throw new Error(errorResult.error?.message || 'Payment verification failed.');
          }

          const result = await verifyRes.json();
          if (result.status === 'ok') {
            alert('Payment successful! Your workshop confirmation has been sent to your email.');
            window.location.reload();
          } else {
            throw new Error(result.message || 'Payment verification failed.');
          }
        },
        prefill: { name: formData.name, email: formData.email },
        notes: { 
          eventCode: workshop.slug,
          tierName: selectedTier.name,
          quantity: 1,
          userName: formData.name,
          userQuestion: formData.question
        },
        theme: { color: "#8A993F" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment process failed:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#111111] text-[#F5EFEA]"><h1 className="text-4xl">Loading Workshop...</h1></main>;
  }

  if (!workshop) {
    return <main className="flex min-h-screen items-center justify-center bg-[#111111] text-[#F5EFEA]"><h1 className="text-4xl">Workshop Not Found</h1></main>;
  }

  const { title, description, banner_desktop, banner_mobile, schedule, ticket_tiers, venue, start_date, end_date } = workshop;
  const desktopBannerUrl = strapiUrl + banner_desktop.url;
  const mobileBannerUrl = strapiUrl + banner_mobile.url;
  
  const now = new Date();
  const hasStarted = new Date(start_date) < now;
  const hasEnded = new Date(end_date).setHours(23, 59, 59, 999) < now;

  return (
    <>
      {showConfirmModal && (
        <ConfirmationModal
          formData={formData}
          onConfirm={proceedToPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      <main className="min-h-screen bg-[#111111] text-[#F5EFEA] pt-20">
        
        <section className="relative w-full h-[60vh] md:h-[80vh]">
          <div className="hidden md:block w-full h-full"><Image src={desktopBannerUrl} alt={title} fill style={{objectFit: 'cover'}} priority /></div>
          <div className="md:hidden w-full h-full"><Image src={mobileBannerUrl} alt={title} fill style={{objectFit: 'cover'}} priority /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center p-8"><div className="text-center max-w-4xl"><h1 className="text-5xl md:text-7xl font-serif font-bold text-white">{title}</h1></div></div>
        </section>

        <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          {/* --- Right Column (Booking) - Appears first in code for mobile-first layout --- */}
          <div className="lg:col-span-1 lg:order-last">
            {hasEnded ? (
              <div className="bg-[#1A1A1A] rounded-lg p-6 text-center sticky top-24 border border-[#2A2A2A]"><h2 className="text-2xl font-bold text-white">Registration Closed</h2><p className="text-[#DADADA] mt-2">This workshop has already concluded.</p></div>
            ) : hasStarted ? (
              <div className="bg-[#1A1A1A] rounded-lg p-6 text-center sticky top-24 border border-[#2A2A2A]"><h2 className="text-2xl font-bold text-white">Registration Closed</h2><p className="text-[#DADADA] mt-2">This workshop is currently in progress.</p></div>
            ) : (
              <div className="bg-[#1A1A1A] rounded-lg p-6 sticky top-24 border border-[#2A2A2A]">
                <h2 className="text-2xl font-bold text-center text-white mb-4">Register Now</h2>
                <p className="text-center text-[#DADADA] mb-6">{venue || 'Venue to be announced'}</p>
                <div className="space-y-3 mb-6">
                  {ticket_tiers.map(tier => {
                    const remainingTickets = tier.capacity - tier.tickets_sold;
                    const isSoldOut = remainingTickets <= 0;
                    const isSelected = selectedTier?.id === tier.id;
                    return (
                      <div key={tier.id} className={`p-3 rounded-md transition-all ${isSoldOut ? 'opacity-50' : ''} ${isSelected ? 'bg-[#8A993F] text-black' : 'bg-[#111111] hover:bg-[#2A2A2A]'}`}>
                        <div className="flex items-center">
                          <input type="radio" id={`tier_${tier.id}`} name="tier" disabled={isSoldOut} checked={isSelected} onChange={() => { setSelectedTier(tier); }} className="h-5 w-5 text-[#8A993F] bg-gray-700 border-gray-600 focus:ring-[#8A993F]"/>
                          <label htmlFor={`tier_${tier.id}`} className="ml-4 flex-grow cursor-pointer"><span className="font-bold text-white">{tier.name}</span><span className="ml-2 text-gray-400">(₹{tier.price})</span></label>
                          {isSoldOut && <span className="text-red-500 font-bold">Sold Out</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-4 mb-6">
                   <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#DADADA] mb-2">Full Name</label>
                      <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-[#111111] text-white p-3 rounded-lg border border-[#2A2A2A]"/>
                   </div>
                   <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#DADADA] mb-2">Email</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" className="w-full bg-[#111111] text-white p-3 rounded-lg border border-[#2A2A2A]"/>
                   </div>
                   <div>
                      <label htmlFor="question" className="block text-sm font-medium text-[#DADADA] mb-2">Question for the Panel (Optional)</label>
                      <textarea name="question" id="question" rows="4" value={formData.question} onChange={handleInputChange} className="w-full bg-[#111111] text-white p-3 rounded-lg border border-[#2A2A2A]"></textarea>
                   </div>
                </div>
                {formError && <p className="text-red-500 mt-2 text-sm text-center mb-4">{formError}</p>}

                <button onClick={handleBookClick} disabled={!isRzpReady || !selectedTier} className="w-full bg-[#8A993F] text-[#111111] font-bold py-3 px-6 rounded-lg hover:bg-[#F5EFEA] disabled:bg-gray-500">
                  {isRzpReady ? (selectedTier ? `Register (₹${selectedTier.price})` : 'Select a Tier') : 'Loading...'}
                </button>
              </div>
            )}
          </div>

          {/* Left Column: Description & Schedule */}
          <div className="lg:col-span-2">
            <AnimatedSection><section className="prose prose-invert max-w-none text-lg text-[#DADADA] lg:prose-xl">{description.map((block, index) => (<p key={index} className="mb-4">{block.children.map(child => child.text).join('')}</p>))}</section></AnimatedSection>
            <AnimatedSection><section className="mt-12"><h2 className="text-3xl font-bold text-[#8A993F] mb-6">Schedule</h2><div className="space-y-4">{schedule.map(session => (<div key={session.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]"><p className="font-bold text-white">{formatDate(session.date)}</p><p className="text-[#DADADA]">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>{session.topic && <p className="text-gray-400 mt-1 italic">Topic: {session.topic}</p>}</div>))}</div></section></AnimatedSection>
          </div>

        </div>
      </main>
    </>
  );
}

// --- UPDATED Confirmation Modal ---
function ConfirmationModal({ formData, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-xl p-8 max-w-sm w-full text-center border border-[#2A2A2A]">
        <h3 className="text-2xl font-bold text-white mb-4">Confirm Your Details</h3>
        <p className="text-[#DADADA] mb-6">Your confirmation will be sent to this email. Please make sure it is correct.</p>
        <p className="bg-[#111111] text-[#8A993F] font-mono p-3 rounded-md mb-8 break-words">{formData.email}</p>
        <div className="flex justify-between items-center gap-4">
          <button onClick={onCancel} className="w-full text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Edit</button>
          <button onClick={onConfirm} className="w-full bg-[#8A993F] text-[#111111] font-bold py-3 px-4 text-lg rounded-lg hover:bg-[#F5EFEA]">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );
}
