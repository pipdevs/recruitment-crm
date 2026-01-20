recruitment-crm

Prompt 1:

Create the foundation for a recruitment CRM.

Set up authentication with user roles (Admin, Manager, Recruiter).
Define the database schema for users, companies, candidates, jobs, notes, and tasks.
Create the main app layout with sidebar navigation.
Do not build full CRUD flows yet.
Focus only on structure, schema, and auth.
Write all generated files to the project.

----------

Output 1:

The foundation for your recruitment CRM is now complete and fully functional. Here's what has been built:

Database Schema:

Users with role-based access (Admin, Manager, Recruiter)
Companies, Candidates, Jobs, Tasks, and Notes tables
Row-level security policies for all tables
Proper foreign key relationships and indexes
Authentication System:

Email and password authentication via Bolt Database
User registration with role selection
Profile management linked to auth users
Secure session handling
Application Structure:

Clean sidebar navigation layout
Login and signup pages with modern design
Protected routes that require authentication
Six main sections: Dashboard, Candidates, Companies, Jobs, Tasks, and Notes
Each section has placeholder UI ready for CRUD functionality
Technical Foundation:

TypeScript types for all database tables
Bolt Database client configuration
React context for auth state management
Modular component architecture
Responsive design with Tailwind CSS
You can now sign up with any role (Admin, Manager, or Recruiter) and explore the interface. The structure is ready for implementing full CRUD operations for each entity whenever you're ready to build those features.

//

Prompt 2:

Build full CRUD functionality for Companies and Candidates.
Add company pages with notes and activity timelines.
Add candidate profiles with tags and status.
Preserve existing auth, schema, and layout.

------------

Output 2:

Perfect! Full CRUD functionality has been built for both Companies and Candidates. Here's what was implemented:

Companies Module:

Complete list view with company cards showing name, industry, website link, and notes
Detail page with activity timeline (creation and last update dates)
Notes section with add, view, and delete capability
Create, edit, and delete company records via modal
Real-time list updates after each operation
Candidates Module:

List view displaying candidates with status badges (color-coded)
Quick access to email, phone, and LinkedIn links
Candidate profile pages with full contact details and resume links
Pipeline status selector to move candidates through stages (New → Screening → Interview → Offer → Hired/Rejected)
Activity timeline and notes section for tracking interactions
Create, edit, and delete functionality via modal
Features:

Database services for Companies and Candidates with full CRUD operations
Modal forms for creating/editing records
Detail views with notes and activity timelines
Status badges with color coding for candidate pipeline stages
Delete confirmations to prevent accidental removal
Responsive design that works across devices
All operations integrated with Bolt Database and RLS policies
The entire project builds successfully and preserves all existing authentication, schema, and layout structure. You can now sign up and start managing your companies and candidates!

//