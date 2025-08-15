# NestJS Note-Taking API with Google OAuth Authentication

A RESTful API for a simple note-taking application built with NestJS, MongoDB, and Google OAuth authentication.

## Technologies Used

- **Node.js**: v20.8.1 (LTS)
- **NestJS**: v11.0.1
- **TypeScript**: v5.7.3
- **MongoDB**: v6.0.6 (via Prisma ORM)
- **Prisma**: v6.13.0
- **JWT**: For authentication token management
- **Google OAuth 2.0**: For user authentication

## Features

- Google OAuth user authentication
- CRUD operations for notes
- Categories for organizing notes
- Tags for labeling notes
- User roles (Admin and regular Users)
- Pagination for notes listing
- Input validation and error handling
- Unit and E2E testing with Jest and Supertest

## Project Structure

```
src/
├── api/                 # API modules
│   ├── authentication/  # Authentication related files
│   ├── categories/      # Categories module
│   ├── notes/           # Notes module
│   ├── tags/            # Tags module
│   └── users/           # Users module
├── db/                  # Database related files
│   └── prisma/          # Prisma service
├── guards/              # Authorization guards
├── interfaces/          # TypeScript interfaces
└── utils/               # Utility functions
```

## Prerequisites

- Node.js (v20.8.1 or later)
- MongoDB (v6.0.6 or later)
- Google Developer Account (for OAuth credentials)

## Setting Up Google OAuth

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Set the authorized redirect URI to `http://localhost:3900/api/auth/google/callback` (adjust port if needed)
7. Copy the Client ID and Client Secret for use in the environment variables

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="mongodb://username:password@localhost:27017/note-taking-app"

# JWT
JWT_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3900/api/auth/google/callback"

# App
PORT=3900
```

## Installation

```bash
# Clone the repository
git clone https://github.com/deviate-dv8/Zeniark-nodejs-skills-test.git
cd Zeniark-nodejs-skills-test

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start the application
npm run start:dev
```

## API Documentation

### Authentication Endpoints

#### Google OAuth Authentication

```
GET /api/auth/google
```

- Initiates the Google OAuth flow
- No body required
- Redirects to Google's authentication page

```
GET /api/auth/google/callback
```

- Callback URL for Google OAuth
- Handled automatically
- Returns JWT token and user information

```
GET /api/auth/me
```

- Returns the currently authenticated user's information
- Requires valid JWT token in Authorization header

### Notes Endpoints

#### Create a Note

```
POST /api/notes
```

- Creates a new note
- Requires authentication
- Request body:

```json
{
  "title": "Note Title",
  "content": "Note Content",
  "categoryId": "optional-category-id",
  "tagIds": ["optional-tag-id-1", "optional-tag-id-2"]
}
```

#### Get All Notes (Paginated)

```
GET /api/notes?page=1&limit=10
```

- Retrieves all notes for the authenticated user
- Supports pagination with query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- Returns:

```json
{
  "items": [
    {
      "id": "note-id",
      "title": "Note Title",
      "content": "Note Content",
      "categoryId": "category-id",
      "tagIds": ["tag-id-1", "tag-id-2"],
      "userId": "user-id",
      "createdAt": "2025-08-15T12:00:00Z",
      "updatedAt": "2025-08-15T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

#### Get a Specific Note

```
GET /api/notes/:id
```

- Retrieves a specific note by ID
- Requires authentication
- Only the owner or an admin can access the note

#### Update a Note

```
PATCH /api/notes/:id
```

- Updates a specific note by ID
- Requires authentication
- Only the owner can update the note
- Request body (all fields are optional):

```json
{
  "title": "Updated Title",
  "content": "Updated Content",
  "categoryId": "updated-category-id",
  "tagIds": ["updated-tag-id-1", "updated-tag-id-2"]
}
```

#### Delete a Note

```
DELETE /api/notes/:id
```

- Deletes a specific note by ID
- Requires authentication
- Only the owner can delete the note

### Categories Endpoints

#### Create a Category

```
POST /api/categories
```

- Creates a new category
- Requires authentication
- Request body:

```json
{
  "name": "Category Name"
}
```

#### Get All Categories

```
GET /api/categories/all
```

- Retrieves all categories for the authenticated user
- Requires authentication

#### Get a Specific Category

```
GET /api/categories/:id
```

- Retrieves a specific category by ID
- Requires authentication
- Only the owner or an admin can access the category

#### Update a Category

```
PATCH /api/categories/:id
```

- Updates a specific category by ID
- Requires authentication
- Only the owner can update the category
- Request body:

```json
{
  "name": "Updated Category Name"
}
```

#### Delete a Category

```
DELETE /api/categories/:id
```

- Deletes a specific category by ID
- Requires authentication
- Only the owner can delete the category

### Tags Endpoints

#### Create a Tag

```
POST /api/tags
```

- Creates a new tag
- Requires authentication
- Request body:

```json
{
  "name": "Tag Name"
}
```

#### Get All Tags

```
GET /api/tags
```

- Retrieves all tags for the authenticated user
- Requires authentication

#### Get All Tags (Admin only)

```
GET /api/tags/all
```

- Retrieves all tags across all users
- Requires authentication
- Admin role required

#### Get a Specific Tag

```
GET /api/tags/:id
```

- Retrieves a specific tag by ID
- Requires authentication
- Only the owner or an admin can access the tag

#### Update a Tag

```
PATCH /api/tags/:id
```

- Updates a specific tag by ID
- Requires authentication
- Only the owner can update the tag
- Request body:

```json
{
  "name": "Updated Tag Name"
}
```

#### Delete a Tag

```
DELETE /api/tags/:id
```

- Deletes a specific tag by ID
- Requires authentication
- Only the owner can delete the tag

### Users Endpoints (Admin Only)

#### Get All Users

```
GET /api/users
```

- Retrieves all users
- Requires authentication
- Admin role required

#### Get a Specific User

```
GET /api/users/:id
```

- Retrieves a specific user by ID
- Requires authentication
- Admin role required

#### Update a User

```
PATCH /api/users/:id
```

- Updates a specific user by ID
- Requires authentication
- Admin role required
- Request body:

```json
{
  "name": "Updated User Name"
}
```

#### Delete a User

```
DELETE /api/users/:id
```

- Deletes a specific user by ID
- Requires authentication
- Admin role required

## Authentication Flow

1. User navigates to `/api/auth/google` to initiate Google OAuth flow
2. User authorizes the application on Google's consent screen
3. Google redirects back to `/api/auth/google/callback` with authorization code
4. The API exchanges the code for access tokens
5. The API creates or updates the user in the database
6. The API generates a JWT token and returns it to the client
7. The client includes this token in the `Authorization` header for subsequent requests

## Authorization

- JWT tokens are used for authorization
- All protected endpoints require a valid JWT token in the `Authorization` header:
  ```
  Authorization: Bearer <jwt-token>
  ```
- Role-based access control is implemented:
  - Regular users can only access their own data
  - Admin users can access all data

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Testing

### Unit Tests

Run unit tests with:

```bash
npm test
```

### E2E Tests

Run end-to-end tests with:

```bash
npm run test:e2e
```
