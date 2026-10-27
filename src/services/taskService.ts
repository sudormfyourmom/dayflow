import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { TaskInsert, TaskRow, TaskUpdate } from '@/types';
import { authService } from './authService';
import { offlineStore } from '@/lib/offlineStore';

export const taskService = {
  async getTasks(): Promise<TaskRow[]> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.getTasks();
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as TaskRow[]) || [];
    } catch (err) {
      console.warn('[taskService] Falling back to offline store:', err);
      return offlineStore.getTasks();
    }
  },

  async createTask(task: Omit<TaskInsert, 'user_id'>): Promise<TaskRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.createTask(task);
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return offlineStore.createTask(task);
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TaskRow;
    } catch (err) {
      console.warn('[taskService] Failed to create in Supabase, saving to offline store:', err);
      return offlineStore.createTask(task);
    }
  },

  async updateTask(id: string, updates: TaskUpdate): Promise<TaskRow> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      return offlineStore.updateTask(id, updates);
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TaskRow;
    } catch (err) {
      console.warn('[taskService] Failed to update in Supabase, updating offline store:', err);
      return offlineStore.updateTask(id, updates);
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (authService.isOfflineMode() || !isSupabaseConfigured) {
      offlineStore.deleteTask(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('[taskService] Failed to delete in Supabase, removing from offline store:', err);
      offlineStore.deleteTask(id);
    }
  },

  async toggleComplete(id: string, currentStatus: string): Promise<TaskRow> {
    const isCompleted = currentStatus === 'completed';
    const newStatus = isCompleted ? 'todo' : 'completed';
    const completedAt = isCompleted ? null : new Date().toISOString();

    return this.updateTask(id, {
      status: newStatus,
      completed_at: completedAt,
    });
  },
};
