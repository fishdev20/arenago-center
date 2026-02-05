import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  const protectedPath =
    // path.startsWith("/app") ||
    path.startsWith("/center") || path.startsWith("/admin") || path.startsWith("/superadmin");

  // if (protectedPath && !user) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = "/auth/login";
  //   return NextResponse.redirect(url);
  // }

  if (!user) return res;

  // Role gates
  if (path.startsWith("/center") || path.startsWith("/admin") || path.startsWith("/superadmin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    const deny =
      (path.startsWith("/superadmin") && role !== "superadmin") ||
      (path.startsWith("/admin") && !(role === "admin" || role === "superadmin")) ||
      (path.startsWith("/center") && role !== "center");

    if (deny) {
      const url = req.nextUrl.clone();
      console.log("deny access");
      url.pathname = "/forbiden";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
