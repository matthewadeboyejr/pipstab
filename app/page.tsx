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
      </section>
    </>
  );
}

