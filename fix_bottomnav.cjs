const fs = require('fs');
let code = fs.readFileSync('client/src/App.tsx', 'utf8');

if (!code.includes('path: "/multiswap"')) {
    const search = `{ path: '/profile', icon: UserCircle, label: 'Profile' }`;
    const replace = `{ path: '/multiswap', icon: Shuffle, label: 'Cycles' },\n    { path: '/profile', icon: UserCircle, label: 'Profile' }`;
    code = code.replace(search, replace);

    const iconSearch = `import { Camera, MapPin, CheckCircle2, Package, Map as MapIcon, X, Maximize2, LayoutGrid, Clock, Flame, ChevronRight, UserCircle, Bell, ArrowRight, ShieldCheck, Heart, Search, Check, Send, AlertTriangle, MessageCircle, Info } from 'lucide-react';`;
    const iconReplace = iconSearch.replace('Search,', 'Search, Shuffle,');
    code = code.replace(iconSearch, iconReplace);

    fs.writeFileSync('client/src/App.tsx', code);
    console.log("BottomNav updated in App.tsx!");
}
