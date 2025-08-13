import React, { useEffect, useRef } from 'react';

interface AdSenseDisplayProps {
  /**
   * AdSense data-ad-slot attribute
   */
  slot: string;
  /**
   * Ad format (auto, rectangle, vertical, horizontal)
   */
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  /**
   * Responsive design (true for responsive ads)
   */
  responsive?: boolean;
  /**
   * Custom style for the ad container
   */
  style?: React.CSSProperties;
  /**
   * CSS class name for styling
   */
  className?: string;
  /**
   * Ad width (for fixed size ads)
   */
  width?: number;
  /**
   * Ad height (for fixed size ads)
   */
  height?: number;
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

const AdSenseDisplay: React.FC<AdSenseDisplayProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  style = {},
  className = '',
  width,
  height,
  showLabel = true
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Initialize adsbygoogle if not already done
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Policy-compliant container styling
  const containerStyle = {
    textAlign: 'center' as const,
    margin: '32px 0', // Adequate spacing to prevent accidental clicks
    padding: '16px 0',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    ...style
  };

  const adStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center' as const,
    minHeight: '50px'
  };

  // Set width and height if provided
  if (width) adStyle.width = `${width}px`;
  if (height) adStyle.height = `${height}px`;

  const adProps = {
    className: `adsbygoogle ${className}`.trim(),
    style: adStyle,
    'data-ad-client': 'ca-pub-2517915911313139',
    'data-ad-slot': slot,
    'data-ad-format': format,
    ...(responsive && { 'data-full-width-responsive': 'true' })
  };

  return (
    <div ref={adRef} className="adsense-container" style={containerStyle}>
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
      <ins {...adProps} />
    </div>
  );
};

export default AdSenseDisplay; 