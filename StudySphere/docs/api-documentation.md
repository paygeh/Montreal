# StudySphere API Documentation

## Overview

The StudySphere API provides a comprehensive RESTful interface for managing academic tasks, tracking performance, analyzing workload, and monitoring student well-being. All API operations go through this layer - frontend applications must not call Supabase directly.

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.studysphere.app/api
```

## Authentication

### JWT Token Authentication
All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Courses Management

#### Get All Courses
```http
GET /courses
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "Computer Science 101",
      "code": "CS101",
      "credits": 3,
      "instructor": "Dr. Smith",
      "color": "#3498db",
      "taskCount": 15,
      "completedTasks": 8
    }
  ]
}
```

#### Create Course
```http
POST /courses
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Computer Science 101",
  "code": "CS101",
  "credits": 3,
  "instructor": "Dr. Smith",
  "color": "#3498db"
}
```

#### Update Course
```http
PATCH /courses/:courseId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Advanced Computer Science",
  "credits": 4
}
```

#### Delete Course
```http
DELETE /courses/:courseId
Authorization: Bearer <jwt_token>
```

### Assignments Management

#### Get All Assignments
```http
GET /assignments?courseId=:courseId&status=:status
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `courseId` (optional): Filter by course
- `status` (optional): Filter by status (pending, in_progress, completed)

**Response:**
```json
{
  "assignments": [
    {
      "id": "uuid",
      "title": "Homework 3",
      "description": "Complete exercises 1-10",
      "courseId": "uuid",
      "courseName": "CS101",
      "priority": "high",
      "status": "pending",
      "dueDate": "2026-04-25T23:59:59Z",
      "estimatedTime": 120,
      "actualTime": 0,
      "createdAt": "2026-04-21T10:00:00Z",
      "updatedAt": "2026-04-21T10:00:00Z"
    }
  ]
}
```

#### Create Assignment
```http
POST /assignments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Homework 3",
  "description": "Complete exercises 1-10",
  "courseId": "uuid",
  "priority": "high",
  "dueDate": "2026-04-25T23:59:59Z",
  "estimatedTime": 120
}
```

#### Update Assignment
```http
PATCH /assignments/:assignmentId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "completed",
  "actualTime": 105
}
```

#### Delete Assignment
```http
DELETE /assignments/:assignmentId
Authorization: Bearer <jwt_token>
```

### Study Sessions

#### Get Study Sessions
```http
GET /study-sessions?courseId=:courseId&startDate=:startDate&endDate=:endDate
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "Study for Midterm",
      "startTime": "2026-04-21T14:00:00Z",
      "endTime": "2026-04-21T16:00:00Z",
      "duration": 120,
      "notes": "Reviewed chapters 1-5",
      "createdAt": "2026-04-21T14:00:00Z"
    }
  ]
}
```

#### Create Study Session
```http
POST /study-sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "uuid",
  "title": "Study for Midterm",
  "startTime": "2026-04-21T14:00:00Z",
  "endTime": "2026-04-21T16:00:00Z",
  "notes": "Review chapters 1-5"
}
```

#### Update Study Session
```http
PATCH /study-sessions/:sessionId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "endTime": "2026-04-21T17:00:00Z",
  "notes": "Reviewed chapters 1-6"
}
```

#### Delete Study Session
```http
DELETE /study-sessions/:sessionId
Authorization: Bearer <jwt_token>
```

### GPA Tracking

#### Get GPA Records
```http
GET /gpa
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "current_gpa": 3.7,
  "total_credits": 45,
  "records": [
    {
      "id": "uuid",
      "semester": "Fall",
      "year": 2025,
      "gpa_value": 3.8,
      "goal_gpa": 4.0,
      "credits": 15,
      "courses": [
        {
          "credits": 3,
          "grade": "A"
        }
      ]
    }
  ]
}
```

#### Create GPA Record
```http
POST /gpa
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "semester": "Spring",
  "year": 2026,
  "gpa_value": 3.9,
  "goal_gpa": 4.0,
  "courses": [
    {
      "name": "CS101",
      "credits": 3,
      "grade": "A"
    }
  ]
}
```

#### Get GPA Progress
```http
GET /gpa/progress
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "current_gpa": 3.7,
  "goal_gpa": 4.0,
  "progress_percentage": 92.5,
  "difference": -0.3,
  "total_credits": 45,
  "on_track": true
}
```

### Workload Analysis

#### Get Workload Records
```http
GET /workload?intensity=:intensity&startDate=:startDate&endDate=:endDate
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "workload_records": [
    {
      "id": "uuid",
      "week_start_date": "2026-04-20",
      "total_estimated_time": 480,
      "workload_intensity": "medium",
      "course_id": "uuid",
      "course_name": "CS101"
    }
  ]
}
```

#### Create Workload Record
```http
POST /workload
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "week_start_date": "2026-04-20",
  "total_estimated_time": 480,
  "workload_intensity": "medium",
  "courseId": "uuid"
}
```

#### Get Workload Analysis
```http
GET /workload/analysis?weeks=:weeks
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "analysis_period": "8 weeks",
  "total_weeks_analyzed": 8,
  "average_weekly_time": 420,
  "intensity_distribution": {
    "low": 2,
    "medium": 4,
    "high": 2
  },
  "workload_spikes": 2,
  "spike_weeks": [
    {
      "week_start_date": "2026-04-13",
      "total_time": 600,
      "intensity": "high"
    }
  ],
  "trend": {
    "direction": "decreasing",
    "change": -60
  }
}
```

### Burnout Monitoring

#### Get Burnout Alerts
```http
GET /burnout-alerts
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "alert_type": "warning",
      "message": "High workload detected this week",
      "created_at": "2026-04-21T10:00:00Z",
      "status": "active"
    }
  ]
}
```

#### Create Burnout Alert
```http
POST /burnout-alerts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "alert_type": "warning",
  "message": "Consider taking breaks during study sessions",
  "severity_level": "medium"
}
```

#### Update Burnout Alert
```http
PATCH /burnout-alerts/:alertId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "acknowledged"
}
```

#### Get Burnout Analysis
```http
GET /burnout-alerts/analysis
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "risk_level": "moderate",
  "risk_score": 65,
  "risk_factors": {
    "workload_intensity": 70,
    "study_volume": 60,
    "effectiveness_decline": 50
  },
  "analysis_period": "4 weeks",
  "data_points": {
    "workload_weeks": 4,
    "study_sessions": 12,
    "avg_daily_study_minutes": 180
  },
  "recommendations": [
    "Take regular breaks during study sessions",
    "Consider reducing study load this week"
  ],
  "last_updated": "2026-04-21T10:00:00Z"
}
```

### User Profile

#### Get User Profile
```http
GET /profiles
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "student@university.edu",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "bio": "Computer Science student",
  "academicInfo": {
    "major": "Computer Science",
    "year": "junior",
    "institution": "University",
    "gpaGoal": 4.0
  },
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": true,
      "push": true
    }
  }
}
```

#### Update User Profile
```http
PATCH /profiles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "displayName": "John D.",
  "bio": "Computer Science student passionate about AI",
  "academicInfo": {
    "major": "Computer Science",
    "year": "senior"
  }
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): User does not have permission to access resource
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Request validation failed
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 10 requests per 15 minutes
- **Bulk operations**: 20 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Endpoints that return lists support pagination:

```http
GET /assignments?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

StudySphere supports webhooks for real-time notifications:

### Configure Webhook
```http
POST /webhooks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["assignment.created", "assignment.due_soon"],
  "secret": "webhook_secret"
}
```

### Webhook Events
- `assignment.created`: New assignment created
- `assignment.due_soon`: Assignment due within 24 hours
- `gpa.updated`: GPA record updated
- `burnout_alert.created`: New burnout alert generated

## SDK and Libraries

### JavaScript/TypeScript
```bash
npm install studysphere-api-client
```

```javascript
import { StudySphereAPI } from 'studysphere-api-client';

const api = new StudySphereAPI({
  baseURL: 'http://localhost:3001/api',
  token: 'your_jwt_token'
});

const assignments = await api.assignments.getAll();
```

### Python
```bash
pip install studysphere-python
```

```python
from studysphere import StudySphereClient

client = StudySphereClient(
    base_url='http://localhost:3001/api',
    token='your_jwt_token'
)

assignments = client.assignments.get_all()
```

## Testing

### Test Environment
```
Base URL: http://localhost:3001/api
Test User: test@studysphere.app
Password: TestPassword123
```

### Postman Collection
Download the Postman collection from:
```
https://docs.studysphere.app/postman-collection
```

## Support

- **API Documentation**: https://docs.studysphere.app/api
- **Support Email**: api-support@studysphere.app
- **Status Page**: https://status.studysphere.app
- **GitHub Issues**: https://github.com/studysphere/api/issues

---

*Last updated: 2026-04-21*
*API Version: v1.0.0*
