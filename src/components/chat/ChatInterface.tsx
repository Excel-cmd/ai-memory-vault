'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
  role: 'user' | 'assistant'
  content: string
  context?: {
    memories_used: number
    prd_sections_used: number
  }
}

interface Project {
  id: string
  name: string
}

export default function ChatInterface({ projects }: { projects: Project[] }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          projectId: selectedProject || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          context: data.context,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        toast.error('Chat failed', {
          description: data.error || 'Please try again',
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Something went wrong', {
        description: 'Unable to send message',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💬</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Chat</h2>
            <p className="text-xs text-gray-500">
              Powered by Claude with your memories
            </p>
          </div>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No project context</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                📁 {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 mb-6">
                Ask me anything! I have access to your memories and PRD sections.
              </p>
              <div className="grid grid-cols-1 gap-2 text-left">
                <button
                  onClick={() => setInput('What memories do I have stored?')}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition text-left"
                >
                  💭 What memories do I have stored?
                </button>
                <button
                  onClick={() => setInput('Help me understand my PRD')}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition text-left"
                >
                  📄 Help me understand my PRD
                </button>
                <button
                  onClick={() => setInput('Generate a project plan')}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition text-left"
                >
                  🎯 Generate a project plan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span className="text-sm">
                    {message.role === 'assistant' ? '🤖' : '👤'}
                  </span>
                </div>

                <div
                  className={`flex-1 ${
                    message.role === 'assistant' ? 'mr-12' : 'ml-12'
                  }`}
                >
                  <div
                    className={`rounded-2xl p-4 ${
                      message.role === 'assistant'
                        ? 'bg-gray-50'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              const isInline = !(className && match)
                              
                              if (!isInline && match) {
                                return (
                                  <div className="relative group">
                                    <button
                                      onClick={() =>
                                        copyToClipboard(String(children).replace(/\n$/, ''))
                                      }
                                      className="absolute right-2 top-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition"
                                    >
                                      Copy
                                    </button>
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                )
                              } else {
                                return (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>

                  {message.context && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      {message.context.memories_used > 0 && (
                        <span className="flex items-center gap-1">
                          <span>🧠</span>
                          {message.context.memories_used} memories
                        </span>
                      )}
                      {message.context.prd_sections_used > 0 && (
                        <span className="flex items-center gap-1">
                          <span>📄</span>
                          {message.context.prd_sections_used} PRD sections
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1 mr-12">
                  <div className="rounded-2xl p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}