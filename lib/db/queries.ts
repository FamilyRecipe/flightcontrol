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

export interface AlignmentCheck {
  id: string
  project_id: string
  plan_step_id: string
  commit_id: string | null
  repo_snapshot_id: string
  alignment_result: 'aligned' | 'misaligned' | 'partial'
  analysis_data: any
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  github_access_token: string | null
  created_at: string
  updated_at: string
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:113',message:'createProject entry',data:{userId:project.user_id,repoOwner:project.github_repo_owner,repoName:project.github_repo_name},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:121',message:'createProject result',data:{hasData:!!data,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (error) throw error
  return data
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:128',message:'updateProject entry',data:{projectId,updateKeys:Object.keys(updates)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:137',message:'updateProject result',data:{hasData:!!data,hasError:!!error,errorCode:error?.code,errorMessage:error?.message,errorDetails:error?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

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

/**
 * Create an alignment check record
 */
export async function createAlignmentCheck(
  check: Omit<AlignmentCheck, 'id' | 'created_at'>
): Promise<AlignmentCheck> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alignment_checks')
    .insert(check)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get user settings
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:363',message:'getUserSettings entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:368',message:'getUserSettings user check',data:{hasUser:!!user,userId:user?.id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (!user) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/db/queries.ts:377',message:'getUserSettings query result',data:{hasData:!!data,hasError:!!error,errorCode:error?.code,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

/**
 * Create or update user settings
 */
export async function upsertUserSettings(settings: {
  github_access_token?: string | null
}): Promise<UserSettings> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      ...settings,
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

