import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STATUSES = ["APPROVED", "DECLINED", "CANCELLED", "PENDING"];

interface FilterItem {
  id: string;
  name: string;
}

interface FilterPanelProps {
  categories: FilterItem[];
  subCategories: FilterItem[];
  onApply: (filters: any) => void;
  onReset: () => void;
}

export function FilterPanel({ categories, subCategories, onApply, onReset }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    statuses: [] as string[],
    categories: [] as string[],
    subCategories: [] as string[],
  });

  const hasActiveFilters =
    selectedFilters.statuses.length > 0 ||
    selectedFilters.categories.length > 0 ||
    selectedFilters.subCategories.length > 0;

  const fuseCategories = useMemo(() => new Fuse(categories, { keys: ["name"] }), [categories]);
  const fuseSubCategories = useMemo(() => new Fuse(subCategories, { keys: ["name"] }), [subCategories]);

  const filteredCategories = search ? fuseCategories.search(search).map(r => r.item) : categories;
  const filteredSubCategories = search ? fuseSubCategories.search(search).map(r => r.item) : subCategories;

  const toggleFilter = (type: 'statuses' | 'categories' | 'subCategories', id: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(i => i !== id)
        : [...prev[type], id]
    }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          className={`gap-2 ${hasActiveFilters ? "bg-indigo-600 text-white hover:bg-indigo-700" : ""}`}
        >
          Filters {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 flex flex-col gap-4" align="end">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 focus-visible:ring-indigo-600/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Status</Label>
            {STATUSES.map(s => (
              <div key={s} className="flex items-center space-x-2">
                <Checkbox
                  id={s}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 focus-visible:ring-indigo-600"
                  checked={selectedFilters.statuses.includes(s)}
                  onCheckedChange={() => toggleFilter('statuses', s)}
                />
                <label htmlFor={s} className="text-sm font-medium leading-none cursor-pointer">{s}</label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Category</Label>
            {filteredCategories.map(c => (
              <div key={c.id} className="flex items-center space-x-2">
                <Checkbox
                  id={c.id}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 focus-visible:ring-indigo-600"
                  checked={selectedFilters.categories.includes(c.id)}
                  onCheckedChange={() => toggleFilter('categories', c.id)}
                />
                <label htmlFor={c.id} className="text-sm font-medium leading-none cursor-pointer">{c.name}</label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Sub Category</Label>
            {filteredSubCategories.map(sc => (
              <div key={sc.id} className="flex items-center space-x-2">
                <Checkbox
                  id={sc.id}
                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 focus-visible:ring-indigo-600"
                  checked={selectedFilters.subCategories.includes(sc.id)}
                  onCheckedChange={() => toggleFilter('subCategories', sc.id)}
                />
                <label htmlFor={sc.id} className="text-sm font-medium leading-none cursor-pointer">{sc.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { onApply(selectedFilters); setOpen(false); }}>Apply</Button>
          <Button className="flex-1 text-indigo-700 hover:bg-indigo-50" variant="ghost" onClick={() => { setSelectedFilters({ statuses: [], categories: [], subCategories: [] }); onReset(); }}>Reset</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
