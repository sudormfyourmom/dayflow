import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '@/services/bookmarkService';
import { BookmarkRow } from '@/types';
import { useAuth } from './useAuth';

export function useBookmarks() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => bookmarkService.getBookmarks(),
    enabled: !!user,
  });

  const addBookmarkMutation = useMutation({
    mutationFn: (newBookmark: { title: string; url: string; folder?: string; is_pinned?: boolean }) =>
      bookmarkService.createBookmark(newBookmark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
  });

  const updateBookmarkMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BookmarkRow> }) =>
      bookmarkService.updateBookmark(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id: string) => bookmarkService.deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
  });

  const bookmarks = bookmarksQuery.data || [];
  const pinnedBookmarks = bookmarks.filter((b) => b.is_pinned);

  return {
    bookmarks,
    pinnedBookmarks,
    isLoading: bookmarksQuery.isLoading,
    addBookmark: addBookmarkMutation.mutateAsync,
    updateBookmark: updateBookmarkMutation.mutateAsync,
    deleteBookmark: deleteBookmarkMutation.mutateAsync,
    refetch: bookmarksQuery.refetch,
  };
}
