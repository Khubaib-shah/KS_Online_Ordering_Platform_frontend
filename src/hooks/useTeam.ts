import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamMember } from '../types/team';
import { teamApi } from '../lib/api/team.api';

export function useTeam() {
  const queryClient = useQueryClient();

  const { data: team = [], isLoading, error, refetch } = useQuery({
    queryKey: ['team'],
    queryFn: teamApi.getTeam,
  });

  const inviteMember = async (member: Omit<TeamMember, 'id' | 'invitedAt' | 'status'> & { password?: string }) => {
    try {
      const invited = await teamApi.inviteMember(member);
      queryClient.setQueryData(['team'], (old: TeamMember[] | undefined) => 
        old ? [...old, invited] : [invited]
      );
      return invited;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updatePermissions = async (id: string, permissions: TeamMember['permissions']) => {
    try {
      const updated = await teamApi.updatePermissions(id, permissions);
      queryClient.setQueryData(['team'], (old: TeamMember[] | undefined) => 
        old ? old.map(t => t.id === id ? updated : t) : []
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateTeamMember = async (id: string, updatedFields: Partial<TeamMember>) => {
    try {
      const updated = await teamApi.updateTeamMember(id, updatedFields);
      queryClient.setQueryData(['team'], (old: TeamMember[] | undefined) => 
        old ? old.map(t => t.id === id ? updated : t) : []
      );
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const revokeAccess = async (id: string) => {
    try {
      await teamApi.revokeAccess(id);
      queryClient.setQueryData(['team'], (old: TeamMember[] | undefined) => 
        old ? old.filter(t => t.id !== id) : []
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    team,
    isLoading,
    error,
    refetch,
    inviteMember,
    updatePermissions,
    updateTeamMember,
    revokeAccess
  };
}
