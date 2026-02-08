-- Enable RLS but allow all reads (single-user app, no auth needed)
-- Run this in the Supabase SQL Editor

alter table milestones enable row level security;
alter table writing_sections enable row level security;
alter table papers enable row level security;
alter table meeting_notes enable row level security;
alter table advisor_feedback enable row level security;
alter table reminders enable row level security;

-- Allow public read/write (this is a personal single-user app)
create policy "Allow all" on milestones for all using (true) with check (true);
create policy "Allow all" on writing_sections for all using (true) with check (true);
create policy "Allow all" on papers for all using (true) with check (true);
create policy "Allow all" on meeting_notes for all using (true) with check (true);
create policy "Allow all" on advisor_feedback for all using (true) with check (true);
create policy "Allow all" on reminders for all using (true) with check (true);
