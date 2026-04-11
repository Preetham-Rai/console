# Fider Backend - Quick Reference Guide

This is a cheat sheet for quick lookups. For detailed explanations, see the full guides.

---

## 🎯 Where to Find Everything

### Configuration & Startup

- **Entry point:** [main.go](main.go)
- **Server startup:** [app/cmd/server.go](app/cmd/server.go)
- **Environment variables:** [.example.env](.example.env)
- **Configuration loading:** [app/pkg/env/env.go](app/pkg/env/env.go)

### API Routes

- **All routes defined here:** [app/cmd/routes.go](app/cmd/routes.go)
- **HTTP Handlers (HTML/SSR):** [app/handlers/](app/handlers/)
- **JSON API Handlers:** [app/handlers/apiv1/](app/handlers/apiv1/)

### Business Logic

- **Service Bus (DI):** [app/pkg/bus/bus.go](app/pkg/bus/bus.go)
- **Database handlers:** [app/services/sqlstore/postgres/](app/services/sqlstore/postgres/)
- **Email service:** [app/services/email/](app/services/email/)
- **Blob storage:** [app/services/blob/](app/services/blob/)
- **OAuth:** [app/services/oauth/](app/services/oauth/)

### Data Models

- **Database entities:** [app/models/entity/](app/models/entity/)
- **Write commands:** [app/models/cmd/](app/models/cmd/)
- **Read queries:** [app/models/query/](app/models/query/)
- **Request DTOs:** [app/actions/](app/actions/)
- **Transfer objects:** [app/models/dto/](app/models/dto/)

### Jobs & Tasks

- **Scheduled jobs:** [app/jobs/](app/jobs/)
- **Background tasks:** [app/tasks/](app/tasks/)

### Security & Middleware

- **All middleware:** [app/middlewares/](app/middlewares/)
- **Authentication:** [app/middlewares/auth.go](app/middlewares/auth.go)
- **Session handling:** [app/middlewares/session.go](app/middlewares/session.go)
- **Tenant resolution:** [app/middlewares/tenant.go](app/middlewares/tenant.go)

### Database

- **Migrations:** [migrations/](migrations/)
- **Docker setup:** [docker-compose.yml](docker-compose.yml)

### Frontend (React TypeScript)

- **Page components:** [public/pages/](public/pages/)
- **React components:** [public/components/](public/components/)
- **API client:** [public/services/](public/services/)
- **Custom hooks:** [public/hooks/](public/hooks/)
- **Styles:** [public/assets/styles/](public/assets/styles/)

---

## 🏗️ Add a New Feature (Checklist)

### 1️⃣ Database Change (Optional)

```bash
# Create migration
touch migrations/202601041500_new_feature.up.sql
# Write SQL
# Run: make migrate
```

### 2️⃣ Define Models

```
app/models/
  ├─ entity/feature.go      ← Database table
  ├─ cmd/feature.go          ← Write operation
  ├─ query/feature.go        ← Read operations
  └─ action/feature.go       ← HTTP request input
```

### 3️⃣ Implement Business Logic

```
app/services/sqlstore/postgres/feature.go
  ├─ queryFeatures()  ← Register with bus.AddHandler
  ├─ addFeature()
  └─ (in Init()) bus.AddHandler(...)
```

### 4️⃣ Create HTTP Handler

```
app/handlers/apiv1/feature.go
  └─ GetFeatures() → Parse request → bus.Dispatch() → Return JSON
```

### 5️⃣ Register Route

```
app/cmd/routes.go
  r.Get("/api/v1/features", apiv1.GetFeatures())
```

### 6️⃣ Test

```bash
curl "http://localhost:3000/api/v1/features"
make test
make lint
```

---

## 📡 Common HTTP Response Codes

```
200  c.Ok(data)                    ✓ Success with data
201  c.Created(data)               ✓ Resource created
204  c.NoContent()                 ✓ Success, no data
400  c.BadRequest("msg")           ✗ Bad input
401  c.Unauthorized()              ✗ Not logged in
403  c.Forbidden()                 ✗ No permission
404  c.NotFound()                  ✗ Resource not found
422  c.HandleValidation(result)    ✗ Validation errors
500  c.Failure(err)                ✗ Server error (err logged)
```

---

## 🔐 Middleware Stack (Order Matters)

```go
// Global
r.Use(middlewares.CatchPanic())      // 1. Catch crashes
r.Use(middlewares.Instrumentation()) // 2. Track metrics
r.Use(middlewares.Secure())          // 3. Security headers
r.Use(middlewares.Compress())        // 4. Gzip

// Session
r.Use(middlewares.Session())         // 5. Load session

// Tenant Detection
r.Use(middlewares.WebSetup())        // 6. Setup context
r.Use(middlewares.Tenant())          // 7. Resolve tenant
r.Use(middlewares.NoIndex())         // 8. Robots.txt

// User Resolution
r.Use(middlewares.User())            // 9. Load user

// CSRF Protection
r.Use(middlewares.CSRF())            // 10. CSRF tokens

// Require Tenant & User
r.Use(middlewares.RequireTenant())   // 11. Block if no tenant
r.Use(middlewares.IsAuthenticated()) // 12. Block if not logged in
r.Use(middlewares.IsAuthorized(...)) // 13. Check role
```

---

## 🚀 Command Reference

```bash
# Development
make watch           # Hot reload server + UI
make run             # Run server (no hot reload)
make migrate         # Apply database migrations

# Testing
make test            # Run all tests (Go + JS)
make test-server     # Only backend tests
make test-ui         # Only React tests

# Code Quality
make lint            # Check formatting + linting
make build           # Production build

# Building
make build-server    # Build Go binary
make build-ui        # Build React assets
make build-ssr       # Build SSR bundle + locales
```

---

## 📝 Common Code Patterns

### Get URL Parameter

```go
number, err := strconv.Atoi(c.Param("number"))
```

### Get Query Parameter

```go
query := c.QueryParam("q")
tags := c.QueryParamAsArray("tags")
limit, _ := c.QueryParamAsInt("limit")
bool, _ := c.QueryParamAsBool("active")
```

### Get Request Body

```go
action := new(actions.CreatePost)
if result := c.BindTo(action); !result.Ok {
    return c.HandleValidation(result)
}
```

### Dispatch Command/Query

```go
query := &query.SearchPosts{Query: "bug"}
if err := bus.Dispatch(c, query); err != nil {
    return c.Failure(err)
}
// query.Result now has results
```

### Get Tenant/User from Context

```go
tenant := c.Tenant()
user := c.User()
```

### Respond with JSON

```go
return c.Ok(data)           // 200 JSON
return c.Created(data)      // 201 JSON
return c.NoContent()        // 204 No content
return c.BadRequest("msg")  // 400
return c.NotFound()         // 404
return c.Forbidden()        // 403
return c.Failure(err)       // 500
```

---

## 🗄️ Database Query Patterns

### Select Single Row

```go
err := trx.QueryRow(
    `SELECT id, name, email FROM users WHERE id = $1`,
    userID,
).Scan(&user.ID, &user.Name, &user.Email)
```

### Select Multiple Rows

```go
err := trx.Select(&users,
    `SELECT * FROM users WHERE tenant_id = $1 ORDER BY name`,
    tenantID,
)
```

### Insert Record

```go
err := trx.QueryRow(
    `INSERT INTO posts (tenant_id, title, user_id)
     VALUES ($1, $2, $3)
     RETURNING id, created_at`,
    tenantID, title, userID,
).Scan(&post.ID, &post.CreatedAt)
```

### Update Record

```go
_, err := trx.Exec(
    `UPDATE posts SET title = $1, updated_at = $2 WHERE id = $3`,
    newTitle, time.Now(), postID,
)
```

### Delete Record

```go
_, err := trx.Exec(
    `DELETE FROM posts WHERE id = $1 AND tenant_id = $2`,
    postID, tenantID,
)
```

### Count Results

```go
var count int
_ = trx.QueryRow(
    `SELECT COUNT(*) FROM posts WHERE tenant_id = $1`,
    tenantID,
).Scan(&count)
```

---

## 🔍 Debugging Tips

### View SQL Queries

Set in `.env`:

```env
LOG_SQL=true
```

All SQL queries will be logged to console.

### Check Logs

```bash
# In another terminal while server running
tail -f logs/output.log
```

### Enable Debug Logging

```env
LOG_LEVEL=DEBUG
```

### Use Postman/Thunder Client

API testing for quick endpoint testing.

### Database Inspection

```bash
# Connect to dev database
psql postgres://fider:fider_pw@localhost:5555/fider

# List tables
\dt

# Show table schema
\d posts

# Quick query
SELECT * FROM posts LIMIT 10;
```

### Check Emails (Development)

Go to `http://localhost:8025` to see captured emails in MailHog.

---

## 🧩 Integrating Third-Party Services

### Add Database Service

1. Create [app/services/newsvc/](app/services/newsvc/)
2. Implement `Service` interface:
   ```go
   func (s Service) Name() string { return "MyService" }
   func (s Service) Category() string { return "category" }
   func (s Service) Enabled() bool { return os.Getenv("MYSVC_ENABLED") == "true" }
   func (s Service) Init() { bus.AddHandler(...) }
   ```
3. Register in [app/cmd/server.go](app/cmd/server.go) with `_ "github.com/getfider/fider/app/services/newsvc"`

### Add Email Provider

1. Copy [app/services/email/smtp/](app/services/email/smtp/) structure
2. Implement email sending logic
3. Register service same as above

### Add OAuth Provider

1. Copy [app/services/oauth/google/](app/services/oauth/google/) pattern
2. Add env variables
3. Register in [app/cmd/routes.go](app/cmd/routes.go)

---

## 📊 Performance Optimization

### Database Connection Pool

```env
DATABASE_MAX_IDLE_CONNS=2      # Min connections
DATABASE_MAX_OPEN_CONNS=4      # Max connections
```

Tune based on expected load.

### Enable HTTP Caching

```go
r.Use(middlewares.ClientCache(24 * time.Hour))  // 1 day cache
```

### Use Indexes

```sql
CREATE INDEX idx_posts_tenant_status ON posts(tenant_id, status);
CREATE INDEX idx_comments_post ON comments(post_id);
```

### Batch Operations

Instead of:

```go
for _, id := range ids {
    updatePost(id)  // N queries
}
```

Do:

```go
UPDATE posts SET status = $1 WHERE id = ANY($2)  // 1 query
```

---

## 🐛 Common Issues & Solutions

### "tenant not found"

- Check HOST_MODE environment variable
- Verify subdomain/domain mapping in database

### Database migration fails

- Check migration file syntax
- Ensure migration hasn't been run before
- Check PostgreSQL version compatibility

### JWT token invalid

- Check JWT_SECRET is consistent
- Check token expiration date
- Clear browser cookies

### "unauthorized" on routes that should work

- Verify middleware order in routes.go
- Check user role assignment
- Verify CSRF token if POST request

### Port 3000 already in use

- Change PORT env var: `PORT=3001 make watch`
- Or kill process: `lsof -i :3000`

---

## 📚 Resources In This Project

1. **[BACKEND_ARCHITECTURE_GUIDE.md](BACKEND_ARCHITECTURE_GUIDE.md)** - Full detailed explanation (start here!)
2. **[ARCHITECTURE_VISUALS.md](ARCHITECTURE_VISUALS.md)** - Flow diagrams and visual references
3. **[LEARNING_BY_EXAMPLES.md](LEARNING_BY_EXAMPLES.md)** - Code examples for common tasks
4. **[CLAUDE.md](CLAUDE.md)** - Original architecture patterns (AI summary)

---

## 🎓 Learning Order

1. Read [BACKEND_ARCHITECTURE_GUIDE.md](BACKEND_ARCHITECTURE_GUIDE.md) - Understand architecture
2. Review [ARCHITECTURE_VISUALS.md](ARCHITECTURE_VISUALS.md) - See the flow
3. Study [LEARNING_BY_EXAMPLES.md](LEARNING_BY_EXAMPLES.md) - Learn by coding
4. Pick a feature and implement it:
   - Find similar feature in codebase
   - Copy the pattern
   - Run `make watch`
   - Make changes
   - Test with curl/Postman
   - Run `make lint` and `make test`

---

## 💡 Key Takeaways for Go Backend Development

1. **Layered Architecture** - Each layer has single responsibility
2. **Service Bus** - Inject dependencies, decouple layers
3. **Middleware Chain** - Build security progressively
4. **CQRS Pattern** - Separate reads (queries) and writes (commands)
5. **Error Handling** - Wrap errors with context
6. **Validation** - Validate at HTTP handler level
7. **Transactions** - Use transactions for multi-step operations
8. **Testing** - Write tests for each layer
9. **Logging** - Add structured logging for debugging
10. **Documentation** - Document why, not just what

---

This quick reference should help you navigate the codebase efficiently!
