import Hero from "@/components/website/Hero";
import PublicNav from "@/components/navigation/PublicNav";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PipTab",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "description": "The cognitive operating system for disciplined traders. Stop gambling, start journaling.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative backdrop-blur-[10px] z-0 min-h-screen bg-background dark:bg-[radial-gradient(36.88%_36.88%_at_50.04%_55.95%,_#111113_0%,_rgba(17,17,19,0)_100%),_url('/website/hbg.svg')] bg-center bg-cover bg-no-repeat">
        <div className="flex flex-col justify-center items-center pt-0 md:pt-5">
          <PublicNav />
        </div>
        <Hero />

        {/* Public Homepage Footer with Structured Internal Sitelinks */}
        <footer className="py-12 border-t border-border/40 bg-card/30 mt-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base font-['Montserrat']">
                PIPSTAB<span className="text-accent">.</span>
              </span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                Cognitive Operating System for Disciplined Traders
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground font-['Montserrat']">
              <a href="/calculator" className="hover:text-foreground hover:text-accent transition-colors">
                Forex Calculator
              </a>
              <a href="/calendar" className="hover:text-foreground hover:text-accent transition-colors">
                Economic Calendar
              </a>
              <a href="/outlooks" className="hover:text-foreground hover:text-accent transition-colors">
                Market Outlooks
              </a>
              <a href="/early-access" className="hover:text-foreground hover:text-accent transition-colors">
                Early Access Beta
              </a>
              <a
                href="https://t.me/pipstab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1 font-bold"
              >
                Telegram: @pipstab
              </a>
              <a href="/auth/sign-in" className="hover:text-foreground hover:text-accent transition-colors">
                Log In
              </a>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}

