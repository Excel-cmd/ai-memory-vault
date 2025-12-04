export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg"></div>
          <span className="text-white font-bold text-xl">AI Memory Vault</span>
        </div>
        <nav className="flex gap-4">
          <a href="/login" className="px-4 py-2 text-white/80 hover:text-white transition">
            Sign In
          </a>
          <a href="/signup" className="px-4 py-2 bg-white text-blue-900 rounded-lg font-medium hover:bg-white/90 transition">
            Get Started
          </a>
        </nav>
      </header>

      <main className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
            Build Software with AI Memory
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
            Your intelligent development companion that remembers everything
          </p>

          <div className="flex gap-4 justify-center mt-12">
            <a href="/signup" className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-white/90 transition shadow-2xl">
              Start Building Free →
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}