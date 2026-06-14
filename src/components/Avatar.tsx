import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({ name, color, size = "md", className }: AvatarProps) {
  const text = name ? name.slice(0, 1) : "?";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {text}
    </div>
  );
}
