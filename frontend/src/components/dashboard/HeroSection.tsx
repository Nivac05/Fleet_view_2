import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/20 rounded-full blur-3xl animate-float" style={{
          animationDelay: "1s"
        }}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-chart-3/20 rounded-full blur-3xl animate-float" style={{
          animationDelay: "2s"
        }}></div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                FleetView
              </h1>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-delay-1">
            <span className="text-foreground">Intelligent Fleet</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Management Platform
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay-2">
            Optimize your fleet operations with AI-powered analytics, real-time monitoring, 
            and predictive insights. Transform your EV and ICE fleet into a highly efficient, 
            data-driven operation.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in-delay-3">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Real-time Monitoring</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-chart-2/30 rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-chart-2" />
              <span className="text-sm font-medium">AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-chart-3/30 rounded-full px-4 py-2">
              <BarChart3 className="w-4 h-4 text-chart-3" />
              <span className="text-sm font-medium">Demand Forecasting</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
            
            
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in-delay-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">91%</div>
              <div className="text-muted-foreground">Fleet Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-2 mb-2">24/7</div>
              <div className="text-muted-foreground">Real-time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chart-3 mb-2">AI</div>
              <div className="text-muted-foreground">Powered Insights</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;