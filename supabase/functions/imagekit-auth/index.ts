// supabase/functions/imagekit-auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const publicKey = Deno.env.get("IMAGEKIT_PUBLIC_KEY");
    const privateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");

    if (!publicKey || !privateKey) {
      throw new Error("ImageKit keys not configured");
    }

    // Gerar parâmetros de autenticação
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutos

    const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

    const authParams = {
      token,
      expire,
      signature,
    };

    return new Response(JSON.stringify(authParams), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});