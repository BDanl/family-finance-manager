import { useHousehold } from '../contexts/useHousehold';
import { useNavigate } from 'react-router-dom';

export function OverviewPage() {
  const { currentHousehold, loading, error } = useHousehold();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            No household found. Create a household to get started.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Household
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Dashboard for {currentHousehold.name} - coming soon</p>
      </div>
    </div>
  );
}
