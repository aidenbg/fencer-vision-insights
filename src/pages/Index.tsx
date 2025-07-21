import { Swords, Upload, BarChart3, Target } from 'lucide-react';
import { Play } from 'lucide-react';
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
            Fencelytics
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

      {/* Demo Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">See It In Action</h2>
            <Card className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demo Video */}
                <div>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Demo Video</p>
                      <p className="text-xs text-muted-foreground mt-1">Fencing bout analysis</p>
                    </div>
                  </div>
                </div>

                {/* Demo Results */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Instant Analysis Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">15</p>
                      <p className="text-xs text-muted-foreground">Total Touches</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-500">12</p>
                      <p className="text-xs text-muted-foreground">Successful</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Reaction Time</span>
                      <span className="text-sm font-medium">0.38s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Speed</span>
                      <span className="text-sm font-medium">2.1 m/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
