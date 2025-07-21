# JWT Issuer API Documentation

This document describes the JWT issuer functionality implemented for the Online Agricultural Chatbot.

## Overview

The implementation provides two main endpoints:
1. `/api/jwt/issue` - Issues short-lived JWTs (15 minutes expiration)
2. `/api/jwt/verify` - Verifies JWTs and returns user information
3. `/api/userinfo` - OpenID Connect compatible userinfo endpoint

All endpoints use the same signing secret as NextAuth (`NEXTAUTH_SECRET` environment variable).

## API Endpoints

### POST /api/jwt/issue

Issues a new JWT for an authenticated user.

**Requirements:**
- User must be authenticated (valid NextAuth session)
- Session must contain user information

**Request:**
```http
POST /api/jwt/issue
Content-Type: application/json
Cookie: next-auth.session-token=<session-token>
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "user:read"
}
```

**Response (Unauthorized):**
```json
{
  "error": "Unauthorized - No valid session found"
}
```

### GET /api/jwt/verify

Verifies a JWT and returns the decoded payload.

**Request:**
```http
GET /api/jwt/verify
Authorization: Bearer <jwt-token>
```

**Response (Success):**
```json
{
  "sub": "user@example.com",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg",
  "iss": "aiculture-jwt-issuer",
  "iat": 1641234567,
  "exp": 1641235467,
  "valid": true
}
```

**Response (Invalid Token):**
```json
{
  "error": "Invalid or expired token"
}
```

### GET /api/userinfo

OpenID Connect compatible userinfo endpoint.

**Request:**
```http
GET /api/userinfo
Authorization: Bearer <jwt-token>
```

**Response (Success):**
```json
{
  "sub": "user@example.com",
  "email": "user@example.com",
  "email_verified": true,
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "preferred_username": "John Doe"
}
```

## Testing the Implementation

### 1. Issue a JWT

First, authenticate with the application and obtain a session. Then:

```bash
curl -X POST http://localhost:3000/api/jwt/issue \
  -H "Content-Type: application/json" \
  -b "next-auth.session-token=<your-session-token>"
```

### 2. Verify the JWT

Use the token from step 1:

```bash
curl -X GET http://localhost:3000/api/jwt/verify \
  -H "Authorization: Bearer <jwt-token-from-step-1>"
```

### 3. Get User Info

```bash
curl -X GET http://localhost:3000/api/userinfo \
  -H "Authorization: Bearer <jwt-token-from-step-1>"
```

## Implementation Details

### Security Features

1. **Short-lived tokens**: JWTs expire after 15 minutes
2. **Same secret as NextAuth**: Uses `NEXTAUTH_SECRET` for consistency
3. **Authentication required**: Only authenticated users can issue JWTs
4. **Type safety**: TypeScript ensures proper type checking
5. **Error handling**: Comprehensive error responses

### JWT Payload Structure

```json
{
  "sub": "user@example.com",
  "name": "John Doe", 
  "email": "user@example.com",
  "image": "https://example.com/avatar.jpg",
  "iat": 1641234567,
  "exp": 1641235467,
  "iss": "aiculture-jwt-issuer"
}
```

### Environment Variables

Make sure `NEXTAUTH_SECRET` is set in your environment:

```env
NEXTAUTH_SECRET=your-nextauth-secret-key-here-change-in-production
```

## Integration with Other Services

Other services can validate JWTs by:

1. Calling `/api/jwt/verify` or `/api/userinfo` with the JWT
2. Implementing their own JWT verification using the same `NEXTAUTH_SECRET`
3. Using standard JWT libraries to decode and verify the token

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized (no session, invalid token, expired token) |
| 500 | Internal server error |