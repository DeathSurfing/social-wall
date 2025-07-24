'use client';

import dynamic from 'next/dynamic';
import posts from '../data/posts.json';

const InstagramEmbed = dynamic(
  () => import('react-social-media-embed').then((mod) => mod.InstagramEmbed),
  { ssr: false }
);
const FacebookEmbed = dynamic(
  () => import('react-social-media-embed').then((mod) => mod.FacebookEmbed),
  { ssr: false }
);
const LinkedInEmbed = dynamic(
  () => import('react-social-media-embed').then((mod) => mod.LinkedInEmbed),
  { ssr: false }
);

// Render embeds for all platforms without URL sanitization
const getEmbed = (platform: string, url: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <InstagramEmbed url={url} width={300} />;
    case 'facebook':
      return <FacebookEmbed url={url} width={300} />;
    case 'linkedin':
      return <LinkedInEmbed url={url} width={300} height={400} />;
    default:
      return null;
  }
};

export default function SocialWall() {
  const chunkSize = 9;

  // Divide posts into 3x3 groups
  const groups: typeof posts[][] = [];
  for (let i = 0; i < posts.length; i += chunkSize) {
    groups.push(posts.slice(i, i + chunkSize));
  }

  // Duplicate groups for infinite scroll
  const loopedGroups = [...groups, ...groups];

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-gray-100">
      <div
        className="flex animate-scroll-x"
        style={{
          width: `${loopedGroups.length * 100}vw`,
          animation: `scroll 120s cubic-bezier(0.45, 0, 0.55, 1) infinite`,
        }}
      >
        {loopedGroups.map((group, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 grid-rows-3 gap-4 w-screen h-screen p-4 shrink-0"
          >
            {group.map((post, index) => (
              <div
                key={`${idx}-${index}`}
                className="bg-white rounded-xl shadow flex items-center justify-center p-2 overflow-hidden"
              >
                {getEmbed(post.platform, post.url)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-10%);
          }
        }

        .animate-scroll-x {
          animation: scroll 120s linear infinite;
        }
      `}</style>
    </div>
  );
}

