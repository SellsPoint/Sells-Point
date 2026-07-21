import { Camera, CheckCircle2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

const benefits = [{ icon: ShieldCheck, title: "Safe & Secure", text: "Report and block controls" }, { icon: MessageCircle, title: "Built-in Chat", text: "Connect without sharing numbers" }, { icon: Camera, title: "Real Listings", text: "Photos and video support" }, { icon: MapPin, title: "Nearby Discovery", text: "Find listings around you" }, { icon: CheckCircle2, title: "Fresh Inventory", text: "Expiry-aware active listings" }];

export default function WhyChoose() {
  return (
    <section className="bg-ink-50 pb-16 pt-10 sm:pb-20 sm:pt-14">
      <div className="home-container border-t border-ink-200/80 pt-10 sm:pt-14">
        <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Why Choose SellsPoint?</h2>
        <div className="mt-9 grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 lg:block">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-sm">
                <Icon aria-hidden="true" size={24} />
              </span>
              <div className="lg:mt-5">
                <h3 className="text-lg font-bold leading-tight text-ink-900">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
