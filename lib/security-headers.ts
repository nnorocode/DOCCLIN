export const securityHeaders: Record<string,string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "base-uri 'self'; object-src 'none'; frame-ancestors 'self'",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(self)",
};
export function secureResponse(response: Response, request: Request) {
  const headers = new Headers(response.headers);
  for (const [name,value] of Object.entries(securityHeaders)) headers.set(name,value);
  if (new URL(request.url).protocol === "https:") headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  return new Response(response.body,{ status: response.status, statusText: response.statusText, headers });
}
