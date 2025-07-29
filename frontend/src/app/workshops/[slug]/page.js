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
  });
}

function formatTime(timeString) {
    if (!timeString) return '';
    // Append a dummy date to parse the time correctly
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}


// --- Main Page Component ---
export default function WorkshopPage({ params }) {
  const [workshop, setWorkshop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRzpReady, setIsRzpReady] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const strapiUrl = 'http://localhost:1337';

  useEffect(() => {
    async function fetchData() {
      if (!params.slug) return;
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:1337/api/workshops?filters[slug][$eq]=${params.slug}&populate=*`);
        if (!res.ok) throw new Error('Failed to fetch workshop');
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
    if (!isRzpReady || !window.Razorpay || !selectedTier || !workshop) return;
    setShowConfirmModal(false);

    try {
      const orderRes = await fetch('http://localhost:1337/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTier.price * quantity * 100,
          workshopId: workshop.id,
          workshopSlug: workshop.slug,
          tierName: selectedTier.name,
          quantity: quantity,
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
        description: `${quantity} x Ticket(s): ${selectedTier.name} for ${workshop.title}`,
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
            alert('Payment successful! Your workshop confirmation has been sent to your email.');
            window.location.reload();
          } else {
            throw new Error(result.message || 'Payment verification failed.');
          }
        },
        prefill: { email },
        notes: { 
          eventCode: workshop.slug,
          tierName: selectedTier.name,
          quantity: quantity,
        },
        theme: { color: "#16a34a" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment process failed:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><h1 className="text-4xl">Loading Workshop...</h1></main>;
  }

  if (!workshop) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><h1 className="text-4xl">Workshop Not Found</h1></main>;
  }

  const { title, description, banner_image, instructor, schedule, ticket_tiers, venue } = workshop;
  const bannerUrl = strapiUrl + banner_image.url;
  const instructorName = instructor?.name || 'TBA';

  return (
    <>
      {showConfirmModal && (
        <ConfirmationModal
          email={email}
          onConfirm={proceedToPayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="relative w-full h-96">
          <Image src={bannerUrl} alt={title} fill sizes="100vw" style={{objectFit: 'cover'}} priority />
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <h1 className="text-6xl font-serif font-bold text-center">{title}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Description & Schedule */}
          <div className="lg:col-span-2">
            <div className="prose prose-invert max-w-none text-lg text-gray-300">
              {description.map((block, index) => (
                <p key={index} className="mb-4">{block.children.map(child => child.text).join('')}</p>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-green-400 mt-12 mb-6">Schedule</h2>
            <div className="space-y-4">
              {schedule.map(session => (
                <div key={session.id} className="bg-gray-800 p-4 rounded-lg">
                  <p className="font-bold text-white">{formatDate(session.date)}</p>
                  <p className="text-gray-300">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>
                  {session.topic && <p className="text-gray-400 mt-1 italic">Topic: {session.topic}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-center mb-4">Register Now</h2>
              {/* --- UPDATE: Venue is now displayed --- */}
              <p className="text-center text-gray-400 mb-6">{venue || 'Venue to be announced'}</p>
              <div className="space-y-3 mb-6">
                {ticket_tiers.map(tier => {
                  const remainingTickets = tier.capacity - tier.tickets_sold;
                  const isSoldOut = remainingTickets <= 0;
                  const isSelected = selectedTier?.id === tier.id;
                  return (
                    <label key={tier.id} className={`flex items-center p-3 rounded-md transition-all ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'} ${isSelected ? 'bg-green-800 ring-2 ring-green-400' : 'bg-gray-900'}`}>
                      <input type="radio" name="tier" disabled={isSoldOut} checked={isSelected} onChange={() => { setSelectedTier(tier); setQuantity(1); }} className="h-5 w-5 text-green-600 bg-gray-700 border-gray-500"/>
                      <div className="ml-4 flex-grow">
                        <span className="font-bold">{tier.name}</span>
                        <span className="ml-2 text-gray-400">(₹{tier.price})</span>
                      </div>
                      {isSoldOut && <span className="text-red-500 font-bold">Sold Out</span>}
                    </label>
                  );
                })}
              </div>
              
              {selectedTier && (
                <div className="mb-6 flex items-center justify-center">
                  <label className="mr-4">Quantity:</label>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="bg-gray-600 px-3 py-1 rounded-l-md">-</button>
                  <input type="text" readOnly value={quantity} className="w-12 text-center bg-gray-700"/>
                  <button onClick={() => setQuantity(q => Math.min(selectedTier.capacity - selectedTier.tickets_sold, q + 1))} className="bg-gray-600 px-3 py-1 rounded-r-md">+</button>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email:</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600"/>
                {emailError && <p className="text-red-500 mt-2 text-sm">{emailError}</p>}
              </div>

              <button onClick={handleBookClick} disabled={!isRzpReady || !selectedTier} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-500">
                {isRzpReady ? (selectedTier ? `Register (${quantity} x ₹${selectedTier.price})` : 'Select a Tier') : 'Loading...'}
              </button>
            </div>
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
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Confirm Your Email</h3>
        <p className="text-gray-300 mb-6">Your confirmation will be sent to this address. Please make sure it is correct.</p>
        <p className="bg-gray-900 text-green-400 font-mono p-3 rounded-md mb-8 break-words">{email}</p>
        <div className="flex justify-between items-center gap-4">
          <button onClick={onCancel} className="w-full text-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Edit</button>
          <button onClick={onConfirm} className="w-full bg-green-600 text-white font-bold py-3 px-4 text-lg rounded-lg hover:bg-green-700">Confirm & Pay</button>
        </div>
      </div>
    </div>
  );
}
