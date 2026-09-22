const fs = require('fs');

const exportedNames = fs.readFileSync('exported_icons.txt', 'utf8').trim().split('\n');

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
  MessageSquare: 'ChatBubbleLeftIcon', // fixed from ChatBubbleSquareLeftIcon
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
imports += `import * as HeroIcons from '@heroicons/react/24/outline';\n\n`;
let exportsStr = '';

for (const exportedName of exportedNames) {
  const heroName = heroMap[exportedName] || 'StarIcon';
  exportsStr += `export const ${exportedName} = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['${heroName}'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };\n\n`;
}

exportsStr += `export { PanelLeft as PanelLeftIcon };\n`;
exportsStr += `export { MoreHorizontal as MoreHorizontalIcon };\n`;

// Add Copy and Store
exportsStr += `export const Copy = ({ size, className, strokeWidth, ...props }: any) => { return <HeroIcons.DocumentDuplicateIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />; };\n`;
exportsStr += `export const Store = ({ size, className, strokeWidth, ...props }: any) => { return <HeroIcons.BuildingStorefrontIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />; };\n`;

fs.writeFileSync('client/src/lib/icons.tsx', imports + exportsStr);
console.log('Heroicons namespace fixed!');
