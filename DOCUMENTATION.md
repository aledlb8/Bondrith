# API Documentation

Welcome to the API documentation.

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Login](#login)
  - [Access](#access)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Changelog](#changelog)

## Authentication

This auth requires API key-based authentication. You need to include the auth token in the request headers for each request.

### Authentication Header

Include the following header in your requests:

```
Authorization: YOUR_AUTH_TOKEN
```

## Endpoints

### Login

- **URL:** `/api/user/login/{userId}`
- **Method:** `POST`
- **Description:** `Login using the userId`
- **Parameters:**
  - `userId` (required)
- **Response:**
  - Status: `200 OK`
  - Body:
  {
    success: boolean;
    message: string;
    data: any;
    userToken: string | undefined;
    err: string | undefined;
  }

### Access

- **URL:** `/api/user/login/{userToken}?hwid={hwid}`
- **Method:** `POST`
- **Description:** `Login using the userToken`
- **Parameters:**
  - `userToken` (required)
  - `hwid` (optional)
- **Response:**
  - Status: `200 OK`
  - Body:
  {
    success: boolean;
    message: string;
    data: any;
    err: string | undefined;
  }

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. Errors are returned in the response body with appropriate error codes and messages.

Example error response:

```json
{
  "error": {
    "code": 400,
    "message": "Invalid request."
  }
}
```

## Rate Limiting

This auth has rate limiting to prevent abuse. The rate limits are as follows:

- Requests per IP in a minute: 15

## Changelog

### [0.1] - 2023-09-21

- Initial release
