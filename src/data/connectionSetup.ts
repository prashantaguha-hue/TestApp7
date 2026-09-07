export interface Platform {
  id: string
  name: string
  cat: string
  color: string
}

export interface CorporateOption {
  id: string
  name: string
  sub: string
}

export interface ModeOption {
  id: string
  title: string
  desc: string
  recommended?: boolean
  enabled: boolean
}

export interface FrequencyOption {
  id: string
  title: string
  desc: string
  recommended?: boolean
}

export interface FieldDef {
  key: string
  label: string
  required?: boolean
}

export interface FieldCategory {
  name: string
  fields: FieldDef[]
}

export interface AttentionField {
  key: string
  label: string
  options: string[]
  suggested: string
}

export const PLATFORMS: Platform[] = [
  { id: 'darwinbox', name: 'Darwinbox', cat: 'HR Suite', color: '#5B2AE0' },
  { id: 'workday', name: 'Workday', cat: 'HCM', color: '#0875C9' },
  { id: 'sap', name: 'SAP SuccessFactors', cat: 'HCM', color: '#0A6ED1' },
  { id: 'bamboo', name: 'BambooHR', cat: 'HRIS', color: '#6DA544' },
  { id: 'zoho', name: 'Zoho People', cat: 'HRIS', color: '#E24A3B' },
  { id: 'keka', name: 'Keka', cat: 'HR Suite', color: '#159A8C' },
  { id: 'adp', name: 'ADP Workforce Now', cat: 'Payroll + HR', color: '#C4122F' },
  { id: 'gusto', name: 'Gusto', cat: 'Payroll + HR', color: '#E2513B' },
]

export const CORPORATES: CorporateOption[] = [
  { id: 'acme', name: 'Acme Corporation', sub: 'Manufacturing · 4,820 employees' },
  { id: 'globex', name: 'Globex Industries', sub: 'Energy · 12,400 employees' },
  { id: 'initech', name: 'Initech Solutions', sub: 'Software · 1,240 employees' },
  { id: 'umbrella', name: 'Umbrella Group', sub: 'Healthcare · 8,900 employees' },
]

export const MODES: ModeOption[] = [
  {
    id: 'hrms',
    title: 'HRMS Integration',
    desc: 'Connect directly to your HR platform and sync employee data automatically over a secure API.',
    recommended: true,
    enabled: true,
  },
  { id: 'sftp', title: 'Flat File / SFTP', desc: 'Drop CSV or Excel files to a secure SFTP endpoint on a schedule.', enabled: false },
  { id: 'api', title: 'Direct API Push', desc: 'Push employee records to Hypersync from your own systems via REST.', enabled: false },
  { id: 'manual', title: 'Manual Upload', desc: 'Upload a spreadsheet whenever you need a one-off sync.', enabled: false },
]

export const FREQUENCIES: FrequencyOption[] = [
  { id: 'daily', title: 'Daily', desc: 'Sync once every day at a set time.', recommended: true },
  { id: 'weekly', title: 'Weekly', desc: 'Sync once a week on a chosen day.' },
  { id: 'monthly', title: 'Monthly', desc: 'Sync once a month on a chosen date.' },
  { id: 'ondemand', title: 'On-demand', desc: 'No schedule — trigger each sync manually.' },
]

export const FIELD_CATEGORIES: FieldCategory[] = [
  {
    name: 'Personal',
    fields: [
      { key: 'first_name', label: 'First Name', required: true },
      { key: 'last_name', label: 'Last Name', required: true },
      { key: 'gender', label: 'Gender' },
      { key: 'date_of_birth', label: 'Date of Birth' },
      { key: 'marital_status', label: 'Marital Status' },
    ],
  },
  {
    name: 'Contact',
    fields: [
      { key: 'work_email', label: 'Work Email', required: true },
      { key: 'personal_email', label: 'Personal Email' },
      { key: 'mobile_number', label: 'Mobile Number' },
      { key: 'current_address', label: 'Current Address' },
    ],
  },
  {
    name: 'Employment',
    fields: [
      { key: 'employee_id', label: 'Employee ID', required: true },
      { key: 'date_joined', label: 'Date Joined' },
      { key: 'designation', label: 'Designation' },
      { key: 'department', label: 'Department' },
      { key: 'reporting_manager', label: 'Reporting Manager' },
    ],
  },
]

export const ATTENTION_FIELDS: AttentionField[] = [
  {
    key: 'employee_type',
    label: 'Employee Type',
    options: ['Employment Type', 'Worker Category', 'Contract Type'],
    suggested: 'Employment Type',
  },
  {
    key: 'cost_center_code',
    label: 'Cost Center Code',
    options: ['Cost Center', 'Business Unit', 'Department Code'],
    suggested: 'Cost Center',
  },
]

export const FILTER_FIELD_OPTIONS = ['Status', 'Department', 'Country', 'Employment Type', 'Location']
export const FILTER_CONDITIONS = ['Include', 'Include containing', 'Exclude', 'Exclude containing']

export interface FilterRule {
  field: string
  condition: string
  value: string
}

export interface StepAssistant {
  intro: string
  questions: string[]
}

export const STEP_ASSISTANT: Record<string, StepAssistant> = {
  corporate: {
    intro:
      "Let's start with the organisation this connection is for — pick an existing corporate, or add a new one. Everything you configure next applies only to this organisation.",
    questions: ["What's a corporate here?", 'Can I add a new corporate?'],
  },
  mode: {
    intro:
      'Choose how employee data reaches Hypersync. HRMS Integration is the recommended, fully-automated option — other modes are coming soon.',
    questions: ['What is HRMS Integration?', 'Which mode should I pick?'],
  },
  platform: {
    intro: "Pick the HRMS platform you're connecting — I support the most common ones out of the box.",
    questions: ['Is my HRMS supported?', "My HRMS isn't listed — now what?"],
  },
  host: {
    intro: "Let's get your HRMS connection details ready. I'll help you understand anything you're unsure about.",
    questions: ['What is an HRMS Host Name?', 'Where can I find my username?', 'How do I verify the connection?'],
  },
  fields: {
    intro:
      "I've preselected the employee fields most integrations use — required ones stay on. Toggle anything else on or off.",
    questions: ['Why these fields?', 'Can I change this later?'],
  },
  configure: {
    intro:
      'Most fields map automatically. Resolve anything flagged for review, then decide which employees should sync using filters.',
    questions: ['Why is this field not mapped?', 'How do filters work?', 'What does Match ALL vs ANY mean?'],
  },
  frequency: {
    intro: 'Pick how often Hypersync refreshes employee data. Daily suits most teams; you can force a sync anytime.',
    questions: ['Which frequency is best?', 'What does on-demand mean?'],
  },
  review: {
    intro: "Everything's configured. Review the summary, then activate — I'll flag anything that needs attention.",
    questions: ['What happens when I activate?', 'Can I edit after activating?'],
  },
}

export function answerSetupQuestion(question: string): string {
  const t = question.toLowerCase()
  if (/host ?name|host ?url|hostname/.test(t))
    return 'The HRMS Host Name is the web address where your HRMS is hosted — the same URL you use to sign in (e.g. https://yourco.darwinbox.com).'
  if (/user ?name|user id/.test(t))
    return 'Use a service or admin account that can read employee data. Where possible, create a dedicated read-only integration account in your HRMS admin console.'
  if (/password/.test(t))
    return "Enter the password for the account above. It's encrypted at rest, used only to authenticate the connection, and never shown again after saving."
  if (/verify|test connection/.test(t))
    return "Fill in all three fields and press Verify connection. I'll run a secure test — success shows Connection verified, otherwise I'll tell you exactly what to fix."
  if (/not mapped|un-?mapped|needs review|attention/.test(t))
    return "A field is flagged when more than one Hypersync field could match, or the name is ambiguous. Pick the right target from its dropdown and it's resolved."
  if (/change (a )?mapping|edit mapping|re-?map/.test(t))
    return 'Yes — open the field\'s dropdown under Mapping & filters and choose a different target at any time, including auto-mapped ones.'
  if (/how does auto|automatic mapping|auto-?map/.test(t))
    return "I compare each HRMS field's name against the Hypersync schema and map the high-confidence matches automatically. Anything uncertain is flagged for you to confirm."
  if (/match all|match any/.test(t))
    return 'Match ALL means every filter rule must pass for a record to sync. Match ANY means passing just one rule is enough.'
  if (/filter/.test(t))
    return 'Filters decide who syncs. Add Include rules to keep only matching employees, or Exclude rules to drop them — combine as many rules as you need.'
  if (/why these field|which field|add.*field|remove.*field|custom/.test(t))
    return "I preselect the fields most integrations use; required ones (like Employee ID) stay on. Toggle any optional field on or off — you can change this later."
  if (/self setup|invite/.test(t))
    return 'Self setup lets you configure the organisation right now. Corporate invites are coming soon.'
  if (/corporate|organis|organiz/.test(t))
    return 'A corporate is the organisation this connection belongs to. Pick an existing one, or add a new one from this step.'
  if (/hrms integration|which mode/.test(t))
    return 'HRMS Integration connects directly to your HR platform over a secure API and syncs automatically — the recommended option. Other modes are coming soon.'
  if (/supported|isn.?t listed|not listed/.test(t))
    return "If your HRMS isn't listed, pick the closest match for now — our team can help set up a custom connector."
  if (/on-?demand|force sync/.test(t))
    return "On-demand means there's no fixed schedule — you trigger each sync yourself, whenever you need fresh data."
  if (/frequency|how often|which frequency/.test(t))
    return 'Daily suits most teams — current data without unnecessary load. Choose Weekly or Monthly for lower-change data, or On-demand to trigger syncs yourself.'
  if (/activat/.test(t))
    return 'Activating opens a live, encrypted connection to your HRMS, applies your mapping and filters, and schedules the first sync. You can edit or pause it afterwards.'
  if (/secure|safe|encrypt|privacy/.test(t))
    return 'Credentials are encrypted at rest, used only to read the fields you approve, and Hypersync never writes back to your HRMS.'
  if (/edit after|change later/.test(t))
    return "Yes — every setting here (fields, mapping, filters, schedule) can be changed later from the connection's detail view."
  return "Good question — configure this step in the centre panel and I'll flag anything that needs attention. Ask me about any field, credential, or setting and I'll explain it."
}
