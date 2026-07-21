import { Camera, CheckCircle2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

const benefits = [{ icon: ShieldCheck, title: "Safe & Secure", text: "Report and block controls" }, { icon: MessageCircle, title: "Built-in Chat", text: "Connect without sharing numbers" }, { icon: Camera, title: "Real Listings", text: "Photos and video support" }, { icon: MapPin, title: "Nearby Discovery", text: "Find listings around you" }, { icon: CheckCircle2, title: "Fresh Inventory", text: "Expiry-aware active listings" }];

export default function WhyChoose() {
  return <section className="bg-ink-50 pb-18 pt-10 sm:pb-20"><div className="home-container"><h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Why Choose SellsPoint?</h2><div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-5">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm"><Icon size={24} /></span><div><h3 className="text-lg font-bold leading-tight text-ink-900">{title}</h3><p className="mt-2 text-base leading-relaxed text-ink-500">{text}</p></div></div>)}</div></div></section>;
}
