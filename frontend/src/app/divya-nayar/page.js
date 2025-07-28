// File: frontend/src/app/divya-nayar/page.js
import Image from 'next/image';

// This function fetches the specific data for Divya Nayar.
async function getLeadDancer() {
  try {
    // We filter the team members to find the one with the correct name.
    const res = await fetch(`http://localhost:1337/api/team-members?filters[name][$eq]=Divya Nayar&populate=*`, { cache: 'no-store' });
    if (!res.ok) return null;
    const responseData = await res.json();
    return responseData.data?.[0]; // Return the first match
  } catch (error) {
    console.error("Error fetching lead dancer data:", error);
    return null;
  }
}

// This is the main page component for Divya Nayar.
export default async function DivyaNayarPage() {
  const dancer = await getLeadDancer();
  const strapiUrl = 'http://localhost:1337';

  if (!dancer) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <h1 className="text-4xl font-bold">Artist Information Not Found</h1>
      </main>
    );
  }

  const { name, role, bio, photo } = dancer;
  const imageUrl = strapiUrl + photo.url;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-8 md:p-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          {/* Left Column: Photo */}
          <div className="md:col-span-1">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={name || 'Photo of Divya Nayar'}
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          </div>

          {/* Right Column: Bio and Details */}
          <div className="md:col-span-2">
            <h1 className="text-5xl font-serif font-bold text-white">{name}</h1>
            <p className="text-2xl text-green-400 mt-2 mb-8">{role}</p>
            
            <div className="prose prose-invert lg:prose-xl max-w-none text-lg text-gray-300">
              {bio.map((block, index) => (
                <p key={index} className="mb-6">
                  {block.children.map(child => child.text).join('')}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
