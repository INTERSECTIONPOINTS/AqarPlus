// worker/src/workspaceDo.ts
import { DurableObject } from "cloudflare:workers";

// server/seed.ts
var DEFAULT_ROLE_PERMISSIONS = {
  sys_owner: [
    "view_all",
    "manage_properties",
    "manage_tenants",
    "manage_contracts",
    "collect_payments",
    "reverse_receipts",
    "manage_accounting",
    "create_expense",
    "approve_expense_supervisor",
    "approve_expense_manager",
    "manage_maintenance",
    "execute_maintenance",
    "manage_tasks",
    "manage_documents",
    "manage_users",
    "backup_restore",
    "view_audit"
  ],
  gm: [
    "view_all",
    "manage_properties",
    "manage_tenants",
    "manage_contracts",
    "collect_payments",
    "reverse_receipts",
    "manage_accounting",
    "create_expense",
    "approve_expense_supervisor",
    "approve_expense_manager",
    "manage_maintenance",
    "execute_maintenance",
    "manage_tasks",
    "manage_documents",
    "manage_users",
    "backup_restore",
    "view_audit"
  ],
  accountant: [
    "view_all",
    "collect_payments",
    "reverse_receipts",
    "manage_accounting",
    "create_expense",
    "manage_documents",
    "view_audit"
  ],
  leasing: [
    "manage_properties",
    "manage_tenants",
    "manage_contracts",
    "manage_tasks",
    "manage_documents"
  ],
  supervisor: [
    "manage_properties",
    "manage_tenants",
    "create_expense",
    "approve_expense_supervisor",
    "manage_maintenance",
    "manage_tasks",
    "manage_documents"
  ],
  maint_manager: [
    "manage_maintenance",
    "execute_maintenance",
    "manage_tasks",
    "create_expense",
    "approve_expense_supervisor",
    "manage_documents"
  ],
  technician: ["execute_maintenance", "manage_tasks", "create_expense"],
  receptionist: ["manage_tenants", "manage_tasks", "manage_documents"],
  auditor: ["view_all", "view_audit"],
  owner: []
};
function createInitialSeed() {
  const now = "2026-11-14T10:15:00.000Z";
  return {
    settings: {
      nameAr: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
      nameEn: "Dar Al-Ofoq Property Management Co.",
      vatNumber: "310482910300003",
      crNumber: "1010648291",
      city: "\u0627\u0644\u0631\u064A\u0627\u0636",
      address: "\u0637\u0631\u064A\u0642 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F\u060C \u062D\u064A \u0627\u0644\u0639\u0644\u064A\u0627\u060C \u0628\u0631\u062C \u0627\u0644\u0623\u0639\u0645\u0627\u0644\u060C \u0627\u0644\u062F\u0648\u0631 4",
      mapLat: 24.7136,
      mapLng: 46.6753,
      phone: "0114892200",
      whatsapp: "966505123400",
      email: "ops@aqarplus.sa",
      ejarApiMode: "PDF + \u0645\u0637\u0627\u0628\u0642\u0629 \u064A\u062F\u0648\u064A\u0629",
      zatcaPhase: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 (QR + \u0623\u0631\u0634\u0641\u0629)",
      supervisorApprovalThreshold: 500,
      managerApprovalThreshold: 2e3,
      defaultManagementFeePercent: 5,
      baseCurrency: "SAR",
      currencyRatesToSar: {
        SAR: 1,
        AED: 1.021,
        USD: 3.75,
        EGP: 0.077,
        KWD: 12.22
      },
      dateCalendar: "\u0647\u062C\u0631\u064A \u0648\u0645\u064A\u0644\u0627\u062F\u064A",
      bankAccounts: [
        {
          id: "bnk-1",
          bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (SNB)",
          iban: "SA1910000041200008819201",
          accountHolder: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
          isDefault: true,
          showOnReceipts: true
        },
        {
          id: "bnk-2",
          bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
          iban: "SA4480000123608010778899",
          accountHolder: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062C\u0646\u064A\u062F\u0644 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629 - \u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u062D\u0635\u064A\u0644",
          isDefault: false,
          showOnReceipts: true
        }
      ],
      receiptBranding: {
        layout: "portrait",
        showLogo: true,
        showVat: true,
        showQr: true,
        showSignature: true,
        showWatermark: true,
        accentColor: "#26478D"
      },
      generalPrefs: {
        language: "ar",
        rtlAuto: true,
        currency: "SAR",
        calendar: "both",
        dateFormat: "DD/MM/YYYY",
        numeralFormat: "en",
        timezone: "Asia/Riyadh (UTC+3)",
        themeMode: "dark"
      },
      securityCenter: {
        lockMethod: "pin",
        patternCode: "1-4-7-8-9",
        autoLockTiming: "5m",
        requirePinBeforeDeleteReceipt: true,
        requirePinBeforeCancelPayment: true,
        requirePinBeforeEditContract: true,
        requirePinBeforeExportData: false
      },
      notificationsCenter: {
        inApp: {
          rentDueBefore: true,
          rentDueDay: true,
          rentDueAfter: true,
          contractExpiry: true,
          maintenanceTickets: true,
          assignedTasks: true,
          syncUpdates: true
        },
        push: {
          rentDue: true,
          contractExpiry: true,
          maintenance: true,
          tasks: true,
          sync: false
        },
        workHoursEnabled: true,
        workHoursStart: "08:00",
        workHoursEnd: "20:00",
        whatsappAutoEnabled: true,
        whatsappDefaultTemplates: {
          rentDueId: "tpl-pay-1",
          receiptId: "tpl-pay-2",
          maintenanceId: "tpl-mnt-1",
          contractId: "tpl-ctr-2"
        }
      },
      printShare: {
        discoveredPrinters: [
          { id: "prt-1", name: "HP LaserJet Pro M404dn \xB7 \u0627\u0644\u0625\u062F\u0627\u0631\u0629", connection: "Network", address: "192.168.10.50:9100" },
          { id: "prt-2", name: "Epson TM-T88VI \xB7 \u0637\u0627\u0628\u0639\u0629 \u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062D\u0631\u0627\u0631\u064A\u0629 80mm", connection: "Bluetooth", address: "BT-00:1A:7D:DA:71:13" },
          { id: "prt-3", name: "Canon imageCLASS \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644", connection: "USB", address: "USB001" }
        ],
        defaultPrinters: {
          receipts: "prt-2",
          reports: "prt-1",
          documents: "prt-1"
        },
        paperSize: "A4",
        printQuality: "high",
        defaultShareChannel: "whatsapp"
      },
      backupPolicy: {
        frequency: "daily",
        scheduledTime: "02:00",
        storageTarget: "nas",
        customPath: "\\\\NAS-AQAR\\Backups\\AqarPlus",
        encryptBackups: true
      },
      syncCenter: {
        mode: "private_server",
        serverHost: "192.168.10.10",
        serverPort: 3e3,
        protocol: "wss",
        behavior: "auto",
        conflictResolution: "latest_wins"
      },
      developerCenter: {
        tempCacheSizeKb: 3840,
        errorLogs: [
          {
            id: "err-1",
            timestamp: "2026-11-14T08:42:10.000Z",
            source: "SyncEngine/WebSocket",
            message: "\u0625\u0639\u0627\u062F\u0629 \u0627\u062A\u0635\u0627\u0644 \u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0628\u0639\u062F \u062A\u0628\u062F\u064A\u0644 \u0634\u0628\u0643\u0629 Wi-Fi \u0641\u064A \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629 \u062E\u0644\u0627\u0644 420ms",
            severity: "info"
          },
          {
            id: "err-2",
            timestamp: "2026-11-14T09:15:33.000Z",
            source: "OCR/GeminiClient",
            message: "\u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0636\u0648\u0626\u064A \u0644\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0645\u0648\u062D\u062F (\u062B\u0642\u0629 98%)",
            severity: "info"
          }
        ]
      }
    },
    companies: [
      {
        id: "comp-1",
        nameAr: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
        nameEn: "Dar Al-Ofoq Property Management Co.",
        logoText: "\u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642",
        crNumber: "1010648291",
        vatNumber: "310482910300003",
        address: "\u0637\u0631\u064A\u0642 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F\u060C \u062D\u064A \u0627\u0644\u0639\u0644\u064A\u0627",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        phone: "0114892200",
        email: "ops@aqarplus.sa",
        bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
        iban: "SA1910000041200008819201",
        receiptFooterAr: "\u0647\u0630\u0627 \u0627\u0644\u0633\u0646\u062F \u0635\u0627\u062F\u0631 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u064B \u0645\u0646 \u0646\u0638\u0627\u0645 AqarPlus \u0648\u0644\u0627 \u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062E\u062A\u0645 \u0648\u0631\u0642\u064A",
        isDefault: true
      },
      {
        id: "comp-2",
        nameAr: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u062F\u0627\u0631 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0648\u0627\u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
        nameEn: "Al-Madar Real Estate Investment Co.",
        logoText: "\u0627\u0644\u0645\u062F\u0627\u0631",
        crNumber: "1010772210",
        vatNumber: "310992817200003",
        address: "\u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643\u060C \u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        phone: "0112981144",
        email: "finance@almadar.sa",
        bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        iban: "SA4480000123608010778899",
        receiptFooterAr: "\u0645\u062D\u0635\u0644 \u0644\u0635\u0627\u0644\u062D \u0645\u062D\u0641\u0638\u0629 \u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u062F\u0627\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629",
        isDefault: false
      }
    ],
    users: [
      {
        id: "usr-sys",
        nameAr: "\u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0628\u0646 \u0641\u0647\u062F \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        nameEn: "Abdullah Al-Subaie",
        role: "sys_owner",
        roleLabelAr: "\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645",
        roleLabelEn: "System Owner",
        email: "owner.sys@aqarplus.sa",
        phone: "0505123400",
        approvalLimitSar: 1e6,
        active: true,
        deviceName: "MacBook Pro M3 \xB7 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u062D\u0648\u0643\u0645\u0629 \u0648\u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A",
        managerRating: 5,
        lastActivitySummary: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0623\u0645\u0627\u0646 \u0648\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-20T09:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-gm",
        nameAr: "\u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        nameEn: "Fahad Al-Subaie",
        role: "gm",
        roleLabelAr: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 / \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        roleLabelEn: "Company Manager",
        email: "fahad@aqarplus.sa",
        phone: "0505123401",
        approvalLimitSar: 5e5,
        active: true,
        deviceName: "Windows Desktop \xB7 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0639\u0627\u0645 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A",
        managerRating: 5,
        lastActivitySummary: "\u0627\u0639\u062A\u0645\u062F \u0645\u0635\u0631\u0648\u0641 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u062C\u0645\u0639 \u0642\u0628\u0644 18 \u062F\u0642\u064A\u0642\u0629",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-25T10:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-acc",
        nameAr: "\u0633\u0644\u0645\u0627\u0646 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u062F\u0648\u0633\u0631\u064A",
        nameEn: "Salman Al-Dosari",
        role: "accountant",
        roleLabelAr: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A",
        roleLabelEn: "Financial Accountant",
        email: "salman@aqarplus.sa",
        phone: "0505123402",
        approvalLimitSar: 5e3,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0648\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0648\u0627\u0644\u0642\u064A\u0648\u062F \u0627\u0644\u0645\u0627\u0644\u064A\u0629",
        managerRating: 4.8,
        lastActivitySummary: "\u0633\u062C\u0644 \u0633\u0646\u062F \u0642\u0628\u0636 9,000 \u0631.\u0633 \u0642\u0628\u0644 5 \u062F\u0642\u0627\u0626\u0642",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-15T11:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: false
        }
      },
      {
        id: "usr-lease",
        nameAr: "\u0631\u064A\u0645 \u0628\u0646\u062A \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u062A\u064A\u0628\u064A",
        nameEn: "Reem Al-Otaibi",
        role: "leasing",
        roleLabelAr: "\u0645\u0648\u0638\u0641 \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0648\u0627\u0644\u0639\u0642\u0648\u062F",
        roleLabelEn: "Leasing Agent",
        email: "reem@aqarplus.sa",
        phone: "0505123403",
        approvalLimitSar: 1e3,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "iPad Pro \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
        lastActiveAt: now,
        statusState: "\u0645\u0634\u063A\u0648\u0644",
        specialty: "\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0627\u062A \u0648\u062A\u0648\u062B\u064A\u0642 \u0625\u064A\u062C\u0627\u0631",
        managerRating: 4.9,
        lastActivitySummary: "\u0623\u0631\u0633\u0644\u062A \u062A\u0630\u0643\u064A\u0631 \u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F \u0627\u0644\u0645\u0639\u0631\u0636 S-01 \u0642\u0628\u0644 12 \u062F\u0642\u064A\u0642\u0629",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-11-01T08:30:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: true,
          dndFrom: "21:00",
          dndTo: "08:00",
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: false
        }
      },
      {
        id: "usr-sup",
        nameAr: "\u0645\u0627\u062C\u062F \u0628\u0646 \u062A\u0631\u0643\u064A \u0627\u0644\u062D\u0631\u0628\u064A",
        nameEn: "Majed Al-Harbi",
        role: "supervisor",
        roleLabelAr: "\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
        roleLabelEn: "Property Supervisor",
        email: "majed@aqarplus.sa",
        phone: "0505123404",
        approvalLimitSar: 2e3,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "Android Tablet \xB7 \u0645\u064A\u062F\u0627\u0646\u064A",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0625\u0634\u063A\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0625\u062E\u0644\u0627\u0621",
        managerRating: 4.7,
        lastActivitySummary: "\u0631\u0627\u062C\u0639 \u0645\u0635\u0631\u0648\u0641 \u0635\u064A\u0627\u0646\u0629 B-204 \u0648\u0623\u062D\u0627\u0644\u0647 \u0644\u0644\u0645\u062F\u064A\u0631",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-12T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-mm",
        nameAr: "\u0628\u062F\u0631 \u0628\u0646 \u0639\u0644\u064A \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
        nameEn: "Badr Al-Ghamdi",
        role: "maint_manager",
        roleLabelAr: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        roleLabelEn: "Maintenance Manager",
        email: "badr@aqarplus.sa",
        phone: "0505123406",
        approvalLimitSar: 1500,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "iPad Air \xB7 \u0642\u0633\u0645 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646 \u0648\u0642\u0637\u0639 \u0627\u0644\u063A\u064A\u0627\u0631",
        managerRating: 4.6,
        lastActivitySummary: "\u0623\u0633\u0646\u062F \u0628\u0644\u0627\u063A \u062A\u0633\u0631\u0628 A-102 \u0644\u0644\u0641\u0646\u064A \u0639\u0645\u0631 \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-28T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-tech",
        nameAr: "\u0639\u0645\u0631 \u0628\u0646 \u0633\u0639\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        nameEn: "Omar Al-Qahtani",
        role: "technician",
        roleLabelAr: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        roleLabelEn: "Maintenance Technician",
        email: "omar@aqarplus.sa",
        phone: "0505123405",
        approvalLimitSar: 300,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "Android Mobile \xB7 \u062C\u0648\u0627\u0644 \u0627\u0644\u0641\u0646\u064A",
        lastActiveAt: now,
        statusState: "\u0645\u0634\u063A\u0648\u0644",
        specialty: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F \u0648\u0633\u0628\u0627\u0643\u0629 \u0648\u0643\u0647\u0631\u0628\u0627\u0621",
        managerRating: 4.9,
        lastActivitySummary: "\u0631\u0641\u0639 \u062A\u0642\u0631\u064A\u0631 \u0641\u062D\u0635 \u0627\u0644\u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0648\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: true,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-11-02T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: true,
          taskComment: true,
          urgentTicket: true
        }
      },
      {
        id: "usr-rec",
        nameAr: "\u0646\u0648\u0631\u0629 \u0628\u0646\u062A \u0633\u0639\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        nameEn: "Noura Al-Qahtani",
        role: "receptionist",
        roleLabelAr: "\u0645\u0648\u0638\u0641 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
        roleLabelEn: "Receptionist",
        email: "noura@aqarplus.sa",
        phone: "0505123407",
        approvalLimitSar: 0,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "Windows Reception \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
        lastActiveAt: "2026-11-14T09:40:00.000Z",
        statusState: "\u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u064A\u0629",
        managerRating: 4.5,
        lastActivitySummary: "\u0627\u0633\u062A\u0642\u0628\u0644\u062A 3 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0645\u0639\u0627\u064A\u0646\u0629 \u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u0644\u0642\u0627",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-30T09:00:00.000Z"
        },
        notificationPrefs: {
          dndEnabled: false,
          taskAssigned: true,
          taskReminder: true,
          taskApproved: false,
          taskComment: true,
          urgentTicket: false
        }
      },
      {
        id: "usr-aud",
        nameAr: "\u062E\u0627\u0644\u062F \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0645\u0646\u064A\u0641",
        nameEn: "Khalid Al-Muneef",
        role: "auditor",
        roleLabelAr: "\u0627\u0644\u0645\u0631\u0627\u062C\u0639",
        roleLabelEn: "Auditor",
        email: "audit@aqarplus.sa",
        phone: "0505123408",
        approvalLimitSar: 0,
        allowedPropertyIds: ["*"],
        active: true,
        deviceName: "Laptop \xB7 \u0648\u062D\u062F\u0629 \u0627\u0644\u0631\u0642\u0627\u0628\u0629 \u0648\u0627\u0644\u062A\u062F\u0642\u064A\u0642",
        lastActiveAt: "2026-11-14T08:50:00.000Z",
        statusState: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644",
        specialty: "\u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629 \u0648\u0641\u062D\u0635 \u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644",
        managerRating: 5,
        lastActivitySummary: "\u0635\u062F\u0651\u0631 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0634\u0647\u0631\u064A \u0648\u0633\u062C\u0644 \u0627\u0644\u0639\u0643\u0633 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A",
        security: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          failedAttempts: 0,
          lastPasswordChangedAt: "2026-10-18T09:00:00.000Z",
          requirePasswordChange90d: true
        },
        notificationPrefs: {
          dndEnabled: true,
          dndFrom: "18:00",
          dndTo: "08:00",
          taskAssigned: false,
          taskReminder: false,
          taskApproved: false,
          taskComment: false,
          urgentTicket: false
        }
      },
      {
        id: "usr-owner",
        nameAr: "\u0627\u0644\u0634\u064A\u062E \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        nameEn: "Abdulaziz Al-Rajhi",
        role: "owner",
        roleLabelAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u0643",
        roleLabelEn: "Property Owner",
        email: "owner.rajhi@aqarplus.sa",
        phone: "0559812200",
        approvalLimitSar: 0,
        active: true,
        ownerId: "own-1",
        deviceName: "iPhone \xB7 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u0643",
        lastActiveAt: now,
        statusState: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644",
        specialty: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u0648\u0627\u0626\u062F \u0648\u0643\u0634\u0648\u0641 \u0627\u0644\u0645\u0644\u0627\u0643"
      }
    ],
    rolePermissions: DEFAULT_ROLE_PERMISSIONS,
    owners: [
      {
        id: "own-1",
        nameAr: "\u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        nameEn: "Abdulaziz Al-Rajhi",
        nationalId: "1029384756",
        phone: "0559812200",
        email: "a.rajhi@outlook.sa",
        iban: "SA4480000123608010998821",
        bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        totalTransferred: 145e3,
        notes: "\u0645\u0627\u0644\u0643 \u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A \u0648\u0634\u0631\u064A\u0643 \u0641\u064A \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627"
      },
      {
        id: "own-2",
        nameAr: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0646\u062E\u0628\u0629 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
        nameEn: "Al-Nukhbah Real Estate Investment",
        nationalId: "7001928374",
        phone: "0112983300",
        email: "finance@nukhbah.sa",
        iban: "SA1910000041200009182734",
        bankName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
        totalTransferred: 82e3,
        notes: "\u0634\u0631\u064A\u0643 \u0628\u0646\u0633\u0628\u0629 40% \u0641\u064A \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0633\u0643\u0646\u064A"
      }
    ],
    vendors: [
      {
        id: "vnd-1",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0646\u0633\u064A\u0645 \u0644\u0644\u062A\u0643\u064A\u064A\u0641 \u0648\u0627\u0644\u062A\u0628\u0631\u064A\u062F",
        nameEn: "Naseem HVAC Services",
        crNumber: "1010928371",
        vatNumber: "310884422100003",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        nationalAddress: "RYDA8821 \xB7 \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        iban: "SA1910000041200009911220",
        contactPerson: "\u0645. \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0634\u0645\u0631\u064A",
        phone: "0508819201",
        email: "orders@naseem-hvac.sa",
        rating: 4.8,
        ratingBreakdown: { quality: 4.9, punctuality: 4.8, pricing: 4.6, cooperation: 4.9 },
        avgExecutionDays: 1.5,
        complaintsCount: 0,
        active: true
      },
      {
        id: "vnd-2",
        nameAr: "\u0634\u0631\u0643\u0629 \u0631\u0643\u0627\u0626\u0632 \u0627\u0644\u0633\u0628\u0627\u0643\u0629 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621",
        nameEn: "Rakaiz MEP Contracting",
        crNumber: "1010445566",
        vatNumber: "310772233400003",
        category: "\u0633\u0628\u0627\u0643\u0629 \u0648\u0643\u0647\u0631\u0628\u0627\u0621",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        nationalAddress: "RYDM4410 \xB7 \u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        iban: "SA4480000123608010556677",
        contactPerson: "\u0623\u062D\u0645\u062F \u0628\u0646 \u0635\u0627\u0644\u062D \u0627\u0644\u0632\u0647\u0631\u0627\u0646\u064A",
        phone: "0553312299",
        email: "billing@rakaiz.sa",
        rating: 4.5,
        ratingBreakdown: { quality: 4.7, punctuality: 4.3, pricing: 4.5, cooperation: 4.5 },
        avgExecutionDays: 2.2,
        complaintsCount: 1,
        active: true
      },
      {
        id: "vnd-3",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0625\u0634\u0631\u0627\u0642\u0629 \u0644\u0644\u0646\u0638\u0627\u0641\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0627\u0641\u0642",
        nameEn: "Ishraqah Facility Care",
        crNumber: "1010778899",
        vatNumber: "310661188200003",
        category: "\u0646\u0638\u0627\u0641\u0629 \u0648\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u0645\u0629",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        nationalAddress: "RYDO1104 \xB7 \u062D\u064A \u0627\u0644\u0639\u0644\u064A\u0627",
        iban: "SA5520000001928374650011",
        contactPerson: "\u0633\u0639\u062F \u0628\u0646 \u0641\u0647\u062F \u0627\u0644\u0645\u0637\u064A\u0631\u064A",
        phone: "0541129988",
        email: "care@ishraqah.sa",
        rating: 4.7,
        ratingBreakdown: { quality: 4.8, punctuality: 4.7, pricing: 4.6, cooperation: 4.7 },
        avgExecutionDays: 1,
        complaintsCount: 0,
        active: true
      }
    ],
    properties: [
      {
        id: "prop-1",
        companyId: "comp-1",
        ownershipMode: "\u0625\u062F\u0627\u0631\u0629 \u0644\u0644\u063A\u064A\u0631",
        code: "RYD-YAS-01",
        nameAr: "\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
        nameEn: "Al-Yasmin Residential Complex",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        district: "\u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        street: "\u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643",
        nationalAddress: "RYDA7412 \xB7 13325",
        type: "\u0633\u0643\u0646\u064A",
        deedNumber: "410109034821",
        status: "\u0646\u0634\u0637",
        buildingsCount: 2,
        floorsCount: 4,
        managementFeePercent: 5,
        ownerShares: [{ ownerId: "own-1", sharePercent: 100 }],
        electricityMeterMain: "SEC-30918274",
        waterMeterMain: "NWC-8819201",
        caretakerName: "\u0645\u062D\u0645\u062F \u0625\u0642\u0628\u0627\u0644",
        caretakerPhone: "0539011223",
        createdAt: "2025-01-10T08:00:00.000Z"
      },
      {
        id: "prop-2",
        companyId: "comp-2",
        ownershipMode: "\u0645\u0644\u0643\u064A\u0629 \u0645\u0634\u062A\u0631\u0643\u0629",
        code: "RYD-MLQ-02",
        nameAr: "\u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0633\u0643\u0646\u064A",
        nameEn: "Al-Malqa Mixed-Use Tower",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        district: "\u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        street: "\u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643 \u062A\u0642\u0627\u0637\u0639 \u0627\u0644\u062E\u064A\u0631",
        nationalAddress: "RYDM3910 \xB7 13524",
        type: "\u0645\u062E\u062A\u0644\u0637",
        deedNumber: "410108991122",
        status: "\u0646\u0634\u0637",
        buildingsCount: 1,
        floorsCount: 6,
        managementFeePercent: 6,
        ownerShares: [
          { ownerId: "own-1", sharePercent: 60 },
          { ownerId: "own-2", sharePercent: 40 }
        ],
        electricityMeterMain: "SEC-99102938",
        waterMeterMain: "NWC-5510291",
        caretakerName: "\u0623\u0634\u0631\u0641 \u0639\u0644\u064A",
        caretakerPhone: "0534455667",
        createdAt: "2025-04-01T08:00:00.000Z"
      }
    ],
    units: [
      {
        id: "unit-101",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0623",
        floor: 1,
        unitNumber: "A-101",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 135,
        rooms: 3,
        bathrooms: 2,
        furnished: false,
        acCount: 4,
        electricityMeter: "E-101-882",
        waterMeter: "W-101-21",
        keyCount: 4,
        acRemoteCount: 4,
        suggestedMonthlyRent: 4e3,
        suggestedAnnualRent: 48e3,
        officeFee: 1200,
        status: "\u0645\u0624\u062C\u0631\u0629",
        notes: "\u0634\u0642\u0629 \u0632\u0627\u0648\u064A\u0629 \u0645\u0637\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u064A\u0629"
      },
      {
        id: "unit-102",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0623",
        floor: 1,
        unitNumber: "A-102",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 120,
        rooms: 3,
        bathrooms: 2,
        furnished: true,
        acCount: 4,
        electricityMeter: "E-102-883",
        waterMeter: "W-102-22",
        keyCount: 3,
        acRemoteCount: 4,
        suggestedMonthlyRent: 4500,
        suggestedAnnualRent: 54e3,
        officeFee: 1350,
        status: "\u0645\u062A\u0623\u062E\u0631\u0629 \u0641\u064A \u0627\u0644\u0633\u062F\u0627\u062F",
        notes: "\u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0645\u0637\u0628\u062E \u0631\u0627\u0643\u0628 \u0648\u0645\u0643\u064A\u0641\u0627\u062A \u0633\u0628\u0644\u064A\u062A \u062D\u062F\u064A\u062B\u0629"
      },
      {
        id: "unit-103",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0623",
        floor: 2,
        unitNumber: "A-201",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 110,
        rooms: 2,
        bathrooms: 2,
        furnished: false,
        acCount: 3,
        electricityMeter: "E-201-884",
        waterMeter: "W-201-23",
        keyCount: 3,
        acRemoteCount: 3,
        suggestedMonthlyRent: 3500,
        suggestedAnnualRent: 42e3,
        officeFee: 1050,
        status: "\u0634\u0627\u063A\u0631\u0629",
        vacantSince: "2026-10-20",
        notes: "\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u0648\u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0627\u0644\u0641\u0648\u0631\u064A"
      },
      {
        id: "unit-104",
        propertyId: "prop-1",
        buildingName: "\u0645\u0628\u0646\u0649 \u0628",
        floor: 2,
        unitNumber: "B-204",
        unitType: "\u0634\u0642\u0629",
        areaSqm: 140,
        rooms: 4,
        bathrooms: 3,
        furnished: false,
        acCount: 5,
        electricityMeter: "E-204-885",
        waterMeter: "W-204-24",
        keyCount: 5,
        acRemoteCount: 5,
        suggestedMonthlyRent: 4800,
        suggestedAnnualRent: 57600,
        officeFee: 1400,
        status: "\u062A\u062D\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        notes: "\u064A\u062C\u0631\u064A \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0645\u0643\u064A\u0641 \u0627\u0644\u0635\u0627\u0644\u0629"
      },
      {
        id: "unit-201",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 0,
        unitNumber: "S-01",
        unitType: "\u0645\u0639\u0631\u0636 \u062A\u062C\u0627\u0631\u064A",
        areaSqm: 210,
        rooms: 2,
        bathrooms: 2,
        furnished: false,
        acCount: 4,
        electricityMeter: "E-S01-901",
        waterMeter: "W-S01-09",
        keyCount: 2,
        acRemoteCount: 4,
        suggestedMonthlyRent: 1e4,
        suggestedAnnualRent: 12e4,
        officeFee: 3e3,
        status: "\u0645\u0624\u062C\u0631\u0629",
        notes: "\u0648\u0627\u062C\u0647\u0629 \u0632\u062C\u0627\u062C\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642 \u0627\u0644\u0631\u0626\u064A\u0633\u064A"
      },
      {
        id: "unit-202",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 3,
        unitNumber: "M-302",
        unitType: "\u0645\u0643\u062A\u0628",
        areaSqm: 95,
        rooms: 3,
        bathrooms: 1,
        furnished: false,
        acCount: 3,
        electricityMeter: "E-302-902",
        waterMeter: "W-302-10",
        keyCount: 3,
        acRemoteCount: 3,
        suggestedMonthlyRent: 4e3,
        suggestedAnnualRent: 48e3,
        officeFee: 1200,
        status: "\u0645\u062D\u062C\u0648\u0632\u0629",
        linkedTenantId: "ten-4",
        notes: "\u0645\u0631\u062A\u0628\u0637 \u0628\u0645\u0633\u062A\u0623\u062C\u0631 \u0625\u062F\u0627\u0631\u064A\u0627\u064B \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631"
      },
      {
        id: "unit-203",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 4,
        unitNumber: "M-405",
        unitType: "\u0645\u0643\u062A\u0628",
        areaSqm: 85,
        rooms: 2,
        bathrooms: 1,
        furnished: false,
        acCount: 2,
        electricityMeter: "E-405-903",
        waterMeter: "W-405-11",
        keyCount: 2,
        acRemoteCount: 2,
        suggestedMonthlyRent: 3600,
        suggestedAnnualRent: 43200,
        officeFee: 1e3,
        status: "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u0646\u0638\u064A\u0641",
        vacantSince: "2026-11-11",
        notes: "\u062A\u0645 \u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0627\u0644\u0633\u0627\u0628\u0642 \u0648\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062C\u0647\u064A\u0632"
      },
      {
        id: "unit-arch-1",
        propertyId: "prop-1",
        buildingName: "\u0645\u0644\u062D\u0642 \u0627\u0644\u0633\u0637\u062D",
        floor: 4,
        unitNumber: "R-401",
        unitType: "\u0627\u0633\u062A\u0648\u062F\u064A\u0648",
        areaSqm: 58,
        rooms: 1,
        bathrooms: 1,
        furnished: false,
        acCount: 1,
        electricityMeter: "E-401-701",
        waterMeter: "W-401-19",
        keyCount: 2,
        acRemoteCount: 1,
        suggestedMonthlyRent: 2200,
        suggestedAnnualRent: 26400,
        officeFee: 700,
        status: "\u0645\u0648\u0642\u0648\u0641\u0629",
        linkedTenantId: "ten-arch-1",
        notes: "\u062A\u0645 \u0625\u062E\u0631\u0627\u062C \u0627\u0644\u0648\u062D\u062F\u0629 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A \u0648\u0627\u0644\u062A\u0631\u0645\u064A\u0645 \u0627\u0644\u0634\u0627\u0645\u0644",
        archivedAt: "2026-09-18T11:30:00.000Z",
        archiveReason: "\u0625\u063A\u0644\u0627\u0642 \u0644\u0644\u062A\u0631\u0645\u064A\u0645 \u0648\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629",
        archivedBy: "usr-sup",
        archiveMode: "\u064A\u062F\u0648\u064A",
        preArchiveStatus: "\u0634\u0627\u063A\u0631\u0629"
      },
      {
        id: "unit-arch-2",
        propertyId: "prop-2",
        buildingName: "\u0627\u0644\u0628\u0631\u062C \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        floor: 1,
        unitNumber: "M-108",
        unitType: "\u0645\u0643\u062A\u0628",
        areaSqm: 72,
        rooms: 2,
        bathrooms: 1,
        furnished: false,
        acCount: 2,
        electricityMeter: "E-108-799",
        waterMeter: "W-108-05",
        keyCount: 2,
        acRemoteCount: 2,
        suggestedMonthlyRent: 3200,
        suggestedAnnualRent: 38400,
        officeFee: 950,
        status: "\u0645\u0624\u0631\u0634\u0641\u0629",
        linkedTenantId: "ten-arch-2",
        notes: "\u062A\u0645 \u062F\u0645\u062C \u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0645\u0639 \u0627\u0644\u0645\u0639\u0631\u0636 \u0627\u0644\u0623\u0631\u0636\u064A \u062D\u0633\u0628 \u0642\u0631\u0627\u0631 \u0627\u0644\u0645\u0644\u0627\u0643",
        archivedAt: "2025-12-28T10:00:00.000Z",
        archiveReason: "\u062F\u0645\u062C \u0645\u0639\u0645\u0627\u0631\u064A \u0645\u0639 \u0648\u062D\u062F\u0629 \u0645\u062C\u0627\u0648\u0631\u0629",
        archivedBy: "usr-gm",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0634\u0627\u063A\u0631\u0629"
      }
    ],
    tenants: [
      {
        id: "ten-1",
        nameAr: "\u0628\u0646\u062F\u0631 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
        nameEn: "Bandar Al-Ghamdi",
        nationalIdOrIqama: "1088442211",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0551122334",
        altPhone: "0509988771",
        email: "bandar.g@gmail.com",
        employer: "\u0627\u0644\u0647\u064A\u0626\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0644\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
        tenantType: "\u0639\u0627\u0626\u0644\u0629",
        birthDate: "1988-04-12",
        maritalStatus: "\u0645\u062A\u0632\u0648\u062C",
        familyMembersCount: 4,
        emergencyContactName: "\u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A (\u0627\u0644\u0623\u062E)",
        emergencyContactPhone: "0504411229",
        nationalAddress: "RYDA7412 \xB7 \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
        classification: "\u0646\u0634\u0637",
        rating: 5,
        behaviorScores: { paymentCommitment: 5, unitCare: 5, cooperation: 5, penaltyTotal: 0 },
        violationNotes: [
          {
            id: "vn-1",
            title: "\u0625\u0634\u0627\u062F\u0629 \u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u0633\u062F\u0627\u062F \u0627\u0644\u0645\u0628\u0643\u0631",
            category: "\u0625\u0634\u0627\u062F\u0629",
            details: "\u0633\u062F\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0642\u0628\u0644 \u0645\u0648\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u062F\u0648\u0646 \u0623\u064A \u062A\u0623\u062E\u064A\u0631.",
            createdBy: "usr-acc",
            createdAt: "2026-07-14T12:00:00.000Z"
          }
        ],
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: true,
          contractSigned: true,
          ejarRegistered: true,
          handoverSigned: true
        },
        notes: "\u0645\u0633\u062A\u0623\u062C\u0631 \u0645\u0644\u062A\u0632\u0645 \u0628\u0627\u0644\u0633\u062F\u0627\u062F \u0627\u0644\u0645\u0628\u0643\u0631",
        createdAt: "2026-01-12T09:00:00.000Z"
      },
      {
        id: "ten-2",
        nameAr: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
        nameEn: "Tariq Al-Shehri",
        nationalIdOrIqama: "1077331199",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0547788990",
        altPhone: "0558800112",
        email: "tariq.s@yahoo.com",
        employer: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629",
        tenantType: "\u0641\u0631\u062F",
        birthDate: "1992-09-21",
        maritalStatus: "\u0623\u0639\u0632\u0628",
        emergencyContactName: "\u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A (\u0627\u0644\u0648\u0627\u0644\u062F)",
        emergencyContactPhone: "0501199882",
        nationalAddress: "RYDA7415 \xB7 \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
        classification: "\u0646\u0634\u0637",
        rating: 3,
        behaviorScores: { paymentCommitment: 3, unitCare: 4, cooperation: 4, penaltyTotal: 250 },
        violationNotes: [
          {
            id: "vn-2",
            title: "\u062A\u0623\u062E\u0631 \u0641\u064A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u062B\u0627\u0644\u062B \u0648\u0627\u0644\u0631\u0627\u0628\u0639",
            category: "\u062A\u0623\u062E\u0631 \u0633\u062F\u0627\u062F",
            details: "\u062A\u0645 \u0633\u062F\u0627\u062F 9,000 \u0631.\u0633 \u062C\u0632\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u062B\u0627\u0644\u062B \u0648\u062C\u0627\u0631\u064D \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A.",
            createdBy: "usr-acc",
            createdAt: "2026-11-05T10:30:00.000Z"
          }
        ],
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: true,
          contractSigned: true,
          ejarRegistered: true,
          handoverSigned: true
        },
        notes: "\u0644\u062F\u064A\u0647 \u062F\u0641\u0639\u0629 \u062C\u0632\u0626\u064A\u0629 \u0648\u0645\u062A\u0628\u0642\u064D \u0642\u064A\u062F \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629",
        createdAt: "2026-02-01T09:00:00.000Z"
      },
      {
        id: "ten-3",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
        nameEn: "Mazaq Al-Bun Trading Est.",
        nationalIdOrIqama: "7022119988",
        nationality: "\u0643\u064A\u0627\u0646 \u062A\u062C\u0627\u0631\u064A \u0633\u0639\u0648\u062F\u064A",
        phone: "0502233445",
        altPhone: "0114422990",
        email: "accounts@mazaqbun.sa",
        employer: "\u0633\u062C\u0644 \u062A\u062C\u0627\u0631\u064A 1010554433",
        tenantType: "\u0634\u0631\u0643\u0629",
        emergencyContactName: "\u0648\u0644\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A (\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0634\u063A\u064A\u0644)",
        emergencyContactPhone: "0559922110",
        nationalAddress: "RYDM3910 \xB7 \u0637\u0631\u064A\u0642 \u0623\u0646\u0633 \u0628\u0646 \u0645\u0627\u0644\u0643 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
        classification: "\u0646\u0634\u0637",
        rating: 4,
        behaviorScores: { paymentCommitment: 4, unitCare: 5, cooperation: 4, penaltyTotal: 0 },
        violationNotes: [],
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: true,
          contractSigned: true,
          ejarRegistered: true,
          handoverSigned: true
        },
        notes: "\u0645\u0633\u062A\u0623\u062C\u0631 \u0627\u0644\u0645\u0639\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A S-01",
        createdAt: "2025-11-20T09:00:00.000Z"
      },
      {
        id: "ten-4",
        nameAr: "\u064A\u0627\u0633\u0631 \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0627\u0644\u0645\u0646\u0635\u0648\u0631",
        nameEn: "Yasser Al-Mansour",
        nationalIdOrIqama: "1099887766",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0564455112",
        email: "yasser.m@domain.sa",
        employer: "\u0645\u0643\u062A\u0628 \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629",
        tenantType: "\u0641\u0631\u062F",
        birthDate: "1985-11-02",
        maritalStatus: "\u0645\u062A\u0632\u0648\u062C",
        classification: "\u0645\u062D\u062A\u0645\u0644",
        rating: 4,
        behaviorScores: { paymentCommitment: 4, unitCare: 4, cooperation: 5, penaltyTotal: 0 },
        onboardingChecklist: {
          idVerified: true,
          docsArchived: true,
          depositPaid: false,
          contractSigned: false,
          ejarRegistered: false,
          handoverSigned: false
        },
        notes: "\u0645\u0631\u0628\u0648\u0637 \u0625\u062F\u0627\u0631\u064A\u0627\u064B \u0628\u0627\u0644\u0645\u0643\u062A\u0628 M-302 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0639\u0642\u062F \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        createdAt: "2026-11-10T11:00:00.000Z"
      },
      {
        id: "ten-arch-1",
        nameAr: "\u062E\u0627\u0644\u062F \u0628\u0646 \u0633\u0639\u0648\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646",
        nameEn: "Khalid Al-Olayan",
        nationalIdOrIqama: "1055667788",
        nationality: "\u0633\u0639\u0648\u062F\u064A",
        phone: "0557711223",
        email: "khalid.olayan@gmail.com",
        employer: "\u0634\u0631\u0643\u0629 \u0633\u0627\u0628\u0643 \u0644\u0644\u062A\u0642\u0646\u064A\u0629",
        tenantType: "\u0641\u0631\u062F",
        maritalStatus: "\u0623\u0639\u0632\u0628",
        classification: "\u0633\u0627\u0628\u0642",
        rating: 5,
        behaviorScores: { paymentCommitment: 5, unitCare: 5, cooperation: 5, penaltyTotal: 0 },
        notes: "\u0633\u062F\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0642\u0628\u0644 \u0645\u0648\u0639\u062F\u0647\u0627 \u0648\u0623\u0633\u0644\u0645 \u0627\u0644\u0648\u062D\u062F\u0629 R-401 \u0628\u062D\u0627\u0644\u0629 \u0645\u0645\u062A\u0627\u0632\u0629",
        createdAt: "2024-10-01T08:00:00.000Z",
        archivedAt: "2026-09-15T14:00:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u062F\u0629 \u0627\u0644\u0639\u0642\u062F \u0648\u0627\u0644\u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0646\u0638\u0627\u0645\u064A \u0628\u0646\u062C\u0627\u062D",
        archivedBy: "usr-lease",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "ten-arch-2",
        nameAr: "\u0645\u0624\u0633\u0633\u0629 \u0623\u0641\u0642 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
        nameEn: "Ofoq Riyadh Consulting Est.",
        nationalIdOrIqama: "7008822114",
        nationality: "\u0643\u064A\u0627\u0646 \u062A\u062C\u0627\u0631\u064A \u0633\u0639\u0648\u062F\u064A",
        phone: "0508822199",
        email: "admin@ofoq-sa.com",
        employer: "\u0633\u062C\u0644 \u062A\u062C\u0627\u0631\u064A 1010449922",
        tenantType: "\u0634\u0631\u0643\u0629",
        classification: "\u0633\u0627\u0628\u0642",
        rating: 2,
        behaviorScores: { paymentCommitment: 2, unitCare: 3, cooperation: 2, penaltyTotal: 1200 },
        notes: "\u062A\u0623\u062E\u0631 \u0645\u062A\u0643\u0631\u0631 \u0641\u064A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0623\u062E\u064A\u0631 \u0648\u062A\u0645\u062A \u062A\u0633\u0648\u064A\u0629 \u0627\u0644\u0625\u062E\u0644\u0627\u0621 \u0645\u0639 \u062E\u0635\u0645 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0645\u0646 \u0627\u0644\u062A\u0623\u0645\u064A\u0646",
        createdAt: "2024-11-15T09:00:00.000Z",
        archivedAt: "2025-12-20T16:10:00.000Z",
        archiveReason: "\u0625\u062E\u0644\u0627\u0621 \u0628\u0639\u062F \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0645\u0639 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062A\u0623\u062E\u0631 \u0633\u062F\u0627\u062F",
        archivedBy: "usr-acc",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      }
    ],
    leads: [
      {
        id: "lead-1",
        nameAr: "\u0641\u064A\u0635\u0644 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u0632\u0647\u0631\u0627\u0646\u064A",
        phone: "0558899112",
        email: "faisal.z@outlook.sa",
        nationalIdOrIqama: "1088442211",
        birthDate: "1991-06-14",
        tenantType: "\u0639\u0627\u0626\u0644\u0629",
        familyMembersCount: 4,
        source: "\u0645\u0646\u0635\u0629 \u0639\u0642\u0627\u0631",
        propertyId: "prop-1",
        unitId: "unit-103",
        offeredRent: 41e3,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        officeFee: 1e3,
        earlyTerminationFee: 2e3,
        budgetMonthly: 3500,
        roomsRequired: 3,
        preferredArea: "\u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        moveInDate: "2026-12-01",
        viewingDate: "2026-11-16",
        viewingResult: "\u0623\u0628\u062F\u0649 \u0631\u063A\u0628\u0629 \u062C\u062F\u064A\u0629 \u0648\u0637\u0644\u0628 \u062F\u0641\u0639\u062A\u064A\u0646",
        status: "\u0639\u0631\u0636 \u0633\u0639\u0631",
        approvalState: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
        rating: 5,
        assignedTo: "usr-lease",
        notes: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0644\u062A\u0632\u0645 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0645\u0646\u0627\u0633\u0628\u0629\u060C \u0623\u0646\u0635\u062D \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
        createdAt: "2026-11-12T10:15:00.000Z",
        updatedAt: "2026-11-14T09:20:00.000Z",
        interactions: [
          {
            id: "lint-1",
            type: "visit",
            direction: "inbound",
            summary: "\u062A\u0645\u062A \u0645\u0639\u0627\u064A\u0646\u0629 \u0648\u062D\u062F\u0629 A-103 \u0648\u0623\u0628\u062F\u0649 \u0631\u063A\u0628\u0629 \u062C\u0627\u062F\u0629 \u0628\u0627\u0644\u062A\u0639\u0627\u0642\u062F",
            actorName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
            createdAt: "2026-11-13T16:30:00.000Z"
          },
          {
            id: "lint-2",
            type: "escalation",
            direction: "outbound",
            summary: "\u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0647\u062A\u0645 \u0644\u0644\u0645\u0627\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
            actorName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
            createdAt: "2026-11-14T09:20:00.000Z"
          }
        ]
      },
      {
        id: "lead-2",
        nameAr: "\u062F. \u0646\u0648\u0631\u0629 \u0628\u0646\u062A \u0641\u0647\u062F \u0627\u0644\u0633\u0627\u0644\u0645",
        phone: "0503344119",
        email: "dr.noura@clinic.sa",
        nationalIdOrIqama: "1044991123",
        birthDate: "1988-03-22",
        tenantType: "\u0634\u0631\u0643\u0629",
        companyCrNumber: "1010558899",
        source: "\u0632\u064A\u0627\u0631\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
        propertyId: "prop-2",
        unitId: "unit-203",
        offeredRent: 43200,
        paymentFrequency: "\u0633\u0646\u0648\u064A",
        officeFee: 1500,
        earlyTerminationFee: 3e3,
        budgetMonthly: 3800,
        roomsRequired: 2,
        preferredArea: "\u062D\u064A \u0627\u0644\u0645\u0644\u0642\u0627",
        moveInDate: "2026-11-25",
        viewingDate: "2026-11-18",
        status: "\u062C\u062F\u064A\u062F",
        approvalState: "\u0644\u0645 \u064A\u064F\u0631\u0633\u0644",
        rating: 4,
        assignedTo: "usr-lease",
        notes: "\u062A\u0628\u062D\u062B \u0639\u0646 \u0645\u0643\u062A\u0628 \u0625\u062F\u0627\u0631\u064A \u062C\u0627\u0647\u0632 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0642\u0627\u062F\u0645",
        createdAt: "2026-11-14T08:00:00.000Z",
        updatedAt: "2026-11-14T08:00:00.000Z",
        interactions: [
          {
            id: "lint-3",
            type: "call",
            direction: "inbound",
            summary: "\u0627\u062A\u0635\u0627\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u064A B-203 \u0648\u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u0645\u0639\u0627\u064A\u0646\u0629",
            actorName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
            createdAt: "2026-11-14T08:05:00.000Z"
          }
        ]
      }
    ],
    leadEscalations: [
      {
        id: "lesc-1",
        requestCode: "ESC-2026-001",
        leadId: "lead-1",
        propertyId: "prop-1",
        unitId: "unit-103",
        recipientType: "owner",
        recipientId: "own-1",
        recipientName: "\u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        recipientPhone: "0559812200",
        recipientEmail: "a.rajhi@outlook.sa",
        channel: "\u0648\u0627\u062A\u0633\u0627\u0628",
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629",
        priority: "\u0639\u0627\u062C\u0644",
        employeeNotes: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0644\u062A\u0632\u0645 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0645\u0646\u0627\u0633\u0628\u0629\u060C \u0623\u0646\u0635\u062D \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u062F\u0641\u0639 \u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        token: "tok-esc-2026-001",
        tokenExpiresAt: "2026-11-17T09:20:00.000Z",
        snapshot: {
          companyName: "\u0634\u0631\u0643\u0629 \u062F\u0627\u0631 \u0627\u0644\u0623\u0641\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A",
          propertyName: "\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
          unitNumber: "A-103",
          leadName: "\u0641\u064A\u0635\u0644 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u0632\u0647\u0631\u0627\u0646\u064A",
          nationalIdOrIqama: "1088442211",
          hasIdPhoto: false,
          birthDate: "1991-06-14",
          phone: "0558899112",
          rentAmount: 41e3,
          paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
          officeFee: 1e3,
          earlyTerminationFee: 2e3,
          employeeNotes: "\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0644\u062A\u0632\u0645 \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0645\u0646\u0627\u0633\u0628\u0629\u060C \u0623\u0646\u0635\u062D \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u062F\u0641\u0639 \u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
          registrationDate: "2026-11-12",
          registrationSource: "\u0645\u0646\u0635\u0629 \u0639\u0642\u0627\u0631"
        },
        createdBy: "usr-lease",
        createdByName: "\u0631\u064A\u0645 \u0627\u0644\u062D\u0631\u0628\u064A",
        createdAt: "2026-11-14T09:20:00.000Z"
      }
    ],
    contracts: [
      {
        id: "ctr-1",
        internalNumber: "CNT-2026-001",
        ejarNumber: "EJ-1049283711",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        ejarPortalUrl: "https://ejar.sa/contracts/EJ-1049283711",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: "prop-1",
        unitId: "unit-101",
        tenantId: "ten-1",
        startDate: "2026-01-15",
        endDate: "2027-01-14",
        handoverDate: "2026-01-15",
        occupancyStartDate: "2026-01-15",
        occupancyStatus: "\u0646\u0634\u0637",
        keysDeliveredCount: 4,
        remotesDeliveredCount: 4,
        annualRent: 48e3,
        paymentFrequency: "\u0646\u0635\u0641 \u0633\u0646\u0648\u064A",
        installmentsCount: 2,
        securityDeposit: 3e3,
        officeFee: 1200,
        earlyTerminationFee: 4e3,
        managementCommissionPercent: 5,
        includedServices: "\u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0644\u0644\u0639\u0645\u0627\u0631\u0629",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2026-01-14T10:00:00.000Z"
      },
      {
        id: "ctr-2",
        internalNumber: "CNT-2026-002",
        ejarNumber: "EJ-1049289922",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        ejarPortalUrl: "https://ejar.sa/contracts/EJ-1049289922",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: "prop-1",
        unitId: "unit-102",
        tenantId: "ten-2",
        startDate: "2026-02-01",
        endDate: "2026-12-10",
        handoverDate: "2026-02-01",
        occupancyStartDate: "2026-02-01",
        occupancyStatus: "\u0646\u0634\u0637",
        keysDeliveredCount: 3,
        remotesDeliveredCount: 4,
        annualRent: 54e3,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        installmentsCount: 4,
        securityDeposit: 4e3,
        officeFee: 1350,
        earlyTerminationFee: 4500,
        managementCommissionPercent: 5,
        includedServices: "\u0634\u0627\u0645\u0644 \u0627\u0644\u0645\u064A\u0627\u0647 \u0641\u0642\u0637",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2026-02-01T10:00:00.000Z",
        notes: "\u0642\u0631\u064A\u0628 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 - \u064A\u062D\u062A\u0627\u062C \u0645\u062A\u0627\u0628\u0639\u0629 \u062A\u062C\u062F\u064A\u062F \u0642\u0628\u0644 30 \u064A\u0648\u0645\u0627\u064B"
      },
      {
        id: "ctr-3",
        internalNumber: "CNT-2025-019",
        ejarNumber: "EJ-1048112233",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        ejarPortalUrl: "https://ejar.sa/contracts/EJ-1048112233",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId: "prop-2",
        unitId: "unit-201",
        tenantId: "ten-3",
        startDate: "2025-12-01",
        endDate: "2026-11-30",
        handoverDate: "2025-12-01",
        occupancyStartDate: "2025-12-01",
        occupancyStatus: "\u0646\u0634\u0637",
        keysDeliveredCount: 2,
        remotesDeliveredCount: 4,
        annualRent: 12e4,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        installmentsCount: 4,
        securityDeposit: 1e4,
        officeFee: 3e3,
        earlyTerminationFee: 15e3,
        managementCommissionPercent: 6,
        includedServices: "\u0628\u062F\u0648\u0646 \u062E\u062F\u0645\u0627\u062A",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2025-11-28T10:00:00.000Z",
        notes: "\u0639\u0642\u062F \u062A\u062C\u0627\u0631\u064A \u0642\u0631\u064A\u0628 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u062E\u0644\u0627\u0644 16 \u064A\u0648\u0645\u0627\u064B"
      },
      {
        id: "ctr-arch-1",
        internalNumber: "CNT-2025-008",
        ejarNumber: "EJ-1047001122",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        lifecycleStatus: "\u0645\u0646\u062A\u0647\u064D \u0628\u0627\u0644\u0625\u062E\u0644\u0627\u0621",
        propertyId: "prop-1",
        unitId: "unit-arch-1",
        tenantId: "ten-arch-1",
        startDate: "2025-09-15",
        endDate: "2026-09-14",
        annualRent: 26400,
        paymentFrequency: "\u0646\u0635\u0641 \u0633\u0646\u0648\u064A",
        installmentsCount: 2,
        securityDeposit: 2e3,
        officeFee: 700,
        managementCommissionPercent: 5,
        includedServices: "\u0627\u0644\u0645\u064A\u0627\u0647 \u0641\u0642\u0637",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2025-09-10T10:00:00.000Z",
        notes: "\u0623\u064F\u062E\u0644\u064A\u062A \u0627\u0644\u0648\u062D\u062F\u0629 R-401 \u0628\u062A\u0633\u0648\u064A\u0629 \u062A\u0623\u0645\u064A\u0646 \u0643\u0627\u0645\u0644\u0629",
        archivedAt: "2026-09-15T14:00:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0645\u062F\u0629 \u0648\u0625\u062E\u0644\u0627\u0621 \u0633\u0644\u064A\u0645",
        archivedBy: "usr-lease",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "ctr-arch-2",
        internalNumber: "CNT-2025-003",
        ejarNumber: "EJ-1046552211",
        ejarStatus: "\u0645\u0648\u062B\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631",
        lifecycleStatus: "\u0645\u0646\u062A\u0647\u064A",
        propertyId: "prop-2",
        unitId: "unit-arch-2",
        tenantId: "ten-arch-2",
        startDate: "2024-12-20",
        endDate: "2025-12-19",
        annualRent: 38400,
        paymentFrequency: "\u0631\u0628\u0639 \u0633\u0646\u0648\u064A",
        installmentsCount: 4,
        securityDeposit: 3500,
        officeFee: 950,
        managementCommissionPercent: 6,
        includedServices: "\u0628\u062F\u0648\u0646 \u062E\u062F\u0645\u0627\u062A",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2024-12-15T09:30:00.000Z",
        notes: "\u0639\u0642\u062F \u0645\u0643\u062A\u0628 \u0633\u0627\u0628\u0642 \u0627\u0646\u062A\u0647\u0649 \u0648\u062F\u0645\u062C\u062A \u0627\u0644\u0648\u062D\u062F\u0629 \u0641\u064A \u062E\u0637\u0629 \u0627\u0644\u062A\u0648\u0633\u0639\u0629",
        archivedAt: "2025-12-20T16:10:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0639\u0627\u0645 2025",
        archivedBy: "usr-gm",
        archiveMode: "\u0645\u062C\u062F\u0648\u0644",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "ctr-arch-3",
        internalNumber: "CNT-2026-000",
        ejarNumber: "EJ-1049000912",
        ejarStatus: "\u063A\u064A\u0631 \u0645\u0648\u062B\u0642",
        lifecycleStatus: "\u0645\u0644\u063A\u064A",
        propertyId: "prop-1",
        unitId: "unit-103",
        tenantId: "ten-arch-1",
        startDate: "2026-10-01",
        endDate: "2027-09-30",
        annualRent: 42e3,
        paymentFrequency: "\u0646\u0635\u0641 \u0633\u0646\u0648\u064A",
        installmentsCount: 2,
        securityDeposit: 3e3,
        officeFee: 1050,
        managementCommissionPercent: 5,
        includedServices: "\u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        version: 1,
        createdBy: "usr-lease",
        createdAt: "2026-09-25T13:00:00.000Z",
        notes: "\u0623\u0644\u063A\u064A \u0642\u0628\u0644 \u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0644\u062A\u0639\u062F\u064A\u0644 \u0631\u063A\u0628\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0623\u0631\u0636\u064A\u0629",
        archivedAt: "2026-09-29T17:00:00.000Z",
        archiveReason: "\u0625\u0644\u063A\u0627\u0621 \u0642\u0628\u0644 \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0637\u0631\u0641\u064A\u0646",
        archivedBy: "usr-lease",
        archiveMode: "\u064A\u062F\u0648\u064A",
        preArchiveStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u0648\u062B\u064A\u0642"
      }
    ],
    handovers: [
      {
        id: "hnd-1",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        type: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0639\u0646\u062F \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
        date: "2026-01-15",
        inspectorId: "usr-sup",
        keysReturned: 4,
        acRemotesReturned: 4,
        electricityReading: "14220",
        waterReading: "318",
        checklist: [
          { item: "\u0627\u0644\u0623\u0628\u0648\u0627\u0628 \u0648\u0627\u0644\u0623\u0642\u0641\u0627\u0644", status: "\u0633\u0644\u064A\u0645" },
          { item: "\u0627\u0644\u0645\u0643\u064A\u0641\u0627\u062A \u0648\u0627\u0644\u0631\u064A\u0645\u0648\u062A\u0627\u062A", status: "\u0633\u0644\u064A\u0645" },
          { item: "\u0627\u0644\u0625\u0646\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D", status: "\u0633\u0644\u064A\u0645" },
          { item: "\u0627\u0644\u0633\u0628\u0627\u0643\u0629 \u0648\u0627\u0644\u0646\u0638\u0627\u0641\u0629", status: "\u0633\u0644\u064A\u0645" }
        ],
        damageCost: 0,
        unpaidRentDue: 0,
        depositHeld: 3e3,
        netRefundOrDue: 3e3,
        approvedBy: "usr-gm",
        status: "\u0645\u0639\u062A\u0645\u062F",
        createdAt: "2026-01-15T12:00:00.000Z"
      }
    ],
    installments: [
      {
        id: "inst-1",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        installmentNumber: 1,
        dueDate: "2026-01-15",
        amount: 24e3,
        paidAmount: 24e3,
        remainingAmount: 0,
        lastPaymentDate: "2026-01-15",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-2",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        installmentNumber: 2,
        dueDate: "2026-07-15",
        amount: 24e3,
        paidAmount: 24e3,
        remainingAmount: 0,
        lastPaymentDate: "2026-07-14",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-3",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 1,
        dueDate: "2026-02-01",
        amount: 13500,
        paidAmount: 13500,
        remainingAmount: 0,
        lastPaymentDate: "2026-02-01",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-4",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 2,
        dueDate: "2026-05-01",
        amount: 13500,
        paidAmount: 13500,
        remainingAmount: 0,
        lastPaymentDate: "2026-05-03",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-5",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 3,
        dueDate: "2026-08-01",
        amount: 13500,
        paidAmount: 9e3,
        remainingAmount: 4500,
        lastPaymentDate: "2026-08-12",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u062C\u0632\u0626\u064A\u0627\u064B"
      },
      {
        id: "inst-6",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        installmentNumber: 4,
        dueDate: "2026-11-01",
        amount: 13500,
        paidAmount: 0,
        remainingAmount: 13500,
        status: "\u0645\u062A\u0623\u062E\u0631\u0629"
      },
      {
        id: "inst-7",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 1,
        dueDate: "2025-12-01",
        amount: 3e4,
        paidAmount: 3e4,
        remainingAmount: 0,
        lastPaymentDate: "2025-12-01",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-8",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 2,
        dueDate: "2026-03-01",
        amount: 3e4,
        paidAmount: 3e4,
        remainingAmount: 0,
        lastPaymentDate: "2026-03-01",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-9",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 3,
        dueDate: "2026-06-01",
        amount: 3e4,
        paidAmount: 3e4,
        remainingAmount: 0,
        lastPaymentDate: "2026-06-02",
        status: "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644"
      },
      {
        id: "inst-10",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        installmentNumber: 4,
        dueDate: "2026-11-14",
        amount: 3e4,
        paidAmount: 0,
        remainingAmount: 3e4,
        status: "\u0645\u0633\u062A\u062D\u0642\u0629 \u0627\u0644\u064A\u0648\u0645"
      }
    ],
    payments: [
      {
        id: "pay-1",
        receiptNumber: "RCP-2026-0001",
        idempotencyKey: "seed-pay-1",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        allocations: [{ installmentId: "inst-2", amount: 24e3 }],
        amount: 24e3,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "TRN-9920184",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        createdAt: "2026-07-14T11:20:00.000Z"
      },
      {
        id: "pay-2",
        receiptNumber: "RCP-2026-0002",
        idempotencyKey: "seed-pay-2",
        contractId: "ctr-2",
        unitId: "unit-102",
        propertyId: "prop-1",
        tenantId: "ten-2",
        allocations: [{ installmentId: "inst-5", amount: 9e3 }],
        amount: 9e3,
        paymentMethod: "\u0634\u0628\u0643\u0629 \u0645\u062F\u0649",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "POS-441022",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        notes: "\u0633\u062F\u0627\u062F \u062C\u0632\u0626\u064A \u0644\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629 - \u0627\u0644\u0645\u062A\u0628\u0642\u064A 4,500 \u0631.\u0633",
        createdAt: "2026-08-12T15:40:00.000Z"
      },
      {
        id: "pay-3",
        receiptNumber: "RCP-2026-0003",
        idempotencyKey: "seed-pay-3",
        contractId: "ctr-3",
        unitId: "unit-201",
        propertyId: "prop-2",
        tenantId: "ten-3",
        allocations: [{ installmentId: "inst-9", amount: 3e4 }],
        amount: 3e4,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "TRN-7712900",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        createdAt: "2026-06-02T09:10:00.000Z"
      },
      {
        id: "pay-arch-1",
        receiptNumber: "RCP-2025-0084",
        idempotencyKey: "seed-pay-arch-1",
        contractId: "ctr-arch-2",
        unitId: "unit-arch-2",
        propertyId: "prop-2",
        tenantId: "ten-arch-2",
        allocations: [],
        amount: 9600,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "TRN-5519002",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u062A\u0645\u062F",
        notes: "\u062F\u0641\u0639\u0629 \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0623\u062E\u064A\u0631 \u0644\u0639\u0627\u0645 2025 (\u0645\u0642\u0641\u0644\u0629 \u0636\u0645\u0646 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u0646\u062A\u0647\u064A\u0629)",
        createdAt: "2025-09-20T10:15:00.000Z",
        archivedAt: "2026-01-05T02:00:00.000Z",
        archiveReason: "\u0625\u0642\u0641\u0627\u0644 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 2025",
        archivedBy: "usr-acc",
        archiveMode: "\u0645\u062C\u062F\u0648\u0644",
        preArchiveStatus: "\u0645\u0639\u062A\u0645\u062F"
      },
      {
        id: "pay-arch-2",
        receiptNumber: "RCP-2026-0000",
        idempotencyKey: "seed-pay-arch-2",
        contractId: "ctr-1",
        unitId: "unit-101",
        propertyId: "prop-1",
        tenantId: "ten-1",
        allocations: [],
        amount: 24e3,
        paymentMethod: "\u0634\u064A\u0643",
        paymentType: "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: "CHK-88120",
        receivedBy: "usr-acc",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        status: "\u0645\u0639\u0643\u0648\u0633",
        reversedByReceiptId: "REV-2026-0001",
        reversalReason: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639 \u0645\u0646 \u0634\u064A\u0643 \u0625\u0644\u0649 \u062D\u0648\u0627\u0644\u0629 \u0628\u0646\u0643\u064A\u0629 \u0641\u0648\u0631\u064A\u0629",
        notes: "\u0639\u064F\u0643\u0633 \u0628\u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0645\u0637\u0627\u0628\u0642",
        createdAt: "2026-07-13T12:00:00.000Z",
        archivedAt: "2026-07-13T13:15:00.000Z",
        archiveReason: "\u0633\u0646\u062F \u0645\u0639\u0643\u0648\u0633 \u0645\u062D\u0627\u0633\u0628\u064A\u0627\u064B",
        archivedBy: "usr-acc",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0645\u0639\u062A\u0645\u062F"
      }
    ],
    accounts: [
      { id: "acc-1010", code: "1010", nameAr: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A / \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A", nameEn: "Operating Bank Account", type: "\u0623\u0635\u0648\u0644", balance: 215e3 },
      { id: "acc-1020", code: "1020", nameAr: "\u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0646\u0642\u062F\u064A", nameEn: "Petty Cash", type: "\u0623\u0635\u0648\u0644", balance: 12500 },
      { id: "acc-1200", code: "1200", nameAr: "\u0630\u0645\u0645 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u064A\u0646", nameEn: "Tenant Receivables", type: "\u0623\u0635\u0648\u0644", balance: 48e3 },
      { id: "acc-2100", code: "2100", nameAr: "\u0627\u0644\u062A\u0623\u0645\u064A\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0644\u0645\u0629", nameEn: "Security Deposits Held", type: "\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A", balance: 17e3 },
      { id: "acc-2200", code: "2200", nameAr: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643 (\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643)", nameEn: "Owners Payable", type: "\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A", balance: 158400 },
      { id: "acc-2300", code: "2300", nameAr: "\u0630\u0645\u0645 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u064A\u0646", nameEn: "Vendors Payable", type: "\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A", balance: 1850 },
      { id: "acc-4100", code: "4100", nameAr: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0639\u0645\u0648\u0644\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643", nameEn: "Property Management Commission", type: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A", balance: 11250 },
      { id: "acc-4200", code: "4200", nameAr: "\u0639\u0645\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0648\u0627\u0644\u0633\u0639\u064A", nameEn: "Leasing & Brokerage Fees", type: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A", balance: 5550 },
      { id: "acc-5100", code: "5100", nameAr: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0625\u0635\u0644\u0627\u062D", nameEn: "Maintenance & Repairs Expense", type: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A", balance: 3400 },
      { id: "acc-5200", code: "5200", nameAr: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0645\u064A\u0627\u0647 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644", nameEn: "Utilities & Operations Expense", type: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A", balance: 2150 }
    ],
    journals: [
      {
        id: "jrn-1",
        entryNumber: "JRN-2026-0001",
        date: "2026-07-14",
        description: "\u062A\u062D\u0635\u064A\u0644 \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 A-101 \u0628\u0645\u0648\u062C\u0628 \u0633\u0646\u062F RCP-2026-0001 \u0648\u062A\u0648\u0632\u064A\u0639 \u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 5%",
        referenceType: "\u062A\u062D\u0635\u064A\u0644",
        referenceId: "pay-1",
        propertyId: "prop-1",
        ownerId: "own-1",
        createdBy: "usr-acc",
        lines: [
          { accountId: "acc-1010", accountName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A / \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A", debit: 24e3, credit: 0 },
          { accountId: "acc-2200", accountName: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643 (\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643)", debit: 0, credit: 22800 },
          { accountId: "acc-4100", accountName: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0639\u0645\u0648\u0644\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643", debit: 0, credit: 1200 }
        ]
      },
      {
        id: "jrn-2",
        entryNumber: "JRN-2026-0002",
        date: "2026-08-12",
        description: "\u062A\u062D\u0635\u064A\u0644 \u062F\u0641\u0639\u0629 \u062C\u0632\u0626\u064A\u0629 \u0644\u0644\u0648\u062D\u062F\u0629 A-102 \u0628\u0645\u0648\u062C\u0628 \u0633\u0646\u062F RCP-2026-0002",
        referenceType: "\u062A\u062D\u0635\u064A\u0644",
        referenceId: "pay-2",
        propertyId: "prop-1",
        ownerId: "own-1",
        createdBy: "usr-acc",
        lines: [
          { accountId: "acc-1010", accountName: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A / \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A", debit: 9e3, credit: 0 },
          { accountId: "acc-2200", accountName: "\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643 (\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u0627\u0644\u0645\u0644\u0627\u0643)", debit: 0, credit: 8550 },
          { accountId: "acc-4100", accountName: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0639\u0645\u0648\u0644\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0645\u0644\u0627\u0643", debit: 0, credit: 450 }
        ]
      }
    ],
    expenses: [
      {
        id: "exp-1",
        expenseNumber: "EXP-2026-0001",
        date: "2026-10-28",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0645\u0634\u0627\u0639\u0627\u062A",
        propertyId: "prop-1",
        invoiceNumber: "INV-SEC-88120",
        amount: 1450,
        vatAmount: 189.13,
        netAmount: 1260.87,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paidFromAccount: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (SNB)",
        paymentStatus: "\u0645\u062F\u0641\u0648\u0639 \u0628\u0627\u0644\u0643\u0627\u0645\u0644",
        paidAmount: 1450,
        remainingAmount: 0,
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0645\u0639\u062A\u0645\u062F",
        approvedBySupervisor: "usr-sup",
        approvedByManager: "usr-gm",
        zatcaQrVerified: true,
        createdBy: "usr-sup",
        notes: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0645\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0639\u062F \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
        createdAt: "2026-10-28T09:30:00.000Z"
      },
      {
        id: "exp-2",
        expenseNumber: "EXP-2026-0002",
        date: "2026-11-12",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        subCategory: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        propertyId: "prop-1",
        unitId: "unit-104",
        vendorId: "vnd-1",
        ticketId: "tkt-1",
        invoiceNumber: "INV-NAS-4410",
        amount: 1850,
        vatAmount: 241.3,
        netAmount: 1608.7,
        paymentMethod: "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paidFromAccount: "\u0627\u0644\u0628\u0646\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u0633\u0639\u0648\u062F\u064A (SNB)",
        paymentStatus: "\u0644\u0645 \u064A\u064F\u062F\u0641\u0639",
        paidAmount: 0,
        remainingAmount: 1850,
        dueDate: "2026-11-20",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u062F\u064A\u0631",
        approvedBySupervisor: "usr-sup",
        approvedByDeptManager: "usr-mm",
        zatcaQrVerified: true,
        createdBy: "usr-tech",
        notes: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0645\u0643\u064A\u0641 \u0633\u0628\u0644\u064A\u062A \u0627\u0644\u0635\u0627\u0644\u0629 - \u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0634\u0631\u0641 \u0648\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u062F\u064A\u0631",
        createdAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "exp-3",
        expenseNumber: "EXP-2026-0003",
        date: "2026-11-13",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0646\u0638\u0627\u0641\u0629 \u0639\u0627\u0645\u0629",
        propertyId: "prop-2",
        unitId: "unit-203",
        vendorId: "vnd-3",
        invoiceNumber: "INV-ISH-902",
        amount: 420,
        vatAmount: 54.78,
        netAmount: 365.22,
        paymentMethod: "\u0646\u0642\u062F\u064A",
        paidFromAccount: "\u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0646\u0642\u062F\u064A",
        paymentStatus: "\u0644\u0645 \u064A\u064F\u062F\u0641\u0639",
        paidAmount: 0,
        remainingAmount: 420,
        dueDate: "2026-11-18",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        createdBy: "usr-lease",
        notes: "\u062A\u0646\u0638\u064A\u0641 \u0634\u0627\u0645\u0644 \u0648\u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0645\u0643\u062A\u0628 M-405 \u0628\u0639\u062F \u0627\u0644\u0625\u062E\u0644\u0627\u0621",
        createdAt: "2026-11-13T11:00:00.000Z"
      }
    ],
    supplierInvoices: [
      {
        id: "sinv-1",
        invoiceCode: "SINV-2026-001",
        supplierInvoiceNumber: "NAS-2026-4410",
        invoiceDate: "2026-11-12",
        receivedDate: "2026-11-12",
        dueDate: "2026-11-25",
        vendorId: "vnd-1",
        propertyId: "prop-1",
        unitId: "unit-104",
        ticketId: "tkt-1",
        items: [
          { id: "si-1", description: "\u062A\u0648\u0631\u064A\u062F \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0633\u0628\u0644\u064A\u062A 24,000 \u0648\u062D\u062F\u0629 \u0623\u0635\u0644\u064A", quantity: 1, unitPrice: 1300, total: 1300 },
          { id: "si-2", description: "\u0623\u062C\u0648\u0631 \u0641\u0643 \u0648\u062A\u0631\u0643\u064A\u0628 \u0648\u062A\u0639\u0628\u0626\u0629 \u0641\u0631\u064A\u0648\u0646 410A", quantity: 1, unitPrice: 308.7, total: 308.7 }
        ],
        subtotal: 1608.7,
        vatAmount: 241.3,
        totalAmount: 1850,
        paidAmount: 0,
        remainingAmount: 1850,
        currency: "SAR",
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F",
        zatcaQrVerified: true,
        zatcaQrData: "ZATCA|310884422100003|2026-11-12|1850.00|241.30",
        notes: "\u0636\u0645\u0627\u0646 12 \u0634\u0647\u0631\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0648\u0627\u0644\u062A\u0631\u0643\u064A\u0628",
        createdBy: "usr-mm",
        createdAt: "2026-11-12T14:25:00.000Z"
      },
      {
        id: "sinv-2",
        invoiceCode: "SINV-2026-002",
        supplierInvoiceNumber: "RKZ-2026-1182",
        invoiceDate: "2026-11-05",
        receivedDate: "2026-11-06",
        dueDate: "2026-11-12",
        vendorId: "vnd-2",
        propertyId: "prop-2",
        items: [
          { id: "si-3", description: "\u0635\u064A\u0627\u0646\u0629 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u062A\u063A\u064A\u064A\u0631 \u0642\u0648\u0627\u0637\u0639 \u0627\u0644\u0645\u0645\u0631\u0627\u062A", quantity: 2, unitPrice: 950, total: 1900 },
          { id: "si-4", description: "\u0641\u062D\u0635 \u0645\u0636\u062E\u0627\u062A \u0627\u0644\u0645\u064A\u0627\u0647 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629", quantity: 1, unitPrice: 600, total: 600 }
        ],
        subtotal: 2500,
        vatAmount: 375,
        totalAmount: 2875,
        paidAmount: 1500,
        remainingAmount: 1375,
        currency: "SAR",
        status: "\u0645\u062A\u0623\u062E\u0631\u0629",
        zatcaQrVerified: true,
        zatcaQrData: "ZATCA|310772233400003|2026-11-05|2875.00|375.00",
        notes: "\u0633\u064F\u062F\u062F\u062A \u062F\u0641\u0639\u0629 \u0623\u0648\u0644\u0649 1,500 \u0631.\u0633 \u0648\u0645\u062A\u0628\u0642\u064A 1,375 \u0631.\u0633",
        createdBy: "usr-acc",
        approvedBy: "usr-gm",
        createdAt: "2026-11-06T09:15:00.000Z"
      }
    ],
    recurringExpenses: [
      {
        id: "rexp-1",
        title: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0645\u0634\u0627\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u0627\u0639\u062F \u0627\u0644\u0634\u0647\u0631\u064A\u0629",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0645\u0634\u0627\u0639\u0627\u062A",
        propertyId: "prop-1",
        estimatedAmount: 1450,
        currency: "SAR",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        frequency: "\u0634\u0647\u0631\u064A",
        dayOfMonth: 28,
        enabled: true,
        lastGeneratedMonth: "2026-10",
        createdBy: "usr-acc",
        createdAt: "2026-01-01T08:00:00.000Z"
      },
      {
        id: "rexp-2",
        title: "\u0639\u0642\u062F \u0627\u0644\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u0644\u0644\u0645\u0645\u0631\u0627\u062A \u0648\u0627\u0644\u0648\u0627\u062C\u0647\u0629",
        category: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        subCategory: "\u0646\u0638\u0627\u0641\u0629 \u0639\u0627\u0645\u0629",
        propertyId: "prop-2",
        vendorId: "vnd-3",
        estimatedAmount: 1800,
        currency: "SAR",
        bearer: "\u0627\u0644\u0645\u0627\u0644\u0643",
        frequency: "\u0634\u0647\u0631\u064A",
        dayOfMonth: 5,
        enabled: true,
        lastGeneratedMonth: "2026-10",
        createdBy: "usr-sup",
        createdAt: "2026-02-01T08:00:00.000Z"
      }
    ],
    propertyBudgets: [
      {
        id: "pbdg-1",
        propertyId: "prop-1",
        month: "2026-11",
        monthlyLimitSar: 5e3,
        alertThresholdPercent: 80,
        blockAt100Percent: false,
        updatedBy: "usr-gm",
        updatedAt: "2026-11-01T08:00:00.000Z"
      },
      {
        id: "pbdg-2",
        propertyId: "prop-2",
        month: "2026-11",
        monthlyLimitSar: 8e3,
        alertThresholdPercent: 80,
        blockAt100Percent: false,
        updatedBy: "usr-gm",
        updatedAt: "2026-11-01T08:00:00.000Z"
      }
    ],
    assets: [
      {
        id: "ast-1",
        propertyId: "prop-1",
        unitId: "unit-104",
        name: "\u0645\u0643\u064A\u0641 \u0633\u0628\u0644\u064A\u062A \u062C\u0631\u064A 24 \u0623\u0644\u0641 \u0648\u062D\u062F\u0629 - \u0627\u0644\u0635\u0627\u0644\u0629",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        serialNumber: "GREE-24K-882910",
        brand: "Gree",
        purchaseDate: "2025-02-15",
        warrantyExpiry: "2027-02-15",
        condition: "\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629"
      },
      {
        id: "ast-2",
        propertyId: "prop-1",
        unitId: "unit-101",
        name: "\u0633\u062E\u0627\u0646 \u0645\u064A\u0627\u0647 \u062E\u0632\u0641 \u0633\u0639\u0648\u062F\u064A 80 \u0644\u062A\u0631",
        category: "\u0633\u0628\u0627\u0643\u0629",
        serialNumber: "SH-80L-119283",
        brand: "\u0627\u0644\u062E\u0632\u0641 \u0627\u0644\u0633\u0639\u0648\u062F\u064A",
        purchaseDate: "2025-06-10",
        warrantyExpiry: "2028-06-10",
        condition: "\u0645\u0645\u062A\u0627\u0632"
      }
    ],
    tickets: [
      {
        id: "tkt-1",
        ticketNumber: "MNT-2026-001",
        propertyId: "prop-1",
        unitId: "unit-104",
        source: "\u0627\u0644\u0645\u0634\u0631\u0641",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        priority: "\u0639\u0627\u062C\u0644",
        title: "\u062A\u0648\u0642\u0641 \u0627\u0644\u062A\u0628\u0631\u064A\u062F \u0641\u064A \u0645\u0643\u064A\u0641 \u0627\u0644\u0635\u0627\u0644\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        description: "\u0627\u0644\u0645\u0643\u064A\u0641 \u064A\u0639\u0645\u0644 \u0645\u0631\u0648\u062D\u0629 \u0641\u0642\u0637 \u0645\u0639 \u0635\u0648\u062A \u0637\u0642\u0637\u0642\u0629 \u0645\u0646 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629.",
        assignedTo: "usr-tech",
        vendorId: "vnd-1",
        scheduledDate: "2026-11-14",
        diagnosis: "\u062A\u0644\u0641 \u0641\u064A \u0636\u0627\u063A\u0637 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u064A\u062D\u062A\u0627\u062C \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u062C\u062F\u064A\u062F \u0645\u0634\u0645\u0648\u0644 \u0628\u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631",
        estimatedCost: 1850,
        actualCost: 1850,
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0643\u0644\u0641\u0629",
        assetId: "ast-1",
        linkedExpenseId: "exp-2",
        linkedTaskId: "tsk-1",
        createdBy: "usr-sup",
        createdAt: "2026-11-11T09:00:00.000Z",
        updatedAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "tkt-2",
        ticketNumber: "MNT-2026-002",
        propertyId: "prop-1",
        unitId: "unit-102",
        tenantId: "ten-2",
        source: "\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631",
        category: "\u0633\u0628\u0627\u0643\u0629",
        priority: "\u0645\u0631\u062A\u0641\u0639",
        title: "\u062A\u0633\u0631\u0628 \u0645\u064A\u0627\u0647 \u0623\u0633\u0641\u0644 \u0645\u063A\u0633\u0644\u0629 \u0627\u0644\u0645\u0637\u0628\u062E",
        description: "\u0623\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0639\u0646 \u062A\u0633\u0631\u0628 \u0645\u064A\u0627\u0647 \u062E\u0641\u064A\u0641 \u0639\u0646\u062F \u0641\u062A\u062D \u062E\u0644\u0627\u0637 \u0627\u0644\u0645\u0637\u0628\u062E.",
        assignedTo: "usr-tech",
        scheduledDate: "2026-11-15",
        estimatedCost: 280,
        actualCost: 0,
        status: "\u062A\u0645 \u0627\u0644\u0625\u0633\u0646\u0627\u062F",
        linkedTaskId: "tsk-2",
        createdBy: "usr-sup",
        createdAt: "2026-11-13T16:15:00.000Z",
        updatedAt: "2026-11-13T17:00:00.000Z"
      },
      {
        id: "tkt-arch-1",
        ticketNumber: "MNT-2026-000",
        propertyId: "prop-1",
        unitId: "unit-101",
        tenantId: "ten-1",
        source: "\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631",
        category: "\u0643\u0647\u0631\u0628\u0627\u0621",
        priority: "\u0645\u062A\u0648\u0633\u0637",
        title: "\u062A\u0628\u062F\u064A\u0644 \u0642\u0627\u0637\u0639 \u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0645\u0637\u0628\u062E \u0627\u0644\u0631\u0626\u064A\u0633\u064A 32 \u0623\u0645\u0628\u064A\u0631",
        description: "\u0641\u0635\u0644 \u0645\u062A\u0643\u0631\u0631 \u0644\u0644\u0642\u0627\u0637\u0639 \u0639\u0646\u062F \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u0631\u0646 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A.",
        assignedTo: "usr-tech",
        vendorId: "vnd-2",
        scheduledDate: "2026-08-05",
        diagnosis: "\u0636\u0639\u0641 \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u0644\u0627\u0645\u0633 \u0641\u064A \u0627\u0644\u0642\u0627\u0637\u0639 \u0627\u0644\u0642\u062F\u064A\u0645 \u0648\u062A\u0645 \u0627\u0633\u062A\u0628\u062F\u0627\u0644\u0647 \u0628\u0642\u0627\u0637\u0639 \u0634\u0646\u0627\u064A\u062F\u0631 \u0623\u0635\u0644\u064A",
        estimatedCost: 300,
        actualCost: 260,
        status: "\u0645\u063A\u0644\u0642",
        rating: 5,
        beforeNote: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u062A\u0638\u0647\u0631 \u0633\u062E\u0648\u0646\u0629 \u0641\u064A \u0627\u0644\u0642\u0627\u0637\u0639 \u0631\u0642\u0645 4",
        afterNote: "\u062A\u0645 \u0627\u0644\u062A\u0631\u0643\u064A\u0628 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0623\u062D\u0645\u0627\u0644 \u0628\u0646\u062C\u0627\u062D \u062E\u0644\u0627\u0644 45 \u062F\u0642\u064A\u0642\u0629",
        createdBy: "usr-sup",
        createdAt: "2026-08-04T10:00:00.000Z",
        updatedAt: "2026-08-05T12:15:00.000Z",
        archivedAt: "2026-08-06T09:00:00.000Z",
        archiveReason: "\u0628\u0644\u0627\u063A \u0645\u0646\u062C\u0632 \u0648\u0645\u063A\u0644\u0642 \u0628\u062A\u0642\u064A\u064A\u0645 5/5",
        archivedBy: "usr-sup",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630"
      }
    ],
    tasks: [
      {
        id: "tsk-1",
        title: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0639\u062A\u0645\u0627\u062F \u0648\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0634\u0642\u0629 B-204",
        description: "\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0645\u0646 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u062B\u0645 \u062A\u0648\u062B\u064A\u0642 \u0635\u0648\u0631 \u0642\u0628\u0644 \u0648\u0628\u0639\u062F",
        type: "\u0635\u064A\u0627\u0646\u0629",
        propertyId: "prop-1",
        unitId: "unit-104",
        assignedTo: "usr-tech",
        createdBy: "usr-sup",
        dueDate: "2026-11-15",
        priority: "\u0639\u0627\u062C\u0644",
        status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629",
        checklist: [
          { text: "\u0641\u062D\u0635 \u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0637\u0644", done: true },
          { text: "\u0625\u0635\u062F\u0627\u0631 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0648\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629", done: true },
          { text: "\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0648\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062A\u0631\u0643\u064A\u0628", done: false }
        ],
        comments: [
          {
            id: "cmt-1",
            authorName: "\u0639\u0645\u0631 \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
            text: "\u062A\u0645 \u0641\u062D\u0635 \u0627\u0644\u062C\u0647\u0627\u0632 \u0648\u0627\u0644\u062C\u0647\u0627\u0632 \u062A\u062D\u062A \u0627\u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u062C\u0632\u0626\u064A\u060C \u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0644\u0644\u0645\u0634\u0631\u0641.",
            createdAt: "2026-11-12T14:25:00.000Z"
          }
        ],
        linkedTicketId: "tkt-1",
        createdAt: "2026-11-11T09:10:00.000Z"
      },
      {
        id: "tsk-2",
        title: "\u0645\u0639\u0627\u0644\u062C\u0629 \u062A\u0633\u0631\u0628 \u0645\u063A\u0633\u0644\u0629 \u0634\u0642\u0629 A-102",
        description: "\u0632\u064A\u0627\u0631\u0629 \u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0648\u062A\u0628\u062F\u064A\u0644 \u0644\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062C\u0644\u062F.",
        type: "\u0635\u064A\u0627\u0646\u0629",
        propertyId: "prop-1",
        unitId: "unit-102",
        assignedTo: "usr-tech",
        createdBy: "usr-sup",
        dueDate: "2026-11-15",
        priority: "\u0645\u0631\u062A\u0641\u0639",
        status: "\u0645\u0633\u0646\u062F\u0629",
        checklist: [
          { text: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0644\u062A\u0623\u0643\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u062F\u062E\u0648\u0644", done: true },
          { text: "\u0625\u0635\u0644\u0627\u062D \u0627\u0644\u062A\u0633\u0631\u0628 \u0648\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0646\u062A\u064A\u062C\u0629", done: false }
        ],
        comments: [],
        linkedTicketId: "tkt-2",
        createdAt: "2026-11-13T17:00:00.000Z"
      },
      {
        id: "tsk-3",
        title: "\u0645\u062A\u0627\u0628\u0639\u0629 \u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A \u0644\u0644\u0648\u062D\u062F\u0629 A-102 \u0648\u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F S-01",
        description: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0637\u0627\u0631\u0642 \u0627\u0644\u0634\u0647\u0631\u064A \u0644\u0633\u062F\u0627\u062F 18,000 \u0631.\u0633 \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629\u060C \u0648\u062A\u062C\u0647\u064A\u0632 \u0639\u0631\u0636 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u0639\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.",
        type: "\u062A\u062D\u0635\u064A\u0644 \u0625\u064A\u062C\u0627\u0631",
        propertyId: "prop-1",
        unitId: "unit-102",
        assignedTo: "usr-acc",
        createdBy: "usr-gm",
        dueDate: "2026-11-14",
        priority: "\u0639\u0627\u062C\u0644",
        status: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630",
        checklist: [
          { text: "\u0625\u0631\u0633\u0627\u0644 \u062A\u0630\u0643\u064A\u0631 \u0633\u062F\u0627\u062F \u0631\u0633\u0645\u064A \u0639\u0628\u0631 \u0627\u0644\u0642\u0648\u0627\u0644\u0628", done: true },
          { text: "\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u062F\u0641\u0639\u0629 \u0648\u0625\u0635\u062F\u0627\u0631 \u0633\u0646\u062F \u0627\u0644\u0642\u0628\u0636", done: false }
        ],
        comments: [],
        createdAt: "2026-11-13T08:00:00.000Z"
      },
      {
        id: "tsk-4",
        title: "\u062A\u0648\u062B\u064A\u0642 \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0644\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0645\u062D\u062C\u0648\u0632 M-302",
        description: "\u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0627\u0633\u0631 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0645\u0631\u0628\u0648\u0637 \u0628\u0627\u0644\u0648\u062D\u062F\u0629 \u0625\u062F\u0627\u0631\u064A\u0627\u064B - \u064A\u062C\u0628 \u0627\u0633\u062A\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631 \u0642\u0628\u0644 \u0627\u0644\u062A\u0641\u0639\u064A\u0644.",
        type: "\u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F",
        propertyId: "prop-2",
        unitId: "unit-202",
        assignedTo: "usr-lease",
        createdBy: "usr-lease",
        dueDate: "2026-11-16",
        priority: "\u0645\u062A\u0648\u0633\u0637",
        status: "\u062C\u062F\u064A\u062F\u0629",
        checklist: [
          { text: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0647\u0648\u064A\u0629 \u0648\u0627\u0644\u0633\u062C\u0644", done: true },
          { text: "\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0639\u0642\u062F \u0641\u064A \u0625\u064A\u062C\u0627\u0631 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0631\u0633\u0645\u064A", done: false }
        ],
        comments: [],
        createdAt: "2026-11-14T08:30:00.000Z"
      },
      {
        id: "tsk-arch-1",
        title: "\u0641\u062D\u0635 \u0648\u0645\u0639\u0627\u064A\u0646\u0629 \u0625\u062E\u0644\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u0648\u062F\u064A\u0648 R-401",
        description: "\u062C\u0631\u062F \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0648\u0627\u0644\u0631\u064A\u0645\u0648\u062A\u0627\u062A \u0648\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0639\u062F\u0627\u062F\u0627\u062A \u0642\u0628\u0644 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0623\u0633\u064A\u0633",
        type: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0625\u062E\u0644\u0627\u0621",
        propertyId: "prop-1",
        unitId: "unit-arch-1",
        assignedTo: "usr-sup",
        createdBy: "usr-lease",
        dueDate: "2026-09-15",
        priority: "\u0645\u062A\u0648\u0633\u0637",
        status: "\u0645\u0643\u062A\u0645\u0644\u0629",
        checklist: [
          { text: "\u0627\u0633\u062A\u0644\u0627\u0645 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0648\u0627\u0644\u0631\u064A\u0645\u0648\u062A\u0627\u062A", done: true },
          { text: "\u062A\u0648\u062B\u064A\u0642 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0645\u064A\u0627\u0647", done: true }
        ],
        comments: [],
        createdAt: "2026-09-14T09:00:00.000Z",
        archivedAt: "2026-09-16T02:00:00.000Z",
        archiveReason: "\u0645\u0647\u0645\u0629 \u0645\u0646\u062C\u0632\u0629 \u0648\u0645\u0624\u0631\u0634\u0641\u0629",
        archivedBy: "usr-sup",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0645\u0643\u062A\u0645\u0644\u0629"
      }
    ],
    communications: [
      {
        id: "com-1",
        targetType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        targetId: "ten-2",
        targetName: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
        channel: "\u0631\u0633\u0627\u0644\u0629 \u0646\u0635\u064A\u0629 / \u0648\u0627\u062A\u0633\u0627\u0628",
        templateUsed: "\u0637\u0644\u0628 \u0633\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A",
        language: "ar",
        summary: "\u062A\u0630\u0643\u064A\u0631 \u0628\u0633\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0645\u0646 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u062B\u0627\u0644\u062B (4,500 \u0631.\u0633) \u0648\u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0631\u0627\u0628\u0639 \u0627\u0644\u0645\u0633\u062A\u062D\u0642 (13,500 \u0631.\u0633).",
        sentBy: "usr-acc",
        createdAt: "2026-11-13T10:30:00.000Z"
      },
      {
        id: "com-2",
        targetType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        targetId: "ten-3",
        targetName: "\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
        channel: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
        templateUsed: "\u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0648\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u062F",
        language: "ar",
        summary: "\u0625\u0634\u0639\u0627\u0631 \u0628\u0642\u0631\u0628 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F EJ-1048112233 \u0628\u062A\u0627\u0631\u064A\u062E 2026-11-30 \u0648\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u0631\u0627\u0628\u0639\u0629.",
        sentBy: "usr-lease",
        createdAt: "2026-11-14T09:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc-1",
        title: "\u0635\u0643 \u0645\u0644\u0643\u064A\u0629 \u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
        category: "\u0635\u0643\u0648\u0643",
        fileName: "deed-410109034821.pdf",
        fileType: "PDF",
        fileSizeKb: 1420,
        relatedType: "\u0639\u0642\u0627\u0631",
        relatedId: "prop-1",
        version: 1,
        uploadedBy: "usr-gm",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0635\u0643 \u0645\u0644\u0643\u064A\u0629",
          propertyNameAr: "\u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
          deedNumber: "410109034821",
          city: "\u0627\u0644\u0631\u064A\u0627\u0636",
          district: "\u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646",
          rawText: "\u0635\u0643 \u0645\u0644\u0643\u064A\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0631\u0642\u0645 410109034821 - \u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0631\u064A\u0627\u0636 - \u062D\u064A \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 - \u0645\u062C\u0645\u0639 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 \u0627\u0644\u0633\u0643\u0646\u064A",
          confidenceNote: "\u062A\u0645\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0645\u0631\u062C\u0639\u064A\u0629 \u0645\u0639 \u0633\u062C\u0644 \u0627\u0644\u0635\u0643\u0648\u0643"
        },
        accessLog: [
          {
            id: "dacc-1",
            userId: "usr-gm",
            userName: "\u0633\u0639\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
            deviceName: "MacBook Pro \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u0629",
            action: "\u0645\u0639\u0627\u064A\u0646\u0629",
            accessedAt: "2026-11-10T09:15:00.000Z"
          }
        ],
        createdAt: "2025-01-10T09:00:00.000Z"
      },
      {
        id: "doc-2",
        title: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0648\u062D\u062F - \u0628\u0646\u062F\u0631 \u0627\u0644\u063A\u0627\u0645\u062F\u064A (A-101)",
        category: "\u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631",
        fileName: "ejar-EJ-1049283711.pdf",
        fileType: "PDF",
        fileSizeKb: 890,
        relatedType: "\u0639\u0642\u062F",
        relatedId: "ctr-1",
        expiryDate: "2027-01-14",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631",
          tenantNameAr: "\u0628\u0646\u062F\u0631 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
          nationalIdOrIqama: "1088442211",
          ejarNumber: "EJ-1049283711",
          unitNumber: "A-101",
          startDate: "2026-01-15",
          endDate: "2027-01-14",
          annualRent: 48e3,
          currency: "SAR",
          rawText: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0645\u0648\u062D\u062F \u0631\u0642\u0645 EJ-1049283711 - \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631: \u0628\u0646\u062F\u0631 \u0628\u0646 \u0645\u062D\u0645\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A - \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0633\u0646\u0648\u064A: 48,000 \u0631.\u0633"
        },
        accessLog: [],
        createdAt: "2026-01-14T10:15:00.000Z"
      },
      {
        id: "doc-3",
        title: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629 \u0645\u0643\u064A\u0641 B-204 - \u0645\u0624\u0633\u0633\u0629 \u0646\u0633\u064A\u0645",
        category: "\u0641\u0648\u0627\u062A\u064A\u0631",
        fileName: "INV-NAS-4410.pdf",
        fileType: "PDF",
        fileSizeKb: 315,
        relatedType: "\u0645\u0635\u0631\u0648\u0641",
        relatedId: "exp-2",
        version: 1,
        uploadedBy: "usr-tech",
        ocrStatus: "\u0644\u0645 \u064A\u064F\u062D\u0644\u0644",
        accessLog: [],
        createdAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "doc-4",
        title: "\u0635\u0648\u0631\u0629 \u0647\u0648\u064A\u0629 \u0648\u0637\u0646\u064A\u0629 - \u0637\u0627\u0631\u0642 \u0627\u0644\u0634\u0647\u0631\u064A (A-102)",
        category: "\u0647\u0648\u064A\u0627\u062A \u0648\u0625\u0642\u0627\u0645\u0627\u062A",
        fileName: "id-1077331199.jpg",
        fileType: "JPG",
        fileSizeKb: 420,
        relatedType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        relatedId: "ten-2",
        expiryDate: "2026-12-05",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0647\u0648\u064A\u0629 / \u0625\u0642\u0627\u0645\u0629",
          tenantNameAr: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
          nationalIdOrIqama: "1077331199",
          nationality: "\u0633\u0639\u0648\u062F\u064A",
          expiryDate: "2026-12-05",
          rawText: "\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 - \u0627\u0644\u0627\u0633\u0645: \u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A - \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629: 1077331199 - \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621: 2026-12-05"
        },
        accessLog: [],
        createdAt: "2026-02-01T09:10:00.000Z"
      },
      {
        id: "doc-arch-1",
        title: "\u0647\u0648\u064A\u0629 \u0648\u0637\u0646\u064A\u0629 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 - \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646 (R-401)",
        category: "\u0647\u0648\u064A\u0627\u062A \u0648\u0625\u0642\u0627\u0645\u0627\u062A",
        fileName: "id-1055667788-expired.pdf",
        fileType: "PDF",
        fileSizeKb: 380,
        relatedType: "\u0645\u0633\u062A\u0623\u062C\u0631",
        relatedId: "ten-arch-1",
        expiryDate: "2026-06-30",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0647\u0648\u064A\u0629 / \u0625\u0642\u0627\u0645\u0629",
          tenantNameAr: "\u062E\u0627\u0644\u062F \u0628\u0646 \u0633\u0639\u0648\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646",
          nationalIdOrIqama: "1055667788",
          nationality: "\u0633\u0639\u0648\u062F\u064A",
          expiryDate: "2026-06-30",
          rawText: "\u0647\u0648\u064A\u0629 \u0648\u0637\u0646\u064A\u0629 - \u062E\u0627\u0644\u062F \u0628\u0646 \u0633\u0639\u0648\u062F \u0627\u0644\u0639\u0644\u064A\u0627\u0646 - \u0627\u0646\u062A\u0647\u062A \u0641\u064A 2026-06-30"
        },
        accessLog: [],
        createdAt: "2025-09-10T09:40:00.000Z",
        archivedAt: "2026-07-01T02:00:00.000Z",
        archiveReason: "\u0627\u0646\u062A\u0647\u0627\u0621 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u062B\u064A\u0642\u0629 (\u0645\u0634\u0641\u0631\u0629 \u0644\u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629)",
        archivedBy: "usr-gm",
        archiveMode: "\u0645\u062C\u062F\u0648\u0644",
        preArchiveStatus: "\u0646\u0634\u0637"
      },
      {
        id: "doc-arch-2",
        title: "\u0646\u0633\u062E\u0629 \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 2025 - \u0645\u0624\u0633\u0633\u0629 \u0623\u0641\u0642 \u0627\u0644\u0631\u064A\u0627\u0636 (M-108)",
        category: "\u0639\u0642\u0648\u062F \u0625\u064A\u062C\u0627\u0631",
        fileName: "ejar-EJ-1046552211.pdf",
        fileType: "PDF",
        fileSizeKb: 910,
        relatedType: "\u0639\u0642\u062F",
        relatedId: "ctr-arch-2",
        expiryDate: "2025-12-19",
        version: 1,
        uploadedBy: "usr-lease",
        ocrStatus: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0622\u0644\u064A\u0627\u064B",
        ocrExtracted: {
          docType: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631",
          tenantNameAr: "\u0645\u0624\u0633\u0633\u0629 \u0623\u0641\u0642 \u0627\u0644\u0631\u064A\u0627\u0636 \u0644\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A",
          ejarNumber: "EJ-1046552211",
          unitNumber: "M-108",
          annualRent: 38400,
          rawText: "\u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 \u0645\u0648\u062D\u062F EJ-1046552211 - \u0627\u0646\u062A\u0647\u0649 \u0641\u064A 2025-12-19"
        },
        accessLog: [],
        createdAt: "2024-12-15T10:00:00.000Z",
        archivedAt: "2025-12-21T02:00:00.000Z",
        archiveReason: "\u0648\u062B\u064A\u0642\u0629 \u0639\u0642\u062F \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629",
        archivedBy: "usr-lease",
        archiveMode: "\u062A\u0644\u0642\u0627\u0626\u064A",
        preArchiveStatus: "\u0646\u0634\u0637"
      }
    ],
    purchaseOrders: [
      {
        id: "po-1",
        poNumber: "PO-2026-001",
        title: "\u062A\u0648\u0631\u064A\u062F \u0648\u062A\u0631\u0643\u064A\u0628 \u0643\u0645\u0628\u0631\u0648\u0633\u0631 \u0645\u0643\u064A\u0641 \u0633\u0628\u0644\u064A\u062A 24 \u0623\u0644\u0641 \u0648\u062D\u062F\u0629 - \u0634\u0642\u0629 B-204",
        propertyId: "prop-1",
        unitId: "unit-104",
        ticketId: "tkt-1",
        category: "\u062A\u0643\u064A\u064A\u0641 \u0648\u062A\u0628\u0631\u064A\u062F",
        status: "\u0645\u0642\u0627\u0631\u0646\u0629 \u0639\u0631\u0648\u0636",
        quotes: [
          {
            vendorId: "vnd-1",
            vendorName: "\u0645\u0624\u0633\u0633\u0629 \u0646\u0633\u064A\u0645 \u0627\u0644\u062A\u0643\u064A\u064A\u0641 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629",
            amount: 1850,
            deliveryDays: 2,
            warrantyMonths: 12,
            notes: "\u0634\u0627\u0645\u0644 \u0627\u0644\u0641\u0631\u064A\u0648\u0646 \u0648\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0636\u063A\u0637"
          },
          {
            vendorId: "vnd-2",
            vendorName: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0631\u0648\u0627\u062F \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629",
            amount: 2150,
            deliveryDays: 3,
            warrantyMonths: 12,
            notes: "\u062A\u0648\u0635\u064A\u0644 \u0648\u062A\u0631\u0643\u064A\u0628 \u062E\u0644\u0627\u0644 72 \u0633\u0627\u0639\u0629"
          }
        ],
        selectedVendorId: "vnd-1",
        approvedAmount: 1850,
        currency: "SAR",
        createdBy: "usr-sup",
        createdAt: "2026-11-12T10:00:00.000Z"
      },
      {
        id: "po-2",
        poNumber: "PO-2026-002",
        title: "\u062A\u062C\u0647\u064A\u0632 \u0648\u062A\u0644\u0645\u064A\u0639 \u0645\u062F\u0627\u062E\u0644 \u0627\u0644\u062F\u0648\u0631 \u0627\u0644\u0623\u0631\u0636\u064A \u0648\u062A\u0631\u0643\u064A\u0628 \u0625\u0636\u0627\u0621\u0629 LED - \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627",
        propertyId: "prop-2",
        category: "\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0625\u0636\u0627\u0621\u0629",
        status: "\u0623\u0645\u0631 \u0634\u0631\u0627\u0621",
        quotes: [
          {
            vendorId: "vnd-2",
            vendorName: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0631\u0648\u0627\u062F \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629",
            amount: 3400,
            deliveryDays: 4,
            warrantyMonths: 24,
            notes: "\u0625\u0636\u0627\u0621\u0629 \u0645\u0648\u0641\u0631\u0629 \u0644\u0644\u0637\u0627\u0642\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629"
          }
        ],
        selectedVendorId: "vnd-2",
        approvedAmount: 3400,
        currency: "SAR",
        createdBy: "usr-sup",
        approvedBy: "usr-gm",
        createdAt: "2026-11-08T11:30:00.000Z"
      }
    ],
    decisions: [
      {
        id: "dec-1",
        decisionNumber: "DEC-2026-014",
        title: "\u0627\u0639\u062A\u0645\u0627\u062F \u0633\u064A\u0627\u0633\u0629 \u062D\u0633\u0645 \u0627\u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u0628\u0643\u0631 5% \u0644\u0644\u0645\u0644\u062A\u0632\u0645\u064A\u0646 \u0628\u0627\u0644\u0633\u062F\u0627\u062F",
        category: "\u0639\u0642\u0648\u062F",
        summary: "\u064A\u064F\u0645\u0646\u062D \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u0648\u0646 \u0627\u0644\u0645\u0644\u062A\u0632\u0645\u0648\u0646 \u0628\u0633\u062F\u0627\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u062F\u0648\u0646 \u062A\u0623\u062E\u064A\u0631 \u062E\u0635\u0645 5% \u0639\u0646\u062F \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u062F \u0642\u0628\u0644 \u0627\u0646\u062A\u0647\u0627\u0626\u0647 \u0628\u0640 30 \u064A\u0648\u0645\u0627\u064B.",
        effectiveDate: "2026-11-01",
        issuedBy: "usr-gm",
        issuedByName: "\u0633\u0639\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        status: "\u0646\u0627\u0641\u0630",
        createdAt: "2026-11-01T09:00:00.000Z"
      },
      {
        id: "dec-2",
        decisionNumber: "DEC-2026-015",
        title: "\u0625\u0644\u0632\u0627\u0645 \u0631\u0641\u0639 \u0639\u0631\u0636\u064A \u0633\u0639\u0631 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0641\u0648\u0642 1,500 \u0631.\u0633",
        category: "\u0645\u0627\u0644\u064A",
        summary: "\u0644\u0627 \u064A\u064F\u0639\u062A\u0645\u062F \u0623\u064A \u0645\u0635\u0631\u0648\u0641 \u0623\u0648 \u0623\u0645\u0631 \u0634\u0631\u0627\u0621 \u0635\u064A\u0627\u0646\u0629 \u062A\u062A\u062C\u0627\u0648\u0632 \u0642\u064A\u0645\u062A\u0647 1,500 \u0631.\u0633 \u062F\u0648\u0646 \u0625\u0631\u0641\u0627\u0642 \u0639\u0631\u0636\u064A \u0623\u0633\u0639\u0627\u0631 \u0645\u0642\u0627\u0631\u0646\u064A\u0646.",
        effectiveDate: "2026-11-10",
        issuedBy: "usr-gm",
        issuedByName: "\u0633\u0639\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
        status: "\u0646\u0627\u0641\u0630",
        createdAt: "2026-11-10T12:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "not-1",
        titleAr: "\u0645\u0635\u0631\u0648\u0641 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        titleEn: "Expense awaiting GM approval",
        messageAr: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629 \u0634\u0642\u0629 B-204 \u0628\u0645\u0628\u0644\u063A 1,850 \u0631.\u0633 \u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u062A\u0647\u0627 \u0645\u0646 \u0627\u0644\u0645\u0634\u0631\u0641 \u0648\u062A\u0646\u062A\u0638\u0631 \u0627\u0639\u062A\u0645\u0627\u062F\u0643.",
        messageEn: "Maintenance invoice for Unit B-204 (1,850 SAR) approved by supervisor and awaiting GM sign-off.",
        category: "\u0645\u0627\u0644\u064A\u0629",
        targetRoles: ["gm", "accountant"],
        relatedView: "accounting",
        isReadBy: [],
        createdAt: "2026-11-12T14:22:00.000Z"
      },
      {
        id: "not-2",
        titleAr: "\u0639\u0642\u062F \u062A\u062C\u0627\u0631\u064A \u064A\u0642\u062A\u0631\u0628 \u0645\u0646 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 (16 \u064A\u0648\u0645\u0627\u064B)",
        titleEn: "Commercial lease expiring in 16 days",
        messageAr: "\u0639\u0642\u062F \u0627\u0644\u0645\u0639\u0631\u0636 S-01 (\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646) \u064A\u0646\u062A\u0647\u064A \u0641\u064A 2026-11-30 \u0645\u0639 \u062F\u0641\u0639\u0629 \u0645\u0633\u062A\u062D\u0642\u0629 \u0627\u0644\u064A\u0648\u0645.",
        messageEn: "Lease for Showroom S-01 expires on 2026-11-30 with installment due today.",
        category: "\u062A\u0634\u063A\u064A\u0644\u064A\u0629",
        targetRoles: ["gm", "leasing", "supervisor", "accountant"],
        relatedView: "leasing",
        isReadBy: [],
        createdAt: "2026-11-14T08:00:00.000Z"
      }
    ],
    reminderRules: [
      {
        id: "rem-1",
        nameAr: "\u062A\u0630\u0643\u064A\u0631 \u0645\u0628\u0643\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0628\u0640 7 \u0623\u064A\u0627\u0645",
        nameEn: "7-Day Advance Rent Reminder",
        enabled: true,
        daysBeforeDue: 7,
        channels: ["\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", "\u0648\u0627\u062A\u0633\u0627\u0628"],
        templateAr: "\u0645\u0631\u062D\u0628\u0627\u064B {tenant}\u060C \u0646\u0648\u062F \u062A\u0630\u0643\u064A\u0631\u0643\u0645 \u0628\u0627\u0642\u062A\u0631\u0627\u0628 \u0645\u0648\u0639\u062F \u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0627\u0644\u0642\u0633\u0637 \u0631\u0642\u0645 {installment} \u0644\u0639\u0642\u062F {contract} (\u0627\u0644\u0648\u062D\u062F\u0629 {unit}) \u0628\u0642\u064A\u0645\u0629 {amount} \u0628\u062A\u0627\u0631\u064A\u062E {dueDate}.",
        templateEn: "Hello {tenant}, your rent installment #{installment} for contract {contract} (Unit {unit}) of {amount} is due on {dueDate}.",
        lastRunAt: "2026-11-14T08:00:00.000Z",
        createdBy: "usr-lease",
        createdAt: "2026-10-01T09:00:00.000Z"
      },
      {
        id: "rem-2",
        nameAr: "\u062A\u0646\u0628\u064A\u0647 \u064A\u0648\u0645 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0648\u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A \u0639\u0628\u0631 SMS \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628",
        nameEn: "Due Date & Overdue SMS/WhatsApp Alert",
        enabled: true,
        daysBeforeDue: 0,
        channels: ["\u0631\u0633\u0627\u0626\u0644 \u0646\u0635\u064A\u0629 SMS (\u0645\u062D\u0627\u0643\u0627\u0629)", "\u0648\u0627\u062A\u0633\u0627\u0628"],
        templateAr: "\u0639\u0632\u064A\u0632\u064A {tenant}\u060C \u0646\u0631\u062C\u0648 \u0627\u0644\u0645\u0628\u0627\u062F\u0631\u0629 \u0628\u0633\u062F\u0627\u062F \u062F\u0641\u0639\u0629 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629 \u0644\u0644\u0648\u062D\u062F\u0629 {unit} \u0628\u0645\u0628\u0644\u063A {amount} (\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 {dueDate}).",
        templateEn: "Dear {tenant}, rent installment for Unit {unit} ({amount}) due on {dueDate} requires settlement.",
        lastRunAt: "2026-11-14T08:30:00.000Z",
        createdBy: "usr-acc",
        createdAt: "2026-10-15T09:00:00.000Z"
      }
    ],
    reminderLogs: [
      {
        id: "rlog-1",
        ruleId: "rem-2",
        ruleName: "\u062A\u0646\u0628\u064A\u0647 \u064A\u0648\u0645 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0648\u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A \u0639\u0628\u0631 SMS \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628",
        contractId: "ctr-3",
        installmentId: "inst-10",
        tenantId: "ten-3",
        tenantName: "\u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
        channel: "\u0648\u0627\u062A\u0633\u0627\u0628",
        recipient: "0502233445",
        messagePreview: "\u0639\u0632\u064A\u0632\u064A \u0645\u0624\u0633\u0633\u0629 \u0645\u0630\u0627\u0642 \u0627\u0644\u0628\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629\u060C \u0646\u0631\u062C\u0648 \u0627\u0644\u0645\u0628\u0627\u062F\u0631\u0629 \u0628\u0633\u062F\u0627\u062F \u062F\u0641\u0639\u0629 \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629 \u0644\u0644\u0648\u062D\u062F\u0629 S-01 \u0628\u0645\u0628\u0644\u063A 30,000 \u0631.\u0633 (\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 2026-11-14).",
        dueDate: "2026-11-14",
        amount: 3e4,
        currency: "SAR",
        status: "\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 (\u0645\u062D\u0627\u0643\u0627\u0629)",
        sentAt: "2026-11-14T08:30:00.000Z"
      },
      {
        id: "rlog-2",
        ruleId: "rem-1",
        ruleName: "\u062A\u0630\u0643\u064A\u0631 \u0645\u0628\u0643\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0628\u0640 7 \u0623\u064A\u0627\u0645",
        contractId: "ctr-2",
        installmentId: "inst-6",
        tenantId: "ten-2",
        tenantName: "\u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A",
        channel: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
        recipient: "tariq.s@yahoo.com",
        messagePreview: "\u0645\u0631\u062D\u0628\u0627\u064B \u0637\u0627\u0631\u0642 \u0628\u0646 \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0634\u0647\u0631\u064A\u060C \u0646\u0648\u062F \u062A\u0630\u0643\u064A\u0631\u0643\u0645 \u0628\u0627\u0642\u062A\u0631\u0627\u0628 \u0645\u0648\u0639\u062F \u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0627\u0644\u0642\u0633\u0637 \u0631\u0642\u0645 4 \u0644\u0639\u0642\u062F CNT-2026-002 (\u0627\u0644\u0648\u062D\u062F\u0629 A-102) \u0628\u0642\u064A\u0645\u0629 13,500 \u0631.\u0633 \u0628\u062A\u0627\u0631\u064A\u062E 2026-11-01.",
        dueDate: "2026-11-01",
        amount: 13500,
        currency: "SAR",
        status: "\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 (\u0645\u062D\u0627\u0643\u0627\u0629)",
        sentAt: "2026-11-13T10:00:00.000Z"
      }
    ],
    auditLogs: [
      {
        id: "aud-1",
        userId: "usr-tech",
        userName: "\u0639\u0645\u0631 \u0628\u0646 \u0633\u0639\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        userRole: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A",
        deviceName: "Android Mobile \xB7 \u062C\u0648\u0627\u0644 \u0627\u0644\u0641\u0646\u064A",
        action: "\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629",
        entityType: "Expense",
        entityId: "exp-2",
        summary: "\u0631\u0641\u0639 \u0641\u0627\u062A\u0648\u0631\u0629 \u0635\u064A\u0627\u0646\u0629 INV-NAS-4410 \u0628\u0645\u0628\u0644\u063A 1,850 \u0631.\u0633 \u0644\u0644\u0628\u0644\u0627\u063A MNT-2026-001",
        newValue: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        createdAt: "2026-11-12T14:20:00.000Z"
      },
      {
        id: "aud-2",
        userId: "usr-sup",
        userName: "\u0645\u0627\u062C\u062F \u0628\u0646 \u062A\u0631\u0643\u064A \u0627\u0644\u062D\u0631\u0628\u064A",
        userRole: "\u0645\u0634\u0631\u0641 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644",
        deviceName: "Android Tablet \xB7 \u0645\u064A\u062F\u0627\u0646\u064A",
        action: "\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0631\u062D\u0644\u0629 \u0623\u0648\u0644\u0649 (\u0645\u0634\u0631\u0641)",
        entityType: "Expense",
        entityId: "exp-2",
        summary: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641 EXP-2026-0002 \u0648\u0625\u062D\u0627\u0644\u062A\u0647 \u0644\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0644\u062A\u062C\u0627\u0648\u0632 \u062D\u062F 500 \u0631.\u0633",
        oldValue: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        newValue: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u062F\u064A\u0631",
        createdAt: "2026-11-12T14:22:00.000Z"
      },
      {
        id: "aud-3",
        userId: "usr-lease",
        userName: "\u0631\u064A\u0645 \u0628\u0646\u062A \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u062A\u064A\u0628\u064A",
        userRole: "\u0645\u0633\u0624\u0648\u0644\u0629 \u0627\u0644\u062A\u0623\u062C\u064A\u0631 \u0648\u0627\u0644\u0639\u0642\u0648\u062F",
        deviceName: "iPad Pro \xB7 \u0645\u0643\u062A\u0628 \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
        action: "\u0631\u0628\u0637 \u0625\u062F\u0627\u0631\u064A \u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0628\u0648\u062D\u062F\u0629",
        entityType: "Unit",
        entityId: "unit-202",
        summary: "\u0631\u0628\u0637 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u064A\u0627\u0633\u0631 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0628\u0627\u0644\u0645\u0643\u062A\u0628 M-302 \u0643\u0648\u062D\u062F\u0629 \u0645\u062D\u062C\u0648\u0632\u0629 \u062F\u0648\u0646 \u0625\u0646\u0634\u0627\u0621 \u0639\u0642\u062F \u062A\u0644\u0642\u0627\u0626\u064A",
        oldValue: "\u0634\u0627\u063A\u0631\u0629",
        newValue: "\u0645\u062D\u062C\u0648\u0632\u0629",
        createdAt: "2026-11-10T11:05:00.000Z"
      }
    ],
    backups: [
      {
        id: "bkp-1",
        label: "\u0646\u0633\u062E\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u064A\u0648\u0645\u064A\u0629 \u0645\u0634\u0641\u0631\u0629 \xB7 2026-11-14",
        createdAt: "2026-11-14T03:00:00.000Z",
        createdBy: "\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u0622\u0644\u064A",
        recordCount: 48,
        sizeKb: 64
      }
    ],
    counters: {
      receipt: 3,
      contract: 3,
      ticket: 2,
      expense: 3,
      journal: 2
    },
    processedIdempotencyKeys: ["seed-pay-1", "seed-pay-2", "seed-pay-3", "seed-pay-arch-1", "seed-pay-arch-2"],
    savedArchiveFilters: [
      {
        id: "af-1",
        name: "\u0639\u0642\u0648\u062F 2025 \u0641\u0648\u0642 20,000 \u0631.\u0633",
        category: "contracts",
        year: "2025",
        minAmount: 2e4,
        timeframe: "all",
        createdBy: "usr-gm",
        createdAt: "2026-10-10T09:00:00.000Z"
      },
      {
        id: "af-2",
        name: "\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u0645\u0639\u0643\u0648\u0633\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629",
        category: "receipts",
        timeframe: "this_year",
        createdBy: "usr-acc",
        createdAt: "2026-10-15T11:30:00.000Z"
      }
    ],
    archiveLastNightlyRun: "2026-11-14T02:00:00.000Z",
    archiveSeeded: true,
    securityPolicy: {
      minPasswordLength: 8,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      autoLockMinutes: 5,
      maxFailedAttempts: 5,
      require2faForManagersAndAccountants: true
    },
    loginHistory: [
      {
        id: "lgn-1",
        userId: "usr-gm",
        userName: "\u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        userRole: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 / \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645",
        deviceName: "Windows Desktop \xB7 \u0627\u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        ipAddress: "192.168.10.24",
        geoLocation: "\u0627\u0644\u0631\u064A\u0627\u0636 \xB7 \u0627\u0644\u0639\u0644\u064A\u0627",
        method: "\u0645\u0635\u0627\u062F\u0642\u0629 \u062B\u0646\u0627\u0626\u064A\u0629 (2FA)",
        success: true,
        createdAt: "2026-11-14T08:05:00.000Z"
      },
      {
        id: "lgn-2",
        userId: "usr-acc",
        userName: "\u0633\u0644\u0645\u0627\u0646 \u0628\u0646 \u0646\u0627\u0635\u0631 \u0627\u0644\u062F\u0648\u0633\u0631\u064A",
        userRole: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628 \u0627\u0644\u0645\u0627\u0644\u064A",
        deviceName: "Windows Desktop \xB7 \u0642\u0633\u0645 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629",
        ipAddress: "192.168.10.31",
        geoLocation: "\u0627\u0644\u0631\u064A\u0627\u0636 \xB7 \u0627\u0644\u0639\u0644\u064A\u0627",
        method: "\u0645\u0635\u0627\u062F\u0642\u0629 \u062B\u0646\u0627\u0626\u064A\u0629 (2FA)",
        success: true,
        createdAt: "2026-11-14T08:15:00.000Z"
      },
      {
        id: "lgn-3",
        userId: "usr-tech",
        userName: "\u0639\u0645\u0631 \u0628\u0646 \u0633\u0639\u064A\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A",
        userRole: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        deviceName: "Android Mobile \xB7 \u062C\u0648\u0627\u0644 \u0627\u0644\u0641\u0646\u064A",
        ipAddress: "10.42.19.88",
        geoLocation: "\u0627\u0644\u0631\u064A\u0627\u0636 \xB7 \u0627\u0644\u064A\u0627\u0633\u0645\u064A\u0646 (\u0645\u064A\u062F\u0627\u0646\u064A)",
        method: "\u0628\u0635\u0645\u0629 / Face ID",
        success: true,
        createdAt: "2026-11-14T09:12:00.000Z"
      }
    ],
    syncConflicts: [
      {
        id: "cnf-1",
        entityType: "Unit",
        entityId: "unit-203",
        entityLabel: "\u0627\u0644\u0645\u0643\u062A\u0628 M-405 \xB7 \u0628\u0631\u062C \u0627\u0644\u0645\u0644\u0642\u0627",
        firstActorName: "\u0631\u064A\u0645 \u0627\u0644\u0639\u062A\u064A\u0628\u064A (iPad Pro)",
        secondActorName: "\u0645\u0627\u062C\u062F \u0627\u0644\u062D\u0631\u0628\u064A (Android Tablet - \u0648\u0636\u0639 \u0639\u062F\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644)",
        firstChangeSummary: "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u0642\u062A\u0631\u062D \u0625\u0644\u0649 62,000 \u0631.\u0633",
        secondChangeSummary: '\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0625\u0644\u0649 "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u0646\u0638\u064A\u0641"',
        status: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u062D\u062F\u062B",
        resolvedBy: "\u0641\u0647\u062F \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        resolvedAt: "2026-11-13T16:40:00.000Z",
        createdAt: "2026-11-13T16:10:00.000Z"
      }
    ],
    communicationTemplates: [
      {
        id: "tpl-pay-1",
        name: "\u062A\u0630\u0643\u064A\u0631 \u0642\u0628\u0644 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642",
        category: "payment",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 {{tenant_name}}\u060C\n\u0646\u0648\u062F \u062A\u0630\u0643\u064A\u0631\u0643\u0645 \u0628\u0623\u0646 \u0625\u064A\u062C\u0627\u0631 \u0648\u062D\u062F\u0629 {{unit_number}} \u0641\u064A {{property_name}} \u0628\u0642\u064A\u0645\u0629 {{amount}} \u0631\u064A\u0627\u0644 \u0645\u0633\u062A\u062D\u0642 \u0628\u062A\u0627\u0631\u064A\u062E {{due_date}}.\n\u064A\u0645\u0643\u0646\u0643\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0639\u0644\u0649 \u0627\u0644\u062D\u0633\u0627\u0628:\n{{bank_name}} - {{iban}}\n\u0634\u0627\u0643\u0631\u064A\u0646 \u062A\u0639\u0627\u0648\u0646\u0643\u0645.\n\u2014 {{company_name}}",
        contentEn: "Dear {{tenant_name}}, friendly reminder that rent for {{unit_number}} at {{property_name}} ({{amount}} SAR) is due on {{due_date}}. Bank: {{bank_name}} - {{iban}}. \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 48,
        scheduleEnabled: true,
        scheduleDaysOffset: 3,
        scheduleTime: "09:00",
        allowedRoles: ["sys_owner", "gm", "accountant", "leasing"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-10T09:00:00.000Z"
      },
      {
        id: "tpl-pay-2",
        name: "\u0625\u0634\u0639\u0627\u0631 \u0628\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645",
        category: "payment",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u062F\u0641\u0639\u062A\u0643\u0645 \u0628\u0642\u064A\u0645\u0629 {{paid_amount}} \u0631\u064A\u0627\u0644 \u0628\u0646\u062C\u0627\u062D.\n\u0631\u0642\u0645 \u0627\u0644\u0625\u064A\u0635\u0627\u0644: {{receipt_number}}\n\u0627\u0644\u0648\u062D\u062F\u0629: {{unit_number}} \xB7 {{property_name}}\n\u0627\u0644\u0645\u062A\u0628\u0642\u064A: {{remaining}} \u0631\u064A\u0627\u0644.\n\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0643\u0645 \u2014 {{company_name}}",
        contentEn: "Payment of {{paid_amount}} SAR received successfully. Receipt: {{receipt_number}}. Remaining balance: {{remaining}} SAR. Thank you \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 64,
        allowedRoles: ["sys_owner", "gm", "accountant"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-11T10:30:00.000Z"
      },
      {
        id: "tpl-pay-3",
        name: "\u062A\u0646\u0628\u064A\u0647 \u062A\u0623\u062E\u064A\u0631",
        category: "payment",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0639\u0632\u064A\u0632\u064A/\u0629 {{tenant_name}}\u060C \u0646\u0623\u0633\u0641 \u0644\u0625\u0628\u0644\u0627\u063A\u0643\u0645 \u0628\u062A\u0623\u062E\u0631 \u0633\u062F\u0627\u062F \u0625\u064A\u062C\u0627\u0631 {{unit_number}} ({{property_name}}) \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0645\u0646\u0630 {{days_overdue}} \u064A\u0648\u0645 \u0628\u0645\u0628\u0644\u063A {{amount}} \u0631\u064A\u0627\u0644. \u0646\u0631\u062C\u0648 \u0627\u0644\u0633\u062F\u0627\u062F \u0641\u064A \u0623\u0642\u0631\u0628 \u0648\u0642\u062A \u0644\u062A\u062C\u0646\u0628 \u0623\u064A \u0631\u0633\u0648\u0645 \u0625\u0636\u0627\u0641\u064A\u0629.\n\u2014 {{company_name}}",
        contentEn: "Dear {{tenant_name}}, your rent for {{unit_number}} is {{days_overdue}} days overdue ({{amount}} SAR). Please settle promptly. \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 29,
        allowedRoles: ["sys_owner", "gm", "accountant", "leasing"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-12T12:00:00.000Z"
      },
      {
        id: "tpl-pay-4",
        name: "\u0625\u0634\u0639\u0627\u0631 \u062F\u0641\u0639\u0629 \u062C\u0632\u0626\u064A\u0629",
        category: "payment",
        channel: "sms",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 {{paid_amount}} \u0631\u064A\u0627\u0644 \u0645\u0646 \u0625\u062C\u0645\u0627\u0644\u064A {{total_due}} \u0631\u064A\u0627\u0644 \u0644\u0648\u062D\u062F\u0629 {{unit_number}}. \u0627\u0644\u0645\u062A\u0628\u0642\u064A: {{remaining}} \u0631\u064A\u0627\u0644. \u0646\u0631\u062C\u0648 \u0633\u062F\u0627\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0642\u0628\u0644 {{new_due_date}}.",
        contentEn: "Partial payment {{paid_amount}} SAR received out of {{total_due}} SAR. Remaining {{remaining}} SAR due before {{new_due_date}}.",
        usageCount: 15,
        allowedRoles: ["sys_owner", "gm", "accountant"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-08T14:00:00.000Z"
      },
      {
        id: "tpl-ctr-1",
        name: "\u062A\u0631\u062D\u064A\u0628 \u0645\u0633\u062A\u0623\u062C\u0631 \u062C\u062F\u064A\u062F",
        category: "contract",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 {{tenant_name}} \u0641\u064A {{property_name}}. \u0646\u062A\u0645\u0646\u0649 \u0644\u0643 \u0625\u0642\u0627\u0645\u0629 \u0645\u0631\u064A\u062D\u0629.\n\u0631\u0642\u0645 \u0648\u062D\u062F\u062A\u0643: {{unit_number}}\n\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0642\u0627\u0631: {{manager_name}} - {{manager_phone}}\n\u2014 {{company_name}}",
        contentEn: "Welcome {{tenant_name}} to {{property_name}}! Unit: {{unit_number}}. Property Manager: {{manager_name}} ({{manager_phone}}). \u2014 {{company_name}}",
        isFavorite: true,
        usageCount: 22,
        allowedRoles: ["sys_owner", "gm", "leasing", "receptionist"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-05T11:00:00.000Z"
      },
      {
        id: "tpl-ctr-2",
        name: "\u062A\u0630\u0643\u064A\u0631 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F",
        category: "contract",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0639\u0632\u064A\u0632\u064A {{tenant_name}}\u060C \u0639\u0642\u062F \u0625\u064A\u062C\u0627\u0631 {{unit_number}} \u0641\u064A {{property_name}} \u0633\u064A\u0646\u062A\u0647\u064A \u0641\u064A {{end_date}}. \u0646\u0631\u062C\u0648 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0644\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u062F \u0623\u0648 \u062A\u0631\u062A\u064A\u0628 \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0625\u062E\u0644\u0627\u0621.\n\u2014 {{company_name}}",
        contentEn: "Dear {{tenant_name}}, lease for {{unit_number}} ends on {{end_date}}. Please contact us for renewal or handover.",
        usageCount: 18,
        scheduleEnabled: true,
        scheduleDaysOffset: 30,
        scheduleTime: "10:00",
        allowedRoles: ["sys_owner", "gm", "leasing"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-06T09:15:00.000Z"
      },
      {
        id: "tpl-ctr-3",
        name: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u062C\u062F\u064A\u062F",
        category: "contract",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u062A\u062C\u062F\u064A\u062F \u0639\u0642\u062F {{unit_number}} ({{property_name}}) \u0628\u0646\u062C\u0627\u062D \u0644\u0645\u062F\u0629 {{duration}} \u0628\u0642\u064A\u0645\u0629 {{new_rent}} \u0631\u064A\u0627\u0644 \u0633\u0646\u0648\u064A\u0627\u064B. \u0634\u0643\u0631\u0627\u064B \u0644\u062B\u0642\u062A\u0643\u0645 \u2014 {{company_name}}.",
        contentEn: "Your lease for {{unit_number}} has been renewed for {{duration}} at {{new_rent}} SAR. Thank you \u2014 {{company_name}}.",
        usageCount: 11,
        allowedRoles: ["sys_owner", "gm", "leasing"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-04T15:00:00.000Z"
      },
      {
        id: "tpl-ctr-4",
        name: "\u0625\u0634\u0639\u0627\u0631 \u0625\u062E\u0644\u0627\u0621",
        category: "contract",
        channel: "email",
        language: "ar",
        contentAr: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0637\u0644\u0628 \u0627\u0644\u0625\u062E\u0644\u0627\u0621 \u0644\u0648\u062D\u062F\u0629 {{unit_number}} \u0641\u064A {{property_name}}. \u0646\u0631\u062C\u0648 \u0627\u0644\u062D\u0636\u0648\u0631 \u0641\u064A {{handover_date}} \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0648\u062D\u062F\u0629 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0645\u0639 \u0627\u0644\u0645\u0634\u0631\u0641 {{manager_name}}.",
        contentEn: "Move-out request logged for {{unit_number}}. Please attend on {{handover_date}} for unit inspection and key handover.",
        usageCount: 7,
        allowedRoles: ["sys_owner", "gm", "leasing", "supervisor"],
        createdBy: "usr-lease",
        updatedAt: "2026-11-03T12:20:00.000Z"
      },
      {
        id: "tpl-mnt-1",
        name: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629",
        category: "maintenance",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0628\u0644\u0627\u063A\u0643\u0645 \u0631\u0642\u0645 {{ticket_id}} \u0628\u062E\u0635\u0648\u0635 {{issue_type}} \u0641\u064A {{unit_number}}.\n\u0633\u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643\u0645 \u062E\u0644\u0627\u0644 {{response_time}} \u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0645\u0648\u0639\u062F.\n\u0634\u0643\u0631\u0627\u064B \u0644\u0635\u0628\u0631\u0643\u0645.\n\u2014 \u0641\u0631\u064A\u0642 \u0627\u0644\u0635\u064A\u0627\u0646\u0629\u060C {{company_name}}",
        contentEn: "Maintenance ticket {{ticket_id}} for {{issue_type}} in {{unit_number}} received. We will contact you within {{response_time}}.",
        isFavorite: true,
        usageCount: 34,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "technician", "receptionist"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-09T13:00:00.000Z"
      },
      {
        id: "tpl-mnt-2",
        name: "\u0625\u0633\u0646\u0627\u062F \u0644\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        category: "maintenance",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0625\u0633\u0646\u0627\u062F \u0628\u0644\u0627\u063A\u0643\u0645 ({{ticket_id}}) \u0644\u0644\u0641\u0646\u064A {{technician_name}}. \u0633\u064A\u0635\u0644\u0643\u0645 \u062E\u0644\u0627\u0644 {{eta}}. \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644: {{tech_phone}}.",
        contentEn: "Ticket {{ticket_id}} assigned to technician {{technician_name}} (ETA: {{eta}}, Phone: {{tech_phone}}).",
        usageCount: 27,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "technician"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-07T16:10:00.000Z"
      },
      {
        id: "tpl-mnt-3",
        name: "\u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0625\u0635\u0644\u0627\u062D",
        category: "maintenance",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u0646 \u0625\u0635\u0644\u0627\u062D {{issue_type}} \u0641\u064A {{unit_number}} (\u0628\u0644\u0627\u063A {{ticket_id}}). \u0646\u0631\u062C\u0648 \u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0639\u0644\u0649 \u062C\u0648\u062F\u0629 \u0627\u0644\u0639\u0645\u0644. \u0634\u0643\u0631\u0627\u064B \u0644\u0635\u0628\u0631\u0643\u0645 \u2014 {{company_name}}.",
        contentEn: "Maintenance {{issue_type}} in {{unit_number}} ({{ticket_id}}) is completed. Please confirm service quality.",
        usageCount: 25,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "technician"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-09T18:00:00.000Z"
      },
      {
        id: "tpl-sup-1",
        name: "\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631",
        category: "supplier",
        channel: "email",
        language: "ar",
        contentAr: "\u0627\u0644\u0633\u0627\u062F\u0629 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646\u060C \u0646\u0631\u062C\u0648 \u062A\u0632\u0648\u064A\u062F\u0646\u0627 \u0628\u0639\u0631\u0636 \u0633\u0639\u0631 \u0644\u0640 {{service_description}} \u0641\u064A {{property_name}} - {{unit_number}}. \u0646\u0631\u062C\u0648 \u0627\u0644\u0631\u062F \u062E\u0644\u0627\u0644 {{deadline}}.\n\u2014 {{company_name}}",
        contentEn: "Please provide a quotation for {{service_description}} at {{property_name}} - {{unit_number}} before {{deadline}}.",
        usageCount: 14,
        allowedRoles: ["sys_owner", "gm", "maint_manager", "accountant"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-02T11:00:00.000Z"
      },
      {
        id: "tpl-sup-2",
        name: "\u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0639\u0645\u0644",
        category: "supplier",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0627\u0644\u0639\u0645\u0644 \u0631\u0642\u0645 {{work_order_id}}. \u0627\u0644\u0645\u0648\u0639\u062F: {{scheduled_date}} \u0627\u0644\u0633\u0627\u0639\u0629 {{scheduled_time}}. \u0627\u0644\u0645\u0648\u0642\u0639: {{location}}.",
        contentEn: "Work order {{work_order_id}} confirmed for {{scheduled_date}} at {{scheduled_time}}. Location: {{location}}.",
        usageCount: 12,
        allowedRoles: ["sys_owner", "gm", "maint_manager"],
        createdBy: "usr-mnt",
        updatedAt: "2026-11-04T10:00:00.000Z"
      },
      {
        id: "tpl-sup-3",
        name: "\u0627\u0639\u062A\u0645\u0627\u062F \u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0648\u0631\u062F",
        category: "supplier",
        channel: "email",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0641\u0627\u062A\u0648\u0631\u062A\u0643\u0645 \u0631\u0642\u0645 {{invoice_number}} \u0628\u0642\u064A\u0645\u0629 {{amount}} \u0631\u064A\u0627\u0644. \u0633\u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u062E\u0644\u0627\u0644 {{payment_days}} \u064A\u0648\u0645 \u0639\u0645\u0644.\n\u2014 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629\u060C {{company_name}}",
        contentEn: "Invoice {{invoice_number}} for {{amount}} SAR approved. Payment will be transferred within {{payment_days}} business days.",
        usageCount: 19,
        allowedRoles: ["sys_owner", "gm", "accountant"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-05T14:40:00.000Z"
      },
      {
        id: "tpl-int-1",
        name: "\u0625\u0633\u0646\u0627\u062F \u0645\u0647\u0645\u0629 \u062F\u0627\u062E\u0644\u064A\u0629",
        category: "internal",
        channel: "internal",
        language: "ar",
        contentAr: "\u062A\u0645 \u0625\u0633\u0646\u0627\u062F \u0645\u0647\u0645\u0629 \u062C\u062F\u064A\u062F\u0629: {{task_title}} \u0641\u064A {{property_name}}. \u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u0646\u0647\u0627\u0626\u064A: {{deadline}}. \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629: {{priority}}.",
        contentEn: "New task assigned: {{task_title}} at {{property_name}}. Due: {{deadline}} ({{priority}}).",
        usageCount: 31,
        allowedRoles: ["sys_owner", "gm", "supervisor", "maint_manager"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-11T08:00:00.000Z"
      },
      {
        id: "tpl-int-2",
        name: "\u062A\u0630\u0643\u064A\u0631 \u0628\u0645\u0647\u0645\u0629 \u0639\u0627\u062C\u0644\u0629",
        category: "internal",
        channel: "internal",
        language: "ar",
        contentAr: "\u062A\u0646\u0628\u064A\u0647: \u0644\u062F\u064A\u0643 \u0645\u0647\u0645\u0629 \u0633\u062A\u0646\u062A\u0647\u064A \u062E\u0644\u0627\u0644 {{hours_left}} \u0633\u0627\u0639\u0629: {{task_title}} ({{property_name}}).",
        contentEn: "Reminder: Task {{task_title}} is due in {{hours_left}} hours.",
        usageCount: 16,
        allowedRoles: ["sys_owner", "gm", "supervisor", "maint_manager"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-10T15:00:00.000Z"
      },
      {
        id: "tpl-int-3",
        name: "\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641 \u0645\u0648\u0638\u0641",
        category: "internal",
        channel: "internal",
        language: "ar",
        contentAr: "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641\u0643 \u0631\u0642\u0645 {{expense_id}} \u0628\u0642\u064A\u0645\u0629 {{amount}} \u0631\u064A\u0627\u0644. \u0627\u0644\u0645\u0631\u062C\u0648 \u0631\u0641\u0639 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629 \u0641\u064A \u0642\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A.",
        contentEn: "Expense {{expense_id}} ({{amount}} SAR) approved. Please upload the original invoice.",
        usageCount: 20,
        allowedRoles: ["sys_owner", "gm", "accountant", "supervisor"],
        createdBy: "usr-acc",
        updatedAt: "2026-11-08T17:00:00.000Z"
      },
      {
        id: "tpl-cus-1",
        name: "\u062A\u0647\u0646\u0626\u0629 \u0645\u0648\u0633\u0645\u064A\u0629 (\u0627\u0644\u0623\u0639\u064A\u0627\u062F \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A)",
        category: "custom",
        channel: "whatsapp",
        language: "ar",
        contentAr: "\u0639\u0632\u064A\u0632\u064A/\u0629 {{tenant_name}}\u060C \u062A\u062A\u0642\u062F\u0645 \u0623\u0633\u0631\u0629 {{company_name}} \u0628\u0623\u0635\u062F\u0642 \u0627\u0644\u062A\u0647\u0627\u0646\u064A \u0648\u0627\u0644\u062A\u0628\u0631\u064A\u0643\u0627\u062A \u0628\u0645\u0646\u0627\u0633\u0628\u0629 \u062D\u0644\u0648\u0644 \u0627\u0644\u0639\u064A\u062F \u0627\u0644\u0645\u0628\u0627\u0631\u0643\u060C \u0633\u0627\u0626\u0644\u064A\u0646 \u0627\u0644\u0644\u0647 \u0623\u0646 \u064A\u062F\u064A\u0645 \u0639\u0644\u064A\u0643\u0645 \u0627\u0644\u062E\u064A\u0631 \u0648\u0627\u0644\u0628\u0631\u0643\u0629.",
        contentEn: "Dear {{tenant_name}}, warm seasonal greetings from {{company_name}}. Wishing you happiness and prosperity.",
        isFavorite: true,
        isSeasonal: true,
        usageCount: 9,
        allowedRoles: ["sys_owner", "gm", "leasing", "receptionist"],
        createdBy: "usr-gm",
        updatedAt: "2026-11-01T12:00:00.000Z"
      }
    ],
    meterReadings: [
      {
        id: "mr-1",
        readingNumber: "MTR-2026-001",
        propertyId: "prop-1",
        unitId: "unit-101",
        meterType: "\u0643\u0647\u0631\u0628\u0627\u0621",
        meterNumber: "ELC-99011",
        previousReading: 14200,
        currentReading: 14860,
        consumption: 660,
        billAmount: 215,
        currency: "SAR",
        billingPeriod: "2026-11",
        recordedBy: "\u0641\u0647\u062F \u0628\u0646 \u0639\u0628\u062F\u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u0628\u064A\u0639\u064A",
        notes: "\u0642\u0631\u0627\u0621\u0629 \u0634\u0647\u0631 \u0646\u0648\u0641\u0645\u0628\u0631 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 - \u0639\u0645\u0627\u0631\u0629 \u0627\u0644\u0646\u062E\u064A\u0644",
        createdAt: "2026-11-10T09:30:00.000Z"
      },
      {
        id: "mr-2",
        readingNumber: "MTR-2026-002",
        propertyId: "prop-2",
        unitId: "unit-201",
        meterType: "\u0645\u064A\u0627\u0647",
        meterNumber: "WTR-44021",
        previousReading: 3180,
        currentReading: 3245,
        consumption: 65,
        billAmount: 95,
        currency: "SAR",
        billingPeriod: "2026-11",
        recordedBy: "\u0623\u062D\u0645\u062F \u0627\u0644\u0639\u0644\u064A",
        notes: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u064A\u0627\u0647 \u0627\u0644\u0634\u0647\u0631\u064A\u0629",
        createdAt: "2026-11-11T11:15:00.000Z"
      }
    ],
    teamSeeded: true,
    lastUpdatedAt: now
  };
}

// src/utils/rbac.ts
var RBAC_MODULES = [
  { key: "dashboard", labelAr: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", labelEn: "Dashboard", groupAr: "\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A" },
  { key: "properties", labelAr: "\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A", labelEn: "Properties", groupAr: "\u0627\u0644\u0645\u062D\u0641\u0638\u0629" },
  { key: "units", labelAr: "\u0627\u0644\u0648\u062D\u062F\u0627\u062A", labelEn: "Units", groupAr: "\u0627\u0644\u0645\u062D\u0641\u0638\u0629" },
  { key: "tenants", labelAr: "\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u0648\u0646 \u0648\u0627\u0644\u0645\u0647\u062A\u0645\u0648\u0646", labelEn: "Tenants & Leads", groupAr: "\u0627\u0644\u062A\u0623\u062C\u064A\u0631" },
  { key: "contracts", labelAr: "\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0625\u064A\u062C\u0627\u0631", labelEn: "Contracts", groupAr: "\u0627\u0644\u062A\u0623\u062C\u064A\u0631" },
  { key: "payments", labelAr: "\u0627\u0644\u062F\u0641\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644", labelEn: "Payments", groupAr: "\u0627\u0644\u0645\u0627\u0644\u064A\u0629" },
  { key: "finance", labelAr: "\u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629", labelEn: "Finance & Ledger", groupAr: "\u0627\u0644\u0645\u0627\u0644\u064A\u0629" },
  { key: "receipts", labelAr: "\u0627\u0644\u0625\u064A\u0635\u0627\u0644\u0627\u062A \u0648\u0627\u0644\u0633\u0646\u062F\u0627\u062A", labelEn: "Receipts", groupAr: "\u0627\u0644\u0645\u0627\u0644\u064A\u0629" },
  { key: "expenses", labelAr: "\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A", labelEn: "Expenses", groupAr: "\u0627\u0644\u0645\u0627\u0644\u064A\u0629" },
  { key: "maintenance", labelAr: "\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0628\u0644\u0627\u063A\u0627\u062A", labelEn: "Maintenance", groupAr: "\u0627\u0644\u062A\u0634\u063A\u064A\u0644" },
  { key: "tasks", labelAr: "\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u064A\u0648\u0645\u064A\u0629", labelEn: "Tasks", groupAr: "\u0627\u0644\u062A\u0634\u063A\u064A\u0644" },
  { key: "reports", labelAr: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", labelEn: "Reports", groupAr: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631" },
  { key: "documents", labelAr: "\u062E\u0632\u0646\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A", labelEn: "Documents", groupAr: "\u0627\u0644\u0623\u0631\u0634\u0641\u0629" },
  { key: "archive", labelAr: "\u0627\u0644\u0623\u0631\u0634\u064A\u0641 \u0627\u0644\u0630\u0643\u064A", labelEn: "Smart Archive", groupAr: "\u0627\u0644\u0623\u0631\u0634\u0641\u0629" },
  { key: "team", labelAr: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646 \u0648\u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644", labelEn: "Team & Workforce", groupAr: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629" },
  { key: "audit", labelAr: "\u0633\u062C\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642", labelEn: "Audit Logs", groupAr: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629" },
  { key: "settings", labelAr: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", labelEn: "Settings", groupAr: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629" },
  { key: "backups", labelAr: "\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A", labelEn: "Backups", groupAr: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629" }
];
var ROLE_TEMPLATES = [
  {
    key: "sys_owner",
    labelAr: "\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645",
    labelEn: "System Owner",
    tierAr: "\u062A\u062D\u0643\u0645 \u0643\u0627\u0645\u0644",
    descAr: "\u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 \u0628\u0627\u0644\u0645\u0646\u0634\u0623\u0629\u060C \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0648\u0627\u0644\u0623\u062F\u0648\u0627\u0631\u060C \u0627\u0644\u0623\u0645\u0627\u0646\u060C \u0648\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A",
    defaultLimitSar: 9999999
  },
  {
    key: "gm",
    labelAr: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629",
    labelEn: "Company Manager",
    tierAr: "\u0645\u0631\u062A\u0641\u0639",
    descAr: "\u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0627\u0644\u0639\u0627\u0645\u060C \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A\u0629\u060C \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649 \u0648\u0627\u0644\u0642\u0631\u0627\u0631\u0627\u062A",
    defaultLimitSar: 5e5
  },
  {
    key: "supervisor",
    labelAr: "\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0639\u0642\u0627\u0631\u064A",
    labelEn: "Property Supervisor",
    tierAr: "\u0645\u062A\u0648\u0633\u0637-\u0645\u0631\u062A\u0641\u0639",
    descAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0648\u062D\u062F\u0627\u062A\u060C \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0625\u0634\u063A\u0627\u0644 \u0648\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u0627\u0644\u0625\u062E\u0644\u0627\u0621",
    defaultLimitSar: 25e3
  },
  {
    key: "accountant",
    labelAr: "\u0627\u0644\u0645\u062D\u0627\u0633\u0628",
    labelEn: "Accountant",
    tierAr: "\u0645\u0627\u0644\u064A \u0641\u0642\u0637",
    descAr: "\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u060C \u0633\u0646\u062F\u0627\u062A \u0627\u0644\u0642\u0628\u0636\u060C \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A\u060C \u0627\u0644\u0642\u064A\u0648\u062F \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A\u0629 \u0648\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0645\u0644\u0627\u0643",
    defaultLimitSar: 5e4
  },
  {
    key: "leasing",
    labelAr: "\u0645\u0648\u0638\u0641 \u0627\u0644\u062A\u0623\u062C\u064A\u0631",
    labelEn: "Leasing Agent",
    tierAr: "\u0645\u062A\u0648\u0633\u0637",
    descAr: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u064A\u0646\u060C \u0625\u0628\u0631\u0627\u0645 \u0627\u0644\u0639\u0642\u0648\u062F\u060C \u0627\u0644\u062A\u0648\u062B\u064A\u0642 \u0641\u064A \u0625\u064A\u062C\u0627\u0631 \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0627\u062A",
    defaultLimitSar: 0
  },
  {
    key: "maint_manager",
    labelAr: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
    labelEn: "Maintenance Manager",
    tierAr: "\u062A\u0634\u063A\u064A\u0644\u064A",
    descAr: "\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0628\u0644\u0627\u063A\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629\u060C \u0625\u0633\u0646\u0627\u062F \u0627\u0644\u0645\u0647\u0627\u0645 \u0644\u0644\u0641\u0646\u064A\u064A\u0646\u060C \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0631\u062F\u064A\u0646",
    defaultLimitSar: 15e3
  },
  {
    key: "technician",
    labelAr: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629",
    labelEn: "Technician",
    tierAr: "\u0645\u062D\u062F\u0648\u062F",
    descAr: "\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0627\u0644\u0645\u0633\u0646\u062F\u0629 \u0648\u0631\u0641\u0639 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u062A\u0634\u062E\u064A\u0635 \u0648\u0627\u0644\u0635\u0648\u0631",
    defaultLimitSar: 0
  },
  {
    key: "receptionist",
    labelAr: "\u0645\u0648\u0638\u0641 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
    labelEn: "Receptionist",
    tierAr: "\u0623\u0633\u0627\u0633\u064A",
    descAr: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u064A\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621\u060C \u0631\u0641\u0639 \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A\u060C \u0648\u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0628\u0644\u0627\u063A\u0627\u062A",
    defaultLimitSar: 0
  },
  {
    key: "auditor",
    labelAr: "\u0627\u0644\u0645\u0631\u0627\u062C\u0639",
    labelEn: "Auditor",
    tierAr: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0641\u0642\u0637",
    descAr: "\u0627\u0644\u0627\u0637\u0644\u0627\u0639 \u0627\u0644\u0643\u0627\u0645\u0644 \u0639\u0644\u0649 \u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0648\u0633\u062C\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u062F\u0648\u0646 \u062A\u0639\u062F\u064A\u0644",
    defaultLimitSar: 0
  },
  {
    key: "owner",
    labelAr: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0627\u0644\u0643",
    labelEn: "Owner Portal",
    tierAr: "\u0645\u062D\u0641\u0638\u0629 \u0627\u0644\u0645\u0627\u0644\u0643",
    descAr: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0639\u0648\u0627\u0626\u062F \u0648\u0625\u0634\u063A\u0627\u0644 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0645\u0644\u0648\u0643\u0629 \u0648\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0627\u0644\u062A\u0633\u0648\u064A\u0629 \u0641\u0642\u0637",
    defaultLimitSar: 0
  }
];
var ALL_ACTIONS = ["view", "create", "edit", "delete_void", "approve", "export", "manage"];
function getDefaultModulePermissionsForRole(role) {
  if (role === "sys_owner" || role === "gm") {
    return Object.fromEntries(RBAC_MODULES.map((m) => [m.key, [...ALL_ACTIONS]]));
  }
  if (role === "auditor") {
    return Object.fromEntries(
      RBAC_MODULES.filter((m) => m.key !== "settings" && m.key !== "backups").map((m) => [
        m.key,
        ["view", "export"]
      ])
    );
  }
  if (role === "accountant") {
    return {
      dashboard: ["view"],
      properties: ["view"],
      units: ["view"],
      tenants: ["view"],
      contracts: ["view"],
      payments: ["view", "create", "edit", "approve", "export"],
      finance: ["view", "create", "edit", "approve", "export", "manage"],
      receipts: ["view", "create", "delete_void", "export"],
      expenses: ["view", "create", "edit", "export"],
      reports: ["view", "export"],
      documents: ["view", "create", "export"],
      archive: ["view", "export"],
      audit: ["view"]
    };
  }
  if (role === "supervisor") {
    return {
      dashboard: ["view"],
      properties: ["view", "create", "edit", "export"],
      units: ["view", "create", "edit", "export"],
      tenants: ["view", "create", "edit"],
      contracts: ["view", "create", "edit", "approve"],
      maintenance: ["view", "create", "edit", "approve"],
      tasks: ["view", "create", "edit", "approve"],
      expenses: ["view", "create", "approve"],
      reports: ["view", "export"],
      documents: ["view", "create"],
      archive: ["view", "create"]
    };
  }
  if (role === "leasing") {
    return {
      dashboard: ["view"],
      properties: ["view", "edit"],
      units: ["view", "create", "edit"],
      tenants: ["view", "create", "edit", "export"],
      contracts: ["view", "create", "edit", "export"],
      tasks: ["view", "create"],
      documents: ["view", "create"],
      archive: ["view"]
    };
  }
  if (role === "maint_manager") {
    return {
      dashboard: ["view"],
      properties: ["view"],
      units: ["view"],
      maintenance: ["view", "create", "edit", "approve", "manage"],
      tasks: ["view", "create", "edit", "approve", "manage"],
      expenses: ["view", "create", "approve"],
      documents: ["view", "create"],
      reports: ["view"]
    };
  }
  if (role === "technician") {
    return {
      dashboard: ["view"],
      units: ["view"],
      maintenance: ["view", "create", "edit"],
      tasks: ["view", "create", "edit"],
      expenses: ["view", "create"]
    };
  }
  if (role === "receptionist") {
    return {
      dashboard: ["view"],
      properties: ["view"],
      units: ["view"],
      tenants: ["view", "create", "edit"],
      tasks: ["view", "create"],
      documents: ["view", "create"],
      maintenance: ["view", "create"]
    };
  }
  if (role === "owner") {
    return {
      dashboard: ["view"],
      properties: ["view"],
      units: ["view"],
      tenants: ["view"],
      contracts: ["view"],
      payments: ["view"],
      finance: ["view"],
      receipts: ["view"],
      reports: ["view", "export"],
      documents: ["view"],
      archive: ["view"]
    };
  }
  return { dashboard: ["view"] };
}
function buildAllDefaultRoleModulePermissions() {
  const out = {};
  for (const r of ROLE_TEMPLATES) {
    out[r.key] = getDefaultModulePermissionsForRole(r.key);
  }
  return out;
}
function mergeModulePermissions(base, overlay) {
  if (!overlay) return { ...base };
  const merged = {};
  for (const m of RBAC_MODULES) {
    const key = m.key;
    if (overlay[key] !== void 0) {
      merged[key] = Array.from(new Set(overlay[key] || []));
    } else if (base[key] !== void 0) {
      merged[key] = Array.from(new Set(base[key] || []));
    }
  }
  return merged;
}
function deriveLegacyPermissionsFromModules(modulePerms) {
  const set = /* @__PURE__ */ new Set();
  const hasAny = (mod, actions) => {
    const list = modulePerms[mod] || [];
    return list.includes("manage") || actions.some((a) => list.includes(a));
  };
  if (hasAny("properties", ["create", "edit", "delete_void", "manage"]) || hasAny("units", ["create", "edit", "manage"])) {
    set.add("manage_properties");
  }
  if (hasAny("tenants", ["create", "edit", "delete_void", "manage"])) {
    set.add("manage_tenants");
  }
  if (hasAny("contracts", ["create", "edit", "approve", "manage"])) {
    set.add("manage_contracts");
  }
  if (hasAny("payments", ["create", "edit", "manage"])) {
    set.add("collect_payments");
  }
  if (hasAny("receipts", ["delete_void", "approve", "manage"])) {
    set.add("reverse_receipts");
  }
  if (hasAny("finance", ["create", "edit", "approve", "manage"])) {
    set.add("manage_accounting");
  }
  if (hasAny("expenses", ["create"])) {
    set.add("create_expense");
  }
  if (hasAny("expenses", ["approve"])) {
    set.add("approve_expense_supervisor");
  }
  if (hasAny("expenses", ["manage"])) {
    set.add("approve_expense_manager");
  }
  if (hasAny("maintenance", ["manage", "approve"])) {
    set.add("manage_maintenance");
  }
  if (hasAny("maintenance", ["create", "edit"])) {
    set.add("execute_maintenance");
  }
  if (hasAny("tasks", ["create", "edit", "approve", "manage"])) {
    set.add("manage_tasks");
  }
  if (hasAny("documents", ["create", "edit", "delete_void", "manage"])) {
    set.add("manage_documents");
  }
  if (hasAny("team", ["create", "edit", "delete_void", "manage"]) || hasAny("settings", ["manage"])) {
    set.add("manage_users");
  }
  if (hasAny("backups", ["create", "manage", "approve"])) {
    set.add("backup_restore");
  }
  if (hasAny("audit", ["view", "export", "manage"])) {
    set.add("view_audit");
  }
  if (hasAny("reports", ["view"]) && hasAny("finance", ["view"])) {
    set.add("view_all");
  }
  return Array.from(set);
}
function getEffectiveModulePermissions(state, user) {
  if (!user) return {};
  const customRole = user.customRoleId ? state?.customRoles?.find((r) => r.id === user.customRoleId) : void 0;
  const baseTemplate = customRole ? customRole.modulePermissions : state?.roleModulePermissions?.[user.role] || getDefaultModulePermissionsForRole(user.role);
  const effective = mergeModulePermissions(baseTemplate, user.customModulePermissions);
  const legacyList = customRole ? customRole.legacyPermissions : state?.rolePermissions?.[user.role] || [];
  const ensureLegacy = (perm, mod, actions) => {
    if (!legacyList.includes(perm)) return;
    if (user.customModulePermissions && user.customModulePermissions[mod] !== void 0) return;
    const cur = new Set(effective[mod] || []);
    for (const a of actions) cur.add(a);
    effective[mod] = Array.from(cur);
  };
  ensureLegacy("manage_properties", "properties", ["view", "create", "edit"]);
  ensureLegacy("manage_properties", "units", ["view", "create", "edit"]);
  ensureLegacy("manage_tenants", "tenants", ["view", "create", "edit"]);
  ensureLegacy("manage_contracts", "contracts", ["view", "create", "edit"]);
  ensureLegacy("collect_payments", "payments", ["view", "create"]);
  ensureLegacy("collect_payments", "receipts", ["view", "create"]);
  ensureLegacy("reverse_receipts", "receipts", ["view", "delete_void"]);
  ensureLegacy("manage_accounting", "finance", ["view", "create", "edit"]);
  ensureLegacy("create_expense", "expenses", ["view", "create"]);
  ensureLegacy("approve_expense_supervisor", "expenses", ["view", "approve"]);
  ensureLegacy("approve_expense_manager", "expenses", ["view", "approve", "manage"]);
  ensureLegacy("manage_maintenance", "maintenance", ["view", "create", "edit", "approve", "manage"]);
  ensureLegacy("execute_maintenance", "maintenance", ["view", "edit"]);
  ensureLegacy("manage_tasks", "tasks", ["view", "create", "edit"]);
  ensureLegacy("manage_documents", "documents", ["view", "create", "edit"]);
  ensureLegacy("manage_users", "team", ["view", "create", "edit", "delete_void", "manage"]);
  ensureLegacy("backup_restore", "backups", ["view", "create", "approve", "manage"]);
  ensureLegacy("view_audit", "audit", ["view", "export"]);
  return effective;
}
function userHasModuleAction(state, user, module, action = "view") {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== "\u0646\u0634\u0637") return false;
  if (user.role === "sys_owner" && !user.customModulePermissions && !user.customRoleId) {
    return true;
  }
  const effective = getEffectiveModulePermissions(state, user);
  const actions = effective[module] || [];
  if (actions.includes("manage")) return true;
  return actions.includes(action);
}
function userHasLegacyPermission(state, user, permission) {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== "\u0646\u0634\u0637") return false;
  if (user.customRoleId) {
    const customRole = state?.customRoles?.find((r) => r.id === user.customRoleId);
    if (customRole) {
      const derived = deriveLegacyPermissionsFromModules(
        getEffectiveModulePermissions(state, user)
      );
      return customRole.legacyPermissions.includes(permission) || derived.includes(permission);
    }
  }
  if (user.customModulePermissions) {
    const derived = deriveLegacyPermissionsFromModules(
      getEffectiveModulePermissions(state, user)
    );
    if (derived.includes(permission)) return true;
  }
  const perms = state?.rolePermissions?.[user.role] || [];
  return perms.includes(permission);
}
var ALL_PROPERTIES_SCOPE = "*";
var ROLE_PRIORITY_RANK = {
  owner: 0,
  technician: 1,
  receptionist: 1,
  leasing: 2,
  auditor: 2,
  maint_manager: 3,
  accountant: 3,
  supervisor: 4,
  gm: 5,
  sys_owner: 6
};
function isRoleDowngrade(oldRole, newRole) {
  return (ROLE_PRIORITY_RANK[newRole] ?? 0) < (ROLE_PRIORITY_RANK[oldRole] ?? 0);
}
function isUserAccountActive(user) {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== "\u0646\u0634\u0637") return false;
  return true;
}
function canUserAccessCompany(state, user, companyId) {
  if (!isUserAccountActive(user) || !user) return false;
  if (user.role === "sys_owner") return true;
  if (!user.companyId) return true;
  if (!companyId) return true;
  if ((state?.companies?.length || 0) <= 1 && !companyId) return true;
  return user.companyId === companyId;
}
function getUserPropertyScope(state, user) {
  if (!isUserAccountActive(user) || !user) return /* @__PURE__ */ new Set();
  const allProperties = state?.properties || [];
  const withinCompany = (propId) => {
    const prop = allProperties.find((p) => p.id === propId);
    if (!prop) return false;
    return canUserAccessCompany(state, user, prop.companyId);
  };
  if (user.role === "owner") {
    if (!user.ownerId) return /* @__PURE__ */ new Set();
    const owned = /* @__PURE__ */ new Set();
    for (const p of allProperties) {
      if (Array.isArray(p.ownerShares) && p.ownerShares.some((s) => s.ownerId === user.ownerId) && canUserAccessCompany(state, user, p.companyId)) {
        owned.add(p.id);
      }
    }
    for (const s of state?.ownerShares || []) {
      if (s.ownerId === user.ownerId && withinCompany(s.propertyId)) {
        owned.add(s.propertyId);
      }
    }
    return owned;
  }
  if (user.role === "sys_owner") {
    return "ALL";
  }
  const companyRestricted = Boolean(user.companyId && (state?.companies?.length || 0) > 0);
  const rawAllowed = user.allowedPropertyIds;
  if (user.role === "gm") {
    if (rawAllowed === void 0 || Array.isArray(rawAllowed) && rawAllowed.includes(ALL_PROPERTIES_SCOPE)) {
      if (!companyRestricted) return "ALL";
      return new Set(allProperties.filter((p) => canUserAccessCompany(state, user, p.companyId)).map((p) => p.id));
    }
    return new Set(rawAllowed.filter((id) => id !== ALL_PROPERTIES_SCOPE && withinCompany(id)));
  }
  if (!Array.isArray(rawAllowed) || rawAllowed.length === 0) {
    return /* @__PURE__ */ new Set();
  }
  if (rawAllowed.includes(ALL_PROPERTIES_SCOPE)) {
    if (!companyRestricted) return "ALL";
    return new Set(allProperties.filter((p) => canUserAccessCompany(state, user, p.companyId)).map((p) => p.id));
  }
  return new Set(rawAllowed.filter((id) => id !== ALL_PROPERTIES_SCOPE && withinCompany(id)));
}
function getAccessiblePropertyIdsSet(state, user) {
  const scope = getUserPropertyScope(state, user);
  if (scope === "ALL") {
    return new Set((state?.properties || []).map((p) => p.id));
  }
  return scope;
}
function userHasAllPropertiesAccess(state, user) {
  if (!isUserAccountActive(user) || !user) return false;
  if (user.role === "sys_owner") return true;
  if (user.role === "owner") return false;
  const scope = getUserPropertyScope(state, user);
  if (scope === "ALL") return true;
  if (user.companyId && Array.isArray(user.allowedPropertyIds) && user.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE)) {
    return true;
  }
  if (user.role === "gm" && user.allowedPropertyIds === void 0) return true;
  return false;
}
function canUserAccessProperty(state, user, propertyId) {
  if (!isUserAccountActive(user) || !user || !propertyId) return false;
  const scope = getUserPropertyScope(state, user);
  if (scope === "ALL") {
    const prop = (state?.properties || []).find((p) => p.id === propertyId);
    if (prop) return canUserAccessCompany(state, user, prop.companyId);
    return true;
  }
  return scope.has(propertyId);
}
function isPropertyScopeShrink(oldState, oldUser, newState, newUser) {
  const oldScope = getUserPropertyScope(oldState, oldUser);
  const newScope = getUserPropertyScope(newState, newUser);
  if (newScope === "ALL") return false;
  if (oldScope === "ALL") {
    const allIds = (oldState?.properties || []).map((p) => p.id);
    if (allIds.length === 0) {
      return !Array.isArray(newUser.allowedPropertyIds) || !newUser.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE);
    }
    return allIds.some((id) => !newScope.has(id));
  }
  for (const prevId of oldScope) {
    if (!newScope.has(prevId)) return true;
  }
  if (Array.isArray(oldUser.allowedPropertyIds) && oldUser.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE) && (!Array.isArray(newUser.allowedPropertyIds) || !newUser.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE))) {
    return true;
  }
  return false;
}
function sanitizeUserForClient(u) {
  return {
    id: u.id,
    companyId: u.companyId,
    nameAr: u.nameAr,
    nameEn: u.nameEn,
    username: u.username,
    role: u.role,
    customRoleId: u.customRoleId,
    jobTitle: u.jobTitle,
    department: u.department,
    roleLabelAr: u.roleLabelAr,
    roleLabelEn: u.roleLabelEn,
    email: u.email,
    phone: u.phone,
    approvalLimitSar: u.approvalLimitSar,
    active: u.active,
    accountStatus: u.accountStatus || (u.active ? "\u0646\u0634\u0637" : "\u0645\u0648\u0642\u0648\u0641"),
    allowedPropertyIds: Array.isArray(u.allowedPropertyIds) ? [...u.allowedPropertyIds] : void 0,
    customModulePermissions: u.customModulePermissions ? { ...u.customModulePermissions } : void 0,
    ownerId: u.ownerId,
    deviceName: u.deviceName,
    lastActiveAt: u.lastActiveAt,
    statusState: u.statusState,
    specialty: u.specialty,
    managerRating: u.managerRating,
    lastActivitySummary: u.lastActivitySummary,
    security: u.security ? {
      ...u.security,
      trustedDevices: u.security.trustedDevices ? [...u.security.trustedDevices] : void 0
    } : void 0,
    notificationPrefs: u.notificationPrefs ? { ...u.notificationPrefs } : void 0,
    invitedBy: u.invitedBy,
    invitedAt: u.invitedAt,
    inviteStatus: u.inviteStatus,
    terminatedAt: u.terminatedAt,
    terminationReason: u.terminationReason,
    verifiedEmail: u.verifiedEmail,
    verifiedPhone: u.verifiedPhone,
    online: u.online
  };
}
function filterStateForUser(state, user, options) {
  if (!user || !isUserAccountActive(user)) {
    return {
      ...state,
      properties: [],
      units: [],
      tenants: [],
      leads: [],
      leadEscalations: [],
      contracts: [],
      handovers: [],
      installments: [],
      payments: [],
      expenses: [],
      supplierInvoices: [],
      propertyBudgets: [],
      tickets: [],
      tasks: [],
      meterReadings: [],
      documents: [],
      owners: [],
      ownerShares: [],
      ownerTransfers: [],
      purchaseOrders: [],
      decisions: [],
      zatcaInvoices: [],
      communications: [],
      notifications: [],
      auditLogs: [],
      backups: [],
      loginHistory: [],
      employeeInvitations: [],
      users: []
    };
  }
  const hasAllProps = userHasAllPropertiesAccess(state, user);
  const allowedPropIds = getAccessiblePropertyIdsSet(state, user);
  const canAudit = userHasLegacyPermission(state, user, "view_audit") || userHasModuleAction(state, user, "audit", "view");
  const canBackup = userHasLegacyPermission(state, user, "backup_restore") || userHasModuleAction(state, user, "backups", "view");
  const canTeam = userHasLegacyPermission(state, user, "manage_users") || userHasModuleAction(state, user, "team", "view");
  const properties = (state.properties || []).filter((p) => allowedPropIds.has(p.id));
  const units = (state.units || []).filter((u) => allowedPropIds.has(u.propertyId));
  const unitIds = new Set(units.map((u) => u.id));
  const contracts = (state.contracts || []).filter((c) => allowedPropIds.has(c.propertyId));
  const contractIds = new Set(contracts.map((c) => c.id));
  const handovers = (state.handovers || []).filter((h) => allowedPropIds.has(h.propertyId));
  const handoverIds = new Set(handovers.map((h) => h.id));
  const installments = (state.installments || []).filter((i) => contractIds.has(i.contractId));
  const payments = (state.payments || []).filter((p) => contractIds.has(p.contractId));
  const expenses = (state.expenses || []).filter((e) => allowedPropIds.has(e.propertyId));
  const expenseIds = new Set(expenses.map((e) => e.id));
  const supplierInvoices = (state.supplierInvoices || []).filter(
    (inv) => inv.propertyId ? allowedPropIds.has(inv.propertyId) : hasAllProps
  );
  const propertyBudgets = (state.propertyBudgets || []).filter((b) => allowedPropIds.has(b.propertyId));
  const tickets = (state.tickets || []).filter((t) => allowedPropIds.has(t.propertyId));
  const ticketIds = new Set(tickets.map((t) => t.id));
  const tasks = (state.tasks || []).filter(
    (t) => t.propertyId ? allowedPropIds.has(t.propertyId) : hasAllProps || t.assignedTo === user.id
  );
  const leads = (state.leads || []).filter(
    (l) => l.propertyId ? allowedPropIds.has(l.propertyId) : hasAllProps || l.assignedTo === user.id
  );
  const leadIds = new Set(leads.map((l) => l.id));
  const leadEscalations = (state.leadEscalations || []).filter((e) => leadIds.has(e.leadId));
  const meterReadings = (state.meterReadings || []).filter((m) => allowedPropIds.has(m.propertyId));
  const tenantAllLinkedPropIds = /* @__PURE__ */ new Map();
  const addTenantLink = (tenantId, propertyId) => {
    if (!tenantId || !propertyId) return;
    let set = tenantAllLinkedPropIds.get(tenantId);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      tenantAllLinkedPropIds.set(tenantId, set);
    }
    set.add(propertyId);
  };
  for (const c of state.contracts || []) addTenantLink(c.tenantId, c.propertyId);
  for (const u of state.units || []) {
    const linkedTid = u.currentTenantId || u.linkedTenantId;
    if (linkedTid) addTenantLink(linkedTid, u.propertyId);
  }
  for (const l of state.leads || []) {
    const linkedTid = l.convertedToTenantId || l.convertedTenantId;
    if (linkedTid && l.propertyId) addTenantLink(linkedTid, l.propertyId);
  }
  const tenants = (state.tenants || []).filter((t) => {
    if (user.role === "owner") {
      return contracts.some((c) => c.tenantId === t.id);
    }
    const linkedProps = tenantAllLinkedPropIds.get(t.id);
    if (linkedProps && linkedProps.size > 0) {
      for (const pid of linkedProps) {
        if (allowedPropIds.has(pid)) return true;
      }
      return false;
    }
    if (hasAllProps) {
      return canUserAccessCompany(state, user, t.companyId);
    }
    return allowedPropIds.size > 0;
  });
  const tenantIds = new Set(tenants.map((t) => t.id));
  const ownerShares = user.role === "owner" ? (state.ownerShares || []).filter((s) => s.ownerId === user.ownerId && allowedPropIds.has(s.propertyId)) : (state.ownerShares || []).filter((s) => allowedPropIds.has(s.propertyId));
  const visibleOwnerIds = new Set(ownerShares.map((s) => s.ownerId));
  for (const p of properties) {
    for (const s of p.ownerShares || []) {
      if (user.role !== "owner" || s.ownerId === user.ownerId) {
        visibleOwnerIds.add(s.ownerId);
      }
    }
  }
  const owners = user.role === "owner" ? (state.owners || []).filter((o) => o.id === user.ownerId) : (state.owners || []).filter((o) => visibleOwnerIds.has(o.id) || hasAllProps);
  const allowedOwnerIds = new Set(owners.map((o) => o.id));
  const ownerTransfers = (state.ownerTransfers || []).filter((tr) => allowedOwnerIds.has(tr.ownerId));
  const purchaseOrders = (state.purchaseOrders || []).filter(
    (po) => po.propertyId ? allowedPropIds.has(po.propertyId) : hasAllProps
  );
  const decisions = (state.decisions || []).filter(
    (d) => d.propertyId ? allowedPropIds.has(d.propertyId) : hasAllProps
  );
  const zatcaInvoices = (state.zatcaInvoices || []).filter((z) => {
    if (z.contractId) return contractIds.has(z.contractId);
    if (z.propertyId) return allowedPropIds.has(z.propertyId);
    return hasAllProps;
  });
  const communications = (state.communications || []).filter(
    (c) => c.tenantId ? tenantIds.has(c.tenantId) : hasAllProps
  );
  const documents = (state.documents || []).filter((doc) => {
    if (doc.propertyId) return allowedPropIds.has(doc.propertyId);
    const relType = doc.relatedEntityType || doc.relatedType;
    const relId = doc.relatedEntityId || doc.relatedId;
    if ((relType === "Property" || relType === "\u0639\u0642\u0627\u0631") && relId) return allowedPropIds.has(relId);
    if ((relType === "Unit" || relType === "\u0648\u062D\u062F\u0629") && relId) return unitIds.has(relId);
    if ((relType === "Contract" || relType === "\u0639\u0642\u062F") && relId) return contractIds.has(relId);
    if ((relType === "Tenant" || relType === "\u0645\u0633\u062A\u0623\u062C\u0631") && relId) return tenantIds.has(relId);
    if (relType === "Ticket" && relId) return ticketIds.has(relId);
    if (relType === "Expense" && relId) return expenseIds.has(relId);
    if (relType === "Handover" && relId) return handoverIds.has(relId);
    if (relType === "Owner" && relId) return allowedOwnerIds.has(relId);
    if (relType === "\u0634\u0631\u0643\u0629") return hasAllProps;
    return hasAllProps;
  });
  const companies = user.role === "sys_owner" || !user.companyId ? state.companies || [] : (state.companies || []).filter((c) => c.id === user.companyId);
  const notifications = (state.notifications || []).filter((n) => {
    if (!n.targetRoles.includes(user.role) && user.role !== "sys_owner") return false;
    if (n.propertyId) return allowedPropIds.has(n.propertyId);
    return true;
  });
  const sanitizedUsers = (state.users || []).filter((u) => {
    if (user.role === "owner") return u.id === user.id;
    if (user.role === "sys_owner") return true;
    if (user.companyId && u.companyId && user.companyId !== u.companyId) return false;
    return true;
  }).map((u) => {
    if (u.id === user.id || canTeam || canAudit) {
      return sanitizeUserForClient(u);
    }
    return {
      id: u.id,
      companyId: u.companyId,
      nameAr: u.nameAr,
      nameEn: u.nameEn,
      role: u.role,
      jobTitle: u.jobTitle,
      department: u.department,
      roleLabelAr: u.roleLabelAr,
      roleLabelEn: u.roleLabelEn,
      email: "",
      phone: "",
      approvalLimitSar: 0,
      active: u.active,
      accountStatus: u.accountStatus || (u.active ? "\u0646\u0634\u0637" : "\u0645\u0648\u0642\u0648\u0641"),
      lastActiveAt: u.lastActiveAt,
      statusState: u.statusState,
      specialty: u.specialty,
      online: u.online
    };
  });
  return {
    ...state,
    meta: {
      ...state.meta,
      ...options?.workspaceId ? { workspaceId: options.workspaceId } : {}
    },
    companies,
    properties,
    units,
    tenants,
    leads,
    leadEscalations,
    contracts,
    handovers,
    installments,
    payments,
    expenses,
    supplierInvoices,
    propertyBudgets,
    tickets,
    tasks,
    meterReadings,
    documents,
    owners,
    ownerShares,
    ownerTransfers,
    purchaseOrders,
    decisions,
    zatcaInvoices,
    communications,
    notifications,
    auditLogs: canAudit ? state.auditLogs : [],
    backups: canBackup ? state.backups : [],
    loginHistory: canAudit || canTeam ? state.loginHistory || [] : [],
    employeeInvitations: canTeam ? state.employeeInvitations || [] : [],
    users: sanitizedUsers
  };
}
function getNavRequiredModules(nav) {
  switch (nav) {
    case "dashboard":
      return ["dashboard"];
    case "daily_hub":
      return ["tasks", "dashboard"];
    case "properties":
      return ["properties", "units"];
    case "leasing_finance":
    case "leasing":
    case "finance":
    case "accounting":
      return ["contracts", "payments", "finance", "receipts", "expenses"];
    case "tenants":
      return ["tenants"];
    case "maintenance":
      return ["maintenance", "tasks"];
    case "reports":
    case "admin":
      return ["reports", "audit"];
    case "team":
      return ["team"];
    case "documents":
      return ["documents"];
    case "archive":
      return ["archive"];
    case "templates":
      return ["tenants", "contracts", "settings"];
    case "settings":
      return ["settings", "backups"];
    case "about":
    case "profile":
      return ["dashboard"];
    default:
      return ["dashboard"];
  }
}
function userCanAccessNav(state, user, nav) {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== "\u0646\u0634\u0637") return false;
  if (nav === "profile" || nav === "about" || nav === "dashboard") return true;
  if (user.role === "owner") {
    const ownerAllowed = /* @__PURE__ */ new Set(["dashboard", "properties", "leasing_finance", "tenants", "reports", "documents", "archive", "profile", "about"]);
    return ownerAllowed.has(nav);
  }
  const modules = getNavRequiredModules(nav);
  return modules.some((m) => userHasModuleAction(state, user, m, "view"));
}
function getRecommendedLandingNav(state, user) {
  if (!user || !user.active || user.accountStatus && user.accountStatus !== "\u0646\u0634\u0637") {
    return { nav: "dashboard" };
  }
  if (user.role === "accountant" && userCanAccessNav(state, user, "leasing_finance")) {
    return { nav: "leasing_finance", leasingFinanceTab: "finance" };
  }
  if ((user.role === "maint_manager" || user.role === "technician") && userCanAccessNav(state, user, "maintenance")) {
    return { nav: "maintenance" };
  }
  if (user.role === "leasing" && userCanAccessNav(state, user, "tenants")) {
    return { nav: "tenants" };
  }
  if (user.role === "supervisor" && userCanAccessNav(state, user, "properties")) {
    return { nav: "properties" };
  }
  if (user.role === "receptionist" && userCanAccessNav(state, user, "daily_hub")) {
    return { nav: "daily_hub" };
  }
  return { nav: "dashboard" };
}
function getAllowedNavsForUser(state, user) {
  const allNavs = [
    "dashboard",
    "daily_hub",
    "properties",
    "leasing_finance",
    "tenants",
    "maintenance",
    "reports",
    "team",
    "documents",
    "archive",
    "templates",
    "settings",
    "profile",
    "about"
  ];
  return allNavs.filter((n) => userCanAccessNav(state, user, n));
}

// worker/src/cryptoWeb.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex) {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
function toBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
async function hashSecretWeb(secret) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `pbkdf2$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(derived))}`;
}
async function verifySecretWeb(secret, storedHash) {
  if (!storedHash || !storedHash.startsWith("pbkdf2$")) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 3) return false;
  const salt = hexToBytes(parts[1]);
  const expected = hexToBytes(parts[2]);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return constantTimeEqual(new Uint8Array(derived), expected);
}
async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
async function signTokenWeb(claims, secret) {
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(sig))}`;
}
async function verifyTokenWeb(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const key = await importHmacKey(secret);
  const expectedSig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64)));
  let providedSig;
  try {
    providedSig = fromBase64Url(sigB64);
  } catch {
    return null;
  }
  if (!constantTimeEqual(expectedSig, providedSig)) return null;
  try {
    const claims = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    if (!claims?.uid || !claims?.exp || claims.exp < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
async function encryptBackupWeb(payload, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoder.encode(JSON.stringify(payload))
  );
  return {
    aqarEncrypted: true,
    alg: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: 1e5,
    salt: bytesToHex(salt),
    iv: bytesToHex(iv),
    ciphertext: toBase64Url(new Uint8Array(encrypted))
  };
}
async function decryptBackupWeb(envelope, password) {
  const salt = hexToBytes(envelope.salt);
  const iv = hexToBytes(envelope.iv);
  const cipherBytes = fromBase64Url(envelope.ciphertext);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: envelope.iterations || 1e5,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    cipherBytes
  );
  return JSON.parse(decoder.decode(new Uint8Array(plainBuf)));
}

// worker/src/workspaceDo.ts
var WorkerPermissionDeniedError = class extends Error {
  statusCode = 403;
  constructor(message) {
    super(message);
    this.name = "WorkerPermissionDeniedError";
  }
};
var SESSION_COOKIE_NAME = "aqar_session";
var REFRESH_COOKIE_NAME = "aqar_refresh";
var SESSION_TTL_MS = 1e3 * 60 * 60 * 24 * 7;
var ACCESS_TOKEN_TTL_MS = 1e3 * 60 * 60 * 4;
var SESSION_SHORT_TTL_MS = 1e3 * 60 * 60 * 8;
var MAX_FAILED_LOGIN_ATTEMPTS = 5;
var LOCKOUT_DURATION_MS = 5 * 60 * 1e3;
var ARRAY_COLLECTIONS = [
  "companies",
  "users",
  "customRoles",
  "employeeInvitations",
  "properties",
  "units",
  "meterReadings",
  "owners",
  "ownerShares",
  "ownerTransfers",
  "vendors",
  "tenants",
  "leads",
  "leadEscalations",
  "contracts",
  "handovers",
  "installments",
  "payments",
  "accounts",
  "journals",
  "expenses",
  "supplierInvoices",
  "recurringExpenses",
  "propertyBudgets",
  "assets",
  "tickets",
  "tasks",
  "communications",
  "documents",
  "purchaseOrders",
  "decisions",
  "notifications",
  "reminderRules",
  "reminderLogs",
  "auditLogs",
  "backups",
  "savedArchiveFilters",
  "loginHistory",
  "syncConflicts",
  "scheduledReports",
  "favoriteReports",
  "sharedSearchFilters",
  "zatcaInvoices",
  "communicationTemplates"
];
var SINGLETON_KEYS = [
  "settings",
  "rolePermissions",
  "roleModulePermissions",
  "counters",
  "processedIdempotencyKeys",
  "archiveLastNightlyRun",
  "archiveSeeded",
  "securityPolicy",
  "teamSeeded",
  "syncRevision",
  "entityRevisions",
  "lastUpdatedAt"
];
var PUBLIC_PATHS = /* @__PURE__ */ new Set([
  "/api/health",
  "/api/workspaces/provision",
  "/api/auth/session",
  "/api/auth/login",
  "/api/auth/login-pin",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/public/prospect-context",
  "/api/public/leads"
]);
function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
async function sha256HexWeb(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomHexWeb(byteLength = 32) {
  const buf = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function jsonResponse(body, status = 200, extraHeaders) {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(JSON.stringify(body), { status, headers });
}
function errorResponse(err, defaultStatus = 400) {
  if (err instanceof WorkerPermissionDeniedError) {
    return jsonResponse({ error: err.message, code: "FORBIDDEN" }, 403);
  }
  const msg = err?.message || "\u062A\u0639\u0630\u0631 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0637\u0644\u0628";
  return jsonResponse({ error: msg }, defaultStatus);
}
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}
function isSecureRequest(req) {
  try {
    const fwd = req.headers.get("x-forwarded-proto");
    if (fwd && fwd.split(",")[0].trim().toLowerCase() === "https") return true;
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}
function normalizePhone(raw) {
  return (raw || "").replace(/[^\d]/g, "").slice(-9);
}
function resolveRequestWorkspace(request) {
  const hdr = (request.headers.get("x-resolved-workspace-id") || request.headers.get("x-workspace-id") || "").trim().toLowerCase();
  if (hdr && /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(hdr)) {
    return hdr;
  }
  return "default";
}
var AqarWorkspaceDO = class extends DurableObject {
  stateCache = null;
  initialized = false;
  sessionSecretCache = null;
  constructor(ctx, env) {
    super(ctx, env);
    this.initSchema();
  }
  initSchema() {
    const sql = this.ctx.storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS kv_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS entities (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        company_id TEXT NOT NULL DEFAULT 'default',
        sort_order INTEGER NOT NULL DEFAULT 0,
        revision INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL,
        data TEXT NOT NULL,
        PRIMARY KEY (collection, id)
      );
      CREATE INDEX IF NOT EXISTS idx_do_entities_col ON entities (collection, sort_order);
      CREATE INDEX IF NOT EXISTS idx_do_entities_comp ON entities (company_id, collection);

      CREATE TABLE IF NOT EXISTS state_snapshots (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sync_revision INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        state_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_credentials (
        user_id TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        pin_hash TEXT,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workspace_id TEXT NOT NULL DEFAULT 'default',
        device_name TEXT NOT NULL,
        app_type TEXT NOT NULL DEFAULT 'web',
        remember_me INTEGER NOT NULL DEFAULT 1,
        refresh_token_hash TEXT,
        refresh_expires_at TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        revoked INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS operations_log (
        operation_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        method TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        status TEXT NOT NULL,
        response_json TEXT,
        processed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS backups_store (
        id TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    const alterCols = [
      "ALTER TABLE user_credentials ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE user_credentials ADD COLUMN locked_until TEXT",
      "ALTER TABLE sessions ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'default'",
      "ALTER TABLE sessions ADD COLUMN app_type TEXT NOT NULL DEFAULT 'web'",
      "ALTER TABLE sessions ADD COLUMN remember_me INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE sessions ADD COLUMN refresh_token_hash TEXT",
      "ALTER TABLE sessions ADD COLUMN refresh_expires_at TEXT"
    ];
    for (const stmt of alterCols) {
      try {
        sql.exec(stmt);
      } catch {
      }
    }
  }
  normalizeLoadedState(rawState, workspaceId) {
    const base = createInitialSeed();
    const defCompanyId = (rawState.companies || base.companies || [])[0]?.id || `comp-${workspaceId}`;
    const mergedRolePermissions = {
      ...DEFAULT_ROLE_PERMISSIONS,
      ...rawState.rolePermissions || {}
    };
    const mergedRoleModulePermissions = {
      ...buildAllDefaultRoleModulePermissions(),
      ...rawState.roleModulePermissions || {}
    };
    const users = (rawState.users || []).map((u) => ({
      ...u,
      companyId: u.role === "sys_owner" ? u.companyId : u.companyId || defCompanyId,
      accountStatus: u.accountStatus || (u.active ? "\u0646\u0634\u0637" : "\u0645\u0648\u0642\u0648\u0641")
    }));
    return {
      ...base,
      ...rawState,
      users,
      customRoles: Array.isArray(rawState.customRoles) ? rawState.customRoles : [],
      employeeInvitations: Array.isArray(rawState.employeeInvitations) ? rawState.employeeInvitations : [],
      rolePermissions: mergedRolePermissions,
      roleModulePermissions: mergedRoleModulePermissions,
      entityRevisions: rawState.entityRevisions || {}
    };
  }
  loadNormalizedState(workspaceId) {
    const sql = this.ctx.storage.sql;
    const settingsRow = sql.exec("SELECT value FROM kv_meta WHERE key = 'singleton:settings'").toArray()[0];
    if (!settingsRow) return null;
    const base = createInitialSeed();
    const out = { ...base };
    const metaRows = sql.exec("SELECT key, value FROM kv_meta WHERE key LIKE 'singleton:%'").toArray();
    for (const row of metaRows) {
      const k = row.key.slice("singleton:".length);
      try {
        out[k] = JSON.parse(row.value);
      } catch {
        out[k] = row.value;
      }
    }
    for (const col of ARRAY_COLLECTIONS) {
      const rows = sql.exec("SELECT data FROM entities WHERE collection = ? ORDER BY sort_order ASC", String(col)).toArray();
      if (rows.length > 0 || col === "customRoles" || col === "employeeInvitations") {
        out[String(col)] = rows.map((r) => JSON.parse(r.data));
      } else {
        out[String(col)] = rows.map((r) => JSON.parse(r.data));
      }
    }
    return this.normalizeLoadedState(out, workspaceId);
  }
  saveNormalizedState(state, workspaceId) {
    const sql = this.ctx.storage.sql;
    const now = state.lastUpdatedAt || (/* @__PURE__ */ new Date()).toISOString();
    const revisions = state.entityRevisions || {};
    this.ctx.storage.transactionSync(() => {
      for (const key of SINGLETON_KEYS) {
        const val = state[key];
        if (val !== void 0) {
          sql.exec("INSERT OR REPLACE INTO kv_meta (key, value) VALUES (?, ?)", `singleton:${String(key)}`, JSON.stringify(val));
        }
      }
      for (const col of ARRAY_COLLECTIONS) {
        const list = state[col] || [];
        sql.exec("DELETE FROM entities WHERE collection = ?", String(col));
        for (let idx = 0; idx < list.length; idx++) {
          const item = list[idx];
          const entityId = String(item?.id || `${String(col)}-${idx}`);
          const companyId = String(item?.companyId || workspaceId || "default");
          const revKey = `${String(col)}:${entityId}`;
          const rev = revisions[revKey] || 1;
          sql.exec(
            "INSERT INTO entities (collection, id, company_id, sort_order, revision, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
            String(col),
            entityId,
            companyId,
            idx,
            rev,
            now,
            JSON.stringify(item)
          );
        }
      }
    });
  }
  async ensureBootstrapped(workspaceId) {
    if (this.initialized && this.stateCache) return this.stateCache;
    const sql = this.ctx.storage.sql;
    const normalized = this.loadNormalizedState(workspaceId);
    if (normalized) {
      this.stateCache = normalized;
    } else {
      const legacyRows = sql.exec("SELECT state_json FROM state_snapshots WHERE id = 1").toArray();
      if (legacyRows.length > 0) {
        const parsed = this.normalizeLoadedState(JSON.parse(legacyRows[0].state_json), workspaceId);
        this.stateCache = parsed;
        this.saveNormalizedState(parsed, workspaceId);
      } else if (workspaceId === "default") {
        const seed = this.normalizeLoadedState(createInitialSeed(), workspaceId);
        this.stateCache = seed;
        this.saveNormalizedState(seed, workspaceId);
      } else {
        const emptySeed = this.createEmptyWorkspaceSeed(workspaceId);
        this.stateCache = emptySeed;
        this.saveNormalizedState(emptySeed, workspaceId);
      }
    }
    const allowSeedDefaults = this.env.AQAR_ALLOW_SEED_DEFAULTS === "true" || this.env.AQAR_DEMO_LOGIN === "true";
    const bootstrapPassword = (this.env.AQAR_BOOTSTRAP_ADMIN_PASSWORD || "").trim();
    const bootstrapEmail = (this.env.AQAR_BOOTSTRAP_ADMIN_EMAIL || "").trim().toLowerCase();
    const bootstrapPin = (this.env.AQAR_BOOTSTRAP_ADMIN_PIN || "").trim();
    if (allowSeedDefaults) {
      const existingCreds = new Set(
        sql.exec("SELECT user_id FROM user_credentials").toArray().map((r) => r.user_id)
      );
      const defaultPwHash = await hashSecretWeb("Aqar@2026");
      const defaultPinHash = await hashSecretWeb("1234");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const user of this.stateCache.users) {
        if (!existingCreds.has(user.id)) {
          sql.exec(
            "INSERT INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)",
            user.id,
            defaultPwHash,
            defaultPinHash,
            now
          );
        }
      }
    } else if (bootstrapPassword.length >= 8) {
      const existingCreds = new Set(
        sql.exec("SELECT user_id FROM user_credentials").toArray().map((r) => r.user_id)
      );
      const targetAdmin = this.stateCache.users.find((u) => bootstrapEmail && u.email.toLowerCase() === bootstrapEmail) || this.stateCache.users.find((u) => u.role === "sys_owner");
      if (targetAdmin && !existingCreds.has(targetAdmin.id)) {
        const pwHash = await hashSecretWeb(bootstrapPassword);
        const pinHash = /^\d{4,6}$/.test(bootstrapPin) ? await hashSecretWeb(bootstrapPin) : null;
        sql.exec(
          "INSERT INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)",
          targetAdmin.id,
          pwHash,
          pinHash,
          (/* @__PURE__ */ new Date()).toISOString()
        );
      }
    }
    if (this.env.AQAR_SESSION_SECRET && this.env.AQAR_SESSION_SECRET.length >= 16) {
      this.sessionSecretCache = this.env.AQAR_SESSION_SECRET;
    } else {
      const secretRow = sql.exec("SELECT value FROM kv_meta WHERE key = 'session_secret'").toArray();
      if (secretRow.length > 0) {
        this.sessionSecretCache = secretRow[0].value;
      } else {
        const hex = randomHexWeb(32);
        sql.exec("INSERT INTO kv_meta (key, value) VALUES ('session_secret', ?)", hex);
        this.sessionSecretCache = hex;
      }
    }
    this.initialized = true;
    return this.stateCache;
  }
  createEmptyWorkspaceSeed(workspaceId, companyNameAr = "\u0645\u0646\u0634\u0623\u0629 \u0639\u0642\u0627\u0631\u064A\u0629 \u062C\u062F\u064A\u062F\u0629", companyNameEn = "New Real Estate Workspace") {
    const base = createInitialSeed();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      ...base,
      settings: {
        ...base.settings,
        nameAr: companyNameAr,
        nameEn: companyNameEn
      },
      companies: [
        {
          id: `comp-${workspaceId}`,
          nameAr: companyNameAr,
          nameEn: companyNameEn,
          city: base.settings.city,
          vatNumber: "",
          crNumber: "",
          address: base.settings.address || "",
          phone: base.settings.phone || "",
          email: base.settings.email || "",
          bankName: base.settings.bankAccounts?.[0]?.bankName || "",
          iban: base.settings.bankAccounts?.[0]?.iban || "",
          receiptFooterAr: "",
          isDefault: true
        }
      ],
      users: [],
      customRoles: [],
      employeeInvitations: [],
      properties: [],
      units: [],
      meterReadings: [],
      owners: [],
      ownerShares: [],
      ownerTransfers: [],
      vendors: [],
      tenants: [],
      leads: [],
      leadEscalations: [],
      contracts: [],
      handovers: [],
      installments: [],
      payments: [],
      journals: [],
      expenses: [],
      supplierInvoices: [],
      recurringExpenses: [],
      propertyBudgets: [],
      assets: [],
      tickets: [],
      tasks: [],
      communications: [],
      documents: [],
      purchaseOrders: [],
      decisions: [],
      notifications: [],
      reminderLogs: [],
      auditLogs: [],
      backups: [],
      loginHistory: [],
      syncConflicts: [],
      zatcaInvoices: [],
      rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)),
      roleModulePermissions: buildAllDefaultRoleModulePermissions(),
      counters: {
        receipt: 0,
        expense: 0,
        ticket: 0,
        journal: 0,
        contract: 0
      },
      processedIdempotencyKeys: [],
      entityRevisions: {},
      syncRevision: 1,
      lastUpdatedAt: now
    };
  }
  persistState(state, workspaceId) {
    state.lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    state.syncRevision = (state.syncRevision || 1) + 1;
    this.stateCache = state;
    this.saveNormalizedState(state, workspaceId);
  }
  persistSecurityAuditImmediate(state, entry, workspaceId) {
    if (!state.auditLogs) state.auditLogs = [];
    state.auditLogs.unshift(entry);
    if (state.auditLogs.length > 500) {
      state.auditLogs = state.auditLogs.slice(0, 500);
    }
    const sql = this.ctx.storage.sql;
    this.ctx.storage.transactionSync(() => {
      sql.exec("DELETE FROM entities WHERE collection = 'auditLogs'");
      for (let idx = 0; idx < state.auditLogs.length; idx++) {
        const item = state.auditLogs[idx];
        sql.exec(
          "INSERT INTO entities (collection, id, company_id, sort_order, revision, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
          "auditLogs",
          item.id,
          workspaceId || "default",
          idx,
          1,
          item.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          JSON.stringify(item)
        );
      }
    });
  }
  recordDeniedAccess(state, workspaceId, actor, action, entityType, entityId, reason, opts) {
    const entry = {
      id: uid("aud"),
      userId: actor?.id || "anonymous",
      userName: actor?.nameAr || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
      userRole: actor?.roleLabelAr || "\u0645\u0633\u062A\u062E\u062F\u0645",
      deviceName: opts?.deviceName || actor?.deviceName || "Cloudflare Edge",
      action,
      entityType,
      entityId,
      propertyId: opts?.propertyId,
      summary: reason,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.persistSecurityAuditImmediate(state, entry, workspaceId);
  }
  getActingUser(state, userId) {
    const user = state.users.find((u) => u.id === userId && isUserAccountActive(u));
    if (!user) {
      throw new WorkerPermissionDeniedError("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0647");
    }
    return user;
  }
  hasPermission(state, userId, perm) {
    const user = state.users.find((u) => u.id === userId && isUserAccountActive(u));
    if (!user) return false;
    return userHasLegacyPermission(state, user, perm);
  }
  assertPermission(state, workspaceId, userId, perm, ctx) {
    const user = this.getActingUser(state, userId);
    if (!userHasLegacyPermission(state, user, perm)) {
      const msg = "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621";
      this.recordDeniedAccess(
        state,
        workspaceId,
        user,
        "\u0631\u0641\u0636 \u0645\u062D\u0627\u0648\u0644\u0629 \u0625\u062C\u0631\u0627\u0621 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647",
        ctx?.entityType || "RBAC",
        ctx?.entityId || perm,
        `${msg} (${perm})`,
        { propertyId: ctx?.propertyId, deviceName: ctx?.deviceName }
      );
      throw new WorkerPermissionDeniedError(msg);
    }
    return user;
  }
  assertModuleAction(state, workspaceId, userId, module, action, ctx) {
    const user = this.getActingUser(state, userId);
    if (!userHasModuleAction(state, user, module, action)) {
      const msg = `\u0644\u0627 \u062A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 (${action}) \u0639\u0644\u0649 \u0642\u0633\u0645 (${module})`;
      this.recordDeniedAccess(
        state,
        workspaceId,
        user,
        "\u0631\u0641\u0636 \u0645\u062D\u0627\u0648\u0644\u0629 \u0648\u0635\u0648\u0644 \u0623\u0648 \u0625\u062C\u0631\u0627\u0621 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647",
        ctx?.entityType || "RBAC",
        ctx?.entityId || `${module}:${action}`,
        msg,
        { propertyId: ctx?.propertyId, deviceName: ctx?.deviceName }
      );
      throw new WorkerPermissionDeniedError(msg);
    }
    return user;
  }
  assertPropertyAccess(state, workspaceId, user, propertyId, actionLabel, entityType = "Property", entityId = propertyId || "unscoped", deviceName) {
    if (!propertyId) {
      if (userHasAllPropertiesAccess(state, user)) return;
      const msg = `\u0631\u0641\u0636 ${actionLabel}: \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0642\u064A\u062F \u0628\u0646\u0637\u0627\u0642 \u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0644\u0627 \u064A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0634\u0627\u0645\u0644`;
      this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0648\u0635\u0648\u0644 \u0628\u062F\u0648\u0646 \u0646\u0637\u0627\u0642 \u0639\u0642\u0627\u0631", entityType, entityId, msg, { deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    const prop = state.properties.find((p) => p.id === propertyId);
    if (prop && !canUserAccessCompany(state, user, prop.companyId)) {
      const msg = `\u0631\u0641\u0636 ${actionLabel}: \u0627\u0644\u0639\u0642\u0627\u0631 \u064A\u062A\u0628\u0639 \u0634\u0631\u0643\u0629 \u0623\u062E\u0631\u0649 \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u062D\u0633\u0627\u0628\u0643`;
      this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0648\u0635\u0648\u0644 \u0639\u0628\u0631 \u0627\u0644\u0634\u0631\u0643\u0627\u062A", entityType, entityId, msg, { propertyId, deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    if (!canUserAccessProperty(state, user, propertyId)) {
      const msg = `\u0631\u0641\u0636 ${actionLabel}: \u0627\u0644\u0639\u0642\u0627\u0631 (${propertyId}) \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u0647\u0627`;
      this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0648\u0635\u0648\u0644 \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A", entityType, entityId, msg, { propertyId, deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
  }
  getTenantLinkedPropertyIds(state, tenantId) {
    const set = /* @__PURE__ */ new Set();
    for (const c of state.contracts) {
      if (c.tenantId === tenantId && c.propertyId) set.add(c.propertyId);
    }
    for (const u of state.units) {
      if ((u.currentTenantId === tenantId || u.linkedTenantId === tenantId) && u.propertyId) set.add(u.propertyId);
    }
    for (const l of state.leads) {
      const tid = l.convertedToTenantId || l.convertedTenantId;
      if (tid === tenantId && l.propertyId) set.add(l.propertyId);
    }
    return Array.from(set);
  }
  assertTenantAccess(state, workspaceId, user, tenantId, actionLabel, deviceName) {
    const tenant = state.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error("\u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    if (user.role === "owner") {
      const msg = `\u0631\u0641\u0636 ${actionLabel}: \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0627\u0644\u0643 \u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0641\u0642\u0637`;
      this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u062A\u0639\u062F\u064A\u0644 \u0644\u062D\u0633\u0627\u0628 \u0645\u0627\u0644\u0643", "Tenant", tenant.id, msg, { deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    if (userHasAllPropertiesAccess(state, user)) return tenant;
    const accessible = getAccessiblePropertyIdsSet(state, user);
    if (accessible.size === 0) {
      const msg = `\u0631\u0641\u0636 ${actionLabel}: \u062D\u0633\u0627\u0628\u0643 \u0645\u0642\u064A\u062F \u0628\u0640 0 \u0639\u0642\u0627\u0631 \u0648\u0644\u0627 \u064A\u0633\u0645\u062D \u0628\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631\u064A\u0646`;
      this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0648\u0635\u0648\u0644 \u0628\u0645\u0635\u0641\u0648\u0641\u0629 \u0639\u0642\u0627\u0631\u0627\u062A \u0641\u0627\u0631\u063A\u0629", "Tenant", tenant.id, msg, { deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    const linkedProps = this.getTenantLinkedPropertyIds(state, tenant.id);
    if (linkedProps.length > 0 && !linkedProps.some((pid) => accessible.has(pid))) {
      const msg = `\u0631\u0641\u0636 ${actionLabel}: \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u064A\u0631\u062A\u0628\u0637 \u0628\u0639\u0642\u0627\u0631\u0627\u062A \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0635\u0644\u0627\u062D\u064A\u0627\u062A\u0643`;
      this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0648\u0635\u0648\u0644 \u0644\u0645\u0644\u0641 \u0645\u0633\u062A\u0623\u062C\u0631 \u062E\u0627\u0631\u062C \u0627\u0644\u0646\u0637\u0627\u0642", "Tenant", tenant.id, msg, {
        propertyId: linkedProps[0],
        deviceName
      });
      throw new WorkerPermissionDeniedError(msg);
    }
    return tenant;
  }
  bumpRevision(state, entityType, entityId) {
    if (!state.entityRevisions) state.entityRevisions = {};
    const key = `${entityType}:${entityId}`;
    state.entityRevisions[key] = (state.entityRevisions[key] || 0) + 1;
  }
  appendAudit(state, userId, action, entityType, entityId, summary, deviceName = "Cloudflare Edge", propertyId) {
    const actor = state.users.find((u) => u.id === userId);
    state.auditLogs.unshift({
      id: uid("aud"),
      userId,
      userName: actor?.nameAr || "\u0645\u0633\u062A\u062E\u062F\u0645",
      userRole: actor?.roleLabelAr || "",
      deviceName,
      action,
      entityType,
      entityId,
      propertyId,
      summary,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (state.auditLogs.length > 500) {
      state.auditLogs.length = 500;
    }
  }
  getStateForUser(state, userId, workspaceId = "default") {
    const user = state.users.find((u) => u.id === userId && isUserAccountActive(u));
    if (!user) {
      throw new WorkerPermissionDeniedError("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0647");
    }
    return filterStateForUser(state, user, { workspaceId });
  }
  revokeUserSessions(userId, workspaceId, reason, keepSessionId) {
    if (keepSessionId) {
      this.ctx.storage.sql.exec(
        "UPDATE sessions SET revoked = 1 WHERE user_id = ? AND token_id != ?",
        userId,
        keepSessionId
      );
    } else {
      this.ctx.storage.sql.exec("UPDATE sessions SET revoked = 1 WHERE user_id = ?", userId);
    }
    return this.disconnectUserWebSockets(userId, workspaceId, reason, void 0, keepSessionId);
  }
  disconnectUserWebSockets(userId, workspaceId, reason, targetSessionId, excludeSessionId) {
    let closed = 0;
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment();
      if (!meta || !meta.authenticated) continue;
      if (meta.workspaceId !== workspaceId || meta.userId !== userId) continue;
      if (targetSessionId && meta.sessionId !== targetSessionId) continue;
      if (excludeSessionId && meta.sessionId === excludeSessionId) continue;
      try {
        ws.send(
          JSON.stringify({
            type: "session:terminated",
            userId: meta.userId,
            sessionId: meta.sessionId,
            reason
          })
        );
      } catch {
      }
      try {
        ws.close(4001, "Session terminated");
      } catch {
      }
      closed += 1;
    }
    return closed;
  }
  extractToken(req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    const cookies = parseCookies(req.headers.get("cookie"));
    return cookies[SESSION_COOKIE_NAME] || null;
  }
  async resolveActor(req, state, workspaceId, overrideToken) {
    const rawToken = overrideToken || this.extractToken(req);
    if (!rawToken || !this.sessionSecretCache) return null;
    const claims = await verifyTokenWeb(rawToken, this.sessionSecretCache);
    if (!claims) return null;
    if (claims.wid && claims.wid !== workspaceId) {
      return null;
    }
    const sessionRow = this.ctx.storage.sql.exec(
      "SELECT user_id, workspace_id, expires_at, revoked FROM sessions WHERE token_id = ?",
      claims.sid
    ).toArray()[0];
    if (!sessionRow || sessionRow.revoked !== 0 || sessionRow.user_id !== claims.uid || sessionRow.workspace_id !== workspaceId) {
      return null;
    }
    if (new Date(sessionRow.expires_at).getTime() <= Date.now()) {
      return null;
    }
    const user = state.users.find((u) => u.id === claims.uid && isUserAccountActive(u));
    if (!user) return null;
    const rawDevice = req.headers.get("x-device-name");
    let deviceName = claims.deviceName || "Cloudflare Web";
    if (rawDevice) {
      try {
        deviceName = decodeURIComponent(rawDevice);
      } catch {
        deviceName = rawDevice;
      }
    }
    return {
      userId: user.id,
      workspaceId,
      role: user.role,
      sessionId: claims.sid,
      rawToken,
      deviceName
    };
  }
  buildSessionHeaders(accessToken, refreshToken, rememberMe, accessTtlMs, secure) {
    const headers = new Headers();
    const secAttr = secure ? "; Secure" : "";
    const accessMaxAge = rememberMe ? `; Max-Age=${Math.floor(accessTtlMs / 1e3)}` : "";
    headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax${secAttr}${accessMaxAge}`
    );
    if (rememberMe && refreshToken) {
      headers.append(
        "Set-Cookie",
        `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax${secAttr}; Max-Age=${Math.floor(SESSION_TTL_MS / 1e3)}`
      );
    } else {
      headers.append("Set-Cookie", `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax${secAttr}; Max-Age=0`);
    }
    return headers;
  }
  async issueSession(user, workspaceId, deviceName, opts) {
    const rememberMe = opts?.rememberMe !== false;
    const isDesktop = opts?.appType === "desktop";
    const now = Date.now();
    const accessTtlMs = rememberMe ? ACCESS_TOKEN_TTL_MS : SESSION_SHORT_TTL_MS;
    const exp = now + accessTtlMs;
    const expiresAt = new Date(exp).toISOString();
    const refreshTtlMs = rememberMe ? SESSION_TTL_MS : SESSION_SHORT_TTL_MS;
    const refreshExpiresAt = rememberMe ? new Date(now + refreshTtlMs).toISOString() : void 0;
    const rawRefreshToken = rememberMe ? randomHexWeb(32) : void 0;
    const refreshHash = rawRefreshToken ? await sha256HexWeb(rawRefreshToken) : null;
    const sid = `ses-${crypto.randomUUID().slice(0, 12)}`;
    const token = await signTokenWeb(
      { sid, uid: user.id, wid: workspaceId, role: user.role, deviceName, iat: now, exp },
      this.sessionSecretCache
    );
    this.ctx.storage.sql.exec(
      "INSERT INTO sessions (token_id, user_id, workspace_id, device_name, app_type, remember_me, refresh_token_hash, refresh_expires_at, created_at, expires_at, revoked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
      sid,
      user.id,
      workspaceId,
      deviceName,
      isDesktop ? "desktop" : "web",
      rememberMe ? 1 : 0,
      refreshHash,
      refreshExpiresAt || null,
      new Date(now).toISOString(),
      expiresAt
    );
    const headers = this.buildSessionHeaders(token, rawRefreshToken, rememberMe, accessTtlMs, Boolean(opts?.secure));
    return {
      token,
      refreshToken: isDesktop ? rawRefreshToken : void 0,
      expiresAt,
      refreshExpiresAt,
      sessionId: sid,
      rememberMe,
      headers
    };
  }
  checkAccountLock(userId) {
    const row = this.ctx.storage.sql.exec(
      "SELECT failed_attempts, locked_until FROM user_credentials WHERE user_id = ?",
      userId
    ).toArray()[0];
    if (!row?.locked_until) return { locked: false };
    const lockedUntilMs = new Date(row.locked_until).getTime();
    if (lockedUntilMs > Date.now()) {
      return { locked: true, retryAfterSec: Math.ceil((lockedUntilMs - Date.now()) / 1e3) };
    }
    return { locked: false };
  }
  recordFailedAttempt(userId) {
    const row = this.ctx.storage.sql.exec("SELECT failed_attempts FROM user_credentials WHERE user_id = ?", userId).toArray()[0];
    const next = (row?.failed_attempts || 0) + 1;
    const lockedUntil = next >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null;
    this.ctx.storage.sql.exec(
      "UPDATE user_credentials SET failed_attempts = ?, locked_until = ? WHERE user_id = ?",
      next,
      lockedUntil,
      userId
    );
  }
  clearFailedAttempts(userId) {
    this.ctx.storage.sql.exec(
      "UPDATE user_credentials SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?",
      userId
    );
  }
  getPresenceList(state) {
    const out = [];
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment();
      if (!meta || !meta.authenticated) continue;
      const u = state.users.find((x) => x.id === meta.userId);
      if (u) {
        out.push({
          sessionId: meta.sessionId,
          userId: u.id,
          nameAr: u.nameAr,
          roleLabelAr: u.roleLabelAr,
          deviceName: meta.deviceName || u.deviceName,
          connectedAt: meta.connectedAt
        });
      }
    }
    return out;
  }
  broadcastStateChange(state, actorUserId, summary, workspaceId) {
    const presence = this.getPresenceList(state);
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment();
      if (!meta || !meta.authenticated || meta.workspaceId !== workspaceId) continue;
      try {
        ws.send(
          JSON.stringify({
            type: "state:updated",
            actorUserId,
            summary,
            presence,
            state: this.getStateForUser(state, meta.userId, workspaceId)
          })
        );
      } catch {
      }
    }
  }
  normalizeAllowedPropertiesInput(input) {
    if (!Array.isArray(input)) return void 0;
    const cleaned = input.map((id) => String(id).trim()).filter(Boolean);
    if (cleaned.includes(ALL_PROPERTIES_SCOPE)) return [ALL_PROPERTIES_SCOPE];
    return Array.from(new Set(cleaned));
  }
  async handleMutation(state, actor, method, pathname, body) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { userId, workspaceId, deviceName } = actor;
    if (method === "PATCH" && pathname === "/api/settings") {
      const user = this.assertModuleAction(state, workspaceId, userId, "settings", "edit", {
        entityType: "CompanySettings",
        entityId: "settings",
        deviceName
      });
      if (user.role !== "sys_owner" && user.role !== "gm") {
        const msg = "\u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0645\u062A\u0627\u062D \u0641\u0642\u0637 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645";
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", "CompanySettings", "settings", msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      state.settings = { ...state.settings, ...body };
      this.bumpRevision(state, "settings", "company");
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", "\u0625\u0639\u062F\u0627\u062F\u0627\u062A", "company", "\u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623\u0629", deviceName);
      this.persistState(state, workspaceId);
      return { settings: state.settings, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/companies") {
      const user = this.assertPermission(state, workspaceId, userId, "manage_users", {
        entityType: "CompanyProfile",
        deviceName
      });
      if (user.role !== "sys_owner") {
        const msg = "\u0625\u0646\u0634\u0627\u0621 \u0634\u0631\u0643\u0629 \u0639\u0642\u0627\u0631\u064A\u0629 \u0623\u0648 \u0641\u0631\u0639 \u062C\u062F\u064A\u062F \u0645\u062D\u0635\u0648\u0631 \u0628\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0641\u0642\u0637";
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0625\u0646\u0634\u0627\u0621 \u0634\u0631\u0643\u0629 \u062C\u062F\u064A\u062F\u0629", "CompanyProfile", "create", msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      if (!state.companies) state.companies = [];
      const company = {
        id: uid("comp"),
        nameAr: String(body.nameAr || "\u0641\u0631\u0639 \u062C\u062F\u064A\u062F"),
        nameEn: String(body.nameEn || body.nameAr || "New Company"),
        logoText: String(body.logoText || ""),
        crNumber: String(body.crNumber || ""),
        vatNumber: String(body.vatNumber || ""),
        address: String(body.address || ""),
        city: String(body.city || state.settings.city || "\u0627\u0644\u0631\u064A\u0627\u0636"),
        phone: String(body.phone || ""),
        email: String(body.email || ""),
        bankName: String(body.bankName || ""),
        iban: String(body.iban || ""),
        receiptFooterAr: String(body.receiptFooterAr || ""),
        isDefault: false
      };
      state.companies.push(company);
      this.bumpRevision(state, "companies", company.id);
      this.appendAudit(state, userId, "\u0625\u0636\u0627\u0641\u0629 \u0634\u0631\u0643\u0629 \u0639\u0642\u0627\u0631\u064A\u0629", "CompanyProfile", company.id, `\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0634\u0631\u0643\u0629 ${company.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { company, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/properties") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "properties", "create", {
        entityType: "Property",
        deviceName
      });
      const targetCompanyId = String(body.companyId || actorUser.companyId || state.companies?.[0]?.id || `comp-${workspaceId}`);
      if (!canUserAccessCompany(state, actorUser, targetCompanyId)) {
        const msg = "\u0631\u0641\u0636 \u0625\u0636\u0627\u0641\u0629 \u0639\u0642\u0627\u0631: \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0634\u0631\u0643\u0629 \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u062D\u0633\u0627\u0628\u0643";
        this.recordDeniedAccess(state, workspaceId, actorUser, "\u0631\u0641\u0636 \u0625\u0636\u0627\u0641\u0629 \u0639\u0642\u0627\u0631 \u0639\u0628\u0631 \u0627\u0644\u0634\u0631\u0643\u0627\u062A", "Property", "create", msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const prop = {
        id: uid("prop"),
        companyId: targetCompanyId,
        code: String(body.code || `PR-${state.properties.length + 101}`),
        nameAr: String(body.nameAr || "\u0639\u0642\u0627\u0631 \u062C\u062F\u064A\u062F"),
        nameEn: String(body.nameEn || body.nameAr || "New Property"),
        city: String(body.city || state.settings.city || "\u0627\u0644\u0631\u064A\u0627\u0636"),
        district: String(body.district || "\u0627\u0644\u0639\u0644\u064A\u0627"),
        street: String(body.street || ""),
        nationalAddress: String(body.nationalAddress || ""),
        type: body.type || "\u0633\u0643\u0646\u064A",
        deedNumber: String(body.deedNumber || ""),
        status: body.status || "\u0646\u0634\u0637",
        buildingsCount: Number(body.buildingsCount || 1),
        floorsCount: Number(body.floorsCount || 1),
        managementFeePercent: Number(body.managementFeePercent ?? state.settings.defaultManagementFeePercent ?? 5),
        ownershipMode: body.ownershipMode || "\u0625\u062F\u0627\u0631\u0629 \u0644\u0644\u063A\u064A\u0631",
        ownerShares: Array.isArray(body.ownerShares) ? body.ownerShares : [{ ownerId: state.owners[0]?.id || "own-1", sharePercent: 100 }],
        electricityMeterMain: String(body.electricityMeterMain || ""),
        waterMeterMain: String(body.waterMeterMain || ""),
        caretakerName: String(body.caretakerName || ""),
        caretakerPhone: String(body.caretakerPhone || ""),
        createdAt: now
      };
      state.properties.unshift(prop);
      if (!userHasAllPropertiesAccess(state, actorUser)) {
        actorUser.allowedPropertyIds = Array.from(/* @__PURE__ */ new Set([...actorUser.allowedPropertyIds || [], prop.id]));
      }
      this.bumpRevision(state, "properties", prop.id);
      this.appendAudit(state, userId, "\u0625\u0636\u0627\u0641\u0629 \u0639\u0642\u0627\u0631", "\u0639\u0642\u0627\u0631", prop.id, `\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0639\u0642\u0627\u0631 ${prop.nameAr}`, deviceName, prop.id);
      this.persistState(state, workspaceId);
      return { property: prop, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/units") {
      const user = this.assertModuleAction(state, workspaceId, userId, "units", "create", {
        entityType: "Unit",
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        deviceName
      });
      const propertyId = String(body.propertyId || "");
      if (!propertyId) throw new Error("\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u0627\u0631 \u0644\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0648\u062D\u062F\u0629");
      this.assertPropertyAccess(state, workspaceId, user, propertyId, "\u0625\u0636\u0627\u0641\u0629 \u0648\u062D\u062F\u0629", "Unit", propertyId, deviceName);
      const monthly = Number(body.suggestedMonthlyRent || Math.round(Number(body.suggestedAnnualRent || 3e4) / 12));
      const unit = {
        id: uid("unit"),
        propertyId,
        buildingName: String(body.buildingName || "\u0627\u0644\u0645\u0628\u0646\u0649 \u0627\u0644\u0631\u0626\u064A\u0633\u064A"),
        floor: Number(body.floor || 1),
        unitNumber: String(body.unitNumber || `${state.units.length + 101}`),
        unitType: body.unitType || "\u0634\u0642\u0629",
        areaSqm: Number(body.areaSqm || 120),
        rooms: Number(body.rooms || 3),
        bathrooms: Number(body.bathrooms || 2),
        furnished: Boolean(body.furnished),
        acCount: Number(body.acCount || 2),
        electricityMeter: String(body.electricityMeter || ""),
        waterMeter: String(body.waterMeter || ""),
        keyCount: Number(body.keyCount || 2),
        acRemoteCount: Number(body.acRemoteCount || 2),
        suggestedMonthlyRent: monthly,
        suggestedAnnualRent: Number(body.suggestedAnnualRent || monthly * 12),
        officeFee: Number(body.officeFee || 0),
        status: body.status || "\u0634\u0627\u063A\u0631\u0629"
      };
      state.units.push(unit);
      this.bumpRevision(state, "units", unit.id);
      this.appendAudit(state, userId, "\u0625\u0636\u0627\u0641\u0629 \u0648\u062D\u062F\u0629", "\u0648\u062D\u062F\u0629", unit.id, `\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 ${unit.unitNumber}`, deviceName, unit.propertyId);
      this.persistState(state, workspaceId);
      return { unit, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const unitStatusMatch = /^\/api\/units\/([^/]+)\/status$/.exec(pathname);
    if (method === "PATCH" && unitStatusMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, "units", "edit", {
        entityType: "Unit",
        entityId: unitStatusMatch[1],
        deviceName
      });
      const unit = state.units.find((u) => u.id === unitStatusMatch[1]);
      if (!unit) throw new Error("\u0627\u0644\u0648\u062D\u062F\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
      this.assertPropertyAccess(state, workspaceId, user, unit.propertyId, "\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0648\u062D\u062F\u0629", "Unit", unit.id, deviceName);
      unit.status = body.status;
      this.bumpRevision(state, "units", unit.id);
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0648\u062D\u062F\u0629", "\u0648\u062D\u062F\u0629", unit.id, `\u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 ${unit.unitNumber}`, deviceName, unit.propertyId);
      this.persistState(state, workspaceId);
      return { unit, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/tenants") {
      const user = this.assertModuleAction(state, workspaceId, userId, "tenants", "create", {
        entityType: "Tenant",
        deviceName
      });
      if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        const msg = "\u0631\u0641\u0636 \u062A\u0633\u062C\u064A\u0644 \u0645\u0633\u062A\u0623\u062C\u0631: \u062D\u0633\u0627\u0628\u0643 \u0645\u0642\u064A\u062F \u0628\u0640 0 \u0639\u0642\u0627\u0631 \u0645\u0635\u0631\u062D \u0628\u0647";
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u0623\u062C\u0631 \u0628\u062F\u0648\u0646 \u0639\u0642\u0627\u0631\u0627\u062A", "Tenant", "create", msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const tenant = {
        id: uid("ten"),
        nameAr: String(body.nameAr || "\u0645\u0633\u062A\u0623\u062C\u0631 \u062C\u062F\u064A\u062F"),
        nameEn: String(body.nameEn || body.nameAr || "Tenant"),
        nationalIdOrIqama: String(body.nationalIdOrIqama || body.nationalId || ""),
        nationality: String(body.nationality || "\u0633\u0639\u0648\u062F\u064A"),
        phone: String(body.phone || ""),
        email: String(body.email || ""),
        tenantType: body.tenantType || "\u0641\u0631\u062F",
        classification: body.classification || "\u0646\u0634\u0637",
        rating: Number(body.rating ?? 5),
        notes: String(body.notes || ""),
        createdAt: now
      };
      state.tenants.unshift(tenant);
      this.bumpRevision(state, "tenants", tenant.id);
      this.appendAudit(state, userId, "\u062A\u0633\u062C\u064A\u0644 \u0645\u0633\u062A\u0623\u062C\u0631", "\u0645\u0633\u062A\u0623\u062C\u0631", tenant.id, `\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 ${tenant.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { tenant, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const tenantMatch = /^\/api\/tenants\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && tenantMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, "tenants", "edit", {
        entityType: "Tenant",
        entityId: tenantMatch[1],
        deviceName
      });
      const tenant = this.assertTenantAccess(state, workspaceId, user, tenantMatch[1], "\u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631", deviceName);
      Object.assign(tenant, body);
      this.bumpRevision(state, "tenants", tenant.id);
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0645\u0633\u062A\u0623\u062C\u0631", "\u0645\u0633\u062A\u0623\u062C\u0631", tenant.id, `\u062A\u062D\u062F\u064A\u062B \u0645\u0644\u0641 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 ${tenant.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { tenant, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "DELETE" && tenantMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, "tenants", "delete_void", {
        entityType: "Tenant",
        entityId: tenantMatch[1],
        deviceName
      });
      const tenant = this.assertTenantAccess(state, workspaceId, user, tenantMatch[1], "\u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631", deviceName);
      state.tenants = state.tenants.filter((t) => t.id !== tenant.id);
      this.bumpRevision(state, "tenants", tenant.id);
      this.appendAudit(state, userId, "\u062D\u0630\u0641 \u0645\u0633\u062A\u0623\u062C\u0631", "\u0645\u0633\u062A\u0623\u062C\u0631", tenant.id, `\u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 ${tenant.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/contracts") {
      const user = this.assertModuleAction(state, workspaceId, userId, "contracts", "create", {
        entityType: "LeaseContract",
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        deviceName
      });
      const unitId = String(body.unitId || "");
      const unit = state.units.find((u) => u.id === unitId);
      const propertyId = String(body.propertyId || unit?.propertyId || "");
      if (!propertyId) throw new Error("\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u0627\u0631 \u0627\u0644\u0645\u0631\u062A\u0628\u0637 \u0628\u0627\u0644\u0639\u0642\u062F");
      if (unit && unit.propertyId !== propertyId) {
        throw new Error("\u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0644\u0627 \u062A\u062A\u0628\u0639 \u0644\u0644\u0639\u0642\u0627\u0631 \u0627\u0644\u0645\u062E\u062A\u0627\u0631");
      }
      this.assertPropertyAccess(state, workspaceId, user, propertyId, "\u0625\u0646\u0634\u0627\u0621 \u0639\u0642\u062F", "LeaseContract", propertyId, deviceName);
      const tenantId = String(body.tenantId || "");
      if (tenantId) {
        this.assertTenantAccess(state, workspaceId, user, tenantId, "\u0631\u0628\u0637 \u0645\u0633\u062A\u0623\u062C\u0631 \u0628\u0639\u0642\u062F", deviceName);
      }
      const contract = {
        id: uid("con"),
        internalNumber: String(body.internalNumber || `CNT-${state.contracts.length + 1001}`),
        ejarNumber: String(body.ejarNumber || ""),
        ejarStatus: body.ejarStatus || "\u063A\u064A\u0631 \u0645\u0648\u062B\u0642",
        lifecycleStatus: "\u0646\u0634\u0637",
        propertyId,
        unitId,
        tenantId,
        startDate: String(body.startDate || now.slice(0, 10)),
        endDate: String(body.endDate || now.slice(0, 10)),
        annualRent: Number(body.annualRent || 3e4),
        paymentFrequency: body.paymentFrequency || "\u0634\u0647\u0631\u064A",
        installmentsCount: Number(body.installmentsCount || 12),
        securityDeposit: Number(body.securityDeposit || 2e3),
        officeFee: Number(body.officeFee || 0),
        managementCommissionPercent: Number(body.managementCommissionPercent ?? state.settings.defaultManagementFeePercent ?? 5),
        includedServices: String(body.includedServices || ""),
        version: 1,
        createdBy: userId,
        createdAt: now
      };
      state.contracts.unshift(contract);
      if (unit) {
        unit.status = "\u0645\u0624\u062C\u0631\u0629";
        this.bumpRevision(state, "units", unit.id);
      }
      this.bumpRevision(state, "contracts", contract.id);
      this.appendAudit(state, userId, "\u0625\u0646\u0634\u0627\u0621 \u0639\u0642\u062F", "\u0639\u0642\u062F", contract.id, `\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0639\u0642\u062F ${contract.internalNumber}`, deviceName, contract.propertyId);
      this.persistState(state, workspaceId);
      return { contract, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/payments") {
      const user = this.assertPermission(state, workspaceId, userId, "collect_payments", {
        entityType: "Payment",
        entityId: String(body.contractId || "payment"),
        deviceName
      });
      const contract = state.contracts.find((c) => c.id === body.contractId);
      if (!contract) throw new Error("\u0627\u0644\u0639\u0642\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      this.assertPropertyAccess(state, workspaceId, user, contract.propertyId, "\u062A\u062D\u0635\u064A\u0644 \u062F\u0641\u0639\u0629", "Payment", contract.id, deviceName);
      const amount = Number(body.amount || 0);
      if (amount <= 0) throw new Error("\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631");
      const idempotencyKey = String(body.idempotencyKey || uid("idem"));
      const existing = state.payments.find((p) => p.idempotencyKey === idempotencyKey);
      if (existing) {
        return { payment: existing, duplicate: true, state: this.getStateForUser(state, userId, workspaceId) };
      }
      const refNo = body.referenceNumber ? String(body.referenceNumber).trim() : "";
      if (refNo) {
        const dupRef = state.payments.find(
          (p) => p.contractId === body.contractId && p.referenceNumber === refNo && p.amount === amount && p.status === "\u0645\u0639\u062A\u0645\u062F"
        );
        if (dupRef) {
          return { payment: dupRef, duplicate: true, state: this.getStateForUser(state, userId, workspaceId) };
        }
      }
      state.counters.receipt += 1;
      const allocations = [];
      if ((body.paymentType || "\u0625\u064A\u062C\u0627\u0631") === "\u0625\u064A\u062C\u0627\u0631") {
        let rem = amount;
        const openInsts = state.installments.filter((i) => i.contractId === contract.id && i.remainingAmount > 0 && i.status !== "\u0645\u0644\u063A\u0627\u0629").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        for (const inst of openInsts) {
          if (rem <= 0) break;
          const applied = Math.min(rem, inst.remainingAmount);
          inst.paidAmount = Math.round((inst.paidAmount + applied) * 100) / 100;
          inst.remainingAmount = Math.round((inst.amount - inst.paidAmount) * 100) / 100;
          inst.status = inst.remainingAmount === 0 ? "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" : "\u0645\u062F\u0641\u0648\u0639\u0629 \u062C\u0632\u0626\u064A\u0627\u064B";
          allocations.push({ installmentId: inst.id, amount: applied });
          rem = Math.round((rem - applied) * 100) / 100;
          this.bumpRevision(state, "installments", inst.id);
        }
      }
      const payment = {
        id: uid("pay"),
        receiptNumber: `REC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(state.counters.receipt).padStart(4, "0")}`,
        idempotencyKey,
        contractId: contract.id,
        unitId: contract.unitId,
        propertyId: contract.propertyId,
        tenantId: contract.tenantId,
        allocations,
        amount,
        currency: body.currency || "SAR",
        paymentMethod: body.paymentMethod || "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        paymentType: body.paymentType || "\u0625\u064A\u062C\u0627\u0631",
        referenceNumber: refNo || void 0,
        receivedBy: userId,
        deviceName,
        status: "\u0645\u0639\u062A\u0645\u062F",
        notes: body.notes,
        createdAt: now
      };
      state.payments.unshift(payment);
      if (!state.processedIdempotencyKeys.includes(idempotencyKey)) {
        state.processedIdempotencyKeys.push(idempotencyKey);
      }
      this.bumpRevision(state, "payments", payment.id);
      this.appendAudit(state, userId, "\u062A\u062D\u0635\u064A\u0644 \u062F\u0641\u0639\u0629", "\u062F\u0641\u0639\u0629", payment.id, `\u0633\u0646\u062F ${payment.receiptNumber} \u0628\u0645\u0628\u0644\u063A ${amount}`, deviceName, payment.propertyId);
      this.persistState(state, workspaceId);
      return { payment, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const revPayMatch = /^\/api\/payments\/([^/]+)\/reverse$/.exec(pathname);
    if (method === "POST" && revPayMatch) {
      const user = this.assertPermission(state, workspaceId, userId, "reverse_receipts", {
        entityType: "Payment",
        entityId: revPayMatch[1],
        deviceName
      });
      const orig = state.payments.find((p) => p.id === revPayMatch[1]);
      if (!orig) throw new Error("\u0627\u0644\u0633\u0646\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      this.assertPropertyAccess(state, workspaceId, user, orig.propertyId, "\u0639\u0643\u0633 \u0633\u0646\u062F \u0642\u0628\u0636", "Payment", orig.id, deviceName);
      if (orig.status === "\u0645\u0639\u0643\u0648\u0633") throw new Error("\u062A\u0645 \u0639\u0643\u0633 \u0647\u0630\u0627 \u0627\u0644\u0633\u0646\u062F \u0645\u0633\u0628\u0642\u0627\u064B");
      const todayStr = now.slice(0, 10);
      for (const alloc of orig.allocations || []) {
        const inst = state.installments.find((i) => i.id === alloc.installmentId);
        if (inst) {
          inst.paidAmount = Math.max(0, Math.round((inst.paidAmount - alloc.amount) * 100) / 100);
          inst.remainingAmount = Math.round((inst.amount - inst.paidAmount) * 100) / 100;
          if (inst.paidAmount > 0) {
            inst.status = "\u0645\u062F\u0641\u0648\u0639\u0629 \u062C\u0632\u0626\u064A\u0627\u064B";
          } else {
            inst.status = inst.dueDate < todayStr ? "\u0645\u062A\u0623\u062E\u0631\u0629" : inst.dueDate === todayStr ? "\u0645\u0633\u062A\u062D\u0642\u0629 \u0627\u0644\u064A\u0648\u0645" : "\u0644\u0645 \u062A\u0633\u062A\u062D\u0642";
          }
          this.bumpRevision(state, "installments", inst.id);
        }
      }
      state.counters.receipt += 1;
      orig.status = "\u0645\u0639\u0643\u0648\u0633";
      orig.reversedByReceiptId = `REV-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(state.counters.receipt).padStart(4, "0")}`;
      orig.reversalReason = String(body.reason || "\u0625\u0644\u063A\u0627\u0621 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0633\u0646\u062F");
      this.bumpRevision(state, "payments", orig.id);
      this.appendAudit(state, userId, "\u0639\u0643\u0633 \u0633\u0646\u062F", "\u062F\u0641\u0639\u0629", orig.id, `\u0639\u0643\u0633 \u0627\u0644\u0633\u0646\u062F ${orig.receiptNumber}`, deviceName, orig.propertyId);
      this.persistState(state, workspaceId);
      return { payment: orig, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/expenses") {
      const user = this.assertPermission(state, workspaceId, userId, "create_expense", {
        entityType: "Expense",
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        deviceName
      });
      const propertyId = String(body.propertyId || "");
      if (!propertyId) throw new Error("\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u0627\u0631 \u0644\u0644\u0645\u0635\u0631\u0648\u0641");
      this.assertPropertyAccess(state, workspaceId, user, propertyId, "\u062A\u0633\u062C\u064A\u0644 \u0645\u0635\u0631\u0648\u0641", "Expense", propertyId, deviceName);
      state.counters.expense += 1;
      const expense = {
        id: uid("exp"),
        expenseNumber: `EXP-${String(state.counters.expense).padStart(4, "0")}`,
        date: String(body.date || now.slice(0, 10)),
        category: body.category || "\u0635\u064A\u0627\u0646\u0629",
        propertyId,
        unitId: body.unitId ? String(body.unitId) : void 0,
        vendorId: body.vendorId ? String(body.vendorId) : void 0,
        invoiceNumber: String(body.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`),
        amount: Number(body.amount || 0),
        currency: body.currency || "SAR",
        paymentMethod: body.paymentMethod || "\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u0643\u064A",
        bearer: body.bearer || "\u0627\u0644\u0645\u0627\u0644\u0643",
        approvalStatus: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641",
        notes: body.notes,
        createdBy: userId,
        createdAt: now
      };
      state.expenses.unshift(expense);
      this.bumpRevision(state, "expenses", expense.id);
      this.appendAudit(state, userId, "\u062A\u0633\u062C\u064A\u0644 \u0645\u0635\u0631\u0648\u0641", "\u0645\u0635\u0631\u0648\u0641", expense.id, `\u062A\u0633\u062C\u064A\u0644 \u0645\u0635\u0631\u0648\u0641 ${expense.expenseNumber}`, deviceName, expense.propertyId);
      this.persistState(state, workspaceId);
      return { expense, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const expPatchMatch = /^\/api\/expenses\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && expPatchMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, "expenses", "edit", {
        entityType: "Expense",
        entityId: expPatchMatch[1],
        deviceName
      });
      const expense = state.expenses.find((e) => e.id === expPatchMatch[1]);
      if (!expense) throw new Error("\u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      this.assertPropertyAccess(state, workspaceId, user, expense.propertyId, "\u062A\u0639\u062F\u064A\u0644 \u0645\u0635\u0631\u0648\u0641", "Expense", expense.id, deviceName);
      Object.assign(expense, body);
      this.bumpRevision(state, "expenses", expense.id);
      this.appendAudit(state, userId, "\u062A\u0639\u062F\u064A\u0644 \u0645\u0635\u0631\u0648\u0641", "\u0645\u0635\u0631\u0648\u0641", expense.id, `\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0635\u0631\u0648\u0641 ${expense.expenseNumber}`, deviceName, expense.propertyId);
      this.persistState(state, workspaceId);
      return { expense, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const expDecisionMatch = /^\/api\/expenses\/([^/]+)\/decision$/.exec(pathname);
    if (method === "POST" && expDecisionMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, "expenses", "approve", {
        entityType: "Expense",
        entityId: expDecisionMatch[1],
        deviceName
      });
      const expense = state.expenses.find((e) => e.id === expDecisionMatch[1]);
      if (!expense) throw new Error("\u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      this.assertPropertyAccess(state, workspaceId, user, expense.propertyId, "\u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641", "Expense", expense.id, deviceName);
      if (expense.createdBy === userId && user.role !== "sys_owner") {
        const msg = "\u0641\u0635\u0644 \u0627\u0644\u0645\u0647\u0627\u0645 (SoD): \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641 \u0642\u0645\u062A \u0628\u062A\u0633\u062C\u064A\u0644\u0647 \u0628\u0646\u0641\u0633\u0643";
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0627\u0639\u062A\u0645\u0627\u062F \u0630\u0627\u062A\u064A \u0644\u0644\u0645\u0635\u0631\u0648\u0641", "Expense", expense.id, msg, { propertyId: expense.propertyId, deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const decision = body.decision === "reject" ? "reject" : "approve";
      const oldStatus = expense.approvalStatus;
      if (decision === "reject") {
        expense.approvalStatus = "\u0645\u0631\u0641\u0648\u0636";
        expense.rejectionReason = String(body.reason || "\u0631\u0641\u0636 \u0625\u062F\u0627\u0631\u064A");
      } else if (expense.approvalStatus === "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0634\u0631\u0641") {
        if (!this.hasPermission(state, userId, "approve_expense_supervisor") && !this.hasPermission(state, userId, "approve_expense_manager") && user.role !== "sys_owner") {
          throw new WorkerPermissionDeniedError("\u062A\u062D\u062A\u0627\u062C \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0634\u0631\u0641 \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629");
        }
        expense.approvedBySupervisor = user.id;
        expense.approvalStatus = expense.amount > 5e3 ? "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u062F\u064A\u0631" : "\u0645\u0639\u062A\u0645\u062F";
      } else if (expense.approvalStatus === "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u062F\u064A\u0631") {
        if (!this.hasPermission(state, userId, "approve_expense_manager") && user.role !== "sys_owner") {
          throw new WorkerPermissionDeniedError("\u062A\u062D\u062A\u0627\u062C \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629");
        }
        expense.approvedByManager = user.id;
        expense.approvalStatus = expense.amount > 2e4 ? "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0627\u0644\u0643" : "\u0645\u0639\u062A\u0645\u062F";
      } else if (expense.approvalStatus === "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0627\u0644\u0643") {
        if (user.role !== "owner" && user.role !== "sys_owner" && user.role !== "gm") {
          throw new WorkerPermissionDeniedError("\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u0644\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649 \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0645\u0627\u0644\u0643 \u0623\u0648 \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
        }
        expense.approvedByOwner = user.id;
        expense.approvalStatus = "\u0645\u0639\u062A\u0645\u062F";
      }
      this.bumpRevision(state, "expenses", expense.id);
      this.appendAudit(state, userId, "\u0642\u0631\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0635\u0631\u0648\u0641", "\u0645\u0635\u0631\u0648\u0641", expense.id, `\u062A\u062D\u062F\u064A\u062B ${expense.expenseNumber} \u0645\u0646 ${oldStatus} \u0625\u0644\u0649 ${expense.approvalStatus}`, deviceName, expense.propertyId);
      this.persistState(state, workspaceId);
      return { expense, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/tickets") {
      const user = this.assertModuleAction(state, workspaceId, userId, "maintenance", "create", {
        entityType: "MaintenanceTicket",
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        deviceName
      });
      const propertyId = String(body.propertyId || "");
      if (!propertyId) throw new Error("\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0639\u0642\u0627\u0631 \u0644\u0628\u0644\u0627\u063A \u0627\u0644\u0635\u064A\u0627\u0646\u0629");
      this.assertPropertyAccess(state, workspaceId, user, propertyId, "\u0641\u062A\u062D \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", "MaintenanceTicket", propertyId, deviceName);
      state.counters.ticket += 1;
      const ticket = {
        id: uid("tkt"),
        ticketNumber: `MNT-${String(state.counters.ticket).padStart(4, "0")}`,
        propertyId,
        unitId: String(body.unitId || ""),
        source: body.source || "\u0627\u0644\u0645\u0634\u0631\u0641",
        category: String(body.category || "\u0623\u062E\u0631\u0649"),
        priority: body.priority || "\u0645\u062A\u0648\u0633\u0637",
        title: String(body.title || "\u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629"),
        description: String(body.description || ""),
        estimatedCost: Number(body.estimatedCost || 0),
        actualCost: 0,
        status: "\u062C\u062F\u064A\u062F",
        createdBy: userId,
        createdAt: now,
        updatedAt: now
      };
      state.tickets.unshift(ticket);
      this.bumpRevision(state, "tickets", ticket.id);
      this.appendAudit(state, userId, "\u0641\u062A\u062D \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", "\u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", ticket.id, `\u0641\u062A\u062D \u0627\u0644\u0628\u0644\u0627\u063A ${ticket.ticketNumber}`, deviceName, ticket.propertyId);
      this.persistState(state, workspaceId);
      return { ticket, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const tktMatch = /^\/api\/tickets\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && tktMatch) {
      const user = this.getActingUser(state, userId);
      if (!this.hasPermission(state, userId, "manage_maintenance") && !this.hasPermission(state, userId, "execute_maintenance")) {
        const msg = "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u0639\u062F\u064A\u0644 \u0628\u0644\u0627\u063A\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629";
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u062A\u0639\u062F\u064A\u0644 \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", "MaintenanceTicket", tktMatch[1], msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const ticket = state.tickets.find((t) => t.id === tktMatch[1]);
      if (!ticket) throw new Error("\u0628\u0644\u0627\u063A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      this.assertPropertyAccess(state, workspaceId, user, ticket.propertyId, "\u062A\u0639\u062F\u064A\u0644 \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", "MaintenanceTicket", ticket.id, deviceName);
      Object.assign(ticket, body, { updatedAt: now });
      this.bumpRevision(state, "tickets", ticket.id);
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", "\u0628\u0644\u0627\u063A \u0635\u064A\u0627\u0646\u0629", ticket.id, `\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u0644\u0627\u063A ${ticket.ticketNumber}`, deviceName, ticket.propertyId);
      this.persistState(state, workspaceId);
      return { ticket, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/tasks") {
      const user = this.assertPermission(state, workspaceId, userId, "manage_tasks", {
        entityType: "TaskItem",
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        deviceName
      });
      if (body.propertyId) {
        this.assertPropertyAccess(state, workspaceId, user, String(body.propertyId), "\u0625\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629", "TaskItem", String(body.propertyId), deviceName);
      } else if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        const msg = "\u0631\u0641\u0636 \u0625\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629: \u062D\u0633\u0627\u0628\u0643 \u0645\u0642\u064A\u062F \u0628\u0640 0 \u0639\u0642\u0627\u0631";
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0625\u0636\u0627\u0641\u0629 \u0645\u0647\u0645\u0629 \u0628\u0645\u0635\u0641\u0648\u0641\u0629 \u0641\u0627\u0631\u063A\u0629", "TaskItem", "create", msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const task = {
        id: uid("tsk"),
        title: String(body.title || "\u0645\u0647\u0645\u0629 \u062C\u062F\u064A\u062F\u0629"),
        description: String(body.description || ""),
        type: String(body.type || "\u0645\u062A\u0627\u0628\u0639\u0629"),
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        unitId: body.unitId ? String(body.unitId) : void 0,
        priority: body.priority || "\u0645\u062A\u0648\u0633\u0637",
        assignedTo: String(body.assignedTo || userId),
        createdBy: userId,
        dueDate: String(body.dueDate || now.slice(0, 10)),
        status: "\u062C\u062F\u064A\u062F\u0629",
        checklist: Array.isArray(body.checklist) ? body.checklist : [],
        comments: [],
        createdAt: now
      };
      state.tasks.unshift(task);
      this.bumpRevision(state, "tasks", task.id);
      this.persistState(state, workspaceId);
      return { task, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const tskMatch = /^\/api\/tasks\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && tskMatch) {
      const user = this.assertPermission(state, workspaceId, userId, "manage_tasks", {
        entityType: "TaskItem",
        entityId: tskMatch[1],
        deviceName
      });
      const task = state.tasks.find((t) => t.id === tskMatch[1]);
      if (!task) throw new Error("\u0627\u0644\u0645\u0647\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
      if (task.propertyId) {
        this.assertPropertyAccess(state, workspaceId, user, task.propertyId, "\u062A\u062D\u062F\u064A\u062B \u0645\u0647\u0645\u0629", "TaskItem", task.id, deviceName);
      } else if (!userHasAllPropertiesAccess(state, user) && task.assignedTo !== user.id) {
        throw new WorkerPermissionDeniedError("\u0631\u0641\u0636 \u062A\u062D\u062F\u064A\u062B \u0645\u0647\u0645\u0629 \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u062D\u0633\u0627\u0628\u0643");
      }
      Object.assign(task, body);
      this.bumpRevision(state, "tasks", task.id);
      this.persistState(state, workspaceId);
      return { task, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/documents") {
      const user = this.assertModuleAction(state, workspaceId, userId, "documents", "create", {
        entityType: "Document",
        deviceName
      });
      if (body.propertyId) {
        this.assertPropertyAccess(state, workspaceId, user, String(body.propertyId), "\u0623\u0631\u0634\u0641\u0629 \u0645\u0633\u062A\u0646\u062F", "Document", String(body.propertyId), deviceName);
      } else if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        throw new WorkerPermissionDeniedError("\u0631\u0641\u0636 \u0631\u0641\u0639 \u0645\u0633\u062A\u0646\u062F: \u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0642\u0627\u0631\u0627\u062A \u0645\u0635\u0631\u062D \u0628\u0647\u0627 \u0641\u064A \u062D\u0633\u0627\u0628\u0643");
      }
      const doc = {
        id: uid("doc"),
        title: String(body.title || "\u0645\u0633\u062A\u0646\u062F"),
        category: body.category || "\u0645\u0631\u0627\u0633\u0644\u0627\u062A \u0627\u0644\u0634\u0631\u0643\u0629",
        relatedType: body.relatedType || body.relatedEntityType || (body.propertyId ? "\u0639\u0642\u0627\u0631" : "\u0634\u0631\u0643\u0629"),
        relatedId: String(body.relatedId || body.relatedEntityId || body.propertyId || ""),
        propertyId: body.propertyId ? String(body.propertyId) : void 0,
        relatedEntityType: body.relatedEntityType ? String(body.relatedEntityType) : void 0,
        relatedEntityId: body.relatedEntityId ? String(body.relatedEntityId) : void 0,
        fileName: String(body.fileName || "file.pdf"),
        fileType: String(body.fileType || "application/pdf"),
        fileSizeKb: Number(body.fileSizeKb || 128),
        version: Number(body.version || 1),
        dataUrl: body.dataUrl ? String(body.dataUrl) : void 0,
        uploadedBy: userId,
        createdAt: now
      };
      state.documents.unshift(doc);
      this.bumpRevision(state, "documents", doc.id);
      this.appendAudit(state, userId, "\u0623\u0631\u0634\u0641\u0629 \u0645\u0633\u062A\u0646\u062F", "\u0645\u0633\u062A\u0646\u062F", doc.id, `\u0623\u0631\u0634\u0641\u0629 ${doc.title}`, deviceName, doc.propertyId);
      this.persistState(state, workspaceId);
      return { doc, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/vendors") {
      const user = this.assertPermission(state, workspaceId, userId, "manage_maintenance", {
        entityType: "Vendor",
        deviceName
      });
      if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        throw new WorkerPermissionDeniedError("\u0631\u0641\u0636 \u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0631\u062F: \u062D\u0633\u0627\u0628\u0643 \u0645\u0642\u064A\u062F \u0628\u0640 0 \u0639\u0642\u0627\u0631");
      }
      const vendor = {
        id: uid("vnd"),
        nameAr: String(body.nameAr || "\u0645\u0648\u0631\u062F \u062C\u062F\u064A\u062F"),
        nameEn: String(body.nameEn || body.nameAr || "New Vendor"),
        crNumber: String(body.crNumber || ""),
        category: String(body.category || body.specialty || "\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u0645\u0629"),
        phone: String(body.phone || ""),
        email: String(body.email || ""),
        rating: Number(body.rating ?? 5),
        active: body.active !== void 0 ? Boolean(body.active) : true
      };
      state.vendors.unshift(vendor);
      this.bumpRevision(state, "vendors", vendor.id);
      this.persistState(state, workspaceId);
      return { vendor, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/templates") {
      const user = this.getActingUser(state, userId);
      if (!this.hasPermission(state, userId, "manage_users") && !this.hasPermission(state, userId, "manage_contracts") && !this.hasPermission(state, userId, "manage_maintenance")) {
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u0625\u0646\u0634\u0627\u0621 \u0642\u0627\u0644\u0628 \u062A\u0648\u0627\u0635\u0644", "Template", "create", "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0646\u0634\u0627\u0621 \u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", { deviceName });
        throw new WorkerPermissionDeniedError("\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0646\u0634\u0627\u0621 \u0642\u0648\u0627\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644");
      }
      const template = {
        id: uid("tpl"),
        name: String(body.name || "\u0642\u0627\u0644\u0628 \u062C\u062F\u064A\u062F"),
        category: body.category || "custom",
        channel: body.channel || "whatsapp",
        language: body.language || "ar",
        contentAr: String(body.contentAr || ""),
        contentEn: body.contentEn ? String(body.contentEn) : void 0,
        usageCount: 0,
        createdBy: userId,
        updatedAt: now
      };
      state.communicationTemplates = [template, ...state.communicationTemplates || []];
      this.bumpRevision(state, "communicationTemplates", template.id);
      this.persistState(state, workspaceId);
      return { template, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/notifications/read") {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isReadBy: n.isReadBy.includes(userId) ? n.isReadBy : [...n.isReadBy, userId]
      }));
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/permissions/toggle") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "RolePermissions",
        entityId: String(body.role || "role"),
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u062A\u0639\u062F\u064A\u0644 \u0645\u0635\u0641\u0648\u0641\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0645\u062D\u0635\u0648\u0631 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645");
      }
      const role = body.role;
      const perm = body.permission;
      if (role === "sys_owner") {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0642\u0644\u064A\u0635 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
      }
      if (actorUser.role === "gm" && role === "gm") {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u062F\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u062F\u0648\u0631\u0643 \u0628\u0646\u0641\u0633\u0643");
      }
      const current = state.rolePermissions[role] || [];
      state.rolePermissions[role] = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u062F\u0648\u0631", "\u0623\u062F\u0648\u0627\u0631 \u0648\u0635\u0644\u0627\u062D\u064A\u0627\u062A", role, `\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 ${perm} \u0644\u0644\u062F\u0648\u0631 ${role}`, deviceName);
      this.persistState(state, workspaceId);
      return { rolePermissions: state.rolePermissions, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/team/users") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "create", {
        entityType: "StaffUser",
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0645\u062A\u0627\u062D\u0629 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 \u0641\u0642\u0637");
      }
      const targetRole = body.role || "leasing";
      if (actorUser.role !== "sys_owner" && (targetRole === "sys_owner" || targetRole === "gm")) {
        throw new WorkerPermissionDeniedError("\u062A\u0639\u064A\u064A\u0646 \u0645\u0627\u0644\u0643 \u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0634\u0631\u0643\u0629 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
      }
      const tmpl = ROLE_TEMPLATES.find((t) => t.key === targetRole);
      const customRole = body.customRoleId ? (state.customRoles || []).find((r) => r.id === body.customRoleId) : void 0;
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) throw new Error("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628");
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        throw new Error("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u062D\u0633\u0627\u0628 \u0622\u062E\u0631");
      }
      const allowedProps = this.normalizeAllowedPropertiesInput(body.allowedPropertyIds);
      const newUser = {
        id: uid("usr"),
        companyId: actorUser.role === "sys_owner" ? String(body.companyId || actorUser.companyId || `comp-${workspaceId}`) : actorUser.companyId,
        nameAr: String(body.nameAr || "\u0645\u0648\u0638\u0641 \u062C\u062F\u064A\u062F").trim(),
        nameEn: String(body.nameEn || body.nameAr || "New Staff").trim(),
        email,
        phone: String(body.phone || "").trim(),
        role: targetRole,
        customRoleId: customRole?.id || (body.customRoleId ? String(body.customRoleId) : void 0),
        customModulePermissions: body.customModulePermissions ?? body.customPermissions,
        roleLabelAr: customRole?.nameAr || tmpl?.labelAr || "\u0645\u0648\u0638\u0641",
        roleLabelEn: customRole?.nameEn || tmpl?.labelEn || "Staff",
        approvalLimitSar: Number(body.approvalLimitSar ?? tmpl?.defaultLimitSar ?? 0),
        allowedPropertyIds: allowedProps,
        deviceName: String(body.deviceName || "Web Terminal"),
        lastActiveAt: now,
        statusState: "\u0645\u062A\u0635\u0644",
        active: true,
        accountStatus: "\u0646\u0634\u0637",
        createdAt: now
      };
      state.users.push(newUser);
      const password = String(body.password || "").trim() || randomHexWeb(18);
      const pin = String(body.pin || "").trim();
      const pwHash = await hashSecretWeb(password);
      const pinHash = /^\d{4,6}$/.test(pin) ? await hashSecretWeb(pin) : null;
      this.ctx.storage.sql.exec(
        "INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)",
        newUser.id,
        pwHash,
        pinHash,
        now
      );
      this.bumpRevision(state, "users", newUser.id);
      this.appendAudit(state, userId, "\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0638\u0641 \u062C\u062F\u064A\u062F", "\u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644", newUser.id, `\u0625\u0636\u0627\u0641\u0629 ${newUser.nameAr} (${newUser.role})`, deviceName);
      this.persistState(state, workspaceId);
      return { user: sanitizeUserForClient(newUser), state: this.getStateForUser(state, userId, workspaceId) };
    }
    const teamUserMatch = /^\/api\/team\/users\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && teamUserMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "edit", {
        entityType: "StaffUser",
        entityId: teamUserMatch[1],
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u062A\u0639\u062F\u064A\u0644 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629");
      }
      const target = state.users.find((u) => u.id === teamUserMatch[1]);
      if (!target) throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      if (actorUser.role !== "sys_owner" && (target.role === "sys_owner" || target.role === "gm")) {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u062F\u064A\u0644 \u062D\u0633\u0627\u0628 \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629");
      }
      if (actorUser.role === "gm" && actorUser.companyId && target.companyId && actorUser.companyId !== target.companyId) {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u062F\u064A\u0644 \u0645\u0648\u0638\u0641 \u064A\u062A\u0628\u0639 \u0634\u0631\u0643\u0629 \u0623\u062E\u0631\u0649");
      }
      if (target.id === actorUser.id && (body.role !== void 0 || body.customRoleId !== void 0 || body.customModulePermissions !== void 0 || body.customPermissions !== void 0 || body.active === false)) {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u062F\u064A\u0644 \u062F\u0648\u0631\u0643 \u0623\u0648 \u0635\u0644\u0627\u062D\u064A\u0627\u062A\u0643 \u0627\u0644\u062E\u0627\u0635\u0629");
      }
      const prevTargetSnapshot = {
        ...target,
        allowedPropertyIds: Array.isArray(target.allowedPropertyIds) ? [...target.allowedPropertyIds] : void 0
      };
      const prevRole = target.role;
      const nextRole = body.role ?? target.role;
      const nextCustomRoleId = body.customRoleId !== void 0 ? body.customRoleId ? String(body.customRoleId) : void 0 : target.customRoleId;
      const nextScope = body.allowedPropertyIds !== void 0 ? this.normalizeAllowedPropertiesInput(body.allowedPropertyIds) : target.allowedPropertyIds;
      const nextActive = body.active !== void 0 ? Boolean(body.active) : target.active;
      const nextStatus = body.accountStatus || (nextActive ? "\u0646\u0634\u0637" : "\u0645\u0648\u0642\u0648\u0641");
      if (actorUser.role !== "sys_owner" && (nextRole === "sys_owner" || nextRole === "gm")) {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0644\u0643 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u0631\u0642\u064A\u0629 \u0645\u0648\u0638\u0641 \u0644\u062F\u0648\u0631 \u0642\u064A\u0627\u062F\u064A");
      }
      target.role = nextRole;
      target.customRoleId = nextCustomRoleId;
      if (body.customModulePermissions !== void 0 || body.customPermissions !== void 0) {
        target.customModulePermissions = body.customModulePermissions ?? body.customPermissions;
      }
      if (body.allowedPropertyIds !== void 0) target.allowedPropertyIds = nextScope;
      if (body.approvalLimitSar !== void 0) target.approvalLimitSar = Number(body.approvalLimitSar);
      if (body.nameAr !== void 0) target.nameAr = String(body.nameAr);
      if (body.nameEn !== void 0) target.nameEn = String(body.nameEn);
      target.active = nextActive && nextStatus === "\u0646\u0634\u0637";
      target.accountStatus = nextStatus;
      const roleChanged = isRoleDowngrade(prevRole, nextRole) || prevRole !== nextRole;
      const scopeShrank = isPropertyScopeShrink(state, prevTargetSnapshot, state, target);
      const suspended = !target.active;
      if (suspended || roleChanged || scopeShrank) {
        this.revokeUserSessions(
          target.id,
          workspaceId,
          suspended ? "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0646 \u0642\u0650\u0628\u0644 \u0627\u0644\u0625\u062F\u0627\u0631\u0629" : "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0623\u0648 \u0646\u0637\u0627\u0642 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u2014 \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644"
        );
      }
      this.bumpRevision(state, "users", target.id);
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0645\u0644\u0641 \u0645\u0648\u0638\u0641", "\u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644", target.id, `\u062A\u062D\u062F\u064A\u062B ${target.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { user: sanitizeUserForClient(target), state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "DELETE" && teamUserMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "delete_void", {
        entityType: "StaffUser",
        entityId: teamUserMatch[1],
        deviceName
      });
      if (actorUser.role !== "sys_owner") {
        throw new WorkerPermissionDeniedError("\u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0641\u0642\u0637");
      }
      const target = state.users.find((u) => u.id === teamUserMatch[1]);
      if (!target) throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      if (target.id === actorUser.id) throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062D\u0627\u0644\u064A");
      state.users = state.users.filter((u) => u.id !== target.id);
      this.ctx.storage.sql.exec("DELETE FROM user_credentials WHERE user_id = ?", target.id);
      this.revokeUserSessions(target.id, workspaceId, "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0648\u0627\u0633\u0637\u0629 \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
      this.appendAudit(state, userId, "\u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0645\u0648\u0638\u0641", "\u0641\u0631\u064A\u0642 \u0627\u0644\u0639\u0645\u0644", target.id, `\u062D\u0630\u0641 ${target.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/roles") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "CustomRole",
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629");
      }
      const roleDef = {
        id: uid("role"),
        companyId: String(body.companyId || actorUser.companyId || state.companies?.[0]?.id || `comp-${workspaceId}`),
        nameAr: String(body.nameAr || "\u062F\u0648\u0631 \u0645\u062E\u0635\u0635"),
        nameEn: String(body.nameEn || body.nameAr || "Custom Role"),
        descriptionAr: String(body.descriptionAr || body.descAr || ""),
        baseRoleKey: body.baseRoleKey || body.baseRole || "leasing",
        legacyPermissions: Array.isArray(body.legacyPermissions) ? body.legacyPermissions : [],
        modulePermissions: body.modulePermissions || {},
        createdAt: now,
        updatedAt: now,
        createdBy: userId
      };
      if (!state.customRoles) state.customRoles = [];
      state.customRoles.push(roleDef);
      this.bumpRevision(state, "customRoles", roleDef.id);
      this.appendAudit(state, userId, "\u0625\u0646\u0634\u0627\u0621 \u062F\u0648\u0631 \u0645\u062E\u0635\u0635", "\u0623\u062F\u0648\u0627\u0631 \u0648\u0635\u0644\u0627\u062D\u064A\u0627\u062A", roleDef.id, `\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062F\u0648\u0631 ${roleDef.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { role: roleDef, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const roleItemMatch = /^\/api\/roles\/([^/]+)$/.exec(pathname);
    if (method === "PATCH" && roleItemMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "CustomRole",
        entityId: roleItemMatch[1],
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629");
      }
      const roleDef = (state.customRoles || []).find((r) => r.id === roleItemMatch[1]);
      if (!roleDef) throw new Error("\u0627\u0644\u062F\u0648\u0631 \u0627\u0644\u0645\u062E\u0635\u0635 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      Object.assign(roleDef, {
        nameAr: body.nameAr ?? roleDef.nameAr,
        nameEn: body.nameEn ?? roleDef.nameEn,
        descriptionAr: body.descriptionAr ?? body.descAr ?? roleDef.descriptionAr,
        modulePermissions: body.modulePermissions ?? roleDef.modulePermissions,
        legacyPermissions: Array.isArray(body.legacyPermissions) ? body.legacyPermissions : roleDef.legacyPermissions,
        updatedAt: now
      });
      this.bumpRevision(state, "customRoles", roleDef.id);
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u062F\u0648\u0631 \u0645\u062E\u0635\u0635", "\u0623\u062F\u0648\u0627\u0631 \u0648\u0635\u0644\u0627\u062D\u064A\u0627\u062A", roleDef.id, `\u062A\u062D\u062F\u064A\u062B ${roleDef.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { role: roleDef, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "DELETE" && roleItemMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "CustomRole",
        entityId: roleItemMatch[1],
        deviceName
      });
      if (actorUser.role !== "sys_owner") {
        throw new WorkerPermissionDeniedError("\u062D\u0630\u0641 \u0627\u0644\u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
      }
      state.customRoles = (state.customRoles || []).filter((r) => r.id !== roleItemMatch[1]);
      this.appendAudit(state, userId, "\u062D\u0630\u0641 \u062F\u0648\u0631 \u0645\u062E\u0635\u0635", "\u0623\u062F\u0648\u0627\u0631 \u0648\u0635\u0644\u0627\u062D\u064A\u0627\u062A", roleItemMatch[1], "\u062D\u0630\u0641 \u062F\u0648\u0631 \u0645\u062E\u0635\u0635", deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/roles/module-matrix") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "RoleMatrix",
        entityId: String(body.role || ""),
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u062A\u0639\u062F\u064A\u0644 \u0645\u0635\u0641\u0648\u0641\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629");
      }
      const targetRole = body.role;
      if (targetRole === "sys_owner") {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0639\u062F\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
      }
      if (actorUser.role === "gm" && targetRole === "gm") {
        throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u062F\u064A\u0644 \u0645\u0635\u0641\u0648\u0641\u0629 \u062F\u0648\u0631\u0643 \u0628\u0646\u0641\u0633\u0643");
      }
      if (!state.roleModulePermissions) state.roleModulePermissions = buildAllDefaultRoleModulePermissions();
      state.roleModulePermissions[targetRole] = body.modulePermissions || {};
      state.rolePermissions[targetRole] = deriveLegacyPermissionsFromModules(body.modulePermissions || {});
      this.appendAudit(state, userId, "\u062A\u062D\u062F\u064A\u062B \u0645\u0635\u0641\u0648\u0641\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A", "\u0623\u062F\u0648\u0627\u0631 \u0648\u0635\u0644\u0627\u062D\u064A\u0627\u062A", targetRole, `\u062A\u062D\u062F\u064A\u062B \u0645\u0635\u0641\u0648\u0641\u0629 ${targetRole}`, deviceName);
      this.persistState(state, workspaceId);
      return { roleModulePermissions: state.roleModulePermissions, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/team/sessions/terminate") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "StaffSession",
        deviceName
      });
      if (actorUser.role !== "sys_owner" && actorUser.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0639\u0646 \u0628\u064F\u0639\u062F \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629");
      }
      const targetUserId = body.userId ? String(body.userId) : void 0;
      const targetSessionId = body.sessionId ? String(body.sessionId) : void 0;
      let terminatedCount = 0;
      if (targetUserId) {
        const target = state.users.find((u) => u.id === targetUserId);
        if (!target) throw new Error("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
        if (actorUser.role === "gm" && (target.role === "sys_owner" || target.role === "gm")) {
          throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0627\u062A \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0645\u062F\u064A\u0631 \u0634\u0631\u0643\u0629");
        }
        if (actorUser.role === "gm" && actorUser.companyId && target.companyId && actorUser.companyId !== target.companyId) {
          throw new WorkerPermissionDeniedError("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0627\u062A \u0645\u0648\u0638\u0641 \u064A\u062A\u0628\u0639 \u0634\u0631\u0643\u0629 \u0623\u062E\u0631\u0649");
        }
        if (!targetSessionId) {
          terminatedCount = this.revokeUserSessions(targetUserId, workspaceId, String(body.reason || "\u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0629 \u0625\u062F\u0627\u0631\u064A \u0639\u0646 \u0628\u064F\u0639\u062F"));
        } else {
          this.ctx.storage.sql.exec("UPDATE sessions SET revoked = 1 WHERE user_id = ? AND token_id = ?", targetUserId, targetSessionId);
          terminatedCount = this.disconnectUserWebSockets(targetUserId, workspaceId, String(body.reason || "\u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0629 \u0625\u062F\u0627\u0631\u064A \u0639\u0646 \u0628\u064F\u0639\u062F"), targetSessionId);
        }
      }
      this.appendAudit(state, userId, "\u0625\u0646\u0647\u0627\u0621 \u062C\u0644\u0633\u0627\u062A \u0639\u0646 \u0628\u064F\u0639\u062F", "\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646", targetUserId || targetSessionId || "session", `\u0625\u0646\u0647\u0627\u0621 ${terminatedCount} \u062C\u0644\u0633\u0629`, deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, terminatedCount, state: this.getStateForUser(state, userId, workspaceId) };
    }
    const resolveConflictMatch = /^\/api\/(?:team|sync)\/conflicts\/([^/]+)\/resolve$/.exec(pathname);
    if (method === "POST" && resolveConflictMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, "team", "manage", {
        entityType: "SyncConflict",
        entityId: resolveConflictMatch[1],
        deviceName
      });
      if (user.role !== "sys_owner" && user.role !== "gm") {
        throw new WorkerPermissionDeniedError("\u0627\u0639\u062A\u0645\u0627\u062F \u062D\u0644 \u062A\u0639\u0627\u0631\u0636\u0627\u062A \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 \u0645\u062A\u0627\u062D \u0641\u0642\u0637 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0623\u0648 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645");
      }
      const cnf = (state.syncConflicts || []).find((c) => c.id === resolveConflictMatch[1]);
      if (!cnf) throw new Error("\u0633\u062C\u0644 \u0627\u0644\u062A\u0639\u0627\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      const resolution = body.resolution === "\u062A\u0645 \u0627\u0644\u0625\u0628\u0642\u0627\u0621 \u0639\u0644\u0649 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629" || body.choice === "first" ? "\u062A\u0645 \u0627\u0644\u0625\u0628\u0642\u0627\u0621 \u0639\u0644\u0649 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629" : "\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u062D\u062F\u062B";
      cnf.status = resolution;
      cnf.resolvedBy = user.nameAr || userId;
      cnf.resolvedAt = now;
      this.appendAudit(state, userId, "\u062D\u0644 \u062A\u0639\u0627\u0631\u0636 \u0645\u0632\u0627\u0645\u0646\u0629", "\u0646\u0638\u0627\u0645", cnf.id, `\u0645\u0639\u0627\u0644\u062C\u0629 \u062A\u0639\u0627\u0631\u0636 ${cnf.entityLabel}`, deviceName);
      this.persistState(state, workspaceId);
      return { conflict: cnf, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === "POST" && pathname === "/api/workspace/reset-fresh") {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, "settings", "manage", {
        entityType: "WorkspaceReset",
        deviceName
      });
      if (actorUser.role !== "sys_owner") {
        throw new WorkerPermissionDeniedError("\u0625\u0639\u0627\u062F\u0629 \u062A\u0647\u064A\u0626\u0629 \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u062D\u0635\u0631\u064A\u0629 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645 \u0641\u0642\u0637");
      }
      state.properties = [];
      state.units = [];
      state.tenants = [];
      state.leads = [];
      state.contracts = [];
      state.installments = [];
      state.payments = [];
      state.expenses = [];
      state.tickets = [];
      state.tasks = [];
      state.documents = [];
      this.appendAudit(state, userId, "\u062A\u0647\u064A\u0626\u0629 \u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644 \u0646\u0638\u064A\u0641\u0629", "\u0627\u0644\u0646\u0638\u0627\u0645", "workspace-reset", "\u0645\u0633\u062D \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0645\u0639 \u0627\u0644\u0625\u0628\u0642\u0627\u0621 \u0639\u0644\u0649 \u0633\u062C\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642", deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }
    throw new Error(`\u0645\u0633\u0627\u0631 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645 \u0628\u0639\u062F \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645 \u0627\u0644\u0633\u062D\u0627\u0628\u064A: ${method} ${pathname}`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const workspaceId = resolveRequestWorkspace(request);
    const state = await this.ensureBootstrapped(workspaceId);
    const secureReq = isSecureRequest(request);
    if (pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket upgrade", { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const actor2 = await this.resolveActor(request, state, workspaceId);
      const attachment = {
        sessionId: actor2?.sessionId || uid("ws"),
        userId: actor2?.userId || "",
        workspaceId,
        authenticated: Boolean(actor2),
        deviceName: actor2?.deviceName || "Web Terminal",
        connectedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment(attachment);
      if (attachment.authenticated && attachment.userId) {
        server.send(
          JSON.stringify({
            type: "state:init",
            state: this.getStateForUser(state, attachment.userId, workspaceId),
            presence: this.getPresenceList(state)
          })
        );
      }
      return new Response(null, { status: 101, webSocket: client });
    }
    if (pathname === "/api/health") {
      const entitiesRow = this.ctx.storage.sql.exec("SELECT COUNT(*) as c FROM entities").toArray()[0];
      const opsRow = this.ctx.storage.sql.exec("SELECT COUNT(*) as c FROM operations_log").toArray()[0];
      return jsonResponse({
        ok: true,
        runtime: "cloudflare-workers-durable-objects",
        storageEngine: "do-sqlite-normalized",
        workspaceId,
        entitiesCount: entitiesRow?.c || 0,
        operationsCount: opsRow?.c || 0,
        lastUpdatedAt: state.lastUpdatedAt,
        syncRevision: state.syncRevision || 1
      });
    }
    if (pathname === "/api/workspaces/provision" && request.method === "POST") {
      if (workspaceId === "default" || state.users.length > 0) {
        return jsonResponse(
          { error: "\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u0647\u0630\u0647 \u0645\u0641\u0639\u0651\u0644\u0629 \u0645\u0633\u0628\u0642\u0627\u064B \u2014 \u0627\u062E\u062A\u0631 \u0645\u0639\u0631\u0651\u0641 \u0634\u0631\u0643\u0629 \u0645\u062E\u062A\u0644\u0641\u0627\u064B \u0623\u0648 \u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" },
          409
        );
      }
      const body = await request.json().catch(() => ({}));
      const companyNameAr = String(body.companyNameAr || "").trim();
      const companyNameEn = String(body.companyNameEn || companyNameAr || "AqarPlus Workspace").trim();
      const adminNameAr = String(body.adminNameAr || "").trim();
      const adminEmail = String(body.adminEmail || "").trim().toLowerCase();
      const adminPhone = String(body.adminPhone || "").trim();
      const password = String(body.password || "");
      const pin = String(body.pin || "").trim();
      const appType = body.appType === "desktop" ? "desktop" : "web";
      if (!companyNameAr || !adminNameAr || !adminEmail || password.length < 8) {
        return jsonResponse(
          { error: "\u064A\u0644\u0632\u0645 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629\u060C \u0648\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u064A\u0631\u060C \u0648\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u060C \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0642\u0648\u064A\u0629 \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 8 \u0623\u062D\u0631\u0641" },
          400
        );
      }
      if (pin && !/^\d{4,6}$/.test(pin)) {
        return jsonResponse({ error: "\u0631\u0645\u0632 PIN \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 4 \u0625\u0644\u0649 6 \u0623\u0631\u0642\u0627\u0645 \u0641\u0642\u0637" }, 400);
      }
      const fresh = this.createEmptyWorkspaceSeed(workspaceId, companyNameAr, companyNameEn);
      const adminId = `usr-${workspaceId}-owner`;
      const provNow = (/* @__PURE__ */ new Date()).toISOString();
      const adminUser = {
        id: adminId,
        companyId: `comp-${workspaceId}`,
        nameAr: adminNameAr,
        nameEn: adminNameAr,
        email: adminEmail,
        phone: adminPhone,
        role: "sys_owner",
        roleLabelAr: "\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645",
        roleLabelEn: "System Owner",
        approvalLimitSar: 1e7,
        deviceName: String(body.deviceName || "Web Terminal"),
        lastActiveAt: provNow,
        statusState: "\u0645\u062A\u0635\u0644",
        active: true,
        accountStatus: "\u0646\u0634\u0637",
        security: {
          hasPin: Boolean(pin),
          lastPasswordChangedAt: provNow
        }
      };
      fresh.users.push(adminUser);
      this.stateCache = fresh;
      this.saveNormalizedState(fresh, workspaceId);
      const pwHash = await hashSecretWeb(password);
      const pinHash = pin ? await hashSecretWeb(pin) : null;
      this.ctx.storage.sql.exec(
        "INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)",
        adminId,
        pwHash,
        pinHash,
        provNow
      );
      const session = await this.issueSession(adminUser, workspaceId, adminUser.deviceName, {
        rememberMe: body.rememberMe !== false,
        appType,
        secure: secureReq
      });
      const userState = this.getStateForUser(fresh, adminUser.id, workspaceId);
      return jsonResponse(
        {
          ok: true,
          workspaceId,
          authenticated: true,
          user: sanitizeUserForClient(adminUser),
          token: session.token,
          ...appType === "desktop" && session.refreshToken ? { refreshToken: session.refreshToken } : {},
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          sessionId: session.sessionId,
          landingNav: getRecommendedLandingNav(userState, adminUser),
          allowedNavs: getAllowedNavsForUser(userState, adminUser),
          state: userState
        },
        201,
        session.headers
      );
    }
    if (pathname === "/api/auth/session" && request.method === "GET") {
      const demoLoginEnabled = this.env.AQAR_DEMO_LOGIN === "true";
      const actor2 = await this.resolveActor(request, state, workspaceId);
      const companyBranding = {
        nameAr: state.settings.nameAr,
        nameEn: state.settings.nameEn,
        logoDataUrl: state.settings.logoDataUrl,
        workspaceId
      };
      const loginProfiles = demoLoginEnabled ? state.users.filter((u) => isUserAccountActive(u)).map((u) => ({
        id: u.id,
        nameAr: u.nameAr,
        nameEn: u.nameEn,
        role: u.role,
        roleLabelAr: u.roleLabelAr,
        roleLabelEn: u.roleLabelEn,
        email: u.email
      })) : [];
      if (!actor2) {
        return jsonResponse({
          authenticated: false,
          workspaceId,
          workspaceExists: state.users.length > 0 || workspaceId === "default",
          demoLoginEnabled,
          loginProfiles,
          companyBranding
        });
      }
      const user = state.users.find((u) => u.id === actor2.userId);
      const userState = this.getStateForUser(state, actor2.userId, workspaceId);
      return jsonResponse({
        authenticated: true,
        workspaceId,
        workspaceExists: true,
        user: user ? sanitizeUserForClient(user) : void 0,
        token: actor2.rawToken,
        sessionId: actor2.sessionId,
        landingNav: getRecommendedLandingNav(userState, user),
        allowedNavs: getAllowedNavsForUser(userState, user),
        demoLoginEnabled,
        loginProfiles,
        companyBranding
      });
    }
    if (pathname === "/api/auth/login" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const identifier = String(body.identifier || body.email || body.userId || "").trim().toLowerCase();
      const password = String(body.password || "");
      const appType = body.appType === "desktop" ? "desktop" : "web";
      const rememberMe = body.rememberMe !== false;
      const phoneNeedle = normalizePhone(identifier);
      const user = state.users.find(
        (u) => u.id.toLowerCase() === identifier || u.email.toLowerCase() === identifier || u.username && u.username.toLowerCase() === identifier || phoneNeedle.length >= 6 && normalizePhone(u.phone) === phoneNeedle
      );
      if (!user) {
        this.recordDeniedAccess(state, workspaceId, void 0, "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", "AuthLogin", identifier || "unknown", "\u0645\u062D\u0627\u0648\u0644\u0629 \u062F\u062E\u0648\u0644 \u0628\u0628\u0631\u064A\u062F/\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644", {
          deviceName: String(body.deviceName || "Web Terminal")
        });
        return jsonResponse({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 401);
      }
      if (!isUserAccountActive(user)) {
        this.recordDeniedAccess(state, workspaceId, user, "\u0631\u0641\u0636 \u062F\u062E\u0648\u0644 \u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0646\u0634\u0637", "AuthLogin", user.id, `\u0645\u062D\u0627\u0648\u0644\u0629 \u062F\u062E\u0648\u0644 \u0644\u062D\u0633\u0627\u0628 \u0628\u062D\u0627\u0644\u0629 ${user.accountStatus || "\u0645\u0648\u0642\u0648\u0641"}`, {
          deviceName: String(body.deviceName || "Web Terminal")
        });
        return jsonResponse({ error: "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0623\u0648 \u0644\u0645 \u064A\u062A\u0645 \u062A\u0641\u0639\u064A\u0644\u0647 \u0628\u0639\u062F" }, 401);
      }
      const lockStatus = this.checkAccountLock(user.id);
      if (lockStatus.locked) {
        return jsonResponse(
          { error: `\u062A\u0645 \u0642\u0641\u0644 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0643\u062B\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629. \u062D\u0627\u0648\u0644 \u0628\u0639\u062F ${lockStatus.retryAfterSec} \u062B\u0627\u0646\u064A\u0629.` },
          429
        );
      }
      const cred = this.ctx.storage.sql.exec("SELECT password_hash FROM user_credentials WHERE user_id = ?", user.id).toArray()[0];
      if (!cred || !cred.password_hash || !await verifySecretWeb(password, cred.password_hash)) {
        this.recordFailedAttempt(user.id);
        this.recordDeniedAccess(state, workspaceId, user, "\u0641\u0634\u0644 \u062A\u062D\u0642\u0642 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", "AuthLogin", user.id, "\u0645\u062D\u0627\u0648\u0644\u0629 \u062F\u062E\u0648\u0644 \u0628\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062E\u0627\u0637\u0626\u0629", {
          deviceName: String(body.deviceName || "Web Terminal")
        });
        return jsonResponse({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 401);
      }
      this.clearFailedAttempts(user.id);
      const session = await this.issueSession(user, workspaceId, String(body.deviceName || "Web Terminal"), {
        rememberMe,
        appType,
        secure: secureReq
      });
      const userState = this.getStateForUser(state, user.id, workspaceId);
      return jsonResponse(
        {
          authenticated: true,
          workspaceId,
          user: sanitizeUserForClient(user),
          token: session.token,
          ...appType === "desktop" && session.refreshToken ? { refreshToken: session.refreshToken } : {},
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          sessionId: session.sessionId,
          rememberMe: session.rememberMe,
          landingNav: getRecommendedLandingNav(userState, user),
          allowedNavs: getAllowedNavsForUser(userState, user),
          state: userState
        },
        200,
        session.headers
      );
    }
    if (pathname === "/api/auth/login-pin" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const identifier = String(body.userId || body.identifier || "").trim().toLowerCase();
      const pin = String(body.pin || "").trim();
      const appType = body.appType === "desktop" ? "desktop" : "web";
      const rememberMe = body.rememberMe !== false;
      const user = state.users.find(
        (u) => u.id.toLowerCase() === identifier || u.email.toLowerCase() === identifier
      );
      if (!user || !isUserAccountActive(user)) {
        this.recordDeniedAccess(state, workspaceId, user, "\u0641\u0634\u0644 \u062F\u062E\u0648\u0644 PIN", "AuthPin", identifier || "unknown", "\u0645\u062D\u0627\u0648\u0644\u0629 \u062F\u062E\u0648\u0644 \u0628\u0631\u0645\u0632 PIN \u0644\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D");
        return jsonResponse({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648 \u0631\u0645\u0632 PIN \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 401);
      }
      const lockStatus = this.checkAccountLock(user.id);
      if (lockStatus.locked) {
        return jsonResponse(
          { error: `\u062A\u0645 \u0642\u0641\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0633\u0631\u064A\u0639 \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u0643\u062B\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0637\u0626\u0629. \u062D\u0627\u0648\u0644 \u0628\u0639\u062F ${lockStatus.retryAfterSec} \u062B\u0627\u0646\u064A\u0629.` },
          429
        );
      }
      const cred = this.ctx.storage.sql.exec("SELECT pin_hash FROM user_credentials WHERE user_id = ?", user.id).toArray()[0];
      if (!cred?.pin_hash || !await verifySecretWeb(pin, cred.pin_hash)) {
        this.recordFailedAttempt(user.id);
        this.recordDeniedAccess(state, workspaceId, user, "\u0641\u0634\u0644 \u062A\u062D\u0642\u0642 PIN", "AuthPin", user.id, "\u0645\u062D\u0627\u0648\u0644\u0629 \u062F\u062E\u0648\u0644 \u0628\u0631\u0645\u0632 PIN \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return jsonResponse({ error: "\u0631\u0645\u0632 PIN \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" }, 401);
      }
      this.clearFailedAttempts(user.id);
      const session = await this.issueSession(user, workspaceId, String(body.deviceName || "Web Terminal"), {
        rememberMe,
        appType,
        secure: secureReq
      });
      const userState = this.getStateForUser(state, user.id, workspaceId);
      return jsonResponse(
        {
          authenticated: true,
          workspaceId,
          user: sanitizeUserForClient(user),
          token: session.token,
          ...appType === "desktop" && session.refreshToken ? { refreshToken: session.refreshToken } : {},
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          sessionId: session.sessionId,
          rememberMe: session.rememberMe,
          landingNav: getRecommendedLandingNav(userState, user),
          allowedNavs: getAllowedNavsForUser(userState, user),
          state: userState
        },
        200,
        session.headers
      );
    }
    if (pathname === "/api/auth/refresh" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const cookies = parseCookies(request.headers.get("cookie"));
      const cookieRefresh = (cookies[REFRESH_COOKIE_NAME] || "").trim();
      const bodyRefresh = body?.refreshToken ? String(body.refreshToken).trim() : "";
      const rawRefresh = cookieRefresh || bodyRefresh;
      if (!rawRefresh) {
        return jsonResponse({ error: "\u0631\u0645\u0632 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u062C\u0644\u0633\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F", code: "AUTH_REQUIRED" }, 401);
      }
      const refHash = await sha256HexWeb(rawRefresh);
      const dbSession = this.ctx.storage.sql.exec(
        "SELECT token_id, user_id, workspace_id, device_name, app_type, remember_me, refresh_expires_at, revoked FROM sessions WHERE refresh_token_hash = ?",
        refHash
      ).toArray()[0];
      if (!dbSession || dbSession.revoked !== 0 || dbSession.workspace_id !== workspaceId || dbSession.refresh_expires_at && new Date(dbSession.refresh_expires_at).getTime() <= Date.now()) {
        return jsonResponse({ error: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062C\u0644\u0633\u0629 \u2014 \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B", code: "AUTH_REQUIRED" }, 401);
      }
      if (dbSession.app_type !== "desktop" && !cookieRefresh) {
        this.recordDeniedAccess(state, workspaceId, void 0, "\u0631\u0641\u0636 \u062A\u062C\u062F\u064A\u062F \u062C\u0644\u0633\u0629 \u0648\u064A\u0628 \u0639\u0628\u0631 body", "SessionSecurity", dbSession.token_id, "\u0645\u062D\u0627\u0648\u0644\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 refreshToken \u0641\u064A body \u0644\u062C\u0644\u0633\u0629 \u0648\u064A\u0628");
        return jsonResponse({ error: "\u062A\u062C\u062F\u064A\u062F \u062C\u0644\u0633\u0629 \u0627\u0644\u0648\u064A\u0628 \u064A\u062A\u0637\u0644\u0628 \u0645\u0644\u0641 \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u0622\u0645\u0646 \u0641\u0642\u0637", code: "AUTH_REQUIRED" }, 401);
      }
      const user = state.users.find((u) => u.id === dbSession.user_id && isUserAccountActive(u));
      if (!user) {
        this.revokeUserSessions(dbSession.user_id, workspaceId, "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062D\u0633\u0627\u0628");
        return jsonResponse({ error: "\u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0639\u0636\u0648\u064A\u062A\u0647", code: "AUTH_REQUIRED" }, 401);
      }
      const rememberMe = dbSession.remember_me !== 0;
      const isDesktop = dbSession.app_type === "desktop";
      const now = Date.now();
      const accessTtlMs = rememberMe ? ACCESS_TOKEN_TTL_MS : SESSION_SHORT_TTL_MS;
      const exp = now + accessTtlMs;
      const newExpiresAt = new Date(exp).toISOString();
      const newRefreshExpiresAt = new Date(now + SESSION_TTL_MS).toISOString();
      const newRefreshToken = randomHexWeb(32);
      const newRefHash = await sha256HexWeb(newRefreshToken);
      const newAccessToken = await signTokenWeb(
        { sid: dbSession.token_id, uid: user.id, wid: workspaceId, role: user.role, deviceName: dbSession.device_name, iat: now, exp },
        this.sessionSecretCache
      );
      this.ctx.storage.sql.exec(
        "UPDATE sessions SET refresh_token_hash = ?, expires_at = ?, refresh_expires_at = ? WHERE token_id = ? AND refresh_token_hash = ? AND revoked = 0",
        newRefHash,
        newExpiresAt,
        newRefreshExpiresAt,
        dbSession.token_id,
        refHash
      );
      const headers = this.buildSessionHeaders(newAccessToken, newRefreshToken, rememberMe, accessTtlMs, secureReq);
      const userState = this.getStateForUser(state, user.id, workspaceId);
      return jsonResponse(
        {
          ok: true,
          authenticated: true,
          workspaceId,
          token: newAccessToken,
          ...isDesktop ? { refreshToken: newRefreshToken } : {},
          expiresAt: newExpiresAt,
          refreshExpiresAt: newRefreshExpiresAt,
          rememberMe,
          user: sanitizeUserForClient(user),
          landingNav: getRecommendedLandingNav(userState, user),
          allowedNavs: getAllowedNavsForUser(userState, user),
          state: userState
        },
        200,
        headers
      );
    }
    if (pathname === "/api/auth/logout" && request.method === "POST") {
      const token = this.extractToken(request);
      if (token && this.sessionSecretCache) {
        const claims = await verifyTokenWeb(token, this.sessionSecretCache);
        if (claims?.sid) {
          this.ctx.storage.sql.exec("UPDATE sessions SET revoked = 1 WHERE token_id = ?", claims.sid);
        }
      }
      const headers = new Headers();
      headers.append("Set-Cookie", `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      headers.append("Set-Cookie", `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return jsonResponse({ ok: true }, 200, headers);
    }
    if (pathname === "/api/public/prospect-context" && request.method === "GET") {
      return jsonResponse({
        companyNameAr: state.settings.nameAr,
        companyNameEn: state.settings.nameEn,
        properties: state.properties.map((p) => ({ id: p.id, nameAr: p.nameAr, city: p.city, district: p.district })),
        vacantUnits: state.units.filter((u) => u.status === "\u0634\u0627\u063A\u0631\u0629" || u.status === "\u0642\u064A\u062F \u0627\u0644\u062A\u0623\u062C\u064A\u0631").map((u) => ({
          id: u.id,
          propertyId: u.propertyId,
          unitNumber: u.unitNumber,
          unitType: u.unitType,
          suggestedAnnualRent: u.suggestedAnnualRent,
          areaSqm: u.areaSqm,
          rooms: u.rooms
        }))
      });
    }
    if (pathname === "/api/public/leads" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const lead = {
        id: uid("lead"),
        nameAr: String(body.nameAr || ""),
        phone: String(body.phone || ""),
        source: String(body.source || "\u0627\u0633\u062A\u0628\u064A\u0627\u0646 \u0631\u0627\u0628\u0637 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"),
        propertyId: String(body.propertyId || state.properties[0]?.id || ""),
        unitId: String(body.unitId || state.units[0]?.id || ""),
        offeredRent: Number(body.offeredRent || 0),
        budgetMonthly: Math.round(Number(body.offeredRent || 0) / 12),
        viewingDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        status: "\u062C\u062F\u064A\u062F",
        assignedTo: state.users.find((u) => u.role === "leasing")?.id || state.users[0]?.id || "",
        notes: String(body.notes || ""),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.leads.unshift(lead);
      this.persistState(state, workspaceId);
      return jsonResponse({ lead, ok: true }, 201);
    }
    const actor = !PUBLIC_PATHS.has(pathname) && !pathname.startsWith("/api/public/lead-decision/") ? await this.resolveActor(request, state, workspaceId) : null;
    if (!PUBLIC_PATHS.has(pathname) && !pathname.startsWith("/api/public/lead-decision/") && !actor) {
      this.recordDeniedAccess(
        state,
        workspaceId,
        void 0,
        "\u0631\u0641\u0636 \u0648\u0635\u0648\u0644 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647 (401)",
        "SecurityAuth",
        pathname,
        `\u0645\u062D\u0627\u0648\u0644\u0629 \u0648\u0635\u0648\u0644 \u0645\u0631\u0641\u0648\u0636\u0629 (${request.method} ${pathname}) \u0628\u062F\u0648\u0646 \u062C\u0644\u0633\u0629 \u0635\u0627\u0644\u062D\u0629`
      );
      return jsonResponse(
        { error: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629 \u0623\u0648 \u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u2014 \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629", code: "AUTH_REQUIRED" },
        401
      );
    }
    const verifiedActor = actor;
    if (pathname === "/api/auth/logout-all" && request.method === "POST") {
      const revokedCount = this.revokeUserSessions(
        verifiedActor.userId,
        workspaceId,
        "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0645\u0646 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628\u0643"
      );
      const headers = new Headers();
      headers.append("Set-Cookie", `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      headers.append("Set-Cookie", `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return jsonResponse({ ok: true, revokedCount }, 200, headers);
    }
    if (pathname === "/api/auth/me" && request.method === "GET") {
      const user = state.users.find((u) => u.id === verifiedActor.userId);
      const userState = this.getStateForUser(state, verifiedActor.userId, workspaceId);
      return jsonResponse({
        authenticated: true,
        user: user ? sanitizeUserForClient(user) : void 0,
        sessionId: verifiedActor.sessionId,
        allowedNavs: getAllowedNavsForUser(userState, user),
        landingNav: getRecommendedLandingNav(userState, user)
      });
    }
    if (pathname === "/api/state" && request.method === "GET") {
      return jsonResponse({
        state: this.getStateForUser(state, verifiedActor.userId, workspaceId),
        presence: this.getPresenceList(state),
        workspaceId
      });
    }
    if (pathname === "/api/auth/credentials" && request.method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const targetUserId = String(body.targetUserId || verifiedActor.userId);
        const actorUser = this.getActingUser(state, verifiedActor.userId);
        const isSelf = targetUserId === actorUser.id;
        if (!isSelf && actorUser.role !== "sys_owner") {
          this.recordDeniedAccess(state, workspaceId, actorUser, "\u0631\u0641\u0636 \u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0645\u0648\u0638\u0641", "StaffCredentials", targetUserId, "\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0645\u0648\u0638\u0641 \u0622\u062E\u0631 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645", { deviceName: verifiedActor.deviceName });
          throw new WorkerPermissionDeniedError("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0645\u0648\u0638\u0641 \u0622\u062E\u0631 \u062D\u0635\u0631\u064A \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const row = this.ctx.storage.sql.exec(
          "SELECT password_hash, pin_hash FROM user_credentials WHERE user_id = ?",
          targetUserId
        ).toArray()[0];
        if (isSelf && body.newPassword) {
          if (!body.currentPassword || !row?.password_hash || !await verifySecretWeb(String(body.currentPassword), row.password_hash)) {
            return jsonResponse({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 400);
          }
        }
        let pwHash = row?.password_hash || await hashSecretWeb(randomHexWeb(18));
        let pinHash = row?.pin_hash ?? null;
        if (body.newPassword) {
          if (String(body.newPassword).length < 8) {
            return jsonResponse({ error: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u064A\u062C\u0628 \u0623\u0646 \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 8 \u0623\u062D\u0631\u0641" }, 400);
          }
          pwHash = await hashSecretWeb(String(body.newPassword));
        }
        if (body.newPin) {
          if (!/^\d{4,6}$/.test(String(body.newPin))) {
            return jsonResponse({ error: "\u0631\u0645\u0632 PIN \u0627\u0644\u062C\u062F\u064A\u062F \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 4 \u0625\u0644\u0649 6 \u0623\u0631\u0642\u0627\u0645" }, 400);
          }
          pinHash = await hashSecretWeb(String(body.newPin));
        }
        this.ctx.storage.sql.exec(
          "INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)",
          targetUserId,
          pwHash,
          pinHash,
          now
        );
        if (body.newPassword || body.newPin) {
          this.revokeUserSessions(
            targetUserId,
            workspaceId,
            isSelf ? "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u2014 \u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0623\u062E\u0631\u0649" : "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0648\u0627\u0633\u0637\u0629 \u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0638\u0627\u0645",
            isSelf ? verifiedActor.sessionId : void 0
          );
        }
        this.appendAudit(state, verifiedActor.userId, "\u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644", "\u0623\u0645\u0627\u0646 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646", targetUserId, isSelf ? "\u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0648 PIN \u0627\u0644\u0634\u062E\u0635\u064A" : `\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0628\u064A\u0627\u0646\u0627\u062A ${targetUserId}`, verifiedActor.deviceName);
        this.persistState(state, workspaceId);
        return jsonResponse({ ok: true, state: this.getStateForUser(state, verifiedActor.userId, workspaceId) });
      } catch (err) {
        return errorResponse(err, 400);
      }
    }
    if (pathname === "/api/backups" && request.method === "POST") {
      try {
        this.assertPermission(state, workspaceId, verifiedActor.userId, "backup_restore", {
          entityType: "Backup",
          deviceName: verifiedActor.deviceName
        });
        const body = await request.json().catch(() => ({}));
        const snapshotData = JSON.parse(JSON.stringify(state));
        const encryptPassword = body.encryptPassword ? String(body.encryptPassword) : void 0;
        const encrypted = Boolean(encryptPassword && encryptPassword.trim().length > 0);
        const id = uid("bkp");
        const payloadToStore = encrypted ? await encryptBackupWeb(snapshotData, encryptPassword) : snapshotData;
        const rawPayload = JSON.stringify(payloadToStore);
        const bkpMeta = {
          id,
          label: String(body.label || `\u0646\u0633\u062E\u0629 \u0633\u062D\u0627\u0628\u064A\u0629 \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-SA")}`),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          createdBy: verifiedActor.userId,
          sizeKb: Math.max(1, Math.round(rawPayload.length / 1024)),
          recordCount: state.properties.length + state.units.length + state.tenants.length + state.contracts.length + state.payments.length,
          encrypted
        };
        this.ctx.storage.sql.exec(
          "INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)",
          id,
          rawPayload,
          bkpMeta.createdAt
        );
        state.backups.unshift(bkpMeta);
        this.persistState(state, workspaceId);
        return jsonResponse({ backup: bkpMeta, state: this.getStateForUser(state, verifiedActor.userId, workspaceId) }, 201);
      } catch (err) {
        return errorResponse(err, 400);
      }
    }
    const bkpPreviewMatch = /^\/api\/backups\/([^/]+)\/preview$/.exec(pathname);
    if (bkpPreviewMatch && (request.method === "POST" || request.method === "GET")) {
      try {
        this.assertPermission(state, workspaceId, verifiedActor.userId, "backup_restore", {
          entityType: "Backup",
          entityId: bkpPreviewMatch[1],
          deviceName: verifiedActor.deviceName
        });
        const bkpId = bkpPreviewMatch[1];
        const meta = state.backups.find((b) => b.id === bkpId);
        const row = this.ctx.storage.sql.exec("SELECT payload_json FROM backups_store WHERE id = ?", bkpId).toArray()[0];
        if (!row) {
          return jsonResponse({
            id: bkpId,
            label: meta?.label || "",
            exists: false,
            encrypted: Boolean(meta?.encrypted),
            propertiesCount: 0,
            unitsCount: 0,
            tenantsCount: 0,
            contractsCount: 0,
            paymentsCount: 0,
            templatesCount: 0
          });
        }
        const parsed = JSON.parse(row.payload_json);
        let snap;
        if ("aqarEncrypted" in parsed && parsed.aqarEncrypted) {
          const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
          const password = body.password ? String(body.password) : url.searchParams.get("password") || "";
          if (!password) {
            return jsonResponse({
              id: bkpId,
              exists: true,
              encrypted: true,
              requiresPassword: true,
              propertiesCount: 0,
              unitsCount: 0,
              tenantsCount: 0,
              contractsCount: 0,
              paymentsCount: 0,
              templatesCount: 0
            });
          }
          try {
            snap = await decryptBackupWeb(parsed, password);
          } catch {
            return jsonResponse({
              id: bkpId,
              exists: true,
              encrypted: true,
              requiresPassword: true,
              decryptionError: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0641\u0643 \u0627\u0644\u062A\u0634\u0641\u064A\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629",
              propertiesCount: 0,
              unitsCount: 0,
              tenantsCount: 0,
              contractsCount: 0,
              paymentsCount: 0,
              templatesCount: 0
            });
          }
        } else {
          snap = parsed;
        }
        const diffCollection = (cur = [], inc = []) => {
          const curMap = new Map(cur.map((x) => [x.id, JSON.stringify(x)]));
          let added = 0;
          let updated = 0;
          let unchanged = 0;
          for (const item of inc) {
            const ex = curMap.get(item.id);
            if (!ex) added += 1;
            else if (ex === JSON.stringify(item)) unchanged += 1;
            else updated += 1;
          }
          return { added, updated, unchanged };
        };
        const diff = {
          properties: diffCollection(state.properties, snap.properties),
          units: diffCollection(state.units, snap.units),
          tenants: diffCollection(state.tenants, snap.tenants),
          contracts: diffCollection(state.contracts, snap.contracts),
          payments: diffCollection(state.payments, snap.payments),
          expenses: diffCollection(state.expenses, snap.expenses),
          tickets: diffCollection(state.tickets, snap.tickets)
        };
        const totalChanged = Object.values(diff).reduce((s, d) => s + d.added + d.updated, 0);
        const preview = {
          id: bkpId,
          exists: true,
          encrypted: "aqarEncrypted" in parsed,
          propertiesCount: snap.properties?.length || 0,
          unitsCount: snap.units?.length || 0,
          tenantsCount: snap.tenants?.length || 0,
          contractsCount: snap.contracts?.length || 0,
          paymentsCount: snap.payments?.length || 0,
          templatesCount: snap.communicationTemplates?.length || 0,
          lastUpdatedAt: snap.lastUpdatedAt,
          diff: { ...diff, totalChanged }
        };
        return jsonResponse(preview);
      } catch (err) {
        return errorResponse(err, 400);
      }
    }
    const bkpRestoreMatch = /^\/api\/backups\/([^/]+)\/restore$/.exec(pathname);
    if (bkpRestoreMatch && request.method === "POST") {
      try {
        this.assertPermission(state, workspaceId, verifiedActor.userId, "backup_restore", {
          entityType: "Backup",
          entityId: bkpRestoreMatch[1],
          deviceName: verifiedActor.deviceName
        });
        const bkpId = bkpRestoreMatch[1];
        const body = await request.json().catch(() => ({}));
        const row = this.ctx.storage.sql.exec("SELECT payload_json FROM backups_store WHERE id = ?", bkpId).toArray()[0];
        if (!row) return jsonResponse({ error: "\u0627\u0644\u0646\u0633\u062E\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" }, 404);
        const parsed = JSON.parse(row.payload_json);
        let snap;
        if ("aqarEncrypted" in parsed && parsed.aqarEncrypted) {
          if (!body.password) return jsonResponse({ error: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0641\u0643 \u0627\u0644\u062A\u0634\u0641\u064A\u0631 \u0645\u0637\u0644\u0648\u0628\u0629" }, 400);
          try {
            snap = await decryptBackupWeb(parsed, String(body.password));
          } catch {
            return jsonResponse({ error: "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0641\u0643 \u0627\u0644\u062A\u0634\u0641\u064A\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }, 400);
          }
        } else {
          snap = parsed;
        }
        const safetyId = uid("bkp-safety");
        this.ctx.storage.sql.exec(
          "INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)",
          safetyId,
          JSON.stringify(state),
          (/* @__PURE__ */ new Date()).toISOString()
        );
        const existingAudits = [...state.auditLogs || []];
        if (body.mode === "merge") {
          const mergeById = (cur = [], inc = []) => {
            const seen = new Set(cur.map((x) => x.id));
            return [...cur, ...inc.filter((x) => !seen.has(x.id))];
          };
          state.properties = mergeById(state.properties, snap.properties);
          state.units = mergeById(state.units, snap.units);
          state.tenants = mergeById(state.tenants, snap.tenants);
          state.contracts = mergeById(state.contracts, snap.contracts);
          state.installments = mergeById(state.installments, snap.installments);
          state.payments = mergeById(state.payments, snap.payments);
          state.expenses = mergeById(state.expenses, snap.expenses);
          state.tickets = mergeById(state.tickets, snap.tickets);
          state.tasks = mergeById(state.tasks, snap.tasks);
          state.documents = mergeById(state.documents, snap.documents);
          state.auditLogs = mergeById(existingAudits, snap.auditLogs || []);
        } else {
          const preservedBackups = state.backups;
          Object.assign(state, snap);
          state.backups = preservedBackups;
          const seenAudits = new Set(existingAudits.map((a) => a.id));
          state.auditLogs = [...existingAudits, ...(snap.auditLogs || []).filter((a) => !seenAudits.has(a.id))];
        }
        this.appendAudit(state, verifiedActor.userId, "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629", "\u0646\u0638\u0627\u0645", bkpId, `\u0627\u0633\u062A\u0639\u0627\u062F\u0629 (${body.mode || "replace"}) \u0645\u0639 \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0633\u062C\u0644 \u0627\u0644\u062A\u062F\u0642\u064A\u0642`, verifiedActor.deviceName);
        this.persistState(state, workspaceId);
        this.broadcastStateChange(state, verifiedActor.userId, "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629", workspaceId);
        return jsonResponse({ ok: true, mode: body.mode || "replace", state: this.getStateForUser(state, verifiedActor.userId, workspaceId) });
      } catch (err) {
        return errorResponse(err, 400);
      }
    }
    if (pathname === "/api/sync/batch" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const operations = Array.isArray(body.operations) ? body.operations : [];
      let uploaded = 0;
      let skippedDuplicates = 0;
      let conflictsDetected = 0;
      const newConflicts = [];
      const errors = [];
      for (const op of operations) {
        const operationId = String(op.operationId || op.idempotencyKey || op.id || "");
        if (!operationId) continue;
        const existingOp = this.ctx.storage.sql.exec("SELECT operation_id FROM operations_log WHERE operation_id = ?", operationId).toArray()[0];
        if (existingOp) {
          skippedDuplicates += 1;
          continue;
        }
        if (op.entityType && op.entityId && typeof op.baseRevision === "number") {
          const revKey = `${op.entityType}:${op.entityId}`;
          const serverRev = state.entityRevisions?.[revKey] || 0;
          if (serverRev > op.baseRevision) {
            conflictsDetected += 1;
            const conflict = {
              id: uid("cnf"),
              entityType: op.entityType,
              entityId: op.entityId,
              entityLabel: `${op.entityType}:${op.entityId}`,
              firstActorName: "\u062A\u062D\u062F\u064A\u062B \u0645\u062D\u0641\u0648\u0638 \u0639\u0644\u0649 \u0627\u0644\u062E\u0627\u062F\u0645",
              secondActorName: verifiedActor.deviceName,
              firstChangeSummary: `\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u062E\u0627\u062F\u0645 #${serverRev}`,
              secondChangeSummary: `\u0639\u0645\u0644\u064A\u0629 \u062C\u0647\u0627\u0632 \u0627\u0644\u0639\u0645\u064A\u0644 (${op.endpoint}) \u0645\u0646 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 #${op.baseRevision}`,
              status: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062F\u064A\u0631",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            if (!state.syncConflicts) state.syncConflicts = [];
            state.syncConflicts.unshift(conflict);
            newConflicts.push(conflict);
          }
        }
        try {
          const res = await this.handleMutation(state, verifiedActor, op.method || "POST", op.endpoint, op.body || {});
          uploaded += 1;
          this.ctx.storage.sql.exec(
            "INSERT INTO operations_log (operation_id, user_id, method, endpoint, entity_type, entity_id, status, response_json, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            operationId,
            verifiedActor.userId,
            op.method || "POST",
            op.endpoint,
            op.entityType || null,
            op.entityId || null,
            "applied",
            JSON.stringify({ ok: true, id: res?.id }),
            (/* @__PURE__ */ new Date()).toISOString()
          );
        } catch (err) {
          errors.push(err.message);
        }
      }
      if (conflictsDetected > 0) this.persistState(state, workspaceId);
      if (uploaded > 0) {
        this.broadcastStateChange(state, verifiedActor.userId, `\u0645\u0632\u0627\u0645\u0646\u0629 ${uploaded} \u0639\u0645\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0639\u0645\u0644 \u062F\u0648\u0646 \u0625\u0646\u062A\u0631\u0646\u062A`, workspaceId);
      }
      return jsonResponse({
        success: errors.length === 0,
        uploaded,
        skippedDuplicates,
        conflictsDetected,
        newConflicts,
        errors,
        state: this.getStateForUser(state, verifiedActor.userId, workspaceId),
        syncedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (pathname === "/api/sync/delta" && request.method === "GET") {
      const since = url.searchParams.get("since");
      const hasChanges = !since || new Date(state.lastUpdatedAt).getTime() > new Date(since).getTime();
      return jsonResponse({
        hasChanges,
        serverRevision: state.syncRevision || 1,
        lastUpdatedAt: state.lastUpdatedAt,
        pendingConflictsCount: (state.syncConflicts || []).filter((c) => c.status === "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u062F\u064A\u0631").length,
        syncConflicts: state.syncConflicts || [],
        state: hasChanges ? this.getStateForUser(state, verifiedActor.userId, workspaceId) : void 0
      });
    }
    if (request.method === "POST" || request.method === "PATCH" || request.method === "DELETE") {
      try {
        const body = await request.json().catch(() => ({}));
        const result = await this.handleMutation(state, verifiedActor, request.method, pathname, body);
        this.broadcastStateChange(state, verifiedActor.userId, `\u062A\u062D\u062F\u064A\u062B ${pathname}`, workspaceId);
        return jsonResponse(result, request.method === "POST" ? 201 : 200);
      } catch (err) {
        return errorResponse(err, 400);
      }
    }
    return jsonResponse({ error: "Not Found" }, 404);
  }
  async webSocketMessage(ws, message) {
    try {
      const text = typeof message === "string" ? message : new TextDecoder().decode(message);
      const msg = JSON.parse(text);
      if (msg.type === "session:identify") {
        const prev = ws.deserializeAttachment();
        const workspaceId = prev?.workspaceId || "default";
        const state = await this.ensureBootstrapped(workspaceId);
        const dummyReq = new Request("https://worker.local/ws", {
          headers: { "x-resolved-workspace-id": workspaceId }
        });
        const actor = await this.resolveActor(dummyReq, state, workspaceId, msg.token);
        if (!actor) {
          ws.send(JSON.stringify({ type: "auth:required" }));
          return;
        }
        const meta = {
          sessionId: actor.sessionId,
          userId: actor.userId,
          workspaceId,
          authenticated: true,
          deviceName: msg.deviceName || actor.deviceName,
          connectedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        ws.serializeAttachment(meta);
        ws.send(
          JSON.stringify({
            type: "state:init",
            state: this.getStateForUser(state, actor.userId, workspaceId),
            presence: this.getPresenceList(state)
          })
        );
      }
    } catch {
    }
  }
  async webSocketClose(ws, code, reason) {
    try {
      ws.close(code, reason);
    } catch {
    }
  }
};

// worker/src/index.ts
var VALID_WORKSPACE_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
function resolveWorkspaceId(request, url) {
  const fromHeader = (request.headers.get("x-workspace-id") || "").trim().toLowerCase();
  if (fromHeader && VALID_WORKSPACE_RE.test(fromHeader)) {
    return fromHeader;
  }
  const fromQuery = (url.searchParams.get("workspace") || "").trim().toLowerCase();
  if (fromQuery && VALID_WORKSPACE_RE.test(fromQuery)) {
    return fromQuery;
  }
  const host = url.hostname.toLowerCase();
  const parts = host.split(".");
  if (parts.length >= 3 && !host.endsWith(".workers.dev") && parts[0] !== "www" && parts[0] !== "app") {
    if (VALID_WORKSPACE_RE.test(parts[0])) {
      return parts[0];
    }
  }
  return "default";
}
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") || url.pathname === "/ws") {
      const workspaceId = resolveWorkspaceId(request, url);
      const id = env.WORKSPACE_DO.idFromName(`ws:${workspaceId}`);
      const stub = env.WORKSPACE_DO.get(id);
      const headers = new Headers(request.headers);
      headers.set("x-resolved-workspace-id", workspaceId);
      const forwarded = new Request(request, { headers });
      return stub.fetch(forwarded);
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  AqarWorkspaceDO,
  index_default as default,
  resolveWorkspaceId
};
