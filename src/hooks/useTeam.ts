import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '../types/team';
import { teamApi } from '../lib/api/team.api';

export function useTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teamApi.getTeam();
      setTeam(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const inviteMember = async (member: Omit<TeamMember, 'id' | 'invitedAt' | 'status'> & { password?: string }) => {
    try {
      const invited = await teamApi.inviteMember(member);
      setTeam(prev => [...prev, invited]);
      return invited;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updatePermissions = async (id: string, permissions: TeamMember['permissions']) => {
    try {
      const updated = await teamApi.updatePermissions(id, permissions);
      setTeam(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateTeamMember = async (id: string, updatedFields: Partial<TeamMember>) => {
    try {
      const updated = await teamApi.updateTeamMember(id, updatedFields);
      setTeam(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const revokeAccess = async (id: string) => {
    try {
      await teamApi.revokeAccess(id);
      setTeam(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    team,
    isLoading,
    error,
    refetch: fetchTeam,
    inviteMember,
    updatePermissions,
    updateTeamMember,
    revokeAccess
  };
}
