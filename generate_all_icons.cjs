const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const exportedNames = fs.readFileSync('exported_icons.txt', 'utf8').trim().split('\n');

const svgFiles = execSync('find "client/public/doodle_icons/doodle icons/SVG" -type f -name "*.svg"').toString().trim().split('\n');

const nameMapping = {
  AlertCircle: 'caution',
  AlertTriangle: 'caution',
  ArrowLeft: 'arrow-left',
  ArrowRight: 'arrow-right',
  ArrowRightLeft: 'arrow-right-left',
  ArrowUpRight: 'arrow-up-right',
  Award: 'trophy',
  Banknote: 'cash',
  BarChart2: 'analytics',
  Bell: 'bell',
  BellOff: 'bell',
  Bookmark: 'bookmark',
  BookOpen: 'book',
  Bot: 'bot',
  Box: 'box',
  Building2: 'building',
  Calendar: 'calendar',
  CalendarIcon: 'calendar',
  Camera: 'camera',
  Check: 'tick',
  CheckCheck: 'tick-2',
  CheckCircle: 'tick',
  CheckCircle2: 'tick-2',
  CheckIcon: 'tick',
  CheckSquare: 'tick',
  ChefHat: 'chef',
  ChevronDown: 'arrow-down',
  ChevronDownIcon: 'arrow-down',
  ChevronLeft: 'arrow-left',
  ChevronLeftIcon: 'arrow-left',
  ChevronRight: 'arrow-right',
  ChevronRightIcon: 'arrow-right',
  ChevronUpIcon: 'arrow-up',
  CircleIcon: 'circle',
  ClipboardList: 'list',
  Clock: 'clock',
  Code: 'code',
  Coins: 'coin',
  Compass: 'compass',
  Cpu: 'chip',
  Crosshair: 'target',
  Download: 'download',
  Dumbbell: 'gym',
  Edit: 'edit',
  Edit2: 'pencil',
  Eye: 'eye',
  EyeOff: 'hide',
  FileText: 'doc',
  Film: 'video',
  Filter: 'filter',
  Flame: 'fire',
  Flag: 'flag',
  Gamepad2: 'game',
  Gavel: 'hammer',
  Gift: 'gift',
  Globe: 'globe',
  GraduationCap: 'education',
  GripVerticalIcon: 'drag',
  Handshake: 'handshake',
  Heart: 'heart',
  HelpCircle: 'question',
  Home: 'home',
  Image: 'photo',
  Info: 'info',
  Layers: 'layer',
  LayoutDashboard: 'dashboard',
  Leaf: 'leaf',
  Lightbulb: 'bulb',
  Loader2: 'sync',
  Loader2Icon: 'sync',
  Lock: 'lock',
  LogOut: 'logout',
  Mail: 'mail',
  MapPin: 'location-pin',
  MessageCircle: 'message',
  MessageSquare: 'message-2',
  Mic: 'mic',
  MinusIcon: 'minus',
  Monitor: 'desktop',
  Moon: 'moon',
  MoreHorizontal: 'menu',
  MoreHorizontalIcon: 'menu',
  MoreVertical: 'menu-2',
  Music: 'music',
  Navigation: 'navigation',
  Package: 'box',
  Palette: 'paint',
  PanelLeft: 'menu',
  PanelLeftIcon: 'menu',
  Pause: 'pause',
  Phone: 'phone',
  Plane: 'plane',
  Play: 'play',
  Plus: 'add',
  QrCode: 'qr',
  RefreshCw: 'sync',
  Repeat: 'sync',
  Repeat2: 'sync',
  RotateCcw: 'sync',
  Scale: 'scale',
  ScrollText: 'doc',
  Search: 'search',
  SearchIcon: 'search',
  Send: 'send',
  Settings: 'setting',
  Share2: 'share',
  Shield: 'shield',
  ShieldAlert: 'shield',
  ShieldCheck: 'shield',
  ShieldOff: 'shield',
  Shirt: 'clothes',
  Smartphone: 'phone',
  Smile: 'smile',
  Sofa: 'sofa',
  Sparkles: 'star',
  Square: 'square',
  Star: 'star',
  Stethoscope: 'health',
  Sun: 'sun',
  Tag: 'tag',
  Trash2: 'delete',
  TrendingUp: 'analytics',
  Trophy: 'trophy',
  Upload: 'upload',
  User: 'user',
  UserCog: 'user-setting',
  UserMinus: 'user-remove',
  UserPlus: 'user-add',
  Users: 'user',
  Wrench: 'tool',
  X: 'cross',
  XCircle: 'cross',
  XIcon: 'cross',
  Zap: 'zap',
  Activity: 'analytics',
};

// Simple search for best match if not in map
function findSvg(name) {
  let searchWord = name.toLowerCase().replace(/icon$/, '').replace(/circle$/, '').replace(/[0-9]+$/, '');
  
  if (nameMapping[name]) {
     const explicitMatch = svgFiles.find(f => path.basename(f, '.svg').toLowerCase() === nameMapping[name].toLowerCase());
     if (explicitMatch) return explicitMatch;
     // partial match
     const partialMatch = svgFiles.find(f => path.basename(f).toLowerCase().includes(nameMapping[name].toLowerCase()));
     if (partialMatch) return partialMatch;
  }
  
  const exactMatch = svgFiles.find(f => path.basename(f, '.svg').toLowerCase() === searchWord);
  if (exactMatch) return exactMatch;
  const partial = svgFiles.find(f => path.basename(f).toLowerCase().includes(searchWord));
  if (partial) return partial;
  
  return svgFiles.find(f => path.basename(f) === 'star.svg'); // fallback
}

let output = `import React from 'react';\n\n`;

const processedNames = new Set();
for (const exportedName of exportedNames) {
  if (processedNames.has(exportedName)) continue;
  processedNames.add(exportedName);
  
  const svgPath = findSvg(exportedName);
  let svg = fs.readFileSync(svgPath, 'utf8');
  
  // Transform SVG
  svg = svg.replace(/<svg([^>]+)>/, '<svg$1 {...props}>');
  // Add React attributes
  svg = svg.replace(/fill="black"/g, 'fill="currentColor"');
  svg = svg.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="currentColor"');
  svg = svg.replace(/stroke="black"/g, 'stroke="currentColor"');
  
  // Convert standard SVG attributes to React camelCase
  svg = svg.replace(/clip-path/g, 'clipPath');
  svg = svg.replace(/fill-rule/g, 'fillRule');
  svg = svg.replace(/stroke-width/g, 'strokeWidth');
  svg = svg.replace(/stroke-linecap/g, 'strokeLinecap');
  svg = svg.replace(/stroke-linejoin/g, 'strokeLinejoin');
  svg = svg.replace(/stroke-miterlimit/g, 'strokeMiterlimit');
  svg = svg.replace(/stroke-dasharray/g, 'strokeDasharray');
  svg = svg.replace(/stroke-dashoffset/g, 'strokeDashoffset');
  svg = svg.replace(/xml:space/g, 'xmlSpace');
  svg = svg.replace(/xlink:href/g, 'xlinkHref');
  svg = svg.replace(/xmlns:xlink/g, 'xmlnsXlink');
  svg = svg.replace(/class=/g, 'className=');

  output += `export const ${exportedName} = (props: React.SVGProps<SVGSVGElement>) => (\n  ${svg}\n);\n\n`;
}

// Special case for PanelLeftIcon which is exported as { PanelLeftIcon } sometimes
output += `export { PanelLeft as PanelLeftIcon };\n`;
output += `export { MoreHorizontal as MoreHorizontalIcon };\n`;

fs.writeFileSync('client/src/lib/icons.tsx', output);
console.log('Icons generation complete!');
