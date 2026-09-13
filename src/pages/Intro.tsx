import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  CheckCircle2,
  MessageSquare,
  Archive,
  BarChart3,
  ShieldCheck,
  Globe2,
  Clock,
  ArrowRight,
  Sparkles,
  Send,
  Search,
  Check,
  ExternalLink,
  Laptop,
  Flame,
  FileCheck2,
  FolderGit2,
  UserCheck
} from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageToggle from '../components/ui/LanguageToggle';
import Button from '../components/ui/Button';
import { useAppSelector } from '../app/hooks';
import type { Role } from '../types';

export default function Intro() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const sysConfig = useAppSelector((s) => s.systemConfig);
  const [activeTab, setActiveTab] = useState<'memos' | 'approvals' | 'chat' | 'archive' | 'analytics'>('memos');
  const [selectedRole, setSelectedRole] = useState<Role>('Director');

  const isAmharic = i18n.language === 'am';

  const goToLoginWithRole = (role?: Role) => {
    navigate('/login', { state: { preselectedRole: role || selectedRole } });
  };

  const roleDetails: Record<
    Role,
    {
      titleEn: string;
      titleAm: string;
      descEn: string;
      descAm: string;
      badgeEn: string;
      badgeAm: string;
      capabilitiesEn: string[];
      capabilitiesAm: string[];
      scopeEn: string;
      scopeAm: string;
    }
  > = {
    'System Admin': {
      titleEn: 'System Administrator',
      titleAm: 'የስርዓት አስተዳዳሪ (System Admin)',
      descEn: 'Oversees organizational identity, user provisioning, system security policies, and system-wide configuration.',
      descAm: 'የተጠቃሚዎችን ምዝገባ፣ ሚናዎች፣ የስርዓት ደህንነት እና አጠቃላይ የቴክኖሎጂ አሰራርን ይቆጣጠራል።',
      badgeEn: 'Full System Control',
      badgeAm: 'ሙሉ የስርዓት ቁጥጥር',
      capabilitiesEn: [
        'User accounts & role assignment',
        'System audit logs & activity tracking',
        'Attachment size & system limits config',
        'Platform health & uptime monitoring'
      ],
      capabilitiesAm: [
        'የተጠቃሚዎች አካውንት እና ሚናዎች ማስተዳደር',
        'የስርዓቱ ኦዲት እና የተጠቃሚዎች እንቅስቃሴ መከታተያ',
        'የአባሪ ፋይሎች መጠን እና አጠቃላይ ውቅረት',
        'የስርዓቱ ጤና እና የስራ ዝግጁነት ክትትል'
      ],
      scopeEn: 'All Authority Infrastructure',
      scopeAm: 'መላው የባለስልጣን ተቋም'
    },
    'Head Office': {
      titleEn: 'Head Office / Executive Leadership',
      titleAm: 'ዋና አመራር / ዋና ጽ/ቤት (Head Office)',
      descEn: 'Directs strategic directives, authority-wide memos, executive circulars, and macro-level performance metrics.',
      descAm: 'ተቋም-አቀፍ መመሪያዎችን፣ ማስታወሻዎችን እና ስትራቴጂካዊ የውሳኔ ሃሳቦችን ያጸድቃል፣ ይመራል።',
      badgeEn: 'Executive Authority',
      badgeAm: 'ከፍተኛ የአመራር ደረጃ',
      capabilitiesEn: [
        'Issue authority-wide directives & circulars',
        'Final-tier approval of major proposals',
        'Executive dashboard & department metrics',
        'Direct confidential communication channels'
      ],
      capabilitiesAm: [
        'ተቋም-አቀፍ መመሪያዎች እና ሰርኩላሮችን ማስተላለፍ',
        'የከፍተኛ ፕሮፖዛሎች የመጨረሻ ማጽደቅ',
        'የስራ አፈፃፀም እና የሪፖርት ዳሽቦርድ መመልከት',
        'ሚስጥራዊ እና ቀጥተኛ የመልዕክት ልውውጥ'
      ],
      scopeEn: 'OSTA Authority-Wide',
      scopeAm: 'በመላው የኦሮሚያ ሳይንስ እና ቴክኖሎጂ ባለስልጣን'
    },
    Director: {
      titleEn: 'Directorate Director',
      titleAm: 'የዳይሬክቶሬት ዳይሬክተር (Director)',
      descEn: 'Manages departmental communications, reviews and approves incoming/outgoing memos, and analyzes team performance.',
      descAm: 'የዳይሬክቶሬቱን ማስታወሻዎች ይመረምራል፣ ያጸድቃል ወይም ወደ ቀጣይ ደረጃ ያስተላልፋል።',
      badgeEn: 'Directorate Level',
      badgeAm: 'የዳይሬክቶሬት ደረጃ',
      capabilitiesEn: [
        'Approve, reject, or forward departmental memos',
        'Monitor approval queues & turnaround times',
        'Department-level channels & announcements',
        'Directorate performance reports & CSV exports'
      ],
      capabilitiesAm: [
        'የማስታወሻዎችን ማጽደቅ፣ መመለስ ወይም ማስተላለፍ',
        'የውሳኔ ወረፋ እና የጊዜ አፈፃፀም መከታተል',
        'የዳይሬክቶሬት ቻናሎች እና ማስታወቂያዎች ማስተዳደር',
        'የስራ አፈፃፀም ሪፖርቶችን መመልከት እና ማውረድ'
      ],
      scopeEn: 'Designated Directorate & Sub-teams',
      scopeAm: 'የተመደበው ዳይሬክቶሬት እና ቡድኖች'
    },
    'Team Leader': {
      titleEn: 'Team Leader / Supervisor',
      titleAm: 'የቡድን መሪ (Team Leader)',
      descEn: 'Coordinates team-level memo submissions, conducts primary reviews, and coordinates channel-based projects.',
      descAm: 'የቡድን አባላት የሚያቀርቧቸውን ማስታወሻዎች የመጀመሪያ ደረጃ ግምገማ ያደርጋል፣ ይመራል።',
      badgeEn: 'Team Supervisory',
      badgeAm: 'የቡድን አመራር',
      capabilitiesEn: [
        'Primary review of staff memos & requests',
        'Forward vetted communications to Directors',
        'Team channel moderation & task collaboration',
        'Track member read-receipts & acknowledgments'
      ],
      capabilitiesAm: [
        'የሰራተኞች ማስታወሻዎች የመጀመሪያ ግምገማ',
        'የተገመገሙ ሰነዶችን ወደ ዳይሬክተሮች ማስተላለፍ',
        'የቡድን የስራ ቻናሎችን ማስተባበር',
        'የአባላት መልዕክት መቀበልና ማንበብ ማረጋገጥ'
      ],
      scopeEn: 'Specific Workgroup / Team',
      scopeAm: 'የተመደበው የስራ ቡድን'
    },
    Employee: {
      titleEn: 'Staff Member / Officer',
      titleAm: 'ሰራተኛ / ባለሙያ (Employee)',
      descEn: 'Creates formal memos, sends direct chats, participates in project channels, and accesses the document archive.',
      descAm: 'ማስታወሻዎችን ያዘጋጃል፣ በቻት እና ቻናሎች ይሳተፋል፣ የሰነድ ማህደርን ይመረምራል።',
      badgeEn: 'Standard Workspace',
      badgeAm: 'መደበኛ የስራ ቦታ',
      capabilitiesEn: [
        'Draft & submit official memos with attachments',
        'Real-time 1-on-1 chat & channel discussions',
        'Search organizational archive & staff directory',
        'Track live progress & status of submitted memos'
      ],
      capabilitiesAm: [
        'ማስታወሻዎችን ከአባሪ ጋር ማዘጋጀትና ማቅረብ',
        'የቀጥታ የውስጥ ቻት እና የቻናል ውይይቶች',
        'የተቋሙን ሰነድ ማህደር እና የሰራተኞች ዝርዝር መፈለግ',
        'የቀረቡ ማስታወሻዎችን ደረጃ በቅጽበት መከታተል'
      ],
      scopeEn: 'Personal Workspace & Assigned Channels',
      scopeAm: 'የግል የስራ ገጽ እና የተመደቡባቸው ቻናሎች'
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800 transition-colors duration-300">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-ink-100/80 border-b border-ink-200/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white dark:bg-ink-200 p-1 shadow-sm border border-ink-200 flex items-center justify-center overflow-hidden">
              <img src={sysConfig.logoUrl} alt={sysConfig.orgShortName} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink-900 tracking-tight text-base sm:text-lg">{sysConfig.orgShortName} IOCMS</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-100 text-brand-700 dark:bg-brand-50 dark:text-brand-300">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-ink-400 font-medium hidden md:block">
                {isAmharic ? 'የኦሮሚያ ሳይንስ እና ቴክኖሎጂ ባለስልጣን' : sysConfig.orgName}
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              {isAmharic ? 'ዋና ዋና ክፍሎች' : 'Key Modules'}
            </a>
            <a href="#workflow" className="hover:text-brand-600 transition-colors">
              {isAmharic ? 'የስራ ሂደት' : 'Workflow'}
            </a>
            <a href="#roles" className="hover:text-brand-600 transition-colors">
              {isAmharic ? 'የተጠቃሚ ሚናዎች' : 'Roles & Matrix'}
            </a>
            <a href="#architecture" className="hover:text-brand-600 transition-colors">
              {isAmharic ? 'ደህንነት እና ቴክኖሎጂ' : 'Security & Tech'}
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              onClick={() => goToLoginWithRole()}
              size="sm"
              className="font-medium shadow-sm flex items-center gap-1.5"
            >
              <span>{isAmharic ? 'ግባ' : 'Sign In'}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-ink-200/60">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 bg-brand-500/10 dark:bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 dark:bg-brand-50/80 border border-brand-200/60 dark:border-brand-200/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
              <Sparkles className="size-3.5 text-brand-600" />
              <span>
                {isAmharic
                  ? 'የተቋም የውስጥ ግንኙነት እና የስራ ፍሰት ማስተዳደሪያ ስርዓት'
                  : 'Official Intra-Office Communication & Workflow Management System'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 tracking-tight leading-[1.15] mb-6">
              {isAmharic ? (
                <>
                  ፈጣን፣ አስተማማኝ እና ዲጂታል{' '}
                  <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                    የተቋም ግንኙነት
                  </span>{' '}
                  ለኦሮሚያ ሳይንስ እና ቴክኖሎጂ ባለስልጣን
                </>
              ) : (
                sysConfig.introHeroTitle
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-ink-500 max-w-3xl mx-auto leading-relaxed mb-8">
              {isAmharic
                ? 'IOCMS የወረቀት ስራን በማስቀረት የማስታወሻዎችን (Memos) ዝግጅት፣ ደረጃ በደረጃ ማጽደቅ (Multi-tier Approvals)፣ የቀጥታ መልዕክት መላላክ እና የተሟላ ዲጂታል የሰነድ ማህደርን በአንድ ላይ ያቀናጃል።'
                : sysConfig.introHeroSubtitle}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
              <Button
                onClick={() => goToLoginWithRole()}
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-md shadow-brand-600/20 flex items-center justify-center gap-2"
              >
                <span>{isAmharic ? 'ወደ ሲስተሙ ግባ' : 'Enter IOCMS Portal'}</span>
                <ArrowRight className="size-4" />
              </Button>

              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-ink-200 dark:border-ink-200 bg-white dark:bg-ink-100 hover:bg-ink-50 dark:hover:bg-ink-200 text-ink-700 font-medium text-sm transition-colors text-center"
              >
                {isAmharic ? 'አገልግሎቶችን ያስሱ' : 'Explore System Features'}
              </a>

              <a
                href="#roles"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-transparent hover:border-ink-200 text-ink-600 hover:text-ink-900 font-medium text-sm transition-colors text-center"
              >
                {isAmharic ? 'የሚናዎች ማሳያ' : 'Role Sandbox'}
              </a>
            </div>

            {/* Key KPI Highlights Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-white dark:bg-ink-100 border border-ink-200/80 shadow-xs text-left">
                <div className="flex items-center gap-2 text-brand-600 mb-1">
                  <FileCheck2 className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    {isAmharic ? 'ወረቀት አልባ' : 'Paperless'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-ink-900">100%</div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {isAmharic ? 'ዲጂታል ማስታወሻዎች' : 'Digital Memo Lifecycle'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-ink-100 border border-ink-200/80 shadow-xs text-left">
                <div className="flex items-center gap-2 text-success-500 mb-1">
                  <Clock className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    {isAmharic ? 'ፍጥነት' : 'Turnaround'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-ink-900">&lt; 2.4h</div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {isAmharic ? 'አማካይ የማጽደቂያ ጊዜ' : 'Avg. Approval Latency'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-ink-100 border border-ink-200/80 shadow-xs text-left">
                <div className="flex items-center gap-2 text-warning-500 mb-1">
                  <Globe2 className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    {isAmharic ? 'ቋንቋ' : 'Languages'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-ink-900">Bilingual</div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {isAmharic ? 'አማርኛ እና እንግሊዝኛ' : 'English & Amharic'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-ink-100 border border-ink-200/80 shadow-xs text-left">
                <div className="flex items-center gap-2 text-info-500 mb-1">
                  <ShieldCheck className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    {isAmharic ? 'ደህንነት' : 'Security'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-ink-900">RBAC</div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {isAmharic ? '5 የተዋረድ ሚናዎች' : '5 Tiered Roles'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Tour Section */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-50 px-3 py-1 rounded-full mb-3">
            <Laptop className="size-3.5" />
            <span>{isAmharic ? 'የስርዓቱ ዋና ክፍሎች' : 'Interactive Platform Modules'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
            {isAmharic
              ? 'ሁሉንም የተቋም ግንኙነቶች በአንድ የተሟላ መድረክ'
              : 'Everything Your Authority Needs in One Platform'}
          </h2>
          <p className="text-ink-500 text-sm sm:text-base mt-3">
            {isAmharic
              ? 'የማስታወሻዎች ዝግጅት፣ የውሳኔ አሰጣጥ ወረፋ፣ የቀጥታ የሰራተኞች ቻት እና የማህደር ፍለጋን በቅጽበት ይሞክሩ።'
              : 'Switch between key modules below to see how IOCMS handles every stage of official communication.'}
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {[
            { id: 'memos', icon: FileText, labelEn: 'Memos & Routing', labelAm: 'ማስታወሻዎችና ስርጭት' },
            { id: 'approvals', icon: CheckCircle2, labelEn: 'Approval Engine', labelAm: 'የማጽደቂያ ሂደት' },
            { id: 'chat', icon: MessageSquare, labelEn: 'Chat & Channels', labelAm: 'ቻት እና ቻናሎች' },
            { id: 'archive', icon: Archive, labelEn: 'Document Archive', labelAm: 'የሰነድ ማህደር' },
            { id: 'analytics', icon: BarChart3, labelEn: 'Analytics & Reports', labelAm: 'ሪፖርቶችና ትንታኔ' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  active
                    ? 'bg-brand-700 text-white shadow-sm shadow-brand-700/30'
                    : 'bg-white dark:bg-ink-100 text-ink-600 hover:bg-ink-100 dark:hover:bg-ink-200 border border-ink-200'
                }`}
              >
                <Icon className={`size-4 ${active ? 'text-white' : 'text-brand-600'}`} />
                <span>{isAmharic ? tab.labelAm : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Feature Sandbox Display Card */}
        <div className="bg-white dark:bg-ink-100 rounded-2xl border border-ink-200 shadow-xl overflow-hidden animate-slide-up">
          {/* Card Header Topbar */}
          <div className="px-6 py-4 border-b border-ink-200 flex items-center justify-between bg-ink-50/50 dark:bg-ink-200/40">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-danger-500/80 inline-block" />
                <span className="size-3 rounded-full bg-warning-500/80 inline-block" />
                <span className="size-3 rounded-full bg-success-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-ink-400 ml-2">
                IOCMS Portal // {activeTab.toUpperCase()}_VIEW
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-success-500 font-medium">
                <span className="size-2 rounded-full bg-success-500 animate-pulse" />
                Live Demo Preview
              </span>
            </div>
          </div>

          {/* Card Body Content according to Active Tab */}
          <div className="p-6 sm:p-8">
            {activeTab === 'memos' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-50 dark:text-brand-300">
                    <FileText className="size-3.5" />
                    <span>{isAmharic ? 'የማስታወሻ አስተዳደር' : 'Formal Memo Pipeline'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900">
                    {isAmharic
                      ? 'የተሟላ የማስታወሻዎች ዝግጅት፣ ደረጃ በደረጃ ክትትል እና ዲጂታል ፊርማ'
                      : 'End-to-End Official Memo Creation, Tracking & Distribution'}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">
                    {isAmharic
                      ? 'ሰራተኞች እና የስራ ሃላፊዎች ማስታወሻዎችን በቀላሉ ያዘጋጃሉ፣ አባሪዎችን ያያይዛሉ፣ የአስቸኳይነት ደረጃን (Urgent, High, Normal) ይመርጣሉ እንዲሁም ማስታወሻው በማን እንደተነበበ በቅጽበት ይከታተላሉ።'
                      : 'Draft, format, and dispatch official communications with granular priority tags, multi-department recipient routing, file attachments, and real-time recipient read receipts.'}
                  </p>
                  <ul className="space-y-2 text-sm text-ink-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? '4 የሰነድ ዓይነቶች (Official Memo, Circular, Notice, Directive)' : '4 Formal Document Types (Memo, Circular, Notice, Directive)'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የቀጥታ ደረጃ ክትትል (Draft → Under Review → Approved)' : 'Stage Pipeline (Issued → Received → Reviewed → Approved)'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የማንበብ ማረጋገጫ (Read / Delivered / Pending Status)' : 'Granular Read Receipts per individual recipient'}</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Button onClick={() => goToLoginWithRole('Employee')} size="sm">
                      {isAmharic ? 'ማስታወሻዎችን ይሞክሩ' : 'Try Memo Creation in Demo'}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  {/* Mock Memo UI Preview Card */}
                  <div className="p-5 rounded-xl border border-ink-200 bg-ink-50 dark:bg-ink-200/50 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger-100 text-danger-500 flex items-center gap-1">
                        <Flame className="size-3" /> Urgent Priority
                      </span>
                      <span className="text-xs text-ink-400 font-mono">REF: OSTA/ICT/2026/089</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-ink-900">
                        {isAmharic
                          ? 'የ2018 ዓ.ም የዲጂታል ቴክኖሎጂ ትግበራ እና የኔትወርክ ማሻሻያ እቅድ'
                          : 'Q4 Technology Infrastructure Upgrade & High-Speed Network Rollout'}
                      </h4>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {isAmharic ? 'ከ: አቶ ሚካኤል (ICT ዳይሬክተር) | ወደ: ሁሉም የስራ ክፍሎች' : 'From: Michael K. (ICT Director) • To: All Directorates'}
                      </p>
                    </div>

                    {/* Progress tracker mockup */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                        Workflow Status: Under Review (2/3 Approved)
                      </div>
                      <div className="w-full bg-ink-200 dark:bg-ink-300 rounded-full h-2 overflow-hidden flex">
                        <div className="bg-success-500 h-full w-2/3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ink-200 text-center">
                      <div className="p-2 rounded-lg bg-white dark:bg-ink-100 border border-ink-200">
                        <div className="text-xs text-ink-400">Delivered</div>
                        <div className="font-bold text-sm text-ink-900">28 Staff</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-ink-100 border border-ink-200">
                        <div className="text-xs text-ink-400">Read</div>
                        <div className="font-bold text-sm text-brand-600">24 Staff</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-ink-100 border border-ink-200">
                        <div className="text-xs text-ink-400">Signatures</div>
                        <div className="font-bold text-sm text-success-500">Verified ✓</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-success-100 text-success-500 dark:bg-success-100 dark:text-success-500">
                    <CheckCircle2 className="size-3.5" />
                    <span>{isAmharic ? 'የውሳኔ እና ማጽደቂያ ስርዓት' : 'Hierarchical Approval Routing'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900">
                    {isAmharic
                      ? 'የተዋረድ ውሳኔዎች በደቂቃዎች ውስጥ ከሙሉ አስተያየት እና ታሪክ ጋር'
                      : 'Multi-Tier Decision Making with Full Audit History & Comments'}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">
                    {isAmharic
                      ? 'የቡድን መሪዎች፣ ዳይሬክተሮች እና የዋና ጽ/ቤት አመራሮች ማስታወሻዎችን ይመረምራሉ፣ ያጸድቃሉ፣ ያሻሽላሉ ወይም ወደ ቀጣይ ሃላፊ ያስተላልፋሉ።'
                      : 'Review incoming requests effortlessly. Approve with a single click, request revisions, or forward up the chain of authority with recorded audit remarks.'}
                  </p>
                  <ul className="space-y-2 text-sm text-ink-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'አጽድቅ (Approve)፣ መልስ (Reject)፣ አስተላልፍ (Forward)' : 'Approve, Reject, or Forward with institutional audit logs'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የተዋረድ ሰንሰለት (Approval Chain visualization)' : 'Visual sequential hierarchy approval tracking'}</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Button onClick={() => goToLoginWithRole('Director')} size="sm">
                      {isAmharic ? 'የማጽደቂያ ገጽን ይሞክሩ' : 'Test Approvals Queue as Director'}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  {/* Mock Approvals Chain */}
                  <div className="p-5 rounded-xl border border-ink-200 bg-ink-50 dark:bg-ink-200/50 space-y-3">
                    <div className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">
                      Approval Chain Progress
                    </div>
                    {[
                      { role: 'Team Leader', name: 'Almaz T.', action: 'Approved', time: '10:15 AM', status: 'done' },
                      { role: 'Director (ICT)', name: 'Michael K.', action: 'Approved with comments', time: '11:30 AM', status: 'done' },
                      { role: 'Head Office', name: 'Dr. Gemechu D.', action: 'Pending Action', time: 'Awaiting Sign-off', status: 'pending' }
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          step.status === 'done'
                            ? 'bg-white dark:bg-ink-100 border-success-500/30'
                            : 'bg-brand-50 dark:bg-brand-50/50 border-brand-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              step.status === 'done'
                                ? 'bg-success-100 text-success-500'
                                : 'bg-brand-100 text-brand-700'
                            }`}
                          >
                            {step.status === 'done' ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-ink-900">{step.role} · {step.name}</div>
                            <div className="text-[11px] text-ink-500">{step.action}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-ink-400">{step.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-info-100 text-info-500 dark:bg-info-100 dark:text-info-500">
                    <MessageSquare className="size-3.5" />
                    <span>{isAmharic ? 'የቀጥታ የውስጥ መልዕክት' : 'Real-Time Messaging & Channels'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900">
                    {isAmharic
                      ? 'የሰራተኞች የቀጥታ ቻት እና የዳይሬክቶሬት የውይይት ቻናሎች'
                      : 'Encrypted 1-on-1 Direct Chat & Collaborative Channels'}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">
                    {isAmharic
                      ? 'ከስራ ባልደረቦችዎ ጋር በቀጥታ ይወያዩ፣ በጋራ ቻናሎች ላይ ማስታወቂያዎችን ያጋሩ እና ፋይሎችን በቅጽበት ይላኩ።'
                      : 'Connect with team members instantly. Broadcast announcements on official channels or conduct confidential direct discussions.'}
                  </p>
                  <ul className="space-y-2 text-sm text-ink-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የዳይሬክቶሬት ቻናሎች (#ict-rnd, #science-innovation, #general)' : 'Departmental channels (#ict-rnd, #science-innovation, #announcements)'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የፋይል እና የሰነድ አባሪዎች መላክ' : 'Instant document and attachment sharing'}</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Button onClick={() => goToLoginWithRole('Employee')} size="sm">
                      {isAmharic ? 'ቻትን ይሞክሩ' : 'Explore Chat in Workspace'}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  {/* Mock Chat View */}
                  <div className="p-4 rounded-xl border border-ink-200 bg-ink-50 dark:bg-ink-200/50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-ink-200">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full bg-success-500" />
                        <span className="text-xs font-bold text-ink-900"># announcements-osta</span>
                      </div>
                      <span className="text-[11px] text-ink-400">42 Members Active</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-ink-100 border border-ink-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-700 dark:text-brand-300">Michael K. (Director)</span>
                          <span className="text-[10px] text-ink-400 font-mono">09:12 AM</span>
                        </div>
                        <p className="text-ink-700">
                          {isAmharic
                            ? 'ሰላም የስራ ባልደረቦች፣ የሩብ አመት የስራ ግምገማ ሪፖርት በማህደር ውስጥ ተቀምጧል። እባክዎ ይመልከቱት።'
                            : 'Good morning team. The quarterly innovation report is now archived in IOCMS for review.'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-50/60 border border-brand-200 ml-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink-900">Sara B. (Lead Analyst)</span>
                          <span className="text-[10px] text-ink-400 font-mono">09:15 AM</span>
                        </div>
                        <p className="text-ink-700">
                          {isAmharic
                            ? 'ተቀብለናል፣ የማጠቃለያ ማስታወሻውን አሁን አዘጋጅተን እንልካለን።'
                            : 'Received! We are preparing the memo summary now.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'archive' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-warning-100 text-warning-500 dark:bg-warning-100 dark:text-warning-500">
                    <Archive className="size-3.5" />
                    <span>{isAmharic ? 'የሰነድ ማህደር' : 'Centralized Institutional Archive'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900">
                    {isAmharic
                      ? 'ፈጣን የሰነዶች ፍለጋ፣ የማጣሪያ አማራጮች እና ቋሚ ማከማቻ'
                      : 'Instant Keyword Search, Departmental Indexing & Permanent Retention'}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">
                    {isAmharic
                      ? 'የተፈረሙ ማስታወሻዎች፣ ይፋዊ ደብዳቤዎች እና ሪፖርቶች በደህንነት ተቀምጠው በማንኛውም ሰዓት በቁልፍ ቃላት ወይም በስራ ክፍል ይፈለጋሉ።'
                      : 'Never lose institutional knowledge. Every issued circular, directive, and memo is indexed for instant retrieval with permission governance.'}
                  </p>
                  <ul className="space-y-2 text-sm text-ink-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'በቁልፍ ቃል እና በዳይሬክቶሬት ፈጣን ፍለጋ' : 'Full-text keyword & metadata filters'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የሰነዶች ቅድመ እይታ እና ማውረድ' : 'Document preview with full sender & date stamps'}</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Button onClick={() => goToLoginWithRole('Employee')} size="sm">
                      {isAmharic ? 'ማህደርን ይክፈቱ' : 'Access Archive in Demo'}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  {/* Mock Archive List */}
                  <div className="p-4 rounded-xl border border-ink-200 bg-ink-50 dark:bg-ink-200/50 space-y-2.5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400" />
                      <input
                        type="text"
                        readOnly
                        value="ICT Strategic Policy 2026"
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-ink-200 bg-white dark:bg-ink-100 text-xs font-mono"
                      />
                    </div>
                    {[
                      { code: 'MEMO-2026-089', title: 'ICT Infrastructure & Network Protocol', dept: 'ICT Directorate', date: 'Aug 24, 2026' },
                      { code: 'DIR-2026-014', title: 'Science & Innovation Grant Guidelines', dept: 'Research Directorate', date: 'Aug 18, 2026' },
                      { code: 'CIRC-2026-003', title: 'Office Working Hours & System Protocols', dept: 'Administration', date: 'Aug 10, 2026' }
                    ].map((doc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-ink-100 border border-ink-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono text-[10px] font-semibold text-brand-600 bg-brand-50 dark:bg-brand-50 px-1.5 py-0.5 rounded mr-2">
                            {doc.code}
                          </span>
                          <span className="font-semibold text-ink-900">{doc.title}</span>
                          <div className="text-[10px] text-ink-400 mt-0.5">{doc.dept}</div>
                        </div>
                        <span className="text-[10px] text-ink-400 font-mono">{doc.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-50 dark:text-brand-300">
                    <BarChart3 className="size-3.5" />
                    <span>{isAmharic ? 'የስራ አፈፃፀም ሪፖርት' : 'Executive Reporting & Analytics'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900">
                    {isAmharic
                      ? 'የተቋሙን የመልዕክት ዝውውር እና የአፈፃፀም ፍጥነት በግራፍ ይመልከቱ'
                      : 'Data-Driven Insights on Departmental Workload & Velocity'}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">
                    {isAmharic
                      ? 'በእያንዳንዱ ዳይሬክቶሬት የተላኩ ማስታወሻዎች፣ የውሳኔ ፍጥነት፣ የሰራተኞች እርካታ እና የሰነድ ሁኔታዎችን በግራፍ ይተንትኑ።'
                      : 'Evaluate throughput metrics, monitor bottlenecks across departments, and export consolidated reports for executive decisions.'}
                  </p>
                  <ul className="space-y-2 text-sm text-ink-700">
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የግንኙነት መጠን በየስራ ክፍሉ (Volume by Department)' : 'Live volume distribution charts'}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="size-4 text-success-500 shrink-0" />
                      <span>{isAmharic ? 'የውሂብ ወደ CSV ማውረጃ (Export to CSV)' : 'One-click CSV dataset export'}</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Button onClick={() => goToLoginWithRole('Head Office')} size="sm">
                      {isAmharic ? 'ሪፖርቶችን ይመልከቱ' : 'View Reports as Executive'}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  {/* Mock Analytics Cards */}
                  <div className="p-5 rounded-xl border border-ink-200 bg-ink-50 dark:bg-ink-200/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white dark:bg-ink-100 border border-ink-200">
                        <div className="text-[11px] text-ink-400">Total Volume</div>
                        <div className="text-xl font-bold text-brand-600">1,482</div>
                        <div className="text-[10px] text-success-500">↑ 18% this month</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-ink-100 border border-ink-200">
                        <div className="text-[11px] text-ink-400">Resolution Rate</div>
                        <div className="text-xl font-bold text-success-500">96.4%</div>
                        <div className="text-[10px] text-ink-400">Under 24 hours</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-ink-100 border border-ink-200 space-y-2">
                      <div className="text-xs font-bold text-ink-900">Volume by Directorate</div>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <div className="flex justify-between text-ink-600 mb-0.5">
                            <span>ICT & Digital Systems</span>
                            <span>420 memos (38%)</span>
                          </div>
                          <div className="w-full bg-ink-100 rounded-full h-1.5">
                            <div className="bg-brand-600 h-1.5 rounded-full w-[38%]" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-ink-600 mb-0.5">
                            <span>Science & Technology Innovation</span>
                            <span>315 memos (28%)</span>
                          </div>
                          <div className="w-full bg-ink-100 rounded-full h-1.5">
                            <div className="bg-success-500 h-1.5 rounded-full w-[28%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Pipeline Section */}
      <section id="workflow" className="py-16 sm:py-24 bg-ink-100/50 dark:bg-ink-200/30 border-y border-ink-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-50 px-3 py-1 rounded-full mb-3">
              <FolderGit2 className="size-3.5" />
              <span>{isAmharic ? 'የስራ ፍሰት ሂደት' : 'Official Workflow Pipeline'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
              {isAmharic
                ? 'ከማስታወሻ ዝግጅት እስከ ቋሚ ማህደር — 4 ቀላል ደረጃዎች'
                : 'From Composition to Permanent Archive in 4 Steps'}
            </h2>
            <p className="text-ink-500 text-sm sm:text-base mt-3">
              {isAmharic
                ? 'የተሟላ ግልጽነት እና ተጠያቂነት ያለው የተቋም አሰራር'
                : 'A transparent, traceable, and automated governance lifecycle.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                titleEn: 'Draft & Compose',
                titleAm: 'ማዘጋጀትና ማቅረብ',
                descEn: 'Staff member drafts memo, attaches documents, defines priority, and assigns designated recipients.',
                descAm: 'ሰራተኛው ማስታወሻ ያዘጋጃል፣ አባሪዎችን ያያይዛል፣ የአስቸኳይነት ደረጃን መርጦ ለሃላፊው ያቀርባል።',
                icon: FileText,
                color: 'text-brand-600 bg-brand-50 dark:bg-brand-50'
              },
              {
                step: '02',
                titleEn: 'Hierarchical Review',
                titleAm: 'የተዋረድ ግምገማና ውሳኔ',
                descEn: 'Routed sequentially through Team Leaders, Directors, or Head Office for scrutiny, edits, or approval.',
                descAm: 'በቡድን መሪዎች፣ ዳይሬክተሮች ወይም በዋና አመራሩ ተገምግሞ ይጸድቃል ወይም አስተያየት ይሰጥበታል።',
                icon: CheckCircle2,
                color: 'text-success-500 bg-success-100 dark:bg-success-100'
              },
              {
                step: '03',
                titleEn: 'Instant Dispatch',
                titleAm: 'ፈጣን ስርጭትና ማረጋገጫ',
                descEn: 'Instant delivery to recipients across departments with live tracking of read receipts and acknowledgments.',
                descAm: 'በቅጽበት ለሁሉም ተደራሾች ይሰራጫል፤ ማን እንደተመለከተውም በማረጋገጫ ቆጣሪ ይታያል።',
                icon: Send,
                color: 'text-info-500 bg-info-100 dark:bg-info-100'
              },
              {
                step: '04',
                titleEn: 'Classified Archive',
                titleAm: 'የማህደር ማከማቻ',
                descEn: 'Automatically archived with reference IDs, timestamps, and metadata for future audit compliance.',
                descAm: 'የማመሳከሪያ ቁጥር ተሰጥቶት ለወደፊት ኦዲት እና መረጃ ፍለጋ በቋሚ ማህደር ውስጥ ይቀመጣል።',
                icon: Archive,
                color: 'text-warning-500 bg-warning-100 dark:bg-warning-100'
              }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-ink-100 border border-ink-200 shadow-xs relative hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${st.color}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className="text-2xl font-mono font-extrabold text-ink-300">
                      {st.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 mb-2">
                    {isAmharic ? st.titleAm : st.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                    {isAmharic ? st.descAm : st.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Access Explorer */}
      <section id="roles" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-50 px-3 py-1 rounded-full mb-3">
            <UserCheck className="size-3.5" />
            <span>{isAmharic ? 'የተጠቃሚ ሚናዎች ማትሪክስ' : 'Role-Based Access Matrix'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
            {isAmharic
              ? '5 የተቋም ሚናዎች ለእያንዳንዱ የስራ ደረጃ የተዘጋጁ'
              : '5 Institutional Roles Built for Organizational Clarity'}
          </h2>
          <p className="text-ink-500 text-sm sm:text-base mt-3">
            {isAmharic
              ? 'ሚና በመምረጥ ለእያንዳንዱ የስራ ሃላፊነት የተዘጋጀውን የስራ ገጽ እና ፈቃድ ይመልከቱ።'
              : 'Select a role below to see tailored access, capabilities, and launch an instant demo.'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {(Object.keys(roleDetails) as Role[]).map((r) => {
            const isSelected = selectedRole === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-brand-50 dark:bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                    : 'bg-white dark:bg-ink-100 border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="text-xs font-semibold text-brand-600 mb-1">
                  {isAmharic ? roleDetails[r].badgeAm : roleDetails[r].badgeEn}
                </div>
                <div className="font-bold text-sm text-ink-900">{r}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Deep-Dive Card */}
        {selectedRole && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-100 border border-ink-200 shadow-lg animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-ink-200">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 dark:bg-brand-50 dark:text-brand-300">
                  {isAmharic ? roleDetails[selectedRole].badgeAm : roleDetails[selectedRole].badgeEn}
                </span>
                <h3 className="text-2xl font-bold text-ink-900 mt-2">
                  {isAmharic ? roleDetails[selectedRole].titleAm : roleDetails[selectedRole].titleEn}
                </h3>
                <p className="text-sm text-ink-500 mt-1 max-w-2xl">
                  {isAmharic ? roleDetails[selectedRole].descAm : roleDetails[selectedRole].descEn}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => goToLoginWithRole(selectedRole)}
                  size="lg"
                  className="whitespace-nowrap flex items-center gap-2 shadow-sm"
                >
                  <span>{isAmharic ? `እንደ ${selectedRole} ግባ` : `Launch Portal as ${selectedRole}`}</span>
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                  {isAmharic ? 'የስራ ፈቃዶች እና አገልግሎቶች' : 'Key Permissions & Accessible Tools'}
                </h4>
                <ul className="space-y-2.5 text-sm text-ink-700">
                  {(isAmharic
                    ? roleDetails[selectedRole].capabilitiesAm
                    : roleDetails[selectedRole].capabilitiesEn
                  ).map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-success-500 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-200/50 border border-ink-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">
                  {isAmharic ? 'የስራ ወሰን (Operational Scope)' : 'Operational Scope & Jurisdiction'}
                </h4>
                <div className="text-base font-semibold text-ink-900 mb-2">
                  {isAmharic ? roleDetails[selectedRole].scopeAm : roleDetails[selectedRole].scopeEn}
                </div>
                <p className="text-xs text-ink-500">
                  {isAmharic
                    ? 'በIOCMS ውስጥ ያሉ ሁሉም መረጃዎች እና የማጽደቂያ መስመሮች በዚህ ሚና መሰረት በደህንነት የተገደቡ ናቸው።'
                    : 'All memo routes, approval delegations, and channel accesses are strictly validated against this security profile.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Security, Compliance & Localization Highlights */}
      <section id="architecture" className="py-16 sm:py-24 bg-ink-100/50 dark:bg-ink-200/30 border-t border-ink-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-50 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="size-3.5" />
              <span>{isAmharic ? 'ደህንነት እና አስተማማኝነት' : 'Enterprise Governance'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-ink-900">
              {isAmharic
                ? 'ለተቋማዊ ደህንነት እና ቀጣይነት የተገነባ'
                : 'Built with Institutional Rigor & High Security'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-ink-100 border border-ink-200 shadow-xs">
              <div className="size-10 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-50 dark:text-brand-300 flex items-center justify-center mb-4">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">
                {isAmharic ? 'የሚና-ተኮር የደህንነት ቁጥጥር' : 'Role-Based Access Control'}
              </h3>
              <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                {isAmharic
                  ? 'የተጠቃሚዎች ፈቃድ በስራ ደረጃቸው ብቻ የተገደበ ሲሆን፣ ሚስጥራዊ የሆኑ ሰነዶች ተደራሽ የሚሆኑት ለተፈቀደላቸው ሃላፊዎች ብቻ ነው።'
                  : 'Strict authentication guards and route-level role verification ensure confidential memos remain accessible only to authorized personnel.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-100 border border-ink-200 shadow-xs">
              <div className="size-10 rounded-xl bg-success-100 text-success-500 dark:bg-success-100 dark:text-success-500 flex items-center justify-center mb-4">
                <Globe2 className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">
                {isAmharic ? 'ሁለት ቋንቋ ተናጋሪ (Bilingual)' : 'Native Bilingual Interface'}
              </h3>
              <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                {isAmharic
                  ? 'ሙሉ ሲስተሙ በአማርኛ እና በእንግሊዝኛ ቋንቋዎች ያለ ምንም እንከን በአንድ ጠቅታ ይቀያየራል።'
                  : 'Seamless instantaneous language switching between Amharic (አማርኛ) and English across all buttons, forms, and charts.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-100 border border-ink-200 shadow-xs">
              <div className="size-10 rounded-xl bg-info-100 text-info-500 dark:bg-info-100 dark:text-info-500 flex items-center justify-center mb-4">
                <FileCheck2 className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-ink-900 mb-2">
                {isAmharic ? 'የተሟላ የኦዲት ታሪክ' : 'Complete Audit Traceability'}
              </h3>
              <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                {isAmharic
                  ? 'እያንዳንዱ የማስታወሻ ዝውውር፣ የማጽደቅ ውሳኔ እና የጊዜ ማህተም በሲስተሙ ውስጥ ለዘለቄታው ይመዘገባል።'
                  : 'Every memo issuance, forward, approval, and read confirmation is immutably timestamped for institutional compliance.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="size-16 mx-auto rounded-2xl bg-white p-2 shadow-2xl flex items-center justify-center overflow-hidden mb-6 ring-4 ring-white/10">
            <img src={sysConfig.logoUrl} alt={sysConfig.orgShortName} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 !text-white drop-shadow-sm">
            {isAmharic
              ? 'የተቋሙን የውስጥ ግንኙነት ዛሬውኑ ይቀላቀሉ'
              : 'Experience Modern Intra-Office Communication at OSTA'}
          </h2>
          <p className="text-brand-200 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            {isAmharic
              ? 'በቀጥታ ወደ መለያዎ በመግባት ማስታወሻዎችን ያዘጋጁ፣ ያጽድቁ እና ከስራ ባልደረቦችዎ ጋር ይገናኙ።'
              : 'Sign in to access your role-specific dashboard, active memos queue, departmental channels, and document archive.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goToLoginWithRole()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white !text-brand-950 hover:bg-brand-50 hover:!text-brand-900 font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer border border-white/20"
            >
              <span className="!text-brand-950 font-bold">{isAmharic ? 'ወደ ሲስተም ግባ' : 'Sign in to IOCMS'}</span>
              <ArrowRight className="size-4 !text-brand-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-white dark:bg-ink-100 border-t border-ink-200 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-700">OSTA IOCMS</span>
            <span>•</span>
            <span>{isAmharic ? 'የኦሮሚያ ሳይንስ እና ቴክኖሎጂ ባለስልጣን' : 'Oromia Science & Technology Authority'}</span>
          </div>
          <div>
            {isAmharic
              ? '© 2026 የኦሮሚያ ሳይንስ እና ቴክኖሎጂ ባለስልጣን። መብቱ በህግ የተጠበቀ ነው።'
              : '© 2026 Oromia Science & Technology Authority. All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
}
