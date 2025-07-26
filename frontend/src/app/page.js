import Image from 'next/image';
import Link from 'next/link'; // Use Next.js Link for optimized navigation

// This function fetches data with the new nested structure.
async function getEvents() {
  try {
    // This is the correct, deep query to get all the data we need.
    const res = await fetch('http://localhost:1337/api/events?populate[artistic_work][on][links.production-link][populate][production][populate]=*&populate[artistic_work][on][links.solo-link][populate][solo][populate]=*', { cache: 'no-store' });
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

// This is our main Homepage component, updated for the new user flow.
export default async function Home() {
  const events = await getEvents();
  const strapiUrl = 'http://localhost:1337';

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-900 text-white">
      <h1 className="text-5xl font-serif font-bold mb-12">Upcoming Events</h1>
      
      <div className="w-full max-w-4xl space-y-8">
        {Array.isArray(events) && events.length > 0 ? (
          events.map((event) => {
            if (!event.artistic_work || event.artistic_work.length === 0) {
              return null;
            }

            const component = event.artistic_work[0];
            let artisticWorkData;
            let linkUrl = '/'; // Default link

            // We determine the correct link based on the component type.
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
              <div key={event.id} className="flex flex-col md:flex-row bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
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
                  </div>
                  <div className="mt-4">
                    {/* --- THE LINK IS NOW CORRECTED FOR THE NEW USER FLOW --- */}
                    <Link 
                      href={linkUrl} 
                      className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-green-700"
                    >
                      View Production & Tickets
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No events found.</p>
        )}
      </div>
    </main>
  );
}
