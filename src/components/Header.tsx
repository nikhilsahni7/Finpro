import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center shadow-sm hover-3d group-hover:shadow-md transition-all duration-300">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-brand-navy tracking-tight">FINPRO</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-brand-navy hover:text-brand-blue transition-all duration-300 font-medium text-sm relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-blue transition-all duration-300 font-medium text-sm relative group">
              Platform
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-blue transition-all duration-300 font-medium text-sm relative group">
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-blue transition-all duration-300 font-medium text-sm relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* CTA Button */}
          <Button variant="hero" size="sm" className="hover-3d text-sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;