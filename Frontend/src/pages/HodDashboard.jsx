import Sidebar from "../components/Sidebar";

const HodDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-60 flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">HOD Dashboard</h1>
        <p className="text-gray-400 text-sm mb-6">
          Overview of department feedback and faculty performance.
        </p>
      </main>
    </div>
  );
};

export default HodDashboard;
