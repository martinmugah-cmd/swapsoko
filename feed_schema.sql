-- 1. Listing Media (Videos & Images)
CREATE TABLE public.listing_media (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id bigint REFERENCES public.listings(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('image', 'video')),
    url text NOT NULL,
    thumbnail_url text,
    duration integer,
    width integer,
    height integer,
    position integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Feed Events (The Personalization Heart)
CREATE TABLE public.feed_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    listing_id bigint REFERENCES public.listings(id) ON DELETE CASCADE,
    event_type text NOT NULL CHECK (event_type IN ('VIEW', 'LIKE', 'SAVE', 'COMMENT', 'SHARE', 'OFFER', 'WATCH_25', 'WATCH_50', 'WATCH_75', 'WATCH_100', 'SKIP')),
    watch_duration integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. User Preferences (Calculated from Feed Events)
CREATE TABLE public.user_preferences (
    user_id text REFERENCES public.profiles(user_id) ON DELETE CASCADE PRIMARY KEY,
    electronics_score integer DEFAULT 0,
    books_score integer DEFAULT 0,
    fashion_score integer DEFAULT 0,
    vehicles_score integer DEFAULT 0,
    furniture_score integer DEFAULT 0,
    sports_score integer DEFAULT 0,
    gaming_score integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies
-- Media is public
CREATE POLICY "Public media is viewable by everyone" ON public.listing_media FOR SELECT USING (true);
CREATE POLICY "Users can insert media for their own listings" ON public.listing_media FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid()::text)
);
CREATE POLICY "Users can delete media for their own listings" ON public.listing_media FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND user_id = auth.uid()::text)
);

-- Feed events can be created by authenticated users
CREATE POLICY "Users can insert their own feed events" ON public.feed_events FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can view their own feed events" ON public.feed_events FOR SELECT USING (user_id = auth.uid()::text);

-- Preferences are viewable by the user
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "System can update preferences (service role)" ON public.user_preferences FOR ALL USING (true);
