'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface APIKeyFormProps {
  hasClaudeKey: boolean
  hasOpenRouterKey: boolean
}

export default function APIKeyForm({ hasClaudeKey, hasOpenRouterKey }: APIKeyFormProps) {
  const [provider, setProvider] = useState<'claude' | 'openrouter'>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, provider }),
      })

      if (res.ok) {
        toast.success('API key saved successfully!', {
          description: 'You can now use the chat feature',
        })
        setApiKey('')
        window.location.reload()
      } else {
        toast.error('Failed to save API key', {
          description: 'Please try again',
        })
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentHasKey = provider === 'claude' ? hasClaudeKey : hasOpenRouterKey

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose AI Provider
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setProvider('openrouter')}
            className={`p-4 border-2 rounded-xl transition ${
              provider === 'openrouter'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">OR</span>
              </div>
              <span className="font-semibold text-gray-900">OpenRouter</span>
              {hasOpenRouterKey && (
                <span className="ml-auto text-green-600 text-xs">✓ Configured</span>
              )}
            </div>
            <p className="text-xs text-gray-600 text-left">
              Access multiple models (Claude, GPT-4, Llama) with one key
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProvider('claude')}
            className={`p-4 border-2 rounded-xl transition ${
              provider === 'claude'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-semibold text-gray-900">Claude Direct</span>
              {hasClaudeKey && (
                <span className="ml-auto text-green-600 text-xs">✓ Configured</span>
              )}
            </div>
            <p className="text-xs text-gray-600 text-left">
              Direct access to Anthropic's Claude API
            </p>
          </button>
        </div>
      </div>

      {/* API Key Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {provider === 'openrouter' ? 'OpenRouter API Key' : 'Claude API Key'}
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder={
                currentHasKey
                  ? '••••••••••••••••••••••••'
                  : provider === 'openrouter'
                  ? 'sk-or-v1-...'
                  : 'sk-ant-api...'
              }
              required={!currentHasKey}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || (!apiKey && !currentHasKey)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Saving...' : currentHasKey ? 'Update' : 'Save'}
          </button>
        </div>
        {currentHasKey && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {provider === 'openrouter' ? 'OpenRouter' : 'Claude'} API key configured
          </p>
        )}
      </div>
    </form>
  )
}