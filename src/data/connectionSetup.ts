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

export interface ChoiceOption {
  id: string
  title: string
  enabled: boolean
}

export interface TransferMethod {
  id: string
  title: string
  desc: string
  iconKey: 'hrms' | 'sftp' | 'csv' | 'api'
  enabled: boolean
}

export interface DataModelField {
  key: string
  label: string
  required?: boolean
  /** Fields whose source name is ambiguous enough that a human should confirm the mapped target. */
  needsMapping?: boolean
}

export interface DataModelCategory {
  id: string
  label: string
  fields: DataModelField[]
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

export const SETUP_METHODS: ChoiceOption[] = [
  { id: 'invite', title: 'Invite Corporate', enabled: false },
  { id: 'self', title: 'Setup Myself', enabled: true },
]

export const CORPORATE_METHODS: ChoiceOption[] = [
  { id: 'existing', title: 'Use Existing Corporate', enabled: true },
  { id: 'new', title: 'Add New Corporate', enabled: true },
]

export const CONNECTION_CATEGORIES = ['HRMS Sync', 'Payroll Sync', 'Benefits Sync', 'Directory Sync']

export const TRANSFER_METHODS: TransferMethod[] = [
  {
    id: 'hrms',
    title: 'HRMS Integration',
    desc: 'Connect your HRMS for seamless data transfer.',
    iconKey: 'hrms',
    enabled: true,
  },
  { id: 'sftp', title: 'SFTP Transfer', desc: 'Upload files securely via SFTP.', iconKey: 'sftp', enabled: false },
  { id: 'csv', title: 'Upload CSV', desc: 'Quickly upload your data using CSV files.', iconKey: 'csv', enabled: false },
  { id: 'api', title: 'Push API', desc: 'Send data directly to your webhook URL.', iconKey: 'api', enabled: false },
]

export const DATA_MODEL_CATEGORIES: DataModelCategory[] = [
  {
    id: 'employee-details',
    label: 'Employee Details Info',
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'employee_id', label: 'Employee ID', required: true },
      { key: 'employee_status', label: 'Employee Status', required: true },
      { key: 'date_of_joining', label: 'Date of Joining' },
      { key: 'personal_email', label: 'Personal Email' },
      { key: 'mobile_number', label: 'Mobile Number' },
      { key: 'uan', label: 'UAN' },
    ],
  },
  {
    id: 'bank-details',
    label: 'Bank Details',
    fields: [
      { key: 'bank_name', label: 'Bank Name' },
      { key: 'account_number', label: 'Account Number' },
    ],
  },
  {
    id: 'dependent-details',
    label: 'Dependent Details',
    fields: [
      { key: 'dependent_name', label: 'Dependent Name' },
      { key: 'relationship', label: 'Relationship' },
      { key: 'dependent_dob', label: 'Date of Birth' },
    ],
  },
  {
    id: 'salary-details',
    label: 'Salary Details',
    fields: [
      { key: 'dearness_allowance', label: 'Dearness Allowance', needsMapping: true },
      { key: 'house_rent_allowance', label: 'House Rent Allowance', needsMapping: true },
      { key: 'flexi_basket_allowance', label: 'Flexi Basket Allowance', needsMapping: true },
    ],
  },
]

export const REQUIRED_FIELDS = DATA_MODEL_CATEGORIES.flatMap((c) => c.fields).filter((f) => f.required)

export function toMappingKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function answerSetupQuestion(question: string): string {
  const t = question.toLowerCase()
  if (/company ?domain|domain/.test(t))
    return "The Company Domain is the web address your HRMS is hosted at — the same one you use to sign in (e.g. yourco.bamboohr.com)."
  if (/api ?(secret)? ?key|secret/.test(t))
    return 'The API Secret Key comes from your HRMS admin console, usually under API or Integrations settings. It is encrypted at rest and never shown again after saving.'
  if (/reference ?id/.test(t))
    return "Reference ID is a unique identifier you use to track this connection in your own systems — any short code works."
  if (/mapping|mapped|map field/.test(t))
    return 'I map each selected field to a source key automatically. Use Edit mappings if you need to point a field at a different source name.'
  if (/data model|required field|recommended field/.test(t))
    return 'Required fields are always synced. Recommended fields are pre-selected based on common usage, but you can adjust them before continuing.'
  if (/transfer method|sftp|csv|push api/.test(t))
    return 'HRMS Integration is the only fully automated option right now — SFTP, CSV upload and Push API are coming soon.'
  if (/corporate/.test(t))
    return 'A corporate is the organisation this connection belongs to. Use an existing one, or add a new one from this step.'
  if (/secure|safe|encrypt|privacy/.test(t))
    return 'Credentials are encrypted at rest, used only to read the fields you approve, and Hypersync never writes back to your HRMS.'
  if (/activat|connect(ed)?$/.test(t))
    return "Once you finish this setup, Hypersync opens a live, encrypted connection, applies your field mappings, and schedules the first sync."
  return "Good question — keep working through the steps below and I'll flag anything that needs your attention. Ask me about any field or setting and I'll explain it."
}
