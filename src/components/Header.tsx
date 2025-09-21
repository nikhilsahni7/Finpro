import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border/40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-emerald rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-foreground">DataPro</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-brand-emerald transition-colors">
              Home
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-emerald transition-colors">
              Platform
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-emerald transition-colors">
              Solutions
            </a>
            <a href="#" className="text-muted-foreground hover:text-brand-emerald transition-colors">
              Pricing
            </a>
          </nav>

          {/* CTA Button */}
          <Button variant="hero" size="default">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;