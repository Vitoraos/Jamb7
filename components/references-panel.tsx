"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, BookOpen, Database, Percent } from "lucide-react"
import type { ContextChunk } from "@/app/page"

interface ReferencesPanelProps {
  contextChunks: ContextChunk[]
}

export function ReferencesPanel({ contextChunks }: ReferencesPanelProps) {
  return (
    <div className="console-panel h-full flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Referenced Questions
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Database className="w-3 h-3" />
          <span>{contextChunks.length}</span>
        </div>
      </div>

      {/* References List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] lg:min-h-0 lg:max-h-[calc(100vh-280px)]">
        {contextChunks.length === 0 ? (
          <EmptyReferences />
        ) : (
          contextChunks.map((chunk, index) => (
            <ReferenceItem key={`${chunk.question_id}-${index}`} chunk={chunk} index={index} />
          ))
        )}
      </div>
    </div>
  )
}

function EmptyReferences() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center mb-3">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground max-w-[200px]">
        Related past questions will appear here after your query
      </p>
    </div>
  )
}

function ReferenceItem({ chunk, index }: { chunk: ContextChunk; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const similarityPercent = Math.round(chunk.similarity * 100)
  
  // Color based on similarity score
  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    if (score >= 0.6) return "text-primary bg-primary/10 border-primary/30"
    return "text-amber-400 bg-amber-500/10 border-amber-500/30"
  }

  return (
    <div className="bg-secondary/30 rounded-lg border border-border overflow-hidden transition-all">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            #{String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm text-foreground truncate">
            {chunk.subject}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border ${getSimilarityColor(chunk.similarity)}`}>
            <Percent className="w-3 h-3" />
            <span>{similarityPercent}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/50">
          <div className="pt-3 space-y-2">
            {/* Question ID */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground font-mono">ID:</span>
              <span className="text-foreground font-mono">{chunk.question_id}</span>
            </div>
            
            {/* Question Text */}
            <div className="bg-background/50 rounded-md p-3 border border-border/50">
              <p className="text-sm text-foreground leading-relaxed">
                {chunk.chunk_text}
              </p>
            </div>
            
            {/* Similarity Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Match:</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    chunk.similarity >= 0.8 ? "bg-emerald-500" :
                    chunk.similarity >= 0.6 ? "bg-primary" : "bg-amber-500"
                  }`}
                  style={{ width: `${similarityPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {similarityPercent}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
