import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonLoading({
  type,
  text,
  loading,
  className,
  onClick,
  ...props
}) {
  return (
    <Button
      type={type}
      onClick={onClick}
      className={cn("", className)}
      disabled={loading}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin" />}
      {text}
    </Button>
  );
}
