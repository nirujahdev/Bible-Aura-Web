# Bible Aura AdSense Implementation

## 🚀 Quick Usage (Recommended)

Use `SimpleAdSense` for optimal Google Auto Ads placement:

```tsx
import { SimpleAdSense } from '@/components/ads';

// Basic Ad Unit
<SimpleAdSense slot="2853748608" />

// Fluid In-Feed Ad Unit  
<SimpleAdSense 
  slot="2682358212" 
  isFluid={true}
  layoutKey="-hp-o+1u-4z+9c"
/>
```

## 📋 Available Ad Slots

- **Basic Auto Ad**: `2853748608`
- **Fluid Layout Ad**: `2682358212` (with layout key `-hp-o+1u-4z+9c`)

## ✅ Best Practices

1. **Minimal Styling**: Let Google handle placement and sizing
2. **Auto Format**: Always use `data-ad-format="auto"`
3. **Responsive**: Enable `data-full-width-responsive="true"`
4. **Simple Containers**: Avoid complex styling that interferes with ads

## 🎯 Where to Place Ads

- Homepage: Between content sections
- Blog posts: After paragraphs or sections
- Bible pages: Between verses or chapters
- Sidebar: Use sparingly and only on desktop

## ⚠️ Avoid

- Complex custom styling
- Fixed dimensions
- Forced positioning
- Multiple ads too close together
- Ads above the fold on mobile

## 🔧 Implementation

The AdSense script is already loaded in `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2517915911313139" crossorigin="anonymous"></script>
```

Each ad component automatically initializes with:
```javascript
(adsbygoogle = window.adsbygoogle || []).push({});
```

## 📱 Mobile Optimization

- Ads automatically resize for mobile
- Minimal container styling ensures proper display
- Print styles hide ads for printing

## 🎨 Styling

Minimal CSS applied:
- Basic margins for spacing
- Center alignment
- Print media queries to hide ads
- Mobile responsive margins

All styling is designed to not interfere with Google's automatic ad placement and optimization. 