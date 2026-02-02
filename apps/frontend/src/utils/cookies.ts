import { cookies } from "next/headers";
import { getUserFromToken } from "./auth";

export async function getServerSideToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? "";
}

export async function getServerSideUser() {
  const token = await getServerSideToken();
  return getUserFromToken(token);
}

