# Component Guide

## 🧩 Component Overview

This guide provides detailed information about all components in the Clutch Admin system, including usage examples, props, and best practices.

## 📋 Table of Contents

- [Base Components](#base-components)
- [Layout Components](#layout-components)
- [Navigation Components](#navigation-components)
- [Animation Components](#animation-components)
- [Interaction Components](#interaction-components)
- [Accessibility Components](#accessibility-components)
- [Performance Components](#performance-components)

## 🎯 Base Components

### UnifiedButton

A comprehensive button component with multiple variants, sizes, and states.

```tsx
import { UnifiedButton } from '@/components/ui/unified-button'

// Basic usage
<UnifiedButton>Click me</UnifiedButton>

// With variant and size
<UnifiedButton variant="primary" size="lg">
  Primary Button
</UnifiedButton>

// With loading state
<UnifiedButton disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</UnifiedButton>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
- `size`: 'sm' | 'md' | 'lg' | 'icon'
- `disabled`: boolean
- `asChild`: boolean (render as child component)
- `onClick`: () => void
- `className`: string

**Variants:**
- `default`: Standard button with primary styling
- `primary`: Primary action button with accent color
- `secondary`: Secondary action button
- `outline`: Outlined button with transparent background
- `ghost`: Minimal button with hover effects
- `link`: Link-style button

**Sizes:**
- `sm`: Small button (32px height)
- `md`: Medium button (40px height) - default
- `lg`: Large button (48px height)
- `icon`: Square button for icons only

### SnowButton

Specialized button component for the Admin Dashboard with SnowUI design system.

```tsx
import { SnowButton } from '@/components/ui/snow-button'

<SnowButton 
  variant="primary"
  size="md"
  loading={isLoading}
  onClick={handleClick}
>
  Save Changes
</SnowButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `onClick`: () => void

## 🏗️ Layout Components

### AdaptiveContainer

Responsive container that adapts to different screen sizes with smart breakpoints.

```tsx
import { AdaptiveContainer } from '@/components/responsive/adaptive-layout'

<AdaptiveContainer 
  maxWidth={{ 
    xs: '100%', 
    sm: '640px', 
    md: '768px', 
    lg: '1024px', 
    xl: '1280px' 
  }}
  padding={{ 
    xs: '1rem', 
    sm: '1.5rem', 
    lg: '2rem' 
  }}
  centered={true}
>
  <h1>Page Content</h1>
</AdaptiveContainer>
```

**Props:**
- `maxWidth`: Partial<Record<Breakpoint, string>>
- `padding`: Partial<Record<Breakpoint, string>>
- `margin`: Partial<Record<Breakpoint, string>>
- `centered`: boolean
- `fluid`: boolean

### AdaptiveGrid

Flexible grid system with responsive columns and gaps.

```tsx
import { AdaptiveGrid } from '@/components/responsive/adaptive-layout'

<AdaptiveGrid 
  columns={{ 
    xs: 1, 
    sm: 2, 
    md: 3, 
    lg: 4 
  }}
  gap={{ 
    xs: '1rem', 
    sm: '1.5rem', 
    lg: '2rem' 
  }}
  autoFit={false}
  minItemWidth="250px"
>
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</AdaptiveGrid>
```

**Props:**
- `columns`: Partial<Record<Breakpoint, number>>
- `gap`: Partial<Record<Breakpoint, string>>
- `autoFit`: boolean
- `autoFill`: boolean
- `minItemWidth`: string
- `maxItemWidth`: string

### AdaptiveFlex

Responsive flexbox container with adaptive properties.

```tsx
import { AdaptiveFlex } from '@/components/responsive/adaptive-layout'

<AdaptiveFlex 
  direction={{ 
    xs: 'column', 
    md: 'row' 
  }}
  justify={{ 
    xs: 'center', 
    md: 'space-between' 
  }}
  align="center"
  gap="1rem"
>
  <div>Item 1</div>
  <div>Item 2</div>
</AdaptiveFlex>
```

**Props:**
- `direction`: Partial<Record<Breakpoint, 'row' | 'column' | 'row-reverse' | 'column-reverse'>>
- `wrap`: Partial<Record<Breakpoint, 'nowrap' | 'wrap' | 'wrap-reverse'>>
- `justify`: Partial<Record<Breakpoint, 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'>>
- `align`: Partial<Record<Breakpoint, 'start' | 'end' | 'center' | 'baseline' | 'stretch'>>
- `gap`: Partial<Record<Breakpoint, string>>

## 🧭 Navigation Components

### SmartNavigationBar

Intelligent navigation bar with search, suggestions, and user menu.

```tsx
import { SmartNavigationBar } from '@/components/navigation/smart-navigation'

<SmartNavigationBar
  logo={
    <div className="flex items-center">
      <Logo />
      <span className="ml-2 text-xl font-bold">Clutch</span>
    </div>
  }
  userMenu={<UserMenu />}
  searchEnabled={true}
  suggestionsEnabled={true}
  breadcrumbsEnabled={true}
/>
```

**Props:**
- `logo`: React.ReactNode
- `userMenu`: React.ReactNode
- `searchEnabled`: boolean
- `suggestionsEnabled`: boolean
- `breadcrumbsEnabled`: boolean

### SmartSidebar

Adaptive sidebar with smart suggestions, recent items, and navigation.

```tsx
import { SmartSidebar } from '@/components/navigation/smart-navigation'

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <UsersIcon />,
    path: '/users',
    children: [
      { id: 'user-list', label: 'User List', path: '/users/list' },
      { id: 'user-roles', label: 'User Roles', path: '/users/roles' }
    ]
  }
]

<SmartSidebar
  items={navigationItems}
  isOpen={sidebarOpen}
  onToggle={setSidebarOpen}
  showSuggestions={true}
  showRecent={true}
/>
```

**Props:**
- `items`: NavigationItem[]
- `isOpen`: boolean
- `onToggle`: () => void
- `showSuggestions`: boolean
- `showRecent`: boolean

### SmartBreadcrumbs

Intelligent breadcrumb navigation with smart path detection.

```tsx
import { SmartBreadcrumbs } from '@/components/navigation/smart-navigation'

<SmartBreadcrumbs 
  showHome={true}
  separator="/"
  maxItems={5}
/>
```

**Props:**
- `showHome`: boolean
- `separator`: React.ReactNode
- `maxItems`: number

## 🎭 Animation Components

### AnimatedCard

Card component with various entrance animations and hover effects.

```tsx
import { AnimatedCard } from '@/components/animations/animated-card'

<AnimatedCard
  animation="fadeIn"
  delay={100}
  hoverAnimation="lift"
  clickAnimation="scale"
  onClick={handleClick}
>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</AnimatedCard>
```

**Props:**
- `animation`: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounceIn' | 'rotateIn' | 'elasticIn'
- `delay`: number
- `duration`: number
- `hoverAnimation`: 'lift' | 'glow' | 'scale' | 'rotate' | 'tilt' | 'none'
- `clickAnimation`: 'bounce' | 'scale' | 'pulse' | 'none'
- `isVisible`: boolean

### AnimatedModal

Modal component with smooth entrance/exit animations.

```tsx
import { AnimatedModal } from '@/components/animations/animated-card'

<AnimatedModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Settings"
  size="md"
  closeOnOverlayClick={true}
  closeOnEscape={true}
>
  <form>
    <input type="text" placeholder="Enter value" />
    <button type="submit">Save</button>
  </form>
</AnimatedModal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean
- `closeOnEscape`: boolean
- `showCloseButton`: boolean

## 🎮 Interaction Components

### AdvancedButton

Enhanced button with micro-interactions, loading states, and animations.

```tsx
import { AdvancedButton } from '@/components/interactions/advanced-button'

<AdvancedButton
  variant="primary"
  size="lg"
  isLoading={isLoading}
  loadingText="Processing..."
  onClick={handleSubmit}
>
  Submit Form
</AdvancedButton>
```

**Props:**
- `isLoading`: boolean
- `loadingText`: string
- All UnifiedButton props

### GestureCard

Card component with gesture support (swipe, long press, hover).

```tsx
import { GestureCard } from '@/components/interactions/gesture-card'

<GestureCard
  onDismiss={handleDismiss}
  onLongPress={handleLongPress}
  className="notification-card"
>
  <h4>Notification Title</h4>
  <p>Notification message</p>
</GestureCard>
```

**Props:**
- `onDismiss`: () => void
- `onLongPress`: () => void
- `className`: string

### Loading States

Various loading state components for better user experience.

```tsx
import { 
  SkeletonLoader, 
  ShimmerLoader, 
  ProgressiveImage 
} from '@/components/interactions/loading-states'

// Skeleton loader
<SkeletonLoader 
  count={3}
  width="100%"
  height="1em"
/>

// Shimmer loader
<ShimmerLoader 
  width="200px"
  height="100px"
/>

// Progressive image
<ProgressiveImage
  src="/high-res-image.jpg"
  placeholderSrc="/low-res-image.jpg"
  alt="Description"
  className="rounded-lg"
/>
```

## ♿ Accessibility Components

### AccessibleButton

Button component with enhanced accessibility features.

```tsx
import { AccessibleButton } from '@/components/accessibility/accessible-button'

<AccessibleButton
  ariaLabel="Save document"
  keyboardShortcut="Ctrl+S"
  onClick={handleSave}
>
  Save
</AccessibleButton>
```

**Props:**
- `ariaLabel`: string
- `keyboardShortcut`: string
- All UnifiedButton props

### AccessibleModal

Modal component with proper accessibility features.

```tsx
import { AccessibleModal } from '@/components/accessibility/accessible-modal'

<AccessibleModal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to delete this item?</p>
  <div className="flex space-x-2">
    <button onClick={onConfirm}>Confirm</button>
    <button onClick={onClose}>Cancel</button>
  </div>
</AccessibleModal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean
- `closeOnEscape`: boolean
- `showCloseButton`: boolean

## ⚡ Performance Components

### VirtualScrollTable

High-performance table component for large datasets.

```tsx
import { VirtualScrollTable } from '@/components/ui/virtual-scroll-table'

<VirtualScrollTable
  data={largeDataset}
  rowHeight={60}
  renderRow={(item, index) => (
    <div className="flex items-center space-x-4 p-4">
      <span>{item.name}</span>
      <span>{item.email}</span>
      <span>{item.role}</span>
    </div>
  )}
  header={
    <div className="flex items-center space-x-4 p-4 bg-gray-50 font-medium">
      <span>Name</span>
      <span>Email</span>
      <span>Role</span>
    </div>
  }
  className="border rounded-lg"
/>
```

**Props:**
- `data`: T[]
- `rowHeight`: number
- `renderRow`: (item: T, index: number) => React.ReactNode
- `header`: React.ReactNode
- `className`: string

### PerformanceDashboard

Real-time performance monitoring dashboard.

```tsx
import { PerformanceDashboard } from '@/components/performance/performance-dashboard'

<PerformanceDashboard className="fixed bottom-4 right-4 z-50" />
```

**Props:**
- `className`: string

## 🎨 Styling and Theming

### Design Tokens

The system uses a comprehensive design token system:

```tsx
import { ClutchDesignTokens } from '@/lib/design-tokens'

// Colors
const primaryColor = ClutchDesignTokens.colors.primary.DEFAULT
const spacing = ClutchDesignTokens.spacing['4']

// Typography
const headingFont = ClutchDesignTokens.typography.fontFamily.heading
const bodyFont = ClutchDesignTokens.typography.fontFamily.body
```

### CSS Variables

The system provides CSS variables for theming:

```css
:root {
  --color-primary: #FF0000;
  --color-secondary: #F5F5F5;
  --spacing-4: 1rem;
  --border-radius: 8px;
}
```

### Dark Mode

Components automatically support dark mode:

```tsx
// Dark mode is handled automatically
<UnifiedButton variant="primary">
  This button adapts to dark mode
</UnifiedButton>
```

## 🧪 Testing Components

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { UnifiedButton } from '@/components/ui/unified-button'

test('renders button with correct text', () => {
  render(<UnifiedButton>Click me</UnifiedButton>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})

test('handles click events', () => {
  const handleClick = jest.fn()
  render(<UnifiedButton onClick={handleClick}>Click me</UnifiedButton>)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Accessibility Testing

```tsx
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AccessibleButton } from '@/components/accessibility/accessible-button'

expect.extend(toHaveNoViolations)

test('should not have accessibility violations', async () => {
  const { container } = render(
    <AccessibleButton ariaLabel="Save">Save</AccessibleButton>
  )
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## 📚 Best Practices

### Component Composition

- **Compose** complex components from simple ones
- **Use** composition over inheritance
- **Keep** components focused and single-purpose
- **Avoid** prop drilling with context

### Performance

- **Use** React.memo for expensive components
- **Implement** lazy loading for heavy components
- **Optimize** re-renders with useCallback and useMemo
- **Use** virtual scrolling for large lists

### Accessibility

- **Always** provide proper ARIA labels
- **Ensure** keyboard navigation works
- **Test** with screen readers
- **Maintain** proper color contrast

### Styling

- **Use** design tokens for consistency
- **Prefer** CSS-in-JS for component-specific styles
- **Implement** responsive design from the start
- **Test** on multiple devices and screen sizes

---

**For more information, see the [API Reference](api/README.md) and [Testing Guide](testing/README.md).**
