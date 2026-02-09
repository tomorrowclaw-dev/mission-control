create table advisor_deliverables (
  id uuid primary key default gen_random_uuid(),
  week_number int not null,
  week_start date not null,
  title text not null,
  description text,
  chapter text, -- 'Ch 1', 'Ch 2', etc.
  status text not null default 'upcoming', -- 'upcoming', 'in_progress', 'submitted', 'feedback_received', 'complete'
  advisor_notes text,
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger advisor_deliverables_updated_at before update on advisor_deliverables for each row execute function update_updated_at();
