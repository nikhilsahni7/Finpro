import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-analytics.jpg";

const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-32 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-brand-emerald/10 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-brand-emerald/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-brand-emerald/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground">
                Unlock Critical Insights
                <br />
                <span className="text-transparent bg-gradient-to-r from-brand-emerald via-brand-emerald-light to-brand-emerald bg-clip-text animate-glow">
                  From 40 Million+
                </span>
                <br />
                Records, Instantly
              </h1>
              <p className="text-brand-emerald font-semibold text-xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                Designed for the Modern Professional
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl animate-fade-in" style={{animationDelay: '0.4s'}}>
                FINPRO delivers unparalleled access and precision across massive 
                datasets. Eight-second searching, and executives to find exactly what 
                your need, faster.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button variant="hero" size="lg" className="text-base hover-3d group">
                <span className="group-hover:scale-105 transition-transform duration-200">Start Searching Now</span>
              </Button>
              <Button variant="hero-outline" size="lg" className="text-base hover-3d">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in" style={{animationDelay: '0.8s'}}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl hover-3d group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              <img
                src={heroImage}
                alt="Professional team analyzing data on dashboard"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Floating data cards overlay */}
              <div className="absolute top-6 right-6 glass-card rounded-lg p-3 animate-float z-20">
                <div className="text-white text-sm font-semibold">Live Analytics</div>
                <div className="text-brand-emerald-light text-xs">↗ 24% increase</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;