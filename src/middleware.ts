import { NextResponse } from 'next/server'
export function middleware(request: Request): NextResponse {
  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(request.headers)
  const url = new URL(request.url)

  requestHeaders.set('x-url', request.url)
  requestHeaders.set('x-pathname', url.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
