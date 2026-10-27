import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '@/services/historyService';
import { useAuth } from './useAuth';

export function useHistory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const historyQuery = useQuery({
    queryKey: ['browser_history', user?.id],
    queryFn: () => historyService.getHistory(),
    enabled: !!user,
  });

  const addHistoryMutation = useMutation({
    mutationFn: ({ title, url }: { title: string; url: string }) =>
      historyService.addHistory(title, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browser_history', user?.id] });
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => historyService.deleteHistoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browser_history', user?.id] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => historyService.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browser_history', user?.id] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    addHistory: addHistoryMutation.mutateAsync,
    deleteHistoryItem: deleteHistoryMutation.mutateAsync,
    clearHistory: clearHistoryMutation.mutateAsync,
    refetch: historyQuery.refetch,
  };
}
