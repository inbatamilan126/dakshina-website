// File: frontend/src/app/blog/[id]/page.js
import Image from 'next/image';

// This function fetches data for a SINGLE blog post using a more reliable filter query.
async function getPost(postId) {
  try {
    const res = await fetch(`http://localhost:1337/api/blog-posts?filters[id][$eq]=${postId}&populate[author][populate]=*&populate=cover_image`, { cache: 'no-store' });
    if (!res.ok) return null;
    const responseData = await res.json();
    // A filter query returns an array, so we take the first item.
    return responseData.data?.[0];
  } catch (error) {
    console.error("Error fetching post:", error);
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

// This is our main Blog Post page component.
export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  const strapiUrl = 'http://localhost:1337';

  // --- CORRECTED: The safety check no longer needs to look for .attributes ---
  if (!post) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <h1 className="text-4xl font-bold">Post Not Found</h1>
      </main>
    );
  }

  // --- CORRECTED: Destructure the data directly from the post object ---
  const { title, content, author, cover_image, publishedAt } = post;
  
  // Safety check for the cover image
  if (!cover_image?.url) {
     return <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white"><h1 className="text-4xl font-bold">Post is missing a cover image.</h1></main>;
  }

  const imageUrl = strapiUrl + cover_image.url;
  const authorImageUrl = author?.photo?.url ? strapiUrl + author.photo.url : null;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Cover Image Header */}
      <div className="relative w-full h-96">
        <Image
          src={imageUrl}
          alt={title || 'Blog post cover image'}
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-8 md:p-12">
          <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">{title}</h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto p-8">
        <div className="prose prose-invert lg:prose-xl max-w-none text-lg text-gray-300">
          {content.map((block, index) => (
            <p key={index} className="mb-6">
              {block.children.map(child => child.text).join('')}
            </p>
          ))}
        </div>

        {/* Author Info */}
        <div className="mt-16 pt-8 border-t border-gray-700 flex items-center">
          {authorImageUrl && (
            <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
              <Image
                src={authorImageUrl}
                alt={author.name || 'Author photo'}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-lg">{author?.name || 'Dakshina'}</p>
            <p className="text-gray-400">Published on {formatDate(publishedAt)}</p>
          </div>
        </div>
      </article>
    </main>
  );
}
