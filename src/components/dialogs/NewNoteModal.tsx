import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotes } from '@/hooks/useNotes';

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated?: (noteId: string) => void;
}

export const NewNoteModal: React.FC<NewNoteModalProps> = ({
  isOpen,
  onClose,
  onNoteCreated,
}) => {
  const { createNote, folders } = useNotes();
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const note = await createNote({
        title: title.trim() || 'Bez tytułu',
        folder_id: folderId || null,
      });

      setTitle('');
      setFolderId('');
      onClose();
      if (onNoteCreated) {
        onNoteCreated(note.id);
      }
    } catch (err: any) {
      setError(err?.message || 'Nie udało się utworzyć notatki');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nowa notatka"
      description="Rozpocznij tworzenie nowego dokumentu"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-status-danger/10 border border-status-danger/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Tytuł notatki</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wprowadź tytuł..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Folder (opcjonalny)</label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="">(Brak folderu / Główny katalog)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Utwórz notatkę
          </Button>
        </div>
      </form>
    </Modal>
  );
};
