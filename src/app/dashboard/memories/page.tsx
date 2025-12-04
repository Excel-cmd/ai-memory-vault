import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemoryList from '@/components/memories/MemoryList'
import AddMemoryButton from '@/components/memories/AddMemoryButton'
import DashboardNav from '../../../components/dashboard/DashboardNav'

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
      <DashboardNav userEmail={user.email || ''} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Memory Vault 🧠</h1>
            <p className="text-gray-600 mt-1">
              {memories?.length || 0} {memories?.length === 1 ? 'memory' : 'memories'} stored
            </p>
          </div>
          <AddMemoryButton />
        </div>

        <MemoryList initialMemories={memories || []} />
      </main>
    </div>
  )
}