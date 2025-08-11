// Simple AdSense Component - Recommended for Auto Placement
export { default as SimpleAdSense } from './SimpleAdSense';

// Recommended: Use SimpleAdSense for Google Auto Ads
export { default as AdSense } from './SimpleAdSense';

// Advanced Components (may interfere with auto placement)
export { default as AdSenseDisplay } from './AdSenseDisplay';
export { default as AdSenseBanner } from './AdSenseBanner';
export { default as AdSenseInFeed } from './AdSenseInFeed';
export { default as AdSenseSidebar } from './AdSenseSidebar';
export { default as AdSenseUniversal } from './AdSenseUniversal';

// Bible Aura Specific Ad Components (with actual slot IDs)
export {
  BibleAuraBasicAd,
  BibleAuraFluidAd,
  BibleAuraBannerAd,
  BibleAuraSidebarAd,
  BibleAuraArticleAd
} from './BibleAuraAdUnits';

// Re-export types for convenience (note: these type exports won't work as written, but keeping for structure)
// export type { default as AdSenseDisplayProps } from './AdSenseDisplay';
// export type { default as AdSenseBannerProps } from './AdSenseBanner';
// export type { default as AdSenseInFeedProps } from './AdSenseInFeed';
// export type { default as AdSenseSidebarProps } from './AdSenseSidebar'; 