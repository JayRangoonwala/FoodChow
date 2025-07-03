import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';              // e.g., foodchowdemoindia.localhost:3000
  const pathname = req.nextUrl.pathname;                   // e.g., /
  // 👇 Don't rewrite if running on plain localhost
  if (host === 'localhost:3001') return NextResponse.next();

  const subdomain = host.replace('.vercel.app', '')
    .replace(`.food-chow`, '') .split('.')[0];                    // e.g., foodchowdemoindia
  console.log(subdomain)
  // 👇 Only rewrite when accessing root (homepage) via subdomain
  if (pathname === '/' && subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== 'food-chow') {
    const url = req.nextUrl.clone();
    url.pathname = `/`;           // Rewrite to path-based route
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
