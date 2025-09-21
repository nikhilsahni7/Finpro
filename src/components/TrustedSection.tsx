const TrustedSection = () => {
  const companies = [
    { name: "FINPRO", logo: "FP" },
    { name: "Global Analytics", logo: "GA" },
    { name: "DataCorp", logo: "DC" },
    { name: "IntelliRisk", logo: "IR" },
    { name: "SmartMetrics", logo: "SM" },
  ];

  return (
    <section className="w-full py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-brand-navy">
            Trusted by Industry Leaders
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {companies.map((company, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-muted-foreground hover:text-brand-navy transition-all duration-300 group animate-scale-in hover-3d"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center group-hover:bg-brand-blue/20 transition-all duration-300 shadow-sm">
                  <span className="font-bold text-brand-blue text-sm group-hover:scale-110 transition-transform duration-300">{company.logo}</span>
                </div>
                <span className="font-semibold text-sm group-hover:text-brand-blue transition-colors duration-300">{company.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="w-4 h-4 bg-brand-blue rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>
            <span>© 2024 FINPRO. Enterprise grade search for professionals.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedSection;