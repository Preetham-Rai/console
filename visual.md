# Fider Backend Architecture - Visual Guide

## 🏗️ Overall Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Request                             │
│              (GET /api/v1/posts?query=bug)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           MIDDLEWARE CHAIN (Security Layer)                 │
│  ┌─────────────────────────────────────────────────────────┐
│  │  1. CatchPanic() - Handle panics                        │
│  │  2. Instrumentation() - Track metrics                   │
│  │  3. Secure() - Security headers                         │
│  │  4. Compress() - Gzip compression                       │
│  │  5. Session() - Load session                            │
│  │  6. WebSetup() - Setup context                          │
│  │  7. Tenant() - Resolve tenant                           │
│  │  8. User() - Load user object                           │
│  │  9. CSRF() - CSRF protection                            │
│  │  10. IsAuthenticated() - User check                     │
│  │  11. IsAuthorized() - Role check                        │
│  └─────────────────────────────────────────────────────────┘
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    HANDLER FUNCTION                          │
│    (app/handlers/apiv1/post.go - SearchPosts)              │
│  ✓ Parse query parameters                                   │
│  ✓ Validate input                                           │
│  ✓ Call business logic via bus                              │
│  ✓ Return JSON response                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVICE BUS (Dependency Injection)              │
│    bus.Dispatch(ctx, &query.SearchPosts{...})               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         SERVICE HANDLER (Business Logic)                    │
│  (app/services/sqlstore/postgres/post.go)                  │
│   - Build SQL query                                         │
│   - Execute query                                           │
│   - Return results                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  ┌─────────────────────────────────────────────────────────┐
│  │  SELECT * FROM posts                                    │
│  │  WHERE tenant_id = 1                                    │
│  │  AND title ILIKE '%bug%'                                │
│  │  LIMIT 10                                               │
│  └─────────────────────────────────────────────────────────┘
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Query Results + Response Builder               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              JSON Response to Client                         │
│  [                                                          │
│    {"id": 1, "title": "Bug: Login broken", ...},           │
│    {"id": 2, "title": "Bug: Search fails", ...}            │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Application Startup Sequence

```
1. main.go
   └─> os.Args[1:] == "" → cmd.RunServer()

2. app/cmd/server.go - RunServer()
   ├─> bus.Init()
   │   ├─ Load .env configuration
   │   ├─ Register all services (from underscore imports)
   │   ├─ Initialize PostgreSQL connection pool
   │   ├─ Initialize Email service (SMTP)
   │   ├─ Initialize Blob storage (S3/Filesystem)
   │   ├─ Initialize Logging service
   │   ├─ Initialize OAuth service
   │   └─ Initialize Webhooks service
   │
   ├─> startJobs(ctx)
   │   ├─ Schedule PurgeExpiredNotificationsJob (every hour)
   │   └─ Schedule EmailSuppressionJob (every night)
   │
   ├─> routes(web.New())
   │   └─ Register all HTTP endpoints
   │
   ├─> e.Start("0.0.0.0:3000")
   │   └─ Listen for incoming requests
   │
   └─> listenSignals(e)
       └─ Wait for SIGTERM/SIGINT to gracefully shutdown
```

---

## 📊 Database Schema Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        TENANTS                               │
│  ┌──────────────────────────────────────────────────────────┐
│  │ id, name, subdomain, domain, status, created_at          │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────────────────────────────────────────────┐
│                        USERS                                 │
│  ┌──────────────────────────────────────────────────────────┐
│  │ id, tenant_id, email, name, role, status, created_at    │
│  │ role: MEMBER, COLLABORATOR, ADMINISTRATOR               │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────────────────────────────────────────────┐
│                        POSTS                                 │
│  ┌──────────────────────────────────────────────────────────┐
│  │ id, tenant_id, number, title, description, slug          │
│  │ status, user_id, response, response_date, response_user  │
│  │ created_at, updated_at                                   │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────────────────────────────────────────────┐
│                       COMMENTS                               │
│  ┌──────────────────────────────────────────────────────────┐
│  │ id, post_id, user_id, content, is_approved              │
│  │ created_at, updated_at, deleted_at                       │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                        TAGS                                  │
│  ┌──────────────────────────────────────────────────────────┐
│  │ id, tenant_id, name, slug, color, created_at             │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
        │
        │ N:N
        ▼
┌──────────────────────────────────────────────────────────────┐
│                    POST_TAGS (Junction)                      │
│  ┌──────────────────────────────────────────────────────────┐
│  │ post_id, tag_id                                          │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    POST_VOTES (Upvotes)                      │
│  ┌──────────────────────────────────────────────────────────┐
│  │ post_id, user_id, created_at                             │
│  │ (PRIMARY KEY: post_id, user_id)                          │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS                             │
│  ┌──────────────────────────────────────────────────────────┐
│  │ id, user_id, link, title, read_at, created_at, expires_at
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request-Response Cycle for Create Post

```
CLIENT REQUEST:
┌──────────────────────────────────────┐
│ POST /api/v1/posts                   │
│ {                                    │
│   "title": "Bug: Login broken",     │
│   "description": "I can't login",   │
│   "attachments": []                  │
│ }                                    │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ MIDDLEWARE CHAIN                                        │
│ ─────────────────────────────────────────────────────── │
│ IsAuthenticated() → Check JWT token in cookie          │
│ IsAuthorized() → User has required role               │
│ CSRF() → Validate CSRF token                           │
│ RequireTenant() → Verify tenant exists                 │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ HANDLER: CreatePost() in apiv1/post.go                 │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ action := new(actions.CreateNewPost)                   │
│ c.BindTo(action)  → Parse & validate JSON             │
│                                                         │
│ bus.Dispatch(ctx, &cmd.UploadImages{...})              │
│   → Upload attachments to S3/filesystem               │
│                                                         │
│ bus.Dispatch(ctx, &cmd.AddNewPost{                     │
│   Title: "Bug: Login broken",                          │
│   Description: "I can't login"                         │
│ })                                                      │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ BUS: AddHandler(addNewPost) execution                   │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Generated next_post_number = 42                         │
│ Generated slug = "bug-login-broken"                     │
│                                                         │
│ INSERT INTO posts (                                    │
│   tenant_id, number, title, slug, description,        │
│   status, user_id, created_at                          │
│ ) VALUES (1, 42, "Bug: Login broken", ...)            │
│                                                         │
│ Result: Post{id: 1, number: 42, ...}                   │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│ RESPONSE: Return back to handler                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ c.Ok(newPost.Result)  → 200 JSON response             │
│                                                         │
│ {                                                      │
│   "id": 1,                                             │
│   "number": 42,                                        │
│   "title": "Bug: Login broken",                       │
│   "slug": "bug-login-broken",                         │
│   "status": "OPEN",                                    │
│   "user": {...},                                       │
│   "created_at": "2025-04-11T10:30:00Z"               │
│ }                                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Service Architecture

```
┌─····────────────────────────────────────────────────────────┐
│ app/cmd/server.go - RunServer()                             │
│                                                              │
│  bus.Init()  ────────────────────────────────────────────┐  │
│                                                          │  │
│  Services Register:                                     │  │
│  ┌─────────────────────────────────────────────────┐    │  │
│  │ sqlstore/postgres/                              │    │  │
│  │   ├─ Service.Init() → Register handlers        │    │  │
│  │   ├─ searchPosts()                              │    │  │
│  │   ├─ getPostByID()                              │    │  │
│  │   ├─ addNewPost()                               │    │  │
│  │   └─ (50+ more handlers)                        │    │  │
│  │                                                  │    │  │
│  │ email/smtp/                                      │    │  │
│  │   ├─ Service.Init() → Register handlers        │    │  │
│  │   └─ sendEmail()                                │    │  │
│  │                                                  │    │  │
│  │ blob/s3/                                         │    │  │
│  │   ├─ Service.Init() → Register handlers        │    │  │
│  │   ├─ uploadBlob()                               │    │  │
│  │   └─ getBlobByKey()                             │    │  │
│  │                                                  │    │  │
│  │ log/console/                                     │    │  │
│  │   └─ Service.Init() → Register logger           │    │  │
│  │                                                  │    │  │
│  │ oauth/                                           │    │  │
│  │   ├─ Service.Init() → Register handlers         │    │  │
│  │   └─ authorizeWithGoogleOAuth()                 │    │  │
│  └─────────────────────────────────────────────────┘    │  │
│                                                          │  │
│  Bus Handler Map:                                        │  │
│  ┌─────────────────────────────────────────────────┐    │  │
│  │ "github.com/getfider/fider/app/models/query    │    │  │
│  │   .SearchPosts" → searchPosts()                 │    │  │
│  │                                                  │    │  │
│  │ "github.com/getfider/fider/app/models/cmd      │    │  │
│  │   .SendEmail" → sendEmail()                     │    │  │
│  │                                                  │    │  │
│  │ "github.com/getfider/fider/app/models/cmd      │    │  │
│  │   .UploadBlob" → uploadBlob()                   │    │  │
│  └─────────────────────────────────────────────────┘    │  │
│                                                          ◄──┘
│  The bus now knows how to handle every Query/Command    │
└───────────────────────────────────────────────────────────┘
```

---

## 🎯 Handlers Organization

```
app/handlers/
├─ admin.go               ← Admin settings pages
├─ post.go                ← Post-related pages (SSR)
├─ signin.go              ← Authentication pages
├─ signup.go              ← Registration pages
├─ feed.go                ← Atom/RSS feeds
├─ images.go              ← Image serving
├─ settings.go            ← User settings pages
├─ notification.go        ← Notification pages
│
└─ apiv1/                 ← JSON REST API v1
   ├─ post.go             ← POST/PUT/GET posts
   ├─ comment.go          ← Comments API
   ├─ vote.go             ← Votes API
   ├─ tag.go              ← Tags API
   └─ search.go           ← Search API

Key difference:
- app/handlers/*    → Returns HTML (Server-Side Rendering)
- app/handlers/apiv1/* → Returns JSON
```

---

## 🔐 Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT USER LOGS IN                                      │
│ POST /api/signin {email, password}                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ app/handlers/signin.go - SignInByEmail()               │
│ ① Query database for user by email                      │
│ ② Validate password                                     │
│ ③ Create JWT token signed with JWT_SECRET              │
│ ④ Set cookie: fider-user = <JWT_TOKEN>                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ RESPONSE 200 OK + Set-Cookie Header                    │
│ fider-user=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;  │
│ Path=/; HttpOnly; Secure; SameSite=Lax                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ NEXT REQUEST: GET /api/posts                            │
│ Cookie: fider-user=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ MIDDLEWARE: IsAuthenticated()                           │
│ ① Read JWT from cache/cookie                            │
│ ② Verify signature with JWT_SECRET                      │
│ ③ Check token not expired                               │
│ ④ Extract user_id from token                            │
│ ⑤ Set c.User() in context                               │
│                                                         │
│ ✓ Token valid → Continue to handler                     │
│ ✗ Token invalid → Return 401 Unauthorized               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ MIDDLEWARE: IsAuthorized(RoleCollaborator, ...)        │
│ ① Get user.Role from c.User()                           │
│ ② Check if role in allowed list                         │
│                                                         │
│ ✓ Role matches → Continue to handler                    │
│ ✗ Role doesn't match → Return 403 Forbidden             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ HANDLER executes with authenticated & authorized user   │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 Job Scheduler (Cron)

```
┌────────────────────────────────────────────────────────┐
│ app/cmd/server.go - startJobs()                        │
│                                                        │
│ scheduler := cron.New()                               │
│                                                        │
│ Job 1: PurgeExpiredNotificationsJob                    │
│ ├─ Schedule: "0 0 * * * *"  (Every hour at :00)      │
│ └─ Handler: Deletes notifications older than 1 year   │
│                                                        │
│ Job 2: EmailSuppressionJob                            │
│ ├─ Schedule: "0 2 * * *"  (Daily at 2:00 AM)         │
│ └─ Handler: Removes invalid emails                    │
│                                                        │
│ scheduler.Start()  → Runs indefinitely in background  │
└────────────────────────────────────────────────────────┘
         │
         ├─ Every hour ──────────────┐
         │                            ▼
         │              ┌──────────────────────┐
         │              │ Scheduled time match │
         │              │ Fire: PurgeJob.Run() │
         │              │ db.DeleteWhere(...)  │
         │              └──────────────────────┘
         │
         └─ Every day at 2 AM ──┐
                                ▼
                  ┌──────────────────────┐
                  │Scheduled time match  │
                  │Fire: SupressionJob   │
                  │db.UpdateInvalidEmails
                  └──────────────────────┘
```

---

## 🌍 Multi-Tenant Request Handling

```
CLIENT REQUEST:
┌─────────────────────────────────────────────────────────┐
│ GET https://acme.yourdomain.com/api/v1/posts           │
│ GET https://yourdomain.com/t/beta/api/v1/posts         │
│ GET https://acme.com/api/v1/posts  (CNAME)             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ MIDDLEWARE: Tenant()                                    │
│ app/middlewares/tenant.go                              │
│                                                         │
│ Extract tenant from:                                    │
│ 1. Subdomain → "acme" → query db: subdomain="acme"    │
│ 2. Path → "/t/beta" → extract "beta" → query db       │
│ 3. Host + CNAME → "acme.com" → query db: cname        │
│                                                         │
│ RESULT: c.Tenant() = Tenant{                            │
│   ID: 1,                                                │
│   Name: "acme",                                         │
│   Subdomain: "acme",                                    │
│   IsPrivate: false                                      │
│ }                                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ HANDLER: SearchPosts()                                  │
│                                                         │
│ query := &query.SearchPosts{Query: "bug"}              │
│ bus.Dispatch(ctx, query)                               │
│                                                         │
│ Bus passes ctx which contains:                          │
│ ├─ ctx.Tenant() = {ID: 1}  ← This tenant!              │
│ ├─ ctx.User() = Current user                           │
│ └─ All request data                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ SERVICE: searchPosts() in sqlstore/postgres             │
│                                                         │
│ tenant := getTenant(ctx)  // Get tenant from context   │
│                                                         │
│ SELECT * FROM posts                                    │
│ WHERE tenant_id = $1  ← Data isolation!               │
│ AND title ILIKE $2                                     │
│                                                         │
│ Result: Only posts from tenant "acme"                  │
│ (Not posts from tenant "beta" or others)               │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Environment Configuration Priority

```
┌──────────────────────────────────────────────────────┐
│ app/pkg/env/env.go - Config Loading Order           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ type config struct {                               │
│   Port: "PORT"              ← Read from env var    │
│   Host: "HOST"              ← Read from env var    │
│   BaseURL: "BASE_URL"       ← Read from env var    │
│   Database: struct {        ← Read from env var    │
│     URL: "DATABASE_URL"  ... required              │
│   }                                                │
│ }                                                  │
│                                                    │
│ PRIORITY:                                          │
│ 1. Environment variable (highest)                 │
│ 2. Default value  (if not set)                    │
│ 3. Panic if required and not set                  │
│                                                    │
│ Example:                                           │
│ PORT env var   → Use that                          │
│ PORT not set   → Use default "3000"               │
│ DATABASE_URL   → Must be set or panic              │
│                                                    │
└──────────────────────────────────────────────────────┘
```

---

## 🎓 Complete Request Example: "Create Post"

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Browser sends POST request                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ POST /api/v1/posts  HTTP/1.1                           │
│ Host: acme.yourdomain.com                              │
│ Cookie: fider-user=<JWT_TOKEN>                         │
│ X-CSRF-Token: <CSRF_TOKEN>                             │
│ Content-Type: application/json                         │
│                                                         │
│ {                                                       │
│   "title": "Feature: Dark mode",                       │
│   "description": "Please add dark mode",              │
│   "attachments": []                                    │
│ }                                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Middleware chain processes request             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ✓ CatchPanic() → No panic yet                         │
│ ✓ Instrumentation() → Start timing                    │
│ ✓ Secure() → Add security headers                     │
│ ✓ Compress() → Setup compression                      │
│ ✓ Session() → Load session data                       │
│ ✓ WebSetup() → Build template data                    │
│ ✓ Tenant() → Extract tenant_id=1 (acme)             │
│ ✓ User() → Load user from JWT (user_id=42)          │
│ ✓ CSRF() → Validate X-CSRF-Token matches session    │
│ ✓ RequireTenant() → Tenant exists                    │
│ ✓ IsAuthenticated() → JWT is valid                   │
│ ✓ IsAuthorized(Member+) → User is member             │
│ ✓ BlockLockedTenants() → Tenant is active           │
│                                                         │
│ All checks passed! Continue to handler...             │
│ ctx now contains:                                      │
│ ├─ ctx.User() = User{ID:42, TenantID:1, ...}        │
│ ├─ ctx.Tenant() = Tenant{ID:1, Name:"acme", ...}    │
│ └─ Request body is ready to parse                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Handler - CreatePost() executes               │
├─────────────────────────────────────────────────────────┤
│ app/handlers/apiv1/post.go                             │
│                                                         │
│ action := new(actions.CreateNewPost)                   │
│ c.BindTo(action)  // Parse JSON, validate             │
│                                                         │
│ Validation rules:                                      │
│ ├─ title: required, max 255 chars                     │
│ ├─ description: max 1000 chars                        │
│ └─ attachments: max 5 files                           │
│                                                         │
│ ✓ title = "Feature: Dark mode"  (OK)                 │
│ ✓ description = "Please add..." (OK)                  │
│ ✓ attachments = []  (OK)                              │
│                                                         │
│ Action is valid, continue...                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Dispatch UploadImages command                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ bus.Dispatch(ctx, &cmd.UploadImages{                   │
│   Images: [],  // No attachments                       │
│   Folder: "attachments"                                │
│ })                                                      │
│                                                         │
│ Bus finds handler: uploadBlob() in blob/s3/            │
│ Execute: no files to upload, skip                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Dispatch AddNewPost command (main logic)       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ bus.Dispatch(ctx, &cmd.AddNewPost{                     │
│   Title: "Feature: Dark mode",                         │
│   Description: "Please add dark mode"                  │
│ })                                                      │
│                                                         │
│ Bus calls handler: addNewPost() in                     │
│ app/services/sqlstore/postgres/post.go                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Database - addNewPost handler                   │
├─────────────────────────────────────────────────────────┤
│ app/services/sqlstore/postgres/post.go                 │
│                                                         │
│ 1. Get maximum post number for this tenant:           │
│    SELECT MAX(number) FROM posts ...= 142             │
│    next_number = 142 + 1 = 143                        │
│                                                         │
│ 2. Generate slug from title:                          │
│    slug := slug.Make("Feature: Dark mode")            │
│    slug = "feature-dark-mode"                         │
│                                                         │
│ 3. Get current user and tenant context:               │
│    user := ctx.User()  // {ID: 42}                    │
│    tenant := ctx.Tenant()  // {ID: 1}                 │
│                                                         │
│ 4. INSERT post into database:                         │
│    INSERT INTO posts (                                │
│      tenant_id, number, title, description,           │
│      slug, status, user_id, created_at                │
│    ) VALUES (1, 143, "Feature: Dark mode", ...,      │
│              "feature-dark-mode", "OPEN", 42, NOW())  │
│    RETURNING *                                        │
│                                                         │
│ 5. Return created post:                               │
│    cmd.Result = Post{                                 │
│      ID: 1023,                                        │
│      TenantID: 1,                                     │
│      Number: 143,                                     │
│      Title: "Feature: Dark mode",                     │
│      Slug: "feature-dark-mode",                       │
│      Status: "OPEN",                                  │
│      UserID: 42,                                      │
│      CreatedAt: 2025-04-11T14:30:00Z                 │
│    }                                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 7: Handler returns response                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ return c.Ok(newPost.Result)                            │
│                                                         │
│ This serializes to JSON and sends back to client:      │
│                                                         │
│ HTTP/1.1 200 OK                                        │
│ Content-Type: application/json                         │
│                                                         │
│ {                                                       │
│   "id": 1023,                                          │
│   "number": 143,                                       │
│   "title": "Feature: Dark mode",                       │
│   "slug": "feature-dark-mode",                         │
│   "description": "Please add dark mode",              │
│   "status": "OPEN",                                    │
│   "user": {                                            │
│     "id": 42,                                          │
│     "name": "John Doe",                               │
│     "avatar_type": "gravatar"                          │
│   },                                                   │
│   "comments_count": 0,                                 │
│   "votes_count": 0,                                    │
│   "created_at": "2025-04-11T14:30:00Z"               │
│ }                                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 8: Browser receives response                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ JavaScript code:                                        │
│ const response = await fetch('/api/v1/posts', ...)    │
│ const post = await response.json()                      │
│ // post.number = 143                                   │
│ // post.title = "Feature: Dark mode"                   │
│ // Update UI to show newly created post               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This visual guide shows you every part of the Go backend architecture!
