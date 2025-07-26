import { useState, useEffect, useMemo } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveLayoutConfig {
  device: DeviceType;
  orientation: Orientation;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  gridColumns: number;
  sidebarWidth: number;
  headerHeight: number;
  isCompact: boolean;
  containerMaxWidth: string;
}

interface UseResponsiveLayoutOptions {
  debounceMs?: number;
  enableTouchDetection?: boolean;
}

export function useResponsiveLayout(options: UseResponsiveLayoutOptions = {}) {
  const { debounceMs = 150, enableTouchDetection = true } = options;
  
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch capabilities
  useEffect(() => {
    if (!enableTouchDetection || typeof window === 'undefined') return;

    const detectTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is IE-specific property
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(detectTouch());
  }, [enableTouchDetection]);

  // Handle window resize with debouncing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [debounceMs]);

  // Calculate responsive configuration
  const layoutConfig: ResponsiveLayoutConfig = useMemo(() => {
    const { width, height } = dimensions;

    // Determine device type
    let device: DeviceType = 'mobile';
    if (width >= 1600) {
      device = 'large-desktop';
    } else if (width >= 1024) {
      device = 'desktop';
    } else if (width >= 768) {
      device = 'tablet';
    }

    // Determine orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';

    // Calculate grid columns based on device and content area
    let gridColumns = 1;
    if (device === 'large-desktop') {
      gridColumns = 4;
    } else if (device === 'desktop') {
      gridColumns = 3;
    } else if (device === 'tablet') {
      gridColumns = orientation === 'landscape' ? 3 : 2;
    } else {
      gridColumns = orientation === 'landscape' ? 2 : 1;
    }

    // Calculate sidebar width
    let sidebarWidth = 0;
    if (device === 'desktop' || device === 'large-desktop') {
      sidebarWidth = 280;
    } else if (device === 'tablet' && orientation === 'landscape') {
      sidebarWidth = 240;
    }

    // Calculate header height
    const headerHeight = device === 'mobile' ? 56 : 64;

    // Determine if layout should be compact
    const isCompact = device === 'mobile' || (device === 'tablet' && orientation === 'portrait');

    // Container max width
    let containerMaxWidth = '100%';
    if (device === 'large-desktop') {
      containerMaxWidth = '1600px';
    } else if (device === 'desktop') {
      containerMaxWidth = '1200px';
    }

    return {
      device,
      orientation,
      isTouchDevice,
      screenWidth: width,
      screenHeight: height,
      gridColumns,
      sidebarWidth,
      headerHeight,
      isCompact,
      containerMaxWidth,
    };
  }, [dimensions, isTouchDevice]);

  // Helper functions
  const getColumnSpan = (preferredSpan: number = 1): number => {
    return Math.min(preferredSpan, layoutConfig.gridColumns);
  };

  const getBreakpointClasses = () => {
    const { device, orientation } = layoutConfig;
    
    return {
      mobile: device === 'mobile',
      tablet: device === 'tablet',
      desktop: device === 'desktop',
      largeDesktop: device === 'large-desktop',
      portrait: orientation === 'portrait',
      landscape: orientation === 'landscape',
      touch: isTouchDevice,
      compact: layoutConfig.isCompact,
    };
  };

  const getGridClasses = () => {
    const { device, orientation } = layoutConfig;
    
    let baseClasses = 'grid gap-4 sm:gap-6';
    
    if (device === 'mobile') {
      baseClasses += orientation === 'landscape' 
        ? ' grid-cols-2' 
        : ' grid-cols-1';
    } else if (device === 'tablet') {
      baseClasses += orientation === 'landscape' 
        ? ' grid-cols-3' 
        : ' grid-cols-2';
    } else if (device === 'desktop') {
      baseClasses += ' grid-cols-3';
    } else {
      baseClasses += ' grid-cols-4';
    }
    
    return baseClasses;
  };

  const getContainerClasses = () => {
    const { device, isCompact } = layoutConfig;
    
    let classes = 'w-full mx-auto';
    
    if (isCompact) {
      classes += ' px-4';
    } else {
      classes += ' px-6 lg:px-8';
    }
    
    if (device === 'large-desktop') {
      classes += ' max-w-7xl';
    } else if (device === 'desktop') {
      classes += ' max-w-6xl';
    }
    
    return classes;
  };

  const getSidebarClasses = () => {
    const { device, sidebarWidth } = layoutConfig;
    
    if (sidebarWidth === 0) {
      return 'hidden';
    }
    
    return `hidden ${device === 'desktop' || device === 'large-desktop' ? 'lg:block' : 'md:block'} w-${sidebarWidth}`;
  };

  // Widget sizing helpers
  const getWidgetSize = (widgetType: 'small' | 'medium' | 'large' = 'medium') => {
    const { device, isCompact } = layoutConfig;
    
    if (isCompact) {
      return widgetType === 'large' ? 'h-80' : widgetType === 'medium' ? 'h-64' : 'h-48';
    }
    
    switch (widgetType) {
      case 'small':
        return device === 'large-desktop' ? 'h-56' : 'h-48';
      case 'large':
        return device === 'large-desktop' ? 'h-96' : 'h-80';
      default:
        return device === 'large-desktop' ? 'h-72' : 'h-64';
    }
  };

  return {
    layoutConfig,
    getColumnSpan,
    getBreakpointClasses,
    getGridClasses,
    getContainerClasses,
    getSidebarClasses,
    getWidgetSize,
    // Direct access to commonly used values
    isMobile: layoutConfig.device === 'mobile',
    isTablet: layoutConfig.device === 'tablet',
    isDesktop: layoutConfig.device === 'desktop',
    isLargeDesktop: layoutConfig.device === 'large-desktop',
    isCompact: layoutConfig.isCompact,
    isTouchDevice: layoutConfig.isTouchDevice,
    isPortrait: layoutConfig.orientation === 'portrait',
    isLandscape: layoutConfig.orientation === 'landscape',
    gridColumns: layoutConfig.gridColumns,
    screenWidth: layoutConfig.screenWidth,
    screenHeight: layoutConfig.screenHeight,
  };
} 