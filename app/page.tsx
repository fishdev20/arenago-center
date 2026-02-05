import FeaturesSection from "@/components/app/landing-page/features-section";
import { HeroSection } from "@/components/app/landing-page/hero-section";
import { ThemeButton } from "@/components/app/theme-button";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChevronDown, Volleyball } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppEntry() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, center_id, is_active")
      .eq("id", user.id)
      .single();

    if (!profile) redirect("/auth/login");
    if (profile.role === "superadmin") redirect("/superadmin/dashboard");
    if (profile.role === "admin") redirect("/admin/centers");

    if (!profile.is_active || !profile.center_id) {
      redirect("/center/pending");
    }

    const { data: center } = await supabase
      .from("centers")
      .select("status")
      .eq("id", profile.center_id)
      .single();

    if (!center || center.status !== "active") redirect("/center/pending");
    redirect("/center/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur animate-fade-up">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <Volleyball className="h-6 w-6" />
            <span className="tracking-wide">ARENA GO</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#features">
              Features
            </a>
            <a className="hover:text-foreground" href="#about">
              About
            </a>
            <a className="hover:text-foreground" href="#testimonials">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeButton />
            <Button variant="outline" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 pt-24">
        <HeroSection />

        <FeaturesSection />

        <section id="faq" className="py-14 animate-fade-up">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">FAQ</p>
              <h2 className="mt-2 text-2xl font-semibold">Questions, answered</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Everything you need to know about onboarding, pricing, and support.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                {
                  q: "How quickly can we go live?",
                  a: "Most centers are onboarded in under a week with court setup, pricing, and staff roles.",
                },
                {
                  q: "Do you support payments and invoicing?",
                  a: "Yes, collect payments online and export invoicing reports for finance teams.",
                },
                {
                  q: "Can we manage multiple locations?",
                  a: "Arena Go supports multi-location groups with shared reporting and permissions.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border/60 bg-background p-5"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="my-12 rounded-3xl bg-primary px-6 py-10 text-primary-foreground animate-fade-up">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold">
                Ready to take your sports complex to the next level?
              </h3>
              <p className="mt-3 text-sm text-primary-foreground/90">
                Join thousands of facility owners who automate their operations with Arena Go.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button className="bg-background text-foreground hover:bg-background/90" asChild>
                <Link href="/auth/register">Start your free trial</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/auth/login">Contact sales</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/60 py-8 text-xs text-muted-foreground animate-fade-up">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Volleyball className="h-4 w-4" />
                <span>ARENA GO</span>
              </div>
              <p className="mt-2 max-w-xs">
                The easiest way to manage sports facilities, bookings, and customer experiences.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-foreground font-semibold">Product</div>
                <div>Pricing</div>
                <div>Integrations</div>
                <div>Roadmap</div>
              </div>
              <div className="space-y-2">
                <div className="text-foreground font-semibold">Company</div>
                <div>About</div>
                <div>Careers</div>
                <div>Blog</div>
              </div>
              <div className="space-y-2">
                <div className="text-foreground font-semibold">Support</div>
                <div>Help center</div>
                <div>Status</div>
                <div>Contact</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 md:flex-row md:justify-between">
            <span>© {new Date().getFullYear()} Arena Go. All rights reserved.</span>
            <span>Privacy policy · Terms of service</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
