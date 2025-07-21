import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Decode and verify the JWT using NextAuth's decode function
    const payload = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && typeof payload.exp === "number" && payload.exp < now) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // Return userinfo in standard OpenID Connect format
    return NextResponse.json({
      sub: payload.sub,
      email: payload.email,
      email_verified: true, // Assuming email is verified since they logged in
      name: payload.name,
      picture: payload.image,
      preferred_username: payload.name,
    });
  } catch (error) {
    console.error("Error in userinfo endpoint:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
