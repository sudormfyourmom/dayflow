import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '@/services/noteService';
import { NoteInsert, NoteUpdate } from '@/types';
import { useAuth } from './useAuth';

export function useNotes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const notesQuery = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: () => noteService.getNotes(),
    enabled: !!user,
  });

  const foldersQuery = useQuery({
    queryKey: ['note_folders', user?.id],
    queryFn: () => noteService.getFolders(),
    enabled: !!user,
  });

  const createNoteMutation = useMutation({
    mutationFn: (newNote?: Partial<Omit<NoteInsert, 'user_id'>>) =>
      noteService.createNote(newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: NoteUpdate }) =>
      noteService.updateNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => noteService.createFolder(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note_folders', user?.id] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => noteService.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note_folders', user?.id] });
    },
  });

  const notes = notesQuery.data || [];
  const folders = foldersQuery.data || [];

  const pinnedNotes = notes.filter((n) => n.is_pinned && !n.is_archived);
  const favoriteNotes = notes.filter((n) => n.is_favorite && !n.is_archived);
  const activeNotes = notes.filter((n) => !n.is_archived);
  const archivedNotes = notes.filter((n) => n.is_archived);

  return {
    notes,
    activeNotes,
    pinnedNotes,
    favoriteNotes,
    archivedNotes,
    folders,
    isLoading: notesQuery.isLoading || foldersQuery.isLoading,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    createFolder: createFolderMutation.mutateAsync,
    deleteFolder: deleteFolderMutation.mutateAsync,
    refetchNotes: notesQuery.refetch,
  };
}
