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
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Simple captcha generation (for demo purposes)
  const [captcha] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  });

  const { setUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (formData.captcha !== captcha) {
        setError("Invalid security code");
        return;
      }
      const data = await login(formData.email, formData.password);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      localStorage.setItem("auth_expires", data.expiresAt);
      setUser(data.user);
      navigate("/user/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // If backend returned device limit with sessions
      if (err?.status === 409 && err?.data?.sessions?.length) {
        navigate("/device-conflict", {
          state: {
            email: formData.email,
            password: formData.password,
            sessions: err.data.sessions,
          },
        });
        return;
      }
      setError(err?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 py-5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <div className="w-5 h-5 bg-white rounded-sm shadow-sm"></div>
          </div>
          <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors duration-300">
            FINPRO
          </span>
        </Link>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex items-start lg:items-center justify-center px-6 md:px-10 lg:px-16 xl:px-24 pb-10">
        <div className="w-full max-w-6xl grid gap-10 lg:gap-16 lg:grid-cols-2 items-start lg:items-center">
          {/* Left Side - Welcome Content */}
          <div className="space-y-6 md:space-y-8 animate-slide-up">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
                Welcome Back to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-blue-light">
                  FINPRO
                </span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                Access your dashboard and unlock powerful insights from millions
                of records with enterprise-grade security.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                <span className="text-muted-foreground">
                  Secure authentication with enterprise-grade protection
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                <span className="text-muted-foreground">
                  Access to 40M+ records instantly
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                <span className="text-muted-foreground">
                  Advanced search filters and analytics
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="w-full max-w-lg lg:max-w-md mx-auto animate-scale-in">
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 border border-border/60 bg-white/90 backdrop-blur-md">
              <CardHeader className="text-center space-y-4 pb-5">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <LogIn className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-brand-navy">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm md:text-base">
                  Sign in to access your FINPRO dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 md:space-y-6">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 md:space-y-6"
                >
                  {/* Email Field */}
                  <div
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <Label
                      htmlFor="email"
                      className="text-brand-navy font-medium"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                    />
                  </div>

                  {/* Password Field */}
                  <div
                    className="space-y-2 animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Label
                      htmlFor="password"
                      className="text-brand-navy font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-brand-blue transition-colors duration-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security Captcha */}
                  <div
                    className="space-y-3 animate-fade-in"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <Label className="text-brand-navy font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Verification
                    </Label>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-muted to muted/50 rounded-xl p-4 border-2 border-dashed border-border">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            Enter the code below:
                          </p>
                          <div className="text-2xl font-bold text-brand-navy tracking-widest font-mono bg-white/80 rounded-lg py-2 px-4 inline-block shadow-sm">
                            {captcha}
                          </div>
                        </div>
                      </div>
                      <Input
                        name="captcha"
                        type="text"
                        placeholder="Enter security code"
                        value={formData.captcha}
                        onChange={handleInputChange}
                        required
                        className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50 text-center font-mono tracking-widest"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {error && <div className="text-sm text-red-600">{error}</div>}

                  {/* Forgot Password */}
                  <div
                    className="flex justify-between items-center animate-fade-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <Link
                      to="/signup"
                      className="text-sm text-muted-foreground hover:text-brand-blue transition-colors duration-300"
                    >
                      Need an account?
                    </Link>
                    <Link
                      to="/forgot-password"
                      className="text-brand-blue hover:text-brand-blue-dark transition-colors duration-300 text-sm font-medium"
                    >
                      Forgot password?
                    </Link>
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
                      Sign In
                    </span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </form>

                {/* Footer */}
                <div
                  className="text-center pt-4 md:pt-6 animate-fade-in"
                  style={{ animationDelay: "0.7s" }}
                >
                  <p className="text-xs text-muted-foreground">
                    Protected by enterprise-grade security
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

export default SignIn;
