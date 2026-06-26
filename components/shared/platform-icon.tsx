import { cn } from "@/lib/utils/cn";

type Platform = "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin" | "pinterest" | "x" | "threads";

interface PlatformIconProps {
  platform: Platform;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const platformColors: Record<Platform, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
  youtube: "bg-[#FF0000]",
  tiktok: "bg-black dark:bg-white",
  linkedin: "bg-[#0A66C2]",
  pinterest: "bg-[#BD081C]",
  x: "bg-black dark:bg-white",
  threads: "bg-black dark:bg-white",
};

const platformSizes = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

export function PlatformIcon({
  platform,
  size = "md",
  className,
}: PlatformIconProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white text-[10px] font-bold",
        platformColors[platform],
        platformSizes[size],
        className
      )}
    >
      {platform[0].toUpperCase()}
    </div>
  );
}
