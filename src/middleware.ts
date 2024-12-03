export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/collections",
    "/collections/:path*",
    "/quotes",
    "/quotes/:path*",
  ],
};
