# OurChants API Specification

## Overview
The OurChants API provides a RESTful interface for managing song data in the OurChants application. This document outlines the API endpoints, request/response formats, error handling, and integration guidelines for frontend developers.

## Base URL
```
https://{api_id}.execute-api.{region}.amazonaws.com/prod
```

## Authentication
Currently, the API is publicly accessible. Future versions will implement authentication using AWS Cognito or API keys.

## Data Models

### Song Object
```json
{
  "song_id": "string",       // UUID, auto-generated
  "title": "string",         // Required
  "artist": "string",        // Required
  "album": "string",         // Optional
  "bpm": "string",          // Optional, stored as string for flexibility
  "composer": "string",      // Optional
  "version": "string",       // Optional
  "date": "string",         // Optional, format: "YYYY-MM-DD HH:MM:SS"
  "filename": "string",      // Optional
  "filepath": "string",      // Optional
  "description": "string",   // Optional
  "lineage": ["string"]     // Optional, defaults to empty array
}
```

## Endpoints

### 1. Create Song
- **Method**: POST
- **Path**: `/songs`
- **Request Body**: Song object (without song_id)
- **Response**: 201 Created
- **Response Body**: Complete song object with generated song_id
- **Example Request**:
```json
{
  "title": "Amazing Grace",
  "artist": "John Newton",
  "album": "Hymnal Volume 1",
  "bpm": "70",
  "composer": "John Newton",
  "version": "1.0",
  "date": "2024-04-17 08:46:12",
  "filename": "amazing_grace.mp3",
  "filepath": "Media/amazing_grace.mp3",
  "description": "Traditional hymn",
  "lineage": ["original"]
}
```

### 2. Get Song
- **Method**: GET
- **Path**: `/songs/{song_id}`
- **Response**: 200 OK
- **Response Body**: Complete song object
- **Error**: 404 Not Found if song_id doesn't exist

### 3. List Songs
- **Method**: GET
- **Path**: `/songs`
- **Response**: 200 OK
- **Response Body**: Array of song objects
- **Note**: Returns all songs in the database

### 4. Update Song
- **Method**: PUT
- **Path**: `/songs/{song_id}`
- **Request Body**: Song object (without song_id)
- **Response**: 200 OK
- **Response Body**: Updated song object
- **Error**: 404 Not Found if song_id doesn't exist
- **Note**: All fields in the request body will overwrite existing values

### 5. Delete Song
- **Method**: DELETE
- **Path**: `/songs/{song_id}`
- **Response**: 204 No Content
- **Error**: 404 Not Found if song_id doesn't exist

## Error Handling

### Error Response Format
```json
{
  "error": "string",    // Error message
  "code": "string",     // Error code
  "details": {}         // Additional error details (optional)
}
```

### Common Error Codes
- **400 Bad Request**: Invalid request body or parameters
- **404 Not Found**: Resource not found
- **409 Conflict**: Concurrent update conflict
- **500 Internal Server Error**: Server-side error

## Data Validation Rules

1. **Required Fields**:
   - `title`: Non-empty string
   - `artist`: Non-empty string

2. **Optional Fields**:
   - All other fields can be null or omitted
   - `lineage` defaults to empty array if not provided

3. **Date Format**:
   - Must be in format: "YYYY-MM-DD HH:MM:SS"
   - Example: "2024-04-17 08:46:12"

## Best Practices

1. **Concurrent Operations**:
   - Handle 409 Conflict responses for concurrent updates
   - Implement retry logic with exponential backoff
   - Always verify the final state after concurrent operations

2. **Error Handling**:
   - Always check response status codes
   - Display appropriate error messages to users
   - Implement proper error boundaries in your frontend

3. **Performance**:
   - Cache frequently accessed data
   - Implement optimistic updates
   - Handle loading states appropriately

4. **Data Consistency**:
   - Always use the returned song object from the API
   - Don't assume local state matches server state
   - Refresh data periodically if displaying lists

## Integration Examples

### JavaScript/TypeScript Example
```typescript
interface Song {
  song_id?: string;
  title: string;
  artist: string;
  album?: string;
  bpm?: string;
  composer?: string;
  version?: string;
  date?: string;
  filename?: string;
  filepath?: string;
  description?: string;
  lineage?: string[];
}

// Create a new song
async function createSong(song: Song): Promise<Song> {
  const response = await fetch(`${API_BASE_URL}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(song),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Update a song with retry logic
async function updateSong(songId: string, song: Song, maxRetries = 3): Promise<Song> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(song),
      });
      
      if (response.status === 409) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (retries === maxRetries - 1) throw error;
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

## Rate Limits and Quotas
- Default AWS API Gateway limits apply
- 10,000 requests per second per region
- Implement appropriate error handling for throttling (429 responses)

## Future Enhancements
1. Authentication and authorization
2. Pagination for list endpoint
3. Search and filter capabilities
4. File upload integration
5. Versioning support

## Support
For API support or to report issues, please contact the API team or create an issue in the repository.

## Changelog
- **2024-04-17**: Initial API specification
- Added full schema support for all song fields
- Implemented concurrent operation handling
- Added detailed error responses 