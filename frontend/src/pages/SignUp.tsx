import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup request logic here
    console.log("Access request submitted:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <div className="w-full px-8 lg:px-16 xl:px-24 py-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              <div className="w-5 h-5 bg-white rounded-sm shadow-sm"></div>
            </div>
            <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors duration-300">
              FINPRO
            </span>
          </Link>
        </div>

        {/* Success Message - Centered */}
        <div className="flex items-center justify-center px-8 lg:px-16 xl:px-24 pb-12">
          <div className="w-full max-w-2xl animate-scale-in">
            <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="text-center space-y-4 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-glow-pulse">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-brand-navy">
                  Request Submitted!
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Your access request has been sent to our admin team
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 text-center">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl p-6 border border-green-200">
                    <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      What happens next?
                    </h3>
                    <ul className="text-sm text-green-700 space-y-2 text-left">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          Our admin team will review your request within 24-48
                          hours
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          You'll receive an email with your account credentials
                          if approved
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          You can then sign in and start using FINPRO
                          immediately
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Reference ID:</span> #
                      {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Save this ID for future reference
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/signin">
                    <Button variant="hero" size="lg" className="w-full group">
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        Go to Sign In
                      </span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>

                  <Link to="/">
                    <Button
                      variant="hero-outline"
                      size="lg"
                      className="w-full group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        Back to Home
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="w-full px-8 lg:px-16 xl:px-24 py-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <div className="w-5 h-5 bg-white rounded-sm shadow-sm"></div>
          </div>
          <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors duration-300">
            FINPRO
          </span>
        </Link>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex items-center justify-center px-8 lg:px-16 xl:px-24 pb-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Welcome Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
                Join FINPRO
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-blue-light">
                  Elite Network
                </span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                Request access to our exclusive platform and join thousands of
                professionals who trust FINPRO for critical data insights.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                <span className="text-muted-foreground">
                  Admin-approved access for verified professionals
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                <span className="text-muted-foreground">
                  Enterprise-grade security and compliance
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                <span className="text-muted-foreground">
                  Instant access upon approval
                </span>
              </div>
            </div>

            {/* Admin Note */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> All access requests
                are manually reviewed by our admin team to ensure platform
                security and quality.
              </p>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="w-full max-w-md mx-auto animate-scale-in">
            <Card className="shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="text-center space-y-4 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-glow-pulse">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-brand-navy">
                  Request Access
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Submit your details to get access to FINPRO
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <Label
                      htmlFor="name"
                      className="text-brand-navy font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                    />
                  </div>

                  {/* Email Field */}
                  <div
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Label
                      htmlFor="email"
                      className="text-brand-navy font-medium flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                    />
                  </div>

                  {/* Phone Field */}
                  <div
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <Label
                      htmlFor="phone"
                      className="text-brand-navy font-medium flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        By submitting this request, you agree to our{" "}
                        <Link
                          to="/terms"
                          className="text-brand-blue hover:text-brand-blue-dark transition-colors duration-300"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-brand-blue hover:text-brand-blue-dark transition-colors duration-300"
                        >
                          Privacy Policy
                        </Link>
                        . Your information will be reviewed by our admin team
                        for approval.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full animate-fade-in group"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      Submit Access Request
                    </span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </form>

                {/* Divider */}
                <div
                  className="relative my-6 animate-fade-in"
                  style={{ animationDelay: "0.6s" }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Sign In Link */}
                <div
                  className="text-center animate-fade-in"
                  style={{ animationDelay: "0.7s" }}
                >
                  <Link to="/signin">
                    <Button
                      variant="hero-outline"
                      size="lg"
                      className="w-full group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        Sign In
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Footer */}
                <div
                  className="text-center pt-6 animate-fade-in"
                  style={{ animationDelay: "0.8s" }}
                >
                  <p className="text-xs text-muted-foreground">
                    Secure and confidential registration process
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
