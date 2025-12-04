import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch stats
  const { data: memories } = await supabase
    .from('memories')
    .select('id')
    .eq('user_id', user.id)

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Memory Vault
            </h1>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-blue-600 font-semibold">
                Dashboard
              </a>
              <a href="/dashboard/memories" className="text-gray-600 hover:text-gray-900">
                Memories
              </a>
              <a href="/dashboard/projects" className="text-gray-600 hover:text-gray-900">
                Projects
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome back, {user.user_metadata?.full_name || 'User'}! 🚀
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a href="/dashboard/projects" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Projects</h3>
              <span className="text-3xl">📁</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{projects?.length || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Active projects</p>
          </a>
          
          <a href="/dashboard/memories" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Memories</h3>
              <span className="text-3xl">🧠</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{memories?.length || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Stored memories</p>
          </a>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Conversations</h3>
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{conversations?.length || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Chat sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/dashboard/memories" className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition">
                + Add New Memory
              </a>
              <a href="/dashboard/projects" className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition">
                + Create New Project
              </a>
              <a href="/dashboard/chat" className="block px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition">
                💬 Start Chat Session
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-sm text-white">
            <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
            <p className="text-white/90 mb-4">
              Build your AI knowledge base by adding memories, uploading PRDs, and chatting with your intelligent assistant.
            </p>
            <a href="/dashboard/memories" className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-white/90 transition">
              Add Your First Memory →
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}