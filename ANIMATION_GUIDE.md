# Animation Guide - EcoCoir Dashboard

## Quick Start: Using Animations

### 1. Simple Fade-In Animation
```tsx
<div className="animate-fade-in-up">
  Content appears with smooth fade and upward movement
</div>
```

### 2. With Staggered Delays
```tsx
{items.map((item, index) => (
  <div 
    key={index}
    className="animate-fade-in-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item}
  </div>
))}
```

### 3. Combining Animations
```tsx
<div className="animate-fade-in-up animate-glow">
  Element fades in and glows
</div>
```

---

## Animation Library

### Entrance Animations (One-time)

#### fadeInUp
- **Duration**: 0.6s
- **Easing**: ease-out
- **Motion**: Opacity 0→1, Transform Y: 20px→0
- **Use for**: Page headers, cards, content blocks
```tsx
<h1 className="animate-fade-in-up">Welcome</h1>
```

#### slideInLeft
- **Duration**: 0.5s
- **Easing**: ease-out
- **Motion**: Opacity 0→1, Transform X: -30px→0
- **Use for**: Sidebar, left-aligned content
```tsx
<aside className="animate-slide-in-left">Menu</aside>
```

#### slideInRight
- **Duration**: 0.5s
- **Easing**: ease-out
- **Motion**: Opacity 0→1, Transform X: 30px→0
- **Use for**: Right-aligned content, modals
```tsx
<div className="animate-slide-in-right">Panel</div>
```

#### slideInDown
- **Duration**: 0.4s
- **Easing**: ease-out
- **Motion**: Opacity 0→1, Transform Y: -20px→0
- **Use for**: Navbar, dropdowns, notifications
```tsx
<nav className="animate-slide-in-down">Navigation</nav>
```

#### bounceIn
- **Duration**: 0.5s
- **Easing**: ease-out
- **Motion**: Scale 0.95→1.02→1, Opacity 0→1
- **Use for**: Success messages, alerts, confirmations
```tsx
<div className="animate-bounce-in">Success!</div>
```

---

### Continuous Animations (Loop)

#### glow
- **Duration**: 2s
- **Motion**: Box-shadow expands and fades
- **Use for**: Highlight important elements, call-to-action
- **Color**: Green (adjustable)
```tsx
<button className="animate-glow">Click Me</button>
```

#### pulse-glow
- **Duration**: 2s
- **Motion**: Opacity 1→0.8→1
- **Use for**: Notification badges, status indicators
- **Subtle**: Great for notifications
```tsx
<span className="animate-pulse-glow">●</span>
```

#### gradient
- **Duration**: 8s-20s
- **Motion**: Background gradient position shifts
- **Use for**: Animated backgrounds, hero sections
```tsx
<div className="gradient-eco">
  Animated background
</div>
```

#### float
- **Duration**: 3s
- **Motion**: Vertical movement ±8px
- **Use for**: Floating icons, decorative elements
- **Effect**: Gentle, organic movement
```tsx
<div className="animate-float">
  <Icon />
</div>
```

#### shimmer
- **Duration**: 2s
- **Motion**: Horizontal light sweep
- **Use for**: Skeleton loaders, loading states
- **Auto-applied**: SkeletonLoader components
```tsx
<div className="skeleton">Loading...</div>
```

---

## Performance Tips

### 1. Use GPU-Accelerated Properties
These are optimized for 60fps:
- `transform` (translate, scale, rotate)
- `opacity`
- `filter`

Avoid animating:
- `width`, `height`, `left`, `right` (triggers reflow)
- `color`, `background-color` (slower rendering)

### 2. Control Animation Delays
```tsx
// Good: Uses CSS delays
<div 
  className="animate-fade-in-up"
  style={{ animationDelay: '100ms' }}
/>

// Good: Stagger with index
<div 
  className="animate-fade-in-up"
  style={{ animationDelay: `${index * 50}ms` }}
/>
```

### 3. Respect Prefers-Reduced-Motion
```tsx
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
  }
}
```

### 4. Combine with Tailwind Transitions
```tsx
// Animation (entrance) + Transition (interaction)
<button 
  className="animate-fade-in-up hover:scale-110 transition-transform"
>
  Animated + Interactive
</button>
```

---

## Real-World Examples

### Example 1: Staggered Card Grid
```tsx
const cards = ['Card 1', 'Card 2', 'Card 3'];

export function CardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="animate-fade-in-up p-4 bg-white rounded-lg"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {card}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Notification with Bounce
```tsx
export function Notification({ message }) {
  return (
    <div className="animate-bounce-in bg-green-50 border-l-4 border-green-500 p-4">
      <span className="text-green-700">{message}</span>
    </div>
  );
}
```

### Example 3: Loading Skeleton
```tsx
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="skeleton h-4 w-24 mb-4"></div>
      <div className="skeleton h-8 w-32 mb-4"></div>
      <div className="skeleton h-48 w-full"></div>
    </div>
  );
}
```

### Example 4: Floating Icon
```tsx
export function FloatingAction() {
  return (
    <button className="animate-float p-4 bg-green-500 rounded-full text-white">
      <Plus size={24} />
    </button>
  );
}
```

### Example 5: Animated Gradient Background
```tsx
export function HeroSection() {
  return (
    <div className="gradient-eco p-12 text-white rounded-lg">
      <h1>Welcome to EcoCoir</h1>
      <p>Animated background shows environmental vitality</p>
    </div>
  );
}
```

---

## Customization

### Changing Animation Duration
Edit in `app/globals.css`:
```css
@keyframes fadeInUp {
  from { /* ... */ }
  to { /* ... */ }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;  /* Change 0.6s */
}
```

### Changing Animation Color
For glow effect on green button:
```tsx
<button 
  className="animate-glow p-4 bg-green-500"
  style={{ boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' }}
>
  Click Me
</button>
```

### Creating Custom Animation
Add to `app/globals.css`:
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
}
```

---

## Mobile Considerations

### Disable Animations on Low-End Devices
```tsx
const prefersReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<div className={prefersReduced ? '' : 'animate-fade-in-up'}>
  Content
</div>
```

### Touch Device Optimizations
- Keep animations under 600ms for responsiveness
- Avoid animations during scroll/drag
- Use `will-change` sparingly for frequently animated elements

```tsx
<div 
  className="animate-float"
  style={{ willChange: 'transform' }}
>
  Icon
</div>
```

---

## Debugging Animations

### Check Animation is Running
Open DevTools and look for animation markers in Performance tab.

### Force Animation Restart
```tsx
const [key, setKey] = useState(0);

<div 
  key={key}
  className="animate-fade-in-up"
>
  Content
</div>

// Restart animation
setKey(prev => prev + 1);
```

### Monitor Performance
Chrome DevTools → Performance tab → Scroll to see:
- Animation frames are 60fps
- No red "jank" indicators
- GPU acceleration in use

---

## Best Practices Summary

1. Use entrance animations for initial page load
2. Use continuous animations for engagement
3. Keep total animation duration under 800ms
4. Stagger animations for visual appeal
5. Always test on mobile devices
6. Respect user's motion preferences
7. Use GPU-accelerated properties
8. Combine animations with transitions for interaction

---

## Animation Reference Sheet

| Animation | Duration | Type | Use Case |
|-----------|----------|------|----------|
| fadeInUp | 0.6s | Entrance | Page content |
| slideInLeft | 0.5s | Entrance | Sidebar, panels |
| slideInRight | 0.5s | Entrance | Right content |
| slideInDown | 0.4s | Entrance | Navbar, headers |
| bounceIn | 0.5s | Entrance | Alerts, success |
| glow | 2s ∞ | Continuous | Important elements |
| pulseGlow | 2s ∞ | Continuous | Badges |
| gradient | 8-20s ∞ | Continuous | Backgrounds |
| float | 3s ∞ | Continuous | Icons |
| shimmer | 2s ∞ | Continuous | Loading states |

---

Enjoy creating delightful animations! 🎬
