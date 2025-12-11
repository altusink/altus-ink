import { eq, and, desc, sql, gte, lte, count } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  artists,
  artistAvailability,
  citySchedule,
  bookingLocks,
  bookings,
  payments,
  deposits,
  notifications,
  financialLedger,
  globalSettings,
  portfolioCategories,
  portfolioPhotos,
  depositValues,
  vendorGoals,
  vendorCommissions,
  waitingList,
  emailTemplates,
  type User,
  type UpsertUser,
  type Artist,
  type InsertArtist,
  type Availability,
  type InsertAvailability,
  type CitySchedule,
  type InsertCitySchedule,
  type BookingLock,
  type InsertBookingLock,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
  type Deposit,
  type InsertDeposit,
  type PortfolioCategory,
  type InsertPortfolioCategory,
  type PortfolioPhoto,
  type InsertPortfolioPhoto,
  type DepositValue,
  type InsertDepositValue,
  type VendorGoal,
  type InsertVendorGoal,
  type VendorCommission,
  type InsertVendorCommission,
  type WaitingListEntry,
  type InsertWaitingList,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Artist operations
  getArtist(id: string): Promise<Artist | undefined>;
  getArtistByUserId(userId: string): Promise<Artist | undefined>;
  getArtistBySubdomain(subdomain: string): Promise<Artist | undefined>;
  getAllArtists(): Promise<Artist[]>;
  getPendingArtists(): Promise<Artist[]>;
  createArtist(data: InsertArtist): Promise<Artist>;
  updateArtist(id: string, data: Partial<InsertArtist>): Promise<Artist | undefined>;
  approveArtist(id: string): Promise<Artist | undefined>;
  deactivateArtist(id: string): Promise<Artist | undefined>;
  
  // Availability operations
  getArtistAvailability(artistId: string): Promise<Availability[]>;
  upsertAvailability(data: InsertAvailability & { artistId: string }): Promise<Availability>;
  
  // City schedule operations
  getCitySchedules(artistId: string): Promise<CitySchedule[]>;
  createCitySchedule(data: InsertCitySchedule): Promise<CitySchedule>;
  deleteCitySchedule(id: string): Promise<void>;
  
  // Booking lock operations
  createBookingLock(data: InsertBookingLock): Promise<BookingLock>;
  getBookingLock(id: string): Promise<BookingLock | undefined>;
  expireOldLocks(): Promise<void>;
  
  // Booking operations
  getArtistBookings(artistId: string): Promise<Booking[]>;
  getArtistBookingsByMonth(artistId: string, month: number, year: number): Promise<Booking[]>;
  createBooking(data: InsertBooking): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  getRecentBookings(limit?: number): Promise<Booking[]>;
  
  // Deposit operations
  getArtistDeposits(artistId: string): Promise<Deposit[]>;
  getAllDeposits(): Promise<Deposit[]>;
  createDeposit(data: InsertDeposit): Promise<Deposit>;
  
  // Portfolio operations
  getPortfolioCategories(artistId: string): Promise<PortfolioCategory[]>;
  createPortfolioCategory(data: InsertPortfolioCategory): Promise<PortfolioCategory>;
  updatePortfolioCategory(id: string, data: Partial<InsertPortfolioCategory>): Promise<PortfolioCategory | undefined>;
  deletePortfolioCategory(id: string): Promise<void>;
  getPortfolioPhotos(categoryId: string): Promise<PortfolioPhoto[]>;
  getAllArtistPhotos(artistId: string): Promise<PortfolioPhoto[]>;
  createPortfolioPhoto(data: InsertPortfolioPhoto): Promise<PortfolioPhoto>;
  deletePortfolioPhoto(id: string): Promise<void>;
  getPhotosCountByCategory(categoryId: string): Promise<number>;
  
  // Deposit values operations
  getDepositValues(artistId: string): Promise<DepositValue[]>;
  createDepositValue(data: InsertDepositValue): Promise<DepositValue>;
  updateDepositValue(id: string, data: Partial<InsertDepositValue>): Promise<DepositValue | undefined>;
  deleteDepositValue(id: string): Promise<void>;
  
  // Vendor operations
  getVendorGoals(vendorId: string): Promise<VendorGoal[]>;
  createVendorGoal(data: InsertVendorGoal): Promise<VendorGoal>;
  getVendorCommissions(vendorId: string): Promise<VendorCommission[]>;
  createVendorCommission(data: InsertVendorCommission): Promise<VendorCommission>;
  
  // Waiting list operations
  getWaitingList(artistId: string): Promise<WaitingListEntry[]>;
  addToWaitingList(data: InsertWaitingList): Promise<WaitingListEntry>;
  
  // Stats
  getArtistStats(artistId: string): Promise<{
    upcomingBookings: number;
    thisWeekBookings: number;
    totalEarnings: number;
    totalClients: number;
    heldDeposits: number;
    availableDeposits: number;
  }>;
  getCEOStats(): Promise<{
    totalArtists: number;
    activeArtists: number;
    pendingApprovals: number;
    totalBookings: number;
    monthlyBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    platformFees: number;
    heldDeposits: number;
    availableDeposits: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Artist operations
  async getArtist(id: string): Promise<Artist | undefined> {
    const result = await db.select().from(artists).where(eq(artists.id, id));
    return result[0];
  }

  async getArtistByUserId(userId: string): Promise<Artist | undefined> {
    const result = await db.select().from(artists).where(eq(artists.userId, userId));
    return result[0];
  }

  async getArtistBySubdomain(subdomain: string): Promise<Artist | undefined> {
    const result = await db.select().from(artists).where(eq(artists.subdomain, subdomain));
    return result[0];
  }

  async getAllArtists(): Promise<Artist[]> {
    return db.select().from(artists).orderBy(desc(artists.createdAt));
  }

  async getPendingArtists(): Promise<Artist[]> {
    return db.select().from(artists).where(eq(artists.isApproved, false));
  }

  async createArtist(data: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(data).returning();
    return artist;
  }

  async updateArtist(id: string, data: Partial<InsertArtist>): Promise<Artist | undefined> {
    const [artist] = await db
      .update(artists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(artists.id, id))
      .returning();
    return artist;
  }

  async approveArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db
      .update(artists)
      .set({ isApproved: true, isActive: true, updatedAt: new Date() })
      .where(eq(artists.id, id))
      .returning();
    return artist;
  }

  async deactivateArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db
      .update(artists)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(artists.id, id))
      .returning();
    return artist;
  }

  // Availability operations
  async getArtistAvailability(artistId: string): Promise<Availability[]> {
    return db.select().from(artistAvailability).where(eq(artistAvailability.artistId, artistId));
  }

  async upsertAvailability(data: InsertAvailability & { artistId: string }): Promise<Availability> {
    // Check if exists for this day
    const existing = await db
      .select()
      .from(artistAvailability)
      .where(
        and(
          eq(artistAvailability.artistId, data.artistId),
          eq(artistAvailability.dayOfWeek, data.dayOfWeek)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(artistAvailability)
        .set(data)
        .where(eq(artistAvailability.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(artistAvailability).values(data).returning();
    return created;
  }

  // City schedule operations
  async getCitySchedules(artistId: string): Promise<CitySchedule[]> {
    return db
      .select()
      .from(citySchedule)
      .where(eq(citySchedule.artistId, artistId))
      .orderBy(desc(citySchedule.startDate));
  }

  async createCitySchedule(data: InsertCitySchedule): Promise<CitySchedule> {
    const [schedule] = await db.insert(citySchedule).values(data).returning();
    return schedule;
  }

  async deleteCitySchedule(id: string): Promise<void> {
    await db.delete(citySchedule).where(eq(citySchedule.id, id));
  }

  // Booking lock operations
  async createBookingLock(data: InsertBookingLock): Promise<BookingLock> {
    const [lock] = await db.insert(bookingLocks).values(data).returning();
    return lock;
  }

  async getBookingLock(id: string): Promise<BookingLock | undefined> {
    const result = await db.select().from(bookingLocks).where(eq(bookingLocks.id, id));
    return result[0];
  }

  async expireOldLocks(): Promise<void> {
    await db
      .update(bookingLocks)
      .set({ status: "expired" })
      .where(
        and(
          eq(bookingLocks.status, "pending"),
          lte(bookingLocks.expiresAt, new Date())
        )
      );
  }

  async confirmBookingLock(id: string): Promise<BookingLock | undefined> {
    const [lock] = await db
      .update(bookingLocks)
      .set({ status: "confirmed" })
      .where(eq(bookingLocks.id, id))
      .returning();
    return lock;
  }

  async isSlotAvailable(artistId: string, slotDatetime: Date): Promise<boolean> {
    // Check for existing confirmed bookings
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.artistId, artistId),
          eq(bookings.slotDatetime, slotDatetime),
          eq(bookings.status, "confirmed")
        )
      );
    
    if (existingBookings.length > 0) {
      return false;
    }
    
    // Check for active (non-expired) locks
    const activeLocks = await db
      .select()
      .from(bookingLocks)
      .where(
        and(
          eq(bookingLocks.artistId, artistId),
          eq(bookingLocks.slotDatetime, slotDatetime),
          eq(bookingLocks.status, "pending"),
          gte(bookingLocks.expiresAt, new Date())
        )
      );
    
    return activeLocks.length === 0;
  }

  async updateDepositStatuses(): Promise<void> {
    // Update deposits that have passed their retention period to "available"
    await db
      .update(deposits)
      .set({ status: "available" })
      .where(
        and(
          eq(deposits.status, "held"),
          lte(deposits.retentionUntil, new Date())
        )
      );
  }

  // Booking operations
  async getArtistBookings(artistId: string): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.artistId, artistId))
      .orderBy(desc(bookings.slotDatetime));
  }

  async getArtistBookingsByMonth(artistId: string, month: number, year: number): Promise<Booking[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    
    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.artistId, artistId),
          gte(bookings.slotDatetime, startDate),
          lte(bookings.slotDatetime, endDate)
        )
      )
      .orderBy(bookings.slotDatetime);
  }

  async createBooking(data: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getRecentBookings(limit = 10): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(limit);
  }

  // Deposit operations
  async getArtistDeposits(artistId: string): Promise<Deposit[]> {
    return db
      .select()
      .from(deposits)
      .where(eq(deposits.artistId, artistId))
      .orderBy(desc(deposits.createdAt));
  }

  async getAllDeposits(): Promise<Deposit[]> {
    return db.select().from(deposits).orderBy(desc(deposits.createdAt));
  }

  async createDeposit(data: InsertDeposit): Promise<Deposit> {
    const [deposit] = await db.insert(deposits).values(data).returning();
    return deposit;
  }

  // Portfolio operations
  async getPortfolioCategories(artistId: string): Promise<PortfolioCategory[]> {
    return db
      .select()
      .from(portfolioCategories)
      .where(eq(portfolioCategories.artistId, artistId))
      .orderBy(portfolioCategories.sortOrder);
  }

  async createPortfolioCategory(data: InsertPortfolioCategory): Promise<PortfolioCategory> {
    const [category] = await db.insert(portfolioCategories).values(data).returning();
    return category;
  }

  async updatePortfolioCategory(id: string, data: Partial<InsertPortfolioCategory>): Promise<PortfolioCategory | undefined> {
    const [category] = await db
      .update(portfolioCategories)
      .set(data)
      .where(eq(portfolioCategories.id, id))
      .returning();
    return category;
  }

  async deletePortfolioCategory(id: string): Promise<void> {
    await db.delete(portfolioCategories).where(eq(portfolioCategories.id, id));
  }

  async getPortfolioPhotos(categoryId: string): Promise<PortfolioPhoto[]> {
    return db
      .select()
      .from(portfolioPhotos)
      .where(eq(portfolioPhotos.categoryId, categoryId))
      .orderBy(portfolioPhotos.sortOrder);
  }

  async getAllArtistPhotos(artistId: string): Promise<PortfolioPhoto[]> {
    return db
      .select()
      .from(portfolioPhotos)
      .where(eq(portfolioPhotos.artistId, artistId))
      .orderBy(portfolioPhotos.sortOrder);
  }

  async createPortfolioPhoto(data: InsertPortfolioPhoto): Promise<PortfolioPhoto> {
    const [photo] = await db.insert(portfolioPhotos).values(data).returning();
    return photo;
  }

  async deletePortfolioPhoto(id: string): Promise<void> {
    await db.delete(portfolioPhotos).where(eq(portfolioPhotos.id, id));
  }

  async getPhotosCountByCategory(categoryId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(portfolioPhotos)
      .where(eq(portfolioPhotos.categoryId, categoryId));
    return result[0]?.count ?? 0;
  }

  // Deposit values operations
  async getDepositValues(artistId: string): Promise<DepositValue[]> {
    return db
      .select()
      .from(depositValues)
      .where(eq(depositValues.artistId, artistId))
      .orderBy(depositValues.sortOrder);
  }

  async createDepositValue(data: InsertDepositValue): Promise<DepositValue> {
    const [value] = await db.insert(depositValues).values(data).returning();
    return value;
  }

  async updateDepositValue(id: string, data: Partial<InsertDepositValue>): Promise<DepositValue | undefined> {
    const [value] = await db
      .update(depositValues)
      .set(data)
      .where(eq(depositValues.id, id))
      .returning();
    return value;
  }

  async deleteDepositValue(id: string): Promise<void> {
    await db.delete(depositValues).where(eq(depositValues.id, id));
  }

  // Vendor operations
  async getVendorGoals(vendorId: string): Promise<VendorGoal[]> {
    return db
      .select()
      .from(vendorGoals)
      .where(eq(vendorGoals.vendorId, vendorId))
      .orderBy(desc(vendorGoals.year), desc(vendorGoals.month));
  }

  async createVendorGoal(data: InsertVendorGoal): Promise<VendorGoal> {
    const [goal] = await db.insert(vendorGoals).values(data).returning();
    return goal;
  }

  async getVendorCommissions(vendorId: string): Promise<VendorCommission[]> {
    return db
      .select()
      .from(vendorCommissions)
      .where(eq(vendorCommissions.vendorId, vendorId))
      .orderBy(desc(vendorCommissions.createdAt));
  }

  async createVendorCommission(data: InsertVendorCommission): Promise<VendorCommission> {
    const [commission] = await db.insert(vendorCommissions).values(data).returning();
    return commission;
  }

  // Waiting list operations
  async getWaitingList(artistId: string): Promise<WaitingListEntry[]> {
    return db
      .select()
      .from(waitingList)
      .where(and(eq(waitingList.artistId, artistId), eq(waitingList.status, "waiting")))
      .orderBy(waitingList.createdAt);
  }

  async addToWaitingList(data: InsertWaitingList): Promise<WaitingListEntry> {
    const [entry] = await db.insert(waitingList).values(data).returning();
    return entry;
  }

  // Stats
  async getArtistStats(artistId: string): Promise<{
    upcomingBookings: number;
    thisWeekBookings: number;
    totalEarnings: number;
    totalClients: number;
    heldDeposits: number;
    availableDeposits: number;
  }> {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allBookings = await this.getArtistBookings(artistId);
    const artistDeposits = await this.getArtistDeposits(artistId);

    const upcomingBookings = allBookings.filter(
      (b) => new Date(b.slotDatetime) > now && b.status === "confirmed"
    ).length;

    const thisWeekBookings = allBookings.filter((b) => {
      const bookingDate = new Date(b.slotDatetime);
      return bookingDate >= now && bookingDate <= weekAhead && b.status === "confirmed";
    }).length;

    const heldDeposits = artistDeposits
      .filter((d) => d.status === "held")
      .reduce((sum, d) => sum + Number(d.artistAmount), 0);

    const availableDeposits = artistDeposits
      .filter((d) => d.status === "available")
      .reduce((sum, d) => sum + Number(d.artistAmount), 0);

    const totalEarnings = artistDeposits.reduce((sum, d) => sum + Number(d.artistAmount), 0);

    const uniqueClients = new Set(allBookings.map((b) => b.customerEmail)).size;

    return {
      upcomingBookings,
      thisWeekBookings,
      totalEarnings,
      totalClients: uniqueClients,
      heldDeposits,
      availableDeposits,
    };
  }

  async getCEOStats(): Promise<{
    totalArtists: number;
    activeArtists: number;
    pendingApprovals: number;
    totalBookings: number;
    monthlyBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    platformFees: number;
    heldDeposits: number;
    availableDeposits: number;
  }> {
    const allArtists = await this.getAllArtists();
    const allBookings = await this.getAllBookings();
    const allDeposits = await this.getAllDeposits();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalArtists = allArtists.length;
    const activeArtists = allArtists.filter((a) => a.isApproved && a.isActive).length;
    const pendingApprovals = allArtists.filter((a) => !a.isApproved).length;
    const totalBookings = allBookings.length;
    const monthlyBookings = allBookings.filter(
      (b) => new Date(b.createdAt!) >= monthStart
    ).length;

    const totalRevenue = allDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
    const monthlyRevenue = allDeposits
      .filter((d) => new Date(d.createdAt!) >= monthStart)
      .reduce((sum, d) => sum + Number(d.amount), 0);

    const platformFees = allDeposits.reduce((sum, d) => sum + Number(d.platformFee), 0);
    const heldDeposits = allDeposits
      .filter((d) => d.status === "held")
      .reduce((sum, d) => sum + Number(d.amount), 0);
    const availableDeposits = allDeposits
      .filter((d) => d.status === "available")
      .reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      totalArtists,
      activeArtists,
      pendingApprovals,
      totalBookings,
      monthlyBookings,
      totalRevenue,
      monthlyRevenue,
      platformFees,
      heldDeposits,
      availableDeposits,
    };
  }
}

export const storage = new DatabaseStorage();
