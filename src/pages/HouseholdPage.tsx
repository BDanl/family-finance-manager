import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useHousehold } from '../contexts/useHousehold';
import type { UserRole } from '../types/auth';

const ASSIGNABLE_ROLES: UserRole[] = ['admin', 'member', 'viewer'];

export function HouseholdPage() {
  const { user } = useAuth();
  const { currentHousehold, loading, error, updateMemberRole, removeMember } = useHousehold();
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Household</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Household</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Household</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">No household found.</p>
        </div>
      </div>
    );
  }

  const currentUserRole = currentHousehold.members?.find(
    (member) => member.user_id === user?.id
  )?.role;
  const isOwner = currentUserRole === 'owner';

  const handleRoleChange = async (memberUserId: string, role: UserRole) => {
    setActionError('');
    setActionLoading(memberUserId);
    try {
      await updateMemberRole(memberUserId, role);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!window.confirm('Remove this member from the household?')) return;
    setActionError('');
    setActionLoading(memberUserId);
    try {
      await removeMember(memberUserId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Household Settings</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Household Information</h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-500">Name:</span>
            <span className="ml-2 text-gray-900">{currentHousehold.name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Currency:</span>
            <span className="ml-2 text-gray-900">{currentHousehold.base_currency}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Locale:</span>
            <span className="ml-2 text-gray-900">{currentHousehold.locale}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Timezone:</span>
            <span className="ml-2 text-gray-900">{currentHousehold.timezone}</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Members</h3>
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {actionError}
          </div>
        )}
        {currentHousehold.members && currentHousehold.members.length > 0 ? (
          <div className="space-y-2">
            {currentHousehold.members.map((member) => {
              const isSelf = member.user_id === user?.id;
              const canManage = isOwner && !isSelf && member.role !== 'owner';
              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {isSelf ? 'You' : `User ${member.user_id.slice(0, 8)}…`}
                    </span>
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {member.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                    {canManage && (
                      <>
                        <select
                          value={member.role}
                          disabled={actionLoading === member.user_id}
                          onChange={(e) =>
                            handleRoleChange(member.user_id, e.target.value as UserRole)
                          }
                          className="text-sm border border-gray-300 rounded-md px-2 py-1"
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={actionLoading === member.user_id}
                          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">No members found.</p>
        )}
      </div>
    </div>
  );
}
