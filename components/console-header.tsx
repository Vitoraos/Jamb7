"use client"

import { Activity, Cpu, Zap } from "lucide-react"

export function ConsoleHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center console-glow">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              JAMB Tutor
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              AI Learning System v2.0
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-6">
          <StatusIndicator icon={Activity} label="NEURAL" status="active" />
          <StatusIndicator icon={Zap} label="SEMANTIC" status="ready" />
        </div>

        {/* System Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-md bg-secondary text-xs font-mono text-muted-foreground border border-border">
            CMD // READY
          </span>
        </div>
      </div>
    </header>
  )
}

function StatusIndicator({ 
  icon: Icon, 
  label, 
  status 
}: { 
  icon: React.ElementType
  label: string
  status: "active" | "ready" | "idle"
}) {
  const statusColors = {
    active: "bg-primary text-primary",
    ready: "bg-emerald-500 text-emerald-500",
    idle: "bg-muted-foreground text-muted-foreground",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status].split(" ")[0]} animate-pulse`} />
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
