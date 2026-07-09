import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas públicas (sem autenticação necessária)
  const publicRoutes = ["/login", "/"];

  // Rotas protegidas
  const protectedRoutes = ["/painel", "/despesas", "/reembolsos", "/revisao", "/usuarios"];

  // Se está tentando acessar rota protegida sem token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return Response.redirect(new URL("/login", request.url));
  }

  // Se está no login e tem token, redireciona para painel
  if (pathname === "/login" && token) {
    return Response.redirect(new URL("/painel", request.url));
  }

  return undefined;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)", "/"],
};
