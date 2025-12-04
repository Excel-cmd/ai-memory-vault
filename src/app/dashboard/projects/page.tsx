import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import DashboardNav from '../../../components/dashboard/DashboardNav'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userEmail={user.email || ''} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects 📁</h1>
            <p className="text-gray-600 mt-1">
              {projects?.length || 0} {projects?.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          
          {/* Fixed: Added missing <a> tag */}
          <a
            href="/dashboard/upload-prd"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload PRD
          </a>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📁</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {project.name}
                      </h3>
                    </div>
                    {project.description && (
                      <p className="text-gray-600 ml-13">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between ml-13">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </div>

                  {/* Fixed: Added missing <a> tag */}
                  <a
                    href={`/dashboard/projects/${project.id}`}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition text-sm opacity-0 group-hover:opacity-100"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Upload a PRD to create your first project and start building with AI assistance
            </p>
            
            {/* Fixed: Added missing <a> tag */}
            <a
              href="/dashboard/upload-prd"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Your First PRD
            </a>
          </div>
        )}
      </main>
    </div>
  )
}