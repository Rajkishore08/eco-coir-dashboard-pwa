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
}: KPICardProps) {
  const statusColors = {
    normal: 'bg-primary/10 text-primary',
    warning: 'bg-yellow-500/10 text-yellow-500',
    critical: 'bg-red-500/10 text-red-500',
  }

  return (
    <Card className={cn('p-6', backgroundColor)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className={cn('p-3 rounded-lg', statusColors[status])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-primary" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={cn('text-sm font-medium', trend.isPositive ? 'text-primary' : 'text-destructive')}>
            {Math.abs(trend.value)}% from last hour
          </span>
        </div>
      )}
    </Card>
  )
}
