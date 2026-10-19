export type SecurityEvent = "https_required" | "csrf_blocked" | "rate_limited" | "rate_limit_unavailable" | "server_error";
export type RequestLimiter = { limit(options: {key:string}): Promise<{success:boolean}> };
const safeMethods = new Set(["GET","HEAD","OPTIONS"]);
export function isLoopback(url: URL) { return ["localhost","127.0.0.1","[::1]"].includes(url.hostname); }
export function securityLog(event: SecurityEvent, requestId: string, status: number) {
  // Never include URLs, IPs, tokens, emails, bodies or raw exception messages.
  console.warn(JSON.stringify({type:"security",event,requestId,status}));
}
export async function requestSecurity(request: Request, options: {requestId:string;development?:boolean;limiter?:RequestLimiter;trustedClientIp?:string}): Promise<Response|null> {
  const url = new URL(request.url);
  const reject = (event: SecurityEvent,status:number,message:string,extra?:Record<string,string>) => {
    securityLog(event,options.requestId,status);
    return new Response(JSON.stringify({error:message,requestId:options.requestId}),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store",...extra}});
  };
  if (url.protocol!=="https:" && !isLoopback(url)) {
    if (!safeMethods.has(request.method)) return reject("https_required",400,"Use HTTPS.");
    url.protocol="https:";
    return new Response(null,{status:308,headers:{Location:url.toString(),"Cache-Control":"no-store"}});
  }
  if (safeMethods.has(request.method)) return null;
  const origin=request.headers.get("origin"), site=request.headers.get("sec-fetch-site");
  // No sibling-subdomain exception: same-site is not necessarily same-origin.
  if (site==="cross-site" || (origin!==null && origin!==url.origin) ||
      (origin===null && (request.headers.has("cookie") || site!==null && site!=="same-origin"))) {
    return reject("csrf_blocked",403,"Origem da solicitação não autorizada.");
  }
  if (options.development) return null;
  if (!options.limiter || !options.trustedClientIp) return reject("rate_limit_unavailable",503,"Proteção de requisições indisponível.");
  try {
    // A digest avoids sending a raw address to the counter or application logs.
    const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(options.trustedClientIp));
    const key=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
    if (!(await options.limiter.limit({key})).success) return reject("rate_limited",429,"Muitas solicitações. Tente novamente.",{"Retry-After":"60"});
  } catch { return reject("rate_limit_unavailable",503,"Proteção de requisições indisponível."); }
  return null;
}
