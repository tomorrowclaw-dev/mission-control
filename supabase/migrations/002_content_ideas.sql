-- Content Ideas for social media posting
create table content_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null, -- 'twitter', 'linkedin', 'both'
  category text not null, -- 'ai-tools', 'thesis-insights', 'industry', 'personal-brand', 'tutorial'
  hook text,
  full_draft text,
  status text not null default 'idea', -- 'idea', 'drafted', 'scheduled', 'posted'
  scheduled_for date,
  posted_at timestamptz,
  week_of date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger content_ideas_updated_at before update on content_ideas for each row execute function update_updated_at();
