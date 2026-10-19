/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { secureResponse } from "../lib/security-headers";
import { requestSecurity, securityLog, type RequestLimiter } from "../lib/request-security";

interface Env {
  SECURITY_RATE_LIMITER?: RequestLimiter;
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const requestId=crypto.randomUUID();
    const finalize=(response:Response) => {
      const secured=secureResponse(response,request);
      secured.headers.set("X-Request-ID",requestId);
      return secured;
    };
    const blocked=await requestSecurity(request,{requestId,development:process.env.NODE_ENV==="development",
      limiter:env.SECURITY_RATE_LIMITER,
      // CF-Connecting-IP is trusted only when the runtime supplied Cloudflare metadata.
      trustedClientIp:(request as Request & {cf?:unknown}).cf ? request.headers.get("CF-Connecting-IP")??undefined : undefined});
    if(blocked)return finalize(blocked);
    // CSP/nonce are response policy, never an input supplied by the caller.
    const headers = new Headers(request.headers);
    headers.delete("Content-Security-Policy");
    headers.delete("Content-Security-Policy-Report-Only");
    headers.delete("x-nonce");
    request = new Request(request, { headers });
    const url = new URL(request.url);

    try {
    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse=await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      if(imageResponse.status>=500)throw new Error("Image service failure");
      return finalize(imageResponse);
    }

      const response=await handler.fetch(request,env,ctx);
      if(response.status>=500)throw new Error("Upstream failure");
      return finalize(response);
    } catch {
      securityLog("server_error",requestId,500);
      return finalize(new Response(JSON.stringify({error:"Não foi possível concluir a solicitação.",requestId}),{status:500,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}}));
    }
  },
};

export default worker;
