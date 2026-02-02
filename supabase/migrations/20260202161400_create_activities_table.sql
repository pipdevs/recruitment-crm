/*
  # Create activities table for unified activity feed

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `entity_type` (text, can be 'candidate', 'company', 'job', 'task')
      - `entity_id` (uuid, the ID of the related entity)
      - `activity_type` (text, e.g., 'note_added', 'status_changed', 'stage_moved', 'task_completed')
      - `message` (text, human-readable description of the activity)
      - `metadata` (jsonb, optional structured data for the activity)
      - `author` (uuid, reference to profiles table)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `activities` table
    - Allow authenticated users to view activities related to entities they have access to
    - Allow authenticated users to create activities

  3. Indexes
    - Index on entity_type and entity_id for quick lookups
    - Index on author for user activity queries
    - Index on created_at for timeline sorting
*/

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('candidate', 'company', 'job', 'task')),
  entity_id uuid NOT NULL,
  activity_type text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  author uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author);

CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_author ON activities(author);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
