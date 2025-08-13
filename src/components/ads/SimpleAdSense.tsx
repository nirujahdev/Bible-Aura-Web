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

const SimpleAdSense: React.FC<SimpleAdSenseProps> = ({
  slot,
  className = '',
  layoutKey,
  isFluid = false,
  showLabel = true
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

  // Policy-compliant container with proper spacing
  const containerStyle = {
    margin: '32px 0',
    padding: '16px 0',
    textAlign: 'center' as const,
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px'
  };

  // Minimal props - let Google auto-configure everything
  const adProps = {
    className: `adsbygoogle ${className}`.trim(),
    style: { display: 'block', minHeight: '50px' },
    'data-ad-client': 'ca-pub-2517915911313139',
    'data-ad-slot': slot,
    'data-ad-format': isFluid ? 'fluid' : 'auto',
    'data-full-width-responsive': 'true',
    ...(isFluid && layoutKey && { 
      'data-ad-layout': 'in-article',
      'data-ad-layout-key': layoutKey 
    })
  };

  return (
    <div style={containerStyle}>
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
      <ins {...adProps} />
    </div>
  );
};

export default SimpleAdSense; 