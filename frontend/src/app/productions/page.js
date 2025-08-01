// File: frontend/src/app/productions/page.js
import Image from 'next/image';
import Link from 'next/link';

// This function fetches all productions data.
async function getProductions() {
  try {
    const res = await fetch('http://localhost:1337/api/productions?populate=*', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data from API');
    const responseData = await res.json();
    return responseData.data;
  } catch (error) {
    console.error("Error fetching productions:", error);
    return [];
  }
}

// Reusable Production Card Component
function ProductionCard({ production }) {
  const strapiUrl = 'http://localhost:1337';

  if (!production || !production.card_image) {
    return null;
  }

  const { title, short_overview, slug, card_image } = production;
  const imageUrl = strapiUrl + card_image.url;

  // Function to truncate the overview text
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  const overviewText = short_overview?.[0]?.children?.[0]?.text || '';
  const truncatedOverview = truncateText(overviewText, 150);

  return (
    <div className="bg-[#55682f] rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative w-full h-60">
        <Image
          src={imageUrl}
          alt={title || 'Production Image'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-serif font-bold mb-3 text-[#dcc7b0]">
          {title}
        </h2>
        <p className="text-gray-400 flex-grow mb-4">
          {truncatedOverview}
        </p>
        <div className="mt-auto">
          <Link 
            href={`/productions/${slug}`} 
            className="inline-block text-[#acae2c] font-bold transition-colors duration-300 hover:text-[#c98400]"
          >
            Learn More &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}


// This is our main Productions page component.
export default async function ProductionsPage() {
  const productions = await getProductions();

  return (
    <main className="min-h-screen flex-col items-center p-8 md:p-24 bg-[#28401c] text-[#dcc7b0]">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold">Our Work</h1>
          <p className="text-lg text-gray-400 mt-4">A collection of our signature productions and artistic explorations.</p>
        </div>
        
        {/* Productions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productions.length > 0 ? (
            productions.map(production => <ProductionCard key={production.id} production={production} />)
          ) : (
            <p className="text-gray-400 col-span-full text-center">No productions found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
