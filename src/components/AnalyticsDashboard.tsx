import { BarChart3, TrendingUp, Target, Zap, Clock, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AnalyticsData {
  totalVideos: number;
  totalTouches: number;
  averageAccuracy: number;
  averageReactionTime: number;
  improvementTrend: number;
  dominantWeapon: string;
}

const mockAnalytics: AnalyticsData = {
  totalVideos: 15,
  totalTouches: 245,
  averageAccuracy: 82,
  averageReactionTime: 0.31,
  improvementTrend: 12,
  dominantWeapon: 'Épée'
};

export function AnalyticsDashboard() {
  const analytics = mockAnalytics;

  const statCards = [
    {
      title: 'Total Videos',
      value: analytics.totalVideos,
      suffix: '',
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Touches',
      value: analytics.totalTouches,
      suffix: '',
      icon: Target,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Average Accuracy',
      value: analytics.averageAccuracy,
      suffix: '%',
      icon: Award,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Reaction Time',
      value: analytics.averageReactionTime,
      suffix: 's',
      icon: Zap,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <div className="flex items-center space-x-2 text-sm text-success">
          <TrendingUp className="h-4 w-4" />
          <span>+{analytics.improvementTrend}% this month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">
                    {stat.value}{stat.suffix}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <div className="space-y-4">
            {['Accuracy', 'Reaction Time', 'Touch Success Rate'].map((metric, index) => (
              <div key={metric} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric}</span>
                  <span className="text-muted-foreground">{85 - index * 5}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${85 - index * 5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weapon Analysis</h3>
          <div className="space-y-4">
            {[
              { weapon: 'Épée', sessions: 8, accuracy: 84 },
              { weapon: 'Foil', sessions: 5, accuracy: 79 },
              { weapon: 'Sabre', sessions: 2, accuracy: 86 }
            ].map((item) => (
              <div key={item.weapon} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.weapon}</p>
                  <p className="text-sm text-muted-foreground">{item.sessions} sessions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{item.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}