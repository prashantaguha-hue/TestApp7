import type { BubbleSuggestion, Persona, PersonaId } from '../types/persona'

const NEW_USER_BUBBLES: BubbleSuggestion[] = [
  {
    prompt: 'What is Hypersync',
    answer:
      "Hypersync is an integration platform that keeps data flowing automatically between the tools your company already uses — HRMS, payroll, ticketing, and more. Instead of manually exporting and re-uploading files, you connect two systems once and Hypersync keeps them in sync going forward.\n\nA few things it takes care of for you:\n- Detecting new or changed records and pushing them to the right destination\n- Flagging sync issues (expired credentials, mismatched fields) before they cause problems\n- Giving admins visibility into every connection through analytics and logs",
    cta: { label: 'Add a connection', action: 'connection' },
  },
  {
    prompt: 'What is a Connection',
    answer:
      "A Connection is a link between two systems — for example, your HRMS and your payroll provider — that Hypersync uses to move data back and forth on a schedule you define.\n\nEach connection has:\n- A source and a destination system\n- A data model describing which fields map to which\n- A sync schedule and health status you can monitor from the dashboard\n\nOnce a connection is set up, Hypersync handles the ongoing sync automatically, so you don't have to touch it again unless something changes upstream.",
    cta: { label: 'Add a connection', action: 'connection' },
  },
  {
    prompt: 'Which tools can be integrated',
    answer:
      "Hypersync integrates with a wide range of HR, payroll, and workplace tools, including HRMS platforms (like Workday and DarwinBox), payroll systems, ticketing tools (like Jira), and corporate directories.\n\nIf a tool exposes an API or supports webhooks, it can typically be connected. You can browse the full catalog under Connections, or create a ticket and our team will help scope a custom integration for a tool that isn't listed yet.",
  },
]

const EXISTING_USER_BUBBLES: BubbleSuggestion[] = [
  {
    prompt: 'Show current sync issues (HDFC Workday sync has 5 issues)',
    answer:
      "The HDFC Workday sync currently has 5 open issues. Here's the breakdown:\n- 3 records failed field validation (missing employee ID mapping)\n- 1 record was skipped due to a duplicate external ID\n- 1 record failed because the destination field was archived\n\nRecommended next step: open the connection's Issues tab to review the affected records individually, or re-run the sync after correcting the field mapping in the data model.",
  },
  {
    prompt: 'Show current sync issues (MMT Jira creds have expired)',
    answer:
      "The MMT Jira connection has expired credentials, which is pausing all syncs on that connection until it's reauthorized.\n\nTo fix it:\n1. Go to Connections → MMT Jira\n2. Click \"Reconnect\" and sign in with a valid Jira account\n3. Once reauthorized, queued records will sync automatically\n\nUntil this is resolved, no new tickets or updates will flow between the two systems.",
  },
  {
    prompt: 'Updates (25 new employees synced from Bajaj DarwinBox)',
    answer:
      "25 new employee records were synced from Bajaj DarwinBox in the last run. All records passed validation and were successfully created in the destination system with no field mismatches.\n\nYou can review the full list, including the fields that were mapped for each new hire, from the connection's Activity Log if you'd like to audit the batch.",
  },
]

export const personas: Record<PersonaId, Persona> = {
  'new-admin': {
    id: 'new-admin',
    label: 'New Client · Admin',
    description: 'First-time admin still setting things up',
    bubbles: NEW_USER_BUBBLES,
    cards: [
      {
        title: 'Add a demo connection',
        icon: 'PlugZap',
        answer:
          "Sure — a demo connection lets you explore how syncing works using sample data, with no risk to real records.\n\nHead to Connections → New Connection → Demo, pick a source and destination pair, and Hypersync will spin up a sandbox sync you can inspect end-to-end, including field mapping and issue detection, before connecting anything live.",
        flow: 'demo',
      },
      {
        title: 'Add your first connection',
        icon: 'Plug',
        answer:
          "To add your first connection:\n1. Go to Connections → New Connection\n2. Choose your source system (e.g. your HRMS) and destination (e.g. payroll)\n3. Authenticate both systems\n4. Map the fields you want kept in sync and set a schedule\n\nOnce saved, Hypersync runs an initial full sync and then keeps both systems updated automatically.",
        flow: 'connection',
      },
      {
        title: 'Configure webhook',
        icon: 'Webhook',
        answer:
          "Webhooks let external systems notify Hypersync the moment something changes, instead of waiting for the next scheduled sync.\n\nTo configure one, open a connection → Settings → Webhooks, and copy the generated endpoint URL into your source system's webhook settings. You can also set a shared secret so Hypersync can verify incoming events are authentic.",
        cta: { label: 'Configure Webhook', action: 'webhook' },
      },
      {
        title: 'Create users, define access',
        icon: 'Users',
        answer:
          "You can manage teammate access under Settings → Users. From there you can invite new users by email and assign them a role — Admin (full access) or Non-Admin (limited to viewing connections and running syncs they're granted access to).\n\nRoles can be changed at any time, and access changes take effect immediately.",
      },
      {
        title: 'Add your first corporate',
        icon: 'Building2',
        answer:
          "A corporate represents a legal entity or business unit in your organization — useful if you manage syncs separately across subsidiaries or regions.\n\nGo to Settings → Corporates → Add Corporate, fill in the entity details, and you can then scope connections and data models to that specific corporate.",
      },
      {
        title: 'Edit data models',
        icon: 'Database',
        answer:
          "Data models define which fields exist on each side of a connection and how they map to one another. To edit one, open a connection → Data Model, then add, remove, or re-map fields as needed.\n\nChanges apply to future syncs — historical data already synced is left untouched unless you trigger a re-sync.",
      },
      {
        title: 'Need human help? Create a ticket',
        icon: 'LifeBuoy',
        answer:
          "Happy to point you in the right direction — for anything that needs a human, the fastest path is Support → New Ticket. Describe what you're trying to do and include the connection name if relevant, and our team will follow up directly.\n\nFor most setup and configuration questions though, I can usually help right here.",
      },
      {
        title: 'View documentation',
        icon: 'BookOpen',
        answer:
          "You can find detailed guides, API references, and setup walkthroughs under Docs in the sidebar. It covers everything from creating your first connection to advanced data-model transformations.\n\nIf you'd rather not dig through docs, just ask me directly and I'll summarize the relevant part for you.",
      },
    ],
  },
  'new-non-admin': {
    id: 'new-non-admin',
    label: 'New Client · Non-Admin',
    description: 'First-time user without admin access',
    bubbles: NEW_USER_BUBBLES,
    cards: [
      {
        title: 'Add a demo connection',
        icon: 'PlugZap',
        answer:
          "Sure — a demo connection lets you explore how syncing works using sample data, with no risk to real records.\n\nHead to Connections → New Connection → Demo, pick a source and destination pair, and Hypersync will spin up a sandbox sync you can inspect end-to-end. If you don't see the option to create one, an admin on your account may need to grant you access first.",
      },
      {
        title: 'Add your first connection',
        icon: 'Plug',
        answer:
          "To add a connection, go to Connections → New Connection, choose a source and destination, and follow the authentication steps for each.\n\nIf the \"New Connection\" option isn't available to you, it likely means your role doesn't currently have permission to create connections — an admin on your team can grant that from Settings → Users.",
      },
      {
        title: 'Add your first corporate',
        icon: 'Building2',
        answer:
          "Corporates represent legal entities or business units within your organization. Creating one requires admin access, so if you don't see \"Add Corporate\" under Settings, ask an admin on your team to set it up — after that, you'll be able to view and work within it based on your assigned permissions.",
      },
      {
        title: 'Need human help? Create a ticket',
        icon: 'LifeBuoy',
        answer:
          "Happy to point you in the right direction — for anything that needs a human, the fastest path is Support → New Ticket. Describe what you're trying to do and our team will follow up directly.\n\nFor most day-to-day questions about connections and syncs, I can usually help right here.",
      },
      {
        title: 'View documentation',
        icon: 'BookOpen',
        answer:
          "You can find detailed guides and walkthroughs under Docs in the sidebar, covering how to navigate connections, review sync activity, and more.\n\nIf you'd rather not dig through docs, just ask me directly and I'll summarize the relevant part for you.",
      },
    ],
  },
  'old-admin': {
    id: 'old-admin',
    label: 'Existing Client · Admin',
    description: 'Returning admin managing live syncs',
    bubbles: EXISTING_USER_BUBBLES,
    cards: [
      {
        title: 'Add a connection',
        icon: 'Plug',
        answer:
          "To add a new connection, go to Connections → New Connection, choose your source and destination systems, authenticate both, and map the fields you want kept in sync.\n\nOnce saved, Hypersync runs an initial sync and then keeps both systems updated on the schedule you set.",
        flow: 'connection',
      },
      {
        title: 'View connection analytics summary',
        icon: 'BarChart3',
        answer: "Here's a snapshot of your connection activity across all corporates:",
        stats: [
          { icon: 'Link2', value: '12', label: 'Active Connections' },
          { icon: 'BarChart3', value: '8,420', label: 'Records Synced Today' },
          { icon: 'Database', value: '2.4 min', label: 'Avg Sync Time' },
          { icon: 'Sparkles', value: '98.7%', label: 'Success Rate' },
        ],
      },
      {
        title: 'Add a corporate',
        icon: 'Building2',
        answer:
          "Go to Settings → Corporates → Add Corporate to register a new legal entity or business unit. Once created, you can scope connections and data models specifically to it, which is useful if you manage syncs separately across subsidiaries or regions.",
      },
      {
        title: 'Need human help? Create a ticket',
        icon: 'LifeBuoy',
        answer:
          "For anything that needs a human, the fastest path is Support → New Ticket. Include the connection name and a brief description, and our team will follow up directly.\n\nFor most configuration or troubleshooting questions, I can usually help right here.",
      },
      {
        title: 'Edit data models',
        icon: 'Database',
        answer:
          "Open a connection → Data Model to add, remove, or re-map fields. Changes apply to future syncs — historical data already synced is left untouched unless you trigger a re-sync.\n\nBe cautious removing fields that other automations depend on downstream.",
      },
      {
        title: 'Create users, define access',
        icon: 'Users',
        answer:
          "You can manage teammate access under Settings → Users — invite new users by email and assign them a role (Admin or Non-Admin). Roles can be changed at any time and access changes take effect immediately.",
      },
      {
        title: 'View documentation',
        icon: 'BookOpen',
        answer:
          "You can find detailed guides, API references, and setup walkthroughs under Docs in the sidebar. If you'd rather not dig through docs, just ask me directly and I'll summarize the relevant part for you.",
      },
      {
        title: 'View connection level analytics',
        icon: 'LineChart',
        answer:
          "Open any connection and select its Analytics tab to see sync volume over time, failure breakdowns by error type, and average processing latency for that specific connection.\n\nThis is the best place to dig in when a particular connection (like HDFC Workday or MMT Jira) needs closer attention.",
      },
    ],
  },
  'old-non-admin': {
    id: 'old-non-admin',
    label: 'Existing Client · Non-Admin',
    description: 'Returning user without admin access',
    bubbles: EXISTING_USER_BUBBLES,
    cards: [
      {
        title: 'Add a connection',
        icon: 'Plug',
        answer:
          "Creating a connection requires admin access. If you don't see \"New Connection\" available, ask an admin on your team to either set it up or grant you permission from Settings → Users.",
      },
      {
        title: 'View connection analytics summary',
        icon: 'BarChart3',
        answer: "Here's a snapshot of your connection activity across all corporates:",
        stats: [
          { icon: 'Link2', value: '12', label: 'Active Connections' },
          { icon: 'BarChart3', value: '8,420', label: 'Records Synced Today' },
          { icon: 'Database', value: '2.4 min', label: 'Avg Sync Time' },
          { icon: 'Sparkles', value: '98.7%', label: 'Success Rate' },
        ],
      },
      {
        title: 'Add a corporate',
        icon: 'Building2',
        answer:
          "Adding a corporate (a legal entity or business unit) requires admin access. If you need one set up, ask an admin on your team — once created, you'll be able to view and work within it based on your assigned permissions.",
      },
      {
        title: 'Need human help? Create a ticket',
        icon: 'LifeBuoy',
        answer:
          "For anything that needs a human, the fastest path is Support → New Ticket. Include the connection name and a brief description, and our team will follow up directly.",
      },
      {
        title: 'View documentation',
        icon: 'BookOpen',
        answer:
          "You can find detailed guides and walkthroughs under Docs in the sidebar, covering how to navigate connections, review sync activity, and more.",
      },
      {
        title: 'View connection level analytics',
        icon: 'LineChart',
        answer:
          "Open any connection and select its Analytics tab to see sync volume over time, failure breakdowns by error type, and average processing latency for that specific connection.",
      },
    ],
  },
}

export const personaOrder: PersonaId[] = [
  'new-admin',
  'new-non-admin',
  'old-admin',
  'old-non-admin',
]
