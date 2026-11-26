import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useHousehold } from '../contexts/useHousehold';

export function Shell() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { households, currentHousehold, selectHousehold } = useHousehold();

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/accounts', label: 'Accounts' },
    { path: '/budgets', label: 'Budgets' },
    { path: '/goals', label: 'Goals' },
    { path: '/reports', label: 'Reports' },
    { path: '/household', label: 'Household' },
    { path: '/settings', label: 'Settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Family Finance Manager</h1>
              {currentHousehold && households.length > 1 ? (
                <select
                  value={currentHousehold.id}
                  onChange={(e) => selectHousehold(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  aria-label="Select household"
                >
                  {households.map((household) => (
                    <option key={household.id} value={household.id}>
                      {household.name}
                    </option>
                  ))}
                </select>
              ) : (
                currentHousehold && (
                  <span className="text-sm text-gray-600">| {currentHousehold.name}</span>
                )
              )}
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
