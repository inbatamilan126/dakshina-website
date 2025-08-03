// File: frontend/src/app/events/archive/page.js
import Link from 'next/link';

// This function fetches all events data.
async function getAllEvents() {
  try {
    // We sort by date descending to get the newest first.
    const res = await fetch('http://localhost:1337/api/events?sort=date:desc&populate[artistic_work][on][links.production-link][populate]=production&populate[artistic_work][on][links.solo-link][populate]=solo', { cache: 'no-store' });
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
    month: 'long',
    day: 'numeric',
  });
}

// This is our main Events Archive page component.
export default async function EventsArchivePage() {
  const allEvents = await getAllEvents();
  const now = new Date();

  // Filter for past events
  const pastEvents = allEvents.filter(event => new Date(event.date) < now);

  // Group events by year
  const eventsByYear = pastEvents.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(event);
    return acc;
  }, {});

  const years = Object.keys(eventsByYear).sort((a, b) => b - a); // Sort years in descending order

  return (
    <main className="min-h-screen flex-col items-center px-8 pb-8 pt-28 md:px-24 md:pb-24 md:pt-44 bg-[#111111] text-[#F5EFEA]">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-white">Past Events Archive</h1>
          <p className="text-lg text-[#DADADA] mt-4">A history of our performances and workshops.</p>
        </div>
        
        {years.length > 0 ? (
          years.map(year => (
            <section key={year} className="mb-12">
              <h2 className="text-4xl font-serif font-bold text-[#8A993F] border-b border-[#2A2A2A] pb-4 mb-6">{year}</h2>
              <ul className="space-y-4">
                {eventsByYear[year].map(event => {
                  const component = event.artistic_work?.[0];
                  let title = 'Event';
                  let linkUrl = '#';

                  if (component?.__component === 'links.production-link' && component.production) {
                    title = component.production.title;
                    linkUrl = `/productions/${component.production.slug}`;
                  } else if (component?.__component === 'links.solo-link' && component.solo) {
                    title = component.solo.title;
                    linkUrl = `/solos/${component.solo.slug}`;
                  }

                  return (
                    <li key={event.id} className="bg-[#1A1A1A] rounded-lg transition-colors hover:bg-[#2A2A2A]">
                      <Link href={linkUrl} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
                        <div>
                          <p className="font-bold text-xl text-white">{title}</p>
                          <p className="text-[#DADADA]">{event.venue}</p>
                        </div>
                        <p className="text-gray-500 mt-2 md:mt-0">{formatDate(event.date)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        ) : (
          <p className="text-[#DADADA] text-center text-lg">There are no past events to display.</p>
        )}
      </div>
    </main>
  );
}
