import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Monitor, Search, Zap } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Small",
      price: "₹500",
      period: "/month",
      description: "Perfect for individual professionals",
      features: [
        "1 Device at one time",
        "300 Searches per day",
        "Basic analytics",
        "Email support",
        "Standard processing speed",
      ],
      icon: Search,
      popular: false,
      gradient: "from-gray-600 to-gray-700",
    },
    {
      name: "Medium",
      price: "₹1,000",
      period: "/month",
      description: "Ideal for growing teams",
      features: [
        "1 Device at one time",
        "600 Searches per day",
        "Advanced analytics",
        "Priority email support",
        "Enhanced processing speed",
        "Data export options",
      ],
      icon: Monitor,
      popular: true,
      gradient: "from-brand-blue to-brand-blue-dark",
    },
    {
      name: "Large",
      price: "₹2,000",
      period: "/month",
      description: "Built for enterprise needs",
      features: [
        "1 Device at one time",
        "1,000 Searches per day",
        "Premium analytics dashboard",
        "24/7 priority support",
        "Maximum processing speed",
        "Advanced data export",
        "Custom integrations",
      ],
      icon: Zap,
      popular: false,
      gradient: "from-purple-600 to-purple-700",
    },
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-br from-background to-muted/20 relative overflow-hidden">
      <div className="w-full max-w-none px-8 lg:px-16 xl:px-24 relative z-10">
        <div className="text-center space-y-4 mb-12 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-navy">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the perfect plan for your data search needs. All plans
            include our enterprise-grade security and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div key={index} className="relative">
                {/* Most Popular Badge - Outside the card */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white text-sm font-bold px-6 py-2 rounded-full shadow-xl border-2 border-white">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                <Card
                  className={`relative overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scale-in border-0 ${
                    plan.popular
                      ? "ring-2 ring-brand-blue shadow-2xl shadow-brand-blue/20 mt-4"
                      : "shadow-xl hover:shadow-2xl"
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <CardHeader className="text-center pb-4 pt-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-brand-navy">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl lg:text-5xl font-bold text-brand-navy">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground text-lg">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-muted-foreground text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.popular ? "hero" : "hero-outline"}
                      size="lg"
                      className="w-full group font-semibold text-base"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        Get Started with {plan.name}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div
          className="text-center mt-12 space-y-4 animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-muted-foreground text-sm">
            All plans include enterprise-grade security, data encryption, and
            reliable uptime
          </p>
          <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
