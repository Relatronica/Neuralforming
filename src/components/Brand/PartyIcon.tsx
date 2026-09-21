import {
  Landmark,
  Shield,
  Star,
  Flame,
  Zap,
  Crown,
  Globe,
  Flashlight,
  Bot,
  User,
  type LucideIcon,
} from 'lucide-react';

const PARTY_ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  shield: Shield,
  star: Star,
  flame: Flame,
  lightning: Zap,
  crown: Crown,
  globe: Globe,
  torch: Flashlight,
};

export function PartyIcon({
  icon,
  isAI = false,
  className = 'w-4 h-4',
}: {
  icon?: string;
  isAI?: boolean;
  className?: string;
}) {
  if (isAI) return <Bot className={className} />;
  const Icon = (icon && PARTY_ICONS[icon]) || User;
  return <Icon className={className} />;
}
