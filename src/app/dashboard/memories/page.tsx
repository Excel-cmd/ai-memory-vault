import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemoryList from '@/components/memories/MemoryList'
import AddMemoryButton from '@/components/memories/AddMemoryButton'

export default async function MemoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch memories
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-2xl font-bold text-gray-900">
              AI Memory Vault
            </a>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/dashboard/memories" className="text-blue-600 font-semibold">
                Memories
              </a>
              <a href="/dashboard/projects" className="text-gray-600 hover:text-gray-900">
                Projects
              </a>
            </div>
          </div>
          <span className="text-gray-600">{user.email}</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Memory Vault 🧠</h1>
            <p className="text-gray-600 mt-1">
              {memories?.length || 0} memories stored
            </p>
          </div>
          <AddMemoryButton />
        </div>

        <MemoryList initialMemories={memories || []} />
      </main>
    </div>
  )
}