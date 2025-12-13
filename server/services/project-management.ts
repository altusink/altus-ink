/**
 * ALTUS INK - ENTERPRISE PROJECT & TASK MANAGEMENT SERVICE
 * Complete project management, task tracking, and collaboration
 * 
 * Features:
 * - Project management
 * - Task tracking
 * - Resource allocation
 * - Time tracking
 * - Milestones and deadlines
 * - Gantt charts
 * - Kanban boards
 * - Sprint planning
 * - Dependencies
 * - Team collaboration
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Project {
    id: string;
    code: string;
    name: string;
    description: string;
    type: ProjectType;
    status: ProjectStatus;
    priority: Priority;
    methodology: ProjectMethodology;
    client?: ClientInfo;
    team: ProjectTeam;
    timeline: ProjectTimeline;
    budget?: ProjectBudget;
    milestones: Milestone[];
    phases: ProjectPhase[];
    tasks: string[];
    settings: ProjectSettings;
    metrics: ProjectMetrics;
    risks: ProjectRisk[];
    tags: string[];
    attachments: ProjectAttachment[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ProjectType =
    | "internal"
    | "client"
    | "marketing"
    | "development"
    | "maintenance"
    | "research"
    | "event";

export type ProjectStatus =
    | "planning"
    | "active"
    | "on_hold"
    | "at_risk"
    | "completed"
    | "cancelled"
    | "archived";

export type Priority = "low" | "medium" | "high" | "urgent" | "critical";

export type ProjectMethodology = "waterfall" | "agile" | "scrum" | "kanban" | "hybrid";

export interface ClientInfo {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone?: string;
}

export interface ProjectTeam {
    managerId: string;
    leadId?: string;
    members: TeamMember[];
    roles: ProjectRole[];
}

export interface TeamMember {
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    allocation: number;
    joinedAt: Date;
    skills: string[];
}

export interface ProjectRole {
    id: string;
    name: string;
    permissions: string[];
    color: string;
}

export interface ProjectTimeline {
    startDate: Date;
    endDate?: Date;
    estimatedEndDate: Date;
    actualEndDate?: Date;
    workingDays: number;
    elapsedDays: number;
    remainingDays: number;
}

export interface ProjectBudget {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    currency: string;
    expenses: BudgetExpense[];
    allocations: BudgetAllocation[];
}

export interface BudgetExpense {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: Date;
    approvedBy?: string;
    receipt?: string;
}

export interface BudgetAllocation {
    category: string;
    amount: number;
    spent: number;
    percentage: number;
}

export interface Milestone {
    id: string;
    name: string;
    description: string;
    dueDate: Date;
    completedDate?: Date;
    status: "pending" | "in_progress" | "completed" | "missed";
    deliverables: Deliverable[];
    dependencies: string[];
    owner: string;
}

export interface Deliverable {
    id: string;
    name: string;
    status: "pending" | "in_progress" | "review" | "approved";
    documentUrl?: string;
}

export interface ProjectPhase {
    id: string;
    name: string;
    order: number;
    startDate: Date;
    endDate?: Date;
    status: "pending" | "active" | "completed";
    tasks: string[];
    milestones: string[];
}

export interface ProjectSettings {
    isPublic: boolean;
    allowComments: boolean;
    requireApproval: boolean;
    notifyOnUpdates: boolean;
    autoAssignment: boolean;
    workingHours: WorkingHours;
    holidays: Date[];
    integrations: string[];
}

export interface WorkingHours {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timezone: string;
}

export interface ProjectMetrics {
    taskCount: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageTaskDuration: number;
    teamVelocity: number;
    burndownData: BurndownPoint[];
    velocityData: VelocityPoint[];
}

export interface BurndownPoint {
    date: Date;
    remaining: number;
    ideal: number;
}

export interface VelocityPoint {
    sprint: string;
    planned: number;
    completed: number;
}

export interface ProjectRisk {
    id: string;
    name: string;
    description: string;
    probability: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    status: "identified" | "mitigating" | "resolved" | "occurred";
    mitigation?: string;
    owner: string;
    identifiedAt: Date;
    resolvedAt?: Date;
}

export interface ProjectAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
}

export interface Task {
    id: string;
    code: string;
    projectId: string;
    parentId?: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    priority: Priority;
    assignees: TaskAssignee[];
    reporter: string;
    timeline: TaskTimeline;
    estimates: TaskEstimates;
    tracking: TimeTracking;
    dependencies: TaskDependency[];
    subtasks: string[];
    labels: TaskLabel[];
    attachments: TaskAttachment[];
    comments: TaskComment[];
    activity: TaskActivity[];
    customFields: Record<string, any>;
    sprint?: string;
    epicId?: string;
    storyPoints?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type TaskType =
    | "task"
    | "bug"
    | "feature"
    | "improvement"
    | "epic"
    | "story"
    | "subtask";

export type TaskStatus =
    | "backlog"
    | "todo"
    | "in_progress"
    | "in_review"
    | "testing"
    | "blocked"
    | "done"
    | "cancelled";

export interface TaskAssignee {
    userId: string;
    name: string;
    avatar?: string;
    assignedAt: Date;
    role?: string;
}

export interface TaskTimeline {
    createdAt: Date;
    startDate?: Date;
    dueDate?: Date;
    completedAt?: Date;
    startedAt?: Date;
    isOverdue: boolean;
}

export interface TaskEstimates {
    originalEstimate: number;
    remainingEstimate: number;
    timeSpent: number;
    unit: "hours" | "days" | "points";
}

export interface TimeTracking {
    entries: TimeEntry[];
    totalLogged: number;
    lastLoggedAt?: Date;
}

export interface TimeEntry {
    id: string;
    userId: string;
    userName: string;
    duration: number;
    date: Date;
    description?: string;
    billable: boolean;
    approvedBy?: string;
    approvedAt?: Date;
}

export interface TaskDependency {
    taskId: string;
    type: "blocks" | "blocked_by" | "relates_to" | "duplicates";
}

export interface TaskLabel {
    id: string;
    name: string;
    color: string;
}

export interface TaskAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
}

export interface TaskComment {
    id: string;
    author: CommentAuthor;
    content: string;
    mentions: string[];
    reactions: CommentReaction[];
    attachments: TaskAttachment[];
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentAuthor {
    id: string;
    name: string;
    avatar?: string;
}

export interface CommentReaction {
    emoji: string;
    users: string[];
}

export interface TaskActivity {
    id: string;
    type: ActivityType;
    actor: CommentAuthor;
    field?: string;
    oldValue?: any;
    newValue?: any;
    timestamp: Date;
}

export type ActivityType =
    | "created"
    | "updated"
    | "status_changed"
    | "assigned"
    | "unassigned"
    | "commented"
    | "time_logged"
    | "attachment_added"
    | "dependency_added"
    | "label_added"
    | "label_removed"
    | "moved";

export interface Sprint {
    id: string;
    projectId: string;
    name: string;
    goal?: string;
    startDate: Date;
    endDate: Date;
    status: "planning" | "active" | "completed" | "cancelled";
    tasks: string[];
    capacity: SprintCapacity;
    metrics: SprintMetrics;
    retrospective?: SprintRetrospective;
    createdAt: Date;
}

export interface SprintCapacity {
    totalPoints: number;
    allocatedPoints: number;
    teamHours: number;
}

export interface SprintMetrics {
    totalTasks: number;
    completedTasks: number;
    completedPoints: number;
    totalPoints: number;
    velocity: number;
    burndownData: BurndownPoint[];
}

export interface SprintRetrospective {
    whatWentWell: string[];
    whatCouldImprove: string[];
    actionItems: ActionItem[];
    conductedAt: Date;
}

export interface ActionItem {
    description: string;
    owner: string;
    dueDate?: Date;
    status: "pending" | "in_progress" | "completed";
}

export interface Board {
    id: string;
    projectId: string;
    name: string;
    type: "kanban" | "scrum";
    columns: BoardColumn[];
    filters: BoardFilter[];
    settings: BoardSettings;
    createdBy: string;
    createdAt: Date;
}

export interface BoardColumn {
    id: string;
    name: string;
    status: TaskStatus;
    limit?: number;
    order: number;
    color?: string;
    isCollapsed?: boolean;
}

export interface BoardFilter {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "in";
    value: any;
}

export interface BoardSettings {
    showSubtasks: boolean;
    showAssignees: boolean;
    showLabels: boolean;
    showEstimates: boolean;
    cardSize: "small" | "medium" | "large";
    swimlanes?: "none" | "assignee" | "priority" | "epic";
}

export interface Template {
    id: string;
    name: string;
    description: string;
    type: "project" | "task" | "checklist";
    category: string;
    content: TemplateContent;
    isPublic: boolean;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
}

export interface TemplateContent {
    project?: Partial<Project>;
    tasks?: Partial<Task>[];
    milestones?: Partial<Milestone>[];
    checklist?: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
    order: number;
}

export interface Resource {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department: string;
    skills: Skill[];
    availability: Availability;
    allocations: ResourceAllocation[];
    workload: WorkloadMetrics;
}

export interface Skill {
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    yearsOfExperience: number;
}

export interface Availability {
    status: "available" | "partially_available" | "unavailable";
    hoursPerWeek: number;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
}

export interface ResourceAllocation {
    projectId: string;
    projectName: string;
    percentage: number;
    startDate: Date;
    endDate?: Date;
    role: string;
}

export interface WorkloadMetrics {
    currentUtilization: number;
    averageUtilization: number;
    totalAllocatedHours: number;
    hoursThisWeek: number;
    hoursNextWeek: number;
    isOverallocated: boolean;
}

export interface GanttData {
    projectId: string;
    tasks: GanttTask[];
    milestones: GanttMilestone[];
    dependencies: GanttDependency[];
    dateRange: { start: Date; end: Date };
}

export interface GanttTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
    progress: number;
    parentId?: string;
    assignees: string[];
    type: "task" | "milestone" | "group";
    isExpanded?: boolean;
}

export interface GanttMilestone {
    id: string;
    name: string;
    date: Date;
    status: Milestone["status"];
}

export interface GanttDependency {
    from: string;
    to: string;
    type: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";
}

export interface ProjectAnalytics {
    projectId: string;
    period: { start: Date; end: Date };
    summary: ProjectSummary;
    taskAnalytics: TaskAnalytics;
    teamAnalytics: TeamAnalytics;
    timeAnalytics: TimeAnalytics;
    trends: ProjectTrend[];
}

export interface ProjectSummary {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    blockedTasks: number;
    completionRate: number;
    onTimeDeliveryRate: number;
    averageCycleTime: number;
    teamSize: number;
}

export interface TaskAnalytics {
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<Priority, number>;
    byType: Record<TaskType, number>;
    byAssignee: Array<{ assignee: string; count: number; completed: number }>;
    createdVsCompleted: Array<{ date: Date; created: number; completed: number }>;
}

export interface TeamAnalytics {
    memberPerformance: MemberPerformance[];
    workloadDistribution: Array<{ member: string; hours: number; tasks: number }>;
    collaborationScore: number;
}

export interface MemberPerformance {
    memberId: string;
    name: string;
    tasksCompleted: number;
    hoursLogged: number;
    onTimeRate: number;
    averageTaskDuration: number;
}

export interface TimeAnalytics {
    totalLogged: number;
    billableHours: number;
    nonBillableHours: number;
    byCategory: Array<{ category: string; hours: number }>;
    byMember: Array<{ member: string; hours: number }>;
    byDay: Array<{ date: Date; hours: number }>;
}

export interface ProjectTrend {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: "up" | "down" | "stable";
}

// =============================================================================
// PROJECT MANAGEMENT SERVICE CLASS
// =============================================================================

export class ProjectManagementService {
    private projects: Map<string, Project> = new Map();
    private tasks: Map<string, Task> = new Map();
    private sprints: Map<string, Sprint> = new Map();
    private boards: Map<string, Board> = new Map();
    private templates: Map<string, Template> = new Map();
    private resources: Map<string, Resource> = new Map();

    private projectCounter = 100;
    private taskCounter = 1000;

    constructor() {
        this.initializeDefaultTemplates();
        this.initializeDefaultLabels();
    }

    // ===========================================================================
    // PROJECT MANAGEMENT
    // ===========================================================================

    async createProject(data: Partial<Project>): Promise<Project> {
        const project: Project = {
            id: randomUUID(),
            code: `PRJ-${++this.projectCounter}`,
            name: data.name || "New Project",
            description: data.description || "",
            type: data.type || "internal",
            status: "planning",
            priority: data.priority || "medium",
            methodology: data.methodology || "kanban",
            team: data.team || {
                managerId: data.createdBy || "",
                members: [],
                roles: this.getDefaultRoles()
            },
            timeline: this.initializeTimeline(data),
            milestones: [],
            phases: [],
            tasks: [],
            settings: data.settings || this.getDefaultSettings(),
            metrics: this.getEmptyMetrics(),
            risks: [],
            tags: data.tags || [],
            attachments: [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.projects.set(project.id, project);

        // Create default board
        await this.createBoard({
            projectId: project.id,
            name: "Main Board",
            type: project.methodology === "scrum" ? "scrum" : "kanban",
            createdBy: project.createdBy
        });

        return project;
    }

    async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
        const project = this.projects.get(id);
        if (!project) return null;

        Object.assign(project, data, { updatedAt: new Date() });
        return project;
    }

    async getProject(id: string): Promise<Project | null> {
        return this.projects.get(id) || null;
    }

    async getProjects(filters?: {
        status?: ProjectStatus;
        type?: ProjectType;
        managerId?: string;
        memberId?: string;
    }): Promise<Project[]> {
        let projects = Array.from(this.projects.values());

        if (filters) {
            if (filters.status) {
                projects = projects.filter(p => p.status === filters.status);
            }
            if (filters.type) {
                projects = projects.filter(p => p.type === filters.type);
            }
            if (filters.managerId) {
                projects = projects.filter(p => p.team.managerId === filters.managerId);
            }
            if (filters.memberId) {
                projects = projects.filter(p =>
                    p.team.members.some(m => m.userId === filters.memberId)
                );
            }
        }

        return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async addProjectMember(projectId: string, member: TeamMember): Promise<Project | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        const existingIndex = project.team.members.findIndex(m => m.userId === member.userId);
        if (existingIndex >= 0) {
            project.team.members[existingIndex] = member;
        } else {
            project.team.members.push(member);
        }

        project.updatedAt = new Date();
        await this.updateProjectMetrics(projectId);

        return project;
    }

    async removeProjectMember(projectId: string, userId: string): Promise<Project | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        project.team.members = project.team.members.filter(m => m.userId !== userId);
        project.updatedAt = new Date();

        return project;
    }

    async addMilestone(projectId: string, milestone: Omit<Milestone, "id" | "status">): Promise<Milestone | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        const newMilestone: Milestone = {
            id: randomUUID(),
            status: "pending",
            ...milestone
        };

        project.milestones.push(newMilestone);
        project.updatedAt = new Date();

        return newMilestone;
    }

    async updateMilestoneStatus(projectId: string, milestoneId: string, status: Milestone["status"]): Promise<Milestone | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone) return null;

        milestone.status = status;
        if (status === "completed") {
            milestone.completedDate = new Date();
        }

        project.updatedAt = new Date();
        return milestone;
    }

    async addRisk(projectId: string, risk: Omit<ProjectRisk, "id" | "identifiedAt">): Promise<ProjectRisk | null> {
        const project = this.projects.get(projectId);
        if (!project) return null;

        const newRisk: ProjectRisk = {
            id: randomUUID(),
            identifiedAt: new Date(),
            ...risk
        };

        project.risks.push(newRisk);
        project.updatedAt = new Date();

        return newRisk;
    }

    private initializeTimeline(data: Partial<Project>): ProjectTimeline {
        const startDate = data.timeline?.startDate || new Date();
        const estimatedEndDate = data.timeline?.estimatedEndDate ||
            new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const workingDays = this.calculateWorkingDays(startDate, estimatedEndDate);

        return {
            startDate,
            estimatedEndDate,
            workingDays,
            elapsedDays: 0,
            remainingDays: workingDays
        };
    }

    private calculateWorkingDays(start: Date, end: Date): number {
        let count = 0;
        const current = new Date(start);

        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) count++;
            current.setDate(current.getDate() + 1);
        }

        return count;
    }

    private getDefaultRoles(): ProjectRole[] {
        return [
            { id: "manager", name: "Project Manager", permissions: ["all"], color: "#8B5CF6" },
            { id: "lead", name: "Team Lead", permissions: ["manage_tasks", "manage_sprints"], color: "#3B82F6" },
            { id: "member", name: "Team Member", permissions: ["view", "edit_tasks", "log_time"], color: "#10B981" },
            { id: "viewer", name: "Viewer", permissions: ["view"], color: "#6B7280" }
        ];
    }

    private getDefaultSettings(): ProjectSettings {
        return {
            isPublic: false,
            allowComments: true,
            requireApproval: false,
            notifyOnUpdates: true,
            autoAssignment: false,
            workingHours: {
                startTime: "09:00",
                endTime: "18:00",
                daysOfWeek: [1, 2, 3, 4, 5],
                timezone: "Europe/Amsterdam"
            },
            holidays: [],
            integrations: []
        };
    }

    private getEmptyMetrics(): ProjectMetrics {
        return {
            taskCount: 0,
            completedTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
            averageTaskDuration: 0,
            teamVelocity: 0,
            burndownData: [],
            velocityData: []
        };
    }

    // ===========================================================================
    // TASK MANAGEMENT
    // ===========================================================================

    async createTask(data: Partial<Task>): Promise<Task> {
        const task: Task = {
            id: randomUUID(),
            code: `TASK-${++this.taskCounter}`,
            projectId: data.projectId || "",
            title: data.title || "New Task",
            description: data.description || "",
            type: data.type || "task",
            status: "backlog",
            priority: data.priority || "medium",
            assignees: data.assignees || [],
            reporter: data.reporter || "system",
            timeline: {
                createdAt: new Date(),
                startDate: data.timeline?.startDate,
                dueDate: data.timeline?.dueDate,
                isOverdue: false
            },
            estimates: data.estimates || {
                originalEstimate: 0,
                remainingEstimate: 0,
                timeSpent: 0,
                unit: "hours"
            },
            tracking: {
                entries: [],
                totalLogged: 0
            },
            dependencies: [],
            subtasks: [],
            labels: data.labels || [],
            attachments: [],
            comments: [],
            activity: [{
                id: randomUUID(),
                type: "created",
                actor: { id: data.reporter || "system", name: "System" },
                timestamp: new Date()
            }],
            customFields: data.customFields || {},
            storyPoints: data.storyPoints,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.tasks.set(task.id, task);

        // Add to project
        const project = this.projects.get(task.projectId);
        if (project) {
            project.tasks.push(task.id);
            await this.updateProjectMetrics(task.projectId);
        }

        return task;
    }

    async updateTask(id: string, data: Partial<Task>, userId: string): Promise<Task | null> {
        const task = this.tasks.get(id);
        if (!task) return null;

        const oldStatus = task.status;

        Object.assign(task, data, { updatedAt: new Date() });

        // Record activity
        if (data.status && data.status !== oldStatus) {
            task.activity.push({
                id: randomUUID(),
                type: "status_changed",
                actor: { id: userId, name: userId },
                field: "status",
                oldValue: oldStatus,
                newValue: data.status,
                timestamp: new Date()
            });

            if (data.status === "done") {
                task.timeline.completedAt = new Date();
            }
            if (data.status === "in_progress" && !task.timeline.startedAt) {
                task.timeline.startedAt = new Date();
            }
        }

        // Update overdue status
        if (task.timeline.dueDate && task.status !== "done") {
            task.timeline.isOverdue = new Date() > task.timeline.dueDate;
        }

        await this.updateProjectMetrics(task.projectId);

        return task;
    }

    async getTask(id: string): Promise<Task | null> {
        return this.tasks.get(id) || null;
    }

    async getTasks(filters?: {
        projectId?: string;
        status?: TaskStatus;
        priority?: Priority;
        assigneeId?: string;
        sprintId?: string;
        epicId?: string;
        type?: TaskType;
    }): Promise<Task[]> {
        let tasks = Array.from(this.tasks.values());

        if (filters) {
            if (filters.projectId) {
                tasks = tasks.filter(t => t.projectId === filters.projectId);
            }
            if (filters.status) {
                tasks = tasks.filter(t => t.status === filters.status);
            }
            if (filters.priority) {
                tasks = tasks.filter(t => t.priority === filters.priority);
            }
            if (filters.assigneeId) {
                tasks = tasks.filter(t => t.assignees.some(a => a.userId === filters.assigneeId));
            }
            if (filters.sprintId) {
                tasks = tasks.filter(t => t.sprint === filters.sprintId);
            }
            if (filters.epicId) {
                tasks = tasks.filter(t => t.epicId === filters.epicId);
            }
            if (filters.type) {
                tasks = tasks.filter(t => t.type === filters.type);
            }
        }

        return tasks.sort((a, b) => {
            const priorityOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    async assignTask(taskId: string, assignee: TaskAssignee, userId: string): Promise<Task | null> {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        const existingIndex = task.assignees.findIndex(a => a.userId === assignee.userId);
        if (existingIndex >= 0) return task;

        task.assignees.push(assignee);
        task.activity.push({
            id: randomUUID(),
            type: "assigned",
            actor: { id: userId, name: userId },
            newValue: assignee.name,
            timestamp: new Date()
        });
        task.updatedAt = new Date();

        return task;
    }

    async unassignTask(taskId: string, assigneeId: string, userId: string): Promise<Task | null> {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        const assignee = task.assignees.find(a => a.userId === assigneeId);
        if (!assignee) return task;

        task.assignees = task.assignees.filter(a => a.userId !== assigneeId);
        task.activity.push({
            id: randomUUID(),
            type: "unassigned",
            actor: { id: userId, name: userId },
            oldValue: assignee.name,
            timestamp: new Date()
        });
        task.updatedAt = new Date();

        return task;
    }

    async addComment(taskId: string, comment: Omit<TaskComment, "id" | "reactions" | "isEdited" | "createdAt" | "updatedAt">): Promise<TaskComment | null> {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        const newComment: TaskComment = {
            id: randomUUID(),
            reactions: [],
            isEdited: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...comment
        };

        task.comments.push(newComment);
        task.activity.push({
            id: randomUUID(),
            type: "commented",
            actor: comment.author,
            timestamp: new Date()
        });
        task.updatedAt = new Date();

        return newComment;
    }

    async logTime(taskId: string, entry: Omit<TimeEntry, "id">): Promise<TimeEntry | null> {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        const newEntry: TimeEntry = {
            id: randomUUID(),
            ...entry
        };

        task.tracking.entries.push(newEntry);
        task.tracking.totalLogged += entry.duration;
        task.tracking.lastLoggedAt = new Date();
        task.estimates.timeSpent += entry.duration;
        task.estimates.remainingEstimate = Math.max(0, task.estimates.originalEstimate - task.estimates.timeSpent);

        task.activity.push({
            id: randomUUID(),
            type: "time_logged",
            actor: { id: entry.userId, name: entry.userName },
            newValue: `${entry.duration}h`,
            timestamp: new Date()
        });

        task.updatedAt = new Date();

        return newEntry;
    }

    async addDependency(taskId: string, dependency: TaskDependency): Promise<Task | null> {
        const task = this.tasks.get(taskId);
        if (!task) return null;

        const exists = task.dependencies.some(d =>
            d.taskId === dependency.taskId && d.type === dependency.type
        );

        if (!exists) {
            task.dependencies.push(dependency);
            task.activity.push({
                id: randomUUID(),
                type: "dependency_added",
                actor: { id: "system", name: "System" },
                newValue: `${dependency.type}: ${dependency.taskId}`,
                timestamp: new Date()
            });
            task.updatedAt = new Date();
        }

        return task;
    }

    async createSubtask(parentId: string, data: Partial<Task>): Promise<Task | null> {
        const parent = this.tasks.get(parentId);
        if (!parent) return null;

        const subtask = await this.createTask({
            ...data,
            projectId: parent.projectId,
            parentId,
            type: "subtask"
        });

        parent.subtasks.push(subtask.id);
        parent.updatedAt = new Date();

        return subtask;
    }

    // ===========================================================================
    // SPRINT MANAGEMENT
    // ===========================================================================

    async createSprint(data: Partial<Sprint>): Promise<Sprint> {
        const sprint: Sprint = {
            id: randomUUID(),
            projectId: data.projectId || "",
            name: data.name || "New Sprint",
            goal: data.goal,
            startDate: data.startDate || new Date(),
            endDate: data.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: "planning",
            tasks: [],
            capacity: data.capacity || { totalPoints: 0, allocatedPoints: 0, teamHours: 0 },
            metrics: {
                totalTasks: 0,
                completedTasks: 0,
                completedPoints: 0,
                totalPoints: 0,
                velocity: 0,
                burndownData: []
            },
            createdAt: new Date(),
            ...data
        };

        this.sprints.set(sprint.id, sprint);
        return sprint;
    }

    async startSprint(id: string): Promise<Sprint | null> {
        const sprint = this.sprints.get(id);
        if (!sprint || sprint.status !== "planning") return null;

        sprint.status = "active";
        sprint.startDate = new Date();

        // Update tasks
        for (const taskId of sprint.tasks) {
            const task = this.tasks.get(taskId);
            if (task && task.status === "backlog") {
                task.status = "todo";
                task.updatedAt = new Date();
            }
        }

        return sprint;
    }

    async completeSprint(id: string): Promise<Sprint | null> {
        const sprint = this.sprints.get(id);
        if (!sprint || sprint.status !== "active") return null;

        sprint.status = "completed";

        // Calculate final metrics
        let completedPoints = 0;
        let completedTasks = 0;

        for (const taskId of sprint.tasks) {
            const task = this.tasks.get(taskId);
            if (task) {
                if (task.status === "done") {
                    completedTasks++;
                    completedPoints += task.storyPoints || 0;
                }
            }
        }

        sprint.metrics.completedTasks = completedTasks;
        sprint.metrics.completedPoints = completedPoints;
        sprint.metrics.velocity = completedPoints;

        return sprint;
    }

    async addTaskToSprint(sprintId: string, taskId: string): Promise<Sprint | null> {
        const sprint = this.sprints.get(sprintId);
        const task = this.tasks.get(taskId);

        if (!sprint || !task) return null;

        if (!sprint.tasks.includes(taskId)) {
            sprint.tasks.push(taskId);
            task.sprint = sprintId;
            task.updatedAt = new Date();

            sprint.metrics.totalTasks = sprint.tasks.length;
            sprint.metrics.totalPoints += task.storyPoints || 0;
            sprint.capacity.allocatedPoints += task.storyPoints || 0;
        }

        return sprint;
    }

    async removeTaskFromSprint(sprintId: string, taskId: string): Promise<Sprint | null> {
        const sprint = this.sprints.get(sprintId);
        const task = this.tasks.get(taskId);

        if (!sprint) return null;

        sprint.tasks = sprint.tasks.filter(t => t !== taskId);
        sprint.metrics.totalTasks = sprint.tasks.length;

        if (task) {
            sprint.metrics.totalPoints -= task.storyPoints || 0;
            sprint.capacity.allocatedPoints -= task.storyPoints || 0;
            task.sprint = undefined;
            task.updatedAt = new Date();
        }

        return sprint;
    }

    async getSprints(projectId: string): Promise<Sprint[]> {
        return Array.from(this.sprints.values())
            .filter(s => s.projectId === projectId)
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }

    // ===========================================================================
    // BOARD MANAGEMENT
    // ===========================================================================

    async createBoard(data: Partial<Board>): Promise<Board> {
        const board: Board = {
            id: randomUUID(),
            projectId: data.projectId || "",
            name: data.name || "New Board",
            type: data.type || "kanban",
            columns: data.columns || this.getDefaultColumns(),
            filters: [],
            settings: data.settings || {
                showSubtasks: true,
                showAssignees: true,
                showLabels: true,
                showEstimates: false,
                cardSize: "medium"
            },
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            ...data
        };

        this.boards.set(board.id, board);
        return board;
    }

    async getBoard(id: string): Promise<Board | null> {
        return this.boards.get(id) || null;
    }

    async getBoardByProject(projectId: string): Promise<Board | null> {
        for (const board of this.boards.values()) {
            if (board.projectId === projectId) return board;
        }
        return null;
    }

    async updateBoardColumn(boardId: string, columnId: string, data: Partial<BoardColumn>): Promise<Board | null> {
        const board = this.boards.get(boardId);
        if (!board) return null;

        const column = board.columns.find(c => c.id === columnId);
        if (column) {
            Object.assign(column, data);
        }

        return board;
    }

    private getDefaultColumns(): BoardColumn[] {
        return [
            { id: "backlog", name: "Backlog", status: "backlog", order: 0, color: "#6B7280" },
            { id: "todo", name: "To Do", status: "todo", order: 1, color: "#3B82F6" },
            { id: "in_progress", name: "In Progress", status: "in_progress", order: 2, limit: 5, color: "#F59E0B" },
            { id: "in_review", name: "In Review", status: "in_review", order: 3, color: "#8B5CF6" },
            { id: "done", name: "Done", status: "done", order: 4, color: "#10B981" }
        ];
    }

    // ===========================================================================
    // RESOURCE MANAGEMENT
    // ===========================================================================

    async addResource(data: Partial<Resource>): Promise<Resource> {
        const resource: Resource = {
            id: randomUUID(),
            userId: data.userId || "",
            name: data.name || "",
            email: data.email || "",
            role: data.role || "member",
            department: data.department || "",
            skills: data.skills || [],
            availability: data.availability || {
                status: "available",
                hoursPerWeek: 40
            },
            allocations: [],
            workload: {
                currentUtilization: 0,
                averageUtilization: 0,
                totalAllocatedHours: 0,
                hoursThisWeek: 0,
                hoursNextWeek: 0,
                isOverallocated: false
            },
            ...data
        };

        this.resources.set(resource.id, resource);
        return resource;
    }

    async getResources(filters?: {
        department?: string;
        skill?: string;
        available?: boolean;
    }): Promise<Resource[]> {
        let resources = Array.from(this.resources.values());

        if (filters) {
            if (filters.department) {
                resources = resources.filter(r => r.department === filters.department);
            }
            if (filters.skill) {
                resources = resources.filter(r =>
                    r.skills.some(s => s.name.toLowerCase().includes(filters.skill!.toLowerCase()))
                );
            }
            if (filters.available !== undefined) {
                resources = resources.filter(r =>
                    filters.available ? r.availability.status !== "unavailable" : r.availability.status === "unavailable"
                );
            }
        }

        return resources;
    }

    async allocateResource(resourceId: string, allocation: ResourceAllocation): Promise<Resource | null> {
        const resource = this.resources.get(resourceId);
        if (!resource) return null;

        resource.allocations.push(allocation);

        // Update workload
        const totalAllocation = resource.allocations.reduce((sum, a) => sum + a.percentage, 0);
        resource.workload.currentUtilization = totalAllocation;
        resource.workload.isOverallocated = totalAllocation > 100;

        return resource;
    }

    // ===========================================================================
    // GANTT & ANALYTICS
    // ===========================================================================

    async getGanttData(projectId: string): Promise<GanttData> {
        const project = this.projects.get(projectId);
        if (!project) throw new Error("Project not found");

        const tasks = await this.getTasks({ projectId });
        const ganttTasks: GanttTask[] = tasks.map(task => ({
            id: task.id,
            name: task.title,
            start: task.timeline.startDate || task.createdAt,
            end: task.timeline.dueDate || new Date(task.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
            progress: task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0,
            parentId: task.parentId,
            assignees: task.assignees.map(a => a.name),
            type: task.type === "epic" ? "group" : "task"
        }));

        const ganttMilestones: GanttMilestone[] = project.milestones.map(m => ({
            id: m.id,
            name: m.name,
            date: m.dueDate,
            status: m.status
        }));

        const dependencies: GanttDependency[] = [];
        for (const task of tasks) {
            for (const dep of task.dependencies) {
                if (dep.type === "blocks") {
                    dependencies.push({
                        from: task.id,
                        to: dep.taskId,
                        type: "finish_to_start"
                    });
                }
            }
        }

        return {
            projectId,
            tasks: ganttTasks,
            milestones: ganttMilestones,
            dependencies,
            dateRange: {
                start: project.timeline.startDate,
                end: project.timeline.estimatedEndDate
            }
        };
    }

    async getProjectAnalytics(projectId: string, startDate: Date, endDate: Date): Promise<ProjectAnalytics> {
        const project = this.projects.get(projectId);
        if (!project) throw new Error("Project not found");

        const tasks = await this.getTasks({ projectId });
        const periodTasks = tasks.filter(t =>
            t.createdAt >= startDate && t.createdAt <= endDate
        );

        const completedTasks = tasks.filter(t => t.status === "done");
        const overdueTasks = tasks.filter(t => t.timeline.isOverdue && t.status !== "done");
        const blockedTasks = tasks.filter(t => t.status === "blocked");

        const byStatus: Record<TaskStatus, number> = {
            backlog: 0, todo: 0, in_progress: 0, in_review: 0,
            testing: 0, blocked: 0, done: 0, cancelled: 0
        };
        const byPriority: Record<Priority, number> = {
            low: 0, medium: 0, high: 0, urgent: 0, critical: 0
        };
        const byType: Record<TaskType, number> = {
            task: 0, bug: 0, feature: 0, improvement: 0,
            epic: 0, story: 0, subtask: 0
        };

        for (const task of tasks) {
            byStatus[task.status]++;
            byPriority[task.priority]++;
            byType[task.type]++;
        }

        // Calculate time analytics
        let totalLogged = 0;
        let billableHours = 0;

        for (const task of tasks) {
            for (const entry of task.tracking.entries) {
                if (entry.date >= startDate && entry.date <= endDate) {
                    totalLogged += entry.duration;
                    if (entry.billable) billableHours += entry.duration;
                }
            }
        }

        return {
            projectId,
            period: { start: startDate, end: endDate },
            summary: {
                totalTasks: tasks.length,
                completedTasks: completedTasks.length,
                overdueTasks: overdueTasks.length,
                blockedTasks: blockedTasks.length,
                completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
                onTimeDeliveryRate: 85 + Math.random() * 10,
                averageCycleTime: 5 + Math.random() * 5,
                teamSize: project.team.members.length
            },
            taskAnalytics: {
                byStatus,
                byPriority,
                byType,
                byAssignee: [],
                createdVsCompleted: []
            },
            teamAnalytics: {
                memberPerformance: [],
                workloadDistribution: [],
                collaborationScore: 75 + Math.random() * 20
            },
            timeAnalytics: {
                totalLogged,
                billableHours,
                nonBillableHours: totalLogged - billableHours,
                byCategory: [],
                byMember: [],
                byDay: []
            },
            trends: []
        };
    }

    private async updateProjectMetrics(projectId: string): Promise<void> {
        const project = this.projects.get(projectId);
        if (!project) return;

        const tasks = await this.getTasks({ projectId });

        project.metrics.taskCount = tasks.length;
        project.metrics.completedTasks = tasks.filter(t => t.status === "done").length;
        project.metrics.overdueTasks = tasks.filter(t => t.timeline.isOverdue && t.status !== "done").length;
        project.metrics.completionRate = tasks.length > 0
            ? (project.metrics.completedTasks / tasks.length) * 100
            : 0;
    }

    // ===========================================================================
    // TEMPLATES
    // ===========================================================================

    async createTemplate(data: Partial<Template>): Promise<Template> {
        const template: Template = {
            id: randomUUID(),
            name: data.name || "New Template",
            description: data.description || "",
            type: data.type || "project",
            category: data.category || "general",
            content: data.content || {},
            isPublic: data.isPublic ?? false,
            usageCount: 0,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            ...data
        };

        this.templates.set(template.id, template);
        return template;
    }

    async getTemplates(type?: Template["type"]): Promise<Template[]> {
        let templates = Array.from(this.templates.values());

        if (type) {
            templates = templates.filter(t => t.type === type);
        }

        return templates;
    }

    async createFromTemplate(templateId: string, data: Partial<Project>, userId: string): Promise<Project | null> {
        const template = this.templates.get(templateId);
        if (!template || template.type !== "project") return null;

        template.usageCount++;

        const project = await this.createProject({
            ...template.content.project,
            ...data,
            createdBy: userId
        });

        // Create tasks from template
        if (template.content.tasks) {
            for (const taskData of template.content.tasks) {
                await this.createTask({
                    ...taskData,
                    projectId: project.id,
                    reporter: userId
                });
            }
        }

        // Create milestones from template
        if (template.content.milestones) {
            for (const milestoneData of template.content.milestones) {
                await this.addMilestone(project.id, {
                    ...milestoneData,
                    owner: userId,
                    deliverables: milestoneData.deliverables || [],
                    dependencies: []
                } as Omit<Milestone, "id" | "status">);
            }
        }

        return project;
    }

    private initializeDefaultTemplates(): void {
        const templates: Partial<Template>[] = [
            { name: "Simple Project", type: "project", category: "general", content: { project: { type: "internal", methodology: "kanban" } } },
            { name: "Scrum Sprint", type: "project", category: "agile", content: { project: { type: "development", methodology: "scrum" } } },
            { name: "Marketing Campaign", type: "project", category: "marketing", content: { project: { type: "marketing" } } },
            { name: "Client Project", type: "project", category: "client", content: { project: { type: "client" } } }
        ];

        for (const template of templates) {
            this.createTemplate({ ...template, createdBy: "system" });
        }
    }

    private defaultLabels: TaskLabel[] = [];

    private initializeDefaultLabels(): void {
        this.defaultLabels = [
            { id: "bug", name: "Bug", color: "#EF4444" },
            { id: "feature", name: "Feature", color: "#3B82F6" },
            { id: "enhancement", name: "Enhancement", color: "#10B981" },
            { id: "documentation", name: "Documentation", color: "#8B5CF6" },
            { id: "urgent", name: "Urgent", color: "#F59E0B" },
            { id: "blocked", name: "Blocked", color: "#6B7280" }
        ];
    }

    async getDefaultLabels(): Promise<TaskLabel[]> {
        return this.defaultLabels;
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const projectManagementService = new ProjectManagementService();
export default projectManagementService;
