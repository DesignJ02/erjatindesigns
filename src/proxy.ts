import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Every page on the site is a 404. Rewriting to a route that doesn't exist
// renders app/not-found.tsx with a 404 status. Delete this file to restore the portfolio.
export function proxy(request: NextRequest) {
  return NextResponse.rewrite(new URL("/__404", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
