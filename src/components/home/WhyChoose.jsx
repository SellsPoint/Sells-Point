import { Camera, CheckCircle2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

const benefits = [{ icon: ShieldCheck, title: "Safe & Secure", text: "Report and block controls" }, { icon: MessageCircle, title: "Built-in Chat", text: "Connect without sharing numbers" }, { icon: Camera, title: "Real Listings", text: "Photos and video support" }, { icon: MapPin, title: "Nearby Discovery", text: "Find listings around you" }, { icon: CheckCircle2, title: "Fresh Inventory", text: "Expiry-aware active listings" }];

export default function WhyChoose() {
  return <section className="bg-ink-50 pb-12 pt-6 sm:pb-14"><div className="home-container"><h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">Why Choose SellsPoint?</h2><div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm"><Icon size={17} /></span><div><h3 className="text-sm font-bold leading-tight text-ink-900">{title}</h3><p className="mt-1 text-xs leading-relaxed text-ink-500">{text}</p></div></div>)}</div></div></section>;
}
