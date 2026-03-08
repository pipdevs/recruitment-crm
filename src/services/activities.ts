import type { Json } from '../lib/database.types';
import { supabase } from '../lib/supabase';

export type EntityType = 'candidate' | 'company' | 'job' | 'task';
export type ActivityType = 'note_added' | 'status_changed' | 'stage_moved' | 'task_completed' | 'task_updated';

export const activitiesService = {
  async getByEntity(entityType: EntityType, entityId: string) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        author:author(id, full_name)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(
    entityType: EntityType,
    entityId: string,
    activityType: ActivityType,
    message: string,
    authorId: string,
    metadata?: Record<string, unknown>
  ) {
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        entity_type: entityType,
        entity_id: entityId,
        activity_type: activityType,
        message,
        metadata: (metadata || null) as Json | null,
        author: authorId,
      }])
      .select(`
        *,
        author:author(id, full_name)
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async createNote(
    entityType: EntityType,
    entityId: string,
    content: string,
    authorId: string
  ) {
    return this.create(
      entityType,
      entityId,
      'note_added',
      content,
      authorId,
      { note_content: content }
    );
  },

  async createStatusChange(
    entityType: EntityType,
    entityId: string,
    oldStatus: string,
    newStatus: string,
    authorId: string
  ) {
    return this.create(
      entityType,
      entityId,
      'status_changed',
      `Status changed from ${oldStatus} to ${newStatus}`,
      authorId,
      { old_status: oldStatus, new_status: newStatus }
    );
  },

  async createStageMove(
    entityType: EntityType,
    entityId: string,
    oldStage: string,
    newStage: string,
    authorId: string
  ) {
    return this.create(
      entityType,
      entityId,
      'stage_moved',
      `Moved from ${oldStage} to ${newStage}`,
      authorId,
      { old_stage: oldStage, new_stage: newStage }
    );
  },

  async createTaskCompletion(
    entityType: EntityType,
    entityId: string,
    taskTitle: string,
    authorId: string
  ) {
    return this.create(
      entityType,
      entityId,
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
      entityType,
      entityId,
      'task_updated',
      `Task updated: ${taskTitle}`,
      authorId,
      { task_title: taskTitle, changes }
    );
  },
};
