import { Card } from '@/components/ui/card'

interface GaugeWidgetProps {
  title: string
  value: number
  maxValue?: number
  unit?: string
  color?: string
}

export function GaugeWidget({
  title,
  value,
  maxValue = 100,
  unit = '%',
  color = '#90EE90',
}: GaugeWidgetProps) {
  const percentage = (value / maxValue) * 100
  const circumference = 2 * Math.PI * 45

  return (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground mb-4">{title}</p>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-40 h-40">
          {/* SVG Circular Gauge */}
          <svg width="160" height="160" viewBox="0 0 160 160" className="rotate-[-90deg]">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="rgb(71 85 105)"
              strokeWidth="8"
              opacity="0.3"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * percentage) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>

          {/* Center Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{unit}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {percentage < 50 ? 'Low' : percentage < 80 ? 'Optimal' : 'High'} Utilization
        </p>
      </div>
    </Card>
  )
}
