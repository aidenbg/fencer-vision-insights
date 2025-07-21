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
          <h1 className="text-4xl font-bold mb-4">About FenceAnalytics</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered video analysis for fencing athletes, coaches, and enthusiasts.
          </p>
        </div>

        {/* Mission */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            FenceAnalytics democratizes access to professional-level fencing analysis. Using cutting-edge 
            computer vision and machine learning, we provide instant, detailed insights that help fencers 
            at every level improve their technique, timing, and tactical awareness.
          </p>
        </Card>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">What We Analyze</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Target,
                title: 'Touch Detection',
                description: 'Automatically identify and classify successful touches, near-misses, and invalid attempts with frame-perfect accuracy.'
              },
              {
                icon: BarChart3,
                title: 'Performance Metrics',
                description: 'Track reaction times, movement speed, accuracy rates, and improvement trends over multiple sessions.'
              },
              {
                icon: Zap,
                title: 'Timing Analysis',
                description: 'Measure attack preparation time, parry-riposte sequences, and identify optimal timing windows.'
              },
              {
                icon: Swords,
                title: 'Technique Breakdown',
                description: 'Analyze stance, blade work, footwork patterns, and movement efficiency across different weapons.'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Upload Your Video</h3>
                <p className="text-muted-foreground">Simply upload any fencing bout or training video in common formats.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Analysis</h3>
                <p className="text-muted-foreground">Our advanced computer vision models analyze every frame for actions, touches, and technique.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Get Insights</h3>
                <p className="text-muted-foreground">Receive detailed statistics, timing data, and actionable feedback to improve your fencing.</p>
              </div>
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