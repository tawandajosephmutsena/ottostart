---
name: tailwind-patterns
description: Tailwind CSS v4 principles. CSS-first configuration, container queries, modern patterns, design token architecture.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Tailwind CSS Patterns (v4 - 2025)

> Modern utility-first CSS with CSS-native configuration.

---

## 1. Tailwind v4 Architecture

### What Changed from v3
| v3 (Legacy) | v4 (Current) |
|-------------|--------------|
| `tailwind.config.js` | CSS-based `@theme` directive |
| PostCSS plugin | Oxide engine (10x faster) |
| JIT mode | Native, always-on |
| Plugin system | CSS-native features |
| `@apply` directive | Still works, discouraged |

### v4 Core Concepts
| Concept | Description |
|---------|-------------|
| **CSS-first** | Configuration in CSS, not JavaScript |
| **Oxide Engine** | Rust-based compiler, much faster |
| **Native Nesting** | CSS nesting without PostCSS |
| **CSS Variables** | All tokens exposed as `--*` vars |

---

## 2. CSS-Based Configuration

### Theme Definition
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: oklch(0.7 0.15 250);
  --color-secondary: oklch(0.6 0.12 330);
  
  /* Spacing */
  --spacing-gutter: 1.5rem;
  
  /* Typography */
  --font-display: "Inter Variable", sans-serif;
  
  /* Breakpoints */
  --breakpoint-xs: 475px;
}
```

### When to Extend vs Override
| Goal | Method |
|------|--------|
| Add new values | Add property to `@theme` |
| Change existing | Redefine property |
| Remove default | Set to `initial` |

---

## 3. Container Queries (v4 Native)

### Breakpoint vs Container
| Type | Based On | Use Case |
|------|----------|----------|
| Breakpoint | Viewport width | Page layouts |
| Container | Parent width | Component-level |

### Container Query Usage
```html
<div class="@container">
  <div class="@md:flex-row flex-col">
    <!-- Responds to container, not viewport -->
  </div>
</div>
```

### When to Use
- Card components that appear in different contexts
- Responsive layouts within fixed sidebars
- Widgets that resize based on their container

---

## 4. Responsive Design

### Breakpoint System
| Prefix | Min Width | Typical Use |
|--------|-----------|-------------|
| `sm:` | 640px | Larger phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Mobile-First Principle
```html
<!-- Start mobile, enhance upward -->
<div class="flex-col md:flex-row gap-4">
  <div class="w-full md:w-1/2">Content</div>
</div>
```

---

## 5. Dark Mode

### Configuration Strategies
| Method | Use Case |
|--------|----------|
| `class` | Manual toggle, JS control |
| `media` | Follow system preference |

### Dark Mode Pattern
```html
<div class="bg-white dark:bg-slate-900">
  <p class="text-slate-900 dark:text-slate-100">
    Adapts to mode
  </p>
</div>
```

---

## 6. Modern Layout Patterns

### Flexbox Patterns
```html
<!-- Center everything -->
<div class="flex items-center justify-center">

<!-- Space between with wrap -->
<div class="flex flex-wrap justify-between gap-4">

<!-- Stack to row -->
<div class="flex flex-col md:flex-row">
```

### Grid Patterns
```html
<!-- Auto-fit responsive grid -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">

<!-- Classic 12-column -->
<div class="grid grid-cols-12 gap-4">
  <div class="col-span-12 md:col-span-6 lg:col-span-4">
```

---

## 7. Modern Color System

### OKLCH vs RGB/HSL
| System | Pros | Cons |
|--------|------|------|
| OKLCH | Perceptually uniform, better gradients | Browser support (IE) |
| HSL | Good lightness control | Not perceptually uniform |
| RGB | Universal support | Hard to reason about |

### Color Token Architecture
```css
@theme {
  /* Semantic colors */
  --color-primary: oklch(0.65 0.18 250);
  --color-primary-light: oklch(0.75 0.15 250);
  --color-primary-dark: oklch(0.55 0.20 250);
  
  /* Functional colors */
  --color-success: oklch(0.72 0.19 145);
  --color-warning: oklch(0.82 0.16 85);
  --color-error: oklch(0.65 0.20 25);
}
```

---

## 8. Typography System

### Font Stack Pattern
```css
@theme {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;
}
```

### Type Scale
| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 0.75rem | Captions |
| `text-sm` | 0.875rem | Secondary |
| `text-base` | 1rem | Body |
| `text-lg` | 1.125rem | Lead |
| `text-xl+` | 1.25rem+ | Headings |

---

## 9. Animation & Transitions

### Built-in Animations
| Class | Effect |
|-------|--------|
| `animate-spin` | Continuous rotation |
| `animate-ping` | Pulse outward |
| `animate-pulse` | Gentle pulse |
| `animate-bounce` | Bouncing |

### Transition Patterns
```html
<!-- Smooth state changes -->
<button class="transition-colors duration-200 hover:bg-primary">

<!-- Group hover -->
<div class="group">
  <span class="transition group-hover:translate-x-1">→</span>
</div>
```

---

## 10. Component Extraction

### When to Extract
| Signal | Action |
|--------|--------|
| Same classes 3+ times | Consider component |
| Complex responsive | Create component |
| Many state variants | Use component |

### Extraction Methods
| Method | Best For |
|--------|----------|
| React/Vue component | JS frameworks |
| CSS component class | Static HTML |
| `@apply` | Last resort |

---

## 11. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Over-use `@apply` | Compose in HTML |
| Inline complex styles | Create components |
| Mix arbitrary + utility | Extend theme |
| Deep nesting | Keep flat |

---

## 12. Performance Principles

| Practice | Why |
|----------|-----|
| Purge unused CSS | Smaller bundles |
| Use `content` paths | Accurate scanning |
| Prefer built-in | Avoid custom CSS |
| Limit arbitrary values | Better caching |
