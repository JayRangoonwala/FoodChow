import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"; // Update path as needed
import SearchLogo from "@/components/Svgs/search";
import { Image } from "lucide-react";

export function MenuSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 overflow-y-scroll", className)}>
      {/* Sticky Search Bar */}
      <div className="container sticky top-0 z-10 flex items-center rounded-md bg-white border-2 border-primary">
        <Input
          className="w-full h-12 border-none focus-visible:ring-0 focus-visible:border-none"
          placeholder="Search for dishes"
          disabled
        />
        <SearchLogo className="h-6 w-6 fill-primary mr-3" />
      </div>

      {/* Skeleton Cards */}
      <div className="h-full space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border-0 gap-2">
            <CardHeader className="px-4 lg:px-6">
              <CardTitle className="font-medium flex flex-col gap-1 *:bg-gray-400">
                <Skeleton className="h-6 rounded-full w-2/5" />
                <Skeleton className="h-4 w-1/4" />
              </CardTitle>
            </CardHeader>
            <Separator className="bg-muted" />
            <CardContent className="px-0">
              {[...Array(2)].map((_, itemIndex) => (
                <div key={itemIndex}>
                  <div className="flex gap-2 m-4 lg:m-6 py-4">
                    <div className="h-full flex flex-1 flex-col mr-4 space-y-2 *:rounded-full">
                      <Skeleton className="h-5 w-3/5 lg:w-2/5 bg-gray-400" />
                      <Skeleton className="h-4 w-4/5 lg:w-3/5 bg-gray-400" />
                      <Skeleton className="h-5 w-2/5 lg:w-1/5 bg-accent" />
                    </div>
                    <Skeleton className="h-[130px] w-[130px] rounded-md flex items-center justify-center bg-gray-400">
                      <Image className="stroke-gray-500" />
                    </Skeleton>
                  </div>
                  {itemIndex !== 1 && <Separator className="bg-muted" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
