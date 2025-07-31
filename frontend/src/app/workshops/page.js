// File: frontend/src/app/workshops/page.js
import Image from 'next/image';
import Link from 'next/link';

// This function fetches all workshops data.
async function getWorkshops() {
  try {
    // We sort by start_date descending to get the newest first.
    const res = await fetch('http://localhost:1337/api/workshops?sort=start_date:desc&populate=*', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data from API');
    const responseData = await res.json();
    return responseData.data;
  } catch (error) {
    console.error("Error fetching workshops:", error);
    return [];
  }
}

// Helper function to format a date range
function formatDateRange(startDateString, endDateString) {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  
  const startOptions = { month: 'long', day: 'numeric' };
  const endOptions = { month: 'long', day: 'numeric', year: 'numeric' };

  const start = startDate.toLocaleDateString('en-US', startOptions);
  const end = endDate.toLocaleDateString('en-US', endOptions);

  if (startDate.getTime() === endDate.getTime()) {
    return endDate.toLocaleDateString('en-US', endOptions);
  }

  return `${start} - ${end}`;
}

// Reusable Workshop Card Component
function WorkshopCard({ workshop }) {
  const strapiUrl = 'http://localhost:1337';

  if (!workshop || !workshop.banner_image?.url) {
    return null;
  }

  const { title, slug, start_date, end_date, instructor, banner_image, venue } = workshop;
  const imageUrl = strapiUrl + banner_image.url;
  const instructorName = instructor?.name || 'TBA';

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative w-full h-60">
        <Image
          src={imageUrl}
          alt={`Banner for ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-green-400 font-semibold tracking-wider uppercase">
          {formatDateRange(start_date, end_date)}
        </p>
        <h2 className="text-2xl font-serif font-bold mt-2 mb-3 text-white">
          {title}
        </h2>
        <p className="text-gray-300 mb-2">Venue: {venue || 'TBA'}</p>
        <p className="text-gray-400 mb-4">with {instructorName}</p>
        <div className="mt-auto">
          <Link 
            href={`/workshops/${slug}`} 
            className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 hover:bg-green-700"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}


// This is our main Workshops page component.
export default async function WorkshopsPage() {
  const allWorkshops = await getWorkshops();
  const now = new Date();

  // --- NEW LOGIC: Automatically separate workshops ---
  const upcomingWorkshops = allWorkshops.filter(ws => new Date(ws.start_date) >= now);
  const pastWorkshops = allWorkshops.filter(ws => new Date(ws.start_date) < now);

  return (
    <main className="min-h-screen flex-col items-center p-8 md:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold">Workshops & Intensives</h1>
          <p className="text-lg text-gray-400 mt-4">Deepen your practice with our immersive workshops led by renowned artists.</p>
        </div>
        
        {/* Upcoming Workshops Section */}
        <section>
          <h2 className="text-3xl font-semibold border-b-2 border-green-500 pb-4 mb-8">Upcoming Workshops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingWorkshops.length > 0 ? (
              upcomingWorkshops.map(workshop => <WorkshopCard key={workshop.id} workshop={workshop} />)
            ) : (
              <p className="text-gray-400 col-span-full text-center">No workshops are currently scheduled. Please check back soon!</p>
            )}
          </div>
        </section>

        {/* Past Workshops Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-semibold border-b-2 border-green-500 pb-4 mb-8">Past Workshops</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastWorkshops.length > 0 ? (
              pastWorkshops.map(workshop => <WorkshopCard key={workshop.id} workshop={workshop} />)
            ) : (
              <p className="text-gray-400 col-span-full text-center">No past workshops to display.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
