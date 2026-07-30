import { Header } from "@/components/pentariva/Header";
import { Footer } from "@/components/pentariva/Footer";
import { Hero } from "@/components/pentariva/Hero";
import { PathSection } from "@/components/pentariva/PathSection";
import { ProductCarousel } from "@/components/pentariva/ProductCarousel";
import { ExperienceSection } from "@/components/pentariva/ExperienceSection";
import { BrandManifestoSection } from "@/components/pentariva/BrandManifestoSection";

const TITLE = "PENTARIVA — Evropský ekosystém přirozené vitality";
const DESCRIPTION =
  "Spojujeme tradiční bylinné receptury, moderní vývoj, digitální technologie a evropskou partnerskou komunitu do jednoho živého ekosystému péče o člověka.";


export default function Home() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <Header />
      <main>
        <Hero />
        <PathSection />
        <ProductCarousel />
        <ExperienceSection />
        <BrandManifestoSection />
      </main>
      <Footer />
    </div>
  );
}
