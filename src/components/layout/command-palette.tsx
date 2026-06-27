"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCreatorStore } from "@/lib/store/useCreatorStore";
import { LayoutDashboard, Megaphone, Calendar, Settings, Sun, Moon, Video, Presentation, Gamepad2, Folder, LayoutTemplate, Globe, Palette } from "lucide-react";

const contentTypeIcon: Record<string, React.ReactNode> = {
  video:        <Video className="w-4 h-4 text-violet-500" />,
  presentation: <Presentation className="w-4 h-4 text-sky-500" />,
  game:         <Gamepad2 className="w-4 h-4 text-emerald-500" />,
  layout:       <LayoutTemplate className="w-4 h-4 text-pink-500" />,
  site:         <Globe className="w-4 h-4 text-cyan-500" />,
  identity:     <Palette className="w-4 h-4 text-fuchsia-500" />,
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const cards = useCreatorStore((state) => state.cards);
  const campaigns = useCreatorStore((state) => state.campaigns).filter((c) => !c.archived);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar cards, campanhas ou ações..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
            <LayoutDashboard className="w-4 h-4 mr-2 text-muted-foreground" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/campaigns"))}>
            <Megaphone className="w-4 h-4 mr-2 text-muted-foreground" />
            Campanhas
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/calendar"))}>
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            Calendário
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/settings"))}>
            <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
            Configurações
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {campaigns.length > 0 && (
          <CommandGroup heading="Campanhas">
            {campaigns.map((camp) => (
              <CommandItem key={camp.id} onSelect={() => run(() => router.push(`/campaigns/${camp.id}`))}>
                <Folder className="w-4 h-4 mr-2" style={{ color: camp.color }} />
                {camp.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {cards.length > 0 && (
          <CommandGroup heading="Cards">
            {cards.slice(0, 8).map((card) => (
              <CommandItem
                key={card.id}
                onSelect={() => card.campaignId && run(() => router.push(`/campaigns/${card.campaignId}`))}
              >
                <span className="mr-2">{contentTypeIcon[card.contentType]}</span>
                {card.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}>
            {theme === "dark" ? (
              <Sun className="w-4 h-4 mr-2 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 mr-2 text-indigo-500" />
            )}
            Alternar Tema
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
