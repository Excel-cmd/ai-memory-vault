import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'
import APIKeyForm from '@/components/settings/APIKeyForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('claude_api_key, openrouter_api_key')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userEmail={user.email || ''} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings ⚙️</h1>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <p className="text-gray-600 mb-6">
              Choose your AI provider and add your API key to enable chat functionality. Your keys are stored securely and never shared.
            </p>
            <APIKeyForm
              hasClaudeKey={!!userData?.claude_api_key}
              hasOpenRouterKey={!!userData?.openrouter_api_key}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OpenRouter Guide */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🔑</span>
                Get OpenRouter API Key
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-purple-800 text-sm">
                <li>
                  Go to{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-purple-900"
                  >
                    openrouter.ai/keys
                  </a>
                </li>
                <li>Sign up with Google/GitHub</li>
                <li>Click "Create Key"</li>
                <li>Add credits ($5 minimum)</li>
                <li>Copy and save your key</li>
              </ol>
              <p className="text-xs text-purple-700 mt-4">
                💡 Access Claude, GPT-4, Llama 3, and more!
              </p>
            </div>

            {/* Claude Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🔑</span>
                Get Claude API Key
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    console.anthropic.com
                  </a>
                </li>
                <li>Sign up or log in</li>
                <li>Navigate to "API Keys"</li>
                <li>Click "Create Key"</li>
                <li>Copy and save your key</li>
              </ol>
              <p className="text-xs text-blue-700 mt-4">
                💡 Anthropic offers $5 free credits
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}