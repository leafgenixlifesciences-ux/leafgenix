export default async function supabaseKeepalive() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase keepalive environment variables are not configured");
  }

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/products?select=id&limit=1`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase keepalive failed with status ${response.status}`);
  }

  return new Response(null, { status: 204 });
}
