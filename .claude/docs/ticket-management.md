# Ticket Management with Notion

> Detailed guide for managing Epics, User Stories, and Tasks in Notion workspace

**CRITICAL**: All planning work (Epics, User Stories, Tasks - collectively "tickets") is now managed in **Notion**, not in local markdown files.

## Notion Workspace

**Access**: [warrendeleon RN app Notion Workspace](https://notion.so/2a93743a097c8005a22cf96220612894)

**Databases**:

- 🎯 **Epics** - High-level business initiatives
- 📖 **User Stories** - User-facing features/improvements
- ✅ **Tasks** - Technical implementation work (PRIMARY for Kanban)

**Relations**: Epic ↔ User Stories ↔ Tasks (fully linked)

## Terminology

- **Epic** = Large body of work spanning multiple sprints
- **User Story** = User-facing feature or improvement
- **Task** = Technical implementation work
- **Ticket** = Generic term for any of the above

## Viewing Work (Kanban Boards)

**7 Specialized Kanban Boards** (configure in Notion UI):

1. **🎯 Master Task Board** - All tasks across project
   - Columns: To Do | In Progress | In Review | Done | Blocked
   - Filter: Show last 30 days of completed

2. **👤 My Tasks** - Your assigned work
   - Filter: Assigned To = Me

3. **🎯 Epic Boards** (4 separate) - Tasks per Epic
   - Group by: User Story
   - Filter by Epic

4. **📖 Story Board** - Tasks grouped by Story
   - Swim lanes per story

5. **🔥 Priority Board** - Critical/High only
   - Filter: Priority IN [Critical, High]

6. **👀 Review Pipeline** - Code review workflow
   - Columns: Draft PR | Ready | In Review | Approved | Merged

7. **🚨 Blocked Board** - All blocked items
   - Sort by: Days blocked (oldest first)

**Note**: Use Notion UI to create these views manually (API limitations prevent automated view creation)

## Creating Tickets

### Via Notion UI (Recommended)

- Click "+ New" in relevant database
- Fill properties
- Link to Epic/Story using relations

### Via Commands (Coming Soon)

- `/create-epic [title]` - Create Epic
- `/create-story [epic-id] [title]` - Create Story
- `/create-task [story-id] [title]` - Create Task

### Via MCP Tool (Direct)

```typescript
mcp__notion__notion -
  create -
  pages({
    parent: { data_source_id: '99945d6d-81ed-4d1f-a037-7769475db44d' }, // Tasks DB
    pages: [
      {
        properties: {
          'Task ID': 'TASK-035',
          Title: 'Task title',
          Status: 'To Do',
          Priority: 'High',
          // ... other properties
        },
      },
    ],
  });
```

## Updating Tickets

### Status Changes (Auto-logged)

- Status changes automatically logged to "Status History"
- Timestamp and user recorded

### Work Logging (Manual)

- Use "Work Log" property for significant updates
- Format: `[YYYY-MM-DD HH:MM] @user: Description of work`
- Add when completing meaningful work, not every small change

### Via Notion UI

- Open ticket → Edit properties → Save

### Via Commands (Coming Soon)

- `/update-ticket [ID] [field] [value]` - Update property
- `/block-ticket [ID] [reason]` - Mark as blocked
- `/complete-ticket [ID]` - Mark as done

## Key Properties

### All Tickets

- Status (select)
- Priority (Critical/High/Medium/Low)
- Category (multi-select tags)
- Created/Start/Completed Dates
- Status History (auto-logged)

### Tasks (Kanban items)

- Story Points (0.5, 1, 2, 3, 5)
- Branch Name (format: `feature/TASK-XXX-title`)
- PR Link + PR Status
- Code Coverage %
- Assigned To, Reviewer
- Definition of Ready/Done (checkboxes)
- Work Log (manual developer notes)

## Planning Workflow

**For new features**:

1. Create Epic with business value
2. Break into 3-5 User Stories
3. Break stories into 5-10 Tasks each
4. Set priorities and story points
5. Assign to team members
6. Tasks appear on relevant Kanban boards

**DO NOT**:

- ❌ Create markdown files in `/docs/planning/` (removed)
- ❌ Update local planning files
- ❌ Use git for ticket tracking

**ALWAYS**:

- ✅ Create/update in Notion
- ✅ Use Kanban boards for daily work
- ✅ Link PRs to tasks (PR Link property)
- ✅ Log significant work in Work Log

## Custom Notion API Implementation

**⚠️ IMPORTANT**: DO NOT use the built-in `mcp__notion__*` MCP tools - they have major bugs.

**Use Instead**: Custom Notion API implementation in `.claude/notion-workspace-builder/`

**Best for**:

- Creating/updating tickets programmatically (Epics, User Stories, Tasks)
- Searching workspace content
- Fetching page/database schemas and content
- Batch operations on tickets
- Syncing documentation between git and Notion
- Converting Notion pages to PDF/HTML/Markdown

**Custom Implementation Features**:

- **Async operations** with 2-3x better performance
- **Batch operations** for bulk updates
- **Notion Markdown converter** for bidirectional sync
- **PDF generation** from Notion pages with proper styling
- **Emoji rendering** (Apple emoji support)
- **Cache management** for faster page retrieval

**Key Files**:

- `async_notion_api.py` - Core async Notion API wrapper
- `notion_markdown_converter.py` - Convert Notion ↔ Markdown
- `notion_to_pdf.py` - Generate PDFs from Notion pages
- `build_workspace.py` - Workspace setup automation
- `config.py` - Configuration (API keys, database IDs)

**When to use**:

- ✅ Automating ticket creation from planning sessions
- ✅ Bulk updating ticket properties (status, priority, assignments)
- ✅ Generating documentation from Notion content
- ✅ Syncing planning docs between git and Notion
- ✅ Batch operations requiring performance

**When NOT to use**:

- ❌ Simple single-ticket updates (use Notion UI instead)
- ❌ For casual browsing (use Notion UI)
- ❌ When the built-in Notion MCP would be faster (currently: never, due to bugs)

**Documentation**: See `.claude/notion-workspace-builder/README.md` and related docs
