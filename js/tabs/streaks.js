/**
 * HabitTracker Trend Analyzer - Streaks Tab (Рекорды)
 */

function renderStreaksTable(filteredData) {
    const successListContainer = document.getElementById('success-streaks-list');
    const failureListContainer = document.getElementById('failure-streaks-list');
    if (!successListContainer || !failureListContainer) return;
    
    successListContainer.innerHTML = '';
    failureListContainer.innerHTML = '';

    const limitInput = document.getElementById('recordsLimitInput');
    const limit = limitInput ? parseInt(limitInput.value, 10) || 10 : 10;

    const { successes, failures } = getStreakLists(filteredData);

    if (successes.length === 0) {
        successListContainer.innerHTML = `
            <div class="text-center py-10 text-slate-400 text-xs">
                Нет непрерывных серий успехов за этот период
            </div>
        `;
    } else {
        successes.slice(0, limit).forEach((streak, idx) => {
            let isTop = idx === 0;
            let badgeBg = isTop ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
            let badgeText = isTop ? '🔥 Рекорд' : `#${idx + 1}`;
            
            let rowHtml = `
                <div class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm transition hover:scale-[1.01]">
                    <div class="flex items-center gap-3">
                        <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badgeBg} select-none">${badgeText}</span>
                        <div>
                            <p class="font-bold text-slate-950 text-xs">${streak.count} ${getNounDays(streak.count)} подряд</p>
                            <p class="text-[10px] text-slate-400 font-medium">${formatDateToString(streak.start)} — ${formatDateToString(streak.end)}</p>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end">
                        <span class="text-[11px] font-bold text-emerald-600">Рост</span>
                        <span class="text-[9px] text-slate-400 mt-0.5 font-medium block">${getDaysAgoText(streak.end)}</span>
                    </div>
                </div>
            `;
            successListContainer.insertAdjacentHTML('beforeend', rowHtml);
        });
    }

    if (failures.length === 0) {
        failureListContainer.innerHTML = `
            <div class="text-center py-10 text-slate-400 text-xs">
                Нет непрерывных серий провалов за этот период
            </div>
        `;
    } else {
        failures.slice(0, limit).forEach((streak, idx) => {
            let isTop = idx === 0;
            let badgeBg = isTop ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-rose-100 text-rose-800 border-rose-200';
            let badgeText = isTop ? '🥶 Пик спада' : `#${idx + 1}`;

            let rowHtml = `
                <div class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm transition hover:scale-[1.01]">
                    <div class="flex items-center gap-3">
                        <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badgeBg} select-none">${badgeText}</span>
                        <div>
                            <p class="font-bold text-slate-950 text-xs">${streak.count} ${getNounDays(streak.count)} подряд</p>
                            <p class="text-[10px] text-slate-400 font-medium">${formatDateToString(streak.start)} — ${formatDateToString(streak.end)}</p>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end">
                        <span class="text-[11px] font-bold text-rose-600">Спад</span>
                        <span class="text-[9px] text-slate-400 mt-0.5 font-medium block">${getDaysAgoText(streak.end)}</span>
                    </div>
                </div>
            `;
            failureListContainer.insertAdjacentHTML('beforeend', rowHtml);
        });
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
