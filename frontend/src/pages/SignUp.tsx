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
import { createRegistrationRequest } from "@/lib/api";
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
    state: "",
    requested_searches: 100,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createRegistrationRequest({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        state: formData.state,
        requested_searches: Number(formData.requested_searches) || 100,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit request");
    }
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
                  Please verify your email from the link we've sent you
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
                          After verifying your email, our admin team will review
                          your request
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>You'll receive credentials if approved</span>
                      </li>
                    </ul>
                  </div>
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

      {/* Main Content */}
      <div className="flex items-start justify-center px-8 lg:px-16 xl:px-24 pb-12">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8">
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card className="shadow-xl border border-border/60 bg-white/90 backdrop-blur-md animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-brand-blue" />
                  <CardTitle className="text-2xl font-bold text-brand-navy">
                    Request Access
                  </CardTitle>
                </div>
                <CardDescription>
                  Fill out your details to request access to FINPRO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-brand-navy">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="pl-9 h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-brand-navy">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-9 h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-brand-navy">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="pl-9 h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-brand-navy">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="requested_searches"
                      className="text-brand-navy"
                    >
                      Requested Searches per Day
                    </Label>
                    <Input
                      id="requested_searches"
                      name="requested_searches"
                      type="number"
                      min={1}
                      max={10000}
                      value={formData.requested_searches}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-2 border-border focus:border-brand-blue transition-all duration-300 hover:border-brand-blue/50 bg-background/50"
                    />
                  </div>

                  {error && <div className="text-sm text-red-600">{error}</div>}

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      Submit Request
                    </span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-6">
            <Card className="shadow-xl border border-border/60 bg-white/90 backdrop-blur-md animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-brand-blue" />
                  <CardTitle className="text-2xl font-bold text-brand-navy">
                    Why Join FINPRO?
                  </CardTitle>
                </div>
                <CardDescription>
                  Gain access to powerful search across millions of records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                  <span className="text-muted-foreground">
                    Request custom daily search limits
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                  <span className="text-muted-foreground">
                    Get access after admin approval
                  </span>
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
