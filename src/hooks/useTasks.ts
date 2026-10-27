import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { TaskInsert, TaskUpdate } from '@/types';
import { useAuth } from './useAuth';

export function useTasks() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => taskService.getTasks(),
    enabled: !!user,
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTask: Omit<TaskInsert, 'user_id'>) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      taskService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) =>
      taskService.toggleComplete(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const tasks = tasksQuery.data || [];

  // Derived tasks helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return t.due_date < todayStr;
  });

  return {
    tasks,
    todayTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    toggleComplete: toggleTaskMutation.mutateAsync,
    refetch: tasksQuery.refetch,
  };
}
