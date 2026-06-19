import viazovaLogo from "@/assets/viazova-logo.png";

type ViazovaLogoProps = {
  className?: string;
  variant?: "header" | "footer";
};

export function ViazovaLogo({
  className,
  variant = "header",
}: ViazovaLogoProps) {
  const sizeClass =
    className ?? (variant === "header" ? "h-16 w-auto sm:h-20 md:h-24" : "h-14 w-auto");

  const containerClass =
    "inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5";

  return (
    <span className={containerClass}>
      <img
        src={viazovaLogo}
        alt="Viazova — The Complete Travel Solution"
        className={`${sizeClass} object-contain`}
      />
    </span>
  );
}
