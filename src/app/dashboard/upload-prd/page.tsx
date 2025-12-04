import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PRDUploadForm from '@/components/prd/PRDUploadForm'

export default async function UploadPRDPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
              <a href="/dashboard/memories" className="text-gray-600 hover:text-gray-900">
                Memories
              </a>
              <a href="/dashboard/projects" className="text-gray-600 hover:text-gray-900">
                Projects
              </a>
              <a href="/dashboard/upload-prd" className="text-blue-600 font-semibold">
                Upload PRD
              </a>
            </div>
          </div>
          <span className="text-gray-600">{user.email}</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload PRD 📄
            </h1>
            <p className="text-gray-600">
              Upload your Product Requirements Document and we'll automatically process and organize it
            </p>
          </div>

          <PRDUploadForm />
        </div>
      </main>
    </div>
  )
}