// File: frontend/src/app/blog/page.js
import Image from 'next/image';
import Link from 'next/link';

// This function fetches all blog posts, populating the author and cover image.
async function getBlogPosts() {
  try {
    const res = await fetch('http://localhost:1337/api/blog-posts?populate[author][populate]=*&populate=cover_image', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data from API');
    const responseData = await res.json();
    return responseData.data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

// Reusable Blog Post Card Component
function BlogPostCard({ post }) {
  const strapiUrl = 'http://localhost:1337';

  if (!post || !post.cover_image) {
    return null;
  }

  const { title, excerpt, author, cover_image } = post;
  const imageUrl = strapiUrl + cover_image.url;
  const authorImageUrl = strapiUrl + author?.photo?.url;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
      <Link href={`/blog/${post.id}`} className="block relative w-full h-60">
        <Image
          src={imageUrl}
          alt={title || 'Blog post cover image'}
          layout="fill"
          objectFit="cover"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-serif font-bold mb-3 text-white hover:text-green-400 transition-colors">
          <Link href={`/blog/${post.id}`}>{title}</Link>
        </h2>
        <p className="text-gray-400 flex-grow mb-4">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center">
          {author?.photo && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-4">
              <Image
                src={authorImageUrl}
                alt={author.name || 'Author photo'}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div>
            <p className="text-white font-semibold">{author?.name || 'Dakshina'}</p>
            {/* We can add the post date here later */}
          </div>
        </div>
      </div>
    </div>
  );
}


// This is our main Blog page component.
export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen flex-col items-center p-8 md:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold">Reflections</h1>
          <p className="text-lg text-gray-400 mt-4">Thoughts, stories, and insights from our artistic journey.</p>
        </div>
        
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map(post => <BlogPostCard key={post.id} post={post} />)
          ) : (
            <p className="text-gray-400 col-span-full text-center">No posts found.</p>
          )}
        </div>
      </div>
    </main>
  );
}
