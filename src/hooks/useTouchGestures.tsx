import { useRef, useEffect, useCallback } from 'react';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
  velocity: number;
}

export interface TapGesture {
  x: number;
  y: number;
  tapCount: number;
  timestamp: number;
}

export interface TouchGestureCallbacks {
  onSwipe?: (gesture: SwipeDirection) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (gesture: TapGesture) => void;
  onDoubleTap?: (gesture: TapGesture) => void;
  onLongPress?: (point: TouchPoint) => void;
  onTouchStart?: (point: TouchPoint) => void;
  onTouchMove?: (point: TouchPoint) => void;
  onTouchEnd?: (point: TouchPoint) => void;
}

export interface TouchGestureOptions {
  swipeThreshold?: number; // Minimum distance for swipe recognition
  swipeVelocityThreshold?: number; // Minimum velocity for swipe
  doubleTapTimeout?: number; // Max time between taps for double tap
  longPressTimeout?: number; // Time to hold for long press
  pinchThreshold?: number; // Minimum scale change for pinch recognition
  preventDefaultTouchMove?: boolean; // Prevent default touch move behavior
  enablePinch?: boolean; // Enable pinch gestures
  enableSwipe?: boolean; // Enable swipe gestures
  enableTap?: boolean; // Enable tap gestures
  enableLongPress?: boolean; // Enable long press
}

const defaultOptions: Required<TouchGestureOptions> = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  doubleTapTimeout: 300,
  longPressTimeout: 500,
  pinchThreshold: 0.1,
  preventDefaultTouchMove: false,
  enablePinch: true,
  enableSwipe: true,
  enableTap: true,
  enableLongPress: true,
};

export function useTouchGestures<T extends HTMLElement = HTMLDivElement>(
  callbacks: TouchGestureCallbacks,
  options: TouchGestureOptions = {}
) {
  const elementRef = useRef<T>(null);
  const gestureState = useRef({
    startTouches: [] as TouchPoint[],
    lastTouches: [] as TouchPoint[],
    tapCount: 0,
    lastTapTime: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    isLongPress: false,
    initialDistance: 0,
    lastScale: 1,
  });

  const config = { ...defaultOptions, ...options };

  // Helper functions
  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now(),
  });

  const getDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getSwipeDirection = (start: TouchPoint, end: TouchPoint): SwipeDirection | null => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = end.timestamp - start.timestamp;
    const velocity = distance / duration;

    if (distance < config.swipeThreshold || velocity < config.swipeVelocityThreshold) {
      return null;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let direction: 'left' | 'right' | 'up' | 'down';

    if (angle >= -45 && angle <= 45) {
      direction = 'right';
    } else if (angle >= 45 && angle <= 135) {
      direction = 'down';
    } else if (angle >= -135 && angle <= -45) {
      direction = 'up';
    } else {
      direction = 'left';
    }

    return { direction, distance, velocity, duration };
  };

  const clearLongPressTimer = useCallback(() => {
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer);
      gestureState.current.longPressTimer = null;
    }
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touches = Array.from(event.touches).map(getTouchPoint);
    gestureState.current.startTouches = touches;
    gestureState.current.lastTouches = touches;
    gestureState.current.isLongPress = false;

    // Call onTouchStart callback
    if (callbacks.onTouchStart && touches.length > 0) {
      callbacks.onTouchStart(touches[0]);
    }

    // Handle single touch for tap and long press
    if (touches.length === 1 && config.enableTap) {
      const touch = touches[0];
      
      // Handle double tap detection
      const now = Date.now();
      if (now - gestureState.current.lastTapTime < config.doubleTapTimeout) {
        gestureState.current.tapCount++;
      } else {
        gestureState.current.tapCount = 1;
      }

      // Set up long press detection
      if (config.enableLongPress) {
        clearLongPressTimer();
        gestureState.current.longPressTimer = setTimeout(() => {
          gestureState.current.isLongPress = true;
          if (callbacks.onLongPress) {
            callbacks.onLongPress(touch);
          }
        }, config.longPressTimeout);
      }
    }

    // Handle pinch setup
    if (touches.length === 2 && config.enablePinch) {
      gestureState.current.initialDistance = getDistance(touches[0], touches[1]);
      gestureState.current.lastScale = 1;
    }
  }, [callbacks, config, clearLongPressTimer]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (config.preventDefaultTouchMove) {
      event.preventDefault();
    }

    const touches = Array.from(event.touches).map(getTouchPoint);
    gestureState.current.lastTouches = touches;

    // Call onTouchMove callback
    if (callbacks.onTouchMove && touches.length > 0) {
      callbacks.onTouchMove(touches[0]);
    }

    // Clear long press if touch moves too much
    if (touches.length === 1 && gestureState.current.startTouches.length === 1) {
      const startTouch = gestureState.current.startTouches[0];
      const currentTouch = touches[0];
      const distance = getDistance(startTouch, currentTouch);

      if (distance > 10) { // 10px threshold for movement
        clearLongPressTimer();
      }
    }

    // Handle pinch gesture
    if (touches.length === 2 && gestureState.current.startTouches.length === 2 && config.enablePinch) {
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / gestureState.current.initialDistance;
      
      if (Math.abs(scale - gestureState.current.lastScale) > config.pinchThreshold) {
        const center = {
          x: (touches[0].x + touches[1].x) / 2,
          y: (touches[0].y + touches[1].y) / 2,
        };
        
        const velocity = Math.abs(scale - gestureState.current.lastScale);
        
        if (callbacks.onPinch) {
          callbacks.onPinch({ scale, center, velocity });
        }
        
        gestureState.current.lastScale = scale;
      }
    }
  }, [callbacks, config, clearLongPressTimer]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const touches = Array.from(event.changedTouches).map(getTouchPoint);
    const remainingTouches = Array.from(event.touches).map(getTouchPoint);

    // Call onTouchEnd callback
    if (callbacks.onTouchEnd && touches.length > 0) {
      callbacks.onTouchEnd(touches[0]);
    }

    clearLongPressTimer();

    // Handle tap gestures (only if not a long press and single touch)
    if (
      !gestureState.current.isLongPress &&
      gestureState.current.startTouches.length === 1 &&
      touches.length === 1 &&
      remainingTouches.length === 0 &&
      config.enableTap
    ) {
      const startTouch = gestureState.current.startTouches[0];
      const endTouch = touches[0];
      const distance = getDistance(startTouch, endTouch);

      // If movement is minimal, it's a tap
      if (distance < config.swipeThreshold) {
        const tapGesture: TapGesture = {
          x: endTouch.x,
          y: endTouch.y,
          tapCount: gestureState.current.tapCount,
          timestamp: endTouch.timestamp,
        };

        gestureState.current.lastTapTime = endTouch.timestamp;

        if (gestureState.current.tapCount === 1) {
          // Single tap - delay to check for double tap
          setTimeout(() => {
            if (gestureState.current.tapCount === 1 && callbacks.onTap) {
              callbacks.onTap(tapGesture);
            }
          }, config.doubleTapTimeout);
        } else if (gestureState.current.tapCount === 2 && callbacks.onDoubleTap) {
          callbacks.onDoubleTap(tapGesture);
          gestureState.current.tapCount = 0; // Reset after double tap
        }
      }
    }

    // Handle swipe gestures
    if (
      gestureState.current.startTouches.length === 1 &&
      touches.length === 1 &&
      remainingTouches.length === 0 &&
      config.enableSwipe &&
      !gestureState.current.isLongPress
    ) {
      const swipeDirection = getSwipeDirection(
        gestureState.current.startTouches[0],
        touches[0]
      );

      if (swipeDirection && callbacks.onSwipe) {
        callbacks.onSwipe(swipeDirection);
      }
    }

    // Reset state when all touches are removed
    if (remainingTouches.length === 0) {
      gestureState.current.startTouches = [];
      gestureState.current.lastTouches = [];
    }
  }, [callbacks, config, clearLongPressTimer]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: !config.preventDefaultTouchMove });
    element.addEventListener('touchmove', handleTouchMove, { passive: !config.preventDefaultTouchMove });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer, config.preventDefaultTouchMove]);

  return {
    ref: elementRef,
    gestureState: gestureState.current,
  };
}

// Utility hook for common gesture patterns
export function useSwipeNavigation(
  onNext?: () => void,
  onPrevious?: () => void,
  options?: TouchGestureOptions
) {
  return useTouchGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'left' && onNext) {
        onNext();
      } else if (gesture.direction === 'right' && onPrevious) {
        onPrevious();
      }
    },
  }, {
    ...options,
    enableTap: false,
    enableLongPress: false,
    enablePinch: false,
  });
}

// Hook for pull-to-refresh pattern
export function usePullToRefresh(
  onRefresh: () => void,
  threshold: number = 100,
  options?: TouchGestureOptions
) {
  return useTouchGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'down' && gesture.distance > threshold) {
        onRefresh();
      }
    },
  }, {
    ...options,
    enableTap: false,
    enableLongPress: false,
    enablePinch: false,
    swipeThreshold: threshold,
  });
} 