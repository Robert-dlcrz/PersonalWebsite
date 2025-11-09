import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface NavigationCardProps {
  href: string;
  gradientClasses: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  accentColor: string;
}

export function NavigationCard({
  href,
  gradientClasses,
  icon,
  title,
  description,
  ctaText,
  accentColor,
}: NavigationCardProps) {
  return (
    <Link href={href}>
      <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 border border-slate-200 dark:border-slate-700 cursor-pointer transform hover:scale-105 transition-all duration-300 h-full">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientClasses} rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300`}>
            {icon}
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {description}
          </p>
          <span className={`inline-flex items-center gap-2 ${accentColor} font-medium group-hover:gap-3 transition-all`}>
            {ctaText}
            <ArrowRightIcon className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

