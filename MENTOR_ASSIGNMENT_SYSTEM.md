# Mentor Assignment System

## Overview

The Mentor Assignment System automatically assigns mentors to job seekers based on their test performance and grades. The system implements a comprehensive grading mechanism with load balancing to ensure fair distribution of mentees among mentors.

## Features

### 1. Grading System
- **Grade A**: Test score ≥ 80%
- **Grade B**: Test score ≥ 60% and < 80%
- **No Grade**: Test score < 60% (failed)

### 2. Mentor Assignment Logic
- Job seekers are automatically assigned to mentors with the same grade
- Load balancing ensures mentors with fewer mentees are prioritized
- Mentors have capacity limits (Grade A: 8 mentees, Grade B: 5 mentees)

### 3. Database Schema Updates

#### User Model Enhancements
```javascript
// Job seeker profile fields
profile: {
  grade: { type: String, enum: ['A', 'B'], default: null },
  assignedMentor: { type: ObjectId, ref: 'User', default: null },
  mentorAssignmentDate: { type: Date, default: null }
}

// Mentor profile fields
mentorProfile: {
  grade: { type: String, enum: ['A', 'B'], default: 'B' },
  currentMentees: { type: Number, default: 0, min: 0 },
  maxMentees: { type: Number, default: 5, min: 1 }
}
```

## API Endpoints

### Mentor Assignment Management

#### Get Mentor Assignment
```
GET /api/mentor/assignment/:jobseekerId
```
Returns mentor assignment details for a specific job seeker.

#### Get Mentor's Mentees
```
GET /api/mentor/mentees
```
Returns all mentees assigned to the authenticated mentor.

#### Manual Mentor Assignment (Admin)
```
POST /api/mentor/assign
Body: { jobseekerId, mentorId }
```
Manually assigns a mentor to a job seeker.

#### Remove Mentor Assignment (Admin)
```
DELETE /api/mentor/assignment/:jobseekerId
```
Removes mentor assignment from a job seeker.

#### Get Available Mentors (Admin)
```
GET /api/mentor/available?grade=A
```
Returns available mentors for a specific grade.

#### Update Mentor Grade (Admin)
```
PATCH /api/mentor/:mentorId/grade
Body: { grade: 'A' | 'B' }
```
Updates a mentor's grade.

#### Update Mentor Capacity (Admin)
```
PATCH /api/mentor/:mentorId/capacity
Body: { maxMentees: number }
```
Updates a mentor's maximum mentee capacity.

## Automatic Assignment Process

### 1. Test Submission Flow
1. Job seeker completes a test
2. Test is scored and evaluated
3. If passed, grade is calculated based on score
4. System searches for available mentors with matching grade
5. Mentor with lowest current mentee count is selected
6. Assignment is created and notifications are sent

### 2. Load Balancing Algorithm
```javascript
// Find mentors with same grade and available capacity
const mentors = await User.find({
  $or: [{ role: 'mentor' }, { secondaryRoles: 'mentor' }],
  'mentorProfile.grade': jobseekerGrade,
  'mentorProfile.currentMentees': { $lt: { $expr: '$mentorProfile.maxMentees' } },
  isActive: true
});

// Sort by current mentees count (ascending)
mentors.sort((a, b) => {
  const aMentees = a.mentorProfile?.currentMentees || 0;
  const bMentees = b.mentorProfile?.currentMentees || 0;
  return aMentees - bMentees;
});
```

## Frontend Integration

### Dashboard Display
The job seeker dashboard now includes a dedicated "Mentor Assignment" section that shows:

1. **Mentor Assigned**: Green card with mentor details and grade
2. **Assignment Pending**: Yellow card when grade is assigned but no mentor available
3. **No Assignment**: Gray card with instructions on how to get a mentor

### Mentor Information Display
- Mentor name and email
- Mentor grade
- Assignment date
- Contact instructions

## Email Notifications

### Job Seeker Notifications
- **Test Passed + Mentor Assigned**: Includes mentor details and contact information
- **Test Passed + No Mentor Available**: Notifies about pending assignment
- **Test Failed**: Standard rejection notification

### Mentor Notifications
- **New Mentee Assigned**: Includes mentee details and grade information

## Setup and Configuration

### 1. Set Up Mentor Grades
Run the setup script to assign grades to existing mentors:

```bash
cd backend
node scripts/setupMentorGrades.js
```

### 2. Environment Variables
Ensure the following environment variables are set:
- `MONGODB_URI`: MongoDB connection string
- `FRONTEND_URL`: Frontend URL for email links
- Email service configuration for notifications

### 3. Database Migration
The system automatically handles database schema updates. No manual migration is required.

## Testing the System

### 1. Create Test Mentors
1. Create mentor accounts through the admin panel
2. Run the setup script to assign grades
3. Verify mentor grades in the database

### 2. Test Assignment Flow
1. Have a job seeker apply for an internship
2. Assign a test to the application
3. Complete the test with a passing score
4. Verify automatic mentor assignment
5. Check dashboard for mentor information

### 3. Test Load Balancing
1. Create multiple mentors with the same grade
2. Have multiple job seekers pass tests
3. Verify mentees are distributed evenly among mentors

## Monitoring and Maintenance

### Key Metrics to Monitor
- Mentor utilization rates
- Assignment success rates
- Average time to assignment
- Mentor capacity utilization

### Maintenance Tasks
- Regular review of mentor capacity
- Grade adjustments based on performance
- Mentor availability monitoring
- Assignment quality assessment

## Troubleshooting

### Common Issues

#### No Mentors Available
- Check if mentors have the correct grade
- Verify mentor capacity settings
- Ensure mentors are active

#### Assignment Not Working
- Check test scoring logic
- Verify grade calculation
- Review mentor search criteria

#### Email Notifications Not Sent
- Verify email service configuration
- Check email templates
- Review notification triggers

### Debug Commands
```javascript
// Check mentor availability
const availableMentors = await User.find({
  $or: [{ role: 'mentor' }, { secondaryRoles: 'mentor' }],
  'mentorProfile.grade': 'A',
  'mentorProfile.currentMentees': { $lt: { $expr: '$mentorProfile.maxMentees' } },
  isActive: true
});

// Check job seeker assignments
const assignments = await User.find({
  'profile.assignedMentor': { $exists: true }
});
```

## Future Enhancements

### Planned Features
1. **Skill-based Matching**: Match mentors and mentees based on skills and expertise
2. **Performance Tracking**: Track mentorship success metrics
3. **Dynamic Capacity**: Adjust mentor capacity based on performance
4. **Mentor Ratings**: Allow mentees to rate their mentors
5. **Automated Reminders**: Send reminders for mentorship activities

### Integration Opportunities
1. **Calendar Integration**: Schedule mentorship sessions
2. **Progress Tracking**: Monitor mentee development
3. **Resource Sharing**: Share learning materials
4. **Feedback System**: Collect and analyze feedback

## Support

For technical support or questions about the mentor assignment system, please contact the development team or refer to the system documentation.
