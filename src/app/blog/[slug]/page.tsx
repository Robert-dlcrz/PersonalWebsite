import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { BlogMarkdown } from '@/components/blog-layouts/BlogMarkdown';
import { BlogPage } from '@/components/blog-layouts/BlogPage';
import { BlobFetchError } from '@/persistence/blobClient';
import { BlogService, blogService } from '@/service/blogService';

// Blog posts live in Vercel Blob, so new slugs should work without redeploying
// or being listed in generateStaticParams at build time.
export const dynamicParams = true;

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// Request-scoped cache so metadata and page rendering share one post load.
const getBlogPost = cache((slug: string) => blogService.fetchPost(slug));

// Pre-render known posts from the Blob index for speed; dynamicParams keeps new
// Blob posts reachable even before the next deploy updates this static list.
export async function generateStaticParams() {
  try {
    const posts = await blogService.fetchPostSummaries();
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    if (
      error instanceof BlobFetchError &&
      error.pathname === BlogService.BLOG_INDEX_PATH &&
      error.status === 404
    ) {
      console.warn('Blog route: blog index missing; static params disabled until blog/blog_index.json exists');
      return [];
    }
    throw error;
  }
}

// Next.js calls this automatically to populate each post's <title> and meta
// description instead of falling back to the site-wide defaults.
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getBlogPost(slug);
    return {
      title: `${post.title} | Robert De La Cruz`,
      description: post.excerpt,
    };
  } catch {
    return {};
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getBlogPost(slug);
  } catch {
    return notFound();
  }

  const renderedBody = <BlogMarkdown markdown={post.markdown} slug={slug} />;
  const pagePost = {
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    sections: post.sections,
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BlogPage post={pagePost} renderedBody={renderedBody} />
    </main>
  );
}
