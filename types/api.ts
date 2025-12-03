// API Response Types - matching Python API schemas

// Health & Metrics
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface MetricsResponse {
  total_scrapes: number;
  active_connections: number;
  uptime_seconds: number;
  memory_usage_mb: number | null;
}

// Scraper Types
export interface Link {
  url: string | null;
  button_text: string | null;
}

export interface UserData {
  username: string;
  url: string;
  avatar_image?: string;
  id?: number;
  tier?: string;
  isActive?: boolean;
  description?: string;
  number_of_links?: number;
  main_colors?: string[];
  links?: Link[];
  createdAt?: number;
  updatedAt?: number;
}

export interface ScrapeUserResponse {
  success: boolean;
  message: string;
  data: UserData | null;
  timestamp: string;
}

export interface ProcessCompleteResponse {
  success: boolean;
  message: string;
  data: UserData | null;
  firebase_url: string | null;
  final_url: string | null;
  username: string | null;
  processing_time_seconds: number | null;
  timestamp: string;
}

// Instagram Types
export interface IgProfileInfo {
  name: string;
  username: string;
  bio: string | null;
  external_url: string | null;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_private?: boolean;
  is_verified?: boolean;
}

export interface IgPostInfo {
  shortcode: string;
  url: string;
  caption: string | null;
  likes: number;
  comments: number;
  date: string;
  is_video: boolean;
  media_url: string;
}

export interface IgPostsResponse {
  username: string;
  posts_count: number;
  posts: IgPostInfo[];
}

// Request Types
export interface ScrapeUserRequest {
  user: string;
  info?: string;
  template_name?: TemplateName;
}

export interface Credentials {
  username: string;
  password: string;
}

// Template names available
export type TemplateName = 'general' | 'tattoo' | 'barber' | 'gym' | 'transform';

// API Error
export interface ApiError {
  detail: string;
  status?: number;
}

// Serper.dev Types
export type SerperSearchMode = 'places' | 'search';

export interface SerperSearchParams {
  q: string;
  location?: string;
  gl?: string; // country code (e.g., 'de', 'us', 'br')
  hl?: string; // language code (e.g., 'de', 'en', 'pt')
  num?: number;
}

export interface SerperSearchParameters {
  q: string;
  gl?: string;
  hl?: string;
  type: string;
  num?: number;
  page?: number;
  location?: string;
  engine: string;
}

// Places mode response
export interface SerperPlace {
  position: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  ratingCount?: number;
  category?: string;
  phoneNumber?: string;
  website?: string;
  cid: string;
}

export interface SerperPlacesResponse {
  searchParameters: SerperSearchParameters;
  places: SerperPlace[];
  credits: number;
}

// Search mode response
export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerperSearchResponse {
  searchParameters: SerperSearchParameters;
  organic: SerperOrganicResult[];
  credits: number;
}

// GPlaces Types
export interface GPlacesSearchCandidate {
  place_id: string;
  name: string;
  formatted_address: string;
  icon: string;
  types: string[];
  image?: string;
}

export interface GPlacesSearchResponse {
  status: string;
  query: string;
  candidates: GPlacesSearchCandidate[];
}

export interface GPlacesPhoto {
  reference: string;
  width: number;
  height: number;
  attributions: string[];
  url?: string;
}

export interface GPlacesReview {
  author: string;
  rating: number;
  text: string;
  time: number;
}

export interface GPlacesOpeningHours {
  open_now?: boolean;
  weekday_text?: string[];
}

export interface GPlacesDetails {
  id: string;
  name: string;
  address: string;
  rating?: number;
  phone?: string;
  website?: string;
  openingHours?: GPlacesOpeningHours;
  types?: string[];
  vicinity?: string;
  photos?: GPlacesPhoto[];
  reviews?: GPlacesReview[];
}

// Storage Types (S3)
export interface UploadOptions {
  folder?: string;
  filename?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface StorageFileInfo {
  name: string;
  path: string;
  url: string;
  size?: number;
  lastModified?: string;
}
