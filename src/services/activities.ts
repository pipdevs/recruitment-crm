import type { Json } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';

export type EntityType = 'candidate' | 'company' | 'job';
export type ActivityType = 'note' | 'email' | 'status_changed' | 'stage_moved' | 'task_completed' | 'task_updated';

// Real links: a row can belong to several records (an email to a company and a candidate's application).
export interface ActivityLinks {
  candidate_id?: string;
  company_id?: string;
  job_id?: string;
  job_application_id?: string;
  contact_id?: string;
}

const LINK_COLUMN = {
  candidate: 'candidate_id',
  company: 'company_id',
  job: 'job_id',
} as const satisfies Record<EntityType, keyof ActivityLinks>;

const SELECT = `
  *,
  author:author(id, full_name)
`;

export const activitiesService = {
  async getByEntity(entityType: EntityType, entityId: string) {
    const { data, error } = await supabase
      .from('activities')
      .select(SELECT)
      .eq(LINK_COLUMN[entityType], entityId)
      .order('occurred_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getNotes(entityType: EntityType, entityId: string) {
    const { data, error } = await supabase
      .from('activities')
      .select(SELECT)
      .eq(LINK_COLUMN[entityType], entityId)
      .eq('activity_type', 'note')
      .order('occurred_at', { ascending: false });
    if (error) throw error;
    return data;
  },

    // Every note in the org, with the record it belongs to (one query instead of three lookups).
  async getAllNotes(entityType?: EntityType) {
    let query = supabase
      .from('activities')
      .select(`
        id, message, occurred_at,
        author:author(id, full_name),
        candidate:candidate_id(id, full_name),
        company:company_id(id, name),
        job:job_id(id, title)
      `)
      .eq('activity_type', 'note')
      .order('occurred_at', { ascending: false });
    if (entityType) query = query.not(LINK_COLUMN[entityType], 'is', null);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(
    links: ActivityLinks,
    activityType: ActivityType,
    message: string,
    authorId: string,
    metadata?: Record<string, unknown>
  ) {
    const organisationId = await getOrganisationId();

    const { data, error } = await supabase
      .from('activities')
      .insert([{
        ...links,
        activity_type: activityType,
        message,
        metadata: (metadata || null) as Json | null,
        author: authorId,
        organisation_id: organisationId,
      }])
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async createNote(entityType: EntityType, entityId: string, content: string, authorId: string) {
    return this.create({ [LINK_COLUMN[entityType]]: entityId }, 'note', content, authorId);
  },

  async deleteNote(noteId: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', noteId)
      .eq('activity_type', 'note');
    if (error) throw error;
  },

  async createStatusChange(
    entityType: EntityType,
    entityId: string,
    oldStatus: string,
    newStatus: string,
    authorId: string
  ) {
    return this.create(
      { [LINK_COLUMN[entityType]]: entityId },
      'status_changed',
      `Status changed from ${oldStatus} to ${newStatus}`,
      authorId,
      { old_status: oldStatus, new_status: newStatus }
    );
  },

  // Linked to the candidate, the job and the application, so it shows on both timelines.
  async createStageMove(
    application: { id: string; candidate_id: string; job_id: string },
    jobTitle: string,
    oldStage: string,
    newStage: string,
    authorId: string
  ) {
    return this.create(
      { candidate_id: application.candidate_id, job_id: application.job_id, job_application_id: application.id },
      'stage_moved',
      `${jobTitle}: moved from ${oldStage} to ${newStage}`,
      authorId,
      { job_title: jobTitle, old_stage: oldStage, new_stage: newStage }
    );
  },

  async createTaskCompletion(entityType: EntityType, entityId: string, taskTitle: string, authorId: string) {
    return this.create(
      { [LINK_COLUMN[entityType]]: entityId },
      'task_completed',
      `Task completed: ${taskTitle}`,
      authorId,
      { task_title: taskTitle }
    );
  },

  async createTaskUpdate(
    entityType: EntityType,
    entityId: string,
    taskTitle: string,
    changes: Record<string, unknown>,
    authorId: string
  ) {
    return this.create(
      { [LINK_COLUMN[entityType]]: entityId },
      'task_updated',
      `Task updated: ${taskTitle}`,
      authorId,
      { task_title: taskTitle, changes }
    );
  },
};