-- Thesis Command Center - Initial Schema

-- Milestones & Timeline
create table milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  phase text not null, -- 'build', 'data-collection', 'analysis', 'writing', 'defense'
  due_date date not null,
  week_start date,
  week_end date,
  status text not null default 'not_started', -- 'not_started', 'in_progress', 'complete', 'blocked'
  priority text not null default 'normal', -- 'critical', 'important', 'normal'
  advisor_deliverable boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Writing Sections (chapter-level tracking)
create table writing_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  chapter_order int not null,
  status text not null default 'not_started',
  target_word_count int,
  current_word_count int default 0,
  due_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Research Papers
create table papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text,
  year int,
  source text, -- journal, conference, etc.
  url text,
  doi text,
  tags text[] default '{}', -- e.g., {'TTF', 'RAG', 'trust', 'scaffolding', 'K-12'}
  summary text,
  key_arguments text,
  relevance_notes text, -- how it connects to thesis
  pdf_path text,
  cited_in text[], -- which sections cite this
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meeting Notes (from Plaud or manual)
create table meeting_notes (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  title text,
  attendees text[] default '{}',
  raw_transcript text,
  summary text,
  action_items jsonb default '[]', -- [{task, assignee, due_date, done}]
  advisor_feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Advisor Feedback Log
create table advisor_feedback (
  id uuid primary key default gen_random_uuid(),
  meeting_note_id uuid references meeting_notes(id),
  feedback text not null,
  section text, -- which thesis section it relates to
  addressed boolean default false,
  addressed_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reminders
create table reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date timestamptz not null,
  recurring text, -- 'daily', 'weekly', 'biweekly', null
  milestone_id uuid references milestones(id),
  dismissed boolean default false,
  created_at timestamptz default now()
);

-- Create updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger milestones_updated_at before update on milestones for each row execute function update_updated_at();
create trigger writing_sections_updated_at before update on writing_sections for each row execute function update_updated_at();
create trigger papers_updated_at before update on papers for each row execute function update_updated_at();
create trigger meeting_notes_updated_at before update on meeting_notes for each row execute function update_updated_at();
create trigger advisor_feedback_updated_at before update on advisor_feedback for each row execute function update_updated_at();
