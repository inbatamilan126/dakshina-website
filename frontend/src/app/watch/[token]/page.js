// File: frontend/src/app/watch/[token]/page.js
'use client'; // This page uses a client-side component for the video player

import MuxPlayer from '@mux/mux-player-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function WatchPage() {
  // Get the playback ID from the URL path
  const params = useParams();
  const playbackId = params.token;

  // Get the secure JWT from the URL query parameter
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    console.log("Attempting to load stream with:");
    console.log("Playback ID:", playbackId);
    console.log("Token:", token);
  }, [playbackId, token]);

  return (
    <main className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="w-full max-w-5xl aspect-video">
        {playbackId && token ? (
          <MuxPlayer
            playbackId={playbackId}
            // --- FINAL FIX: Pass the raw token directly without the 'jwt:' prefix ---
            playbackToken={token}
            streamType="on-demand" // Use "on-demand" for VOD assets, "live" for live streams
            className="w-full h-full"
            autoPlay={true}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-xl">Loading stream... Invalid or missing token.</p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-bold">The Dakshina Dance Repertory</h1>
      </div>
    </main>
  );
}
