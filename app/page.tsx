import FeaturesSection from "@/components/app/landing-page/features-section";
import { HeroSection } from "@/components/app/landing-page/hero-section";
import { ThemeButton } from "@/components/app/theme-button";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChevronDown, Volleyball } from "lucide-react";
import Image from "next/image";
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

        <section id="player-app" className="py-14 animate-fade-up">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative overflow-hidden p-4">
              {/* <div className="absolute -top-14 right-6 h-32 w-32 rounded-full bg-primary/10 blur-2xl" /> */}
              <Image
                src="/images/man-phone.png"
                alt="Player app preview"
                width={460}
                height={520}
                className="mx-auto max-h-[360px] w-auto object-contain"
              />
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">For players</p>
              <h2 className="text-2xl font-semibold md:text-3xl">
                Help players discover courts and book instantly
              </h2>
              <p className="text-sm text-muted-foreground">
                Share your venues on the Arena Go player app. Customers can search nearby
                facilities, see real-time availability, and book in seconds.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/auth/register">List your center</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Open player app</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-14 animate-fade-up">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                FAQ
              </span>
              <div>
                <h2 className="text-3xl font-semibold">Have more questions?</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Arena Go helps sports centers manage bookings, staff, and facilities in one place.
                  If you still need help, our team is here.
                </p>
              </div>
              <div className="relative rounded-3xl border border-border/60 bg-muted p-6 shadow-md">
                <h3 className="text-lg font-semibold">Can’t find answers?</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-3xs md:max-w-xs">
                  Contact our support team for onboarding help, pricing questions, or data
                  migrations.
                </p>
                <Image
                  src="/images/man-question.png"
                  alt="Support representative"
                  width={200}
                  height={420}
                  className="absolute right-0 bottom-0 h-32 w-auto -scale-x-100 sm:h-52"
                />
                <Button className="mt-5" asChild>
                  <Link href="/auth/register">Contact us</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                {
                  q: "What is Arena Go and how can it help my center?",
                  a: "Arena Go unifies bookings, payments, staff, and analytics so you can run your facilities with less admin work.",
                },
                {
                  q: "Do you offer a free trial?",
                  a: "Yes. Start with a trial to set up courts, pricing, and availability before going live.",
                },
                {
                  q: "Which payment methods are supported?",
                  a: "Accept cards and online wallets. We also support invoices and on-site payments when needed.",
                },
                {
                  q: "Can I manage multiple locations?",
                  a: "Multi-location reporting and shared staff permissions are available for growing center groups.",
                },
              ].map((item, index) => (
                <details
                  key={item.q}
                  open={index === 1}
                  className="group rounded-2xl border border-border/60 bg-muted p-5"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-180">
                      <ChevronDown className="h-4 w-4" />
                    </span>
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
