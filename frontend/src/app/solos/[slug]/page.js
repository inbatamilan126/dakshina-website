'use client'; // This page is interactive for booking tickets

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
export default function SoloPage({ params }) {
  const [solo, setSolo] = useState(null);
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
        const soloRes = await fetch(`http://localhost:1337/api/solos?filters[slug][$eq]=${params.slug}&populate=*`);
        if (!soloRes.ok) throw new Error('Failed to fetch solo performance');
        const soloData = await soloRes.json();
        const currentSolo = soloData.data?.[0];
        setSolo(currentSolo);

        if (currentSolo) {
          const now = new Date().toISOString();
          const eventsRes = await fetch(`http://localhost:1337/api/events?filters[date][$gt]=${now}&populate[artistic_work][populate]=*&populate=ticket_tiers`);
          if (!eventsRes.ok) throw new Error('Failed to fetch events');
          const eventsData = await eventsRes.json();
          const allUpcomingEvents = eventsData.data || [];

          const relevantEvents = allUpcomingEvents.filter(event => 
            event.artistic_work?.[0]?.__component === 'links.solo-link' &&
            event.artistic_work?.[0]?.solo?.id === currentSolo.id
          );
          relevantEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
          setUpcomingEvents(relevantEvents);
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

  const handleBookClick = (event) => {
    if (!selectedTier) {
      alert("Please select a ticket tier.");
      return;
    }
    if (!validateEmailFormat(email)) {
      setEmailError('Please enter a valid email before booking.');
      return;
    }
    setEmailError('');
    setSelectedEvent(event);
    setShowConfirmModal(true);
  };
  
  const proceedToPayment = async () => {
    if (!isRzpReady || !window.Razorpay || !selectedTier || !selectedEvent) return;
    setShowConfirmModal(false);

    try {
      const purchaseQuantity = selectedTier.is_online_access ? 1 : quantity;
      const orderRes = await fetch('http://localhost:1337/api/orders/create', {
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
      
      const razorpayKeyId = 'rzp_test_tn3D5B6Bh0HPcH'; // Replace with your key

      const options = {
        key: razorpayKeyId,
        amount: orderDetails.amount,
        currency: "INR",
        name: "The Dakshina Dance Repertory",
        description: `${purchaseQuantity} x Ticket(s): ${selectedTier.name} for ${solo.title}`,
        image: "https://placehold.co/100x100/16a34a/white?text=D",
        order_id: orderDetails.id,
        
        handler: async (response) => {
          const verifyRes = await fetch('http://localhost:1337/api/orders/verify', {
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
        theme: { color: "#acae2c" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment process failed:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#28401c] text-[#dcc7b0]"><h1 className="text-4xl">Loading Performance...</h1></main>;
  }

  if (!solo) {
    return <main className="flex min-h-screen items-center justify-center bg-[#28401c] text-[#dcc7b0]"><h1 className="text-4xl">Solo Performance Not Found</h1></main>;
  }

  const { title, short_overview, banner_desktop } = solo;
  const bannerUrl = strapiUrl + banner_desktop.url;

  return (
    <>
      {showConfirmModal && (
        <ConfirmationModal
          email={email}
          onConfirm={proceedToPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      <main className="min-h-screen bg-[#28401c] text-[#dcc7b0]">
        <div className="relative w-full h-96">
          <Image src={bannerUrl} alt={title} fill sizes="100vw" style={{objectFit: 'cover'}} priority />
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <h1 className="text-6xl font-serif font-bold text-center text-white">{title}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          {upcomingEvents.length > 0 && (
            <div className="bg-[#55682f] rounded-lg p-8 mb-12">
              <h2 className="text-3xl font-bold text-[#acae2c] mb-6 text-center">Book Your Tickets</h2>
              {upcomingEvents.map(event => (
                <div key={event.id} className="mb-8">
                  <div className="bg-[#686c24] p-4 rounded-t-lg">
                    <p className="text-xl font-bold text-[#dcc7b0]">{formatDate(event.date)}</p>
                    <p className="text-gray-300">{event.venue}</p>
                  </div>
                  <div className="bg-[#686c24] p-4 rounded-b-lg border-t border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-[#dcc7b0]">Select Ticket Tier:</h3>
                    <div className="space-y-3">
                      {[...event.ticket_tiers].sort((a, b) => a.price - b.price).map(tier => {
                        const remainingTickets = tier.capacity - tier.tickets_sold;
                        const isSoldOut = remainingTickets <= 0;
                        const isSelected = selectedTier?.id === tier.id && selectedEvent?.id === event.id;
                        return (
                          <div key={tier.id} className={`p-3 rounded-md transition-all ${isSoldOut ? 'opacity-50' : ''} ${isSelected ? 'bg-[#acae2c] text-black' : 'bg-[#28401c] hover:bg-opacity-70'}`}>
                            <div className="flex items-center">
                              <input type="radio" id={`tier_${tier.id}`} name={`event_${event.id}_tier`} disabled={isSoldOut} checked={isSelected} onChange={() => { setSelectedTier(tier); setSelectedEvent(event); setQuantity(1); }} className="h-5 w-5 text-[#acae2c] bg-gray-700 border-gray-500"/>
                              <label htmlFor={`tier_${tier.id}`} className="ml-4 flex-grow cursor-pointer">
                                <span className="font-bold">{tier.name}</span>
                                <span className="ml-2 text-gray-400">(₹{tier.price})</span>
                              </label>
                              {isSoldOut && <span className="text-[#9b0e0e] font-bold">Sold Out</span>}
                            </div>
                            {isSelected && !isSoldOut && !tier.is_online_access && (
                              <div className="mt-4 flex items-center justify-center">
                                <label className="mr-4">Quantity:</label>
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-gray-600 px-3 py-1 rounded-l-md">-</button>
                                <input type="text" readOnly value={quantity} className="w-12 text-center bg-gray-700"/>
                                <button onClick={() => setQuantity(q => Math.min(remainingTickets, q + 1))} className="bg-gray-600 px-3 py-1 rounded-r-md">+</button>
                              </div>
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
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full max-w-md mx-auto bg-gray-900 text-white text-lg p-3 rounded-lg border border-gray-600 block"/>
                {emailError && <p className="text-red-500 mt-2 text-center">{emailError}</p>}
              </div>
              <div className="mt-6 text-center">
                <button onClick={handleBookClick} disabled={!isRzpReady || !selectedTier} className="inline-block bg-[#acae2c] text-gray-900 font-bold py-4 px-12 text-xl rounded-lg transition-colors duration-300 hover:bg-[#c98400] disabled:bg-gray-500 disabled:cursor-not-allowed">
                  {isRzpReady ? (selectedTier ? `Book ${selectedTier.is_online_access ? 1 : quantity} Ticket(s) (₹${selectedTier.price * (selectedTier.is_online_access ? 1 : quantity)})` : 'Select a Tier') : 'Loading Payment...'}
                </button>
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-lg text-gray-300">
             {short_overview.map((block, index) => (
              <p key={index} className="mb-4">{block.children.map(child => child.text).join('')}</p>
            ))}
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
      <div className="bg-[#55682f] rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
        <h3 className="text-2xl font-bold text-[#dcc7b0] mb-4">Confirm Your Email</h3>
        <p className="text-gray-300 mb-6">Your ticket will be sent to this address. Please make sure it is correct.</p>
        <p className="bg-[#28401c] text-[#acae2c] font-mono p-3 rounded-md mb-8 break-words">{email}</p>
        <div className="flex justify-between items-center gap-4">
          <button onClick={onCancel} className="w-full text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Edit</button>
          <button onClick={onConfirm} className="w-full bg-[#acae2c] text-gray-900 font-bold py-3 px-4 text-lg rounded-lg hover:bg-[#c98400]">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );
}
