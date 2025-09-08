import { type NextRequest, NextResponse } from "next/server"
import jwt, { JwtPayload as OfficialJwtPayload } from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL_ERROR: JWT_SECRET is not defined.")
}
const JWT_SECRET = process.env.JWT_SECRET

export interface AppJwtPayload extends OfficialJwtPayload {
  userId: string
  role: "admin" | "user"
}

export type AuthorizedHandlerContext<T = {}> = {
  params: T
  decoded: AppJwtPayload
}

export type AuthorizedHandler<T = {}> = (
  request: NextRequest,
  context: AuthorizedHandlerContext<T>
) => Promise<NextResponse>

type AllowedRole = "admin" | "user" | "self"

export const withAuthorization = <T extends { userId?: string }>(
  handler: AuthorizedHandler<T>,
  allowed: Array<AllowedRole>
) => {
  // The `context` parameter for dynamic routes contains `params` as a Promise.
  // We need to `await` it to get the actual parameters.
  return async (request: NextRequest, context: { params: T }) => {
    const actualParams = (await context?.params) || ({} as T)

    try {
      const authHeader = request.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 })
      }

      const token = authHeader.substring(7)
      if (!token || token === "null" || token === "undefined") {
        return NextResponse.json({ error: "Unauthorized: Invalid token format" }, { status: 401 })
      }

      let decoded: AppJwtPayload
      try {
        decoded = jwt.verify(token, JWT_SECRET) as AppJwtPayload
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          return NextResponse.json({ error: "Token expired. Please log in again." }, { status: 401 })
        }
        return NextResponse.json({ error: "Invalid or malformed token" }, { status: 401 })
      }

      const isOwner = actualParams.userId && decoded.userId === actualParams.userId
      const isAdmin = decoded.role === "admin"
      const isUser = decoded.role === "user"

      const isAllowed =
        (allowed.includes("admin") && isAdmin) || (allowed.includes("user") && isUser) || (allowed.includes("self") && isOwner)

      if (!isAllowed) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      return await handler(request, { params: actualParams, decoded })
    } catch (error: any) {
      console.error(`API Route Error in ${request.url}:`, error)
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}