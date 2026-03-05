export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  anniversary?: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  avgTicket: number;
  favoriteBeers: string[];
  dietaryRestrictions: string[];
  tags: string[];
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  mugClubMember: boolean;
  mugClubTier?: string;
  notes: string;
  source: string;
  familyMembers?: FamilyMember[];
}

export interface FamilyMember {
  name: string;
  relation: string;
  age?: number;
}

export interface Beer {
  id: string;
  name: string;
  style: string;
  abv: number;
  ibu: number;
  srm: number;
  description: string;
  tastingNotes: string;
  foodPairings: string[];
  status: 'on-tap' | 'fermenting' | 'conditioning' | 'planned' | 'archived';
  tapNumber?: number;
  kegLevel?: number;
  batchId?: string;
  recipe?: Recipe;
  rating: number;
  totalPours: number;
  category: 'flagship' | 'seasonal' | 'limited' | 'experimental';
  isNonAlcoholic?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  style: string;
  batchSize: number;
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  grains: Ingredient[];
  hops: HopAddition[];
  yeast: string;
  waterProfile: string;
  mashTemp: number;
  mashTime: number;
  boilTime: number;
  notes: string;
  versions: number;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  type?: string;
}

export interface HopAddition {
  name: string;
  amount: number;
  unit: string;
  time: number;
  type: 'bittering' | 'flavor' | 'aroma' | 'dry-hop';
}

export interface Batch {
  id: string;
  batchNumber: string;
  beerId: string;
  beerName: string;
  style: string;
  recipeId?: string;
  status: 'planned' | 'mashing' | 'boiling' | 'fermenting' | 'conditioning' | 'carbonating' | 'ready' | 'packaged';
  brewDate: string;
  targetOG: number;
  actualOG?: number;
  targetFG: number;
  actualFG?: number;
  abv?: number;
  tankId: string;
  volume: number;
  notes: string;
  gravityReadings: GravityReading[];
  temperatureLog: TempReading[];
  qualityScore?: number;
}

export interface GravityReading {
  date: string;
  gravity: number;
  temp: number;
}

export interface TempReading {
  date: string;
  temp: number;
}

export interface TapLine {
  tapNumber: number;
  beerId?: string;
  beerName?: string;
  style?: string;
  abv?: number;
  ibu?: number;
  kegLevel: number;
  kegSize: '1/2' | '1/4' | '1/6';
  tappedDate?: string;
  estimatedKickDate?: string;
  status: 'active' | 'empty' | 'cleaning' | 'reserved';
  pourSizes: PourSize[];
  totalPours: number;
  revenueToday: number;
}

export interface PourSize {
  name: string;
  oz: number;
  price: number;
}

export interface BreweryEvent {
  id: string;
  title: string;
  type: 'live-music' | 'trivia' | 'beer-release' | 'tap-takeover' | 'pairing-dinner' | 'private' | 'family' | 'tour' | 'holiday' | 'fundraiser';
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  performer?: Performer;
  capacity: number;
  ticketsSold: number;
  ticketPrice: number;
  isTicketed: boolean;
  isFamilyFriendly: boolean;
  location: 'taproom' | 'patio' | 'beer-garden' | 'event-hall' | 'outdoor';
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  revenue: number;
  specialBeer?: string;
  imageUrl?: string;
}

export interface Performer {
  id: string;
  name: string;
  genre: string;
  contactEmail: string;
  contactPhone: string;
  fee: number;
  rating: number;
  pastPerformances: number;
  bio: string;
  socialLinks: { platform: string; url: string }[];
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  partySize: number;
  tableId?: string;
  section: 'taproom' | 'patio' | 'beer-garden' | 'private-room';
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show' | 'waitlist';
  notes: string;
  specialRequests: string[];
  isHighChairNeeded: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: 'appetizer' | 'entree' | 'side' | 'dessert' | 'kids' | 'beverage-na' | 'merchandise';
  price: number;
  cost: number;
  isAvailable: boolean;
  allergens: string[];
  dietaryTags: string[];
  isKidsFriendly: boolean;
  popularity: number;
  imageUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'grain' | 'hops' | 'yeast' | 'adjunct' | 'chemical' | 'packaging' | 'food' | 'na-beverage' | 'merchandise' | 'supplies';
  currentStock: number;
  unit: string;
  parLevel: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier: string;
  lastOrdered?: string;
  expirationDate?: string;
  location: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: 'brewer' | 'bartender' | 'server' | 'cook' | 'host' | 'manager' | 'dishwasher';
  email: string;
  phone: string;
  hireDate: string;
  hourlyRate: number;
  status: 'active' | 'on-leave' | 'terminated';
  tabcCertified: boolean;
  tabcExpiry?: string;
  foodHandlerCertified: boolean;
  foodHandlerExpiry?: string;
  hoursThisWeek: number;
  salesThisWeek: number;
  avatar?: string;
  schedule: ShiftSlot[];
}

export interface ShiftSlot {
  day: string;
  startTime: string;
  endTime: string;
  role: string;
}

export interface WholesaleAccount {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  type: 'bar' | 'restaurant' | 'bottle-shop' | 'grocery' | 'event-venue';
  status: 'active' | 'inactive' | 'prospect';
  totalOrders: number;
  totalRevenue: number;
  lastOrder?: string;
  kegsOut: number;
  creditLimit: number;
  paymentTerms: string;
  notes: string;
  tapsCarrying: string[];
}

export interface MugClubMember {
  id: string;
  customerId: string;
  customerName: string;
  tier: 'Standard' | 'Premium' | 'Founding';
  memberSince: string;
  renewalDate: string;
  mugNumber: number;
  mugLocation: string;
  totalSaved: number;
  visitsAsMemeber: number;
  referrals: number;
  status: 'active' | 'expiring-soon' | 'expired' | 'cancelled';
  benefits: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  segment: string;
  sentDate?: string;
  scheduledDate?: string;
  recipients: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  type: 'new-release' | 'event' | 'promotion' | 'newsletter' | 'mug-club' | 'birthday';
}

export interface DailySales {
  date: string;
  beerRevenue: number;
  foodRevenue: number;
  naRevenue: number;
  merchandiseRevenue: number;
  eventRevenue: number;
  totalRevenue: number;
  customerCount: number;
  avgTicket: number;
}

export interface ComplianceItem {
  id: string;
  type: 'tabc' | 'ttb' | 'health' | 'music-license' | 'business';
  name: string;
  status: 'compliant' | 'due-soon' | 'overdue' | 'pending';
  dueDate: string;
  lastCompleted?: string;
  notes: string;
}

export interface GrainAddition {
  name: string;
  type: 'base' | 'specialty' | 'adjunct';
  amount: number;
  unit: string;
  percentage: number;
  color: number;
  ppg: number;
  costPerLb: number;
}

export interface HopScheduleEntry {
  name: string;
  amount: number;
  unit: string;
  alphaAcid: number;
  time: number;
  type: 'bittering' | 'flavor' | 'aroma' | 'dry-hop';
  ibuContribution: number;
  costPerOz: number;
}

export interface YeastProfile {
  name: string;
  lab: string;
  strain: string;
  attenuationMin: number;
  attenuationMax: number;
  flocculation: 'low' | 'medium' | 'medium-high' | 'high';
  tempMin: number;
  tempMax: number;
  pitchRate: number;
  starterNeeded: boolean;
  costPerPack: number;
  packsNeeded: number;
}

export interface WaterProfile {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
}

export interface WaterAdjustment {
  mineral: string;
  amount: number;
  unit: string;
  purpose: string;
}

export interface BrewDayStep {
  id: string;
  order: number;
  name: string;
  description: string;
  targetValue?: string;
  unit?: string;
  notes: string;
  completed: boolean;
  timestamp?: string;
}

export interface BrewHistory {
  batchNumber: string;
  date: string;
  actualOG: number;
  actualFG: number;
  qcScore: number;
  status: string;
}

export interface DetailedRecipe {
  id: string;
  beerId: string;
  name: string;
  style: string;
  category: 'flagship' | 'seasonal' | 'limited' | 'experimental';
  version: number;
  batchSize: number;
  targetOG: number;
  targetFG: number;
  targetABV: number;
  targetIBU: number;
  targetSRM: number;
  boilTime: number;
  mashTemp: number;
  mashTime: number;
  grainBill: GrainAddition[];
  hopSchedule: HopScheduleEntry[];
  yeast: YeastProfile;
  waterProfile: WaterProfile;
  waterAdjustments: WaterAdjustment[];
  brewDaySteps: BrewDayStep[];
  totalCost: number;
  costPerBarrel: number;
  costPerPint: number;
  lastBrewed: string;
  totalBatches: number;
  brewHistory: BrewHistory[];
  notes: string;
  createdDate: string;
}

export interface Keg {
  id: string;
  kegNumber: string;
  size: '1/2' | '1/4' | '1/6' | 'slim-1/4';
  gallons: number;
  status: 'clean-empty' | 'filled' | 'on-tap' | 'deployed' | 'returned-dirty' | 'cleaning' | 'maintenance' | 'missing' | 'retired';
  currentBeerId?: string;
  currentBeerName?: string;
  batchId?: string;
  location: 'brewery-cold-room' | 'brewery-taproom' | 'deployed' | 'returned' | 'maintenance-bay';
  deployedTo?: string;
  deployedToName?: string;
  deployedDate?: string;
  expectedReturnDate?: string;
  fillDate?: string;
  fillCount: number;
  lastCleaned?: string;
  deposit: number;
  depositStatus: 'not-applicable' | 'held' | 'returned' | 'forfeited';
  purchaseDate: string;
  purchaseCost: number;
  notes: string;
  history: KegEvent[];
}

export interface KegEvent {
  id: string;
  date: string;
  type: 'filled' | 'tapped' | 'deployed' | 'returned' | 'cleaned' | 'maintenance' | 'retired' | 'marked-missing';
  description: string;
  accountName?: string;
  beerName?: string;
  performedBy?: string;
}

export interface MonthlyFinancial {
  month: string;
  monthLabel: string;
  beerRevenue: number;
  foodRevenue: number;
  naRevenue: number;
  merchandiseRevenue: number;
  eventRevenue: number;
  wholesaleRevenue: number;
  totalRevenue: number;
  cogs: number;
  laborCost: number;
  rent: number;
  utilities: number;
  marketing: number;
  insurance: number;
  licenses: number;
  supplies: number;
  misc: number;
  totalExpenses: number;
  netProfit: number;
  netMarginPct: number;
}

export type PageId = 'dashboard' | 'customers' | 'mug-club' | 'taps' | 'brewing' | 'recipes' | 'kegs' | 'financials' | 'events' | 'reservations' | 'menu' | 'inventory' | 'staff' | 'distribution' | 'marketing' | 'reports' | 'settings';
