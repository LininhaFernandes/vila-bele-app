import { type NextRequest } from "next/server";
// import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Middleware temporariamente desabilitado para debug
  return;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
