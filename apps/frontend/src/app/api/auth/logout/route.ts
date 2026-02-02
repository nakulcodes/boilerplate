import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const hostname = new URL(process.env.SERVER_URL as string).hostname;
  const domain = hostname.split(".").slice(-2).join(".");

  cookieStore.delete("token");
  
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    domain: process.env.NODE_ENV === "production" ? `.${domain}` : undefined,
    expires: new Date(0), // Set to past date to delete
  });

  const response = NextResponse.json({ success: true });

  response.headers.set(
    "Cache-Control",
    "no-cache, no-store, max-age=0, must-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
