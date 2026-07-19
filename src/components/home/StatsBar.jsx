import { MapPin, Package, ShieldCheck, Users } from "lucide-react";

const stats = [{ value: "50K+", label: "Active Listings", icon: Package }, { value: "10K+", label: "Happy Sellers", icon: Users }, { value: "100+", label: "Cities Covered", icon: MapPin }, { value: "Safe & Secure", label: "Trusted Marketplace", icon: ShieldCheck }];

export default function StatsBar() {
  return <section className="cta-gradient text-white"><div className="home-container grid grid-cols-2 divide-x divide-y divide-white/15 sm:grid-cols-4 sm:divide-y-0">{stats.map(({ value, label, icon: Icon }) => <div key={value} className="flex items-center justify-center gap-3 px-4 py-7 sm:py-9"><Icon size={24} className="shrink-0 text-brand-100" /><div><p className="font-display text-xl font-extrabold sm:text-2xl">{value}</p><p className="text-xs text-white/75">{label}</p></div></div>)}</div></section>;
}
