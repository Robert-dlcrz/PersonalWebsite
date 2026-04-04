import Link from 'next/link';

interface NavigationCardProps {
  href: string;
  gradientClasses: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  accentColor?: string;
}

export function NavigationCard({
  href,
  gradientClasses,
  icon,
  title,
  description,
  ctaText,
}: NavigationCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className={`relative aspect-[3/2] w-full bg-gradient-to-br ${gradientClasses} flex items-center justify-center overflow-hidden`}
      >
        <div className="transition-transform duration-500 group-hover:scale-110">
          {icon}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300" />
      </div>
      <div className="pt-4 pb-2">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-foreground/60 mt-1 leading-relaxed">
          {description}
        </p>
        <span className="inline-block text-sm font-medium text-foreground/80 mt-2 group-hover:underline transition-all">
          {ctaText} &rarr;
        </span>
      </div>
    </Link>
  );
}
