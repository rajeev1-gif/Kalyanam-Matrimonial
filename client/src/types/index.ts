// Enums matching the system specification
export type Role = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type CreatedFor = 'MYSELF' | 'SON' | 'DAUGHTER' | 'BROTHER' | 'SISTER' | 'RELATIVE' | 'FRIEND';
export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';
export type Religion = 'HINDU' | 'MUSLIM' | 'SIKH' | 'CHRISTIAN' | 'JAIN' | 'BUDDHIST' | 'PARSI' | 'JEWISH' | 'OTHER';
export type ManglikStatus = 'YES' | 'NO' | 'DONT_KNOW' | 'ANGSHIK';
export type OccupationType = 'PRIVATE_SECTOR' | 'GOVERNMENT' | 'BUSINESS' | 'DEFENCE' | 'SELF_EMPLOYED' | 'NOT_WORKING';
export type ResidentialStatus = 'CITIZEN' | 'PERMANENT_RESIDENT' | 'WORK_PERMIT' | 'STUDENT_VISA';
export type FamilyType = 'NUCLEAR' | 'JOINT';
export type FamilyValues = 'TRADITIONAL' | 'MODERATE' | 'LIBERAL';
export type FamilyStatus = 'MIDDLE_CLASS' | 'UPPER_MIDDLE_CLASS' | 'AFFLUENT' | 'HIGH_NET_WORTH';
export type DietType = 'VEGETARIAN' | 'NON_VEGETARIAN' | 'EGGETARIAN' | 'JAIN' | 'VEGAN';
export type HabitStatus = 'NO' | 'OCCASIONALLY' | 'YES';
export type PhotoStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type PlanCode = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: any[];
}

// User & Authentication Models
export interface User {
  id: string;
  email: string;
  mobile: string;
  role: Role;
  status: UserStatus;
  profileCreatedFor: CreatedFor;
  emailVerified: boolean;
  mobileVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
  subscriptions?: Subscription[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  identifier?: string;
  email?: string;
  mobile?: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  gender: Gender | string;
  profileCreatedFor?: CreatedFor | string;
  dateOfBirth?: string;
  religion?: Religion | string;
  motherTongue?: string;
}

// Profile Sub-Models
export interface ProfilePhoto {
  id: string;
  profileId: string;
  url: string;
  isProfilePicture: boolean;
  orderIndex: number;
  status: PhotoStatus;
  createdAt: string;
}

export interface ReligionCommunity {
  id?: string;
  profileId?: string;
  religion: Religion | string;
  community: string;
  caste?: string | null;
  subCaste?: string | null;
  motherTongue: string;
  gothra?: string | null;
  manglik?: ManglikStatus | string;
}

export interface EducationCareer {
  id?: string;
  profileId?: string;
  highestEducation: string;
  educationField?: string | null;
  collegeName?: string | null;
  occupationType?: OccupationType | string;
  occupationTitle: string;
  companyName?: string | null;
  annualIncome: string;
  currency?: string;
}

export interface Location {
  id?: string;
  profileId?: string;
  country: string;
  state: string;
  city: string;
  citizenship?: string;
  residentialStatus?: ResidentialStatus | string;
}

export interface FamilyDetails {
  id?: string;
  profileId?: string;
  familyType: FamilyType | string;
  familyValues?: FamilyValues | string;
  familyStatus: FamilyStatus | string;
  fatherOccupation?: string | null;
  motherOccupation?: string | null;
  brothersCount?: number;
  brothersMarried?: number;
  sistersCount?: number;
  sistersMarried?: number;
  aboutFamily?: string | null;
}

export interface LifestyleDetails {
  id?: string;
  profileId?: string;
  diet: DietType | string;
  smoking?: HabitStatus | string;
  drinking?: HabitStatus | string;
  hobbies?: string | null;
  interests?: string | null;
}

export interface PartnerPreference {
  id?: string;
  profileId?: string;
  minAge: number;
  maxAge: number;
  minHeight: number;
  maxHeight: number;
  maritalStatus?: string | null;
  religions?: string | null;
  communities?: string | null;
  motherTongues?: string | null;
  minIncome?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  diet?: string | null;
}

// Profile Model
export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  height: number;
  maritalStatus: MaritalStatus;
  aboutMe?: string | null;
  profileSummary?: string | null;
  isCompleted: boolean;
  completionPercentage: number;
  isVisible: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  photos?: ProfilePhoto[];
  religionCommunity?: ReligionCommunity | null;
  educationCareer?: EducationCareer | null;
  location?: Location | null;
  familyDetails?: FamilyDetails | null;
  lifestyleDetails?: LifestyleDetails | null;
  partnerPreference?: PartnerPreference | null;
  shortlisted?: boolean;
  interestStatus?: InterestStatus | null;
}

// Membership & Subscriptions
export interface MembershipPlan {
  id: string;
  name: string;
  planCode: PlanCode;
  price: number;
  durationMonths: number;
  interestLimit: number;
  profileViewLimit: number;
  contactViewLimit: number;
  chatEnabled: boolean;
  badge: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: MembershipPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  interestsRemaining: number;
  viewsRemaining: number;
  contactsRemaining: number;
}

// Search and Interactions
export interface SearchFilters {
  gender?: string;
  ageMin?: number | string;
  ageMax?: number | string;
  heightMin?: number | string;
  heightMax?: number | string;
  religion?: string;
  community?: string;
  maritalStatus?: string;
  education?: string;
  profession?: string;
  income?: string;
  country?: string;
  state?: string;
  city?: string;
  motherTongue?: string;
  diet?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Interest {
  id: string;
  senderId: string;
  receiverId: string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
}

export interface Shortlist {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
  profile?: Profile;
}

export interface ProfileView {
  id: string;
  viewerId: string;
  viewedUserId: string;
  viewedAt: string;
  viewer?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt: string;
  user1?: User;
  user2?: User;
  messages?: Message[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

