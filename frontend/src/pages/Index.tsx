import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/TrustedSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <Header />
      <main className="w-full -mt-4">
        <HeroSection />
        <StatsSection />
        <PricingSection />
      </main>
    </div>
  );
};

export default Index;
