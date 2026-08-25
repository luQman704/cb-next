export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-white font-semibold">Cool<span className="text-blue-400">Boost</span> Systems</span>
            <p className="text-zinc-500 text-xs mt-1">Water-Methanol Injection Specialists</p>
          </div>
          <div className="text-zinc-500 text-xs text-center sm:text-right">
            <p>All prices in South African Rand (ZAR)</p>
            <p className="mt-1">© {new Date().getFullYear()} Cool Boost Systems. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
