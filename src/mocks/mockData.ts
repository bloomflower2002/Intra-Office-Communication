import type {
  User, Department, Channel, DirectThread, ChatMessage, Memo, Notification, ArchiveDoc,
} from '../types';

export const departments: Department[] = [
  'Administration',
  'Finance',
  'Research & Development',
  'Planning & Strategy',
  'ICT Bureau',
];

const avatarPalette = ['#2A4F97', '#1E9E6F', '#C9821A', '#2B7FB8', '#7B4FA5', '#C4432F'];
const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

const firstNames = ['Abebe', 'Sara', 'Kebede', 'Almaz', 'Dawit', 'Hana', 'Getachew', 'Meron', 'Yonas', 'Selam', 'Tesfaye', 'Rahel', 'Bereket', 'Liya', 'Mulugeta', 'Eden'];
const lastNames = ['Tadesse', 'Bekele', 'Girma', 'Alemu', 'Haile', 'Wolde', 'Desta', 'Yimer', 'Assefa', 'Kassa'];

export const users: User[] = [
  { id: 'u-admin', fullName: 'Netsanet Fikru', email: 'netsanet.fikru@osta.gov.et', role: 'System Admin', department: 'ICT Bureau', title: 'System Administrator', avatarColor: avatarPalette[3], status: 'active', online: true, phone: '+251 91 234 5678' },
  { id: 'u-head', fullName: 'Ato Girma Wolde', email: 'girma.wolde@osta.gov.et', role: 'Head Office', department: 'Administration', title: 'Director General', avatarColor: avatarPalette[0], status: 'active', online: true, phone: '+251 91 111 2233' },
  { id: 'u-dir-ict', fullName: 'W/ro Hana Tesfaye', email: 'hana.tesfaye@osta.gov.et', role: 'Director', department: 'ICT Bureau', title: 'Director, ICT Bureau', avatarColor: avatarPalette[1], status: 'active', online: true },
  { id: 'u-dir-fin', fullName: 'Ato Dawit Assefa', email: 'dawit.assefa@osta.gov.et', role: 'Director', department: 'Finance', title: 'Director, Finance', avatarColor: avatarPalette[2], status: 'active', online: false },
  { id: 'u-tl-rd', fullName: 'W/ro Selam Kassa', email: 'selam.kassa@osta.gov.et', role: 'Team Leader', department: 'Research & Development', title: 'Team Leader, R&D', avatarColor: avatarPalette[4], status: 'active', online: true },
  { id: 'u-tl-plan', fullName: 'Ato Yonas Bekele', email: 'yonas.bekele@osta.gov.et', role: 'Team Leader', department: 'Planning & Strategy', title: 'Team Leader, Planning', avatarColor: avatarPalette[5], status: 'active', online: false },
  { id: 'u-emp-1', fullName: 'Meron Alemu', email: 'meron.alemu@osta.gov.et', role: 'Employee', department: 'ICT Bureau', title: 'Software Engineer', avatarColor: avatarPalette[0], status: 'active', online: true },
  { id: 'u-emp-2', fullName: 'Bereket Girma', email: 'bereket.girma@osta.gov.et', role: 'Employee', department: 'Finance', title: 'Accountant', avatarColor: avatarPalette[1], status: 'active', online: false },
  { id: 'u-emp-3', fullName: 'Liya Haile', email: 'liya.haile@osta.gov.et', role: 'Employee', department: 'Research & Development', title: 'Research Officer', avatarColor: avatarPalette[2], status: 'active', online: true },
  { id: 'u-emp-4', fullName: 'Tesfaye Desta', email: 'tesfaye.desta@osta.gov.et', role: 'Employee', department: 'Planning & Strategy', title: 'Planning Officer', avatarColor: avatarPalette[3], status: 'inactive', online: false },
  { id: 'u-emp-5', fullName: 'Eden Yimer', email: 'eden.yimer@osta.gov.et', role: 'Employee', department: 'Administration', title: 'Admin Assistant', avatarColor: avatarPalette[4], status: 'active', online: true },
];

// Bulk generate additional employees for a realistic directory / admin table
for (let i = 0; i < 24; i++) {
  const fn = pick(firstNames, i);
  const ln = pick(lastNames, i + 3);
  const dept = pick(departments, i);
  users.push({
    id: `u-gen-${i}`,
    fullName: `${fn} ${ln}`,
    email: `${fn}.${ln}`.toLowerCase() + '@osta.gov.et',
    role: 'Employee',
    department: dept,
    title: pick(['Officer', 'Specialist', 'Analyst', 'Coordinator'], i),
    avatarColor: pick(avatarPalette, i),
    status: i % 9 === 0 ? 'inactive' : 'active',
    online: i % 3 === 0,
  });
}

export const currentUsersByRole: Record<string, string> = {
  'System Admin': 'u-admin',
  'Head Office': 'u-head',
  'Director': 'u-dir-ict',
  'Team Leader': 'u-tl-rd',
  'Employee': 'u-emp-1',
};

export const channels: Channel[] = [
  { id: 'ch-general', name: 'General', description: 'Organization-wide announcements', memberCount: 148, lastMessage: 'Reminder: quarterly review starts Monday.', lastTimestamp: '09:12', unread: 3 },
  { id: 'ch-ict', name: 'ICT Bureau', description: 'ICT Bureau internal discussion', memberCount: 22, lastMessage: 'Server migration completed successfully.', lastTimestamp: 'Yesterday', unread: 0 },
  { id: 'ch-admin', name: 'Admin Dept', description: 'Administration department', memberCount: 18, lastMessage: 'Please submit leave requests by Friday.', lastTimestamp: 'Yesterday', unread: 1 },
  { id: 'ch-finance', name: 'Finance', description: 'Finance department channel', memberCount: 15, lastMessage: 'Budget report attached for review.', lastTimestamp: 'Mon', unread: 0 },
  { id: 'ch-rd', name: 'Research & Development', description: 'R&D project coordination', memberCount: 12, lastMessage: 'New proposal draft is ready.', lastTimestamp: 'Mon', unread: 5 },
];

export const directThreads: DirectThread[] = [
  { id: 'dt-1', participantId: 'u-dir-ict', lastMessage: 'Can you review the new UI mockups?', lastTimestamp: '10:24', unread: 2 },
  { id: 'dt-2', participantId: 'u-head', lastMessage: 'Approved — proceed with the rollout.', lastTimestamp: '09:50', unread: 0 },
  { id: 'dt-3', participantId: 'u-emp-3', lastMessage: 'Sent the R&D memo for your review.', lastTimestamp: 'Yesterday', unread: 1 },
  { id: 'dt-4', participantId: 'u-tl-plan', lastMessage: 'Let\u2019s sync tomorrow morning.', lastTimestamp: 'Yesterday', unread: 0 },
  { id: 'dt-5', participantId: 'u-emp-5', lastMessage: 'Thank you!', lastTimestamp: 'Mon', unread: 0 },
];

export const chatMessages: ChatMessage[] = [
  { id: 'm1', threadId: 'dt-1', senderId: 'u-dir-ict', body: 'Morning! Can you review the new UI mockups before the 2pm meeting?', timestamp: '09:58' },
  { id: 'm2', threadId: 'dt-1', senderId: 'u-emp-1', body: 'Sure, I\u2019ll take a look right away.', timestamp: '10:01' },
  { id: 'm3', threadId: 'dt-1', senderId: 'u-dir-ict', body: 'Thanks — focus especially on the memo workflow screens.', timestamp: '10:05' },
  { id: 'm4', threadId: 'dt-1', senderId: 'u-emp-1', body: 'Will do. I\u2019ll send comments by noon.', timestamp: '10:07' },
  { id: 'm5', threadId: 'dt-1', senderId: 'u-dir-ict', body: 'Can you review the new UI mockups?', timestamp: '10:24' },
];

export const channelMessages: ChatMessage[] = [
  { id: 'cm1', threadId: 'ch-general', senderId: 'u-head', body: 'Good morning everyone. Quarterly review begins next Monday, please prepare your department summaries.', timestamp: '08:30' },
  { id: 'cm2', threadId: 'ch-general', senderId: 'u-dir-fin', body: 'Noted, Finance report will be ready by Thursday.', timestamp: '08:41' },
  { id: 'cm3', threadId: 'ch-general', senderId: 'u-dir-ict', body: 'ICT dashboard exports will also be attached.', timestamp: '08:55' },
  { id: 'cm4', threadId: 'ch-general', senderId: 'u-head', body: 'Reminder: quarterly review starts Monday.', timestamp: '09:12' },
];

const attachmentsSample = [{ name: 'Q3-Budget-Report.pdf', size: '2.4 MB', type: 'pdf' as const }];

export const memos: Memo[] = [
  {
    id: 'memo-1',
    reference: 'OSTA/ICT/2024/017',
    type: 'Official Memo',
    subject: 'Approval Request: New Server Infrastructure Procurement',
    body: 'This memo requests approval for the procurement of new server infrastructure to support the IOCMS deployment, as outlined in the attached technical specification and budget report.',
    senderId: 'u-dir-ict',
    recipients: ['u-head'],
    priority: 'High',
    status: 'Pending Approval',
    stage: 'Forwarded',
    createdAt: '2026-08-10T08:30:00',
    attachments: attachmentsSample,
    approvalChain: [
      { role: 'Director', userId: 'u-dir-ict', action: 'Forwarded', comment: 'Recommended for approval.', timestamp: '2026-08-10T09:00:00' },
      { role: 'Head Office', userId: 'u-head' },
    ],
    readReceipts: [
      { userId: 'u-head', status: 'read', timestamp: '2026-08-10T10:15:00' },
    ],
    stageHistory: [
      { stage: 'Issued', timestamp: '2026-08-10T08:30:00' },
      { stage: 'Received', timestamp: '2026-08-10T08:45:00' },
      { stage: 'Reviewed', timestamp: '2026-08-10T09:00:00' },
      { stage: 'Forwarded', timestamp: '2026-08-10T09:00:00' },
    ],
  },
  {
    id: 'memo-2',
    reference: 'OSTA/HR/2024/044',
    type: 'Circular',
    subject: 'Updated Annual Leave Policy — Effective Immediately',
    body: 'All staff are informed that the annual leave policy has been revised. Please review the attached circular for full details and acknowledge receipt.',
    senderId: 'u-head',
    recipients: ['ch-general'],
    priority: 'Normal',
    status: 'Completed',
    stage: 'Completed',
    createdAt: '2026-08-05T09:00:00',
    attachments: [{ name: 'Leave-Policy-2024.docx', size: '540 KB', type: 'docx' }],
    approvalChain: [],
    readReceipts: [
      { userId: 'u-dir-ict', status: 'read', timestamp: '2026-08-05T10:00:00' },
      { userId: 'u-dir-fin', status: 'read', timestamp: '2026-08-05T11:20:00' },
      { userId: 'u-tl-rd', status: 'delivered' },
      { userId: 'u-emp-1', status: 'pending' },
    ],
    stageHistory: [
      { stage: 'Issued', timestamp: '2026-08-05T09:00:00' },
      { stage: 'Received', timestamp: '2026-08-05T09:10:00' },
      { stage: 'Reviewed', timestamp: '2026-08-05T09:30:00' },
      { stage: 'Forwarded', timestamp: '2026-08-05T09:35:00' },
      { stage: 'Acknowledged', timestamp: '2026-08-06T08:00:00' },
      { stage: 'Completed', timestamp: '2026-08-06T09:00:00' },
    ],
  },
  {
    id: 'memo-3',
    reference: 'OSTA/RD/2024/029',
    type: 'Notice',
    subject: 'Research Proposal Submission Deadline Extended',
    body: 'The submission deadline for Q3 research proposals has been extended to August 30th to accommodate additional review time.',
    senderId: 'u-tl-rd',
    recipients: ['ch-rd'],
    priority: 'Low',
    status: 'Approved',
    stage: 'Acknowledged',
    createdAt: '2026-08-12T14:00:00',
    attachments: [],
    approvalChain: [
      { role: 'Team Leader', userId: 'u-tl-rd', action: 'Approved', timestamp: '2026-08-12T14:20:00' },
    ],
    readReceipts: [
      { userId: 'u-emp-3', status: 'read', timestamp: '2026-08-12T15:00:00' },
    ],
    stageHistory: [
      { stage: 'Issued', timestamp: '2026-08-12T14:00:00' },
      { stage: 'Received', timestamp: '2026-08-12T14:10:00' },
      { stage: 'Reviewed', timestamp: '2026-08-12T14:20:00' },
      { stage: 'Forwarded', timestamp: '2026-08-12T14:25:00' },
      { stage: 'Acknowledged', timestamp: '2026-08-13T09:00:00' },
    ],
  },
  {
    id: 'memo-4',
    reference: 'OSTA/FIN/2024/012',
    type: 'Directive',
    subject: 'Mandatory Expense Reporting via New Portal',
    body: 'Effective next month, all departments must submit monthly expense reports exclusively through the new finance portal.',
    senderId: 'u-dir-fin',
    recipients: ['u-head'],
    priority: 'Urgent',
    status: 'Rejected',
    stage: 'Reviewed',
    createdAt: '2026-08-14T11:00:00',
    attachments: [{ name: 'Portal-Guide.pdf', size: '1.1 MB', type: 'pdf' }],
    approvalChain: [
      { role: 'Head Office', userId: 'u-head', action: 'Rejected', comment: 'Please revise the rollout timeline before resubmission.', timestamp: '2026-08-14T16:00:00' },
    ],
    readReceipts: [{ userId: 'u-head', status: 'read', timestamp: '2026-08-14T15:45:00' }],
    stageHistory: [
      { stage: 'Issued', timestamp: '2026-08-14T11:00:00' },
      { stage: 'Received', timestamp: '2026-08-14T11:15:00' },
      { stage: 'Reviewed', timestamp: '2026-08-14T16:00:00' },
    ],
  },
  {
    id: 'memo-5',
    reference: 'OSTA/PLN/2024/008',
    type: 'Official Memo',
    subject: 'Strategic Plan 2026–2030 — Draft for Review',
    body: 'Please find attached the draft strategic plan for 2026–2030. Comments are requested from all directors by end of week.',
    senderId: 'u-tl-plan',
    recipients: ['u-dir-ict', 'u-dir-fin'],
    priority: 'High',
    status: 'Pending Approval',
    stage: 'Received',
    createdAt: '2026-08-15T09:30:00',
    attachments: [{ name: 'Strategic-Plan-Draft.docx', size: '3.2 MB', type: 'docx' }],
    approvalChain: [
      { role: 'Director', userId: 'u-dir-ict' },
    ],
    readReceipts: [
      { userId: 'u-dir-ict', status: 'pending' },
      { userId: 'u-dir-fin', status: 'delivered' },
    ],
    stageHistory: [
      { stage: 'Issued', timestamp: '2026-08-15T09:30:00' },
      { stage: 'Received', timestamp: '2026-08-15T10:00:00' },
    ],
  },
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'Memo Approved', description: 'Memo OSTA/RD/2024/029 has been approved.', timestamp: '10 min ago', read: false, link: '/memos/memo-3', kind: 'approval' },
  { id: 'n2', title: 'New Message', description: 'Hana Tesfaye sent you a message.', timestamp: '25 min ago', read: false, link: '/messages', kind: 'message' },
  { id: 'n3', title: 'Memo Rejected', description: 'Memo OSTA/FIN/2024/012 was rejected by Head Office.', timestamp: '1 hr ago', read: false, link: '/memos/memo-4', kind: 'memo' },
  { id: 'n4', title: 'System Update', description: 'Scheduled maintenance completed successfully.', timestamp: '3 hr ago', read: true, link: '/settings', kind: 'system' },
  { id: 'n5', title: 'Approval Pending', description: 'A new memo requires your approval.', timestamp: 'Yesterday', read: true, link: '/approvals', kind: 'approval' },
];

export const archiveDocs: ArchiveDoc[] = [
  { id: 'a1', subject: 'Updated Annual Leave Policy', type: 'Circular', sender: 'Ato Girma Wolde', department: 'Administration', date: '2026-08-05', status: 'Completed' },
  { id: 'a2', subject: 'Q2 Financial Performance Report', type: 'Report', sender: 'Ato Dawit Assefa', department: 'Finance', date: '2026-07-28', status: 'Archived' },
  { id: 'a3', subject: 'ICT Infrastructure Assessment', type: 'Official Memo', sender: 'W/ro Hana Tesfaye', department: 'ICT Bureau', date: '2026-07-15', status: 'Archived' },
  { id: 'a4', subject: 'Staff Recognition Letter — R&D Team', type: 'Letter', sender: 'Ato Girma Wolde', department: 'Research & Development', date: '2026-07-10', status: 'Archived' },
  { id: 'a5', subject: 'Research Proposal Deadline Notice', type: 'Notice', sender: 'W/ro Selam Kassa', department: 'Research & Development', date: '2026-08-12', status: 'Approved' },
  { id: 'a6', subject: 'Mandatory Expense Reporting Directive', type: 'Directive', sender: 'Ato Dawit Assefa', department: 'Finance', date: '2026-08-14', status: 'Rejected' },
  { id: 'a7', subject: 'Annual Strategic Retreat Summary', type: 'Report', sender: 'Ato Yonas Bekele', department: 'Planning & Strategy', date: '2026-06-30', status: 'Archived' },
  { id: 'a8', subject: 'Network Security Upgrade Notice', type: 'Notice', sender: 'W/ro Hana Tesfaye', department: 'ICT Bureau', date: '2026-06-20', status: 'Archived' },
];

export const departmentVolume = [
  { department: 'Admin', value: 42 },
  { department: 'Finance', value: 38 },
  { department: 'R&D', value: 55 },
  { department: 'Planning', value: 27 },
  { department: 'ICT', value: 61 },
];

export const documentStatusBreakdown = [
  { name: 'Completed', value: 48, color: '#1E9E6F' },
  { name: 'Pending', value: 22, color: '#C9821A' },
  { name: 'Approved', value: 18, color: '#2B7FB8' },
  { name: 'Rejected', value: 6, color: '#C4432F' },
];

export const userGrowth = [
  { month: 'Mar', users: 96 },
  { month: 'Apr', users: 108 },
  { month: 'May', users: 121 },
  { month: 'Jun', users: 130 },
  { month: 'Jul', users: 142 },
  { month: 'Aug', users: 156 },
];

export const auditLog = [
  { id: 'l1', user: 'Netsanet Fikru', action: 'Created new user account', target: 'Bereket Girma', timestamp: '2026-08-17 08:12' },
  { id: 'l2', user: 'Ato Girma Wolde', action: 'Approved memo', target: 'OSTA/RD/2024/029', timestamp: '2026-08-17 07:40' },
  { id: 'l3', user: 'Netsanet Fikru', action: 'Updated role permissions', target: 'Team Leader', timestamp: '2026-08-16 16:05' },
  { id: 'l4', user: 'W/ro Hana Tesfaye', action: 'Forwarded memo', target: 'OSTA/ICT/2024/017', timestamp: '2026-08-16 14:22' },
  { id: 'l5', user: 'Netsanet Fikru', action: 'Disabled user account', target: 'Tesfaye Desta', timestamp: '2026-08-15 11:30' },
];

export const roleDefinitions: { role: string; permissions: string[] }[] = [
  { role: 'System Admin', permissions: ['Full system access', 'User & role management', 'System configuration', 'Audit log access'] },
  { role: 'Head Office', permissions: ['Final memo approval', 'All-department visibility', 'Reports & analytics', 'Directory access'] },
  { role: 'Director', permissions: ['Department memo approval', 'Forward to Head Office', 'Department reports', 'Directory access'] },
  { role: 'Team Leader', permissions: ['Team memo approval', 'Forward to Director', 'Team messaging', 'Directory access'] },
  { role: 'Employee', permissions: ['Create memos', 'Messaging & channels', 'View own dashboard', 'Directory access'] },
];

export const getUser = (id: string) => users.find((u) => u.id === id);
