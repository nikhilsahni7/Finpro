import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-emerald to-brand-emerald-dark rounded-xl flex items-center justify-center shadow-lg hover-3d group-hover:animate-glow transition-all duration-300">
              <div className="w-5 h-5 bg-white rounded-sm"></div>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">FINPRO</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-brand-emerald transition-all duration-300 font-medium relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-emerald transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-emerald transition-all duration-300 font-medium relative group">
              Platform
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-emerald transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-emerald transition-all duration-300 font-medium relative group">
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-emerald transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-emerald transition-all duration-300 font-medium relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-emerald transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* CTA Button */}
          <Button variant="hero" size="default" className="hover-3d">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;