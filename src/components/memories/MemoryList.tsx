'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import DeleteMemoryModal from './DeleteMemoryModal'

type Memory = {
  id: string
  content: string
  memory_type: string
  tags: string[]
  is_global: boolean
  created_at: string
  updated_at: string
}

export default function MemoryList({ initialMemories }: { initialMemories: Memory[] }) {
  const [memories, setMemories] = useState(initialMemories)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filteredMemories = memories.filter((memory) => {
    const matchesFilter = filter === 'all' || memory.memory_type === filter
    const matchesSearch = memory.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const openDeleteModal = (id: string) => {
    setMemoryToDelete(id)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setMemoryToDelete(null)
  }

  const handleDelete = async () => {
    if (!memoryToDelete) return

    setDeleteLoading(true)

    try {
      const res = await fetch(`/api/memories/${memoryToDelete}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMemories(memories.filter((m) => m.id !== memoryToDelete))
        toast.success('Memory deleted successfully', {
          description: 'The memory has been permanently removed from your vault',
        })
        closeDeleteModal()
      } else {
        toast.error('Failed to delete memory', {
          description: 'Please try again later',
        })
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Something went wrong', {
        description: 'Unable to delete memory at this time',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      instruction: 'bg-blue-100 text-blue-700 border-blue-200',
      preference: 'bg-purple-100 text-purple-700 border-purple-200',
      technical: 'bg-green-100 text-green-700 border-green-200',
      prd: 'bg-pink-100 text-pink-700 border-pink-200',
      decision: 'bg-orange-100 text-orange-700 border-orange-200',
      note: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      instruction: '📋',
      preference: '⚙️',
      technical: '💻',
      prd: '📄',
      decision: '🎯',
      note: '📝',
    }
    return emojis[type] || '📝'
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('instruction')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'instruction'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Instructions
              </button>
              <button
                onClick={() => setFilter('preference')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'preference'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⚙️ Preferences
              </button>
              <button
                onClick={() => setFilter('technical')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'technical'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💻 Technical
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {filteredMemories.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredMemories.length}</span>{' '}
            {filteredMemories.length === 1 ? 'memory' : 'memories'}
          </div>
        )}

        {/* Memory Cards */}
        {filteredMemories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No memories found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Start adding memories to build your AI knowledge base'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">{getTypeEmoji(memory.memory_type)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                        memory.memory_type
                      )}`}
                    >
                      {memory.memory_type}
                    </span>
                    {memory.is_global && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                        🌍 Global
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openDeleteModal(memory.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>

                <p className="text-gray-900 leading-relaxed mb-4 whitespace-pre-wrap">
                  {memory.content}
                </p>

                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {memory.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Created {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteMemoryModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </>
  )
}