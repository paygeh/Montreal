# Track Academic Performance

## Overview

The Track Academic Performance feature enables students to monitor their academic progress through GPA calculation, course grade tracking, goal setting, and performance analytics.

## User Stories & Acceptance Criteria

### Cumulative GPA Calculation
**As a student, I want to calculate my cumulative GPA so that I can track my overall academic standing**

**Acceptance Criteria:**
- [ ] Automatic GPA calculation from course grades
- [ ] Support for different GPA scales (4.0, 5.0)
- [ ] Cumulative GPA display
- [ ] Semester-wise GPA breakdown
- [ ] GPA trend visualization

### Grade Requirement Calculator
**As a student, I want to see how much I need to score on future assignments so that I can maintain my desired grade**

**Acceptance Criteria:**
- [ ] Input target grade for course
- [ ] Calculate required scores on remaining assignments
- [ ] Show minimum and optimal scores
- [ ] Multiple scenario calculations
- [ ] Grade impact visualization

### GPA Goal Setting
**As a student, I want to set GPA goals and track my progress toward them**

**Acceptance Criteria:**
- [ ] Set semester and cumulative GPA goals
- [ ] Progress tracking toward goals
- [ ] Goal achievement notifications
- [ ] Historical goal comparison
- [ ] Goal adjustment flexibility

### Course Grade Management
**Acceptance Criteria:**
- [ ] Enter individual assignment grades
- [ ] Calculate course averages automatically
- [ ] Weighted grade calculation support
- [ ] Grade category breakdown (homework, exams, projects)
- [ ] Grade distribution visualization

### Weekly GPA Updates
**As a student, I want to generate weekly GPA updates to monitor my progress**

**Acceptance Criteria:**
- [ ] Weekly GPA summary reports
- [ ] Progress comparison with previous weeks
- [ ] Performance trend analysis
- [ ] Exportable reports
- [ ] Email notification options

### GPA Progress Display
**Acceptance Criteria:**
- [ ] Visual GPA progress charts
- [ ] Semester comparison graphs
- [ ] Course performance heatmaps
- [ ] GPA projection calculator
- [ ] Academic standing indicators

## Technical Implementation

### Frontend Components
```typescript
// Grade Management Interface
interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor?: string;
  currentGrade?: number;
  targetGrade?: number;
  gradeCategories: GradeCategory[];
  assignments: Assignment[];
}

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  assignments: Assignment[];
}

interface Assignment {
  id: string;
  name: string;
  categoryId: string;
  grade?: number;
  maxGrade: number;
  weight?: number;
  dueDate?: Date;
  status: 'pending' | 'submitted' | 'graded';
}

interface GPARecord {
  id: string;
  semester: string;
  year: number;
  cumulativeGPA: number;
  semesterGPA: number;
  credits: number;
  courses: Course[];
  goalGPA?: number;
}

interface GPAGoal {
  id: string;
  type: 'semester' | 'cumulative';
  targetGPA: number;
  currentGPA: number;
  deadline?: Date;
  status: 'active' | 'achieved' | 'missed';
}
```

### API Endpoints
```
GET    /api/courses                  // Get user courses
GET    /api/courses/:id/grades       // Get course grades
POST   /api/courses/:id/grades       // Add/update course grade
GET    /api/gpa                      // Get GPA records
POST   /api/gpa                      // Create GPA record
GET    /api/gpa/progress             // Get GPA progress
POST   /api/gpa/goals                // Set GPA goal
GET    /api/grades/calculator        // Calculate required grades
GET    /api/grades/weekly            // Get weekly GPA updates
```

### Database Schema
```sql
-- Courses Table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  credits INTEGER NOT NULL,
  instructor VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments Table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  max_grade DECIMAL(5,2) NOT NULL,
  grade DECIMAL(5,2),
  weight DECIMAL(5,2),
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) CHECK (status IN ('pending', 'submitted', 'graded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPA Records Table
CREATE TABLE gpa_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  cumulative_gpa DECIMAL(3,2),
  semester_gpa DECIMAL(3,2),
  total_credits INTEGER,
  goal_gpa DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPA Goals Table
CREATE TABLE gpa_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  goal_type VARCHAR(20) CHECK (goal_type IN ('semester', 'cumulative')),
  target_gpa DECIMAL(3,2) NOT NULL,
  deadline DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'achieved', 'missed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing Plan

### Unit Tests
- [ ] GPA calculation accuracy
- [ ] Grade weight calculations
- [ ] Goal progress tracking
- [ ] Grade requirement calculations
- [ ] Data validation

### Integration Tests
- [ ] Course-grade relationships
- [ ] GPA record creation
- [ ] Goal setting functionality
- [ ] Weekly report generation

### User Acceptance Testing
- [ ] Grade entry workflow
- [ ] GPA goal setting process
- [ ] Grade calculator accuracy
- [ ] Progress visualization clarity
- [ ] Report generation usability

## Success Metrics

### Performance Metrics
- Grade calculation time < 2 seconds
- GPA loading time < 1 second
- Grade calculator response < 3 seconds
- Report generation time < 5 seconds

### User Experience Metrics
- Grade entry completion rate > 95%
- GPA goal setting usage > 70% of users
- Grade calculator adoption > 80% of users
- Weekly report generation > 60% of users

## Navigation

### Related Features
- [Manage Academic Tasks](manage-academic-tasks.md)
- [Plan and Log Study Time](plan-study-time.md)
- [Analyze Workload](analyze-workload.md)

### Main Navigation
- [Dashboard](../dashboard.md)
- [Profile](../user-profile.md)
- [Settings](../settings.md)

---

## Implementation Status

### Current Progress
- [x] API endpoints implemented
- [x] Database schema designed
- [x] GPA calculation logic
- [x] Grade entry forms
- [ ] Goal tracking interface
- [ ] Progress visualization
- [ ] Weekly report generation

### Next Steps
1. Implement grade calculator
2. Add goal tracking features
3. Create progress visualizations
4. Build weekly report system
5. User acceptance testing

---

*Last updated: 2026-04-21*
*Status: In Development*
