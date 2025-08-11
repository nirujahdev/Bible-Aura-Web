import React, { useEffect } from 'react';

interface AdSenseBannerProps {
  /**
   * AdSense data-ad-slot attribute
   */
  slot: string;
  /**
   * Banner size (leaderboard, banner, large-banner)
   */
  size?: 'leaderboard' | 'banner' | 'large-banner' | 'mobile-banner';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom style
   */
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot,
  size = 'banner',
  className = '',
  style = {}
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense Banner error:', error);
    }
  }, []);

  // Define banner dimensions based on size
  const getBannerDimensions = (size: string) => {
    switch (size) {
      case 'leaderboard':
        return { width: 728, height: 90 };
      case 'banner':
        return { width: 468, height: 60 };
      case 'large-banner':
        return { width: 970, height: 250 };
      case 'mobile-banner':
        return { width: 320, height: 50 };
      default:
        return { width: 468, height: 60 };
    }
  };

  const dimensions = getBannerDimensions(size);

  const bannerStyle = {
    display: 'block',
    textAlign: 'center' as const,
    margin: '20px auto',
    maxWidth: '100%',
    ...style
  };

  return (
    <div className={`adsense-banner ${className}`} style={{ textAlign: 'center', margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={bannerStyle}
        data-ad-client="ca-pub-2517915911313139"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBanner; 