-- Seed data template for DayFlow (run in Supabase SQL editor if desired after registering an initial user)
-- Note: Replace '00000000-0000-0000-0000-000000000000' with actual auth.uid()

/*
DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000000';
    v_folder_id UUID;
    v_note_id UUID;
    v_task_id UUID;
BEGIN
    -- Seed folder
    INSERT INTO public.note_folders (id, user_id, name, sort_order)
    VALUES (gen_random_uuid(), v_user_id, 'Personal', 0)
    RETURNING id INTO v_folder_id;

    -- Seed Note
    INSERT INTO public.notes (id, user_id, folder_id, title, content, is_pinned)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        v_folder_id,
        'Welcome to DayFlow',
        '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Welcome to DayFlow!"}]},{"type":"paragraph","content":[{"type":"text","text":"Your personal desktop productivity center and split-screen browser."}]}]}',
        true
    )
    RETURNING id INTO v_note_id;

    -- Seed Task
    INSERT INTO public.tasks (id, user_id, title, description, status, priority, due_date, category)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        'Explore DayFlow features',
        'Check out tasks, calendar timeline, Tiptap notes, and multi-tab browser with split view.',
        'todo',
        'high',
        CURRENT_DATE,
        'Onboarding'
    )
    RETURNING id INTO v_task_id;

    -- Seed Bookmark
    INSERT INTO public.bookmarks (user_id, title, url, folder, is_pinned)
    VALUES
        (v_user_id, 'GitHub', 'https://github.com', 'Favorites', true),
        (v_user_id, 'Hacker News', 'https://news.ycombinator.com', 'Favorites', true);
END $$;
*/
