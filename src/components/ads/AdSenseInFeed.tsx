import React, { useEffect } from 'react';

interface AdSenseInFeedProps {
  /**
   * AdSense data-ad-slot attribute
   */
  slot: string;
  /**
   * Layout key for in-feed ads
   */
  layoutKey?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  /**
   * Whether to show "Advertisement" label
   */
  showLabel?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseInFeed: React.FC<AdSenseInFeedProps> = ({
  slot,
  layoutKey = '-6t+ed+2i-1n-4w',
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
      console.error('AdSense In-Feed error:', error);
    }
  }, []);

  const adStyle = {
    display: 'block',
    textAlign: 'center' as const,
    margin: '24px 0',
    ...style
  };

  return (
    <div className={`adsense-infeed ${className}`} style={{ margin: '24px 0' }}>
      {showLabel && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          textAlign: 'center', 
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Advertisement
        </div>
      )}
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-format="fluid"
        data-ad-layout="in-article"
        data-ad-layout-key={layoutKey}
        data-ad-client="ca-pub-2517915911313139"
        data-ad-slot={slot}
      />
    </div>
  );
};

export default AdSenseInFeed; 