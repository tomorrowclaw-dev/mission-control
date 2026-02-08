import { supabase } from './supabase'
import { Milestone, WritingSection, Paper, MeetingNote } from './types'

export async function getMilestones(): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .order('due_date', { ascending: true })
  if (error) throw error
  return data as Milestone[]
}

export async function getWritingSections(): Promise<WritingSection[]> {
  const { data, error } = await supabase
    .from('writing_sections')
    .select('*')
    .order('chapter_order', { ascending: true })
  if (error) throw error
  return data as WritingSection[]
}

export async function getPapers(): Promise<Paper[]> {
  const { data, error } = await supabase
    .from('papers')
    .select('*')
    .order('year', { ascending: true })
  if (error) throw error
  return data as Paper[]
}

export async function getMeetingNotes(): Promise<MeetingNote[]> {
  const { data, error } = await supabase
    .from('meeting_notes')
    .select('*')
    .order('meeting_date', { ascending: false })
  if (error) throw error
  return data as MeetingNote[]
}

export async function updateMilestoneStatus(id: string, status: Milestone['status']) {
  const { error } = await supabase
    .from('milestones')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function updateWritingWordCount(id: string, current_word_count: number) {
  const { error } = await supabase
    .from('writing_sections')
    .update({ current_word_count })
    .eq('id', id)
  if (error) throw error
}
