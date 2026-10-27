import { withAuth } from "next-auth/middleware";

export default withAuth({ pages: { signIn: "/login" } });

export const config = {
  matcher: [
    "/((?!login|offline|\\.well-known|api/auth|api/assetlinks|api/health|api/share-target|_next|sw.js|swe-worker|manifest.webmanifest|icons|favicon).*)",
  ],
};
