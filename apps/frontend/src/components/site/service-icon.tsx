import {
  Cloud,
  Code2,
  Database,
  Globe,
  Layers,
  type LucideIcon,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  globe: Globe,
  layers: Layers,
  users: Users,
  sparkles: Sparkles,
  server: Server,
  cloud: Cloud,
  code: Code2,
  database: Database,
  smartphone: Smartphone,
  shield: ShieldCheck,
  zap: Zap,
};

export const SERVICE_ICON_NAMES = Object.keys(icons);

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
