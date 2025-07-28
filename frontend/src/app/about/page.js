// File: frontend/src/app/about/page.js
import Image from 'next/image';

// This function fetches all team member data.
async function getTeamMembers() {
  try {
    const res = await fetch('http://localhost:1337/api/team-members?populate=*', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data from API');
    const responseData = await res.json();
    return responseData.data;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

// Reusable Team Member Card Component
function TeamMemberCard({ member }) {
  const strapiUrl = 'http://localhost:1337';

  if (!member || !member.photo) {
    return null;
  }

  const { name, role, photo } = member;
  const imageUrl = strapiUrl + photo.url;

  return (
    <div className="text-center">
      <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={name || 'Team member photo'}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <p className="text-green-400">{role}</p>
    </div>
  );
}


// This is our main About page component.
export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <main className="min-h-screen flex-col items-center bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-serif font-bold">About Dakshina</h1>
        <p className="text-lg text-gray-300 mt-4 max-w-3xl mx-auto">
          Dakshina is a collective of artists dedicated to exploring the rich tapestry of Indian classical dance while forging new paths in contemporary expression. Our work is a dialogue between tradition and innovation, heritage and the future.
        </p>
      </div>
      
      {/* Team Members Section */}
      <div className="bg-gray-800 py-20 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
            {teamMembers.length > 0 ? (
              teamMembers.map(member => <TeamMemberCard key={member.id} member={member} />)
            ) : (
              <p className="text-gray-400 col-span-full text-center">Team member information is not yet available.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
