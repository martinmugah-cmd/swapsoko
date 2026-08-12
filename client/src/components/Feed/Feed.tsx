import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Plus, Bookmark, CheckCircle, MapPin, Banknote, Flag } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

export function FeedOverlay({ listing, onPropose, onReport }: { listing: any, onPropose: () => void, onReport: () => void }) {
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

    let displayLocation = listing.location || listing.town || listing.locationName || listing.campus || 'Nearby';

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-end p-5 pb-8">
            <div className="flex items-end justify-between w-full pointer-events-auto">
                
                {/* Left Side: Info */}
                <div className="flex flex-col gap-2 w-full pr-16 mb-20">
                    
                    {/* User Profile Badge & Report */}
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full pr-4 pl-1 py-1 w-max shadow-sm">
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/20">
                                <img src={listing.profiles?.avatarUrl || "/cham.png"} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-white/95 text-[13px] font-semibold tracking-wide">
                                {listing.profiles?.name || 'Anonymous'}
                            </span>
                        </div>
                        
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!user) {
                                    toast("Login to report listings!", { action: { label: "Login", onClick: () => window.location.href = "/login" } });
                                    return;
                                }
                                onReport(); 
                            }}
                            className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors shadow-sm"
                        >
                            <Flag className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-xl font-bold leading-snug drop-shadow-md">{listing.title}</h2>

                    {/* Meta tags */}
                    <div className="flex flex-col gap-2 mt-1">
                        
                        {/* What he wants */}
                        <div className="flex items-start gap-2">
                            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-swap-green shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                            <span className="text-white/90 text-[13px] font-medium leading-tight drop-shadow-sm">
                                <span className="text-white/50 text-[12px] mr-1 uppercase font-bold tracking-wider">Wants</span>
                                {listing.wantItems || "Open to offers"}
                            </span>
                        </div>

                        {/* Exact Location & Distance */}
                        <div className="flex items-center gap-2">
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-white/40"></span>
                            <span className="text-white/70 text-[13px] font-medium drop-shadow-sm flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                {displayLocation}
                                {(listing.distanceKm !== undefined && !isNaN(listing.distanceKm)) && (
                                    <span className="ml-1.5 text-white/50">
                                        • {listing.distanceKm > 1000 ? "+1000 km" : listing.distanceKm < 1 ? `${Math.round(listing.distanceKm * 1000)} m` : `${listing.distanceKm} km`}
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Cash Top-up & Value */}
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            {listing.cashTopUpAllowed && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-wide flex items-center gap-1 backdrop-blur-md">
                                    <Banknote className="w-3.5 h-3.5" /> Cash Top-up OK
                                </span>
                            )}
                            
                            {listing.estimatedValue ? (
                                <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[11px] font-bold tracking-wide backdrop-blur-md">
                                    KES {listing.estimatedValue.toLocaleString()}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 z-20 w-full px-5 pointer-events-auto">
                <button 
                    onClick={(e) => { e.stopPropagation(); onPropose(); }}
                    className="flex-1 h-14 rounded-full apple-glass-thick text-slate-900 font-bold text-[14px] tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98]"
                >
                    Offer Swap
                </button>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); handleSave(); }} 
                    className="w-14 h-14 rounded-full apple-glass flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                >
                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-swap-green text-swap-green' : 'text-slate-700'}`} />
                </button>
            </div>
        </div>
    );
}

export function FeedVideo({ listing, isActive, onPropose, onReport }: { listing: any, isActive: boolean, onPropose: () => void, onReport: () => void }) {
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
            
            {/* Gradient overlay for text readability - cleaner, subtle dark fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            
            <FeedOverlay listing={listing} onPropose={onPropose} onReport={onReport} />
        </div>
    );
}

export function Feed({ onPropose, onReport, coords }: { onPropose: (listing: any) => void, onReport: (listing: any) => void, coords?: {lat: number, lng: number} | null }) {
    const { data, isLoading } = trpc.feed.list.useQuery({ coords });
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
            <div className="w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-swap-green border-t-transparent animate-spin" />
                    <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                </div>
                <p className="text-white/40 mt-6 font-bold tracking-[0.2em] uppercase text-[11px]">Curating Feed</p>
            </div>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md">
                    <CheckCircle className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2 tracking-tight">You're all caught up</h3>
                <p className="text-white/40 text-[14px] max-w-[240px] leading-relaxed">
                    We'll notify you when new video swaps are available.
                </p>
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
                    onReport={() => onReport(listing)}
                />
            ))}
        </div>
    );
}
