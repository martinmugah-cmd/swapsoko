import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Plus, Bookmark } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export function FeedOverlay({ listing, onPropose }: { listing: any, onPropose: () => void }) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    const logEvent = trpc.feed.logEvent.useMutation();

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (!isLiked) {
            logEvent.mutate({ listingId: listing.id, eventType: 'LIKE', listingCategory: listing.category });
        }
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        if (!isSaved) {
            logEvent.mutate({ listingId: listing.id, eventType: 'SAVE', listingCategory: listing.category });
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-end p-6 pb-8">
            <div className="flex items-end justify-between w-full pointer-events-auto">
                
                {/* Info Container */}
                <div className="flex flex-col gap-3 w-full">
                    
                    {/* Top Row: User & Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[18px] bg-white/10 backdrop-blur-md overflow-hidden border border-white/20 shadow-lg shrink-0">
                            <img src={listing.profiles?.avatarUrl || "/cham.png"} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-white text-2xl font-black drop-shadow-md leading-tight line-clamp-2">{listing.title}</h2>
                    </div>

                    {/* Meta tags (Squircles) */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {listing.estimatedValue ? (
                            <span className="text-emerald-50 text-xs font-bold bg-emerald-500/80 px-3 py-1.5 rounded-xl backdrop-blur-md border border-emerald-400/50 shadow-sm">
                                Worth: KES {listing.estimatedValue.toLocaleString()}
                            </span>
                        ) : null}
                        <span className="text-white/90 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
                            Wants: {listing.wantItems || "Offers"}
                        </span>
                        <span className="text-white/90 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1">
                            <span className="text-xs">📍</span> {listing.location || 'Nearby'}
                        </span>
                    </div>

                    {/* Bottom: Action Buttons */}
                    <div className="flex items-center gap-3 mt-4">
                        <button 
                            onClick={onPropose}
                            className="flex-1 py-4 bg-white text-black font-extrabold text-[15px] rounded-2xl shadow-[0_8px_30px_rgba(255,255,255,0.2)] transform transition hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Offer Swap
                        </button>
                        
                        <button onClick={handleSave} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center transition-colors hover:bg-white/20 active:scale-95 shrink-0">
                            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeedVideo({ listing, isActive, onPropose }: { listing: any, isActive: boolean, onPropose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const logEvent = trpc.feed.logEvent.useMutation();
    const hasLogged100 = useRef(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log('Autoplay blocked:', e));
            logEvent.mutate({ listingId: listing.id, eventType: 'VIEW', listingCategory: listing.category });
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
            hasLogged100.current = false;
        }
    }, [isActive]);

    const handleTimeUpdate = () => {
        if (!videoRef.current || hasLogged100.current) return;
        const pct = videoRef.current.currentTime / videoRef.current.duration;
        if (pct >= 0.95) {
            logEvent.mutate({ listingId: listing.id, eventType: 'WATCH_100', listingCategory: listing.category });
            hasLogged100.current = true;
        }
    };

    let parsedImages: string[] = [];
    if (Array.isArray(listing.images)) {
        parsedImages = listing.images;
    } else if (typeof listing.images === 'string') {
        try { 
            const p = JSON.parse(listing.images); 
            parsedImages = Array.isArray(p) ? p : [p];
        }
        catch(e) { parsedImages = [listing.images]; }
    }

    const videoUrl = listing.media?.find((m:any) => m.type === 'video')?.url;
    const coverUrl = parsedImages[0] || listing.media?.find((m:any) => m.type === 'image')?.url || "/cham.png";

    return (
        <div className="relative w-full h-[100dvh] bg-black snap-start snap-always flex-shrink-0">
            {videoUrl ? (
                <video 
                    ref={videoRef}
                    src={videoUrl}
                    poster={coverUrl}
                    loop
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-full h-full object-cover"
                />
            ) : (
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            )}
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80 pointer-events-none" />
            
            <FeedOverlay listing={listing} onPropose={onPropose} />
        </div>
    );
}

export function Feed({ onPropose }: { onPropose: (listing: any) => void }) {
    const { data, isLoading } = trpc.feed.list.useQuery();
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollTop / container.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center pb-24">
                <div className="w-12 h-12 border-4 border-white/20 border-t-[#22C55E] rounded-full animate-spin" />
                <p className="text-white mt-4 font-bold tracking-widest uppercase text-sm">Curating Feed</p>
            </div>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center p-8 pb-24">
                <p className="text-white text-center font-semibold text-lg">You've seen it all!</p>
                <p className="text-white/60 text-center text-sm mt-2">Check back later for more amazing swaps.</p>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full h-[100dvh] bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative pb-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            
            {data.items.map((listing: any, index: number) => (
                <FeedVideo 
                    key={listing.id} 
                    listing={listing} 
                    isActive={index === activeIndex} 
                    onPropose={() => onPropose(listing)} 
                />
            ))}
        </div>
    );
}
