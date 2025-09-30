import { Clock, Search, Settings } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Search,
      value: "40M+",
      label: "Records Available",
      bgColor: "bg-gradient-to-br from-brand-navy to-brand-navy/80",
      iconColor: "text-white",
      delay: "0ms",
    },
    {
      icon: Settings,
      value: "12+",
      label: "Advanced Filters",
      bgColor: "bg-gradient-to-br from-brand-blue to-brand-blue-dark",
      iconColor: "text-white",
      delay: "100ms",
    },
    {
      icon: Clock,
      value: "< 50ms",
      label: "Average Response Time",
      bgColor: "bg-gradient-to-br from-brand-blue-dark to-brand-navy",
      iconColor: "text-white",
      delay: "200ms",
    },
  ];

  return (
    <section className="w-full py-12 lg:py-16 bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20">
      <div className="w-full max-w-none px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-200 group opacity-0 animate-slide-up-fast border border-white/10`}
                style={{ animationDelay: stat.delay }}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 relative">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg transition-all duration-200 group-hover:bg-white/30">
                      <IconComponent
                        className={`w-8 h-8 ${stat.iconColor} transition-transform duration-200 group-hover:scale-110`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl lg:text-5xl font-bold transition-transform duration-200 group-hover:scale-105 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                      {stat.value}
                    </div>
                    <div className="text-white/90 font-medium text-lg">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
