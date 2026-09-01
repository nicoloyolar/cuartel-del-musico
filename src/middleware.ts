import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Protege todo /panel excepto la página de login.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/panel/login";
  const isProtected = pathname.startsWith("/panel") && !isLoginPage;

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/panel/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/panel/:path*"],
};
