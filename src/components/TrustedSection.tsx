const TrustedSection = () => {
  const companies = [
    { name: "FINPRO", logo: "FP" },
    { name: "Global Analytics", logo: "GA" },
    { name: "DataCorp", logo: "DC" },
    { name: "IntelliRisk", logo: "IR" },
    { name: "SmartMetrics", logo: "SM" },
  ];

  return (
    <section className="w-full py-20 bg-gradient-to-t from-muted/20 to-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--brand-emerald))_1px,_transparent_0)] bg-[length:50px_50px]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground">
            Trusted by Industry Leaders
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-16">
            {companies.map((company, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-500 group animate-scale-in hover-3d"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-emerald/10 to-brand-emerald/20 rounded-xl flex items-center justify-center group-hover:from-brand-emerald/20 group-hover:to-brand-emerald/30 transition-all duration-300 shadow-lg">
                  <span className="font-bold text-brand-emerald text-sm group-hover:scale-110 transition-transform duration-300">{company.logo}</span>
                </div>
                <span className="font-semibold text-lg group-hover:text-brand-emerald transition-colors duration-300">{company.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '0.8s'}}>
            <div className="w-5 h-5 bg-gradient-to-br from-brand-emerald to-brand-emerald-dark rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>© 2024 FINPRO. Enterprise grade search for professionals.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedSection;