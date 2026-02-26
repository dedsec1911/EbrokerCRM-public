# Admin Setup Guide - EstateFlow CRM

## Overview
Admin signup has been restricted to ensure only ONE admin exists in the system. Normal users cannot access admin registration through the public login/signup interface.

## Changes Made

### 1. Frontend Changes
**File**: `frontend/src/pages/LoginPage.jsx`

- ✅ **Removed admin role option** from the registration form's role selector
- Only "Agent" role is now visible to users during public registration
- The role is automatically set to "agent" for all public registrations

### 2. Backend Changes
**File**: `backend/server.py`

#### Public Registration Endpoint (`/auth/register`)
- ✅ Now **validates** that only agents can register through the public endpoint
- If someone tries to register as admin through the public endpoint, they get error: `"Only agents can register through this endpoint"`
- The role is **forcefully set to "agent"** regardless of what was submitted
- This prevents any bypass attempts

#### New Admin Registration Endpoint (`/auth/register-admin`)
- ✅ **Dedicated endpoint** for admin registration: `/api/auth/register-admin`
- **Enforces single admin constraint**: Checks if an admin already exists
- If admin already exists, returns error: `"An admin already exists. Only one admin is allowed."`
- Can only be used to create the FIRST admin in the system
- Should only be accessible to deployment/setup scripts or authorized personnel

## How to Use

### Register First Admin (During Initial Setup)
```bash
curl -X POST http://localhost:8001/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@estateflow.com",
    "phone": "9876543210",
    "password": "secure_password_here",
    "role": "admin"
  }'
```

### Register Agents (Public Flow)
Users can register as agents through the normal signup page at `http://localhost:3000`:
- Click "Register" tab
- Fill in: Name, Email, Phone, Password
- Role is automatically set to "Agent"
- Click "Create Account"

### Admin Login
Admins login the same way as agents through the login page:
- Click "Login" tab
- Enter email/phone and password
- They will be redirected to `/admin` dashboard

## Security Features

1. **Single Admin Enforcement**: Database query checks if admin role exists before creation
2. **Role Override**: Public registration always sets role to "agent"
3. **Validation on Both Ends**: Frontend (UI removal) + Backend (role validation)
4. **Separate Endpoint**: Admin creation uses dedicated endpoint separate from public registration

## Database Query
To check current admins in MongoDB:
```javascript
db.users.find({ role: "admin" })
```

## Error Handling

### When trying to create second admin:
```json
{
  "detail": "An admin already exists. Only one admin is allowed."
}
```

### When trying to register as admin through public endpoint:
```json
{
  "detail": "Only agents can register through this endpoint"
}
```

## Admin Responsibilities
Once admin is created, they can:
- Login to admin dashboard
- Approve/reject agent properties
- Manage leads
- Share properties via WhatsApp
- View analytics and reports

## API Endpoints Summary

| Endpoint | Method | Purpose | Who Can Use |
|----------|--------|---------|-------------|
| `/auth/register` | POST | Register as Agent | Anyone (Public) |
| `/auth/register-admin` | POST | Create First Admin | Setup/Deployment |
| `/auth/login` | POST | Login | Everyone |
| `/auth/me` | GET | Get current user | Authenticated users |

## Notes
- The admin registration endpoint is not exposed in the UI for security
- To create the first admin, use the direct API call or setup script
- After the first admin is created, no additional admins can be created through the dedicated endpoint
- Future admin management (if needed) should go through a separate secure admin panel

---

**Last Updated**: February 26, 2026
