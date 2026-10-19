// Server-only: SUPABASE_SERVICE_ROLE_KEY must never be bundled into the app.
// @ts-nocheck -- Deno Edge Function; checked by `deno check` when deploying.
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
Deno.serve(async (request: Request) => {
  const appOrigin = Deno.env.get("APP_ORIGIN");
  const origin = request.headers.get("origin");
  const headers = { "Content-Type": "application/json", "Vary": "Origin", ...(origin === appOrigin ? { "Access-Control-Allow-Origin": appOrigin!, "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" } : {}) };
  const reply = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers });
  if (!appOrigin || (origin && origin !== appOrigin)) return reply({ error: "Origin not allowed" }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return reply({ error: "Authentication required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const publicKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const caller = createClient(url, publicKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return reply({ error: "Authentication required" }, 401);
    if (Number(request.headers.get("content-length")) > 16384) return reply({error:"Invalid invitation"},413);
    // Bound even a chunked request before parsing, not only its declared length.
    const reader = request.body?.getReader();
    if (!reader) return reply({error:"Invalid invitation"},400);
    let raw="", size=0; const decoder=new TextDecoder();
    while (true) { const {value,done}=await reader.read(); if(done)break; size+=value.byteLength; if(size>16384){await reader.cancel();return reply({error:"Invalid invitation"},413);} raw+=decoder.decode(value,{stream:true}); }
    raw+=decoder.decode();
    let body; try { body=JSON.parse(raw); } catch { return reply({error:"Invalid invitation"},400); }
    if (!body || typeof body!=="object" || Array.isArray(body)) return reply({error:"Invalid invitation"},400);
    if (typeof body.business_id !== "string" || typeof body.email !== "string" || typeof body.name !== "string" || !["admin", "reception", "employee"].includes(body.role) || body.name.trim().length < 1 || body.name.length > 160 || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return reply({ error: "Invalid invitation" }, 400);
    const { data: actor, error: roleError } = await caller.from("business_members").select("role").eq("business_id", body.business_id).eq("user_id", user.id).eq("active", true).single();
    if (roleError || !actor || !["owner", "admin"].includes(actor.role) || (actor.role === "admin" && body.role === "admin")) return reply({ error: "Permission denied" }, 403);
    const {data:quota,error:quotaError}=await caller.rpc("consume_invitation_quota",{business:body.business_id});
    if(quotaError) return reply({error:"Invitation temporarily unavailable"},503);
    if(quota!==true) return new Response(JSON.stringify({error:"Too many invitations. Try later."}),{status:429,headers:{...headers,"Retry-After":"600"}});
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data, error } = await service.auth.admin.inviteUserByEmail(body.email.trim().toLowerCase(), { redirectTo: `${appOrigin}/entrar`, data: { full_name: body.name.trim() } });
    if (error || !data.user) return reply({ error: "Invitation could not be sent" }, 400);
    const { error: saveError } = await service.rpc("register_invited_member", { business: body.business_id, invited_user: data.user.id, invited_name: body.name.trim(), invited_email: body.email.trim().toLowerCase(), invited_role: body.role, inviting_user: user.id });
    if (saveError) return reply({ error: "Invitation sent but membership could not be created. Contact the administrator." }, 500);
    return reply({ ok: true });
  } catch { return reply({ error: "Invitation could not be completed" }, 500); }
});
