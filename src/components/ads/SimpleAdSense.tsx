import React, { useEffect } from 'react';

interface SimpleAdSenseProps {
  /**
   * AdSense data-ad-slot attribute
   */
  slot: string;
  /**
   * Additional CSS classes (minimal)
   */
  className?: string;
  /**
   * Custom layout key for fluid ads (optional)
   */
  layoutKey?: string;
  /**
   * Whether this is a fluid/in-feed ad
   */
  isFluid?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const SimpleAdSense: React.FC<SimpleAdSenseProps> = ({
  slot,
  className = '',
  layoutKey,
  isFluid = false
}) => {
  useEffect(() => {
    try {
      // Let Google handle ad initialization
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Minimal props - let Google auto-configure everything
  const adProps = {
    className: `adsbygoogle ${className}`.trim(),
    style: { display: 'block' },
    'data-ad-client': 'ca-pub-2517915911313139',
    'data-ad-slot': slot,
    'data-ad-format': isFluid ? 'fluid' : 'auto',
    'data-full-width-responsive': 'true',
    ...(isFluid && layoutKey && { 
      'data-ad-layout': 'in-article',
      'data-ad-layout-key': layoutKey 
    })
  };

  return <ins {...adProps} />;
};

export default SimpleAdSense; 