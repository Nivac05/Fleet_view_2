import { Card } from "@/components/ui/card";
import { Activity, BarChart3, Brain, Database, MapPin, TrendingUp, Zap, Shield } from "lucide-react";
const features = [{
  icon: Activity,
  title: "Real-time Fleet Status",
  description: "Monitor all vehicles in your fleet with live status updates, SOC levels, and charging states.",
  color: "text-primary",
  gradient: "from-primary/20 to-primary/5"
}, {
  icon: BarChart3,
  title: "Advanced Analytics",
  description: "Comprehensive utilization metrics and performance insights to optimize your fleet operations.",
  color: "text-chart-2",
  gradient: "from-chart-2/20 to-chart-2/5"
}, {
  icon: Brain,
  title: "AI Fleet Suggestions",
  description: "Get intelligent recommendations for fleet optimization using advanced machine learning algorithms.",
  color: "text-chart-3",
  gradient: "from-chart-3/20 to-chart-3/5"
}, {
  icon: TrendingUp,
  title: "Demand Forecasting",
  description: "Predict future demand patterns with AI-powered analytics to ensure optimal fleet availability.",
  color: "text-warning",
  gradient: "from-warning/20 to-warning/5"
}, {
  icon: Database,
  title: "Data Management",
  description: "Seamlessly upload and manage fleet data with CSV import capabilities and real-time processing.",
  color: "text-primary",
  gradient: "from-primary/20 to-primary/5"
}, {
  icon: MapPin,
  title: "Location Tracking",
  description: "Track vehicle locations and optimize routes for maximum efficiency and reduced operational costs.",
  color: "text-chart-2",
  gradient: "from-chart-2/20 to-chart-2/5"
}, {
  icon: Zap,
  title: "EV vs ICE Insights",
  description: "Compare electric and internal combustion engine vehicle performance with detailed metrics.",
  color: "text-chart-3",
  gradient: "from-chart-3/20 to-chart-3/5"
}, {
  icon: Shield,
  title: "Enterprise Security",
  description: "Bank-level security with encrypted data transmission and secure cloud infrastructure.",
  color: "text-warning",
  gradient: "from-warning/20 to-warning/5"
}];
const FeaturesSection = () => {
  return <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Powerful Features for</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Modern Fleet Management
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to optimize, monitor, and scale your fleet operations 
            with cutting-edge technology and AI-powered insights.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <Card key={feature.title} className={`p-6 bg-gradient-card border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-card group cursor-pointer animate-fade-in`} style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>;
        })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Ready to transform your fleet management?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-105 transition-all duration-300 px-[65px] py-[23px] font-bold rounded-3xl">START</button>
            
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;