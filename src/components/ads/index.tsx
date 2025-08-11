// AdSense Components Export
export { default as AdSenseDisplay } from './AdSenseDisplay';
export { default as AdSenseBanner } from './AdSenseBanner';
export { default as AdSenseInFeed } from './AdSenseInFeed';
export { default as AdSenseSidebar } from './AdSenseSidebar';
export { default as AdSenseUniversal } from './AdSenseUniversal';

// Recommended: Use AdSenseUniversal for most use cases
export { default as AdSense } from './AdSenseUniversal';

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