// File: frontend/src/app/reviews/page.js
'use client'; // This is an interactive page because of the slider

import { useState, useEffect } from 'react';
import Image from 'next/image';

// --- Reusable Arrow Component ---
function Arrow({ direction, onClick }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 z-30 p-2 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 transition-all duration-300 ${isLeft ? 'left-4' : 'right-4'}`}
      aria-label={isLeft ? 'Previous review' : 'Next review'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLeft ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );
}


// --- Main Reviews Page Component ---
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const strapiUrl = 'http://localhost:1337';

  // --- CRUCIAL FIX: Add a class to the body tag for this page only ---
  useEffect(() => {
    // When the component mounts, add our new class to the body
    document.body.classList.add('transparent-bg');

    // When the component unmounts (e.g., you navigate to another page), remove the class
    return () => {
      document.body.classList.remove('transparent-bg');
    };
  }, []); // The empty array ensures this runs only once

  // Fetch reviews on component mount
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('http://localhost:1337/api/reviews?populate=*');
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const responseData = await res.json();
        setReviews(responseData.data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? reviews.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === reviews.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (isLoading) {
    return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">Loading Reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">No reviews found.</div>;
  }

  const currentReview = reviews[currentIndex];

  if (!currentReview) {
    return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">Error loading current review.</div>;
  }

  return (
    <main className="h-screen w-screen relative overflow-hidden">
      {/* Background Image Slider */}
      {reviews.map((review, index) => {
        const desktopImgUrl = review.photo_desktop?.url;
        const mobileImgUrl = review.photo_mobile?.url;
        const desktopImg = desktopImgUrl ? strapiUrl + desktopImgUrl : 'https://placehold.co/1920x1080/000000/FFFFFF?text=Image+Not+Found';
        const mobileImg = mobileImgUrl ? strapiUrl + mobileImgUrl : 'https://placehold.co/600x800/000000/FFFFFF?text=Image+Not+Found';
        
        return (
          <div
            key={review.id}
            className={`absolute inset-0 transition-opacity duration-1000 z-0 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="hidden md:block relative h-full w-full">
              <Image src={desktopImg} alt={`Review background from ${review.publication_name}`} fill sizes="100vw" style={{ objectFit: 'cover' }} priority={index === 0} />
            </div>
            <div className="md:hidden relative h-full w-full">
              <Image src={mobileImg} alt={`Review background from ${review.publication_name}`} fill sizes="100vw" style={{ objectFit: 'cover' }} priority={index === 0} />
            </div>
          </div>
        );
      })}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-5"></div>

      {/* Navigation Arrows */}
      {reviews.length > 1 && (
        <>
          <Arrow direction="left" onClick={goToPrevious} />
          <Arrow direction="right" onClick={goToNext} />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-8">
        <div className="max-w-4xl">
          <blockquote className="text-2xl md:text-4xl font-serif italic">
            "{currentReview.quote}"
          </blockquote>
          <cite className="block mt-8 text-xl font-semibold tracking-wider uppercase">
            {currentReview.link ? (
              <a href={currentReview.link} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                — {currentReview.publication_name}
              </a>
            ) : (
              <span>— {currentReview.publication_name}</span>
            )}
          </cite>
        </div>
      </div>
    </main>
  );
}
