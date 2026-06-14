import { cn } from "@/lib/utils";
import type { GradeLevel } from "@/types";
import { gradeColor, gradeLabel } from "@/utils";

interface GradeBadgeProps {
  grade: GradeLevel | null;
  points?: number;
  className?: string;
  size?: "sm" | "md";
}

export function GradeBadge({ grade, points, className, size = "md" }: GradeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full font-semibold",
        gradeColor(grade),
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {gradeLabel(grade)}
      {points !== undefined && points > 0 && (
        <span className="opacity-75">{points}分</span>
      )}
    </span>
  );
}
