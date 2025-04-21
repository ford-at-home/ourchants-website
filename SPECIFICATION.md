# OurChants API Specification

## Overview
The OurChants API provides a RESTful interface for managing sacred chant data in the OurChants application. This document outlines the API endpoints, request/response formats, error handling, and integration guidelines.

## Base URL
```
https://api.ourchants.com
```

## Authentication
The API is publicly accessible for read operations. Write operations require authentication using AWS Cognito.

## CORS Configuration
The API is configured to accept requests from the OurChants domain:
```
Access-Control-Allow-Origin: https://ourchants.com
```

Allowed methods: GET, POST, PUT, DELETE
Allowed headers: Content-Type, Accept, Authorization
Max age: 3000 seconds

## Data Models

### Song Object
```typescript
interface Song {
  song_id: string;        // UUID
  title: string;          // Required
  artist: string;         // Required
  album?: string;         // Optional
  genre?: string;         // Optional
  composer?: string;      // Optional
  version?: string;       // Optional
  date?: string;         // Optional, ISO 8601 format
  description?: string;   // Optional
  lineage?: string[];    // Optional, cultural lineage
  s3_uri?: string;       // Optional, S3 URI of the audio file
  duration?: number;     // Optional, duration in seconds
  cultural_context?: string; // Optional, cultural significance
  language?: string;     // Optional, original language
  transcription?: string; // Optional, written transcription
}

### Pre-signed URL Request
```typescript
interface PresignedUrlRequest {
  key: string;      // Required, S3 object key
  operation: 'get' | 'put'; // Required, operation type
}
```

### Pre-signed URL Response
```typescript
interface PresignedUrlResponse {
  url: string;      // Pre-signed URL
  expiresIn: number // Expiration time in seconds
}
```

## Endpoints

### 1. List Songs
- **Method**: GET
- **Path**: `/songs`
- **Query Parameters**:
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)
  - `search`: string (optional)
  - `genre`: string (optional)
  - `culture`: string (optional)
- **Response**: 200 OK
- **Response Body**: Array of song objects
- **Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/songs?limit=10&offset=0`);
const songs = await response.json();
```

### 2. Get Song
- **Method**: GET
- **Path**: `/songs/{song_id}`
- **Response**: 200 OK
- **Response Body**: Song object
- **Error**: 404 Not Found
- **Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/songs/${songId}`);
const song = await response.json();
```

### 3. Create Song (Authenticated)
- **Method**: POST
- **Path**: `/songs`
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Request Body**: Song object (without song_id)
- **Response**: 201 Created
- **Response Body**: Created song object
- **Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/songs`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(newSong),
});
```

### 4. Update Song (Authenticated)
- **Method**: PUT
- **Path**: `/songs/{song_id}`
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Request Body**: Song object (without song_id)
- **Response**: 200 OK
- **Response Body**: Updated song object
- **Error**: 404 Not Found
- **Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updatedSong),
});
```

### 5. Delete Song (Authenticated)
- **Method**: DELETE
- **Path**: `/songs/{song_id}`
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Response**: 204 No Content
- **Error**: 404 Not Found
- **Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  },
});
```

### 6. Generate Pre-signed URL (Authenticated)
- **Method**: POST
- **Path**: `/presigned-url`
- **Headers**: 
  - `Authorization: Bearer {token}`
- **Request Body**: PresignedUrlRequest
- **Response**: 200 OK
- **Response Body**: PresignedUrlResponse
- **Error**: 400 Bad Request
- **Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/presigned-url`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    key: "songs/amazing_grace.mp3",
    operation: "get"
  }),
});
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;    // Error message
  code: string;     // Error code
  details?: any;    // Additional error details
}
```

### Common Error Codes
- **400 Bad Request**: Invalid request body or parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Concurrent update conflict
- **500 Internal Server Error**: Server-side error

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Best Practices

### 1. Error Handling
```typescript
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
}
```

### 2. Audio Playback
```typescript
async function getAudioUrl(song: Song) {
  if (!song.s3_uri) return null;
  
  const response = await fetch(`${API_BASE_URL}/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      key: song.s3_uri.replace('s3://', ''),
      operation: 'get'
    }),
  });
  
  const { url } = await handleApiError(response);
  return url;
}
```

### 3. Caching
- Cache song lists for 5 minutes
- Cache individual songs for 1 hour
- Cache pre-signed URLs for their duration (typically 1 hour)

## Versioning
The API is versioned through the URL path:
```
https://api.ourchants.com/v1/songs
```

Current version: v1

## Support
For API support or to report issues, please contact the API team or create an issue in the repository.

## Changelog
- **2024-04-17**: Initial API specification
- Added full schema support for all song fields
- Implemented concurrent operation handling
- Added detailed error responses
- Added pre-signed URL endpoint for audio playback 