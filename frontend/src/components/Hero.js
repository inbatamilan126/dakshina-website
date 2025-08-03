// File: frontend/src/components/Hero.js
'use client'
import { motion, stagger, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from 'next/link';

// Custom Variants

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const fadeUp = {
  hidden: {opacity: 0, y: 20},
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.25, 1, 0.3, 1],
    },
  },
};

export default function Hero() {
  const ref = useRef(null);

  // Tracking scroll within the hero section
  const { scrollYProgress} = useScroll({
    target: ref,
    offset: ['start start', 'end start'], // fade out as it leaves viewport
  });

  const opacity = useTransform(scrollYProgress, [0,1], [1,0]);
    return (
      <motion.section
        ref={ref}
        style={{opacity}} 
        className="relative w-full h-screen overflow-hidden"
      >
        {/* Video Background */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
  
        {/* Dark Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.6)] z-10" />
  
        {/* Text Content */}
        <div className="relative z-20 flex items-top md:items-center py-4 md:py-16 justify-center h-full px-6 text-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            class="mt-16 md:mt-0"
            >
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#FFEFBD] font-bold mb-4">
              The Dakshina Dance Repertory
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-[#FFEFBD] max-w-2xl mx-auto">
              Exploring the boundaries of classical and contemporary Indian dance.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link href="/productions" className="inline-block px-8 py-4 bg-[#8A993F] text-[#111111] font-bold rounded-md text-lg hover:bg-[#F5EFEA] transition-colors duration-300">
                Explore Our Work
              </Link>
            </motion.div>
            {/* Optional CTA */}
            {/* <div className="mt-6">
              <a href="/events" className="inline-block px-6 py-3 bg-[#8A993F] text-white rounded-full text-sm hover:bg-[#9baa53] transition">
                View Upcoming Events
              </a>
            </div> */}
          </motion.div>
        </div>
      </motion.section>
    );
  }
  