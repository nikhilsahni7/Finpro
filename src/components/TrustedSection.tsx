const TrustedSection = () => {
  const companies = [
    { name: "DataPro", logo: "DP" },
    { name: "Global Analytics", logo: "GA" },
    { name: "TechCorp", logo: "TC" },
    { name: "InnovateLab", logo: "IL" },
    { name: "SmartData", logo: "SD" },
  ];

  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold text-foreground">
            Trusted by Industry Leaders
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-10 h-10 bg-brand-emerald/10 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-brand-emerald text-sm">{company.logo}</span>
                </div>
                <span className="font-semibold text-sm">{company.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 bg-brand-emerald rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>© 2024 DataPro. Enterprise grade search for professionals.</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedSection;