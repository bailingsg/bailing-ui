import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/#home', label: '首页' },
  { href: '/#about', label: '关于' },
  { href: '/#contact', label: '联系' },
];

/** 基础站点导航结构（Phase 1 骨架，完整站点地图在 Phase 2 建设） */
export function SiteHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Bailing Wooden
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-6 text-sm text-muted-foreground">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
