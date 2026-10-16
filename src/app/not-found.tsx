import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { mainNav } from '@/config/site';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
};

/**
 * not-found.tsx —— 404 页面
 *
 * 提供返回首页与主要栏目入口，帮助访客继续浏览。
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="text-display font-semibold text-primary">404</span>
      <h1 className="text-heading-lg">Page not found</h1>
      <p className="max-w-md text-body text-text-secondary">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
      <nav aria-label="Main sections" className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-small text-text-muted transition-colors duration-[var(--duration-fast)] hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </Container>
  );
}
