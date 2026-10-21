import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Zap, BarChart3 } from "lucide-react";
const StatsSection = () => {
  return <section className="py-20 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            
            
          </h2>
          
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center bg-gradient-card border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-card group animate-scale-in">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">91%</div>
            <div className="text-sm text-muted-foreground">Fleet Utilization Rate</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-card border border-chart-2/10 hover:border-chart-2/30 transition-all duration-300 hover:shadow-card group animate-scale-in" style={{
          animationDelay: "0.1s"
        }}>
            <div className="w-12 h-12 bg-gradient-to-br from-chart-2/20 to-chart-2/5 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-chart-2" />
            </div>
            <div className="text-3xl font-bold text-chart-2 mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Active Fleet Vehicles</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-card border border-chart-3/10 hover:border-chart-3/30 transition-all duration-300 hover:shadow-card group animate-scale-in" style={{
          animationDelay: "0.2s"
        }}>
            <div className="w-12 h-12 bg-gradient-to-br from-chart-3/20 to-chart-3/5 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-chart-3" />
            </div>
            <div className="text-3xl font-bold text-chart-3 mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Real-time Monitoring</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-card border border-warning/10 hover:border-warning/30 transition-all duration-300 hover:shadow-card group animate-scale-in" style={{
          animationDelay: "0.3s"
        }}>
            <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/5 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning mb-2">AI</div>
            <div className="text-sm text-muted-foreground">Predictive Analytics</div>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center animate-fade-in-delay-1">
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">Find</div>
            <div className="text-lg font-medium text-foreground mb-2">Current Fleet Utilization</div>
            <div className="text-sm text-muted-foreground">Optimized through AI recommendations</div>
          </div>

          <div className="text-center animate-fade-in-delay-2">
            <div className="text-5xl font-bold bg-gradient-to-r from-chart-2 to-chart-2 bg-clip-text text-transparent mb-2">Monitoring</div>
            <div className="text-lg font-medium text-foreground mb-2">ICE Vehicles Monitored</div>
            <div className="text-sm text-muted-foreground">Analyze</div>
          </div>

          <div className="text-center animate-fade-in-delay-3">
            <div className="text-5xl font-bold bg-gradient-to-r from-chart-3 to-chart-3 bg-clip-text text-transparent mb-2">Carbon</div>
            <div className="text-lg font-medium text-foreground mb-2">EV Fleet Performance</div>
            <div className="text-sm text-muted-foreground">Higher efficiency vs traditional fleet</div>
          </div>
        </div>
      </div>
    </section>;
};
export default StatsSection;