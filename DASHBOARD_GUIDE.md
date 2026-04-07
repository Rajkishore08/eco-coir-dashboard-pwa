# EcoCoir Smart Factory Dashboard

A comprehensive Industry 4.0 IoT dashboard for monitoring and optimizing coir processing operations.

## 🌿 Project Overview

The EcoCoir Smart Factory Dashboard is a progressive web application (PWA) designed for factory operators, plant managers, and maintenance teams. It provides real-time monitoring of machine efficiency, water consumption, power usage, and solar energy optimization.

## 📋 Key Features

### Dashboard Pages

1. **Overview Dashboard** (`/dashboard`)
   - Real-time KPI cards for power, efficiency, water, load, and solar
   - Interactive charts (line, bar, pie charts)
   - Circular gauges for live metrics
   - Daily analytics with tabs for efficiency breakdown
   - 6+ data visualizations

2. **Analytics** (`/dashboard/analytics`)
   - Historical efficiency metrics
   - Power consumption vs solar output analysis
   - Water efficiency by production line
   - 7-day trend analysis with multiple metrics
   - Key insights and recommendations

3. **Power Management** (`/dashboard/power`)
   - Current consumption monitoring
   - Solar generation tracking
   - Grid dependency analysis
   - Hourly consumption charts
   - Machine-wise power breakdown
   - Cost analysis and ROI calculations

4. **Water Management** (`/dashboard/water`)
   - Daily water usage tracking
   - Weekly consumption trends
   - Machine efficiency ratings
   - Flow rate monitoring
   - Water conservation recommendations

5. **Alerts System** (`/dashboard/alerts`)
   - Active, critical, and resolved alert tabs
   - Alert severity levels (critical, warning, info)
   - Alert statistics dashboard
   - Notification preferences
   - Action-required tracking

6. **Settings** (`/dashboard/settings`)
   - General configuration
   - Alert threshold customization
   - Security management
   - Data retention policies
   - User management (admin only)

### Authentication

- Role-based access control (Admin, Operator)
- Login page with demo credentials
- Session-based authentication
- Protected routes

### Design & UX

- **Industrial Modern Theme**
  - Dark background (#0F172A)
  - Light green primary (#90EE90) - eco efficiency
  - Light blue secondary (#ADD8E6) - water/flow
  - Dark green accent (#2E8B57)
  - Professional dark mode optimized for factory environments

- **Responsive Design**
  - Mobile-first approach
  - Hidden sidebar on mobile (accessible via sheet menu)
  - Touch-optimized buttons and interactions
  - Adaptive layouts for all screen sizes

- **Performance**
  - Real-time data updates
  - Smooth animations and transitions
  - Optimized charts using Recharts
  - Efficient state management

## 🚀 Getting Started

### Demo Credentials

```
Operator Account:
Email: operator@ecocoir.com
Password: any password

Admin Account:
Email: admin@ecocoir.com
Password: any password
```

### Navigation

1. **Login** - Enter demo credentials
2. **Dashboard Overview** - View all real-time metrics
3. **Analytics** - Deep dive into historical trends
4. **Power/Water** - Monitor specific utilities
5. **Alerts** - Check system notifications
6. **Settings** - Configure preferences

## 📊 Mock Data

The dashboard includes comprehensive mock data for:

- 7 production lines with individual metrics
- Hourly power consumption data
- Daily water usage patterns
- Real-time machine load percentages
- Alert scenarios (critical, warnings, info)
- Cost analysis and efficiency metrics
- Solar energy generation data

## 🛠️ Component Architecture

### Key Components

- **KPICard** - Metric cards with trending
- **GaugeWidget** - Circular SVG gauges for real-time values
- **DashboardNavbar** - Top navigation with user menu
- **DashboardSidebar** - Navigation menu
- **MobileNav** - Mobile sheet menu

### Pages

- `app/page.tsx` - Login page
- `app/dashboard/` - Main dashboard routes
- `app/dashboard/page.tsx` - Overview
- `app/dashboard/analytics/page.tsx` - Analytics
- `app/dashboard/power/page.tsx` - Power management
- `app/dashboard/water/page.tsx` - Water management
- `app/dashboard/alerts/page.tsx` - Alerts
- `app/dashboard/settings/page.tsx` - Settings

## 🎨 Color System

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #90EE90 | Eco efficiency, gauges |
| Secondary | #ADD8E6 | Water, blue data |
| Accent | #2E8B57 | Dark green emphasis |
| Background | #0F172A | Dark slate |
| Card | #1E293B | Container backgrounds |
| Text | #E2E8F0 | Light text |
| Warning | #FB923C | Overload alerts |
| Critical | #EF4444 | System alerts |

## 📱 Responsive Breakpoints

- **Mobile**: 0-640px
- **Tablet**: 641px-1024px
- **Desktop**: 1025px+

Mobile features:
- Sheet-based navigation menu
- Optimized card layouts
- Stack-friendly grid (1 column)
- Touch-friendly buttons

## 🔐 Security Features

- Role-based access control
- Protected dashboard routes
- Session management with localStorage
- Password change functionality
- 2FA recommendation (placeholder)

## 📊 Data Visualizations

- Line charts (power consumption, efficiency trends)
- Bar charts (machine load, water usage)
- Area charts (daily consumption)
- Pie charts (efficiency distribution)
- Circular gauges (real-time metrics)

All charts use Recharts library with dark theme styling.

## 🎯 Future Enhancements

- Real API integration with MQTT protocol
- WebSocket for real-time data streaming
- Database persistence (Supabase/Neon)
- Advanced AI-based predictive maintenance
- Mobile app version
- Export functionality (PDF, CSV)
- Email alert integration
- Custom reporting

## 📝 Notes

- All data is mock data for demonstration
- Authentication is client-side only (mock)
- No actual IoT sensors connected
- Suitable for prototype and demo purposes
- Ready for backend integration

## 🔗 Tech Stack

- **Frontend**: Next.js 16, React 19
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

Built with v0.app - Modern factory intelligence made simple.
