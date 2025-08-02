// File: frontend/src/app/page.js
import Image from 'next/image';
import Link from 'next/link';
import Hero from '../components/Hero';

// This function now fetches BOTH upcoming events and workshops
async function getUpcomingItems() {
  try {
    const now = new Date().toISOString();
    
    // Fetch upcoming events (productions/solos)
    const eventsRes = await fetch(`http://localhost:1337/api/events?filters[date][$gt]=${now}&populate[artistic_work][on][links.production-link][populate][production][populate]=*&populate[artistic_work][on][links.solo-link][populate][solo][populate]=*`, { cache: 'no-store' });
    if (!eventsRes.ok) throw new Error('Failed to fetch events');
    const eventsData = await eventsRes.json();
    
    // Fetch upcoming workshops
    const workshopsRes = await fetch(`http://localhost:1337/api/workshops?filters[start_date][$gt]=${now}&populate=*`, { cache: 'no-store' });
    if (!workshopsRes.ok) throw new Error('Failed to fetch workshops');
    const workshopsData = await workshopsRes.json();

    // Map both lists into a unified format for sorting
    const mappedEvents = eventsData.data.map(item => ({
      type: 'event',
      sortDate: new Date(item.date),
      data: item,
    }));

    const mappedWorkshops = workshopsData.data.map(item => ({
      type: 'workshop',
      sortDate: new Date(item.start_date),
      data: item,
    }));

    // Combine and sort the lists chronologically
    const combinedItems = [...mappedEvents, ...mappedWorkshops];
    combinedItems.sort((a, b) => a.sortDate - b.sortDate);

    return combinedItems;

  } catch (error) {
    console.error("Error fetching upcoming items:", error);
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

// --- Reusable Event Card Component (for Productions/Solos) ---
function EventCard({ event }) {
  const strapiUrl = 'http://localhost:1337';
  if (!event.artistic_work || event.artistic_work.length === 0) return null;

  const component = event.artistic_work[0];
  let artisticWorkData, linkUrl = '/';

  if (component.__component === 'links.production-link') {
    artisticWorkData = component.production;
    if (artisticWorkData?.slug) linkUrl = `/productions/${artisticWorkData.slug}`;
  } else if (component.__component === 'links.solo-link') {
    artisticWorkData = component.solo;
    if (artisticWorkData?.slug) linkUrl = `/solos/${artisticWorkData.slug}`;
  }

  if (!artisticWorkData || !artisticWorkData.card_image) return null;

  const { title } = artisticWorkData;
  const imageUrl = strapiUrl + artisticWorkData.card_image.url;

  return (
    <div className="flex flex-col md:flex-row bg-[#55682f] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="md:w-1/3 w-full h-64 md:h-auto relative">
        <Image src={imageUrl} alt={title || 'Event Image'} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }}/>
      </div>
      <div className="md:w-2/3 p-6 flex flex-col justify-between">
        <div>
          <p className="text-sm text-[#acae2c] font-semibold tracking-wider uppercase">{formatDate(event.date)}</p>
          <h2 className="text-3xl font-serif font-bold mt-2 mb-4 text-[#dcc7b0]">{title}</h2>
        </div>
        <div className="mt-4">
          <Link href={linkUrl} className="inline-block bg-[#acae2c] text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-[#c98400]">
            View Details & Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Workshop Card Component ---
function WorkshopCard({ workshop }) {
    const strapiUrl = 'http://localhost:1337';
    if (!workshop || !workshop.banner_image?.url) return null;

    const { title, slug, start_date } = workshop;
    const imageUrl = strapiUrl + workshop.banner_image.url;

    return (
        <div className="flex flex-col md:flex-row bg-[#55682f] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
            <div className="md:w-1/3 w-full h-64 md:h-auto relative">
                <Image src={imageUrl} alt={title || 'Workshop Image'} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }}/>
            </div>
            <div className="md:w-2/3 p-6 flex flex-col justify-between">
                <div>
                    <p className="text-sm text-[#c98400] font-semibold tracking-wider uppercase">WORKSHOP</p>
                    <p className="text-sm text-gray-400 mt-2">{formatDate(start_date)}</p>
                    <h2 className="text-3xl font-serif font-bold mt-2 mb-4 text-[#dcc7b0]">{title}</h2>
                </div>
                <div className="mt-4">
                    <Link href={`/workshops/${slug}`} className="inline-block bg-[#c98400] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-[#acae2c]">
                        Learn More & Register
                    </Link>
                </div>
            </div>
        </div>
    );
}

// This is our main Homepage component.
export default async function Home() {
  const upcomingItems = await getUpcomingItems();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-[#28401c] text-[#dcc7b0]">

      <Hero />
      <h1 className="text-5xl font-serif font-bold mb-12">Upcoming Schedule</h1>
      
      <div className="w-full max-w-4xl space-y-8">
        {Array.isArray(upcomingItems) && upcomingItems.length > 0 ? (
          upcomingItems.map((item) => {
            if (item.type === 'event') {
              return <EventCard key={`event-${item.data.id}`} event={item.data} />;
            }
            if (item.type === 'workshop') {
              return <WorkshopCard key={`workshop-${item.data.id}`} workshop={item.data} />;
            }
            return null;
          })
        ) : (
          <p className="text-gray-400 text-center text-lg">There are no upcoming events or workshops scheduled at this time. Please check back soon!</p>
        )}
      </div>
    </main>
  );
}
