import React from 'react';
import { AdSense } from './index';

/**
 * Bible Aura Specific AdSense Ad Units
 * These components use your actual AdSense ad slots for easy integration
 */

// Basic Ad Unit - Auto format, responsive
export const BibleAuraBasicAd: React.FC<{
  className?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}> = ({ className = '', showLabel = false, style = {} }) => (
  <AdSense 
    slot="2853748608"
    type="display"
    size="auto"
    responsive={true}
    showLabel={showLabel}
    className={`bible-aura-basic-ad ${className}`}
    style={style}
  />
);

// Fluid Layout Ad Unit - For in-feed placements
export const BibleAuraFluidAd: React.FC<{
  className?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}> = ({ className = '', showLabel = true, style = {} }) => (
  <AdSense 
    slot="2682358212"
    type="infeed"
    layoutKey="-hp-o+1u-4z+9c"
    responsive={true}
    showLabel={showLabel}
    className={`bible-aura-fluid-ad ${className}`}
    style={style}
  />
);

// Banner version of Basic Ad
export const BibleAuraBannerAd: React.FC<{
  className?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}> = ({ className = '', showLabel = false, style = {} }) => (
  <AdSense 
    slot="2853748608"
    type="banner"
    size="auto"
    responsive={true}
    showLabel={showLabel}
    className={`bible-aura-banner-ad ${className}`}
    style={style}
  />
);

// Sidebar version of Basic Ad
export const BibleAuraSidebarAd: React.FC<{
  className?: string;
  showLabel?: boolean;
  sticky?: boolean;
  style?: React.CSSProperties;
}> = ({ className = '', showLabel = false, sticky = false, style = {} }) => (
  <AdSense 
    slot="2853748608"
    type="sidebar"
    size="auto"
    responsive={true}
    showLabel={showLabel}
    sticky={sticky}
    className={`bible-aura-sidebar-ad ${className}`}
    style={style}
  />
);

// Article/Content Ad using Fluid layout
export const BibleAuraArticleAd: React.FC<{
  className?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}> = ({ className = '', showLabel = true, style = {} }) => (
  <AdSense 
    slot="2682358212"
    type="article"
    responsive={true}
    showLabel={showLabel}
    className={`bible-aura-article-ad ${className}`}
    style={style}
  />
);

/**
 * Usage Examples:
 * 
 * // Home page banner
 * <BibleAuraBannerAd />
 * 
 * // Blog content
 * <BibleAuraFluidAd showLabel={true} />
 * 
 * // Sidebar
 * <BibleAuraSidebarAd sticky={true} />
 * 
 * // Article content
 * <BibleAuraArticleAd />
 * 
 * // General display ad
 * <BibleAuraBasicAd showLabel={false} />
 */

export default {
  BibleAuraBasicAd,
  BibleAuraFluidAd,
  BibleAuraBannerAd,
  BibleAuraSidebarAd,
  BibleAuraArticleAd
}; 