import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/modules/auth/lib/get-server-session/get-server-session";
import { encode } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session found" },
        { status: 401 },
      );
    }

    // Create JWT payload with short expiration (15 minutes)
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: session.user.email,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      iat: now,
      exp: now + 15 * 60, // 15 minutes from now
      iss: "aiculture-jwt-issuer",
    };

    // Use NextAuth's encode function with the same secret
    const token = await encode({
      token: payload,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    return NextResponse.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: 15 * 60, // 15 minutes in seconds
      scope: "user:read",
    });
  } catch (error) {
    console.error("Error issuing JWT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
