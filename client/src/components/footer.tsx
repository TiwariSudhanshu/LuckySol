"use client"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-zinc-400 md:flex-row">
        <span>© {new Date().getFullYear()} LuckySol</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
