import { Badge } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="feature" className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-12 lg:space-y-24 animate-fade-up">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                Run your sports center with a smarter operations hub
              </h2>
              <p className="text-muted-foreground text-xl">
                One place for bookings, pricing, staff, and analytics—built for busy facility
                owners.
              </p>
              <div>
                <a
                  href="/auth/register"
                  data-slot="button"
                  className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 group rounded-lg text-base has-[&gt;svg]:px-6"
                >
                  Register your center
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-arrow-right transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className="space-y-3.5">
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-check text-primary mt-1 size-6 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <p className="text-muted-foreground text-lg">
                  <span className="text-foreground font-medium">Built for busy front desks,</span>{" "}
                  making check-ins, bookings, and schedule changes fast and easy.
                </p>
              </div>
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-check text-primary mt-1 size-6 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <p className="text-muted-foreground text-lg">
                  Offer a smooth customer experience with
                  <span className="text-foreground font-medium"> automated reminders</span> and
                  instant confirmations.
                </p>
              </div>
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-check text-primary mt-1 size-6 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <p className="text-muted-foreground text-lg">
                  Get clear visibility with
                  <span className="text-foreground font-medium"> real-time analytics</span> for
                  revenue, utilization, and demand.
                </p>
              </div>
            </div>
          </div>
          <div className="py-10 animate-fade-up">
            <div className="relative flex justify-center max-lg:overflow-hidden max-lg:py-16">
              <div className="absolute top-[10%] left-0 z-10 w-60 origin-top-left scale-70 max-sm:hidden lg:-left-4 float-y">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="flex flex-col gap-3 px-6 py-5">
                    <div className="flex flex-col items-start justify-between">
                      <span className="font-medium">Ratings</span>
                      <Badge variant={"outline"}>Last 6 months</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">8.14k</span>
                      <span className="text-sm text-emerald-600">+18.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-0 right-0 z-10 w-64 origin-top-right scale-60 max-lg:top-[15%] max-sm:hidden float-y float-y-slow">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="flex items-start justify-between px-6 py-5">
                    <div>
                      <div className="text-lg font-semibold">Total earning</div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-4xl font-semibold">87%</span>
                        <span className="flex items-center gap-1 text-sm text-emerald-600">
                          +38%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-5">
                    <div className="h-24 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                            $
                          </span>
                          <div>
                            <div className="font-medium">Total revenue</div>
                            <div className="text-xs text-muted-foreground">Successful payments</div>
                          </div>
                        </div>
                        <span>+$250</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                            🛒
                          </span>
                          <div>
                            <div className="font-medium">Total sales</div>
                            <div className="text-xs text-muted-foreground">Refund</div>
                          </div>
                        </div>
                        <span>+$80</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-[10%] bottom-0 z-10 w-72 origin-bottom-right scale-75 max-lg:bottom-[15%] float-y float-y-fast">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        $
                      </span>
                      <span>Total Revenue</span>
                    </div>
                    <span className="text-xs text-muted-foreground">30 Days</span>
                  </div>
                  <div className="px-6 pb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">$12,400</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        15%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-full border-2 border-primary bg-muted px-6 py-10">
                <img
                  src="/images/man-sit.png"
                  alt="features"
                  className="mx-auto h-80 object-contain lg:h-100"
                />
                <div className="absolute inset-0 -z-10">
                  <div className="absolute left-1/2 top-1/2 size-[55%] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-primary" />
                  <div className="absolute left-1/2 top-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-primary/60" />
                  <div className="absolute left-1/2 top-1/2 size-[65%] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-primary/40" />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-16 items-center justify-center gap-10 lg:flex">
                <span className="beam-line h-px w-40" />
                <span className="beam-line h-px w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
