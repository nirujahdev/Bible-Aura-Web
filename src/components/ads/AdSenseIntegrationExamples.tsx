import React from 'react';
import { AdSense, AdSenseBanner, AdSenseInFeed, AdSenseSidebar } from './index';

/**
 * This file contains examples of how to integrate AdSense ads throughout Bible Aura
 * Replace the slot values with your actual AdSense ad unit slot IDs
 */

// Example 1: Header Banner Ad (for use in header/navigation area)
export const HeaderBannerAd: React.FC = () => (
  <AdSenseBanner 
    slot="YOUR_HEADER_BANNER_SLOT" 
    size="leaderboard"
    className="header-ad"
  />
);

// Example 2: Sidebar Ad (for use in sidebars)
export const SidebarAd: React.FC = () => (
  <AdSenseSidebar 
    slot="YOUR_SIDEBAR_SLOT"
    size="skyscraper"
    sticky={true}
    className="sidebar-ad"
  />
);

// Example 3: In-Content Ad (for blog posts and articles)
export const BlogContentAd: React.FC = () => (
  <AdSenseInFeed 
    slot="YOUR_INFEED_SLOT"
    showLabel={true}
    className="blog-content-ad"
  />
);

// Example 4: Universal Ad Component (recommended for most cases)
export const HomePageBannerAd: React.FC = () => (
  <AdSense 
    slot="YOUR_HOMEPAGE_BANNER_SLOT"
    type="banner"
    size="leaderboard"
    responsive={true}
    showLabel={false}
    className="homepage-banner"
  />
);

// Example 5: Bible Study Page Ad
export const BibleStudyAd: React.FC = () => (
  <AdSense 
    slot="YOUR_BIBLE_STUDY_SLOT"
    type="display"
    size="medium"
    responsive={true}
    showLabel={true}
    className="bible-study-ad"
  />
);

// Example 6: Mobile-Optimized Ad
export const MobileAd: React.FC = () => (
  <AdSense 
    slot="YOUR_MOBILE_SLOT"
    type="banner"
    size="auto"
    responsive={true}
    className="mobile-ad"
    style={{ maxWidth: '100%' }}
  />
);

// Example 7: Between Sermon Content
export const SermonContentAd: React.FC = () => (
  <AdSense 
    slot="YOUR_SERMON_CONTENT_SLOT"
    type="article"
    responsive={true}
    showLabel={true}
    className="sermon-content-ad"
    style={{ margin: '40px 0' }}
  />
);

/**
 * Example Usage in Components:
 * 
 * // In your Home.tsx component:
 * import { HomePageBannerAd, MobileAd } from '../components/ads/AdSenseIntegrationExamples';
 * 
 * function Home() {
 *   return (
 *     <div>
 *       <HomePageBannerAd />
 *       {/* Your existing home content *\/}
 *       <MobileAd />
 *     </div>
 *   );
 * }
 * 
 * // In your Blog.tsx component:
 * import { BlogContentAd, SidebarAd } from '../components/ads/AdSenseIntegrationExamples';
 * 
 * function Blog() {
 *   return (
 *     <div className="blog-layout">
 *       <main className="blog-content">
 *         {/* Blog post content *\/}
 *         <BlogContentAd />
 *         {/* More blog content *\/}
 *       </main>
 *       <aside className="blog-sidebar">
 *         <SidebarAd />
 *       </aside>
 *     </div>
 *   );
 * }
 * 
 * // In your Bible.tsx component:
 * import { BibleStudyAd } from '../components/ads/AdSenseIntegrationExamples';
 * 
 * function Bible() {
 *   return (
 *     <div>
 *       {/* Bible content *\/}
 *       <BibleStudyAd />
 *       {/* More Bible content *\/}
 *     </div>
 *   );
 * }
 */

/**
 * CSS recommendations for ads (add to your CSS files):
 * 
 * .adsense-container {
 *   margin: 20px 0;
 *   text-align: center;
 * }
 * 
 * .header-ad {
 *   margin: 10px 0;
 * }
 * 
 * .sidebar-ad {
 *   margin: 20px 0;
 * }
 * 
 * .blog-content-ad {
 *   margin: 30px 0;
 *   padding: 20px;
 *   border-top: 1px solid #eee;
 *   border-bottom: 1px solid #eee;
 * }
 * 
 * .mobile-ad {
 *   display: block;
 *   margin: 15px auto;
 * }
 * 
 * .homepage-banner {
 *   margin: 20px 0;
 * }
 * 
 * .bible-study-ad {
 *   margin: 25px 0;
 * }
 * 
 * .sermon-content-ad {
 *   margin: 40px 0;
 *   padding: 20px 0;
 * }
 * 
 * @media (max-width: 768px) {
 *   .adsense-container {
 *     margin: 15px 0;
 *   }
 *   
 *   .sidebar-ad {
 *     display: none; // Hide sidebar ads on mobile
 *   }
 * }
 */ 