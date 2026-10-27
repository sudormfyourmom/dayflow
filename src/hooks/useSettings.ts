import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';
import { ProfileRow, UserSettingsRow } from '@/types';
import { useAuth } from './useAuth';

export function useSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const settingsQuery = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: () => settingsService.getSettings(),
    enabled: !!user,
  });

  const profileQuery = useQuery({
    queryKey: ['profiles', user?.id],
    queryFn: () => settingsService.getProfile(),
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<UserSettingsRow>) =>
      settingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings', user?.id] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<ProfileRow>) =>
      settingsService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] });
    },
  });

  return {
    settings: settingsQuery.data,
    profile: profileQuery.data,
    isLoading: settingsQuery.isLoading || profileQuery.isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
  };
}
