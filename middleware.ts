import { type NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas públicas
  const publicRoutes = ["/login", "/"];

  // Rotas protegidas
  const protectedRoutes = ["/painel", "/perfil", "/despesas", "/reembolsos", "/revisao"];

  // Rotas apenas admin
  const adminRoutes = ["/admin"];

  // Se está tentando acessar rota protegida sem token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return Response.redirect(new URL("/login", request.url));
  }

  // Se está tentando acessar rota admin sem token
  if (adminRoutes.some(route => pathname.startsWith(route)) && !token) {
    return Response.redirect(new URL("/login", request.url));
  }

  // Verificar role de admin para rotas admin
  if (adminRoutes.some(route => pathname.startsWith(route)) && token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "seu-super-secreto-key-change-this-em-producao";
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!decoded || decoded.role !== "admin") {
        return Response.redirect(new URL("/painel", request.url));
      }
    } catch (error) {
      return Response.redirect(new URL("/login", request.url));
    }
  }

  // Se está no login e tem token, redireciona para painel
  if (pathname === "/login" && token) {
    return Response.redirect(new URL("/painel", request.url));
  }

  return undefined;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)", "/"],
};
