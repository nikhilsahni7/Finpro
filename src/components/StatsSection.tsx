import { Search, Settings, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Search,
      value: "40M+",
      label: "Records Available",
      bgColor: "bg-brand-navy",
      iconColor: "text-white",
    },
    {
      icon: Settings,
      value: "12+",
      label: "Advanced Filters",
      bgColor: "bg-brand-blue",
      iconColor: "text-white",
    },
    {
      icon: Clock,
      value: "< 50ms",
      label: "Average Response Time",
      bgColor: "bg-brand-blue-dark",
      iconColor: "text-white",
    },
  ];

  return (
    <section className="w-full py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover-3d group animate-slide-up`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 relative">
                    <div className="bg-white/20 rounded-xl p-3">
                      <IconComponent className={`w-6 h-6 ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold transition-transform duration-300 group-hover:scale-105">{stat.value}</div>
                    <div className="text-white/90 font-medium">{stat.label}</div>
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