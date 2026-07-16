import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { logPageView } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    let body;
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = JSON.parse(text);
    }

    const { slug, trekSlug, referrer } = body;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // Capture visitor IP and User-Agent securely from request headers
    const reqHeaders = await headers();
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";
    const ua = reqHeaders.get("user-agent") || "";

    const supabaseServer = await createClient();

    // Check if the captain exists and matches the current authenticated session
    const { data: captain } = await supabaseServer
      .from("captains")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (captain) {
      const { data: { user } } = await supabaseServer.auth.getUser();
      // Skip logging if the visitor is the captain viewing their own public page
      if (user && user.id === captain.id) {
        return NextResponse.json({ status: "skipped", reason: "captain_session" });
      }
    }

    await logPageView(slug, trekSlug || null, referrer || "Direct", ip, ua);

    return NextResponse.json({ status: "success" });
  } catch (e: any) {
    console.error("Views logger api error:", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
