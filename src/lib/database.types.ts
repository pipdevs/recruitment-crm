export type UserRole = 'Admin' | 'Manager' | 'Recruiter';

export type CandidateStatus = 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type JobStatus = 'Open' | 'Closed' | 'On Hold';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type EntityType = 'candidate' | 'company' | 'job';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          industry: string | null;
          website: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string | null;
          website?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string | null;
          website?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          resume_url: string | null;
          status: CandidateStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          resume_url?: string | null;
          status?: CandidateStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          resume_url?: string | null;
          status?: CandidateStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string | null;
          title: string;
          description: string | null;
          status: JobStatus;
          location: string | null;
          salary_range: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          title: string;
          description?: string | null;
          status?: JobStatus;
          location?: string | null;
          salary_range?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          title?: string;
          description?: string | null;
          status?: JobStatus;
          location?: string | null;
          salary_range?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          entity_type: EntityType;
          entity_id: string;
          content: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: EntityType;
          entity_id: string;
          content: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: EntityType;
          entity_id?: string;
          content?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          status: TaskStatus;
          assigned_to: string | null;
          related_entity_type: EntityType | null;
          related_entity_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          assigned_to?: string | null;
          related_entity_type?: EntityType | null;
          related_entity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          assigned_to?: string | null;
          related_entity_type?: EntityType | null;
          related_entity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
