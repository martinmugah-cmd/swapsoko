import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';

export const AlertCircle = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ExclamationCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ArrowLeft = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowLeftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ArrowRight = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowRightIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Bell = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BellIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Bookmark = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BookmarkIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const BookOpen = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BookOpenIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Calendar = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CalendarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Camera = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CameraIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Check = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CheckIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CheckIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CheckIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChefHat = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CakeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CircleIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PlusCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Clock = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ClockIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Code = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CodeBracketIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Coins = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CircleStackIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Compass = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MapIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Cpu = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CpuChipIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Download = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowDownTrayIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Dumbbell = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['SparklesIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Film = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['FilmIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Filter = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['AdjustmentsHorizontalIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Flag = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['FlagIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Gift = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['GiftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Heart = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['HeartIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Home = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['HomeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Image = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PhotoIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Info = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['InformationCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Layers = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['Square3Stack3DIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Leaf = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['SparklesIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Lock = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['StarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const LogOut = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['StarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Mail = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['StarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const MapPin = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['StarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const MinusIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MinusIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const MoreHorizontal = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['EllipsisHorizontalIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const MoreVertical = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['EllipsisVerticalIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Music = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MusicalNoteIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Navigation = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MapPinIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Package = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['InboxIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const PanelLeft = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['Bars3Icon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Pause = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PauseIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Plane = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PaperAirplaneIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Play = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PlayIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Plus = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PlusIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const QrCode = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['QrCodeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Repeat = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowPathRoundedSquareIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Search = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MagnifyingGlassIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const SearchIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MagnifyingGlassIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Send = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PaperAirplaneIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Settings = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['Cog6ToothIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Shield = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ShieldCheckIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Shirt = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ShoppingBagIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Smartphone = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['DevicePhoneMobileIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Sofa = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['HomeModernIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Sparkles = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['SparklesIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Square = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['StopIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Star = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['StarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Stethoscope = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['HeartIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Tag = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['TagIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const User = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['UserIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const UserMinus = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['UserMinusIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Users = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['UsersIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Wrench = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['WrenchIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const X = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['XMarkIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const XCircle = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['XCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const XIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['XMarkIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Zap = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BoltIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Box = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CubeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Activity = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChartBarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ArrowUpRight = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowUpRightIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Mic = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MicrophoneIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Upload = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowUpTrayIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Phone = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PhoneIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Smile = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['FaceSmileIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Moon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['MoonIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Sun = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['SunIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Eye = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['EyeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Bot = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CpuChipIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const HelpCircle = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['QuestionMarkCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Globe = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['GlobeAltIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Scale = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ScaleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Award = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['TrophyIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Edit = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PencilSquareIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const AlertTriangle = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ExclamationTriangleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ArrowRightLeft = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowsRightLeftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Banknote = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BanknotesIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const BellOff = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BellSlashIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CheckCircle = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CheckCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CheckCircle2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CheckCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CheckSquare = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CheckIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronDown = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronDownIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronDownIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronDownIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronLeft = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronLeftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronLeftIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronLeftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronRight = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronRightIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronRightIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronRightIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ChevronUpIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChevronUpIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ClipboardList = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ClipboardDocumentListIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Crosshair = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ViewfinderCircleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Edit2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PencilIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const FileText = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['DocumentTextIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Flame = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['FireIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Gamepad2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['PlayIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Gavel = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ScaleIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const GraduationCap = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['AcademicCapIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const GripVerticalIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['Bars2Icon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const LayoutDashboard = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['Squares2X2Icon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Lightbulb = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['LightBulbIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Loader2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowPathIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Loader2Icon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowPathIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const MessageCircle = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChatBubbleLeftEllipsisIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const MessageSquare = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChatBubbleLeftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Monitor = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ComputerDesktopIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Palette = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['SwatchIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const RefreshCw = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowPathIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Repeat2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowPathRoundedSquareIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const RotateCcw = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowUturnLeftIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Share2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ShareIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ShieldAlert = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ShieldExclamationIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ShieldCheck = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ShieldCheckIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ShieldOff = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ShieldExclamationIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Trash2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['TrashIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Trophy = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['TrophyIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Building2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['BuildingOfficeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const BarChart2 = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ChartBarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const ScrollText = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['DocumentTextIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const UserCog = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['UserIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CheckCheck = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CheckBadgeIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const Handshake = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['HandRaisedIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const CalendarIcon = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['CalendarIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const EyeOff = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['EyeSlashIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const UserPlus = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['UserPlusIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export const TrendingUp = ({ size, className, strokeWidth, ...props }: any) => {
    const Icon = (HeroIcons as any)['ArrowTrendingUpIcon'];
    if (!Icon) return <HeroIcons.StarIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
    return <Icon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />;
  };

export { PanelLeft as PanelLeftIcon };
export { MoreHorizontal as MoreHorizontalIcon };
export const Copy = ({ size, className, strokeWidth, ...props }: any) => { return <HeroIcons.DocumentDuplicateIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />; };
export const Store = ({ size, className, strokeWidth, ...props }: any) => { return <HeroIcons.BuildingStorefrontIcon className={className} style={{ width: size || 24, height: size || 24, strokeWidth: strokeWidth || 1.5 }} {...props} />; };
