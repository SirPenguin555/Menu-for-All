# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-08-03-foundation-core-recipe-discovery/spec.md

> Created: 2025-08-03
> Version: 1.0.0

## Test Coverage Strategy

The testing approach follows the testing pyramid with emphasis on unit tests, supported by integration tests, and critical path end-to-end tests. All new functionality requires comprehensive test coverage before deployment.

## Unit Tests

### Authentication Services

**AuthService**
- `signUp()` - successful registration with valid credentials
- `signUp()` - validation error with invalid email format
- `signUp()` - conflict error when email already exists
- `signIn()` - successful authentication with valid credentials
- `signIn()` - authentication failure with invalid credentials
- `signOut()` - successful session termination
- `getCurrentUser()` - returns user data when authenticated
- `getCurrentUser()` - returns null when not authenticated

**UserProfileService**
- `getProfile()` - fetches user profile data successfully
- `updateProfile()` - updates profile with valid data
- `updateProfile()` - validates required fields and constraints
- `createProfile()` - creates profile on user registration
- `createProfile()` - handles duplicate creation gracefully

### Recipe Services

**RecipeService**
- `getRecipes()` - fetches paginated recipe list with default parameters
- `getRecipes()` - applies search filter correctly
- `getRecipes()` - applies recipe type filter correctly
- `getRecipes()` - applies time filter correctly
- `getRecipes()` - handles pagination boundary conditions
- `getRecipeById()` - fetches recipe details successfully
- `getRecipeById()` - returns null for non-existent recipe
- `saveRecipe()` - saves recipe to user collection
- `saveRecipe()` - prevents duplicate saves
- `unsaveRecipe()` - removes recipe from user collection
- `getSavedRecipes()` - fetches user's saved recipes with pagination

**ScrapingService**
- `scrapeRecipe()` - extracts recipe data from HTML successfully
- `scrapeRecipe()` - handles missing elements gracefully
- `scrapeRecipe()` - normalizes ingredient formats
- `scrapeRecipe()` - parses cooking times correctly
- `processScrapingQueue()` - processes queued URLs with rate limiting
- `validateRecipeData()` - validates scraped data completeness
- `sanitizeHtml()` - removes unwanted HTML tags and attributes

### Utility Functions

**DatabaseHelpers**
- `buildRecipeQuery()` - constructs correct SQL for filtering
- `buildRecipeQuery()` - handles empty filter parameters
- `buildPaginationQuery()` - adds correct LIMIT and OFFSET clauses
- `sanitizeSearchTerm()` - prevents SQL injection in search terms

**ValidationSchemas**
- `recipeSchema` - validates complete recipe object structure
- `userRegistrationSchema` - validates registration form data
- `recipeFilterSchema` - validates recipe filter parameters
- `paginationSchema` - validates pagination parameters

## Integration Tests

### Authentication Flow

**Registration Flow**
- User completes registration form with valid data
- Account created in database with proper profile entry
- Welcome email sent (mocked)
- User automatically signed in after registration
- Profile data accessible immediately

**Login Flow**
- User enters valid credentials on login form
- Authentication successful with proper session creation
- User redirected to intended page or homepage
- User data available in React context and API calls
- Session persists across browser refresh

**Logout Flow** 
- User clicks logout button from authenticated state
- Session terminated on server and client
- User redirected to homepage
- Protected routes become inaccessible
- User data cleared from client state

### Recipe Discovery Flow

**Recipe Listing**
- Homepage displays paginated list of recipes
- Recipe cards show title, image, time, and source
- Pagination controls work correctly
- Recipe type filters update results without page reload
- Search functionality filters recipes by title
- Loading states display during data fetching

**Recipe Detail View**
- Clicking recipe card navigates to detail page
- Recipe detail page shows complete information
- Ingredients and instructions render properly
- Source attribution links work correctly
- Save/unsave functionality works for authenticated users
- Anonymous users see sign-up prompt for saving

**Recipe Saving**
- Authenticated user can save recipes to collection
- Saved recipes appear in user's saved list
- User can add notes to saved recipes
- User can remove recipes from saved collection
- Save status persists across sessions

### Database Operations

**Recipe CRUD Operations**
- Recipe creation through scraping service
- Recipe retrieval with proper joins and filtering
- Bulk recipe operations for scraping workflows
- Recipe updates maintain data integrity
- Recipe deletion (soft delete) preserves user references

**User Data Management**
- Profile creation on user registration
- Profile updates through settings page
- Saved recipe associations maintained properly
- User deletion removes associated data appropriately
- Row Level Security policies enforced correctly

## Feature Tests (End-to-End)

### New User Journey

**Complete Registration and First Recipe Save**
- Navigate to homepage as anonymous user
- View recipe listings and click on interesting recipe
- See sign-up prompt when trying to save recipe
- Complete registration process with valid information
- Return to recipe and successfully save it
- Navigate to saved recipes and see saved item

### Recipe Discovery Workflow

**Find Recipe Using Filters**
- Visit homepage and see initial recipe listings
- Apply recipe type filter (e.g., "dinner")
- Further filter by maximum cooking time (e.g., 30 minutes)
- Browse filtered results and click on specific recipe
- View complete recipe details including ingredients and instructions
- Note source attribution and external link functionality

**Search and Save Multiple Recipes**
- Use search functionality to find recipes with specific term
- Browse search results and open multiple recipes in new tabs
- Compare recipes and save preferred ones to collection
- Access saved recipes list and verify all saved items appear
- Add notes to saved recipes for future reference

### Mobile Responsiveness Testing

**Mobile Recipe Browsing**
- Access application on mobile device or mobile viewport
- Verify recipe cards display properly on small screens
- Test touch navigation and scrolling
- Verify filter controls work with touch input
- Confirm recipe detail pages are readable and functional

## Mocking Requirements

### External Services

**Supabase Authentication**
- Mock authentication responses for signup/signin flows
- Simulate authentication errors (invalid credentials, network failures)
- Mock session management for protected route testing
- Test authentication state changes and context updates

**Recipe Source Websites**
- Mock HTML responses from recipe websites for scraping tests
- Create sample HTML fixtures for each supported source
- Mock network failures and timeout scenarios
- Test rate limiting and retry logic with mocked delays

**Email Service (Resend)**
- Mock email sending for registration confirmation
- Verify correct email templates and recipient information
- Test email sending failures and retry mechanisms
- Mock email delivery status callbacks

### Database Operations

**Supabase Database**
- Use Supabase local development setup for integration tests
- Mock database connection failures for error handling tests
- Create test data fixtures for consistent test scenarios
- Implement database cleanup between test runs

### Time-Based Testing

**Date and Time Functions**
- Mock current time for consistent test results
- Test recipe freshness calculations with fixed dates
- Mock scraping timestamps for pagination testing
- Test recipe sorting by creation date with controlled data

## Performance Testing

### Load Testing Scenarios

**Recipe Listing Performance**
- Test pagination with large datasets (10,000+ recipes)
- Measure response times for filtered queries
- Test database query performance with proper indexing
- Verify memory usage during bulk operations

**Concurrent User Testing**
- Simulate multiple users browsing recipes simultaneously
- Test authentication system under concurrent load
- Verify database connection pooling effectiveness
- Test cache performance with multiple concurrent requests

### Memory and Resource Testing

**Memory Leak Detection**
- Monitor memory usage during long-running scraping operations
- Test React component cleanup and unmounting
- Verify database connection cleanup
- Monitor memory usage during image processing

## Accessibility Testing

### Screen Reader Compatibility

**Recipe Listing Accessibility**
- Verify proper heading hierarchy on recipe listing pages
- Test screen reader navigation through recipe cards
- Ensure filter controls have proper ARIA labels
- Test keyboard navigation through pagination controls

**Recipe Detail Accessibility**
- Verify ingredient lists are properly structured for screen readers
- Test instruction step navigation with keyboard only
- Ensure recipe images have appropriate alt text
- Test save/unsave functionality with assistive technologies

### Keyboard Navigation

**Complete Keyboard Workflow**
- Navigate entire application using only keyboard
- Verify focus indicators are visible and logical
- Test form submission and validation with keyboard only
- Ensure modal dialogs trap focus appropriately

## Test Data Management

### Fixtures and Seed Data

**Recipe Test Data**
- Comprehensive recipe fixtures covering all data scenarios
- Sample recipes from each supported source website
- Edge cases: missing images, unusual ingredients, long instructions
- Various recipe types, cooking times, and difficulty levels

**User Test Data**
- Sample user profiles with different permission levels
- User accounts with various saved recipe collections
- Test scenarios for new users and established users
- Edge cases: users with no saved recipes, users with many saved recipes

### Test Environment Setup

**Database Seeding**
- Consistent test data setup for all test suites
- Isolated test databases for parallel test execution
- Automated cleanup and reset between test runs
- Performance test data generation for load testing

**Authentication State Management**
- Helper functions for creating authenticated test sessions
- Mock user contexts for component testing
- Session state setup and teardown utilities
- Permission level testing utilities (admin, regular user, anonymous)