export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Anchor. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span>Next.js 16</span>
          <span>•</span>
          <span>Clerk</span>
          <span>•</span>
          <span>Supabase</span>
          <span>•</span>
          <span>Tailwind</span>
          <span>•</span>
          <span>MUI</span>
        </div>
      </div>
    </footer>
  );
}
