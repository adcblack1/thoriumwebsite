import { SubscribeForm } from './subscribe-form';

export function SubscribeCTA() {
  return (
    <section id="subscribe" className="bg-[#ffffff] py-24 border-t border-[#1b1b1b]/20">
      <div className="max-w-[1280px] mx-auto px-4 text-center">
        <h2 className="font-times text-4xl lg:text-5xl font-bold text-[#1b1b1b] mb-6" style={{ letterSpacing: '-0.04em' }}>
          AI Is <em className="italic" style={{ color: '#5170ff' }}>Eating</em> the World
        </h2>
        <p className="text-[#1b1b1b]/70 mb-8 max-w-lg mx-auto text-lg">
          Join thousands of readers getting the essential AI briefing every day. Free forever.
        </p>
        <SubscribeForm variant="navbar" className="max-w-md mx-auto" />
      </div>
    </section>
  );
}
