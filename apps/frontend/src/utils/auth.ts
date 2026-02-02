import { JWTPayload } from "@/types/user.type";

export function getUserFromToken(token: string) {
  if (!token) return null;
  const payload = decodeJwt(token);

  if (!payload || isTokenExpired(payload)) return null;
  return {
    user_id: payload.user_id,
    email: payload.email,
    role: payload.role,
    type: payload.type,
    permissions: payload.permissions,
    firstName: payload.firstName,
    lastName: payload.lastName,
    status: payload.status,
    partnerId: payload.partnerId,
    isEmpireAccount: payload.isEmpireAccount,
    isImpersonated: payload.isImpersonated,
    originalAdminId: payload.originalAdminId,
    originalAdminEmail: payload.originalAdminEmail,
  };
}

function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
  return currentTime >= payload.exp;
}

function decodeJwt(token: string): JWTPayload | null {
  try {
    // Split the token and get the payload part (second part)
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    // Decode base64
    const payload = JSON.parse(
      Buffer.from(base64Payload, "base64").toString("utf8")
    );

    return payload as JWTPayload;
  } catch {
    console.error("JWT decode error");
    return null;
  }
}
