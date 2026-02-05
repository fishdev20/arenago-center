import { Rating } from "@/components/rating";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUp,
  ArrowUpRight,
  Globe,
  Headset,
  Rocket,
  Store,
  TicketCheck,
  TrendingUp,
  Volleyball,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="mx-auto flex h-full max-w-7xl flex-col pt-4 pb-8 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-24"
    >
      <div className="relative grid grid-cols-1 gap-8 max-xl:justify-center sm:gap-12 lg:gap-16 xl:grid-cols-2">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs text-muted-foreground animate-fade-up animate-fade-up-delay-1">
              All-in-one platform for sports centers
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl animate-fade-up animate-fade-up-delay-2">
              Run your sports facility like a modern business
            </h1>
          </div>

          <p className="mt-4 max-w-xl text-base text-muted-foreground animate-fade-up animate-fade-up-delay-3">
            Manage bookings, pricing, staff, and analytics in one place. Keep courts full, reduce
            no-shows, and make faster decisions with live performance insights.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 animate-fade-up animate-fade-up-delay-3">
            <Button asChild size={"lg"} className="rounded-full">
              <Link href="/auth/register">
                Create your center <Rocket />
              </Link>
            </Button>
            <Button variant="outline" asChild size={"lg"} className="rounded-full">
              <Link href="/auth/login">
                Book a demo <Headset />
              </Link>
            </Button>
          </div>

          <div className="mt-6 mb-20 flex items-center gap-6">
            <div className="flex -space-x-4">
              <span
                data-slot="avatar"
                className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
              >
                <Image
                  data-slot="avatar-image"
                  className="aspect-square size-full"
                  alt="Olivia Sparks"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png"
                  width={48}
                  height={48}
                />
              </span>

              <span
                data-slot="avatar"
                className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
              >
                <Image
                  data-slot="avatar-image"
                  className="aspect-square size-full"
                  alt="Howard Lloyd"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
                  width={48}
                  height={48}
                />
              </span>

              <span
                data-slot="avatar"
                className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
              >
                <Image
                  data-slot="avatar-image"
                  className="aspect-square size-full"
                  alt="Hallie Richards"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png"
                  width={48}
                  height={48}
                />
              </span>
              <span
                data-slot="avatar"
                className="relative flex size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background"
              >
                <Image
                  data-slot="avatar-image"
                  className="aspect-square size-full"
                  alt="Hallie Richards"
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"
                  width={48}
                  height={48}
                />
              </span>
            </div>
            <div className="space-y-2">
              <p>Rated 4.5+ by center owners</p>
              <Rating rate={4.5} />
            </div>
          </div>

            <div className="flex flex-col gap-4">
            <div className="flex justify-center md:justify-start w-full">
              <p>Trusted by 300+ sports facilities</p>
            </div>
            <div className="marquee">
              <div className="marquee-track">
                {[
                  "City Courts",
                  "Northfield Arena",
                  "Skyline Sports",
                  "Metro Fit",
                  "Blue Ridge Center",
                  "Lakeside Fields",
                  "Prime Courts",
                  "Urban Sports Club",
                ]
                  .concat([
                    "City Courts",
                    "Northfield Arena",
                    "Skyline Sports",
                    "Metro Fit",
                    "Blue Ridge Center",
                    "Lakeside Fields",
                    "Prime Courts",
                    "Urban Sports Club",
                  ])
                  .map((name, idx) => (
                    <Badge
                      variant={"default"}
                      key={`${name}-${idx}`}
                      className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-muted-foreground"
                    >
                      <Volleyball size={32} className="h-10 w-10" />
                      {name}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className={`relative flex flex-col items-center justify-center`}>
          {/* Decorative frame */}
          <div className="mb-14 grid w-full grid-cols-1 gap-10 px-2 pt-2 max-xl:max-w-140 md:mb-7 md:grid-cols-2">
            {/* Card 1 */}
            <div className="relative p-2 border border-border rounded-2xl">
              <Card className="gap-2 py-4">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span
                      data-slot="avatar"
                      className="relative flex shrink-0 overflow-hidden size-9.5 rounded-md"
                    >
                      <span
                        data-slot="avatar-fallback"
                        className="flex items-center justify-center bg-primary/10 text-primary size-9.5 shrink-0 rounded-md [&>svg]:size-4.75"
                      >
                        <TicketCheck />
                      </span>
                    </span>
                    <p className="flex items-center gap-1">
                      +18%
                      <ArrowUp />
                    </p>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex flex-col gap-1">
                    <span className="text-lg font-semibold">$13.4k</span>
                    <span className="text-muted-foreground text-sm">Monthly revenue</span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant={"outline"} className="bg-muted">
                    Last 30 days
                  </Badge>
                </CardFooter>
              </Card>
              <BorderBeam />
            </div>

            {/* Card 2 (Customers) */}
            <div className="relative p-2 border border-border rounded-2xl">
              <Card className="relative h-full gap-2 py-4">
                <CardHeader>
                  <CardTitle className="space-y-2">
                    <p>Bookings</p>
                    <Badge variant={"outline"}>Daily check-ins</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-semibold">1.2k</span>
                  <span className="text-sm text-green-600 dark:text-green-400">+9.2%</span>
                </CardContent>
                <img
                  src="images/character_1.png"
                  alt="Booking preview"
                  className="mx-auto h-28 object-contain absolute right-0 bottom-0"
                />
              </Card>
              <BorderBeam />
            </div>
          </div>

          {/* Bottom card */}
          <div className="flex w-full items-center justify-center px-2">
            <div className="relative w-fit p-2 border border-border rounded-2xl">
              <Card className="border py-4 gap-4 sm:w-full sm:max-w-100">
                <div
                  data-slot="card-header"
                  className="@container/card-header auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 flex flex-col"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        data-slot="avatar"
                        className="relative flex shrink-0 overflow-hidden size-8 rounded-sm"
                      >
                        <span
                          data-slot="avatar-fallback"
                          className="flex size-full items-center justify-center bg-chart-2/10 text-chart-2 shrink-0 rounded-sm"
                        >
                          <TrendingUp />
                        </span>
                      </span>
                      <span>Total bookings</span>
                    </div>

                    <Button variant={"secondary"} size={"xs"}>
                      Details
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">2,150</span>
                    <Badge>+5%</Badge>
                  </div>
                </div>

                <CardContent className="px-6 space-y-4">
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 py-2">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Globe size={14} />
                        <span className="text-sm">Online bookings</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">1.2k</span>
                        <span>+12.6%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 py-2">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <Store size={14} />
                        <span className="text-sm">Walk-ins</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">950</span>
                        <span>-4.2%</span>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </CardContent>
              </Card>
              <BorderBeam />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
