import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '../../components/dashboard/DashboardNav'


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

  // Check if user has API key
  const { data: userData } = await supabase
    .from('users')
    .select('claude_api_key')
    .eq('id', user.id)
    .single()

  const hasApiKey = !!userData?.claude_api_key

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userEmail={user.email || ''} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your AI Memory Vault
          </p>
        </div>

        {/* API Key Warning */}
        {!hasApiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start gap-4">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Configure your Claude API Key
              </h3>
              <p className="text-yellow-800 text-sm mb-3">
                Add your API key to unlock the AI chat feature and start having intelligent conversations with memory!
              </p>
              <a href="/dashboard/settings" className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition text-sm">
                Go to Settings →
              </a>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a href="/dashboard/projects" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Projects</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <span className="text-2xl">📁</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">{projects?.length || 0}</p>
            <p className="text-sm text-gray-500">Active projects</p>
          </a>

          <a href="/dashboard/memories" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Memories</h3>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <span className="text-2xl">🧠</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-purple-600 mb-2">{memories?.length || 0}</p>
            <p className="text-sm text-gray-500">Stored memories</p>
          </a>

          <a href="/dashboard/chat" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Conversations</h3>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <span className="text-2xl">💬</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-green-600 mb-2">{conversations?.length || 0}</p>
            <p className="text-sm text-gray-500">Chat messages</p>
          </a>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/dashboard/memories" className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition flex items-center gap-3">
                <span className="text-xl">🧠</span>
                Add New Memory
              </a>
              <a href="/dashboard/upload-prd" className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition flex items-center gap-3">
                <span className="text-xl">📄</span>
                Upload PRD
              </a>
              <a href="/dashboard/chat" className="block px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition flex items-center gap-3">
                <span className="text-xl">💬</span>
                Start Chat Session
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-sm text-white">
            <h2 className="text-xl font-semibold mb-3">🚀 Getting Started</h2>
            <p className="text-white/90 mb-4 leading-relaxed">
              Build your AI knowledge base by adding memories, uploading PRDs, and chatting with your intelligent assistant that never forgets!
            </p>
            <div className="space-y-2">
              <a href="/dashboard/memories" className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition backdrop-blur-sm">
                Step 1: Add Memories
              </a>
              <a href="/dashboard/upload-prd" className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition backdrop-blur-sm">
                Step 2: Upload PRD
              </a>
              <a href="/dashboard/chat" className="block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition backdrop-blur-sm">
                Step 3: Start Chatting
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}