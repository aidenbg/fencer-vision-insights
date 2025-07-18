import { useState } from 'react';
import { Swords, Upload, BarChart3, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VideoUpload } from '@/components/VideoUpload';
import { Link } from 'react-router-dom';

const Index = () => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-primary to-secondary rounded-full">
                <Swords className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FenceAnalytics
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your fencing videos and get instant AI-powered analysis. 
              Track touches, reaction times, and technique improvements with cutting-edge machine learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setShowUpload(true)}
                className="text-lg px-8"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Video
              </Button>
              
              <Button variant="outline" size="lg" asChild className="text-lg px-8">
                <Link to="/dashboard">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Analysis Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Touch Detection',
                description: 'Automatically identify and count successful touches with frame-perfect accuracy'
              },
              {
                icon: BarChart3,
                title: 'Performance Metrics',
                description: 'Track reaction times, accuracy rates, and improvement trends over time'
              },
              {
                icon: Swords,
                title: 'Technique Analysis',
                description: 'Analyze form, stance, and movement patterns across different weapons'
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 group">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      {showUpload && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <VideoUpload />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to improve your fencing?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of fencers using AI to enhance their training and competition performance.
          </p>
          
          {!showUpload && (
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => setShowUpload(true)}
              className="text-lg px-8"
            >
              Get Started Now
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
