import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { memo } from 'react'

interface GaugeWidgetProps {
  title: string
  value: number
  maxValue?: number
  unit?: string
  color?: string
  colorScheme?: 'green' | 'cyan' | 'lime' | 'amber'
  delay?: number
}

function GaugeWidgetComponent({
  title,
  value,
  maxValue = 100,
  unit = '%',
  color,
  colorScheme = 'green',
  delay = 0,
}: GaugeWidgetProps) {
  const percentage = (value / maxValue) * 100
  const circumference = 2 * Math.PI * 45

  const colorSchemes = {
    green: { stroke: '#22C55E', bg: 'bg-green-50', text: 'text-green-600' },
    cyan: { stroke: '#06B6D4', bg: 'bg-cyan-50', text: 'text-cyan-600' },
    lime: { stroke: '#84CC16', bg: 'bg-lime-50', text: 'text-lime-600' },
    amber: { stroke: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-600' },
  }

  const scheme = colorSchemes[colorScheme]
  const strokeColor = color || scheme.stroke

  const status = percentage < 50 ? 'Low' : percentage < 80 ? 'Optimal' : 'High'
  const statusColor = percentage < 50 ? '#EF4444' : percentage < 80 ? '#22C55E' : '#F59E0B'

  return (
    <Card 
      className={cn(
        'p-3 sm:p-4 md:p-5 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up',
        scheme.bg,
        'border-l-4',
        scheme.text.replace('text-', 'border-')
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <p className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 uppercase tracking-wide">{title}</p>
      
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="relative w-32 sm:w-40 md:w-44 h-32 sm:h-40 md:h-44">
          {/* SVG Circular Gauge */}
          <svg width="100%" height="100%" viewBox="0 0 176 176" className="rotate-[-90deg] drop-shadow-sm animate-fade-in-up">
            {/* Background Circle */}
            <circle
              cx="88"
              cy="88"
              r="52"
              fill="none"
              stroke="rgb(229 231 235)"
              strokeWidth="10"
              opacity="1"
            />
            {/* Progress Circle */}
            <circle
              cx="88"
              cy="88"
              r="52"
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * percentage) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              filter="drop-shadow(0 2px 4px rgba(34, 197, 94, 0.1))"
            />
          </svg>

          {/* Center Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', scheme.text)}>{Math.round(value)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">{unit}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mt-2 sm:mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-border">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <p className="text-xs font-semibold text-foreground">
            {status} Utilization
          </p>
        </div>
      </div>
    </Card>
  )
}

export const GaugeWidget = memo(GaugeWidgetComponent)
