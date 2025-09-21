import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-analytics.jpg";

const HeroSection = () => {
  return (
    <section className="w-full bg-background py-16 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
                Unlock Critical Insights
                <br />
                <span className="text-brand-emerald">From 40 Million+</span>
                <br />
                Records, Instantly
              </h1>
              <p className="text-brand-emerald font-semibold text-lg">
                Designed for the Modern Professional
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                DataPro delivers unparalleled access and precision across massive 
                datasets. Eight-second searching, and executives to find exactly what 
                your need, faster.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-base">
                Start Searching Now
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Professional team analyzing data on dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;