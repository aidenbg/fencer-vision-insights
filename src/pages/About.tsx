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
            Fencelytics uses cutting-edge AI models to analyze your fencing videos. Our object detection model identifies fencers, target areas, and foils, while our action recognition model detects specific fencing actions like attacks, parries, and ripostes. Simply upload your fencing bout video and get instant insights into your technique and performance.
          </p>
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