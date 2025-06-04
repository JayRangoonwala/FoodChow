import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountryCodeSelect({
  value,
  onChange,
  countryCodes,
  className,
}: {
  value?: string;
  onChange: (code: string) => void;
  countryCodes: any;
  className: string;
  countryCode?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = countryCodes.find((item: any) => item.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn(className,
            "justify-center border-2 font-semibold text-xs px-1.5 py-1 h-7 w-full text-center rounded-lg",
            !value && "text-muted-foreground",
            value && "border-primary/60 bg-primary/5"
          )}
        >
          <span className="truncate">{value ? `+${value}` : "Code"}</span>
          <ChevronsUpDown className="opacity-50 w-3 h-3 ml-1 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-44 shadow-lg border-2">
        <Command>
          <CommandInput
            placeholder="Search country..."
            value={search}
            onValueChange={setSearch}
            className="h-7 border-b text-xs"
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryCodes
                .filter(
                  (item: any) =>
                    item.country.toLowerCase().includes(search.toLowerCase()) ||
                    item.code.toString().includes(search)
                )
                .map((item: any) => (
                  <CommandItem
                    key={`${item.code}-${item.country}`}
                    value={item.code + item.country}
                    onSelect={() => {
                      onChange(item.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="hover:bg-primary/10 cursor-pointer py-1 text-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-xs">+{item.code}</span>
                      <span className="text-xs text-gray-600 truncate ml-2">
                        {item.country}
                      </span>
                      {value === item.code && (
                        <Check className="w-3 h-3 text-primary ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
