import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-analytics.jpg";

const HeroSection = () => {
  return (
    <section className="w-full bg-background py-12 lg:py-16 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-16 left-8 w-16 h-16 bg-brand-blue/5 rounded-full"></div>
      <div className="absolute top-32 right-16 w-24 h-24 bg-brand-blue/3 rounded-full"></div>
      <div className="absolute bottom-16 left-1/4 w-12 h-12 bg-brand-blue/5 rounded-full"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Content */}
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-brand-navy">
                Unlock Critical Insights
                <br />
                <span className="text-brand-blue">
                  From 40 Million+
                </span>
                <br />
                Records, Instantly
              </h1>
              <p className="text-brand-blue font-semibold text-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
                Designed for the Modern Professional
              </p>
              <p className="text-muted-foreground text-base leading-relaxed max-w-xl animate-fade-in" style={{animationDelay: '0.4s'}}>
                FINPRO delivers unparalleled access and precision across massive 
                datasets. Eight-second searching to find exactly what you need, faster.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button variant="hero" size="default" className="hover-3d group font-medium">
                <span className="group-hover:scale-105 transition-transform duration-200">Start Searching Now</span>
              </Button>
              <Button variant="hero-outline" size="default" className="hover-3d font-medium">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in" style={{animationDelay: '0.8s'}}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover-3d group">
              <img
                src={heroImage}
                alt="Professional team analyzing data on dashboard"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {/* Floating data card overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="text-brand-navy text-sm font-semibold">Live Analytics</div>
                <div className="text-brand-blue text-xs font-mono">↗ 24% increase</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;