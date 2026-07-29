import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, X, MapPin, ArrowRightLeft, GraduationCap } from "lucide-react";
import { useState } from "react";

interface SwipeCardProps {
  listing: {
    id: number;
    title: string;
    imageUrl: string;
    wantDescription: string;
    distance?: string;
    cashTopUp?: number;
    ownerName: string;
    ownerAvatar?: string;
    campus?: string;
    matchScore?: number;
    condition?: string;
    isStudentVerified?: boolean;
  };
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSave?: () => void;
  isTop?: boolean;
}

export function SwipeCard({ listing, onSwipeRight, onSwipeLeft, onSave, isTop = false }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);

  // Map x position to rotation (organic tilt)
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  // Map x to opacity of overlay indicators
  const swapOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const skipOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  // Scale effect while dragging
  const scale = useTransform(x, [-300, 0, 300], [0.95, 1, 0.95]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 120;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > threshold || velocity > 500) {
      setExitX(500);
      onSwipeRight();
    } else if (offset < -threshold || velocity < -500) {
      setExitX(-500);
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 swipe-card"
      style={{ x, rotate, scale }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX, opacity: 0, transition: { duration: 0.3 } } : {}}
      whileDrag={{ cursor: "grabbing" }}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
    >
      <div className="relative w-full h-full rounded-[32px] overflow-hidden card-shadow-lg bg-white">
        {/* Image */}
        <div className="relative h-[60%] overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

          {/* SWAP indicator (right swipe) */}
          <motion.div
            className="absolute top-6 left-6 px-4 py-2 rounded-[24px] border-3 border-swap-green bg-swap-green/20 glass"
            style={{ opacity: swapOpacity }}
          >
            <span className="text-swap-green font-bold text-xl tracking-wider">SWAP</span>
          </motion.div>

          {/* SKIP indicator (left swipe) */}
          <motion.div
            className="absolute top-6 right-6 px-4 py-2 rounded-[24px] border-3 border-red-500 bg-red-500/20 glass"
            style={{ opacity: skipOpacity }}
          >
            <span className="text-red-500 font-bold text-xl tracking-wider">SKIP</span>
          </motion.div>

          {/* Distance badge */}
          {listing.distance && (
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full glass text-xs font-medium flex items-center gap-1">
              <MapPin size={10} className="text-swap-green" />
              {listing.distance}
            </div>
          )}

          {/* Match score */}
          {listing.matchScore && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-swap-green text-white text-xs font-bold">
              {listing.matchScore}% match
            </div>
          )}

          {/* Title on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl leading-tight">{listing.title}</h3>
            {listing.condition && (
              <span className="text-white/80 text-xs">{listing.condition}</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4 h-[40%] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft size={14} className="text-market-blue" />
              <span className="text-sm font-medium text-dark">Wants:</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{listing.wantDescription}</p>
            {listing.cashTopUp && listing.cashTopUp > 0 && (
              <span className="inline-block mt-2 mpesa-badge">+ KES {listing.cashTopUp.toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-swap-green/20 flex items-center justify-center text-xs font-bold text-swap-green">
                {listing.ownerName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-medium text-dark flex items-center gap-1">
                  {listing.ownerName}
                  {listing.isStudentVerified && <GraduationCap className="w-3 h-3 text-[#3B82F6]" />}
                </p>
                <p className="text-[10px] text-gray-500">{listing.campus}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={(e) => { e.stopPropagation(); onSwipeLeft(); }}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} className="text-gray-400" />
              </motion.button>
              {onSave && (
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onSave(); }}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart size={18} className="text-gray-400" />
                </motion.button>
              )}
              <motion.button
                onClick={(e) => { e.stopPropagation(); onSwipeRight(); }}
                className="w-10 h-10 rounded-full bg-swap-green flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRightLeft size={18} className="text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
