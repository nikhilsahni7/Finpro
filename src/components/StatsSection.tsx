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
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <IconComponent className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
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