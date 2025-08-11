import React, { useEffect } from 'react';

interface AdSenseSidebarProps {
  /**
   * AdSense data-ad-slot attribute
   */
  slot: string;
  /**
   * Sidebar ad size (skyscraper, wide-skyscraper, square, small-square)
   */
  size?: 'skyscraper' | 'wide-skyscraper' | 'square' | 'small-square';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  /**
   * Whether to make the ad sticky
   */
  sticky?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseSidebar: React.FC<AdSenseSidebarProps> = ({
  slot,
  size = 'skyscraper',
  className = '',
  style = {},
  sticky = false
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense Sidebar error:', error);
    }
  }, []);

  // Define sidebar ad dimensions based on size
  const getSidebarDimensions = (size: string) => {
    switch (size) {
      case 'skyscraper':
        return { width: 120, height: 600 };
      case 'wide-skyscraper':
        return { width: 160, height: 600 };
      case 'square':
        return { width: 250, height: 250 };
      case 'small-square':
        return { width: 200, height: 200 };
      default:
        return { width: 120, height: 600 };
    }
  };

  const dimensions = getSidebarDimensions(size);

  const containerStyle = {
    position: sticky ? 'sticky' as const : 'relative' as const,
    top: sticky ? '20px' : 'auto',
    margin: '20px 0',
    ...style
  };

  const adStyle = {
    display: 'block',
    textAlign: 'center' as const,
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    margin: '0 auto'
  };

  return (
    <div className={`adsense-sidebar ${className}`} style={containerStyle}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-2517915911313139"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseSidebar; 