import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
}

export function KPICard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  backgroundColor,
  iconColor,
  status = 'normal',
  colorScheme = 'green',
}: KPICardProps) {
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

  const statusColors = {
    normal: 'bg-primary/10 text-primary',
    warning: 'bg-yellow-500/10 text-yellow-500',
    critical: 'bg-red-500/10 text-red-500',
  }

  const scheme = colorSchemes[colorScheme]

  return (
    <Card className={cn('p-6 border-l-4 hover:shadow-lg transition-shadow', backgroundColor, scheme.border)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn('text-4xl font-bold', scheme.text)}>{value}</h3>
            {unit && <span className="text-sm text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
        <div className={cn('p-3 rounded-xl', scheme.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={cn('text-sm font-medium', trend.isPositive ? 'text-green-600' : 'text-red-600')}>
            {Math.abs(trend.value)}% from last hour
          </span>
        </div>
      )}
    </Card>
  )
}
