// File: frontend/src/app/watch/[token]/page.js
'use client'; // This page uses a client-side component for the video player

import MuxPlayer from '@mux/mux-player-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function WatchPage() {
  const params = useParams();
  const playbackId = params.token;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    console.log("Attempting to load stream with:");
    console.log("Playback ID:", playbackId);
    console.log("Token:", token);
  }, [playbackId, token]);

  return (
    <main className="h-screen w-screen bg-[#111111] flex flex-col items-center justify-center text-[#F5EFEA]">
      <div className="w-full max-w-5xl aspect-video">
        {playbackId && token ? (
          <MuxPlayer
            playbackId={playbackId}
            playbackToken={token}
            streamType="live" 
            className="w-full h-full"
            autoPlay={true}
          />
        ) : (
          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center rounded-lg">
            <p className="text-xl text-[#DADADA]">Loading stream... Invalid or missing token.</p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-bold text-white">The Dakshina Dance Repertory</h1>
        <p className="text-[#DADADA]">Live Performance</p>
      </div>
    </main>
  );
}
