import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Undo,
  Redo,
  Plus,
  Trash2,
  Pin,
  Star,
  Download,
  Folder,
  Search,
  Check,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface NotesViewProps {
  initialNoteId?: string;
  onOpenNewNote?: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  initialNoteId,
}) => {
  const {
    notes,
    folders,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    deleteFolder,
  } = useNotes();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId || null);
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Active note
  const currentNote = notes.find((n) => n.id === selectedNoteId) || notes[0] || null;

  // Selected note title state for local typing before debounce
  const [localTitle, setLocalTitle] = useState(currentNote?.title || '');

  useEffect(() => {
    if (initialNoteId) {
      setSelectedNoteId(initialNoteId);
    } else if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [initialNoteId, notes, selectedNoteId]);

  useEffect(() => {
    if (currentNote) {
      setLocalTitle(currentNote.title || '');
    }
  }, [currentNote?.id]);

  // Debounced auto-save timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveNoteContent = useCallback(
    async (noteId: string, title: string, contentJson: any) => {
      setSaveStatus('saving');
      try {
        await updateNote({
          id: noteId,
          updates: {
            title,
            content: contentJson,
          },
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('[NotesView] Auto-save failed:', err);
        setSaveStatus('error');
      }
    },
    [updateNote]
  );

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: (currentNote?.content as any) || '',
    onUpdate: ({ editor }) => {
      if (!currentNote) return;
      setSaveStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        saveNoteContent(currentNote.id, localTitle, editor.getJSON());
      }, 1000);
    },
  });

  // Load content into editor when currentNote changes
  useEffect(() => {
    if (editor && currentNote) {
      // Check if editor content is different to prevent cursor jumps
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(currentNote.content)) {
        editor.commands.setContent((currentNote.content as any) || '');
      }
    }
  }, [currentNote?.id, editor]);

  // Handle title changes with debounced auto-save
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
    if (!currentNote || !editor) return;
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      saveNoteContent(currentNote.id, newTitle, editor.getJSON());
    }, 1000);
  };

  // Export functions
  const exportToMarkdown = () => {
    if (!currentNote || !editor) return;
    const text = editor.getText();
    const content = `# ${localTitle}\n\n${text}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${localTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToTxt = () => {
    if (!currentNote || !editor) return;
    const text = editor.getText();
    const content = `${localTitle}\n\n${text}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${localTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (activeFolderFilter && n.folder_id !== activeFolderFilter) return false;
    if (searchQuery.trim()) {
      return n.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Calculate word & char count
  const editorText = editor?.getText() || '';
  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const charCount = editorText.length;

  return (
    <div className="h-full flex overflow-hidden">
      {/* 1. Folders Column */}
      <div className="w-56 border-r border-border-subtle bg-surface/40 p-3 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Foldery
            </span>
            <button
              onClick={() => setIsCreatingFolder(!isCreatingFolder)}
              className="p-1 rounded text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
              title="Nowy folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCreatingFolder && (
            <div className="flex items-center gap-1.5 px-2">
              <Input
                size={1}
                placeholder="Nazwa..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="h-7 text-xs bg-surface-elevated"
                autoFocus
              />
              <Button
                size="sm"
                className="h-7 px-2"
                onClick={async () => {
                  if (newFolderName.trim()) {
                    await createFolder(newFolderName.trim());
                    setNewFolderName('');
                    setIsCreatingFolder(false);
                  }
                }}
              >
                <Check className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => setActiveFolderFilter(null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFolderFilter === null
                  ? 'bg-accent/15 text-accent-light'
                  : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Wszystkie notatki</span>
              </div>
              <span className="text-[10px] text-text-muted">{notes.length}</span>
            </button>

            {folders.map((folder) => {
              const count = notes.filter((n) => n.folder_id === folder.id).length;
              const isSelected = activeFolderFilter === folder.id;

              return (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent/15 text-accent-light'
                      : 'text-text-secondary hover:text-white hover:bg-surface-elevated'
                  }`}
                  onClick={() => setActiveFolderFilter(folder.id)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-3.5 h-3.5 shrink-0 text-text-muted group-hover:text-accent-light" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-muted">{count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-text-muted hover:text-status-danger"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-2 border-t border-border-subtle">
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-xs h-8"
            onClick={async () => {
              const n = await createNote({ folder_id: activeFolderFilter || null });
              setSelectedNoteId(n.id);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Nowa notatka
          </Button>
        </div>
      </div>

      {/* 2. Note List Column */}
      <div className="w-72 border-r border-border-subtle bg-surface/20 flex flex-col shrink-0">
        <div className="p-3 border-b border-border-subtle">
          <Input
            icon={<Search className="w-3.5 h-3.5" />}
            placeholder="Szukaj w notatkach..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-surface-elevated"
          />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/40 p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs">Brak notatek</div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = currentNote?.id === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-accent/15 border border-accent/30 text-white'
                      : 'hover:bg-surface-elevated/70 text-text-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? 'text-white' : 'text-text-primary'
                      }`}
                    >
                      {note.title || 'Bez tytułu'}
                    </p>
                    <div className="flex items-center gap-1">
                      {note.is_pinned && <Pin className="w-3 h-3 text-accent shrink-0" />}
                      {note.is_favorite && <Star className="w-3 h-3 text-amber-400 shrink-0 fill-amber-400" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-text-muted mt-1">
                    {new Date(note.updated_at).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Editor Column */}
      {currentNote ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Editor Header / Formatting Toolbar */}
          <div className="border-b border-border-subtle p-2 flex flex-wrap items-center justify-between gap-2 bg-surface/50">
            {/* Formatting Tools */}
            <div className="flex items-center gap-0.5 overflow-x-auto">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('bold') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Pogrubienie"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('italic') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Kursywa"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('underline') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Podkreślenie"
              >
                <UnderlineIcon className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-border-subtle mx-1" />

              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('heading', { level: 1 }) ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Nagłówek 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('heading', { level: 2 }) ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Nagłówek 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('heading', { level: 3 }) ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Nagłówek 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-border-subtle mx-1" />

              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('bulletList') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Lista punktowana"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('orderedList') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Lista numerowana"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('taskList') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Lista zadań"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-border-subtle mx-1" />

              <button
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('blockquote') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Cytat"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  editor?.isActive('codeBlock') ? 'text-accent bg-accent/20' : 'text-text-muted'
                }`}
                title="Blok kodu"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-border-subtle mx-1" />

              <button
                onClick={() => editor?.chain().focus().undo().run()}
                className="p-1.5 rounded text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
                title="Cofnij"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => editor?.chain().focus().redo().run()}
                className="p-1.5 rounded text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
                title="Ponów"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Note Meta Controls & Save Indicator */}
            <div className="flex items-center gap-2">
              {/* Save Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-surface-elevated border border-border-subtle">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-accent" />
                    <span className="text-text-muted text-[11px]">Zapisywanie...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="w-3 h-3 text-status-success" />
                    <span className="text-emerald-400 text-[11px]">Zapisano w chmurze</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="w-3 h-3 text-status-danger" />
                    <span className="text-red-400 text-[11px]">Błąd zapisu</span>
                  </>
                )}
                {saveStatus === 'idle' && (
                  <span className="text-text-muted text-[11px]">Zsynchronizowano</span>
                )}
              </div>

              {/* Pin Note */}
              <button
                onClick={() => updateNote({ id: currentNote.id, updates: { is_pinned: !currentNote.is_pinned } })}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  currentNote.is_pinned ? 'text-accent' : 'text-text-muted'
                }`}
                title={currentNote.is_pinned ? 'Odepnij notatkę' : 'Przypnij notatkę'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              {/* Favorite Note */}
              <button
                onClick={() => updateNote({ id: currentNote.id, updates: { is_favorite: !currentNote.is_favorite } })}
                className={`p-1.5 rounded hover:bg-surface-elevated transition-colors ${
                  currentNote.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-text-muted'
                }`}
                title={currentNote.is_favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              >
                <Star className="w-3.5 h-3.5" />
              </button>

              {/* Export Markdown */}
              <button
                onClick={exportToMarkdown}
                className="p-1.5 rounded text-text-muted hover:text-white hover:bg-surface-elevated transition-colors text-xs flex items-center gap-1"
                title="Eksportuj do Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px]">MD</span>
              </button>

              {/* Export TXT */}
              <button
                onClick={exportToTxt}
                className="p-1.5 rounded text-text-muted hover:text-white hover:bg-surface-elevated transition-colors text-xs flex items-center gap-1"
                title="Eksportuj do pliku tekstowego (.txt)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px]">TXT</span>
              </button>

              {/* Delete Note */}
              <button
                onClick={() => deleteNote(currentNote.id)}
                className="p-1.5 rounded text-text-muted hover:text-status-danger hover:bg-surface-elevated transition-colors"
                title="Usuń notatkę"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title and Editor Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl w-full mx-auto">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Tytuł notatki..."
              className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-text-muted focus:outline-none mb-4"
            />

            <EditorContent editor={editor} className="tiptap min-h-[400px]" />
          </div>

          {/* Bottom Editor Footer */}
          <div className="h-8 border-t border-border-subtle bg-surface/30 px-6 flex items-center justify-between text-[11px] text-text-muted">
            <div className="flex items-center gap-4">
              <span>{wordCount} słów</span>
              <span>{charCount} znaków</span>
            </div>
            <span>
              Ostatnia modyfikacja: {new Date(currentNote.updated_at).toLocaleTimeString('pl-PL')}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
          Wybierz lub utwórz notatkę, aby rozpocząć edycję.
        </div>
      )}
    </div>
  );
};
