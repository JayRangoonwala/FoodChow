import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CategorySkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn(className, "border-0")}>
      <CardHeader>
        <CardTitle className="text-primary font-medium">CATEGORIES</CardTitle>
      </CardHeader>
      <Separator className="bg-muted" />
      <CardContent className="overflow-scroll px-6 h-full">
        <ul className="space-y-2 pt-4">
          {[...Array(6)].map((_, idx) => (
            <li key={idx}>
              <Skeleton className="h-6 w-full rounded-sm bg-gray-400" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
