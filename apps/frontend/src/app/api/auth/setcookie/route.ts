import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieValue = await request.json();

    if (!cookieValue) {
      return NextResponse.json(
        { error: "Cookie value is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const hostname = new URL(process.env.SERVER_URL as string).hostname;
    const domain = hostname.split(".").slice(-2).join(".");


    cookieStore.set("token", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      domain: process.env.NODE_ENV === "production" ? domain : undefined,
      expires: new Date(
        Date.now() + Number(process.env.JWT_EXPIRE || 86400) * 1000
      ),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting cookie:", error);
    return NextResponse.json(
      { error: "Failed to set cookie" },
      { status: 500 }
    );
  }
}
