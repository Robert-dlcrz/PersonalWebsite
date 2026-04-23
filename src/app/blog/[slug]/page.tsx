import { notFound } from 'next/navigation';

import { BlogMarkdown } from '@/components/blog-layouts/BlogMarkdown';
import { BlogPage } from '@/components/blog-layouts/BlogPage';
import { blogService } from '@/service/blogService';

/**
 * Allow on-demand rendering for slugs not returned by `generateStaticParams`.
 * Posts added to Vercel Blob after deploy render on first request (~SSR) and
 * are then cached, mirroring the trip detail page strategy.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ slug: 'hello-world' }];
}

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await blogService.fetchPost(slug);
  } catch {
    return notFound();
  }

  const renderedBody = <BlogMarkdown markdown={post.markdown} slug={slug} />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BlogPage post={post} renderedBody={renderedBody} />
    </main>
  );
}
