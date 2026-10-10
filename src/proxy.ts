import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/products(.*)",
  "/categories(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/shipping-policy(.*)",
  "/returns-refunds(.*)",
  "/faq(.*)",
  "/demo(.*)",
  "/bulk-orders(.*)",
  "/track-order(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/activate(.*)",
  "/api/shop(.*)",
  "/api/activate(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/super(.*)",
  "/account/orders(.*)",
  "/account/cards(.*)",
  "/api/dashboard(.*)",
  "/api/super(.*)",
  "/api/account(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return;
  }

  // In development mode, allow seamless access for local developer testing
  if (process.env.NODE_ENV === "development") {
    return;
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, robots.txt, and sitemap.xml
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
