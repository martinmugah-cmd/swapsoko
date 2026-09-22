import { Loader2Icon } from "@/lib/icons";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: any) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
