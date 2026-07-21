import type { Metadata } from 'next';

import { BlogPageContent } from '@/components/BlogPageContent';
import { fetchPostSummariesOrEmpty } from '@/service/blogService';

export const metadata: Metadata = {
  title: 'Blog | Robert De La Cruz',
  description: 'Writing on software engineering and AI workflows.',
};

export default async function BlogIndexPage() {
  const posts = await fetchPostSummariesOrEmpty();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BlogPageContent posts={posts} />
    </main>
  );
}
