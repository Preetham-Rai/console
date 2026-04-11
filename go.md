# Fider Go Backend - Complete Architecture Guide

This guide explains every part of the Fider backend application. It's designed to help you understand how a production-grade Go backend is structured.

---

## 🚀 Quick Execution Flow

When you type `make watch`:

1. **main.go** - Entry point that starts `cmd.RunServer()`
2. **app/cmd/server.go** - Initializes services (database, email, logging, etc)
3. **app/cmd/routes.go** - Registers all HTTP endpoints
4. **Port 3000** - Server listens and handles requests
5. **Handlers** - Process requests and call business logic
6. **Database** - PostgreSQL stores all data

---

## 📁 Part 1: Entry Point & Server Startup

### [main.go](main.go) - The Application Entry Point

```go
func main() {
    args := os.Args[1:]
    if len(args) > 0 && args[0] == "ping" {
        os.Exit(cmd.RunPing())  // Health check command
    } else if len(args) > 0 && args[0] == "migrate" {
        os.Exit(cmd.RunMigrate())  // Database migration command
    } else {
        os.Exit(cmd.RunServer())  // Start the server
    }
}
```

**What it does:** Main entry point that accepts 3 commands:

- `./fider` → Starts the server
- `./fider migrate` → Runs database migrations
- `./fider ping` → Health check

---

## 🏗️ Part 2: Server Configuration

### [.example.env](.example.env) - Entire Configuration

All environment variables are defined here. Copy to `.env` for local development.

**Key Configuration:**

```env
# Server settings
BASE_URL=http://localhost:3000      # Public URL
PORT=3000                            # Server port
GO_ENV=development                   # development or production

# Database
DATABASE_URL=postgres://user:pass@host:5555/fider?sslmode=disable
DATABASE_MAX_IDLE_CONNS=2
DATABASE_MAX_OPEN_CONNS=4

# JWT for authentication
JWT_SECRET=your-secret-here

# Email (SMTP)
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025
EMAIL_NOREPLY=noreply@yourdomain.com

# OAuth (Optional)
OAUTH_GOOGLE_CLIENTID=...
OAUTH_GITHUB_CLIENTID=...

# Logging
LOG_LEVEL=DEBUG
LOG_CONSOLE=true
LOG_SQL=true
```

**How it's loaded:** In [app/pkg/env/env.go](app/pkg/env/env.go) using `envdecode` package, which automatically parses and validates env vars.

---

## 🎯 Part 3: Server Initialization

### [app/cmd/server.go](app/cmd/server.go) - Server Startup Logic

```go
func RunServer() int {
    // 1. Initialize all services (database, email, logging, cache, etc)
    svcs := bus.Init()

    // 2. Start scheduled jobs (cron tasks)
    startJobs(ctx)

    // 3. Register all HTTP routes
    e := routes(web.New())

    // 4. Start listening on port
    go e.Start(env.Config.Host + ":" + env.Config.Port)

    // 5. Listen for shutdown signals
    return listenSignals(e)
}
```

**Service Initialization Flow:**

The `bus.Init()` initializes several services:

- **SQLStore (PostgreSQL)** - Database connection pool
- **Email (SMTP/Mailgun)** - Email sending
- **Blob Storage (S3/Filesystem)** - File uploads
- **Logging (Console/File)** - Application logs
- **OAuth** - Social login providers
- **HTTP Client** - External API calls
- **Webhooks** - Event publishing

These are registered via underscore imports in [server.go](app/cmd/server.go):

```go
_ "github.com/getfider/fider/app/services/email/smtp"
_ "github.com/getfider/fider/app/services/sqlstore/postgres"
_ "github.com/getfider/fider/app/services/blob/s3"
```

---

## 📡 Part 4: API Routes & Endpoints

### [app/cmd/routes.go](app/cmd/routes.go) - All HTTP Routes Defined Here

This file is the **central registry of every API endpoint**. It's organized by middleware requirements:

#### **Stage 1: Public Routes (No Auth Required)**

```go
r.Get("/_health", handlers.Health())  // Health check
r.Get("/robots.txt", handlers.RobotsTXT())
r.Get("/privacy", handlers.LegalPage(...))  // Legal pages
```

#### **Stage 2: Tenant Detection**

These routes require a valid tenant but NO authentication:

```go
r.Use(middlewares.RequireTenant())  // Verify tenant exists

r.Get("/", handlers.Index())  // List posts
r.Get("/posts/:number", handlers.PostDetails())  // View single post

// Public API endpoints (read-only)
publicApi := r.Group()
{
    publicApi.Get("/api/v1/posts", apiv1.SearchPosts())
    publicApi.Get("/api/v1/posts/:number/comments", apiv1.ListComments())
    publicApi.Get("/api/v1/tags", apiv1.ListTags())
}
```

#### **Stage 3: Authenticated Routes (Login Required)**

```go
r.Use(middlewares.IsAuthenticated())  // User must be logged in

ui := r.Group()
{
    ui.Get("/settings", handlers.UserSettings())
    ui.Post("/_api/user/settings", handlers.UpdateUserSettings())
}
```

#### **Stage 4: Collaborator/Admin Routes**

```go
ui.Use(middlewares.IsAuthorized(enum.RoleCollaborator, enum.RoleAdministrator))

ui.Get("/admin", handlers.GeneralSettingsPage())
ui.Post("/_api/admin/settings/general", handlers.UpdateSettings())
```

#### **Stage 5: Admin-Only Routes**

```go
ui.Use(middlewares.IsAuthorized(enum.RoleAdministrator))

ui.Get("/admin/export/posts.csv", handlers.ExportPostsToCSV())
ui.Post("/_api/admin/roles/:role/users", handlers.ChangeUserRole())
```

**Key Pattern:** Routes are layered - each middleware layer adds a requirement, creating a security hierarchy.

---

## 🔌 Part 5: HTTP Request Flow

### Request Lifecycle:

```
HTTP Request
    ↓
Middleware Chain (top to bottom):
  ├─ CatchPanic() - Catch panics
  ├─ Instrumentation() - Metrics & logging
  ├─ Secure() - Security headers
  ├─ Compress() - Gzip compression
  ├─ Session() - Load user session
  ├─ Maintenance() - Check maintenance mode
  ├─ WebSetup() - Setup template data
  ├─ Tenant() - Resolve tenant from URL/domain
  ├─ NoIndex() - Set no-index headers
  ├─ User() - Load User object
  ├─ CSRF() - CSRF protection
  ├─ RequireTenant() - Block if no tenant
  ├─ BlockPendingTenants() - Block pending tenants
  ├─ CheckTenantPrivacy() - Block private tenants
  ├─ IsAuthenticated() - Block non-logged-in users
  └─ IsAuthorized() - Check user role
    ↓
Handler Function
```

### Example Middleware - [app/middlewares/auth.go](app/middlewares/auth.go)

```go
// IsAuthenticated - blocks requests if user not logged in
func IsAuthenticated() web.MiddlewareFunc {
    return func(next web.HandlerFunc) web.HandlerFunc {
        return func(c *web.Context) error {
            if !c.IsAuthenticated() {
                return c.Unauthorized()  // 401 error
            }
            return next(c)  // Continue to next handler
        }
    }
}

// IsAuthorized - checks if user has required role
func IsAuthorized(roles ...enum.Role) web.MiddlewareFunc {
    return func(next web.HandlerFunc) web.HandlerFunc {
        return func(c *web.Context) error {
            user := c.User()
            for _, role := range roles {
                if user.Role == role {
                    return next(c)  // User has required role
                }
            }
            return c.Forbidden()  // 403 error
        }
    }
}
```

---

## 🎛️ Part 6: Handlers - Processing Requests

Handlers receive requests and return responses. They're in [app/handlers/](app/handlers/) and [app/handlers/apiv1/](app/handlers/apiv1/).

### Simple Handler Pattern

**[app/handlers/apiv1/post.go](app/handlers/apiv1/post.go) - SearchPosts endpoint**

```go
// SearchPosts returns posts matching criteria
func SearchPosts() web.HandlerFunc {
    return func(c *web.Context) error {
        // 1. Get query parameters
        searchPosts := &query.SearchPosts{
            Query: c.QueryParam("query"),
            View:  c.QueryParam("view"),
            Limit: c.QueryParam("limit"),
            Tags:  c.QueryParamAsArray("tags"),
        }

        // 2. Dispatch query to business logic (bus)
        if err := bus.Dispatch(c, searchPosts); err != nil {
            return c.Failure(err)  // Error handling
        }

        // 3. Return JSON response
        return c.Ok(searchPosts.Result)
    }
}
```

**Called via:**

```
GET /api/v1/posts?query=bug&limit=10&tags=urgent
```

### Complex Handler Pattern

**[app/handlers/apiv1/post.go](app/handlers/apiv1/post.go) - CreatePost endpoint**

```go
func CreatePost() web.HandlerFunc {
    return func(c *web.Context) error {
        // 1. Parse JSON request body into action
        action := new(actions.CreateNewPost)
        if result := c.BindTo(action); !result.Ok {
            return c.HandleValidation(result)  // Validation errors
        }

        // 2. Upload attachments
        if err := bus.Dispatch(c, &cmd.UploadImages{
            Images: action.Attachments,
            Folder: "attachments",
        }); err != nil {
            return c.Failure(err)
        }

        // 3. Execute command to create post
        newPost := &cmd.AddNewPost{
            Title:       action.Title,
            Description: action.Description,
        }
        err := bus.Dispatch(c, newPost)
        if err != nil {
            return c.Failure(err)
        }

        // 4. Return created post
        return c.Ok(newPost.Result)
    }
}
```

**Called via:**

```
POST /api/v1/posts
{
    "title": "Bug: Login page broken",
    "description": "I can't log in",
    "attachments": [...]
}
```

---

## 💼 Part 7: The Service Bus (Dependency Injection)

The **Service Bus** in [app/pkg/bus/bus.go](app/pkg/bus/bus.go) is the core pattern that handles:

- Command execution (writes to database)
- Query execution (reads from database)
- Event publishing
- Dependency injection

### How It Works

```go
// 1. Define a Query or Command
type SearchPosts struct {
    Query  string              // Input
    Result []*entity.Post      // Output
}

// 2. Register a handler
func searchPosts(ctx context.Context, q *SearchPosts) error {
    // Database query logic here
    q.Result = []*entity.Post{...}
    return nil
}

// 3. In Init(), register handler
func (s Service) Init() {
    bus.AddHandler(searchPosts)
}

// 4. In handler, dispatch it
query := &SearchPosts{Query: "bug"}
bus.Dispatch(ctx, query)  // Calls searchPosts() automatically
fmt.Println(query.Result)  // Results populated!
```

**Why this pattern?**

- ✅ Decouples HTTP handlers from business logic
- ✅ Easy to test - mock bus or inject different handlers
- ✅ Organized - all logic is in well-named queries/commands
- ✅ Reusable - same query used in multiple endpoints

---

## 🗄️ Part 8: Database Configuration & Migrations

### Port & Connection

```env
DATABASE_URL=postgres://fider:fider_pw@localhost:5555/fider?sslmode=disable
DATABASE_MAX_IDLE_CONNS=2      # Connection pool size
DATABASE_MAX_OPEN_CONNS=4
```

**Docker Setup** - [docker-compose.yml](docker-compose.yml)

```yaml
pgdev:
  image: postgres:17
  ports:
    - "5555:5432" # Port 5555 on host → 5432 in container
  environment:
    POSTGRES_USER: fider
    POSTGRES_PASSWORD: fider_pw
```

**Connection Logic** - [app/services/sqlstore/postgres](app/services/sqlstore/postgres)

### Database Migrations

Migrations are in [migrations/](migrations/) folder. Each file is:

```
YYYYMMDDHHMMSS_description.sql
```

Example: `201702072040_create_ideas.up.sql`

```sql
CREATE TABLE ideas (
    id SERIAL PRIMARY KEY,
    number BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status INT NOT NULL DEFAULT 0,
    user_id INT NOT NULL REFERENCES users(id),
    tenant_id INT NOT NULL REFERENCES tenants(id),
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_ideas_number ON ideas(tenant_id, number);
CREATE INDEX idx_ideas_slug ON ideas(tenant_id, slug);
```

**Run Migrations:**

```bash
make migrate  # Runs: ./fider migrate
```

This uses [app/cmd/migrate.go](app/cmd/migrate.go) to apply all pending migrations.

### Database Query Example - [app/services/sqlstore/postgres/post.go](app/services/sqlstore/postgres/post.go)

```go
func searchPosts(ctx context.Context, q *query.SearchPosts) error {
    return using(ctx, func(trx *dbx.Trx, tenant *entity.Tenant, user *entity.User) error {
        q.Result = []*entity.Post{}
        return trx.Select(&q.Result,
            `SELECT id, number, title, slug, description, status, ...
             FROM posts
             WHERE tenant_id = $1
             AND title ILIKE $2
             AND status IN (...)
             LIMIT $3`,
            tenant.ID, "%"+q.Query+"%", q.Limit,
        )
    })
}
```

**Key Pattern:**

- `using()` - Wraps database transaction
- `tenant` & `user` - Already resolved from context
- `trx.Select()` - Run query and scan results

---

## ⏰ Part 9: Scheduled Jobs (Cron Tasks)

Jobs run on a schedule in [app/jobs/](app/jobs/).

### Job Registration - [app/cmd/server.go](app/cmd/server.go)

```go
func startJobs(ctx context.Context) {
    c := cron.New()

    // Add jobs with cron schedule
    c.AddJob(jobs.NewJob(ctx, "PurgeExpiredNotificationsJob",
        jobs.PurgeExpiredNotificationsJobHandler{}))
    c.AddJob(jobs.NewJob(ctx, "EmailSupressionJob",
        jobs.EmailSuppressionJobHandler{}))

    c.Start()  // Start scheduler
}
```

### Job Implementation - [app/jobs/purge_notifications_job.go](app/jobs/purge_notifications_job.go)

```go
type PurgeExpiredNotificationsJobHandler struct {}

// Schedule - when to run (cron format)
func (e PurgeExpiredNotificationsJobHandler) Schedule() string {
    return "0 0 * * * *"  // Run every hour at minute 0
}

// Run - the actual job logic
func (e PurgeExpiredNotificationsJobHandler) Run(ctx Context) error {
    log.Debug(ctx, "deleting notifications older than 1 year")

    // Dispatch command through bus
    c := &cmd.PurgeExpiredNotifications{}
    err := bus.Dispatch(ctx, c)
    if err != nil {
        return err
    }

    log.Debugf(ctx, "@{RowsDeleted} notifications were deleted",
        dto.Props{"RowsDeleted": c.NumOfDeletedNotifications})

    return nil
}
```

**Cron Schedule Format:**

```
"0 0 * * * *"  → Run at 00:00 every day
"0 * * * * *"   → Run every hour
"*/30 * * * *"  → Run every 30 minutes
```

---

## 📧 Part 10: Email Service

Email configuration in [.example.env](.example.env):

```env
EMAIL_NOREPLY=noreply@yourdomain.com

# SMTP (development)
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025

# Or Mailgun (production)
# EMAIL_MAILGUN_API=your-key
# EMAIL_MAILGUN_DOMAIN=mg.yourdomain.com
```

**Service Location:** [app/services/email/](app/services/email/)

**Usage in Code:**

```go
cmd := &cmd.SendEmail{
    To: user.Email,
    Subject: "Welcome to Fider",
    Template: "welcome_email",
}
bus.Dispatch(ctx, cmd)
```

**Development:** Emails are captured by MailHog at `http://localhost:8025`

---

## 🔐 Part 11: Authentication & JWT

### JWT Configuration

```env
JWT_SECRET=your-secret-key-here  # Used to sign tokens
```

### Authentication Flow

1. **Login Request** → [app/handlers/signin.go](app/handlers/signin.go)

   ```go
   handler.SignInByEmail()  // Create session with JWT
   ```

2. **JWT in Cookie**
   - Token signed with `JWT_SECRET`
   - Stored in `fider-user` cookie
   - Sent with every request

3. **Middleware Validation** → [app/middlewares/auth.go](app/middlewares/auth.go)

   ```go
   IsAuthenticated()  // Checks if user has valid token
   ```

4. **User Resolution** → [app/middlewares/user.go](app/middlewares/user.go)
   - Reads JWT from cookie
   - Validates signature
   - Sets `c.User()` for use in handlers

---

## 🏢 Part 12: Multi-Tenant Architecture

Each Fider instance can host multiple "tenants" (like multiple Slack workspaces).

### Tenant Resolution - [app/middlewares/tenant.go](app/middlewares/tenant.go)

Fider detects tenant from:

1. **Subdomain:** `acme.yourdomain.com` → tenant = "acme"
2. **Domain:** `acme.com` → maps to tenant via CNAME
3. **Path:** `/t/acme` → tenant = "acme" (single-domain mode)

### Tenant Object

```go
type Tenant struct {
    ID            int
    Name          string      // "acme"
    Subdomain     string      // "acme" (if using subdomains)
    CNAME         string      // "acme.com" (if using custom domain)
    Status        TenantStatus
    IsPrivate     bool
    CustomCSS     string
}
```

### Database Per Tenant

All data includes `tenant_id`:

```sql
SELECT * FROM posts WHERE tenant_id = $1
```

This ensures data isolation - tenant "acme" never sees tenant "beta" data.

---

## 🛠️ Part 13: Models - CQRS Pattern

Models are organized in [app/models/](app/models/):

### [app/models/entity/](app/models/entity/) - Database Tables

```go
type Post struct {
    ID          int
    Number      int
    Title       string
    Slug        string
    Description string
    CreatedAt   time.Time
    Status      enum.PostStatus
    UserID      int
    User        *User
    // ... more fields
}
```

**Purpose:** Represent database rows. Only read/write from these.

### [app/models/cmd/](app/models/cmd/) - Commands (Write Operations)

```go
// Input + Output for writing data
type AddNewPost struct {
    Title       string          // Input
    Description string

    Result *entity.Post        // Output after creation
}
```

**Purpose:** Execute commands that modify database state.

### [app/models/query/](app/models/query/) - Queries (Read Operations)

```go
// Input + Output for reading data
type SearchPosts struct {
    Query  string              // Input
    Limit  int

    Result []*entity.Post      // Output after query
}
```

**Purpose:** Execute queries that fetch data without modifying it.

### [app/models/action/](app/models/action/) - HTTP Request DTOs

```go
// What the client sends in HTTP request body
type CreateNewPost struct {
    Title       string   `json:"title" validate:"required"`
    Description string   `json:"description"`
    Attachments []string `json:"attachments"`
}
```

**Purpose:** Validation and binding of incoming HTTP requests.

### [app/models/dto/](app/models/dto/) - Data Transfer Objects

```go
// Custom data transfer between packages
type PostInfo struct {
    Title     string
    AuthorName string
    Status    string
}
```

**Purpose:** When you need to return different data structure than entity.

---

## 🧪 Testing

### Run All Tests

```bash
make test           # Run both backend and frontend tests
make test-server    # Only server tests
make test-ui        # Only React tests
```

### Unit Test Example

Tests are in same directory as code with `_test.go` suffix:

```go
// app/handlers/post_test.go
func TestPostHandler(t *testing.T) {
    svcs := bus.Init(testService)

    c := NewContext(Request{...})

    err := SearchPosts()(c)

    assert.NoError(t, err)
    assert.Equal(t, 1, len(c.Result()))
}
```

---

## 📊 Metrics & Monitoring

### Metrics Endpoint

```env
METRICS_ENABLED=true
METRICS_PORT=4000
```

Prometheus metrics available at `http://localhost:4000/metrics`

### Instrumentation Middleware

Tracks:

- HTTP request duration
- Response status codes
- Request count
- Database query time

---

## 🚨 Error Handling

### Pattern 1: Return Error

```go
if err != nil {
    return c.Failure(err)  // Returns 400 with error message
}
```

### Pattern 2: Return Status Code

```go
if !c.IsAuthenticated() {
    return c.Unauthorized()  // Returns 401
}

if !hasPermission {
    return c.Forbidden()     // Returns 403
}
```

### Pattern 3: Validation Errors

```go
if result := c.BindTo(action); !result.Ok {
    return c.HandleValidation(result)  // Returns 422 with field errors
}
```

---

## 📚 Logging

### Configuration

```env
LOG_LEVEL=DEBUG         # DEBUG, INFO, WARN, ERROR
LOG_CONSOLE=true        # Output to console
LOG_SQL=true            # Log all SQL queries
LOG_FILE=false          # Output to file
LOG_FILE_OUTPUT=logs/output.log
```

### Usage in Code

```go
import "github.com/getfider/fider/app/pkg/log"

log.Debug(ctx, "starting job")
log.Infof(ctx, "created post @{PostID}", dto.Props{"PostID": 123})
log.Warn(ctx, "unusual activity detected")
log.Error(ctx, "database connection failed")
```

---

## 🔄 Development Workflow

### 1. Add Database Change

Create migration file:

```sql
-- migrations/202601041500_add_new_column.up.sql
ALTER TABLE posts ADD COLUMN new_field VARCHAR(255);
```

Run:

```bash
make migrate
```

### 2. Add API Endpoint

1. **Define route** in [app/cmd/routes.go](app/cmd/routes.go)
2. **Create handler** in [app/handlers/apiv1/](app/handlers/apiv1/)
3. **Define model** in [app/models/](app/models/)
4. **Implement business logic** in [app/services/sqlstore/postgres/](app/services/sqlstore/postgres/)

### 3. Run with Hot Reload

```bash
make watch  # Rebuilds on any file change
```

### 4. Test & Format

```bash
make test   # Run all tests
make lint   # Check formatting
```

---

## 🎓 Key Takeaways for Learning Go Backend Development

1. **Layered Architecture** → Each layer has a clear responsibility
2. **Service Bus Pattern** → Decouple handlers from business logic
3. **Middleware Chain** → Build security and functionality progressively
4. **CQRS Pattern** → Separate read (queries) and write (commands)
5. **Dependency Injection** → Easy to test, swap implementations
6. **Environment Config** → 12-factor app methodology
7. **Database Migrations** → Version control for schema
8. **Error Handling** → Always propagate and log errors
9. **Auth/Authorization** → Layer security at middleware level
10. **Mass-Assignment** → Use DTO + action objects, never trust input

---

## 📁 File Reference Quick Link

- **Entry:** [main.go](main.go)
- **Server:** [app/cmd/server.go](app/cmd/server.go)
- **Routes:** [app/cmd/routes.go](app/cmd/routes.go)
- **Handlers:** [app/handlers/](app/handlers/) & [app/handlers/apiv1/](app/handlers/apiv1/)
- **Models:** [app/models/](app/models/)
- **Services/Logic:** [app/services/](app/services/)
- **Jobs:** [app/jobs/](app/jobs/)
- **Middleware:** [app/middlewares/](app/middlewares/)
- **Bus System:** [app/pkg/bus/](app/pkg/bus/)
- **Config:** [.example.env](.example.env) & [app/pkg/env/env.go](app/pkg/env/env.go)
- **Database:** [migrations/](migrations/) & [docker-compose.yml](docker-compose.yml)
