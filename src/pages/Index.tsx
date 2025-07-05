import Navbar from '../components/Navbar';
import HomeStats from '../components/HomeStats';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Home</h1>
          <p className="text-lg text-gray-600">Real-time trading statistics and performance metrics</p>
        </div>

        <HomeStats />
      </div>
    </div>
  );
};

export default Index;
