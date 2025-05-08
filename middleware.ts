import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login', '/api/auth/setup'];

// Secret key for JWT - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'household-manager-secret-key';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'));

  // If it's a public path, allow the request to proceed
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const token = request.cookies.get('auth-token')?.value;

  // If there is no token, redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token
    await jwtVerify(
      token, 
      new TextEncoder().encode(JWT_SECRET)
    );
    
    // If verification succeeds, proceed with the request
    return NextResponse.next();
  } catch (error) {
    // If verification fails, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

// Configure the middleware to match specific paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.ico$|.*\\.mp3$).*)',
  ],
};