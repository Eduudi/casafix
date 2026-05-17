import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const FIREBASE_PROJECT_ID = "elaresolve-2f835";
const SUPA_URL = "https://pttbpywteivrcnvhpmxi.supabase.co";
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SVC_ROLE_KEY") || "";
const SERVICE_ACCOUNT_JSON = Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const pemBody = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    { iss: sa.client_email, sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now, exp: now + 3600,
      scope: "https://www.googleapis.com/auth/firebase.messaging" },
    key
  );
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  return (await res.json()).access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { targetEmail, title, body, type } = await req.json();
    if (!targetEmail || !title || !body)
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: cors });

    // Busca token FCM
    const tr = await fetch(
      `${SUPA_URL}/rest/v1/fcm_tokens?email=eq.${encodeURIComponent(targetEmail)}&select=token&limit=1`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    const tokens = await tr.json();
    if (!tokens?.length)
      return new Response(JSON.stringify({ error: "No FCM token" }), { status: 404, headers: cors });

    const accessToken = await getAccessToken(JSON.parse(SERVICE_ACCOUNT_JSON));

    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          message: {
            token: tokens[0].token,
            notification: { title, body },
            webpush: {
              notification: { icon: "https://casafix.vercel.app/icon-192.png" },
              fcm_options: { link: "https://casafix.vercel.app" },
            },
            data: { type: type || "general" },
          },
        }),
      }
    );
    const result = await fcmRes.json();
    if (result.error) return new Response(JSON.stringify({ error: result.error }), { status: 500, headers: cors });
    return new Response(JSON.stringify({ success: true, messageId: result.name }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
});
