// File: frontend/src/app/events/page.js
import Image from 'next/image';
import Link from 'next/link';

// This function fetches all events data.
async function getAllEvents() {
  try {
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

// Reusable Event Card Component with new colors
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
    <div className="flex flex-col md:flex-row bg-[#55682f] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="md:w-1/3 w-full h-64 md:h-auto relative">
        <Image
          src={imageUrl}
          alt={title || 'Event Image'}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="md:w-2/3 p-6 flex flex-col justify-between">
        <div>
          <p className="text-sm text-[#acae2c] font-semibold tracking-wider uppercase">
            {formatDate(event.date)}
          </p>
          <h2 className="text-3xl font-serif font-bold mt-2 mb-4 text-[#dcc7b0]">
            {title}
          </h2>
          <p className="text-gray-400">{event.venue}</p>
        </div>
        <div className="mt-4">
          <Link 
            href={linkUrl} 
            className="inline-block bg-[#acae2c] text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-[#c98400]"
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

  const upcomingEvents = allEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = allEvents.filter(event => new Date(event.date) < now);
  const recentPastEvents = pastEvents.slice(0, 4);

  return (
    <main className="min-h-screen flex-col items-center p-8 md:p-24 bg-[#28401c] text-[#dcc7b0]">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold mb-12 text-center">Events</h1>
        
        <section>
          <h2 className="text-3xl font-semibold border-b-2 border-[#acae2c] pb-4 mb-8">Upcoming Performances</h2>
          <div className="space-y-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-gray-400">There are no upcoming events scheduled at this time. Please check back soon!</p>
            )}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-semibold border-b-2 border-[#acae2c] pb-4 mb-8">Recently Concluded</h2>
          <div className="space-y-8">
            {recentPastEvents.length > 0 ? (
              recentPastEvents.map(event => <EventCard key={event.id} event={event} />)
            ) : (
              <p className="text-gray-400">No recent events to display.</p>
            )}
          </div>
        </section>

        <div className="mt-20 text-center">
          <Link 
            href="/events/archive"
            className="inline-block border border-[#acae2c] text-[#acae2c] font-bold py-3 px-8 rounded-lg transition-colors duration-300 hover:bg-[#acae2c] hover:text-gray-900"
          >
            View All Past Events
          </Link>
        </div>
      </div>
    </main>
  );
}
