# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-03-foundation-core-recipe-discovery/spec.md

> Created: 2025-08-03
> Version: 1.0.0

## API Design Philosophy

The API follows RESTful principles with Next.js App Router API routes, providing server-side data fetching for optimal SEO and performance. All endpoints use TypeScript for type safety and Zod for runtime validation.

## Authentication Endpoints

### POST /api/auth/signup

**Purpose:** Register a new user account
**Authentication:** None (public endpoint)
**Parameters:**
- Body: `{ email: string, password: string, displayName?: string }`
**Response:** 
```typescript
{
  user: {
    id: string;
    email: string;
    displayName: string;
  } | null;
  error: string | null;
}
```
**Errors:** 400 (validation error), 409 (email exists), 500 (server error)

### POST /api/auth/signin

**Purpose:** Authenticate existing user
**Authentication:** None (public endpoint)
**Parameters:**
- Body: `{ email: string, password: string }`
**Response:**
```typescript
{
  user: {
    id: string;
    email: string;
    displayName: string;
  } | null;
  error: string | null;
}
```
**Errors:** 400 (validation error), 401 (invalid credentials), 500 (server error)

### POST /api/auth/signout

**Purpose:** Sign out current user and invalidate session
**Authentication:** Required (authenticated user)
**Parameters:** None
**Response:** `{ success: boolean }`
**Errors:** 500 (server error)

## Recipe Endpoints

### GET /api/recipes

**Purpose:** Fetch paginated list of recipes with optional filtering
**Authentication:** None (public endpoint)
**Parameters:**
- Query: `page?: number` (default: 1)
- Query: `limit?: number` (default: 20, max: 50)
- Query: `search?: string` (search in title and description)
- Query: `type?: string` (breakfast, lunch, dinner, snack, dessert)
- Query: `maxTime?: number` (max total cooking time in minutes)
**Response:**
```typescript
{
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```
**Errors:** 400 (invalid parameters), 500 (server error)

### GET /api/recipes/[id]

**Purpose:** Fetch detailed information for a specific recipe
**Authentication:** None (public endpoint)
**Parameters:**
- Path: `id: string` (recipe UUID)
**Response:**
```typescript
{
  recipe: Recipe & {
    source: RecipeSource;
    isSaved?: boolean; // only if user is authenticated
  };
}
```
**Errors:** 404 (recipe not found), 500 (server error)

### GET /api/recipes/saved

**Purpose:** Fetch user's saved recipes
**Authentication:** Required (authenticated user)
**Parameters:**
- Query: `page?: number` (default: 1)
- Query: `limit?: number` (default: 20, max: 50)
**Response:**
```typescript
{
  recipes: (Recipe & { savedAt: string; notes?: string })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```
**Errors:** 401 (unauthorized), 500 (server error)

### POST /api/recipes/[id]/save

**Purpose:** Save a recipe to user's collection
**Authentication:** Required (authenticated user)
**Parameters:**
- Path: `id: string` (recipe UUID)
- Body: `{ notes?: string }`
**Response:**
```typescript
{
  success: boolean;
  savedRecipe: {
    id: string;
    savedAt: string;
    notes?: string;
  };
}
```
**Errors:** 400 (validation error), 401 (unauthorized), 404 (recipe not found), 409 (already saved), 500 (server error)

### DELETE /api/recipes/[id]/save

**Purpose:** Remove a recipe from user's saved collection
**Authentication:** Required (authenticated user)
**Parameters:**
- Path: `id: string` (recipe UUID)
**Response:** `{ success: boolean }`
**Errors:** 401 (unauthorized), 404 (not saved), 500 (server error)

## User Profile Endpoints

### GET /api/user/profile

**Purpose:** Fetch current user's profile information
**Authentication:** Required (authenticated user)
**Parameters:** None
**Response:**
```typescript
{
  profile: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
}
```
**Errors:** 401 (unauthorized), 500 (server error)

### PUT /api/user/profile

**Purpose:** Update current user's profile information
**Authentication:** Required (authenticated user)
**Parameters:**
- Body: `{ displayName?: string, avatarUrl?: string }`
**Response:**
```typescript
{
  profile: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    updatedAt: string;
  };
}
```
**Errors:** 400 (validation error), 401 (unauthorized), 500 (server error)

## Administrative Endpoints

### POST /api/admin/scrape

**Purpose:** Trigger recipe scraping for specified sources
**Authentication:** Required (admin user or API key)
**Parameters:**
- Body: `{ sourceIds?: string[], forceRefresh?: boolean }`
**Response:**
```typescript
{
  success: boolean;
  jobId: string;
  message: string;
}
```
**Errors:** 401 (unauthorized), 403 (forbidden), 500 (server error)

### GET /api/admin/scrape/status/[jobId]

**Purpose:** Check status of scraping job
**Authentication:** Required (admin user or API key)
**Parameters:**
- Path: `jobId: string`
**Response:**
```typescript
{
  job: {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number; // 0-100
    startedAt: string;
    completedAt?: string;
    error?: string;
    results: {
      totalProcessed: number;
      successful: number;
      failed: number;
    };
  };
}
```
**Errors:** 401 (unauthorized), 403 (forbidden), 404 (job not found), 500 (server error)

## Data Types

### Recipe Type

```typescript
interface Recipe {
  id: string;
  sourceId: string;
  sourceRecipeId?: string;
  sourceUrl: string;
  title: string;
  description?: string;
  imageUrl?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  ingredients: string[];
  instructions: string[];
  recipeType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'appetizer';
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  cuisineType?: string;
  authorName?: string;
  sourceAttribution: string;
  sourcePublishedAt?: string;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

### RecipeSource Type

```typescript
interface RecipeSource {
  id: string;
  name: string;
  baseUrl: string;
  scrapingConfig: Record<string, any>;
  isActive: boolean;
  lastScrapedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling Strategy

### Standard Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Error Codes

- `VALIDATION_ERROR`: Invalid input parameters
- `AUTHENTICATION_REQUIRED`: Endpoint requires authentication
- `AUTHORIZATION_FAILED`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RESOURCE_CONFLICT`: Resource already exists or conflict state
- `RATE_LIMIT_EXCEEDED`: Too many requests from client
- `SERVER_ERROR`: Internal server error

## Rate Limiting

### Public Endpoints
- **Recipes API**: 100 requests per minute per IP
- **Authentication**: 10 requests per minute per IP

### Authenticated Endpoints
- **User Actions**: 300 requests per minute per user
- **Admin Actions**: 1000 requests per minute per admin

### Implementation
- Redis-based rate limiting with sliding window
- Rate limit headers included in all responses
- Graceful degradation when limits exceeded

## Caching Strategy

### Recipe Listing
- **Cache Duration**: 5 minutes for listing pages
- **Cache Key**: Include query parameters for filtering
- **Invalidation**: On new recipe addition or updates

### Recipe Details
- **Cache Duration**: 30 minutes for individual recipes
- **Cache Key**: Recipe ID and user authentication status
- **Invalidation**: On recipe updates or user save/unsave actions

### User Data
- **No Caching**: User-specific data is never cached
- **Session Storage**: Short-term session data cached client-side

## API Documentation

### OpenAPI Specification
- Generate OpenAPI 3.0 spec from TypeScript types
- Serve documentation at `/api/docs`
- Include interactive API explorer

### Integration Examples
```typescript
// Example: Fetching recipes with filters
const response = await fetch('/api/recipes?type=dinner&maxTime=30&page=1');
const { recipes, pagination } = await response.json();

// Example: Saving a recipe
const response = await fetch(`/api/recipes/${recipeId}/save`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notes: 'Great for weeknight dinners!' })
});
```