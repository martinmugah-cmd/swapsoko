import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      if (distance > 0 && window.scrollY === 0) {
        // Prevent default scrolling when pulling down at the top
        if (e.cancelable) {
            e.preventDefault();
        }
        // Add resistance
        const resistantDistance = distance * 0.4;
        setPullDistance(Math.min(resistantDistance, threshold * 1.5));
        controls.set({ y: Math.min(resistantDistance, threshold * 1.5) });
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      setIsPulling(false);

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        controls.start({ y: threshold, transition: { type: "spring", stiffness: 400, damping: 25 } });
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          controls.start({ y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
        }
      } else {
        setPullDistance(0);
        controls.start({ y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isPulling, isRefreshing, pullDistance, onRefresh, controls]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[100dvh] overflow-hidden">
      {/* Liquid Spinner */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
        style={{ height: threshold, y: pullDistance > 0 ? pullDistance - threshold : -threshold }}
        animate={isRefreshing ? { y: 0 } : controls}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center">
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : pullDistance * 2 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring", bounce: 0 }}
          >
            <RefreshCw className={`w-5 h-5 ${pullDistance >= threshold || isRefreshing ? 'text-green-500' : 'text-gray-400'}`} />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div animate={controls} className="w-full h-full bg-background relative z-10">
        {children}
      </motion.div>
    </div>
  );
};
