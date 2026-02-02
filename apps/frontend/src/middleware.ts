import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromToken } from "./utils/auth";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const user = getUserFromToken(token);

  if (!user) {
    return redirectToLogin(request);
  }
  // Check user status first, regardless of type
  if (user.status === "suspended") {
    return redirectToSuspended(request);
  } else if (user.status === "pending") {
    return redirectToPending(request);
  }

  // Then check type and route access
}

function redirectToLogin(request: NextRequest) {
  const redirectUrl = new URL("/", request.url);
  return NextResponse.redirect(redirectUrl);
}

function redirectToForbidden(request: NextRequest) {
  const redirectUrl = new URL("/no-access", request.url);
  return NextResponse.redirect(redirectUrl);
}

function redirectToSuspended(request: NextRequest) {
  const redirectUrl = new URL("/no-access/suspended", request.url);
  return NextResponse.redirect(redirectUrl);
}

function redirectToPending(request: NextRequest) {
  const redirectUrl = new URL("/no-access/pending", request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
