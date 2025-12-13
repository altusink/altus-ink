/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUS INK - ENTERPRISE LEARNING MANAGEMENT SYSTEM (LMS) SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive training, certification, and skill development platform
 * 
 * TARGET SCALE: 100K+ Learners, 1000+ Courses
 * COMPLIANCE: SCORM 2004, xAPI/Tin Can, Section 508
 * 
 * FEATURES:
 * - Course Management & Authoring
 * - Learning Paths & Curriculums
 * - Quizzes, Assessments & Exams
 * - Certification Management
 * - Progress Tracking & Analytics
 * - Live Webinars & Events
 * - Social Learning & Discussions
 * - Gamification (Badges, Points, Leaderboards)
 * - Skills Matrix & Competency Mapping
 * - SCORM/xAPI Content Support
 * - Instructor-Led Training (ILT)
 * - Virtual Classroom Integration
 * - Assignment & Project Management
 * - Peer Reviews & Feedback
 * - Mobile Learning Support
 * - Offline Content Access
 * - Multi-Language Content
 * 
 * @module services/learning-management
 * @version 3.0.0
 */

import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { eventBus } from "./core/event-bus";
import { telemetry } from "./core/telemetry";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: COURSES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Course {
    id: string;
    code: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    objectives: string[];
    thumbnailUrl: string;
    promoVideoUrl?: string;
    category: CourseCategory;
    subcategory?: string;
    level: CourseLevel;
    status: CourseStatus;
    visibility: "public" | "private" | "organization";
    pricing: CoursePricing;
    duration: CourseDuration;
    instructor: InstructorInfo;
    coInstructors: InstructorInfo[];
    prerequisites: string[];
    skills: SkillMapping[];
    competencies: CompetencyMapping[];
    tags: string[];
    modules: CourseModule[];
    resources: CourseResource[];
    settings: CourseSettings;
    accessibility: AccessibilitySettings;
    localization: LocalizationSettings;
    analytics: CourseAnalytics;
    reviews: CourseReview[];
    metadata: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    archivedAt?: Date;
}

export type CourseCategory = "technical" | "artistic" | "safety" | "business" | "compliance" | "onboarding" | "soft_skills" | "certification_prep";
export type CourseLevel = "beginner" | "intermediate" | "advanced" | "expert" | "all_levels";
export type CourseStatus = "draft" | "in_review" | "published" | "archived" | "retired";

export interface CoursePricing {
    isFree: boolean;
    price: number;
    currency: string;
    discountPrice?: number;
    discountEndsAt?: Date;
    subscriptionIncluded: boolean;
    corporateRate?: number;
}

export interface CourseDuration {
    totalMinutes: number;
    estimatedCompletionDays: number;
    selfPaced: boolean;
    startDate?: Date;
    endDate?: Date;
    accessDays?: number;
}

export interface InstructorInfo {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
    expertise: string[];
    rating: number;
    coursesCount: number;
    studentsCount: number;
}

export interface SkillMapping {
    skillId: string;
    skillName: string;
    proficiencyLevel: "awareness" | "working" | "practitioner" | "expert";
}

export interface CompetencyMapping {
    competencyId: string;
    competencyName: string;
    weight: number;
}

export interface CourseSettings {
    selfPaced: boolean;
    hasCertificate: boolean;
    certificateTemplateId?: string;
    requiresApproval: boolean;
    approverIds?: string[];
    allowGuestPreview: boolean;
    previewModules: string[];
    maxAttempts: number;
    passingScore: number;
    showProgressBar: boolean;
    allowSkipLessons: boolean;
    enforceSequence: boolean;
    allowDownloads: boolean;
    allowNotes: boolean;
    allowBookmarks: boolean;
    enableDiscussions: boolean;
    enableQA: boolean;
    autoEnrollNewUsers: boolean;
    completionCriteria: CompletionCriteria;
    notifications: NotificationSettings;
}

export interface CompletionCriteria {
    type: "all_lessons" | "percentage" | "required_only" | "quiz_pass";
    percentage?: number;
    requiredLessons?: string[];
    minimumScore?: number;
}

export interface NotificationSettings {
    enrollmentConfirmation: boolean;
    progressReminders: boolean;
    reminderFrequency: "daily" | "weekly" | "none";
    completionNotification: boolean;
    certificateNotification: boolean;
    dueDateReminders: boolean;
}

export interface AccessibilitySettings {
    hasClosedCaptions: boolean;
    hasTranscripts: boolean;
    hasAudioDescriptions: boolean;
    highContrastMode: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigable: boolean;
}

export interface LocalizationSettings {
    defaultLanguage: string;
    availableLanguages: string[];
    autoTranslate: boolean;
    rtlSupport: boolean;
}

export interface CourseAnalytics {
    enrolledCount: number;
    completedCount: number;
    activeCount: number;
    averageProgress: number;
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    averageCompletionDays: number;
    dropoutRate: number;
    topDropoffPoints: string[];
    engagementScore: number;
}

export interface CourseReview {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    title?: string;
    content: string;
    helpful: number;
    verified: boolean;
    createdAt: Date;
    response?: InstructorResponse;
}

export interface InstructorResponse {
    content: string;
    createdAt: Date;
}

export interface CourseResource {
    id: string;
    title: string;
    type: "pdf" | "document" | "spreadsheet" | "presentation" | "image" | "archive" | "link" | "template";
    url: string;
    size?: number;
    downloadable: boolean;
    moduleId?: string;
    lessonId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: MODULES & LESSONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CourseModule {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
    duration: number;
    unlockCondition: UnlockCondition;
    completionCriteria: ModuleCompletionCriteria;
}

export interface UnlockCondition {
    type: "none" | "previous_completed" | "date" | "score" | "approval";
    value?: any;
    unlockDate?: Date;
    minimumScore?: number;
}

export interface ModuleCompletionCriteria {
    type: "all" | "percentage" | "required";
    percentage?: number;
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    type: LessonType;
    content: LessonContent;
    resources: LessonResource[];
    duration: number;
    isRequired: boolean;
    isFreePreview: boolean;
    order: number;
    assessment?: LessonAssessment;
    interactions: LessonInteraction[];
    accessibility: LessonAccessibility;
}

export type LessonType =
    | "video"
    | "text"
    | "audio"
    | "quiz"
    | "scorm"
    | "xapi"
    | "webinar"
    | "assignment"
    | "survey"
    | "discussion"
    | "live_session"
    | "interactive"
    | "simulation"
    | "pdf";

export interface LessonContent {
    type: "url" | "embed" | "markdown" | "html" | "scorm_package" | "xapi_package";
    value: string;
    transcript?: string;
    captions?: CaptionTrack[];
    chapters?: VideoChapter[];
}

export interface CaptionTrack {
    language: string;
    url: string;
    isDefault: boolean;
}

export interface VideoChapter {
    title: string;
    startTime: number;
    endTime: number;
}

export interface LessonResource {
    id: string;
    title: string;
    type: string;
    url: string;
    size?: number;
}

export interface LessonAssessment {
    quizId?: string;
    assignmentId?: string;
    minimumScore?: number;
    attempts?: number;
}

export interface LessonInteraction {
    id: string;
    type: "hotspot" | "annotation" | "question" | "poll";
    timestamp: number;
    content: Record<string, any>;
}

export interface LessonAccessibility {
    hasTranscript: boolean;
    hasClosedCaptions: boolean;
    hasAudioDescription: boolean;
    altText?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: ASSESSMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Quiz {
    id: string;
    courseId?: string;
    title: string;
    description: string;
    instructions?: string;
    type: QuizType;
    settings: QuizSettings;
    questions: Question[];
    questionBank?: QuestionBank;
    scoring: ScoringSettings;
    feedback: FeedbackSettings;
    analytics: QuizAnalytics;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type QuizType = "quiz" | "exam" | "survey" | "assessment" | "practice" | "final";

export interface QuizSettings {
    timeLimit?: number;
    timeLimitType: "total" | "per_question";
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showOneQuestion: boolean;
    allowBack: boolean;
    maxAttempts: number;
    attemptsGrading: "highest" | "latest" | "average" | "first";
    availableFrom?: Date;
    availableUntil?: Date;
    passwordProtected: boolean;
    password?: string;
    proctoring: ProctoringSettings;
}

export interface ProctoringSettings {
    enabled: boolean;
    webcamRequired: boolean;
    screenRecording: boolean;
    browserLockdown: boolean;
    idVerification: boolean;
}

export interface ScoringSettings {
    passingScore: number;
    maxScore: number;
    pointsPerQuestion: "equal" | "custom";
    negativeMarking: boolean;
    negativePoints?: number;
    partialCredit: boolean;
}

export interface FeedbackSettings {
    showResults: "immediately" | "after_deadline" | "manual" | "never";
    showScore: boolean;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    showFeedback: boolean;
    customPassMessage?: string;
    customFailMessage?: string;
}

export interface QuestionBank {
    id: string;
    name: string;
    randomize: boolean;
    questionsToShow: number;
    categoryDistribution?: Record<string, number>;
}

export interface QuizAnalytics {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTime: number;
    questionDifficulty: Record<string, number>;
}

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    category?: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
    timeLimit?: number;
    options: QuestionOption[];
    correctAnswer?: string | string[];
    explanation?: string;
    hint?: string;
    mediaUrl?: string;
    matchingPairs?: MatchingPair[];
    fillBlanks?: FillBlank[];
    rubric?: Rubric;
    tags: string[];
}

export type QuestionType =
    | "multiple_choice"
    | "single_choice"
    | "true_false"
    | "short_answer"
    | "essay"
    | "matching"
    | "ordering"
    | "fill_blank"
    | "hotspot"
    | "drag_drop"
    | "rating"
    | "matrix";

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
    weight?: number;
}

export interface MatchingPair {
    id: string;
    left: string;
    right: string;
}

export interface FillBlank {
    position: number;
    correctAnswers: string[];
    caseSensitive: boolean;
}

export interface Rubric {
    criteria: RubricCriterion[];
    maxPoints: number;
}

export interface RubricCriterion {
    id: string;
    name: string;
    description: string;
    levels: RubricLevel[];
}

export interface RubricLevel {
    points: number;
    description: string;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    attemptNumber: number;
    status: "in_progress" | "submitted" | "graded" | "timed_out";
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number;
    answers: QuizAnswer[];
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    gradedBy?: string;
    gradedAt?: Date;
    feedback?: string;
    proctoringData?: ProctoringData;
}

export interface QuizAnswer {
    questionId: string;
    answer: any;
    isCorrect?: boolean;
    points: number;
    maxPoints: number;
    feedback?: string;
    answeredAt: Date;
}

export interface ProctoringData {
    violations: ProctoringViolation[];
    trustScore: number;
    recording?: string;
}

export interface ProctoringViolation {
    type: string;
    timestamp: Date;
    severity: "low" | "medium" | "high";
    details?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: LEARNING PATHS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LearningPath {
    id: string;
    code: string;
    title: string;
    description: string;
    objectives: string[];
    thumbnailUrl: string;
    category: string;
    level: CourseLevel;
    targetAudience: string[];
    roles: string[];
    stages: LearningPathStage[];
    totalCourses: number;
    totalDuration: number;
    certification: PathCertification;
    prerequisites: string[];
    skills: SkillMapping[];
    status: "draft" | "active" | "retired";
    analytics: PathAnalytics;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LearningPathStage {
    id: string;
    title: string;
    description: string;
    order: number;
    items: LearningPathItem[];
    unlockCondition: UnlockCondition;
    completionCriteria: "all" | "any" | "required";
}

export interface LearningPathItem {
    id: string;
    type: "course" | "external" | "assessment" | "project" | "event";
    referenceId: string;
    title: string;
    order: number;
    isRequired: boolean;
    estimatedDuration: number;
}

export interface PathCertification {
    enabled: boolean;
    certificationId?: string;
    certificateTemplateId?: string;
    validityDays?: number;
    requirements: CertificationRequirement[];
}

export interface CertificationRequirement {
    type: "complete_courses" | "pass_assessment" | "project_approval" | "time_in_role";
    threshold: number;
    referenceIds?: string[];
}

export interface PathAnalytics {
    enrolledCount: number;
    completedCount: number;
    activeCount: number;
    averageProgress: number;
    completionRate: number;
    averageCompletionDays: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: ENROLLMENTS & PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Enrollment {
    id: string;
    userId: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    type: "self" | "assigned" | "path" | "subscription";
    status: EnrollmentStatus;
    progress: EnrollmentProgress;
    schedule: EnrollmentSchedule;
    completion: CompletionInfo;
    engagement: EngagementMetrics;
    notes: LearnerNote[];
    bookmarks: Bookmark[];
    discussions: DiscussionActivity[];
    metadata: Record<string, any>;
    enrolledBy: string;
    enrolledAt: Date;
    updatedAt: Date;
}

export type EnrollmentStatus = "pending" | "active" | "completed" | "expired" | "dropped" | "suspended" | "waitlist";

export interface EnrollmentProgress {
    percentage: number;
    completedLessons: string[];
    currentLessonId?: string;
    currentModuleId?: string;
    lastAccessedAt?: Date;
    timeSpentMinutes: number;
    timeByModule: Record<string, number>;
    lessonsRemaining: number;
}

export interface EnrollmentSchedule {
    startedAt?: Date;
    dueDate?: Date;
    expiresAt?: Date;
    targetCompletionDate?: Date;
    isOverdue: boolean;
}

export interface CompletionInfo {
    completedAt?: Date;
    grade?: number;
    passedAssessments: boolean;
    certificateId?: string;
    certificateUrl?: string;
    certificateIssuedAt?: Date;
}

export interface EngagementMetrics {
    sessionsCount: number;
    averageSessionDuration: number;
    lastSessionDuration: number;
    discussionPosts: number;
    questionsAsked: number;
    notesCreated: number;
    resourcesDownloaded: number;
}

export interface LearnerNote {
    id: string;
    lessonId: string;
    content: string;
    timestamp?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Bookmark {
    id: string;
    lessonId: string;
    timestamp?: number;
    title: string;
    createdAt: Date;
}

export interface DiscussionActivity {
    postId: string;
    type: "post" | "reply" | "like";
    createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Certification {
    id: string;
    code: string;
    name: string;
    description: string;
    issuer: string;
    type: "course" | "path" | "exam" | "external";
    level: string;
    requirements: CertificationRequirement[];
    validityDays?: number;
    renewalRequired: boolean;
    renewalPath?: string;
    templateId: string;
    skills: string[];
    status: "active" | "retired";
    createdAt: Date;
}

export interface UserCertification {
    id: string;
    userId: string;
    userName: string;
    certificationId: string;
    certificationName: string;
    credentialId: string;
    issuer: string;
    issuedAt: Date;
    expiresAt?: Date;
    renewedAt?: Date;
    status: "active" | "expired" | "revoked" | "pending_renewal";
    pdfUrl: string;
    verificationUrl: string;
    metadata: Record<string, any>;
}

export interface CertificateTemplate {
    id: string;
    name: string;
    layout: "landscape" | "portrait";
    backgroundUrl: string;
    htmlTemplate: string;
    cssStyles: string;
    variables: TemplateVariable[];
    createdAt: Date;
}

export interface TemplateVariable {
    name: string;
    type: "text" | "date" | "image" | "qr";
    position: { x: number; y: number };
    style?: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES: GAMIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface Badge {
    id: string;
    code: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    criteria: BadgeCriteria;
    xpPoints: number;
    isHidden: boolean;
    status: "active" | "retired";
    createdAt: Date;
}

export interface BadgeCriteria {
    type: BadgeCriteriaType;
    threshold: number;
    targetId?: string;
    conditions?: BadgeCondition[];
}

export type BadgeCriteriaType =
    | "course_completion"
    | "path_completion"
    | "quiz_score"
    | "streak"
    | "time_spent"
    | "courses_completed"
    | "first_enrollment"
    | "perfect_score"
    | "early_completion"
    | "helpful_posts"
    | "manual";

export interface BadgeCondition {
    field: string;
    operator: "eq" | "gte" | "lte" | "gt" | "lt";
    value: any;
}

export interface UserBadge {
    id: string;
    userId: string;
    badgeId: string;
    badgeName: string;
    awardedAt: Date;
    awardedFor?: string;
}

export interface Leaderboard {
    id: string;
    name: string;
    type: "xp" | "courses" | "streak" | "time";
    scope: "global" | "organization" | "team" | "course";
    scopeId?: string;
    period: "all_time" | "yearly" | "monthly" | "weekly";
    entries: LeaderboardEntry[];
    updatedAt: Date;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    avatarUrl: string;
    value: number;
    change: number;
}

export interface UserGamification {
    userId: string;
    xpTotal: number;
    xpThisMonth: number;
    level: number;
    levelName: string;
    nextLevelXp: number;
    streak: number;
    longestStreak: number;
    badges: UserBadge[];
    achievements: Achievement[];
    rank: { global: number; organization: number };
}

export interface Achievement {
    id: string;
    name: string;
    progress: number;
    goal: number;
    completed: boolean;
    completedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LMS SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class LMSService extends EventEmitter {
    private courses: Map<string, Course> = new Map();
    private enrollments: Map<string, Enrollment> = new Map();
    private quizzes: Map<string, Quiz> = new Map();
    private quizAttempts: Map<string, QuizAttempt> = new Map();
    private learningPaths: Map<string, LearningPath> = new Map();
    private certifications: Map<string, Certification> = new Map();
    private userCertifications: Map<string, UserCertification> = new Map();
    private badges: Map<string, Badge> = new Map();
    private userBadges: Map<string, UserBadge> = new Map();
    private userGamification: Map<string, UserGamification> = new Map();

    constructor() {
        super();
        this.seedContent();
        this.startProgressTracker();
        this.startLeaderboardUpdater();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COURSE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    async createCourse(data: Partial<Course>): Promise<Course> {
        const course: Course = {
            id: randomUUID(),
            code: data.code || `CRS-${Date.now().toString().slice(-6)}`,
            title: data.title || "Untitled Course",
            slug: data.slug || "",
            description: data.description || "",
            shortDescription: data.shortDescription || "",
            objectives: data.objectives || [],
            thumbnailUrl: data.thumbnailUrl || "",
            category: data.category || "technical",
            level: data.level || "beginner",
            status: "draft",
            visibility: data.visibility || "public",
            pricing: data.pricing || { isFree: true, price: 0, currency: "USD", subscriptionIncluded: true },
            duration: data.duration || { totalMinutes: 60, estimatedCompletionDays: 7, selfPaced: true },
            instructor: data.instructor || { id: "", name: "", title: "", bio: "", avatarUrl: "", expertise: [], rating: 0, coursesCount: 0, studentsCount: 0 },
            coInstructors: [],
            prerequisites: data.prerequisites || [],
            skills: data.skills || [],
            competencies: [],
            tags: data.tags || [],
            modules: data.modules || [],
            resources: [],
            settings: data.settings || this.getDefaultCourseSettings(),
            accessibility: { hasClosedCaptions: false, hasTranscripts: false, hasAudioDescriptions: false, highContrastMode: false, screenReaderOptimized: true, keyboardNavigable: true },
            localization: { defaultLanguage: "en", availableLanguages: ["en"], autoTranslate: false, rtlSupport: false },
            analytics: { enrolledCount: 0, completedCount: 0, activeCount: 0, averageProgress: 0, averageRating: 0, totalReviews: 0, completionRate: 0, averageCompletionDays: 0, dropoutRate: 0, topDropoffPoints: [], engagementScore: 0 },
            reviews: [],
            metadata: {},
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!course.slug) {
            course.slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }

        this.courses.set(course.id, course);

        await eventBus.publish("lms.course_created", { courseId: course.id });

        return course;
    }

    async publishCourse(courseId: string): Promise<Course> {
        const course = this.courses.get(courseId);
        if (!course) throw new Error("Course not found");

        course.status = "published";
        course.publishedAt = new Date();
        course.updatedAt = new Date();

        await eventBus.publish("lms.course_published", { courseId });

        return course;
    }

    private getDefaultCourseSettings(): CourseSettings {
        return {
            selfPaced: true,
            hasCertificate: true,
            requiresApproval: false,
            allowGuestPreview: true,
            previewModules: [],
            maxAttempts: 3,
            passingScore: 80,
            showProgressBar: true,
            allowSkipLessons: false,
            enforceSequence: true,
            allowDownloads: true,
            allowNotes: true,
            allowBookmarks: true,
            enableDiscussions: true,
            enableQA: true,
            autoEnrollNewUsers: false,
            completionCriteria: { type: "all_lessons" },
            notifications: { enrollmentConfirmation: true, progressReminders: true, reminderFrequency: "weekly", completionNotification: true, certificateNotification: true, dueDateReminders: true },
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ENROLLMENT & PROGRESS
    // ═══════════════════════════════════════════════════════════════════════════

    async enrollUser(userId: string, courseId: string, type: Enrollment["type"] = "self"): Promise<Enrollment> {
        const existing = Array.from(this.enrollments.values()).find(e => e.userId === userId && e.courseId === courseId && e.status !== "dropped");
        if (existing) return existing;

        const course = this.courses.get(courseId);
        if (!course) throw new Error("Course not found");

        const enrollment: Enrollment = {
            id: randomUUID(),
            userId,
            userName: userId,
            courseId,
            courseTitle: course.title,
            type,
            status: course.settings.requiresApproval ? "pending" : "active",
            progress: { percentage: 0, completedLessons: [], timeSpentMinutes: 0, timeByModule: {}, lessonsRemaining: this.countLessons(course) },
            schedule: { isOverdue: false },
            completion: { passedAssessments: false },
            engagement: { sessionsCount: 0, averageSessionDuration: 0, lastSessionDuration: 0, discussionPosts: 0, questionsAsked: 0, notesCreated: 0, resourcesDownloaded: 0 },
            notes: [],
            bookmarks: [],
            discussions: [],
            metadata: {},
            enrolledBy: userId,
            enrolledAt: new Date(),
            updatedAt: new Date(),
        };

        this.enrollments.set(enrollment.id, enrollment);
        course.analytics.enrolledCount++;
        course.updatedAt = new Date();

        await this.awardXP(userId, 10, "enrollment");
        await eventBus.publish("lms.user_enrolled", { enrollmentId: enrollment.id, userId, courseId });

        return enrollment;
    }

    async updateProgress(enrollmentId: string, lessonId: string, completed: boolean, timeSpent?: number): Promise<Enrollment> {
        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) throw new Error("Enrollment not found");

        if (completed && !enrollment.progress.completedLessons.includes(lessonId)) {
            enrollment.progress.completedLessons.push(lessonId);
            if (!enrollment.schedule.startedAt) enrollment.schedule.startedAt = new Date();
            await this.awardXP(enrollment.userId, 5, "lesson_completed");
        } else if (!completed) {
            enrollment.progress.completedLessons = enrollment.progress.completedLessons.filter(id => id !== lessonId);
        }

        if (timeSpent) {
            enrollment.progress.timeSpentMinutes += timeSpent;
        }

        const course = this.courses.get(enrollment.courseId);
        if (course) {
            const totalLessons = this.countLessons(course);
            enrollment.progress.percentage = totalLessons > 0 ? Math.round((enrollment.progress.completedLessons.length / totalLessons) * 100) : 0;
            enrollment.progress.lessonsRemaining = totalLessons - enrollment.progress.completedLessons.length;

            if (enrollment.progress.percentage === 100 && enrollment.status !== "completed") {
                await this.completeEnrollment(enrollment);
            }
        }

        enrollment.progress.lastAccessedAt = new Date();
        enrollment.updatedAt = new Date();

        return enrollment;
    }

    private async completeEnrollment(enrollment: Enrollment): Promise<void> {
        enrollment.status = "completed";
        enrollment.completion.completedAt = new Date();

        const course = this.courses.get(enrollment.courseId);
        if (course) {
            course.analytics.completedCount++;

            if (course.settings.hasCertificate) {
                const cert = await this.issueCertificate(enrollment.userId, course.id, course.title);
                enrollment.completion.certificateId = cert.id;
                enrollment.completion.certificateUrl = cert.pdfUrl;
                enrollment.completion.certificateIssuedAt = new Date();
            }
        }

        await this.awardXP(enrollment.userId, 50, "course_completed");
        await this.checkBadges(enrollment.userId, "course_completion", enrollment.courseId);
        await eventBus.publish("lms.enrollment_completed", { enrollmentId: enrollment.id });
    }

    private countLessons(course: Course): number {
        return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // QUIZZES & ASSESSMENTS
    // ═══════════════════════════════════════════════════════════════════════════

    async createQuiz(data: Partial<Quiz>): Promise<Quiz> {
        const quiz: Quiz = {
            id: randomUUID(),
            title: data.title || "New Quiz",
            description: data.description || "",
            type: data.type || "quiz",
            settings: data.settings || { timeLimitType: "total", shuffleQuestions: false, shuffleOptions: false, showOneQuestion: false, allowBack: true, maxAttempts: 3, attemptsGrading: "highest", proctoring: { enabled: false, webcamRequired: false, screenRecording: false, browserLockdown: false, idVerification: false } },
            questions: data.questions || [],
            scoring: data.scoring || { passingScore: 70, maxScore: 100, pointsPerQuestion: "equal", negativeMarking: false, partialCredit: false },
            feedback: data.feedback || { showResults: "immediately", showScore: true, showCorrectAnswers: true, showExplanations: true, showFeedback: true },
            analytics: { totalAttempts: 0, averageScore: 0, passRate: 0, averageTime: 0, questionDifficulty: {} },
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
        };

        this.quizzes.set(quiz.id, quiz);
        return quiz;
    }

    async submitQuizAttempt(userId: string, quizId: string, answers: Record<string, any>): Promise<QuizAttempt> {
        const quiz = this.quizzes.get(quizId);
        if (!quiz) throw new Error("Quiz not found");

        let score = 0;
        let maxScore = 0;
        const quizAnswers: QuizAnswer[] = [];

        for (const question of quiz.questions) {
            maxScore += question.points;
            const userAnswer = answers[question.id];
            const isCorrect = this.checkAnswer(question, userAnswer);
            const points = isCorrect ? question.points : 0;
            score += points;

            quizAnswers.push({ questionId: question.id, answer: userAnswer, isCorrect, points, maxPoints: question.points, answeredAt: new Date() });
        }

        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        const passed = percentage >= quiz.scoring.passingScore;

        const attempt: QuizAttempt = {
            id: randomUUID(),
            quizId,
            userId,
            attemptNumber: 1,
            status: "graded",
            startedAt: new Date(),
            completedAt: new Date(),
            timeSpent: 0,
            answers: quizAnswers,
            score,
            maxScore,
            percentage,
            passed,
        };

        this.quizAttempts.set(attempt.id, attempt);

        quiz.analytics.totalAttempts++;
        quiz.analytics.averageScore = (quiz.analytics.averageScore * (quiz.analytics.totalAttempts - 1) + percentage) / quiz.analytics.totalAttempts;

        if (passed) {
            await this.awardXP(userId, 20, "quiz_passed");
        }

        await eventBus.publish("lms.quiz_submitted", { attemptId: attempt.id, passed });

        return attempt;
    }

    private checkAnswer(question: Question, userAnswer: any): boolean {
        if (!userAnswer) return false;

        if (question.type === "multiple_choice" || question.type === "single_choice" || question.type === "true_false") {
            if (Array.isArray(question.correctAnswer)) {
                return JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
            }
            return question.correctAnswer === userAnswer;
        }

        return false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CERTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    async issueCertificate(userId: string, referenceId: string, name: string): Promise<UserCertification> {
        const cert: UserCertification = {
            id: randomUUID(),
            userId,
            userName: userId,
            certificationId: referenceId,
            certificationName: name,
            credentialId: `ALT-${randomUUID().slice(0, 12).toUpperCase()}`,
            issuer: "Altus Ink Academy",
            issuedAt: new Date(),
            status: "active",
            pdfUrl: `/certificates/${randomUUID()}.pdf`,
            verificationUrl: `/verify/${randomUUID()}`,
            metadata: {},
        };

        this.userCertifications.set(cert.id, cert);

        await eventBus.publish("lms.certificate_issued", { certId: cert.id, userId });

        return cert;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAMIFICATION
    // ═══════════════════════════════════════════════════════════════════════════

    private async awardXP(userId: string, xp: number, reason: string): Promise<void> {
        let gamification = this.userGamification.get(userId);
        if (!gamification) {
            gamification = { userId, xpTotal: 0, xpThisMonth: 0, level: 1, levelName: "Novice", nextLevelXp: 100, streak: 0, longestStreak: 0, badges: [], achievements: [], rank: { global: 0, organization: 0 } };
            this.userGamification.set(userId, gamification);
        }

        gamification.xpTotal += xp;
        gamification.xpThisMonth += xp;

        const newLevel = Math.floor(gamification.xpTotal / 100) + 1;
        if (newLevel > gamification.level) {
            gamification.level = newLevel;
            gamification.levelName = this.getLevelName(newLevel);
            await eventBus.publish("lms.level_up", { userId, level: newLevel });
        }

        gamification.nextLevelXp = (gamification.level * 100) - gamification.xpTotal;
    }

    private getLevelName(level: number): string {
        const names = ["Novice", "Apprentice", "Practitioner", "Specialist", "Expert", "Master", "Grandmaster", "Legend"];
        return names[Math.min(level - 1, names.length - 1)];
    }

    private async checkBadges(userId: string, eventType: BadgeCriteriaType, targetId?: string): Promise<UserBadge[]> {
        const awarded: UserBadge[] = [];

        for (const badge of this.badges.values()) {
            if (badge.criteria.type !== eventType) continue;
            if (badge.criteria.targetId && badge.criteria.targetId !== targetId) continue;

            const alreadyHas = Array.from(this.userBadges.values()).some(ub => ub.userId === userId && ub.badgeId === badge.id);
            if (alreadyHas) continue;

            const userBadge: UserBadge = { id: randomUUID(), userId, badgeId: badge.id, badgeName: badge.name, awardedAt: new Date(), awardedFor: targetId };
            this.userBadges.set(userBadge.id, userBadge);
            awarded.push(userBadge);

            await this.awardXP(userId, badge.xpPoints, "badge_earned");
            await eventBus.publish("lms.badge_awarded", { userId, badgeId: badge.id });
        }

        return awarded;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BACKGROUND PROCESSES
    // ═══════════════════════════════════════════════════════════════════════════

    private startProgressTracker(): void {
        setInterval(() => {
            for (const enrollment of this.enrollments.values()) {
                if (enrollment.schedule.dueDate && enrollment.status === "active") {
                    enrollment.schedule.isOverdue = new Date() > enrollment.schedule.dueDate;
                }
            }
        }, 60000);
    }

    private startLeaderboardUpdater(): void {
        setInterval(() => {
            const sorted = Array.from(this.userGamification.values()).sort((a, b) => b.xpTotal - a.xpTotal);
            sorted.forEach((g, i) => { g.rank.global = i + 1; });
        }, 300000);
    }

    private seedContent(): void {
        this.createCourse({
            title: "Bloodborne Pathogens Safety",
            description: "Essential safety training for all tattoo artists covering bloodborne pathogen awareness and prevention.",
            category: "safety",
            level: "beginner",
            modules: [{
                id: "m1", title: "Introduction to BBP", description: "Basics of bloodborne pathogens", order: 1,
                lessons: [
                    { id: "l1", title: "What are BBPs?", type: "video", content: { type: "url", value: "https://example.com/video1.mp4" }, resources: [], duration: 15, isRequired: true, isFreePreview: true, order: 1, interactions: [], accessibility: { hasTranscript: true, hasClosedCaptions: true, hasAudioDescription: false } },
                    { id: "l2", title: "BBP Quiz", type: "quiz", content: { type: "url", value: "" }, resources: [], duration: 10, isRequired: true, isFreePreview: false, order: 2, interactions: [], accessibility: { hasTranscript: false, hasClosedCaptions: false, hasAudioDescription: false } },
                ],
                duration: 25, unlockCondition: { type: "none" }, completionCriteria: { type: "all" },
            }],
        }).then(course => { course.status = "published"; course.publishedAt = new Date(); });

        this.createBadge({ name: "First Steps", description: "Enrolled in your first course", rarity: "common", criteria: { type: "first_enrollment", threshold: 1 }, xpPoints: 10 });
        this.createBadge({ name: "Course Graduate", description: "Completed your first course", rarity: "uncommon", criteria: { type: "course_completion", threshold: 1 }, xpPoints: 50 });
    }

    async createBadge(data: Partial<Badge>): Promise<Badge> {
        const badge: Badge = {
            id: randomUUID(),
            code: data.code || `BDG-${Date.now().toString().slice(-6)}`,
            name: data.name || "New Badge",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            category: data.category || "achievement",
            rarity: data.rarity || "common",
            criteria: data.criteria || { type: "manual", threshold: 1 },
            xpPoints: data.xpPoints || 10,
            isHidden: data.isHidden || false,
            status: "active",
            createdAt: new Date(),
            ...data,
        };

        this.badges.set(badge.id, badge);
        return badge;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const lmsService = new LMSService();
export default lmsService;
