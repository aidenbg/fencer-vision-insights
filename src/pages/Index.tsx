import { Swords, Upload, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6 z-10">
        <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
          About
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-primary to-secondary rounded-full">
              <Swords className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FenceAnalytics
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12">
            Upload your fencing videos and get instant AI-powered analysis
          </p>
          
          <Button 
            variant="hero" 
            size="lg"
            asChild
            className="text-lg px-12 py-6"
          >
            <Link to="/upload">
              <Upload className="mr-3 h-6 w-6" />
              Upload Video
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Target,
                title: 'Touch Detection',
                description: 'Automatically identify successful touches'
              },
              {
                icon: BarChart3,
                title: 'Performance Metrics',
                description: 'Track reaction times and accuracy'
              },
              {
                icon: Swords,
                title: 'Technique Analysis',
                description: 'Analyze form and movement patterns'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
