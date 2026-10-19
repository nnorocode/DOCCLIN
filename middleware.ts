import { NextRequest, NextResponse } from "next/server";
import { contentSecurityPolicy, securityHeaders } from "./lib/security-headers";

export function middleware(request: NextRequest) {
  const development = process.env.NODE_ENV === "development";
  // Never trust a nonce/CSP supplied by the caller. Vinext reads our forwarded CSP.
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))));
  const policy = contentSecurityPolicy(nonce, development);
  const headers = new Headers(request.headers);
  headers.set("Content-Security-Policy", policy);
  headers.delete("Content-Security-Policy-Report-Only");
  headers.set("x-nonce", nonce);
  const response = NextResponse.next({ request: { headers } });
  for (const [name,value] of Object.entries(securityHeaders)) response.headers.set(name,value);
  response.headers.set("Content-Security-Policy",policy);
  // Authenticated page HTML/RSC and nonce-bearing responses must never be shared.
  response.headers.set("Cache-Control","private, no-store, max-age=0");
  return response;
}
export const config = { matcher: ["/((?!assets/|_next/static|_next/image|_vinext/|favicon.ico).*)"] };
