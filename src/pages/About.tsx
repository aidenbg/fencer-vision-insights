import { ArrowLeft, Swords, Target, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="p-6 border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/upload">
              Upload Video
            </Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-primary to-secondary rounded-full">
              <Swords className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">About Fencelytics</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered video analysis for fencing athletes, coaches, and enthusiasts.
          </p>
        </div>

        {/* What We Do */}
        <Card className="p-8 mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed text-center">
            Fencelytics uses AI to analyze your fencing videos and provide instant performance insights. 
            Upload any fencing bout, get detailed statistics on touches, timing, and technique.
          </p>
        </Card>

        {/* How It Works */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Upload Video</h3>
              <p className="text-sm text-muted-foreground">Upload your fencing bout video</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">Our AI analyzes every frame</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-sm text-muted-foreground">Receive detailed insights</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to analyze your fencing?</h2>
          <p className="text-muted-foreground mb-8">
            Upload your first video and discover insights you never knew existed.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/upload">
              Get Started Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;