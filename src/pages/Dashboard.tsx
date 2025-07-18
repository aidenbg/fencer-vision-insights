import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { VideoGallery } from '@/components/VideoGallery';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <AnalyticsDashboard />
        <VideoGallery />
      </div>
    </div>
  );
};

export default Dashboard;