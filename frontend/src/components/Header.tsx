import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 animate-fade-in">
      <div className="w-full max-w-none px-8 lg:px-16 xl:px-24 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <div className="w-5 h-5 bg-white rounded-sm shadow-sm"></div>
            </div>
            <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors duration-300">
              FINPRO
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-brand-navy hover:text-brand-blue transition-all duration-300 font-medium text-base relative group py-2"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-blue-light transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-brand-blue transition-all duration-300 font-medium text-base relative group py-2"
            >
              Platform
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-blue-light transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-brand-blue transition-all duration-300 font-medium text-base relative group py-2"
            >
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-blue-light transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-brand-blue transition-all duration-300 font-medium text-base relative group py-2"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-blue-light transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          </nav>

          {/* CTA Button */}
          <Link to="/signin">
            <Button
              variant="hero"
              size="default"
              className="hover-3d text-base px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
            >
              <span className="font-semibold">Get Started</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
