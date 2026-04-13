# Fider API Endpoint Flow Guide: CreatePost

## Overview

This guide traces the complete flow of a **CreatePost** API endpoint, from HTTP request to database storage and response. This demonstrates the core architecture pattern used throughout Fider.

---

## 1. HTTP Route Definition

**File:** [app/cmd/routes.go](app/cmd/routes.go)

Routes are centralized in this file. The CreatePost endpoint is registered here:

```go
// POST /api/v1/posts
engine.Post("/api/v1/posts", middlewares.IsAuthenticated(), handlers.apiv1.CreatePost())
```

**Key Points:**

- `middlewares.IsAuthenticated()` ensures only logged-in users can create posts
- `handlers.apiv1.CreatePost()` returns the handler function
- Route is `POST /api/v1/posts`

---

## 2. HTTP Handler

**File:** [app/handlers/apiv1/post.go](app/handlers/apiv1/post.go) (lines 58-93)

The handler is the entry point that receives the HTTP request:

```go
// CreatePost creates a new post on current tenant
func CreatePost() web.HandlerFunc {
    return func(c *web.Context) error {
        // Step 1: Bind and validate request body
        action := new(actions.CreateNewPost)
        if result := c.BindTo(action); !result.Ok {
            return c.HandleValidation(result)
        }

        // Step 2: Upload image attachments
        if err := bus.Dispatch(c, &cmd.UploadImages{
            Images: action.Attachments,
            Folder: "attachments",
        }); err != nil {
            return c.Failure(err)
        }

        // Step 3: Create the post (business logic)
        newPost := &cmd.AddNewPost{
            Title:       action.Title,
            Description: action.Description,
        }
        err := bus.Dispatch(c, newPost)
        if err != nil {
            return c.Failure(err)
        }

        // Step 4: Attach images and add user's vote
        setAttachments := &cmd.SetAttachments{
            Post:        newPost.Result,
            Attachments: action.Attachments,
        }
        addVote := &cmd.AddVote{
            Post: newPost.Result,
            User: c.User(),
        }
        if err = bus.Dispatch(c, setAttachments, addVote); err != nil {
            return c.Failure(err)
        }

        // Step 5: Optionally assign tags
        if env.Config.PostCreationWithTagsEnabled {
            for _, tag := range action.Tags {
                assignTag := &cmd.AssignTag{Tag: tag, Post: newPost.Result}
                if err := bus.Dispatch(c, assignTag); err != nil {
                    return c.Failure(err)
                }
            }
        }

        // Step 6: Queue background task for notifications
        c.Enqueue(tasks.NotifyAboutNewPost(newPost.Result))

        // Step 7: Return response
        metrics.TotalPosts.Inc()
        return c.Ok(web.Map{
            "id":         newPost.Result.ID,
            "number":     newPost.Result.Number,
            "title":      newPost.Result.Title,
            "slug":       newPost.Result.Slug,
            "isApproved": newPost.Result.IsApproved,
        })
    }
}
```

**Handler Flow:**

1. **Bind & Validate** - Extracts data from request body using the `actions.CreateNewPost` struct
2. **Upload Resources** - Processes image attachments via bus
3. **Execute Commands** - Dispatches business logic commands
4. **Queue Tasks** - Schedules background work
5. **Return Response** - Sends JSON response with new post data

---

## 3. Request Validation (Action)

**File:** [app/actions/post.go](app/actions/post.go) (lines 16-103)

Actions are request DTO (Data Transfer Object) that validate and transform request body:

```go
// CreateNewPost is used to create a new post
type CreateNewPost struct {
    Title       string             `json:"title"`
    Description string             `json:"description"`
    TagSlugs    []string           `json:"tags"`
    Attachments []*dto.ImageUpload `json:"attachments"`

    // Prefetched data
    Tags []*entity.Tag
}

// OnPreExecute prefetches Tags for later use
func (input *CreateNewPost) OnPreExecute(ctx context.Context) error {
    if env.Config.PostCreationWithTagsEnabled {
        input.Tags = make([]*entity.Tag, 0, len(input.TagSlugs))
        for _, slug := range input.TagSlugs {
            getTag := &query.GetTagBySlug{Slug: slug}
            if err := bus.Dispatch(ctx, getTag); err != nil {
                break
            }
            input.Tags = append(input.Tags, getTag.Result)
        }
    }
    return nil
}

// IsAuthorized checks if user can perform this action
func (action *CreateNewPost) IsAuthorized(ctx context.Context, user *entity.User) bool {
    if user == nil {
        return false
    } else if env.Config.PostCreationWithTagsEnabled && !user.IsCollaborator() {
        for _, tag := range action.Tags {
            if !tag.IsPublic {
                return false
            }
        }
    }
    return true
}

// Validate checks all business rules
func (action *CreateNewPost) Validate(ctx context.Context, user *entity.User) *validate.Result {
    result := validate.Success()

    // Title validation
    re := regexp.MustCompile(`\s+`)
    normalizedTitle := strings.TrimSpace(re.ReplaceAllString(action.Title, " "))

    if normalizedTitle == "" {
        result.AddFieldFailure("title", propertyIsRequired(ctx, "title"))
    } else if len(normalizedTitle) < 10 {
        result.AddFieldFailure("title", "Title must be at least 10 characters")
    } else if len(normalizedTitle) > 100 {
        result.AddFieldFailure("title", "Title cannot exceed 100 characters")
    } else if env.Config.PostCreationWithTagsEnabled && len(action.TagSlugs) != len(action.Tags) {
        result.AddFieldFailure("tags", "Some tags are invalid")
    } else {
        // Check for duplicate titles
        err := bus.Dispatch(ctx, &query.GetPostBySlug{Slug: slug.Make(action.Title)})
        if err != nil && errors.Cause(err) != app.ErrNotFound {
            return validate.Error(err)
        } else if err == nil {
            result.AddFieldFailure("title", "A post with this title already exists")
        }
    }

    // Attachment validation
    messages, err := validate.MultiImageUpload(ctx, nil, action.Attachments, validate.MultiImageUploadOpts{
        MaxUploads:   3,
        MaxKilobytes: 5120,
        ExactRatio:   false,
    })
    if err != nil {
        return validate.Error(err)
    }
    result.AddFieldFailure("attachments", messages...)

    return result
}
```

**Validation Rules:**

- **Title**: Required, 10-100 characters, must be unique
- **Description**: Can be empty
- **Attachments**: Max 3 images, 5MB each
- **Tags**: Must be valid and public (if not collaborator)

**Example Request:**

```json
POST /api/v1/posts
{
    "title": "Add dark mode to the platform",
    "description": "Users are asking for a dark mode option to reduce eye strain.",
    "tags": ["ui-design", "dark-mode"],
    "attachments": []
}
```

---

## 4. Command (Business Logic)

**File:** [app/models/cmd/post.go](app/models/cmd/post.go) (lines 9-12)

Commands encapsulate the intent to modify data:

```go
type AddNewPost struct {
    Title       string          // Input: from request
    Description string          // Input: from request

    Result *entity.Post         // Output: created post
}
```

**Pattern:**

- **Input fields** - Data to process
- **Result field** - Output stored here after execution
- Commands are dispatched through the bus system

---

## 5. Service Implementation (Database Logic)

**File:** [app/services/sqlstore/postgres/post.go](app/services/sqlstore/postgres/post.go) (lines 236-269)

Services implement the actual business logic. When you dispatch a command, the bus routes it to the matching service handler:

```go
import "github.com/gosimple/slug"

func addNewPost(ctx context.Context, c *cmd.AddNewPost) error {
    return using(ctx, func(trx *dbx.Trx, tenant *entity.Tenant, user *entity.User) error {
        // Determine if post needs moderation approval
        isApproved := !tenant.IsModerationEnabled || !user.RequiresModeration()

        // Detect language automatically
        lang := detectPostLanguage(c.Title, c.Description)

        // Execute SQL INSERT and get the new post ID
        var id int
        err := trx.Get(&id,
            `INSERT INTO posts (
                title, slug, number, description,
                tenant_id, user_id, created_at,
                status, is_approved, language
            ) VALUES ($1, $2, (
                SELECT COALESCE(MAX(number), 0) + 1
                FROM posts p
                WHERE p.tenant_id = $4
            ), $3, $4, $5, $6, 0, $7, $8)
            RETURNING id`,
            c.Title,                           // $1: title
            slug.Make(c.Title),                // $2: slug (URL-safe version)
            c.Description,                     // $3: description
            tenant.ID,                         // $4: tenant_id (which tenant is this for)
            user.ID,                           // $5: user_id (who created it)
            time.Now(),                        // $6: created_at
            isApproved,                        // $7: is_approved
            lang,                              // $8: language
        )
        if err != nil {
            return errors.Wrap(err, "failed add new post")
        }

        // Fetch the complete post data we just created
        q := &query.GetPostByID{PostID: id}
        if err := getPostByID(ctx, q); err != nil {
            return err
        }
        c.Result = q.Result  // Store result in command

        // Auto-subscribe the creator to their own post
        if err := internalAddSubscriber(trx, q.Result, tenant, user, false); err != nil {
            return err
        }

        return nil
    })
}

// This function is called during service initialization
func init() {
    bus.Register(Service{})
}

// Service defines this handler
type Service struct{}

func (s Service) Name() string {
    return "Postgres"
}

func (s Service) Category() string {
    return "sqlstore"
}

func (s Service) Enabled() bool {
    return true
}

// Init registers all handlers
func (s Service) Init() {
    bus.AddHandler(addNewPost)  // Register the handler
}
```

**Key Points:**

1. **Transaction (`trx`)** - All database operations are wrapped in a transaction
2. **Tenant isolation** - Every operation includes `tenant_id` for multi-tenancy
3. **Automatic slug generation** - Title "Add dark mode" becomes slug "add-dark-mode"
4. **Auto-numbering** - Post numbers are auto-incremented per tenant
5. **Auto-approval** - Posts are approved or marked pending based on moderation rules
6. **Auto-subscribe** - Creator is automatically subscribed to their own post
7. **Result assignment** - The created post is stored in `c.Result` for the handler to use

---

## 6. Database Schema

**Migration File:** [migrations/201702072040_create_ideas.up.sql](migrations/201702072040_create_ideas.up.sql)

(Note: "ideas" was renamed to "posts" in a later migration)

```sql
CREATE TABLE posts (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(100) NOT NULL,
    description  TEXT NULL,
    slug         VARCHAR(100) UNIQUE,
    number       INT NOT NULL,
    tenant_id    INT NOT NULL REFERENCES tenants(id),
    user_id      INT NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status       INT NOT NULL DEFAULT 0,
    is_approved  BOOLEAN DEFAULT true,
    language     VARCHAR(10),
    -- ... other fields ...
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Key Columns:**

- `id` - Primary key
- `title` - The feature request title (max 100 chars)
- `slug` - URL-friendly version (e.g., "add-dark-mode")
- `number` - Sequential number per tenant (1, 2, 3, ...)
- `description` - Detailed description
- `tenant_id` - Which workspace/organization
- `user_id` - Who created it
- `created_at` - Timestamp
- `status` - Post status (open, approved, duplicate, etc.)
- `is_approved` - Whether it's visible (pending moderation or approved)
- `language` - Detected language

---

## 7. HTTP Response

The handler returns a JSON response to the client:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 42,
    "number": 15,
    "title": "Add dark mode to the platform",
    "slug": "add-dark-mode-to-the-platform",
    "isApproved": true
}
```

If validation fails, the response is:

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
    "errors": [
        {
            "field": "title",
            "message": "Title must be at least 10 characters"
        }
    ]
}
```

---

## Complete Request-Response Flow Diagram

```
CLIENT REQUEST
    ↓
POST /api/v1/posts
{
    "title": "Add dark mode",
    "description": "...",
    "tags": ["ui"],
    "attachments": []
}
    ↓
MIDDLEWARE
    ↓ (Checks authentication, tenant context)
HANDLER: CreatePost()
    ↓
ACTION: Bind & Validate (CreateNewPost)
    ├─ Checks title length (10-100 chars)
    ├─ Checks for duplicate titles
    ├─ Validates attachments
    └─ Prefetches tags
    ↓ (If validation fails → return 400 error)
COMMAND DISPATCH #1: UploadImages
    ↓
SERVICE: postgres.uploadImages()
    ├─ Store images in blob storage
    └─ Return image URLs
    ↓
COMMAND DISPATCH #2: AddNewPost
    ↓
SERVICE: postgres.addNewPost()
    ├─ START TRANSACTION
    ├─ Detect language
    ├─ Generate slug
    ├─ Calculate auto-number
    ├─ INSERT into posts table
    ├─ Auto-subscribe creator
    └─ COMMIT TRANSACTION
    ↓ (Store result in newPost.Result)
COMMAND DISPATCH #3: SetAttachments + AddVote
    ↓
SERVICE: postgres.setAttachments() & postgres.addVote()
    ├─ Link images to post
    └─ Record user's vote/support
    ↓
COMMAND DISPATCH #4-N: AssignTag (if tags enabled)
    ↓
SERVICE: postgres.assignTag()
    ├─ Link tags to post
    └─ Repeat for each tag
    ↓
BACKGROUND TASK
    ↓
tasks.NotifyAboutNewPost()
    ├─ (Queued, runs async)
    └─ Send notifications to followers
    ↓
METRICS
    ↓
    metrics.TotalPosts.Inc()
    ↓
RESPONSE
    ↓
{
    "id": 42,
    "number": 15,
    "title": "Add dark mode to the platform",
    "slug": "add-dark-mode-to-the-platform",
    "isApproved": true
}
```

---

## Architecture Patterns Used

### 1. **Command-Query Responsibility Segregation (CQRS)**

- **Commands** - Modify state (e.g., `AddNewPost`, `UpdatePost`)
- **Queries** - Read state (e.g., `GetPostByID`, `SearchPosts`)
- Separated into different files/packages

### 2. **Service Bus Pattern**

- Central bus dispatches commands/queries to handlers
- Handlers are registered during service initialization
- Decouples components

### 3. **Action/DTO Pattern**

- Request bodies bound to Action structs
- Actions include validation and authorization
- Separate from database entities

### 4. **Transaction Context**

- Database operations wrapped in transactions
- `using()` helper extracts transaction, tenant, user from context
- Automatic rollback on errors

### 5. **Multi-Tenancy**

- Every data operation includes `tenant_id`
- Data completely isolated per tenant
- Enforced at database level

### 6. **Async Processing**

- Heavy operations queued for background tasks
- Handler returns immediately
- Tasks run asynchronously (notifications, webhooks, etc.)

---

## Key Files Summary

| File                                                                                       | Purpose                    |
| ------------------------------------------------------------------------------------------ | -------------------------- |
| [app/cmd/routes.go](app/cmd/routes.go)                                                     | HTTP route definitions     |
| [app/handlers/apiv1/post.go](app/handlers/apiv1/post.go)                                   | HTTP handlers              |
| [app/actions/post.go](app/actions/post.go)                                                 | Validation & authorization |
| [app/models/cmd/post.go](app/models/cmd/post.go)                                           | Command definitions        |
| [app/services/sqlstore/postgres/post.go](app/services/sqlstore/postgres/post.go)           | Business logic & DB        |
| [migrations/201702072040_create_ideas.up.sql](migrations/201702072040_create_ideas.up.sql) | Database schema            |

---

## How to Test This Flow

```bash
# 1. Start the app
make watch

# 2. Get a token (login first)
TOKEN=$(curl -X POST http://localhost:3000/api/v1/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# 3. Create a post
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add dark mode to the platform",
    "description": "Users are asking for a dark mode option",
    "tags": [],
    "attachments": []
  }'

# 4. View the created post
curl http://localhost:3000/api/v1/posts?query=dark
```

---

## Next Steps

Now that you understand the flow, try:

1. **Add a new field** - Add `priority` field to CreatePost action/command/service
2. **Create a query** - Add `GetPostsByUser` query handler
3. **Add validation** - Add length check for description field
4. **Create a migration** - Add a new column to the posts table

This pattern is consistent across all Fider endpoints!
