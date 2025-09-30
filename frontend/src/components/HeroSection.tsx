import heroImage from "@/assets/Data extraction-rafiki (1).png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="w-full bg-gradient-to-br from-background via-muted/30 to-background pt-2 pb-6 lg:pt-4 lg:pb-8 relative overflow-hidden">
      <div className="w-full max-w-none px-8 lg:px-16 xl:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          {/* Content */}
          <div className="space-y-6 animate-slide-up-fast opacity-0 [animation-delay:100ms]">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-brand-navy">
                Unlock Critical Insights
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-blue-light">
                  From 40 Million+
                </span>
                <br />
                Records, Instantly
              </h1>
              <p className="text-brand-blue font-semibold text-lg lg:text-xl animate-fade-in-fast opacity-0 [animation-delay:200ms]">
                Designed for the Modern Professional
              </p>
              <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-xl animate-fade-in-fast opacity-0 [animation-delay:300ms]">
                FINPRO delivers unparalleled access and precision across massive
                datasets. Eight-second searching to find exactly what you need,
                faster.
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-fast opacity-0 [animation-delay:400ms]">
              <Link to="/user/dashboard">
                <Button
                  variant="hero"
                  size="lg"
                  className="group font-medium text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue-dark hover:to-brand-blue"
                >
                  <span className="transition-transform duration-200 group-hover:scale-105">
                    Start Searching Now
                  </span>
                  <svg
                    className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
              <Button
                variant="hero-outline"
                size="lg"
                className="group font-medium text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2"
              >
                <svg
                  className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1"
                  />
                </svg>
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in-fast opacity-0 [animation-delay:200ms]">
            <div className="relative group">
              <img
                src={heroImage}
                alt="Data extraction and analytics professional working with dashboards"
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] drop-shadow-2xl"
              />

              {/* Data Extraction overlay */}
              <div className="absolute top-[15%] right-[8%] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20 animate-gentle-float">
                <div className="text-brand-navy text-sm font-semibold">
                  Data Extraction
                </div>
                <div className="text-brand-blue text-xs font-mono flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Active Process
                </div>
              </div>

              {/* Real-time Analytics overlay */}
              <div className="absolute bottom-[12%] right-[15%] bg-brand-blue/90 backdrop-blur-md rounded-xl p-3 shadow-xl text-white animate-subtle-pulse">
                <div className="text-xs font-medium opacity-90">
                  Real-time Analytics
                </div>
                <div className="text-sm font-bold">40M+ Records</div>
              </div>

              {/* Live Data Streaming overlay */}
              <div className="absolute top-[35%] left-[12%] bg-green-500/90 backdrop-blur-md rounded-lg p-2 shadow-lg text-white animate-gentle-float [animation-delay:1s]">
                <div className="text-xs font-medium">Live Data</div>
                <div className="text-xs font-mono">Streaming</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
