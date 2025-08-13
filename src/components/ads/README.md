# 🔒 Policy-Compliant AdSense Components

## ⚠️ **IMPORTANT: POLICY COMPLIANCE UPDATE**

This implementation has been updated to ensure full compliance with Google Publisher Policies. **Do not modify these components** without understanding policy implications.

## 📋 **Available Components**

### 1. **SimpleAdSense** (Recommended)
Primary component for all ad placements.

```tsx
import SimpleAdSense from '@/components/ads/SimpleAdSense';

<SimpleAdSense 
  slot="your-ad-slot-id"
  showLabel={true}        // Required by policy
  isFluid={false}         // Optional
  className="custom-class"
/>
```

**Features:**
- ✅ Auto advertisement labeling
- ✅ Policy-compliant spacing (32px margins)
- ✅ Mobile responsive
- ✅ Error handling

### 2. **AdSenseBanner** (Policy Compliant)
For banner-style advertisements.

```tsx
import AdSenseBanner from '@/components/ads/AdSenseBanner';

<AdSenseBanner 
  slot="your-ad-slot-id"
  size="leaderboard"      // banner, leaderboard, large-banner, mobile-banner
  showLabel={true}        // Required
/>
```

**Features:**
- ✅ Pre-defined banner sizes
- ✅ 40px margins for policy compliance
- ✅ Advertisement labels
- ✅ Mobile optimization

### 3. **AdSenseDisplay** (Policy Compliant)
Flexible display advertisements.

```tsx
import AdSenseDisplay from '@/components/ads/AdSenseDisplay';

<AdSenseDisplay 
  slot="your-ad-slot-id"
  format="auto"           // auto, rectangle, vertical, horizontal
  responsive={true}
  showLabel={true}        // Required
/>
```

### 4. **AdSenseUniversal** (Advanced - Policy Compliant)
Universal ad component with advanced options.

```tsx
import AdSenseUniversal from '@/components/ads/AdSenseUniversal';

<AdSenseUniversal 
  slot="your-ad-slot-id"
  type="display"          // display, banner, infeed, sidebar, article
  showLabel={true}        // Required
  sticky={false}          // Always disabled for policy compliance
/>
```

## 🚨 **Policy Compliance Features**

### ✅ **Automatic Advertisement Labeling**
All components now include mandatory "Advertisement" labels:
- Font: 12px system font
- Color: #666 (subtle gray)
- Position: Above ad unit
- Text: "ADVERTISEMENT"

### ✅ **Policy-Compliant Spacing**
- **Minimum margins**: 32px on all sides
- **Banner ads**: 40px margins
- **Sidebar ads**: 40px margins (no sticky)
- **In-feed ads**: 48px margins

### ✅ **No Sticky Positioning**
All sticky ad behavior has been **DISABLED** to prevent policy violations:
```tsx
// ❌ This will NOT work (policy compliance)
<AdSenseUniversal sticky={true} /> // Ignored

// ✅ Use this instead
<AdSenseUniversal sticky={false} />
```

### ✅ **Accidental Click Prevention**
- Clear visual separation from content
- Adequate padding around ads
- No placement near interactive elements
- Proper container boundaries

## 📱 **Mobile Optimization**

All components are mobile-optimized with:
- Responsive sizing
- Touch-friendly spacing
- Reduced margins on mobile (24px minimum)
- Proper loading behavior

## 🎨 **Styling (ads.css)**

Policy-compliant CSS classes:
```css
.adsense-container {
  margin: 32px 0;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.adsense-banner { margin: 40px 0 !important; }
.adsense-sidebar { margin: 40px 0 !important; position: relative !important; }
.adsense-infeed { margin: 48px 0 !important; }
```

## 🚫 **What NOT to Do**

### ❌ **Policy Violations to Avoid:**

```tsx
// ❌ Don't remove advertisement labels
<SimpleAdSense showLabel={false} /> // Policy violation

// ❌ Don't use sticky positioning
<AdSenseUniversal sticky={true} />  // Disabled for compliance

// ❌ Don't place ads too close to content
<div style={{ margin: '5px' }}>
  <SimpleAdSense slot="123" />
</div>

// ❌ Don't modify the AdSense code
const adCode = adsbygoogle.push({}); // Don't do this
```

## ✅ **Best Practices**

### **1. Proper Implementation**
```tsx
// ✅ Correct usage
<section className="py-12 bg-gray-50">
  <div className="max-w-4xl mx-auto px-4">
    <SimpleAdSense 
      slot="2853748608" 
      showLabel={true}
    />
  </div>
</section>
```

### **2. Content-to-Ad Ratio**
- Place ads between content sections
- Ensure substantial content above/below ads
- Don't overload pages with ads

### **3. User Experience**
- Ads should complement, not disrupt content
- Clear visual separation
- Consistent spacing
- Mobile-friendly placement

## 🔍 **Testing & Debugging**

### **Safe Testing Methods:**
```tsx
// ✅ Use private browsing for testing
// ✅ Test on different devices
// ✅ Check mobile responsiveness
// ✅ Verify advertisement labels appear
// ✅ Confirm proper spacing
```

### **Debug Mode:**
```tsx
// Add to see ad container boundaries
<SimpleAdSense 
  slot="123" 
  className="debug-ads"
  style={{ border: '1px solid red' }} // Remove in production
/>
```

## 📊 **Performance Monitoring**

Use these metrics to ensure policy compliance:
- Ad viewability rates
- Click-through rates (should be natural)
- User engagement (not impacted by ads)
- Loading performance
- Mobile usability scores

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Ads not showing:**
   - Check network connection
   - Verify slot ID
   - Ensure AdSense script loads

2. **Policy warnings:**
   - Check advertisement labels
   - Verify spacing requirements
   - Review ad placement

3. **Mobile issues:**
   - Test responsive behavior
   - Check touch targets
   - Verify mobile spacing

## 📞 **Need Help?**

1. Check AdSense Policy Center dashboard
2. Review Google Publisher Policies
3. Contact support through AdSense dashboard
4. Refer to official documentation

## 🔗 **Resources**

- [Google Publisher Policies](https://support.google.com/publisherpolicies/)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- [Better Ads Standards](https://www.betterads.org/standards/)

---

**⚠️ Critical**: These components are policy-compliant. Modifications may result in AdSense policy violations and account suspension. 