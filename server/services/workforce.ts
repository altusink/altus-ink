/**
 * ALTUS INK - ENTERPRISE SCHEDULING & WORKFORCE SERVICE
 * Complete workforce and scheduling management
 * 
 * Features:
 * - Staff management
 * - Shift scheduling
 * - Time tracking
 * - Attendance management
 * - Leave management
 * - Performance tracking
 * - Skills matrix
 * - Certification tracking
 * - Payroll integration
 * - Scheduling optimization
 */

import { randomUUID } from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Employee {
    id: string;
    employeeNumber: string;
    userId?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
    dateOfBirth: Date;
    gender: "male" | "female" | "other";
    address: EmployeeAddress;
    emergencyContact: EmergencyContact;
    department: string;
    position: string;
    employmentType: EmploymentType;
    status: EmployeeStatus;
    hireDate: Date;
    terminationDate?: Date;
    reportingTo?: string;
    locations: string[];
    skills: EmployeeSkill[];
    certifications: Certification[];
    documents: EmployeeDocument[];
    workPreferences: WorkPreferences;
    compensation: Compensation;
    bankDetails?: BankDetails;
    taxInfo?: TaxInfo;
    performanceRating: number;
    attendanceRate: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export type EmploymentType = "full_time" | "part_time" | "contractor" | "intern" | "temporary";
export type EmployeeStatus = "active" | "on_leave" | "suspended" | "terminated";

export interface EmployeeAddress {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

export interface EmployeeSkill {
    id: string;
    name: string;
    category: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    yearsOfExperience: number;
    verifiedBy?: string;
    verifiedAt?: Date;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    certificateNumber?: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
    isVerified: boolean;
    verifiedBy?: string;
}

export interface EmployeeDocument {
    id: string;
    type: "contract" | "id" | "passport" | "resume" | "certification" | "other";
    name: string;
    url: string;
    uploadedAt: Date;
    expiresAt?: Date;
}

export interface WorkPreferences {
    preferredShifts: ("morning" | "afternoon" | "evening" | "night")[];
    preferredDays: number[];
    maxHoursPerWeek: number;
    minHoursPerWeek: number;
    unavailableDates: Date[];
    notes?: string;
}

export interface Compensation {
    type: "hourly" | "salary" | "commission" | "mixed";
    basePay: number;
    currency: string;
    payFrequency: "weekly" | "biweekly" | "monthly";
    overtimeRate: number;
    bonusEligible: boolean;
    commissionRate?: number;
    effectiveDate: Date;
}

export interface BankDetails {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: "checking" | "savings";
}

export interface TaxInfo {
    taxId: string;
    filingStatus: string;
    allowances: number;
    additionalWithholding: number;
}

export interface Shift {
    id: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    breakDuration: number;
    color: string;
    isActive: boolean;
}

export interface Schedule {
    id: string;
    employeeId: string;
    shiftId?: string;
    locationId: string;
    date: Date;
    startTime: string;
    endTime: string;
    breakDuration: number;
    scheduledHours: number;
    status: ScheduleStatus;
    notes?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ScheduleStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface ScheduleTemplate {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    entries: ScheduleTemplateEntry[];
    createdAt: Date;
}

export interface ScheduleTemplateEntry {
    dayOfWeek: number;
    shiftId: string;
    startTime: string;
    endTime: string;
    breakDuration: number;
    requiredStaff: number;
    requiredSkills?: string[];
}

export interface TimeEntry {
    id: string;
    employeeId: string;
    scheduleId?: string;
    locationId: string;
    date: Date;
    clockIn: Date;
    clockOut?: Date;
    breakStart?: Date;
    breakEnd?: Date;
    totalBreakMinutes: number;
    workedHours: number;
    overtimeHours: number;
    status: TimeEntryStatus;
    source: "clock" | "manual" | "system";
    notes?: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type TimeEntryStatus = "pending" | "approved" | "rejected" | "auto_approved";

export interface Leave {
    id: string;
    employeeId: string;
    type: LeaveType;
    status: LeaveStatus;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    attachments: string[];
    requestedAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewNotes?: string;
}

export type LeaveType =
    | "annual"
    | "sick"
    | "personal"
    | "bereavement"
    | "maternity"
    | "paternity"
    | "unpaid"
    | "jury_duty"
    | "military"
    | "other";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveBalance {
    employeeId: string;
    year: number;
    balances: LeaveTypeBalance[];
}

export interface LeaveTypeBalance {
    type: LeaveType;
    entitled: number;
    used: number;
    pending: number;
    remaining: number;
    carryOver: number;
}

export interface Attendance {
    id: string;
    employeeId: string;
    date: Date;
    status: AttendanceStatus;
    scheduledStart?: string;
    scheduledEnd?: string;
    actualStart?: string;
    actualEnd?: string;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    overtimeMinutes: number;
    notes?: string;
}

export type AttendanceStatus =
    | "present"
    | "absent"
    | "late"
    | "early_leave"
    | "half_day"
    | "on_leave"
    | "holiday"
    | "weekend";

export interface PerformanceReview {
    id: string;
    employeeId: string;
    reviewerId: string;
    reviewPeriod: { start: Date; end: Date };
    type: "annual" | "quarterly" | "probation" | "promotion" | "ad_hoc";
    status: "draft" | "in_progress" | "completed" | "acknowledged";
    overallRating: number;
    criteria: PerformanceCriterion[];
    strengths: string[];
    improvements: string[];
    goals: PerformanceGoal[];
    comments: string;
    employeeComments?: string;
    completedAt?: Date;
    acknowledgedAt?: Date;
}

export interface PerformanceCriterion {
    name: string;
    description: string;
    weight: number;
    rating: number;
    comments?: string;
}

export interface PerformanceGoal {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: "not_started" | "in_progress" | "completed" | "cancelled";
    progress: number;
    completedAt?: Date;
}

export interface Payroll {
    id: string;
    employeeId: string;
    periodStart: Date;
    periodEnd: Date;
    status: PayrollStatus;
    regularHours: number;
    overtimeHours: number;
    grossPay: number;
    deductions: PayrollDeduction[];
    totalDeductions: number;
    netPay: number;
    payDate: Date;
    notes?: string;
    processedBy?: string;
    processedAt?: Date;
}

export type PayrollStatus = "pending" | "processing" | "approved" | "paid" | "cancelled";

export interface PayrollDeduction {
    type: string;
    description: string;
    amount: number;
    isPreTax: boolean;
}

export interface ShiftSwapRequest {
    id: string;
    requesterId: string;
    requesterScheduleId: string;
    targetEmployeeId?: string;
    targetScheduleId?: string;
    status: "open" | "pending" | "approved" | "rejected" | "cancelled";
    reason: string;
    managerApproval: boolean;
    createdAt: Date;
    respondedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
}

export interface SchedulingConflict {
    type: "overlap" | "overtime" | "rest_period" | "unavailable" | "skill_mismatch";
    employeeId: string;
    scheduleIds: string[];
    description: string;
    severity: "warning" | "error";
}

// =============================================================================
// WORKFORCE SERVICE CLASS
// =============================================================================

export class WorkforceService {
    private employees: Map<string, Employee> = new Map();
    private shifts: Map<string, Shift> = new Map();
    private schedules: Map<string, Schedule> = new Map();
    private templates: Map<string, ScheduleTemplate> = new Map();
    private timeEntries: Map<string, TimeEntry> = new Map();
    private leaves: Map<string, Leave> = new Map();
    private leaveBalances: Map<string, LeaveBalance> = new Map();
    private attendance: Map<string, Attendance> = new Map();
    private reviews: Map<string, PerformanceReview> = new Map();
    private payrolls: Map<string, Payroll> = new Map();
    private swapRequests: Map<string, ShiftSwapRequest> = new Map();

    private employeeCounter = 1000;

    // ===========================================================================
    // EMPLOYEE MANAGEMENT
    // ===========================================================================

    async createEmployee(data: Partial<Employee>): Promise<Employee> {
        const employee: Employee = {
            id: randomUUID(),
            employeeNumber: `EMP-${++this.employeeCounter}`,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            email: data.email || "",
            phone: data.phone || "",
            dateOfBirth: data.dateOfBirth || new Date(),
            gender: data.gender || "other",
            address: data.address || { street: "", city: "", postalCode: "", country: "" },
            emergencyContact: data.emergencyContact || { name: "", relationship: "", phone: "" },
            department: data.department || "",
            position: data.position || "",
            employmentType: data.employmentType || "full_time",
            status: "active",
            hireDate: data.hireDate || new Date(),
            locations: data.locations || [],
            skills: data.skills || [],
            certifications: data.certifications || [],
            documents: [],
            workPreferences: data.workPreferences || {
                preferredShifts: [],
                preferredDays: [],
                maxHoursPerWeek: 40,
                minHoursPerWeek: 0,
                unavailableDates: []
            },
            compensation: data.compensation || {
                type: "hourly",
                basePay: 0,
                currency: "EUR",
                payFrequency: "monthly",
                overtimeRate: 1.5,
                bonusEligible: false,
                effectiveDate: new Date()
            },
            performanceRating: 0,
            attendanceRate: 100,
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.employees.set(employee.id, employee);
        await this.initializeLeaveBalance(employee.id);
        return employee;
    }

    async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee | null> {
        const employee = this.employees.get(id);
        if (!employee) return null;

        const updated = {
            ...employee,
            ...data,
            fullName: `${data.firstName || employee.firstName} ${data.lastName || employee.lastName}`.trim(),
            updatedAt: new Date()
        };

        this.employees.set(id, updated);
        return updated;
    }

    async getEmployee(id: string): Promise<Employee | null> {
        return this.employees.get(id) || null;
    }

    async getEmployeeByNumber(employeeNumber: string): Promise<Employee | null> {
        for (const emp of this.employees.values()) {
            if (emp.employeeNumber === employeeNumber) return emp;
        }
        return null;
    }

    async searchEmployees(query: string, filters?: {
        department?: string;
        status?: EmployeeStatus;
        location?: string;
    }): Promise<Employee[]> {
        let results = Array.from(this.employees.values());

        if (query) {
            const q = query.toLowerCase();
            results = results.filter(e =>
                e.fullName.toLowerCase().includes(q) ||
                e.email.toLowerCase().includes(q) ||
                e.employeeNumber.toLowerCase().includes(q) ||
                e.position.toLowerCase().includes(q)
            );
        }

        if (filters) {
            if (filters.department) {
                results = results.filter(e => e.department === filters.department);
            }
            if (filters.status) {
                results = results.filter(e => e.status === filters.status);
            }
            if (filters.location) {
                results = results.filter(e => e.locations.includes(filters.location!));
            }
        }

        return results;
    }

    async getEmployeesByDepartment(department: string): Promise<Employee[]> {
        return Array.from(this.employees.values()).filter(e => e.department === department);
    }

    async getDirectReports(managerId: string): Promise<Employee[]> {
        return Array.from(this.employees.values()).filter(e => e.reportingTo === managerId);
    }

    async addSkill(employeeId: string, skill: Omit<EmployeeSkill, "id">): Promise<EmployeeSkill | null> {
        const employee = this.employees.get(employeeId);
        if (!employee) return null;

        const newSkill: EmployeeSkill = {
            id: randomUUID(),
            ...skill
        };

        employee.skills.push(newSkill);
        employee.updatedAt = new Date();

        return newSkill;
    }

    async updateSkill(employeeId: string, skillId: string, data: Partial<EmployeeSkill>): Promise<EmployeeSkill | null> {
        const employee = this.employees.get(employeeId);
        if (!employee) return null;

        const skill = employee.skills.find(s => s.id === skillId);
        if (!skill) return null;

        Object.assign(skill, data);
        employee.updatedAt = new Date();

        return skill;
    }

    async addCertification(employeeId: string, cert: Omit<Certification, "id">): Promise<Certification | null> {
        const employee = this.employees.get(employeeId);
        if (!employee) return null;

        const newCert: Certification = {
            id: randomUUID(),
            isVerified: false,
            ...cert
        };

        employee.certifications.push(newCert);
        employee.updatedAt = new Date();

        return newCert;
    }

    async getEmployeesWithExpiringCertifications(days: number = 30): Promise<Array<{ employee: Employee; certification: Certification }>> {
        const results: Array<{ employee: Employee; certification: Certification }> = [];
        const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        for (const employee of this.employees.values()) {
            for (const cert of employee.certifications) {
                if (cert.expiryDate && cert.expiryDate <= cutoff) {
                    results.push({ employee, certification: cert });
                }
            }
        }

        return results.sort((a, b) =>
            (a.certification.expiryDate?.getTime() || 0) - (b.certification.expiryDate?.getTime() || 0)
        );
    }

    // ===========================================================================
    // SHIFT MANAGEMENT
    // ===========================================================================

    async createShift(data: Partial<Shift>): Promise<Shift> {
        const shift: Shift = {
            id: randomUUID(),
            name: data.name || "",
            startTime: data.startTime || "09:00",
            endTime: data.endTime || "17:00",
            breakDuration: data.breakDuration || 60,
            color: data.color || "#3B82F6",
            isActive: true,
            ...data
        };

        this.shifts.set(shift.id, shift);
        return shift;
    }

    async updateShift(id: string, data: Partial<Shift>): Promise<Shift | null> {
        const shift = this.shifts.get(id);
        if (!shift) return null;

        Object.assign(shift, data);
        return shift;
    }

    async getShift(id: string): Promise<Shift | null> {
        return this.shifts.get(id) || null;
    }

    async getShifts(): Promise<Shift[]> {
        return Array.from(this.shifts.values()).filter(s => s.isActive);
    }

    // ===========================================================================
    // SCHEDULING
    // ===========================================================================

    async createSchedule(data: Partial<Schedule>): Promise<{ schedule?: Schedule; conflicts?: SchedulingConflict[] }> {
        const schedule: Schedule = {
            id: randomUUID(),
            employeeId: data.employeeId || "",
            locationId: data.locationId || "",
            date: data.date || new Date(),
            startTime: data.startTime || "09:00",
            endTime: data.endTime || "17:00",
            breakDuration: data.breakDuration || 60,
            scheduledHours: 0,
            status: "scheduled",
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        schedule.scheduledHours = this.calculateHours(schedule.startTime, schedule.endTime, schedule.breakDuration);

        // Check for conflicts
        const conflicts = await this.checkSchedulingConflicts(schedule);
        if (conflicts.some(c => c.severity === "error")) {
            return { conflicts };
        }

        this.schedules.set(schedule.id, schedule);
        return { schedule, conflicts };
    }

    async updateSchedule(id: string, data: Partial<Schedule>): Promise<{ schedule?: Schedule; conflicts?: SchedulingConflict[] }> {
        const schedule = this.schedules.get(id);
        if (!schedule) return {};

        const updated = { ...schedule, ...data, updatedAt: new Date() };

        if (data.startTime || data.endTime || data.breakDuration) {
            updated.scheduledHours = this.calculateHours(
                updated.startTime,
                updated.endTime,
                updated.breakDuration
            );
        }

        const conflicts = await this.checkSchedulingConflicts(updated);
        if (conflicts.some(c => c.severity === "error")) {
            return { conflicts };
        }

        this.schedules.set(id, updated);
        return { schedule: updated, conflicts };
    }

    async deleteSchedule(id: string): Promise<boolean> {
        return this.schedules.delete(id);
    }

    async getSchedule(id: string): Promise<Schedule | null> {
        return this.schedules.get(id) || null;
    }

    async getEmployeeSchedules(employeeId: string, startDate: Date, endDate: Date): Promise<Schedule[]> {
        return Array.from(this.schedules.values())
            .filter(s =>
                s.employeeId === employeeId &&
                s.date >= startDate &&
                s.date <= endDate
            )
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    async getLocationSchedules(locationId: string, date: Date): Promise<Schedule[]> {
        return Array.from(this.schedules.values())
            .filter(s =>
                s.locationId === locationId &&
                s.date.toDateString() === date.toDateString()
            )
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    async generateScheduleFromTemplate(templateId: string, locationId: string, weekStartDate: Date, createdBy: string): Promise<Schedule[]> {
        const template = this.templates.get(templateId);
        if (!template) throw new Error("Template not found");

        const schedules: Schedule[] = [];
        const employees = await this.getAvailableEmployees(locationId, weekStartDate);

        for (const entry of template.entries) {
            const date = new Date(weekStartDate);
            date.setDate(date.getDate() + entry.dayOfWeek);

            // Simple assignment - in production would use optimization
            const availableEmployees = employees.filter(e =>
                !e.workPreferences.unavailableDates.some(d => d.toDateString() === date.toDateString())
            );

            for (let i = 0; i < Math.min(entry.requiredStaff, availableEmployees.length); i++) {
                const result = await this.createSchedule({
                    employeeId: availableEmployees[i].id,
                    shiftId: entry.shiftId,
                    locationId,
                    date,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    breakDuration: entry.breakDuration,
                    createdBy
                });

                if (result.schedule) {
                    schedules.push(result.schedule);
                }
            }
        }

        return schedules;
    }

    async getAvailableEmployees(locationId: string, date: Date): Promise<Employee[]> {
        const dayOfWeek = date.getDay();

        return Array.from(this.employees.values()).filter(e => {
            if (e.status !== "active") return false;
            if (!e.locations.includes(locationId)) return false;
            if (e.workPreferences.unavailableDates.some(d => d.toDateString() === date.toDateString())) return false;
            if (e.workPreferences.preferredDays.length > 0 && !e.workPreferences.preferredDays.includes(dayOfWeek)) return false;
            return true;
        });
    }

    private async checkSchedulingConflicts(schedule: Schedule): Promise<SchedulingConflict[]> {
        const conflicts: SchedulingConflict[] = [];
        const employee = await this.getEmployee(schedule.employeeId);
        if (!employee) return conflicts;

        // Check for overlapping schedules
        const existingSchedules = await this.getEmployeeSchedules(
            schedule.employeeId,
            schedule.date,
            schedule.date
        );

        for (const existing of existingSchedules) {
            if (existing.id === schedule.id) continue;
            if (this.timesOverlap(schedule.startTime, schedule.endTime, existing.startTime, existing.endTime)) {
                conflicts.push({
                    type: "overlap",
                    employeeId: schedule.employeeId,
                    scheduleIds: [schedule.id, existing.id],
                    description: "Schedule overlaps with existing shift",
                    severity: "error"
                });
            }
        }

        // Check for overtime
        const weekStart = this.getWeekStart(schedule.date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekSchedules = await this.getEmployeeSchedules(schedule.employeeId, weekStart, weekEnd);
        const totalHours = weekSchedules.reduce((sum, s) => sum + s.scheduledHours, 0) + schedule.scheduledHours;

        if (totalHours > employee.workPreferences.maxHoursPerWeek) {
            conflicts.push({
                type: "overtime",
                employeeId: schedule.employeeId,
                scheduleIds: [schedule.id],
                description: `Would exceed max hours (${totalHours} > ${employee.workPreferences.maxHoursPerWeek})`,
                severity: "warning"
            });
        }

        // Check for unavailable dates
        if (employee.workPreferences.unavailableDates.some(d => d.toDateString() === schedule.date.toDateString())) {
            conflicts.push({
                type: "unavailable",
                employeeId: schedule.employeeId,
                scheduleIds: [schedule.id],
                description: "Employee marked as unavailable on this date",
                severity: "warning"
            });
        }

        return conflicts;
    }

    private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        return start1 < end2 && end1 > start2;
    }

    private calculateHours(startTime: string, endTime: string, breakMinutes: number): number {
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);

        let minutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (minutes < 0) minutes += 24 * 60; // Handle overnight shifts

        return (minutes - breakMinutes) / 60;
    }

    private getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // ===========================================================================
    // TIME TRACKING
    // ===========================================================================

    async clockIn(employeeId: string, locationId: string): Promise<TimeEntry> {
        const now = new Date();
        const today = new Date(now.toDateString());

        // Check for existing entry
        const existing = Array.from(this.timeEntries.values()).find(
            e => e.employeeId === employeeId &&
                e.date.toDateString() === today.toDateString() &&
                !e.clockOut
        );

        if (existing) {
            throw new Error("Already clocked in");
        }

        // Find matching schedule
        const schedules = await this.getEmployeeSchedules(employeeId, today, today);
        const schedule = schedules.find(s => s.status === "scheduled" || s.status === "confirmed");

        const entry: TimeEntry = {
            id: randomUUID(),
            employeeId,
            scheduleId: schedule?.id,
            locationId,
            date: today,
            clockIn: now,
            totalBreakMinutes: 0,
            workedHours: 0,
            overtimeHours: 0,
            status: "pending",
            source: "clock",
            createdAt: now,
            updatedAt: now
        };

        this.timeEntries.set(entry.id, entry);

        // Update schedule status
        if (schedule) {
            schedule.status = "confirmed";
        }

        return entry;
    }

    async clockOut(entryId: string): Promise<TimeEntry> {
        const entry = this.timeEntries.get(entryId);
        if (!entry) throw new Error("Time entry not found");
        if (entry.clockOut) throw new Error("Already clocked out");

        const now = new Date();
        entry.clockOut = now;
        entry.workedHours = this.calculateWorkedHours(entry);
        entry.updatedAt = now;

        // Calculate overtime
        const employee = await this.getEmployee(entry.employeeId);
        if (employee && entry.workedHours > 8) {
            entry.overtimeHours = entry.workedHours - 8;
        }

        // Update schedule status
        if (entry.scheduleId) {
            const schedule = this.schedules.get(entry.scheduleId);
            if (schedule) {
                schedule.status = "completed";
            }
        }

        // Auto-approve if matches schedule
        if (entry.scheduleId) {
            entry.status = "auto_approved";
            entry.approvedAt = now;
        }

        return entry;
    }

    async startBreak(entryId: string): Promise<TimeEntry> {
        const entry = this.timeEntries.get(entryId);
        if (!entry) throw new Error("Time entry not found");
        if (entry.breakStart) throw new Error("Break already started");

        entry.breakStart = new Date();
        entry.updatedAt = new Date();

        return entry;
    }

    async endBreak(entryId: string): Promise<TimeEntry> {
        const entry = this.timeEntries.get(entryId);
        if (!entry) throw new Error("Time entry not found");
        if (!entry.breakStart) throw new Error("Break not started");
        if (entry.breakEnd) throw new Error("Break already ended");

        const now = new Date();
        entry.breakEnd = now;
        entry.totalBreakMinutes += Math.floor((now.getTime() - entry.breakStart.getTime()) / 60000);
        entry.breakStart = undefined;
        entry.updatedAt = now;

        return entry;
    }

    async createManualTimeEntry(data: {
        employeeId: string;
        locationId: string;
        date: Date;
        clockIn: Date;
        clockOut: Date;
        breakMinutes: number;
        notes?: string;
        createdBy: string;
    }): Promise<TimeEntry> {
        const entry: TimeEntry = {
            id: randomUUID(),
            employeeId: data.employeeId,
            locationId: data.locationId,
            date: data.date,
            clockIn: data.clockIn,
            clockOut: data.clockOut,
            totalBreakMinutes: data.breakMinutes,
            workedHours: 0,
            overtimeHours: 0,
            status: "pending",
            source: "manual",
            notes: data.notes,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        entry.workedHours = this.calculateWorkedHours(entry);
        if (entry.workedHours > 8) {
            entry.overtimeHours = entry.workedHours - 8;
        }

        this.timeEntries.set(entry.id, entry);
        return entry;
    }

    async approveTimeEntry(id: string, approverId: string): Promise<TimeEntry | null> {
        const entry = this.timeEntries.get(id);
        if (!entry) return null;

        entry.status = "approved";
        entry.approvedBy = approverId;
        entry.approvedAt = new Date();
        entry.updatedAt = new Date();

        return entry;
    }

    async rejectTimeEntry(id: string, approverId: string, reason: string): Promise<TimeEntry | null> {
        const entry = this.timeEntries.get(id);
        if (!entry) return null;

        entry.status = "rejected";
        entry.approvedBy = approverId;
        entry.approvedAt = new Date();
        entry.notes = (entry.notes || "") + `\nRejected: ${reason}`;
        entry.updatedAt = new Date();

        return entry;
    }

    async getTimeEntries(employeeId: string, startDate: Date, endDate: Date): Promise<TimeEntry[]> {
        return Array.from(this.timeEntries.values())
            .filter(e =>
                e.employeeId === employeeId &&
                e.date >= startDate &&
                e.date <= endDate
            )
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    async getPendingTimeEntries(): Promise<TimeEntry[]> {
        return Array.from(this.timeEntries.values())
            .filter(e => e.status === "pending")
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    private calculateWorkedHours(entry: TimeEntry): number {
        if (!entry.clockOut) return 0;

        const totalMinutes = (entry.clockOut.getTime() - entry.clockIn.getTime()) / 60000;
        return (totalMinutes - entry.totalBreakMinutes) / 60;
    }

    // ===========================================================================
    // LEAVE MANAGEMENT
    // ===========================================================================

    async requestLeave(data: {
        employeeId: string;
        type: LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
        attachments?: string[];
    }): Promise<Leave> {
        const totalDays = this.calculateLeaveDays(data.startDate, data.endDate);

        // Check balance
        const balance = await this.getLeaveBalance(data.employeeId, data.startDate.getFullYear());
        const typeBalance = balance?.balances.find(b => b.type === data.type);

        if (typeBalance && typeBalance.remaining < totalDays && data.type !== "unpaid") {
            throw new Error(`Insufficient leave balance. Available: ${typeBalance.remaining}, Requested: ${totalDays}`);
        }

        const leave: Leave = {
            id: randomUUID(),
            employeeId: data.employeeId,
            type: data.type,
            status: "pending",
            startDate: data.startDate,
            endDate: data.endDate,
            totalDays,
            reason: data.reason,
            attachments: data.attachments || [],
            requestedAt: new Date()
        };

        this.leaves.set(leave.id, leave);

        // Update pending balance
        if (typeBalance) {
            typeBalance.pending += totalDays;
        }

        return leave;
    }

    async approveLeave(id: string, approverId: string, notes?: string): Promise<Leave | null> {
        const leave = this.leaves.get(id);
        if (!leave || leave.status !== "pending") return null;

        leave.status = "approved";
        leave.reviewedBy = approverId;
        leave.reviewedAt = new Date();
        leave.reviewNotes = notes;

        // Update balance
        const balance = await this.getLeaveBalance(leave.employeeId, leave.startDate.getFullYear());
        const typeBalance = balance?.balances.find(b => b.type === leave.type);

        if (typeBalance) {
            typeBalance.pending -= leave.totalDays;
            typeBalance.used += leave.totalDays;
            typeBalance.remaining = typeBalance.entitled + typeBalance.carryOver - typeBalance.used;
        }

        // Block schedules for leave period
        const schedules = await this.getEmployeeSchedules(leave.employeeId, leave.startDate, leave.endDate);
        for (const schedule of schedules) {
            schedule.status = "cancelled";
            schedule.notes = `Cancelled due to ${leave.type} leave`;
        }

        return leave;
    }

    async rejectLeave(id: string, approverId: string, notes: string): Promise<Leave | null> {
        const leave = this.leaves.get(id);
        if (!leave || leave.status !== "pending") return null;

        leave.status = "rejected";
        leave.reviewedBy = approverId;
        leave.reviewedAt = new Date();
        leave.reviewNotes = notes;

        // Release pending balance
        const balance = await this.getLeaveBalance(leave.employeeId, leave.startDate.getFullYear());
        const typeBalance = balance?.balances.find(b => b.type === leave.type);

        if (typeBalance) {
            typeBalance.pending -= leave.totalDays;
        }

        return leave;
    }

    async cancelLeave(id: string): Promise<Leave | null> {
        const leave = this.leaves.get(id);
        if (!leave || leave.status === "cancelled") return null;

        const wasApproved = leave.status === "approved";
        leave.status = "cancelled";

        // Restore balance
        const balance = await this.getLeaveBalance(leave.employeeId, leave.startDate.getFullYear());
        const typeBalance = balance?.balances.find(b => b.type === leave.type);

        if (typeBalance) {
            if (wasApproved) {
                typeBalance.used -= leave.totalDays;
                typeBalance.remaining = typeBalance.entitled + typeBalance.carryOver - typeBalance.used;
            } else {
                typeBalance.pending -= leave.totalDays;
            }
        }

        return leave;
    }

    async getLeaves(employeeId: string, year?: number): Promise<Leave[]> {
        let leaves = Array.from(this.leaves.values()).filter(l => l.employeeId === employeeId);

        if (year) {
            leaves = leaves.filter(l => l.startDate.getFullYear() === year);
        }

        return leaves.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }

    async getPendingLeaves(): Promise<Leave[]> {
        return Array.from(this.leaves.values())
            .filter(l => l.status === "pending")
            .sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime());
    }

    async getLeaveBalance(employeeId: string, year: number): Promise<LeaveBalance | null> {
        const key = `${employeeId}-${year}`;
        return this.leaveBalances.get(key) || null;
    }

    private async initializeLeaveBalance(employeeId: string): Promise<void> {
        const year = new Date().getFullYear();
        const key = `${employeeId}-${year}`;

        const balance: LeaveBalance = {
            employeeId,
            year,
            balances: [
                { type: "annual", entitled: 25, used: 0, pending: 0, remaining: 25, carryOver: 0 },
                { type: "sick", entitled: 10, used: 0, pending: 0, remaining: 10, carryOver: 0 },
                { type: "personal", entitled: 3, used: 0, pending: 0, remaining: 3, carryOver: 0 },
                { type: "bereavement", entitled: 5, used: 0, pending: 0, remaining: 5, carryOver: 0 },
                { type: "unpaid", entitled: 999, used: 0, pending: 0, remaining: 999, carryOver: 0 }
            ]
        };

        this.leaveBalances.set(key, balance);
    }

    private calculateLeaveDays(startDate: Date, endDate: Date): number {
        let days = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days++;
            }
            current.setDate(current.getDate() + 1);
        }

        return days;
    }

    // ===========================================================================
    // ATTENDANCE
    // ===========================================================================

    async recordAttendance(employeeId: string, date: Date): Promise<Attendance> {
        const key = `${employeeId}-${date.toDateString()}`;

        const schedules = await this.getEmployeeSchedules(employeeId, date, date);
        const schedule = schedules[0];

        const timeEntries = await this.getTimeEntries(employeeId, date, date);
        const entry = timeEntries[0];

        let status: AttendanceStatus = "absent";
        let lateMinutes = 0;
        let earlyLeaveMinutes = 0;
        let overtimeMinutes = 0;

        if (date.getDay() === 0 || date.getDay() === 6) {
            status = "weekend";
        } else if (await this.isOnLeave(employeeId, date)) {
            status = "on_leave";
        } else if (entry) {
            status = "present";

            if (schedule && entry.clockIn) {
                const scheduledStart = this.parseTime(schedule.startTime);
                const actualStart = entry.clockIn.getHours() * 60 + entry.clockIn.getMinutes();

                if (actualStart > scheduledStart + 5) {
                    lateMinutes = actualStart - scheduledStart;
                    status = "late";
                }
            }

            if (schedule && entry.clockOut) {
                const scheduledEnd = this.parseTime(schedule.endTime);
                const actualEnd = entry.clockOut.getHours() * 60 + entry.clockOut.getMinutes();

                if (actualEnd < scheduledEnd - 5) {
                    earlyLeaveMinutes = scheduledEnd - actualEnd;
                    if (status === "late") {
                        status = "present";
                    } else {
                        status = "early_leave";
                    }
                }
            }

            if (entry.overtimeHours > 0) {
                overtimeMinutes = Math.floor(entry.overtimeHours * 60);
            }
        }

        const attendance: Attendance = {
            id: randomUUID(),
            employeeId,
            date,
            status,
            scheduledStart: schedule?.startTime,
            scheduledEnd: schedule?.endTime,
            actualStart: entry?.clockIn ? `${entry.clockIn.getHours()}:${entry.clockIn.getMinutes().toString().padStart(2, "0")}` : undefined,
            actualEnd: entry?.clockOut ? `${entry.clockOut.getHours()}:${entry.clockOut.getMinutes().toString().padStart(2, "0")}` : undefined,
            lateMinutes,
            earlyLeaveMinutes,
            overtimeMinutes
        };

        this.attendance.set(key, attendance);
        return attendance;
    }

    async getAttendance(employeeId: string, startDate: Date, endDate: Date): Promise<Attendance[]> {
        const results: Attendance[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const key = `${employeeId}-${current.toDateString()}`;
            const attendance = this.attendance.get(key);
            if (attendance) {
                results.push(attendance);
            }
            current.setDate(current.getDate() + 1);
        }

        return results;
    }

    async calculateAttendanceRate(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
        const attendance = await this.getAttendance(employeeId, startDate, endDate);

        const workDays = attendance.filter(a =>
            a.status !== "weekend" && a.status !== "holiday" && a.status !== "on_leave"
        );

        if (workDays.length === 0) return 100;

        const presentDays = workDays.filter(a =>
            a.status === "present" || a.status === "late" || a.status === "early_leave"
        );

        return (presentDays.length / workDays.length) * 100;
    }

    private async isOnLeave(employeeId: string, date: Date): Promise<boolean> {
        const leaves = await this.getLeaves(employeeId, date.getFullYear());
        return leaves.some(l =>
            l.status === "approved" &&
            date >= l.startDate &&
            date <= l.endDate
        );
    }

    private parseTime(time: string): number {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    }

    // ===========================================================================
    // PERFORMANCE REVIEWS
    // ===========================================================================

    async createPerformanceReview(data: {
        employeeId: string;
        reviewerId: string;
        periodStart: Date;
        periodEnd: Date;
        type: PerformanceReview["type"];
        criteria: PerformanceCriterion[];
    }): Promise<PerformanceReview> {
        const review: PerformanceReview = {
            id: randomUUID(),
            employeeId: data.employeeId,
            reviewerId: data.reviewerId,
            reviewPeriod: { start: data.periodStart, end: data.periodEnd },
            type: data.type,
            status: "draft",
            overallRating: 0,
            criteria: data.criteria,
            strengths: [],
            improvements: [],
            goals: [],
            comments: ""
        };

        this.reviews.set(review.id, review);
        return review;
    }

    async updatePerformanceReview(id: string, data: Partial<PerformanceReview>): Promise<PerformanceReview | null> {
        const review = this.reviews.get(id);
        if (!review) return null;

        Object.assign(review, data);

        // Calculate overall rating if criteria is updated
        if (data.criteria) {
            let totalWeight = 0;
            let weightedSum = 0;

            for (const c of review.criteria) {
                weightedSum += c.rating * c.weight;
                totalWeight += c.weight;
            }

            review.overallRating = totalWeight > 0 ? weightedSum / totalWeight : 0;
        }

        return review;
    }

    async completeReview(id: string): Promise<PerformanceReview | null> {
        const review = this.reviews.get(id);
        if (!review) return null;

        review.status = "completed";
        review.completedAt = new Date();

        // Update employee performance rating
        const employee = await this.getEmployee(review.employeeId);
        if (employee) {
            employee.performanceRating = review.overallRating;
            employee.updatedAt = new Date();
        }

        return review;
    }

    async acknowledgeReview(id: string, employeeComments?: string): Promise<PerformanceReview | null> {
        const review = this.reviews.get(id);
        if (!review || review.status !== "completed") return null;

        review.status = "acknowledged";
        review.acknowledgedAt = new Date();
        if (employeeComments) {
            review.employeeComments = employeeComments;
        }

        return review;
    }

    async getReviews(employeeId: string): Promise<PerformanceReview[]> {
        return Array.from(this.reviews.values())
            .filter(r => r.employeeId === employeeId)
            .sort((a, b) => b.reviewPeriod.end.getTime() - a.reviewPeriod.end.getTime());
    }

    // ===========================================================================
    // PAYROLL
    // ===========================================================================

    async generatePayroll(employeeId: string, periodStart: Date, periodEnd: Date): Promise<Payroll> {
        const employee = await this.getEmployee(employeeId);
        if (!employee) throw new Error("Employee not found");

        const timeEntries = await this.getTimeEntries(employeeId, periodStart, periodEnd);
        const approvedEntries = timeEntries.filter(e =>
            e.status === "approved" || e.status === "auto_approved"
        );

        let regularHours = 0;
        let overtimeHours = 0;

        for (const entry of approvedEntries) {
            regularHours += Math.min(entry.workedHours, 8);
            overtimeHours += entry.overtimeHours;
        }

        let grossPay = 0;
        if (employee.compensation.type === "hourly") {
            grossPay = regularHours * employee.compensation.basePay;
            grossPay += overtimeHours * employee.compensation.basePay * employee.compensation.overtimeRate;
        } else if (employee.compensation.type === "salary") {
            grossPay = employee.compensation.basePay;
            grossPay += overtimeHours * (employee.compensation.basePay / 160) * employee.compensation.overtimeRate;
        }

        const deductions: PayrollDeduction[] = [
            { type: "tax", description: "Income Tax", amount: grossPay * 0.22, isPreTax: false },
            { type: "social_security", description: "Social Security", amount: grossPay * 0.06, isPreTax: true },
            { type: "health_insurance", description: "Health Insurance", amount: 150, isPreTax: true }
        ];

        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
        const netPay = grossPay - totalDeductions;

        const payroll: Payroll = {
            id: randomUUID(),
            employeeId,
            periodStart,
            periodEnd,
            status: "pending",
            regularHours,
            overtimeHours,
            grossPay,
            deductions,
            totalDeductions,
            netPay,
            payDate: new Date(periodEnd.getTime() + 5 * 24 * 60 * 60 * 1000)
        };

        this.payrolls.set(payroll.id, payroll);
        return payroll;
    }

    async approvePayroll(id: string, approverId: string): Promise<Payroll | null> {
        const payroll = this.payrolls.get(id);
        if (!payroll || payroll.status !== "pending") return null;

        payroll.status = "approved";
        payroll.processedBy = approverId;
        payroll.processedAt = new Date();

        return payroll;
    }

    async processPayroll(id: string): Promise<Payroll | null> {
        const payroll = this.payrolls.get(id);
        if (!payroll || payroll.status !== "approved") return null;

        payroll.status = "paid";

        return payroll;
    }

    async getPayrolls(employeeId: string, year?: number): Promise<Payroll[]> {
        let payrolls = Array.from(this.payrolls.values()).filter(p => p.employeeId === employeeId);

        if (year) {
            payrolls = payrolls.filter(p => p.periodStart.getFullYear() === year);
        }

        return payrolls.sort((a, b) => b.periodStart.getTime() - a.periodStart.getTime());
    }

    // ===========================================================================
    // SHIFT SWAPS
    // ===========================================================================

    async requestShiftSwap(requesterId: string, requesterScheduleId: string, reason: string): Promise<ShiftSwapRequest> {
        const request: ShiftSwapRequest = {
            id: randomUUID(),
            requesterId,
            requesterScheduleId,
            status: "open",
            reason,
            managerApproval: false,
            createdAt: new Date()
        };

        this.swapRequests.set(request.id, request);
        return request;
    }

    async acceptShiftSwap(requestId: string, targetEmployeeId: string, targetScheduleId: string): Promise<ShiftSwapRequest | null> {
        const request = this.swapRequests.get(requestId);
        if (!request || request.status !== "open") return null;

        request.targetEmployeeId = targetEmployeeId;
        request.targetScheduleId = targetScheduleId;
        request.status = "pending";
        request.respondedAt = new Date();

        return request;
    }

    async approveShiftSwap(requestId: string, approverId: string): Promise<ShiftSwapRequest | null> {
        const request = this.swapRequests.get(requestId);
        if (!request || request.status !== "pending") return null;

        const schedule1 = this.schedules.get(request.requesterScheduleId);
        const schedule2 = this.schedules.get(request.targetScheduleId!);

        if (!schedule1 || !schedule2) return null;

        // Swap employees
        const temp = schedule1.employeeId;
        schedule1.employeeId = schedule2.employeeId;
        schedule2.employeeId = temp;

        schedule1.updatedAt = new Date();
        schedule2.updatedAt = new Date();

        request.status = "approved";
        request.approvedBy = approverId;
        request.approvedAt = new Date();
        request.managerApproval = true;

        return request;
    }

    async rejectShiftSwap(requestId: string, approverId: string): Promise<ShiftSwapRequest | null> {
        const request = this.swapRequests.get(requestId);
        if (!request) return null;

        request.status = "rejected";
        request.approvedBy = approverId;
        request.approvedAt = new Date();

        return request;
    }

    // ===========================================================================
    // REPORTING
    // ===========================================================================

    async getWorkforceSummary(): Promise<{
        totalEmployees: number;
        byStatus: Record<EmployeeStatus, number>;
        byDepartment: Record<string, number>;
        byEmploymentType: Record<EmploymentType, number>;
        averageAttendanceRate: number;
        averagePerformanceRating: number;
    }> {
        const employees = Array.from(this.employees.values());

        const byStatus: Record<EmployeeStatus, number> = {
            active: 0, on_leave: 0, suspended: 0, terminated: 0
        };
        const byDepartment: Record<string, number> = {};
        const byEmploymentType: Record<EmploymentType, number> = {
            full_time: 0, part_time: 0, contractor: 0, intern: 0, temporary: 0
        };

        let totalAttendanceRate = 0;
        let totalPerformanceRating = 0;
        let ratedCount = 0;

        for (const emp of employees) {
            byStatus[emp.status]++;
            byEmploymentType[emp.employmentType]++;
            byDepartment[emp.department] = (byDepartment[emp.department] || 0) + 1;
            totalAttendanceRate += emp.attendanceRate;

            if (emp.performanceRating > 0) {
                totalPerformanceRating += emp.performanceRating;
                ratedCount++;
            }
        }

        return {
            totalEmployees: employees.length,
            byStatus,
            byDepartment,
            byEmploymentType,
            averageAttendanceRate: employees.length > 0 ? totalAttendanceRate / employees.length : 0,
            averagePerformanceRating: ratedCount > 0 ? totalPerformanceRating / ratedCount : 0
        };
    }

    async getSchedulingCoverage(locationId: string, startDate: Date, endDate: Date): Promise<{
        totalShifts: number;
        filledShifts: number;
        openShifts: number;
        coverageRate: number;
        byDay: Array<{ date: Date; scheduled: number; required: number }>;
    }> {
        const schedules = await this.getLocationSchedules(locationId, startDate);
        // Simplified coverage calculation
        return {
            totalShifts: schedules.length,
            filledShifts: schedules.filter(s => s.status !== "cancelled").length,
            openShifts: 0,
            coverageRate: 100,
            byDay: []
        };
    }

    async getOvertimeReport(startDate: Date, endDate: Date): Promise<Array<{
        employeeId: string;
        employeeName: string;
        regularHours: number;
        overtimeHours: number;
        estimatedOvertimeCost: number;
    }>> {
        const results: Array<{
            employeeId: string;
            employeeName: string;
            regularHours: number;
            overtimeHours: number;
            estimatedOvertimeCost: number;
        }> = [];

        for (const employee of this.employees.values()) {
            const entries = await this.getTimeEntries(employee.id, startDate, endDate);

            let regularHours = 0;
            let overtimeHours = 0;

            for (const entry of entries) {
                regularHours += Math.min(entry.workedHours, 8);
                overtimeHours += entry.overtimeHours;
            }

            if (overtimeHours > 0) {
                const overtimeRate = employee.compensation.type === "hourly"
                    ? employee.compensation.basePay * employee.compensation.overtimeRate
                    : (employee.compensation.basePay / 160) * employee.compensation.overtimeRate;

                results.push({
                    employeeId: employee.id,
                    employeeName: employee.fullName,
                    regularHours,
                    overtimeHours,
                    estimatedOvertimeCost: overtimeHours * overtimeRate
                });
            }
        }

        return results.sort((a, b) => b.overtimeHours - a.overtimeHours);
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const workforceService = new WorkforceService();
export default workforceService;
