import { Link, MessageSquare, PenLine } from "lucide-react";

const steps = [
  { icon: PenLine, title: "1. Post Your Ad", text: "List your item in seconds for free." },
  { icon: MessageSquare, title: "2. Connect", text: "Interested buyers will reach out to you." },
  { icon: Link, title: "3. Complete the Deal", text: "Close the deal safely and easily." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink-50 pb-10 pt-16 sm:pt-20">
      <div className="home-container relative grid items-end gap-10 lg:min-h-[370px] lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <div className="pb-2">
          <h2 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">How SellsPoint Works</h2>
          <div className="relative mt-8 grid gap-8 sm:grid-cols-3 sm:gap-7">
            <div className="pointer-events-none absolute left-10 right-10 top-9 hidden border-t-2 border-dotted border-brand-300 sm:block" />
            {steps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="relative">
                <span className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-brand-500 text-white shadow-glow ring-4 ring-ink-50">
                  <Icon size={29} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-2 max-w-[15rem] text-base leading-relaxed text-ink-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none mx-auto w-full max-w-[340px] self-end lg:max-w-[400px]">
          <img
            src="/assets/home/how-it-works.webp"
            alt="Person using SellsPoint on a phone"
            className="aspect-square w-full object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
