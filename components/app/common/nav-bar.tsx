import { NavigationMenu } from "./nav-menu";

export default function NavBar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex h-12 w-full max-w-12 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xl">
        AG
      </div>
      <h1 className="text-2xl font-bold hidden md:block">ARENAGO</h1>
      <NavigationMenu />
    </header>
  );
}
