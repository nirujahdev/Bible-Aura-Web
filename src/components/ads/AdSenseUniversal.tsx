import React, { useEffect } from 'react';

type AdType = 'display' | 'banner' | 'infeed' | 'sidebar' | 'article';
type AdSize = 'auto' | 'small' | 'medium' | 'large' | 'leaderboard' | 'skyscraper' | 'square';

interface AdSenseUniversalProps {
  /**
   * AdSense data-ad-slot attribute
   */
  slot: string;
  /**
   * Type of ad placement
   */
  type?: AdType;
  /**
   * Ad size preset
   */
  size?: AdSize;
  /**
   * Custom width
   */
  width?: number;
  /**
   * Custom height
   */
  height?: number;
  /**
   * Whether the ad should be responsive
   */
  responsive?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  /**
   * Whether to show advertisement label
   */
  showLabel?: boolean;
  /**
   * Make sidebar ads sticky - DISABLED for policy compliance
   */
  sticky?: boolean;
  /**
   * Layout key for in-feed ads
   */
  layoutKey?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUniversal: React.FC<AdSenseUniversalProps> = ({
  slot,
  type = 'display',
  size = 'auto',
  width,
  height,
  responsive = true,
  className = '',
  style = {},
  showLabel = true,
  sticky = false, // Always disabled for policy compliance
  layoutKey = '-6t+ed+2i-1n-4w'
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense Universal error:', error);
    }
  }, []);

  // Get dimensions based on size preset
  const getDimensions = (size: AdSize, type: AdType) => {
    const presets = {
      small: { width: 200, height: 200 },
      medium: { width: 300, height: 250 },
      large: { width: 336, height: 280 },
      leaderboard: { width: 728, height: 90 },
      skyscraper: { width: 160, height: 600 },
      square: { width: 250, height: 250 }
    };

    if (size === 'auto') {
      return type === 'sidebar' ? presets.skyscraper : presets.medium;
    }

    return presets[size] || presets.medium;
  };

  const dimensions = getDimensions(size, type);
  const adWidth = width || dimensions.width;
  const adHeight = height || dimensions.height;

  // Configure ad properties based on type
  const getAdConfig = () => {
    const baseConfig = {
      'data-ad-client': 'ca-pub-2517915911313139',
      'data-ad-slot': slot
    };

    switch (type) {
      case 'infeed':
        return {
          ...baseConfig,
          'data-ad-format': 'fluid',
          'data-ad-layout': 'in-article',
          'data-ad-layout-key': layoutKey
        };
      case 'article':
        return {
          ...baseConfig,
          'data-ad-format': 'fluid',
          'data-ad-layout': 'in-article'
        };
      default:
        return {
          ...baseConfig,
          'data-ad-format': responsive ? 'auto' : 'fixed',
          ...(responsive && { 'data-full-width-responsive': 'true' })
        };
    }
  };

  // Container styles based on type - Policy compliant spacing
  const getContainerStyle = () => {
    const baseStyle = {
      textAlign: 'center' as const,
      margin: '32px 0', // Increased for policy compliance
      padding: '16px 0', // Added padding to prevent accidental clicks
      minHeight: '100px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '8px',
      ...style
    };

    // Sticky ads disabled for policy compliance
    if (type === 'sidebar') {
      return {
        ...baseStyle,
        position: 'relative' as const, // Never sticky
        margin: '40px 0' // Extra margin for sidebar
      };
    }

    if (type === 'infeed' || type === 'article') {
      return {
        ...baseStyle,
        margin: '48px 0' // Extra spacing for in-feed ads
      };
    }

    return baseStyle;
  };

  // Ad element styles
  const getAdStyle = () => {
    const baseAdStyle = {
      display: 'block',
      textAlign: 'center' as const,
      margin: '0 auto'
    };

    if (!responsive && type !== 'infeed' && type !== 'article') {
      return {
        ...baseAdStyle,
        width: `${adWidth}px`,
        height: `${adHeight}px`
      };
    }

    return baseAdStyle;
  };

  const adConfig = getAdConfig();
  const containerStyle = getContainerStyle();
  const adStyle = getAdStyle();

  return (
    <div className={`adsense-universal adsense-${type} ${className}`} style={containerStyle}>
      {showLabel && (
        <div style={{
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          opacity: 0.8
        }}>
          Advertisement
        </div>
      )}
      <ins
        className="adsbygoogle"
        style={adStyle}
        {...adConfig}
      />
    </div>
  );
};

export default AdSenseUniversal; 