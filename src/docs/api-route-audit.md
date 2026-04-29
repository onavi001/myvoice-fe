# API Route Audit (Frontend vs Backend)

This file tracks route compatibility after migrating from the old Next.js flow.

## Already aligned

- `POST /api/users`
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `GET/PUT /api/profile`
- `GET /api/coaches`
- `GET/POST /api/coaches/requests`
- `POST /api/coaches/accept`
- `POST /api/coaches/reject`
- `GET/PUT /api/admin/users/:id`
- `GET /api/admin/user`
- `GET /api/routines`
- `GET/PUT /api/routines/:routineId`
- `POST /api/routines/:routineId/days`
- `PUT /api/exercises/:id`
- `GET/PUT/DELETE /api/progress/:id` (single-record update/delete)
- `PUT /api/days/:id`
- `GET/POST/PUT/DELETE /api/videos`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Added and now aligned

- `GET/PUT /api/clients/:clientId`
- `GET/POST /api/clients/:clientId/routines`
- `GET /api/clients`
- `GET/POST /api/admin/coach-requests`
- `POST /api/admin/coach-requests/:requestId/approve`
- `POST /api/admin/coach-requests/:requestId/reject`
- `POST/DELETE /api/progress`
- `POST/DELETE /api/routines`
- `PUT /api/routines/:routineId/reset`
- `DELETE /api/days/:dayId`
- `POST /api/days/:dayId/exercises`
- `PUT /api/days/:dayId/reset`
- `DELETE /api/exercises/:exerciseId`
- `POST /api/exercises/generate`
- `POST /api/routines/generate`
- `POST /api/chatBot`

## Frontend route compatibility aliases

- `/auth/forgot-password` -> uses `ForgotPassword` page
- `/auth/reset-password` -> uses `ResetPassword` page

