import { Search, Settings, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Search,
      value: "40M+",
      label: "Records Available",
      bgColor: "bg-stat-dark",
      iconColor: "text-white",
    },
    {
      icon: Settings,
      value: "12+",
      label: "Advanced Filters",
      bgColor: "bg-stat-blue",
      iconColor: "text-white",
    },
    {
      icon: Clock,
      value: "< 50ms",
      label: "Average Response Time",
      bgColor: "bg-stat-green",
      iconColor: "text-white",
    },
  ];

  return (
    <section className="w-full py-20 bg-gradient-to-b from-background to-muted/10 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover-3d group animate-slide-up`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                    <div className="relative bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                      <IconComponent className={`w-8 h-8 ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold mb-2 transition-transform duration-300 group-hover:scale-105">{stat.value}</div>
                    <div className="text-white/90 font-medium text-lg">{stat.label}</div>
                  </div>
                </div>
                
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;