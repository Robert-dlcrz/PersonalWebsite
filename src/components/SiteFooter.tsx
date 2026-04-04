import { HOME_CONTENT, PERSONAL_INFO } from '@/constants/content';

type SiteFooterProps = {
  text?: string;
};

export function SiteFooter({ text = HOME_CONTENT.footer.text }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-foreground/10 py-8">
      <div className="mx-auto w-full max-w-7xl px-6 text-center text-sm text-foreground/40 md:px-10 lg:px-12">
        <p>
          &copy; {new Date().getFullYear()} {PERSONAL_INFO.name}. {text}
        </p>
      </div>
    </footer>
  );
}
