'use client'; // This page is interactive for booking tickets

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Main Page Component ---
export default function ProductionPage({ params }) {
  const [production, setProduction] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRzpReady, setIsRzpReady] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const strapiUrl = 'http://localhost:1337';

  useEffect(() => {
    async function fetchData() {
      if (!params.slug) return;
      setIsLoading(true);
      try {
        // --- UPDATED: Using strapiUrl variable ---
        const prodRes = await fetch(`${strapiUrl}/api/productions?filters[slug][$eq]=${params.slug}&populate=*`);
        const prodData = await prodRes.json();
        const currentProduction = prodData.data?.[0];
        setProduction(currentProduction);

        if (currentProduction) {
          const now = new Date().toISOString();
          // --- UPDATED: Using strapiUrl variable ---
          const eventsRes = await fetch(`${strapiUrl}/api/events?filters[date][$gt]=${now}&populate[artistic_work][on][links.production-link][populate][production][populate]=*&populate[artistic_work][on][links.solo-link][populate][solo][populate]=*&populate=ticket_tiers`);
          const eventsData = await eventsRes.json();
          const allUpcomingEvents = eventsData.data || [];

          const relevantEvents = allUpcomingEvents.filter(event => {
            const component = event.artistic_work?.[0];
            return (
              component?.__component === 'links.production-link' &&
              component.production?.id === currentProduction.id
            );
          });
          
          const sortedEvents = relevantEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
          setUpcomingEvents(sortedEvents);
        }
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
  
  const validateEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleBookClick = () => {
    if (!selectedTier) {
      alert("Please select a ticket tier.");
      return;
    }
    if (!validateEmailFormat(email)) {
      setEmailError('Please enter a valid email before booking.');
      return;
    }
    setEmailError('');
    setShowConfirmModal(true);
  };
  
  const proceedToPayment = async () => {
    if (!isRzpReady || !window.Razorpay || !selectedTier || !selectedEvent) return;
    setShowConfirmModal(false);

    try {
      const purchaseQuantity = selectedTier.is_online_access ? 1 : quantity;
      // --- UPDATED: Using strapiUrl variable ---
      const orderRes = await fetch(`${strapiUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTier.price * purchaseQuantity * 100,
          eventId: selectedEvent.id,
          eventUid: selectedEvent.uid,
          tierName: selectedTier.name,
          quantity: purchaseQuantity,
        }),
      });

      if (!orderRes.ok) {
        const errorBody = await orderRes.json();
        throw new Error(errorBody.error?.message || 'Failed to create Razorpay order.');
      }
      const orderDetails = await orderRes.json();
      
      const razorpayKeyId = 'rzp_test_zL8bY0q0h5k8QJ'; // Replace with your key

      const options = {
        key: razorpayKeyId,
        amount: orderDetails.amount,
        currency: "INR",
        name: "The Dakshina Dance Repertory",
        description: `${purchaseQuantity} x Ticket(s): ${selectedTier.name} for ${production.title}`,
        image: "https://placehold.co/100x100/16a34a/white?text=D",
        order_id: orderDetails.id,
        
        handler: async (response) => {
          // --- UPDATED: Using strapiUrl variable ---
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
            alert('Payment successful! Your ticket will be sent to your email shortly.');
            window.location.reload();
          } else {
            throw new Error(result.message || 'Payment verification failed.');
          }
        },
        prefill: { email },
        notes: { 
          eventCode: selectedEvent.uid,
          tierName: selectedTier.name,
          quantity: purchaseQuantity,
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
    return <main className="flex min-h-screen items-center justify-center bg-[#111111] text-[#F5EFEA]"><h1 className="text-4xl">Loading Production...</h1></main>;
  }

  if (!production) {
    return <main className="flex min-h-screen items-center justify-center bg-[#111111] text-[#F5EFEA]"><h1 className="text-4xl">Production Not Found</h1></main>;
  }

  const { title, description, banner_desktop, banner_mobile } = production;
  const desktopBannerUrl = strapiUrl + banner_desktop.url;
  const mobileBannerUrl = strapiUrl + banner_mobile.url;

  return (
    <>
      {showConfirmModal && (
        <ConfirmationModal
          email={email}
          onConfirm={proceedToPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      <main className="min-h-screen bg-[#111111] text-[#F5EFEA]">
        
        <section className="relative w-full h-[60vh] md:h-[80vh]">
          <div className="hidden md:block w-full h-full">
            <Image src={desktopBannerUrl} alt={title} fill style={{objectFit: 'cover'}} priority />
          </div>
          <div className="md:hidden w-full h-full">
            <Image src={mobileBannerUrl} alt={title} fill style={{objectFit: 'cover'}} priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/30"></div>
          <div className="absolute inset-0 flex items-end justify-center p-8">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-center text-white mb-8">{title}</h1>
          </div>
        </section>

        {/* --- NEW WIDER, TWO-COLUMN LAYOUT --- */}
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            
            {/* --- REORDERED FOR MOBILE FIRST --- */}
            {/* Right Column (Booking) - Appears first in code, but second on desktop due to 'lg:order-last' */}
            <div className="lg:col-span-1 lg:order-last">
              {upcomingEvents.length > 0 && (
                <section id="booking" className="bg-[#1A1A1A] rounded-lg p-6 sticky top-24 shadow-lg border border-[#2A2A2A] mb-12 lg:mb-0">
                  <h2 className="text-3xl font-bold text-[#8A993F] mb-6 text-center">Book Your Tickets</h2>
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="mb-8">
                      <div className="bg-[#111111] p-4 rounded-t-lg">
                        <p className="text-xl font-bold text-[#F5EFEA]">{formatDate(event.date)}</p>
                        <p className="text-[#DADADA]">{event.venue}</p>
                      </div>
                      <div className="bg-[#111111] p-4 rounded-b-lg border-t border-[#2A2A2A]">
                        <h3 className="text-lg font-semibold mb-3 text-[#F5EFEA]">Select Ticket Tier:</h3>
                        <div className="space-y-3">
                          {[...event.ticket_tiers].sort((a, b) => a.price - b.price).map(tier => {
                            const remainingTickets = tier.capacity - tier.tickets_sold;
                            const isSoldOut = remainingTickets <= 0;
                            const isSelected = selectedTier?.id === tier.id && selectedEvent?.id === event.id;

                            return (
                              <div key={tier.id} className={`p-3 rounded-md transition-all ${isSoldOut ? 'opacity-50' : ''} ${isSelected ? 'bg-[#8A993F] text-black' : 'bg-[#2A2A2A] hover:bg-opacity-70'}`}>
                                <div className="flex items-center">
                                  <input type="radio" id={`tier_${tier.id}`} name={`event_${event.id}_tier`} disabled={isSoldOut} checked={isSelected} onChange={() => { setSelectedTier(tier); setSelectedEvent(event); setQuantity(1); }} className="h-5 w-5 text-[#8A993F] bg-gray-700 border-gray-500 focus:ring-[#8A993F]"/>
                                  <label htmlFor={`tier_${tier.id}`} className="ml-4 flex-grow cursor-pointer"><span className="font-bold">{tier.name}</span><span className="ml-2 text-gray-400">(₹{tier.price})</span></label>
                                  {isSoldOut && <span className="text-red-500 font-bold">Sold Out</span>}
                                </div>
                                {isSelected && !isSoldOut && !tier.is_online_access && (
                                  <div className="mt-4 flex items-center justify-center"><label className="mr-4">Quantity:</label><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-gray-600 px-3 py-1 rounded-l-md">-</button><input type="text" readOnly value={quantity} className="w-12 text-center bg-gray-700"/><button onClick={() => setQuantity(q => Math.min(remainingTickets, q + 1))} className="bg-gray-600 px-3 py-1 rounded-r-md">+</button></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-8">
                    <label htmlFor="email" className="block text-lg font-medium text-gray-300 mb-2 text-center">Enter your email to book:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full max-w-md mx-auto bg-[#111111] text-white text-lg p-3 rounded-lg border border-[#2A2A2A] block"/>
                    {emailError && <p className="text-red-500 mt-2 text-center">{emailError}</p>}
                  </div>
                  <div className="mt-6 text-center">
                    <button onClick={handleBookClick} disabled={!isRzpReady || !selectedTier} className="w-full bg-[#8A993F] text-[#111111] font-bold py-4 px-8 text-lg rounded-lg transition-colors duration-300 hover:bg-[#F5EFEA] disabled:bg-gray-500 disabled:cursor-not-allowed">
                      {isRzpReady ? (selectedTier ? `Book ${selectedTier.is_online_access ? 1 : quantity} Ticket(s) (₹${selectedTier.price * (selectedTier.is_online_access ? 1 : quantity)})` : 'Select a Tier') : 'Loading Payment...'}
                    </button>
                  </div>
                </section>
              )}
            </div>
            
            {/* Left Column (Description) - Appears second in code, but first on desktop */}
            <div className={upcomingEvents.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <section className="prose prose-invert max-w-none text-lg text-[#DADADA] lg:prose-xl">
                 {description.map((block, index) => (
                  <p key={index} className="mb-4">{block.children.map(child => child.text).join('')}</p>
                ))}
              </section>
            </div>

          </div>

          {/* Lower Sections (now full-width within the wider container) */}
          <div className="lg:col-span-3">
            <section className="mt-16">
               <h2 className="text-3xl font-bold text-[#8A993F] mb-6">Gallery</h2>
               <div className="p-8 bg-[#1A1A1A] rounded-lg text-center text-gray-500">Gallery will be implemented here.</div>
            </section>

            <section className="mt-16">
               <h2 className="text-3xl font-bold text-[#8A993F] mb-6">Video Excerpts</h2>
               <div className="p-8 bg-[#1A1A1A] rounded-lg text-center text-gray-500">Video player will be implemented here.</div>
            </section>

            <section className="mt-20 text-center bg-[#1A1A1A] p-12 rounded-lg border border-[#2A2A2A]">
              <h2 className="text-3xl font-bold text-white">Bring this Production to Your Stage</h2>
              <p className="text-lg text-[#DADADA] mt-4 max-w-2xl mx-auto">Interested in hosting a performance of "{title}"? We would love to hear from you.</p>
              <div className="mt-8">
                <Link href="/classes" className="inline-block bg-[#8A993F] text-[#111111] font-bold py-3 px-8 rounded-lg text-lg hover:bg-[#F5EFEA] transition-colors duration-300">
                  Inquire Now
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

// Reusable Confirmation Modal
function ConfirmationModal({ email, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-xl p-8 max-w-sm w-full text-center border border-[#2A2A2A]">
        <h3 className="text-2xl font-bold text-white mb-4">Confirm Your Email</h3>
        <p className="text-[#DADADA] mb-6">Your ticket will be sent to this address. Please make sure it is correct.</p>
        <p className="bg-[#111111] text-[#8A993F] font-mono p-3 rounded-md mb-8 break-words">{email}</p>
        <div className="flex justify-between items-center gap-4">
          <button onClick={onCancel} className="w-full text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Edit</button>
          <button onClick={onConfirm} className="w-full bg-[#8A993F] text-[#111111] font-bold py-3 px-4 text-lg rounded-lg hover:bg-[#F5EFEA]">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );
}
