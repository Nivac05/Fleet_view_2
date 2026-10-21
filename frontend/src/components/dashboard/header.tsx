import { FleetLogo } from "@/components/fleet-logo";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 shrink-0 bg-card">
      <div className="flex items-center gap-3">
        <FleetLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          FleetView
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User Profile">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
