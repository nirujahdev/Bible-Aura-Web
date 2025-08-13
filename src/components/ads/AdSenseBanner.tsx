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
  /**
   * Whether to show advertisement label (required by policy)
   */
  showLabel?: boolean;
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
  style = {},
  showLabel = true
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

  // Policy-compliant container styling with adequate spacing
  const containerStyle = {
    textAlign: 'center' as const,
    margin: '40px 0', // Increased margin for policy compliance
    padding: '20px 0', // Added padding to prevent accidental clicks
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    ...style
  };

  const bannerStyle = {
    display: 'block',
    textAlign: 'center' as const,
    maxWidth: '100%',
    minHeight: `${dimensions.height}px`
  };

  return (
    <div className={`adsense-banner ${className}`} style={containerStyle}>
      {showLabel && (
        <div style={{
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          marginBottom: '8px',
          opacity: 0.8
        }}>
          Advertisement
        </div>
      )}
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