import React from 'react';
import { Calculator, FileSignature, Wallet } from 'lucide-react';
import { LeasingFinanceTab, useAqar } from '../context/AqarContext';
import { LeasingContractsView } from './LeasingContractsView';
import { FinanceCollectionView } from './FinanceCollectionView';
import { AccountingOwnersView } from './AccountingOwnersView';

export function LeasingFinanceHubView() {
  const { leasingFinanceTab, setLeasingFinanceTab, lang, currentUser, hasModulePermission, hasPermission } = useAqar();
  const isAr = lang === 'ar';
  const isOwner = currentUser?.role === 'owner';

  const allTabs: {
    id: LeasingFinanceTab;
    labelAr: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    allowed: boolean;
  }[] = [
    {
      id: 'leasing',
      labelAr: 'العقود والتأجير والإخلاء',
      labelEn: 'Contracts & Leasing',
      icon: FileSignature,
      allowed: isOwner || hasModulePermission('contracts', 'view') || hasPermission('manage_contracts'),
    },
    {
      id: 'finance',
      labelAr: 'الدفعات والتحصيل والسندات',
      labelEn: 'Rent & Receipts',
      icon: Wallet,
      allowed:
        isOwner ||
        hasModulePermission('payments', 'view') ||
        hasModulePermission('receipts', 'view') ||
        hasModulePermission('finance', 'view') ||
        hasPermission('collect_payments'),
    },
    {
      id: 'accounting',
      labelAr: 'المحاسبة والملاك والمصروفات',
      labelEn: 'Accounting & Owners',
      icon: Calculator,
      allowed:
        isOwner ||
        hasModulePermission('finance', 'view') ||
        hasModulePermission('expenses', 'view') ||
        hasPermission('manage_accounting') ||
        hasPermission('create_expense'),
    },
  ];

  const tabs = allTabs.filter((t) => t.allowed);
  const effectiveTabs = tabs.length > 0 ? tabs : [allTabs[0]];
  const activeTab = effectiveTabs.some((t) => t.id === leasingFinanceTab)
    ? leasingFinanceTab
    : effectiveTabs[0].id;

  return (
    <div className="space-y-5">
      {/* Sub-Navigation Tabs inside Leasing & Finance */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 glass-surface no-print">
        <div className="flex flex-wrap items-center gap-1.5">
          {effectiveTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setLeasingFinanceTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#26478D] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{isAr ? t.labelAr : t.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'leasing' && <LeasingContractsView />}
      {activeTab === 'finance' && <FinanceCollectionView />}
      {activeTab === 'accounting' && <AccountingOwnersView />}
    </div>
  );
}
