export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-divider/40 bg-bg-page py-6 text-center text-xs text-secondary-text mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; {currentYear} Postiz-cheap · MIT licensed.
        </div>
        <div>
          <a href="https://github.com/Anil-matcha/Postiz-cheap" className="hover:text-primary-text transition-colors">
            GitHub repository
          </a>
        </div>
      </div>
    </footer>
  );
}
