"use client";

import { Check, Languages } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Lang = {
  code: "en" | "fi" | "sv" | "vi";
  label: string;
  nativeLabel: string;
};

const LANGS: Lang[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fi", label: "Finnish", nativeLabel: "Suomi" },
  { code: "sv", label: "Swedish", nativeLabel: "Svenska" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt" },
];

const STORAGE_KEY = "app_lang";

function setHtmlLang(code: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = code;
}

export function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState<Lang["code"]>("en");

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang["code"] | null;
    if (saved && LANGS.some((l) => l.code === saved)) {
      setLang(saved);
      setHtmlLang(saved);
    } else {
      setHtmlLang("en");
    }
  }, []);

  function onSelect(code: Lang["code"]) {
    setLang(code);
    window.localStorage.setItem(STORAGE_KEY, code);
    setHtmlLang(code);

    // TODO: hook into your i18n system here:
    // i18n.setLanguage(code)

    setOpen(false);
  }

  const current = LANGS.find((l) => l.code === lang);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change language"
          className="relative rounded-full"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-[260px] p-2">
        <div className="px-2 pb-2">
          <div className="text-sm font-medium">Language</div>
          <div className="text-xs text-muted-foreground">
            Current: {current?.nativeLabel ?? "English"}
          </div>
        </div>

        <Command>
          {/* <CommandInput placeholder="Search language..." /> */}
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGS.map((l) => (
                <CommandItem
                  key={l.code}
                  value={`${l.label} ${l.nativeLabel}`}
                  onSelect={() => onSelect(l.code)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{l.nativeLabel}</span>
                    <span className="text-xs text-muted-foreground">({l.label})</span>
                  </div>

                  {lang === l.code ? <Check className="h-4 w-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
