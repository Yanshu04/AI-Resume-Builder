import React from 'react'

interface SkeletonLoaderProps {
  lines?: number
  className?: string
}

export default function SkeletonLoader({ lines = 3, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`w-full space-y-4 animate-pulse ${className}`}>
      {/* Title block skeleton */}
      <div className="h-4 bg-border rounded w-1/3"></div>
      
      {/* Paragraph blocks skeleton */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div 
            key={idx} 
            className="h-2.5 bg-border/60 rounded"
            style={{ width: idx === lines - 1 ? '60%' : '100%' }}
          ></div>
        ))}
      </div>
    </div>
  )
}

// Renders a complete pulsing resume page frame for preview loads
export function ResumePageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto bg-card/40 border border-border/80 rounded-xl p-8 space-y-8 animate-pulse">
      {/* Header Info */}
      <div className="text-center space-y-3 pb-6 border-b border-border/60">
        <div className="h-6 bg-border rounded w-2/5 mx-auto"></div>
        <div className="h-3 bg-border/60 rounded w-3/5 mx-auto"></div>
      </div>
      
      {/* Summary Section */}
      <div className="space-y-2">
        <div className="h-3.5 bg-border rounded w-1/6"></div>
        <div className="h-2.5 bg-border/60 rounded w-full"></div>
        <div className="h-2.5 bg-border/60 rounded w-11/12"></div>
      </div>
      
      {/* Experience Section */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div className="h-3.5 bg-border rounded w-1/5"></div>
        
        {/* Experience item 1 */}
        <div className="space-y-2.5">
          <div className="flex justify-between">
            <div className="h-3 bg-border rounded w-1/4"></div>
            <div className="h-3 bg-border/60 rounded w-1/8"></div>
          </div>
          <div className="h-2.5 bg-border/40 rounded w-full"></div>
          <div className="h-2.5 bg-border/40 rounded w-11/12"></div>
        </div>

        {/* Experience item 2 */}
        <div className="space-y-2.5 pt-2">
          <div className="flex justify-between">
            <div className="h-3 bg-border rounded w-1/3"></div>
            <div className="h-3 bg-border/60 rounded w-1/10"></div>
          </div>
          <div className="h-2.5 bg-border/40 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}
