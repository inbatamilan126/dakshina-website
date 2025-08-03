// File: frontend/src/app/workshops/page.js
import Image from 'next/image';
import Link from 'next/link';

// This function fetches all workshops data.
async function getWorkshops() {
  try {
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
  const imageUrl = strapiUrl + workshop.banner_image.url;
  const instructorName = instructor?.name || 'TBA';

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden flex flex-col border border-transparent hover:border-[#8A993F] transition-all duration-300 hover:scale-[1.05]">
      <div className="relative w-full h-60 md:h-72">
        <Image
          src={imageUrl}
          alt={`Banner for ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-[#c98400] font-semibold tracking-wider uppercase">
          {formatDateRange(start_date, end_date)}
        </p>
        <h2 className="text-2xl font-serif font-bold mt-2 mb-3 text-white">
          {title}
        </h2>
        <p className="text-[#DADADA] mb-2">Venue: {venue || 'TBA'}</p>
        <p className="text-gray-500 mb-4">with {instructorName}</p>
        <div className="mt-auto">
          <Link 
            href={`/workshops/${slug}`} 
            className="inline-block bg-[#8A993F] text-[#111111] font-semibold py-3 px-6 rounded-md transition-colors duration-300 hover:bg-[#F5EFEA]"
          >
            Learn More & Register
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

  const upcomingWorkshops = allWorkshops.filter(ws => new Date(ws.start_date) >= now);
  const pastWorkshops = allWorkshops.filter(ws => new Date(ws.start_date) < now);

  return (
    <main className="min-h-screen flex-col items-center px-8 pb-8 pt-28 md:px-24 md:pb-24 md:pt-44 bg-[#111111] text-[#F5EFEA]">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-white">Workshops & Intensives</h1>
          <p className="text-lg text-[#DADADA] mt-4">Deepen your practice with our immersive workshops led by renowned artists.</p>
        </div>
        
        <section>
          <h2 className="text-3xl font-semibold border-b-2 border-[#8A993F] pb-4 mb-8 text-white">Upcoming Workshops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingWorkshops.length > 0 ? (
              upcomingWorkshops.map(workshop => <WorkshopCard key={workshop.id} workshop={workshop} />)
            ) : (
              <p className="text-[#DADADA] col-span-full text-center">No workshops are currently scheduled. Please check back soon!</p>
            )}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-semibold border-b-2 border-[#8A993F] pb-4 mb-8 text-white">Past Workshops</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastWorkshops.length > 0 ? (
              pastWorkshops.map(workshop => <WorkshopCard key={workshop.id} workshop={workshop} />)
            ) : (
              <p className="text-[#DADADA] col-span-full text-center">No past workshops to display.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
