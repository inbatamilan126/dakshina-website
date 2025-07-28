// File: frontend/src/app/events/page.js
import Image from 'next/image';
import Link from 'next/link';

// This function fetches all events data with the nested structure.
async function getAllEvents() {
  try {
    // We fetch all events, sorted by date descending to get the newest first.
    const res = await fetch('http://localhost:1337/api/events?sort=date:desc&populate[artistic_work][on][links.production-link][populate][production][populate]=*&populate[artistic_work][on][links.solo-link][populate][solo][populate]=*', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data from API');
    const responseData = await res.json();
    return responseData.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Helper function to format the date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Reusable Event Card Component
function EventCard({ event }) {
  const strapiUrl = 'http://localhost:1337';

  if (!event.artistic_work || event.artistic_work.length === 0) {
    return null;
  }

  const component = event.artistic_work[0];
  let artisticWorkData;
  let linkUrl = '/';

  if (component.__component === 'links.production-link') {
    artisticWorkData = component.production;
    if (artisticWorkData && artisticWorkData.slug) {
      linkUrl = `/productions/${artisticWorkData.slug}`;
    }
  } else if (component.__component === 'links.solo-link') {
    artisticWorkData = component.solo;
    if (artisticWorkData && artisticWorkData.slug) {
      linkUrl = `/solos/${artisticWorkData.slug}`;
    }
  }

  if (!artisticWorkData || !artisticWorkData.card_image) {
    return null;
  }

  const { title } = artisticWorkData;
  const imageUrl = strapiUrl + artisticWorkData.card_image.url;

  return (
    <div className="flex flex-col md:flex-row bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="md:w-1/3 w-full h-64 md:h-auto relative">
        <Image
          src={imageUrl}
          alt={title || 'Event Image'}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="md:w-2/3 p-6 flex flex-col justify-between">
        <div>
          <p className="text-sm text-green-400 font-semibold tracking-wider uppercase">
            {formatDate(event.date)}
          </p>
          <h2 className="text-3xl font-serif font-bold mt-2 mb-4 text-white">
            {title}
          </h2>
          <p className="text-gray-400">{event.venue}</p>
        </div>
        <div className="mt-4">
          <Link 
            href={linkUrl} 
            className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-green-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}


// This is our main Events page component.
export default async function EventsPage() {
  const allEvents = await getAllEvents();
  const now = new Date();

  // Automatically separate events into upcoming and past
  const upcomingEvents = allEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = allEvents.filter(event => new Date(event.date) < now);

  // We only want to show a few of the most recent past events on this page
  const recentPastEvents = pastEvents.slice(0, 4);

  return (
    <main className="min-h-screen flex-col items-center p-8 md:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold mb-12 text-center">Events</h1>
        
        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-3xl font-semibold border-b-2 border-green-500 pb-4 mb-8">Upcoming Performances</h2>
          <div className="space-y-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-gray-400">There are no upcoming events scheduled at this time. Please check back soon!</p>
            )}
          </div>
        </section>

        {/* Recent Past Events Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-semibold border-b-2 border-green-500 pb-4 mb-8">Recently Concluded</h2>
          <div className="space-y-8">
            {recentPastEvents.length > 0 ? (
              recentPastEvents.map(event => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-gray-400">No recent events to display.</p>
            )}
          </div>
        </section>

        {/* Link to Archive */}
        <div className="mt-20 text-center">
          <Link 
            href="/events/archive" // This page doesn't exist yet, but we're setting it up
            className="inline-block border border-green-500 text-green-400 font-bold py-3 px-8 rounded-lg transition-colors duration-300 hover:bg-green-500 hover:text-white"
          >
            View All Past Events
          </Link>
        </div>
      </div>
    </main>
  );
}
