'use client'

import type { ContextChunk } from '@/lib/api'

interface ReferencesPanelProps {
  chunks: ContextChunk[]
}

export function ReferencesPanel({ chunks }: ReferencesPanelProps) {
  if (chunks.length === 0) {
    return (
      <div className="px-3 py-4 text-center">
        <p className="text-[10px] font-mono text-[#444]">No references yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#111]">
      {chunks.slice(0, 10).map((chunk, index) => (
        <div key={index} className="px-3 py-3 hover:bg-[#111] transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-mono text-[#555] uppercase tracking-wider">
              {chunk.subject}
            </span>
            <span className="text-[9px] font-mono text-[#333]">
              #{chunk.question_id}
            </span>
            <span className="ml-auto text-[9px] font-mono text-[#333]">
              {(chunk.similarity * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[11px] text-[#666] leading-relaxed line-clamp-2">
            {chunk.chunk_text}
          </p>
        </div>
      ))}
    </div>
  )
}
