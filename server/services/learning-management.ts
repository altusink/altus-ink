/**
 * ALTUS INK - ENTERPRISE LEARNING MANAGEMENT SYSTEM (LMS) SERVICE
 * Comprehensive training, certification, and skill development platform
 * 
 * Features:
 * - Course management & authoring
 * - Learning paths & curriculums
 * - Quizzes, assessments & exams
 * - Certification management
 * - Progress tracking & analytics
 * - Live webinars & events
 * - Social learning & discussions
 * - Gamification (badges, points, leaderboards)
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Course {
    id: string;
    code: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnailUrl: string;
    category: "technical" | "artistic" | "safety" | "business" | "compliance" | "onboarding";
    level: "beginner" | "intermediate" | "advanced" | "expert";
    status: "draft" | "published" | "archived";
    price: number;
    currency: string;
    durationMinutes: number;
    instructorId: string;
    prerequisites: string[]; // Course IDs
    skills: string[];
    tags: string[];
    modules: CourseModule[];
    settings: CourseSettings;
    metadata: Record<string, any>;
    rating: number;
    enrolledCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CourseSettings {
    isSelfPaced: boolean;
    hasCertificate: boolean;
    requiresApproval: boolean;
    validityDays?: number; // Valid for X days after completion
    allowGuestAccess: boolean;
    maxAttempts: number;
    passingScore: number;
}

export interface CourseModule {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
    unlockCondition?: "previous_completed" | "date" | "none";
    unlockDate?: Date;
}

export interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    content: string; // Markdown or URL
    resources: Resource[];
    durationMinutes: number;
    isRequired: boolean;
    order: number;
    quizId?: string;
    assignmentId?: string;
}

export type LessonType = "video" | "text" | "quiz" | "scorm" | "webinar" | "assignment" | "survey";

export interface Resource {
    id: string;
    title: string;
    type: "pdf" | "image" | "link" | "file";
    url: string;
    size?: number;
}

// =============================================================================
// ASSESSMENTS & QUIZZES
// =============================================================================

export interface Quiz {
    id: string;
    title: string;
    description: string;
    type: "quiz" | "exam" | "survey";
    timeLimit?: number; // Minutes
    passingScore: number;
    questions: Question[];
    shuffleQuestions: boolean;
    showResults: boolean;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Question {
    id: string;
    text: string;
    type: "multiple_choice" | "single_choice" | "true_false" | "text" | "matching";
    points: number;
    options: QuestionOption[];
    correctAnswer?: string | string[]; // For auto-grading
    explanation?: string;
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    startedAt: Date;
    completedAt?: Date;
    answers: Record<string, any>;
    score: number;
    passed: boolean;
    feedback?: string;
}

// =============================================================================
// LEARNING PATHS & CURRICULUMS
// =============================================================================

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    targetAudience: string[]; // Roles
    courses: LearningPathItem[];
    certificationId?: string;
    durationDays: number; // Suggested completion time
    status: "active" | "draft" | "retired";
    createdAt: Date;
    updatedAt: Date;
}

export interface LearningPathItem {
    courseId: string;
    order: number;
    isRequired: boolean;
}

// =============================================================================
// USER PROGRESS & ENROLLMENTS
// =============================================================================

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: EnrollmentStatus;
    progress: number; // 0-100
    enrolledAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    expiresAt?: Date;
    completedLessons: string[];
    timeSpentMinutes: number;
    grade?: number;
    certificateUrl?: string;
}

export type EnrollmentStatus = "active" | "completed" | "expired" | "dropped" | "pending";

export interface UserCertification {
    id: string;
    userId: string;
    certificationId: string;
    name: string;
    issuedAt: Date;
    expiresAt?: Date;
    issuer: string;
    credentialId: string;
    status: "active" | "expired" | "revoked";
    url: string;
}

export interface CertificateTemplate {
    id: string;
    name: string;
    htmlTemplate: string;
    backgroundUrl: string;
    variables: string[]; // {{studentName}}, {{courseName}}
}

// =============================================================================
// GAMIFICATION
// =============================================================================

export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    criteria: BadgeCriteria;
    xpPoints: number;
}

export interface BadgeCriteria {
    type: "course_completion" | "path_completion" | "quiz_score" | "streak" | "manual";
    threshold: number;
    targetId?: string; // Course ID or Path ID
}

export interface UserBadge {
    id: string;
    userId: string;
    badgeId: string;
    awardedAt: Date;
}

// =============================================================================
// LMS SERVICE
// =============================================================================

export class LMSService {
    private courses: Map<string, Course> = new Map();
    private enrollments: Map<string, Enrollment> = new Map();
    private quizzes: Map<string, Quiz> = new Map();
    private quizAttempts: Map<string, QuizAttempt> = new Map();
    private learningPaths: Map<string, LearningPath> = new Map();
    private certifications: Map<string, UserCertification> = new Map();
    private badges: Map<string, Badge> = new Map();
    private userBadges: Map<string, UserBadge> = new Map();

    constructor() {
        this.seedContent();
    }

    // ===========================================================================
    // COURSE MANAGEMENT
    // ===========================================================================

    async createCourse(data: Partial<Course>): Promise<Course> {
        const course: Course = {
            id: randomUUID(),
            code: data.code || `CRS-${Date.now().toString().slice(-4)}`,
            title: data.title || "Untitled Course",
            slug: data.slug || "",
            description: data.description || "",
            shortDescription: data.shortDescription || "",
            thumbnailUrl: data.thumbnailUrl || "",
            category: data.category || "technical",
            level: data.level || "beginner",
            status: data.status || "draft",
            price: data.price || 0,
            currency: "USD",
            durationMinutes: data.durationMinutes || 60,
            instructorId: data.instructorId || "system",
            prerequisites: data.prerequisites || [],
            skills: data.skills || [],
            tags: data.tags || [],
            modules: data.modules || [],
            settings: data.settings || {
                isSelfPaced: true,
                hasCertificate: true,
                requiresApproval: false,
                allowGuestAccess: false,
                maxAttempts: 3,
                passingScore: 80
            },
            metadata: data.metadata || {},
            rating: 0,
            enrolledCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        if (!course.slug) {
            course.slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }

        this.courses.set(course.id, course);
        return course;
    }

    async getCourse(id: string): Promise<Course | null> {
        return this.courses.get(id) || null;
    }

    async searchCourses(query: string): Promise<Course[]> {
        const term = query.toLowerCase();
        return Array.from(this.courses.values()).filter(c =>
            c.status === "published" &&
            (c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term))
        );
    }

    // ===========================================================================
    // ENROLLMENT & PROGRESS
    // ===========================================================================

    async enrollUser(userId: string, courseId: string): Promise<Enrollment> {
        const existing = Array.from(this.enrollments.values()).find(e => e.userId === userId && e.courseId === courseId);
        if (existing) return existing;

        const course = this.courses.get(courseId);
        if (!course) throw new Error("Course not found");

        const enrollment: Enrollment = {
            id: randomUUID(),
            userId,
            courseId,
            status: course.settings.requiresApproval ? "pending" : "active",
            progress: 0,
            enrolledAt: new Date(),
            completedLessons: [],
            timeSpentMinutes: 0
        };

        this.enrollments.set(enrollment.id, enrollment);
        course.enrolledCount++;
        course.updatedAt = new Date();

        return enrollment;
    }

    async updateProgress(enrollmentId: string, lessonId: string, completed: boolean): Promise<Enrollment | null> {
        const enrollment = this.enrollments.get(enrollmentId);
        if (!enrollment) return null;

        if (completed && !enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);
            if (!enrollment.startedAt) enrollment.startedAt = new Date();
        } else if (!completed) {
            enrollment.completedLessons = enrollment.completedLessons.filter(id => id !== lessonId);
        }

        // Calculate overall progress
        const course = this.courses.get(enrollment.courseId);
        if (course) {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            if (totalLessons > 0) {
                enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
            }

            if (enrollment.progress === 100 && enrollment.status !== "completed") {
                await this.completeEnrollment(enrollment);
            }
        }

        return enrollment;
    }

    private async completeEnrollment(enrollment: Enrollment): Promise<void> {
        enrollment.status = "completed";
        enrollment.completedAt = new Date();

        // Issue certificate
        const course = this.courses.get(enrollment.courseId);
        if (course?.settings.hasCertificate) {
            await this.issueCertificate(enrollment.userId, course.id, `${course.title} Completion`);
        }

        // Award badges
        await this.checkBadges(enrollment.userId, "course_completion", course?.id);
    }

    // ===========================================================================
    // QUIZZES & ASSESSMENT
    // ===========================================================================

    async createQuiz(data: Partial<Quiz>): Promise<Quiz> {
        const quiz: Quiz = {
            id: randomUUID(),
            title: data.title || "New Quiz",
            description: data.description || "",
            type: data.type || "quiz",
            passingScore: data.passingScore || 80,
            questions: data.questions || [],
            shuffleQuestions: data.shuffleQuestions || false,
            showResults: data.showResults || true,
            maxAttempts: data.maxAttempts || 3,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.quizzes.set(quiz.id, quiz);
        return quiz;
    }

    async submitQuizAttempt(userId: string, quizId: string, answers: Record<string, any>): Promise<QuizAttempt> {
        const quiz = this.quizzes.get(quizId);
        if (!quiz) throw new Error("Quiz not found");

        // Calculate Score
        let score = 0;
        let totalPoints = 0;

        for (const question of quiz.questions) {
            totalPoints += question.points;
            const userAnswer = answers[question.id];

            if (this.checkAnswer(question, userAnswer)) {
                score += question.points;
            }
        }

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const passed = percentage >= quiz.passingScore;

        const attempt: QuizAttempt = {
            id: randomUUID(),
            quizId,
            userId,
            startedAt: new Date(), // Assuming immediate submission
            completedAt: new Date(),
            answers,
            score: percentage,
            passed,
            feedback: passed ? "Good job!" : "Please try again."
        };

        this.quizAttempts.set(attempt.id, attempt);
        return attempt;
    }

    private checkAnswer(question: Question, userAnswer: any): boolean {
        if (!userAnswer) return false;

        if (question.type === "multiple_choice" || question.type === "single_choice" || question.type === "true_false") {
            if (Array.isArray(question.correctAnswer)) {
                // Multi-select logic (simplified)
                return JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(userAnswer.sort());
            }
            return question.correctAnswer === userAnswer;
        }

        return false; // Manual grading or text match needed
    }

    // ===========================================================================
    // CERTIFICATIONS
    // ===========================================================================

    async issueCertificate(userId: string, certificationId: string, name: string): Promise<UserCertification> {
        const cert: UserCertification = {
            id: randomUUID(),
            userId,
            certificationId,
            name,
            issuedAt: new Date(),
            issuer: "Altus Ink Academy",
            credentialId: randomUUID().toUpperCase(),
            status: "active",
            url: `/certificates/${randomUUID()}` // Simulated
        };

        this.certifications.set(cert.id, cert);
        return cert;
    }

    // ===========================================================================
    // GAMIFICATION
    // ===========================================================================

    async createBadge(data: Partial<Badge>): Promise<Badge> {
        const badge: Badge = {
            id: randomUUID(),
            name: data.name || "New Badge",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            criteria: data.criteria || { type: "manual", threshold: 1 },
            xpPoints: data.xpPoints || 10,
            ...data
        };

        this.badges.set(badge.id, badge);
        return badge;
    }

    async checkBadges(userId: string, eventType: string, targetId?: string): Promise<UserBadge[]> {
        const newlyAwarded: UserBadge[] = [];

        for (const badge of this.badges.values()) {
            if (badge.criteria.type === eventType) {
                // Logic to check threshold/target would go here

                // Assume awarded for demo
                const userBadge: UserBadge = {
                    id: randomUUID(),
                    userId,
                    badgeId: badge.id,
                    awardedAt: new Date()
                };

                this.userBadges.set(userBadge.id, userBadge);
                newlyAwarded.push(userBadge);
            }
        }

        return newlyAwarded;
    }

    // ===========================================================================
    // SEED DATA
    // ===========================================================================

    private seedContent() {
        // Safety Course
        this.createCourse({
            title: "Bloodborne Pathogens Safety",
            description: "Essential safety training for all tattoo artists.",
            category: "safety",
            level: "beginner",
            status: "published",
            modules: [{
                id: "m1",
                title: "Introduction to BBP",
                description: "Basics of bloodborne pathogens",
                order: 1,
                lessons: [
                    {
                        id: "l1",
                        title: "What are BBPs?",
                        type: "video",
                        content: "https://example.com/video1.mp4",
                        resources: [],
                        durationMinutes: 15,
                        isRequired: true,
                        order: 1
                    },
                    {
                        id: "l2",
                        title: "BBP Quiz",
                        type: "quiz",
                        content: "",
                        resources: [],
                        durationMinutes: 10,
                        isRequired: true,
                        order: 2
                    }
                ]
            }]
        });
    }
}

export const lmsService = new LMSService();
export default lmsService;
