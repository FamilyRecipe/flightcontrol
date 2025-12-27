import { createClient } from '@/lib/supabase/server'

export interface Project {
  id: string
  user_id: string
  github_repo_owner: string
  github_repo_name: string
  github_repo_full_name: string
  webhook_secret: string | null
  webhook_id: string | null
  experimental_mode: boolean
  created_at: string
  updated_at: string
}

export interface ProjectPlan {
  id: string
  project_id: string
  version: number
  title: string
  description: string | null
  current_step_index: number
  created_at: string
  updated_at: string
}

export interface PlanStep {
  id: string
  project_plan_id: string
  parent_step_id: string | null
  step_index: number
  title: string
  description: string
  acceptance_criteria: string | null
  status: 'pending' | 'in_progress' | 'blocked' | 'completed'
  created_at: string
  updated_at: string
}

export interface RepoSnapshot {
  id: string
  project_id: string
  snapshot_data: any
  created_at: string
}

export interface Commit {
  id: string
  project_id: string
  github_commit_sha: string
  commit_message: string
  diff: string | null
  alignment_status: 'aligned' | 'misaligned' | 'partial' | 'unplanned' | null
  reviewed: boolean
  reviewed_at: string | null
  created_at: string
}

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

/**
 * Create a new project
 */
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get project plan for a project
 */
export async function getProjectPlan(projectId: string): Promise<ProjectPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_plans')
    .select('*')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

/**
 * Create a new project plan
 */
export async function createProjectPlan(plan: Omit<ProjectPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectPlan> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_plans')
    .insert(plan)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a project plan
 */
export async function updateProjectPlan(planId: string, updates: Partial<ProjectPlan>): Promise<ProjectPlan> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all steps for a project plan
 */
export async function getPlanSteps(projectPlanId: string): Promise<PlanStep[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plan_steps')
    .select('*')
    .eq('project_plan_id', projectPlanId)
    .order('step_index', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get substeps for a parent step
 */
export async function getSubsteps(parentStepId: string): Promise<PlanStep[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plan_steps')
    .select('*')
    .eq('parent_step_id', parentStepId)
    .order('step_index', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create a plan step
 */
export async function createPlanStep(step: Omit<PlanStep, 'id' | 'created_at' | 'updated_at'>): Promise<PlanStep> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plan_steps')
    .insert(step)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a plan step
 */
export async function updatePlanStep(stepId: string, updates: Partial<PlanStep>): Promise<PlanStep> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plan_steps')
    .update(updates)
    .eq('id', stepId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create a repo snapshot
 */
export async function createRepoSnapshot(snapshot: Omit<RepoSnapshot, 'id' | 'created_at'>): Promise<RepoSnapshot> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('repo_snapshots')
    .insert(snapshot)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get latest repo snapshot for a project
 */
export async function getLatestSnapshot(projectId: string): Promise<RepoSnapshot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('repo_snapshots')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

/**
 * Create a commit record
 */
export async function createCommit(commit: Omit<Commit, 'id' | 'created_at'>): Promise<Commit> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commits')
    .insert(commit)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get commits for a project
 */
export async function getCommits(projectId: string, limit: number = 50): Promise<Commit[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commits')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Update commit alignment status
 */
export async function updateCommitAlignment(
  commitId: string,
  alignmentStatus: 'aligned' | 'misaligned' | 'partial' | 'unplanned',
  reviewed: boolean = true
): Promise<Commit> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('commits')
    .update({
      alignment_status: alignmentStatus,
      reviewed,
      reviewed_at: reviewed ? new Date().toISOString() : null,
    })
    .eq('id', commitId)
    .select()
    .single()

  if (error) throw error
  return data
}

