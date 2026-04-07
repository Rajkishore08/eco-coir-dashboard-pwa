import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { memo } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  backgroundColor?: string
  iconColor?: string
  status?: 'normal' | 'warning' | 'critical'
  colorScheme?: 'green' | 'cyan' | 'lime' | 'amber' | 'red'
  delay?: number
}

const colorSchemes = {
  green: {
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  cyan: {
    icon: 'bg-cyan-100 text-cyan-600',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  lime: {
    icon: 'bg-lime-100 text-lime-600',
    text: 'text-lime-600',
    border: 'border-lime-200',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
    border: 'border-red-200',
  },
}

function KPICardComponent({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  backgroundColor,
  colorScheme = 'green',
  delay = 0,
}: KPICardProps) {
  const scheme = colorSchemes[colorScheme]

  return (
    <Card 
      className={cn(
        'p-3 sm:p-4 md:p-5 lg:p-6 border-l-4 hover:shadow-lg transition-all duration-300 animate-fade-in-up',
        backgroundColor, 
        scheme.border
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 font-medium uppercase tracking-wide truncate">{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <h3 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', scheme.text)}>{value}</h3>
            {unit && <span className="text-xs sm:text-sm text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
        <div className={cn('p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0', scheme.icon)}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 sm:gap-2 pt-2 mt-2 border-t border-border">
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          ) : (
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
          )}
          <span className={cn('text-xs sm:text-sm font-medium', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
            {Math.abs(trend.value)}% last hour
          </span>
        </div>
      )}
    </Card>
  )
}

export const KPICard = memo(KPICardComponent)
