# FlightControl

An alignment tracking tool that continuously compares GitHub repository state to project plans. After each commit, it analyzes what exists in the repo, compares to the plan, and handles three outcomes: misalignment (guided conversations), alignment (mark complete), or partial completion (create substeps).

## Features

- **Continuous Alignment Tracking**: Automatically checks alignment after every commit
- **Multi-Level Comparison**: Analyzes at step → feature → file levels
- **Impact Analysis**: Analyzes scope, timeline, dependencies, and quality impacts
- **Guided Conversations**: Facilitates discussions when misalignment is detected
- **Partial Completion Detection**: Identifies missing pieces and creates substeps
- **Cursor Prompt Generation**: Generates ready-to-use prompts for Cursor IDE

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui components + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password, no verification)
- **GitHub**: GitHub MCP server integration
- **AI**: OpenAI API (user-selectable model)

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- OpenAI API key
- GitHub MCP server (or configure GitHub API access)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flightcontrol
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_SERVICE_KEY=your_openai_service_key
GITHUB_MCP_SERVER_URL=your_github_mcp_server_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - Configure email/password auth (disable email verification in Supabase dashboard)

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:
- `projects` - GitHub repositories being tracked
- `project_plans` - Project plans with versioning
- `plan_steps` - Individual steps in a plan (supports substeps)
- `repo_snapshots` - Snapshots of repository state
- `commits` - Commit records with alignment status
- `alignment_checks` - Alignment check results
- `misalignment_conversations` - Conversation records for misalignments
- `plan_updates` - Plan update suggestions and approvals
- `cursor_prompts` - Generated Cursor prompts
- `chat_messages` - Chat message history

## Usage

1. **Register/Login**: Create an account or sign in
2. **Create Project**: Select a GitHub repository to track
3. **Initialize Plan**: AI generates an initial project plan from repository analysis
4. **Track Commits**: Webhooks automatically track commits and perform alignment checks
5. **Review Alignment**: View alignment dashboard to see how commits align with the plan
6. **Handle Misalignment**: Answer questions and approve plan updates when misalignment is detected
7. **Generate Prompts**: Get Cursor-ready prompts for the current step

## Project Structure

```
flightcontrol/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   ├── projects/         # Project components
│   └── ...
├── lib/                   # Library code
│   ├── supabase/         # Supabase clients
│   ├── github/           # GitHub MCP integration
│   ├── openai/           # OpenAI integration
│   ├── alignment/        # Alignment engine
│   └── db/               # Database queries
├── contexts/             # React contexts
├── types/                # TypeScript types
└── supabase/             # Database migrations
```

## Development

### Running Tests

```bash
pnpm lint
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Deployment

The application is configured for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## License

MIT
