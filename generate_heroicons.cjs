const fs = require('fs');

const exportedNames = fs.readFileSync('exported_icons.txt', 'utf8').trim().split('\n');

// We map the names to Heroicons. 
// Heroicons typically has XMarkIcon, CheckIcon, HomeIcon, MagnifyingGlassIcon, etc.
const heroMap = {
  AlertCircle: 'ExclamationCircleIcon',
  AlertTriangle: 'ExclamationTriangleIcon',
  ArrowLeft: 'ArrowLeftIcon',
  ArrowRight: 'ArrowRightIcon',
  ArrowRightLeft: 'ArrowsRightLeftIcon',
  ArrowUpRight: 'ArrowUpRightIcon',
  Award: 'TrophyIcon',
  Banknote: 'BanknotesIcon',
  BarChart2: 'ChartBarIcon',
  Bell: 'BellIcon',
  BellOff: 'BellSlashIcon',
  Bookmark: 'BookmarkIcon',
  BookOpen: 'BookOpenIcon',
  Bot: 'CpuChipIcon', // fallback
  Box: 'CubeIcon',
  Building2: 'BuildingOfficeIcon',
  Calendar: 'CalendarIcon',
  CalendarIcon: 'CalendarIcon',
  Camera: 'CameraIcon',
  Check: 'CheckIcon',
  CheckCheck: 'CheckBadgeIcon',
  CheckCircle: 'CheckCircleIcon',
  CheckCircle2: 'CheckCircleIcon',
  CheckIcon: 'CheckIcon',
  CheckSquare: 'CheckIcon',
  ChefHat: 'CakeIcon',
  ChevronDown: 'ChevronDownIcon',
  ChevronDownIcon: 'ChevronDownIcon',
  ChevronLeft: 'ChevronLeftIcon',
  ChevronLeftIcon: 'ChevronLeftIcon',
  ChevronRight: 'ChevronRightIcon',
  ChevronRightIcon: 'ChevronRightIcon',
  ChevronUpIcon: 'ChevronUpIcon',
  CircleIcon: 'PlusCircleIcon',
  ClipboardList: 'ClipboardDocumentListIcon',
  Clock: 'ClockIcon',
  Code: 'CodeBracketIcon',
  Coins: 'CircleStackIcon',
  Compass: 'MapIcon',
  Cpu: 'CpuChipIcon',
  Crosshair: 'ViewfinderCircleIcon',
  Download: 'ArrowDownTrayIcon',
  Dumbbell: 'SparklesIcon', // fallback
  Edit: 'PencilSquareIcon',
  Edit2: 'PencilIcon',
  Eye: 'EyeIcon',
  EyeOff: 'EyeSlashIcon',
  FileText: 'DocumentTextIcon',
  Film: 'FilmIcon',
  Filter: 'AdjustmentsHorizontalIcon',
  Flame: 'FireIcon',
  Flag: 'FlagIcon',
  Gamepad2: 'PlayIcon',
  Gavel: 'ScaleIcon',
  Gift: 'GiftIcon',
  Globe: 'GlobeAltIcon',
  GraduationCap: 'AcademicCapIcon',
  GripVerticalIcon: 'Bars2Icon',
  Handshake: 'HandRaisedIcon',
  Heart: 'HeartIcon',
  HelpCircle: 'QuestionMarkCircleIcon',
  Home: 'HomeIcon',
  Image: 'PhotoIcon',
  Info: 'InformationCircleIcon',
  Layers: 'Square3Stack3DIcon',
  LayoutDashboard: 'Squares2X2Icon',
  Leaf: 'SparklesIcon', // fallback
  Lightbulb: 'LightBulbIcon',
  Loader2: 'ArrowPathIcon',
  Loader2Icon: 'ArrowPathIcon',
  MessageCircle: 'ChatBubbleLeftEllipsisIcon',
  MessageSquare: 'ChatBubbleSquareLeftIcon',
  Mic: 'MicrophoneIcon',
  MinusIcon: 'MinusIcon',
  Monitor: 'ComputerDesktopIcon',
  Moon: 'MoonIcon',
  MoreHorizontal: 'EllipsisHorizontalIcon',
  MoreHorizontalIcon: 'EllipsisHorizontalIcon',
  MoreVertical: 'EllipsisVerticalIcon',
  Music: 'MusicalNoteIcon',
  Navigation: 'MapPinIcon',
  Package: 'InboxIcon',
  Palette: 'SwatchIcon',
  PanelLeft: 'Bars3Icon',
  PanelLeftIcon: 'Bars3Icon',
  Pause: 'PauseIcon',
  Phone: 'PhoneIcon',
  Plane: 'PaperAirplaneIcon',
  Play: 'PlayIcon',
  Plus: 'PlusIcon',
  QrCode: 'QrCodeIcon',
  RefreshCw: 'ArrowPathIcon',
  Repeat: 'ArrowPathRoundedSquareIcon',
  Repeat2: 'ArrowPathRoundedSquareIcon',
  RotateCcw: 'ArrowUturnLeftIcon',
  Scale: 'ScaleIcon',
  ScrollText: 'DocumentTextIcon',
  Search: 'MagnifyingGlassIcon',
  SearchIcon: 'MagnifyingGlassIcon',
  Send: 'PaperAirplaneIcon',
  Settings: 'Cog6ToothIcon',
  Share2: 'ShareIcon',
  Shield: 'ShieldCheckIcon',
  ShieldAlert: 'ShieldExclamationIcon',
  ShieldCheck: 'ShieldCheckIcon',
  ShieldOff: 'ShieldExclamationIcon',
  Shirt: 'ShoppingBagIcon',
  Smartphone: 'DevicePhoneMobileIcon',
  Smile: 'FaceSmileIcon',
  Sofa: 'HomeModernIcon',
  Sparkles: 'SparklesIcon',
  Square: 'StopIcon',
  Star: 'StarIcon',
  Stethoscope: 'HeartIcon',
  Sun: 'SunIcon',
  Tag: 'TagIcon',
  Trash2: 'TrashIcon',
  TrendingUp: 'ArrowTrendingUpIcon',
  Trophy: 'TrophyIcon',
  Upload: 'ArrowUpTrayIcon',
  User: 'UserIcon',
  UserCog: 'UserIcon',
  UserMinus: 'UserMinusIcon',
  UserPlus: 'UserPlusIcon',
  Users: 'UsersIcon',
  Wrench: 'WrenchIcon',
  X: 'XMarkIcon',
  XCircle: 'XCircleIcon',
  XIcon: 'XMarkIcon',
  Zap: 'BoltIcon',
  Activity: 'ChartBarIcon',
};

let imports = `import React from 'react';\n`;
let exportsStr = '';
const usedHeroIcons = new Set();

for (const exportedName of exportedNames) {
  const heroName = heroMap[exportedName] || 'StarIcon';
  usedHeroIcons.add(heroName);
  // We will create a wrapper component to preserve the size prop compatibility since heroicons uses standard className 
  // e.g. <HomeIcon className="w-6 h-6" /> instead of size={24}. But some places in the app use `size={24}` because of lucide/hugeicons.
  exportsStr += `export const ${exportedName} = ({ size, className, ...props }: any) => {
    return <${heroName} className={className} style={{ width: size || 24, height: size || 24 }} {...props} />;
  };\n\n`;
}

// Special cases
exportsStr += `export { PanelLeft as PanelLeftIcon };\n`;
exportsStr += `export { MoreHorizontal as MoreHorizontalIcon };\n`;

const uniqueIcons = Array.from(usedHeroIcons).join(', ');
imports += `import { ${uniqueIcons} } from '@heroicons/react/24/outline';\n\n`;

fs.writeFileSync('client/src/lib/icons.tsx', imports + exportsStr);
console.log('Heroicons generated!');
