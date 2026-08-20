/**
 * HabitTracker Trend Analyzer - Modal Dialogs & Scroll Lock Management
 */

function openImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.remove('hidden');
        lockBodyScroll();
    }
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('hidden');
        unlockBodyScroll();
    }
}

function openAchievementModal(achId) {
    const ach = specialAchievementsData[achId];
    if (!ach) return;

    const modal = document.getElementById('achievementDetailModal');
    if (!modal) return;

    const iconEl = document.getElementById('ach-modal-icon-container');
    const titleEl = document.getElementById('ach-modal-title');
    const descEl = document.getElementById('ach-modal-desc');
    const statusBadgeEl = document.getElementById('ach-modal-status-badge');
    const historyListEl = document.getElementById('ach-modal-history-list');

    if (iconEl) iconEl.textContent = ach.icon;
    if (titleEl) titleEl.textContent = ach.title;
    if (descEl) descEl.textContent = ach.desc;

    if (statusBadgeEl) {
        statusBadgeEl.textContent = ach.statusText;
        statusBadgeEl.className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${ach.statusBadgeClass}`;
    }

    if (historyListEl) {
        historyListEl.innerHTML = '';
        if (ach.history.length === 0) {
            historyListEl.innerHTML = `
                <div class="p-4 bg-slate-50 border border-slate-150 rounded-xl text-center text-xs text-slate-400 font-medium">
                    Достижение пока не получено. Продолжайте выполнять привычку!
                </div>
            `;
        } else {
            ach.history.forEach(item => {
                const colorClass = item.valueColorClass || 'font-bold text-primary-600 font-mono';
                const itemHtml = `
                    <div class="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs flex items-center justify-between gap-3 hover:bg-slate-100/60 transition">
                        <div class="space-y-0.5">
                            <span class="font-bold text-slate-900 block">${item.title}</span>
                            <span class="text-[10px] text-slate-500 block">${item.subtext}</span>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="${colorClass} block">${item.valueText}</span>
                            ${item.badgeText ? `<span class="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded mt-0.5 inline-block">${item.badgeText}</span>` : ''}
                        </div>
                    </div>
                `;
                historyListEl.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    }

    modal.classList.remove('hidden');
    lockBodyScroll();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function closeAchievementModal() {
    const modal = document.getElementById('achievementDetailModal');
    if (modal) {
        modal.classList.add('hidden');
        unlockBodyScroll();
    }
}

// Global escape key listener to close modals
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImportModal();
        closeAchievementModal();
    }
});
