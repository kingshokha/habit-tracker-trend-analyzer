/**
 * HabitTracker Trend Analyzer - Month Comparison Tab
 */

function setMonthCompFilterMode(mode) {
    monthCompFilterMode = mode;
    const fullBtn = document.getElementById('mcomp-filter-full-btn');
    const mtdBtn = document.getElementById('mcomp-filter-mtd-btn');
    
    if (mode === 'full') {
        if (fullBtn) fullBtn.className = "px-2.5 py-1 rounded-lg bg-white shadow-sm text-primary-700 transition";
        if (mtdBtn) mtdBtn.className = "px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition";
    } else {
        if (fullBtn) fullBtn.className = "px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition";
        if (mtdBtn) mtdBtn.className = "px-2.5 py-1 rounded-lg bg-white shadow-sm text-primary-700 transition";
    }

    renderMonthCompTab();
}

function onMonthCompSortChange(val) {
    monthCompSortMode = val;
    renderMonthCompTab();
}

function renderMonthCompTab() {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return;

    const listContainer = document.getElementById('all-months-list-container');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Определяем реальные параметры текущего месяца из всей истории habitsData
    const overallChron = [...habitsData].sort((a, b) => a.date - b.date);
    const overallLatestItem = overallChron.length > 0 ? overallChron[overallChron.length - 1] : null;
    const realCurrentDay = overallLatestItem ? overallLatestItem.date.getDate() : 31;
    const realCurrentMonth = overallLatestItem ? overallLatestItem.date.getMonth() : 11;
    const realCurrentYear = overallLatestItem ? overallLatestItem.date.getFullYear() : 2026;

    const targetDay = realCurrentDay;

    const cutoffEl = document.getElementById('mcomp-cutoff-day');
    if (cutoffEl) cutoffEl.textContent = targetDay;

    const chronData = [...filteredData].sort((a, b) => a.date - b.date);

    const hasRealCurrent = chronData.some(item => 
        item.date.getFullYear() === realCurrentYear && item.date.getMonth() === realCurrentMonth
    );

    let itemsToGroup = [...chronData];
    if (!hasRealCurrent) {
        const currentItemsFromAll = overallChron.filter(item => 
            item.date.getFullYear() === realCurrentYear && item.date.getMonth() === realCurrentMonth
        );
        itemsToGroup = [...itemsToGroup, ...currentItemsFromAll];
    }

    // Группировка данных по месяцам
    const monthsMap = new Map();

    itemsToGroup.forEach(item => {
        const y = item.date.getFullYear();
        const m = item.date.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;

        if (!monthsMap.has(monthKey)) {
            monthsMap.set(monthKey, {
                year: y,
                month: m,
                monthKey: monthKey,
                dateForSort: new Date(y, m, 1),
                fullItems: [],
                mtdItems: []
            });
        }

        const monthObj = monthsMap.get(monthKey);
        monthObj.fullItems.push(item);
        if (item.date.getDate() <= targetDay) {
            monthObj.mtdItems.push(item);
        }
    });

    const monthsArray = Array.from(monthsMap.values());

    // Вычисляем показатели для каждого месяца
    monthsArray.forEach(mObj => {
        const itemsToUse = monthCompFilterMode === 'mtd' ? mObj.mtdItems : mObj.fullItems;
        const totalDays = itemsToUse.length;
        const successDays = itemsToUse.filter(i => i.status === 'Успех').length;
        const successRate = totalDays > 0 ? (successDays / totalDays) : 0;
        const avgValue = totalDays > 0 ? (itemsToUse.reduce((s, i) => s + i.value, 0) / totalDays) : 0;

        mObj.activeTotalDays = totalDays;
        mObj.activeSuccessDays = successDays;
        mObj.activeSuccessRate = successRate;
        mObj.activeAvgValue = avgValue;
    });

    // Считаем успехи реального текущего месяца из всей истории
    const realCurrentItems = overallChron.filter(item => 
        item.date.getFullYear() === realCurrentYear &&
        item.date.getMonth() === realCurrentMonth &&
        (monthCompFilterMode === 'full' || item.date.getDate() <= targetDay)
    );
    const currentSuccessCount = realCurrentItems.filter(i => i.status === 'Успех').length;

    // Находим наилучший и наихудший месяц (при равенстве показателей преимущество у более нового месяца)
    let bestMonth = monthsArray[0];
    let worstMonth = monthsArray[0];

    monthsArray.forEach(m => {
        if (m.activeSuccessRate > bestMonth.activeSuccessRate || 
           (m.activeSuccessRate === bestMonth.activeSuccessRate && m.activeSuccessDays > bestMonth.activeSuccessDays) ||
           (m.activeSuccessRate === bestMonth.activeSuccessRate && m.activeSuccessDays === bestMonth.activeSuccessDays && m.dateForSort > bestMonth.dateForSort)) {
            bestMonth = m;
        }
        if (m.activeSuccessRate < worstMonth.activeSuccessRate || 
           (m.activeSuccessRate === worstMonth.activeSuccessRate && m.activeSuccessDays < worstMonth.activeSuccessDays) ||
           (m.activeSuccessRate === worstMonth.activeSuccessRate && m.activeSuccessDays === worstMonth.activeSuccessDays && m.dateForSort > worstMonth.dateForSort)) {
            worstMonth = m;
        }
    });

    // Обновляем плашки с лучшим и худшим месяцем
    const bestTitleEl = document.getElementById('best-month-title');
    const bestSubEl = document.getElementById('best-month-subtitle');
    const worstTitleEl = document.getElementById('worst-month-title');
    const worstSubEl = document.getElementById('worst-month-subtitle');

    if (bestTitleEl && bestMonth) {
        const monthName = new Date(bestMonth.year, bestMonth.month, 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        bestTitleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        bestSubEl.textContent = `${(bestMonth.activeSuccessRate * 100).toFixed(2)}% успеха (${bestMonth.activeSuccessDays} из ${bestMonth.activeTotalDays} дн.)`;
    }

    if (worstTitleEl && worstMonth) {
        const monthName = new Date(worstMonth.year, worstMonth.month, 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        worstTitleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        worstSubEl.textContent = `${(worstMonth.activeSuccessRate * 100).toFixed(2)}% успеха (${worstMonth.activeSuccessDays} из ${worstMonth.activeTotalDays} дн.)`;
    }

    // Сортировка всего списка (при одинаковом результате более свежий месяц выводится выше)
    const sortedMonths = [...monthsArray];
    sortedMonths.sort((a, b) => {
        if (monthCompSortMode === 'best') {
            if (b.activeSuccessRate !== a.activeSuccessRate) {
                return b.activeSuccessRate - a.activeSuccessRate;
            }
            if (b.activeSuccessDays !== a.activeSuccessDays) {
                return b.activeSuccessDays - a.activeSuccessDays;
            }
            return b.dateForSort - a.dateForSort;
        } else if (monthCompSortMode === 'worst') {
            if (a.activeSuccessRate !== b.activeSuccessRate) {
                return a.activeSuccessRate - b.activeSuccessRate;
            }
            if (a.activeSuccessDays !== b.activeSuccessDays) {
                return a.activeSuccessDays - b.activeSuccessDays;
            }
            return b.dateForSort - a.dateForSort;
        } else if (monthCompSortMode === 'date-desc') {
            return b.dateForSort - a.dateForSort;
        } else if (monthCompSortMode === 'date-asc') {
            return a.dateForSort - b.dateForSort;
        } else if (monthCompSortMode === 'count-desc') {
            if (b.activeSuccessDays !== a.activeSuccessDays) {
                return b.activeSuccessDays - a.activeSuccessDays;
            }
            if (b.activeSuccessRate !== a.activeSuccessRate) {
                return b.activeSuccessRate - a.activeSuccessRate;
            }
            return b.dateForSort - a.dateForSort;
        }
        return 0;
    });

    // Рендеринг всех месяцев
    sortedMonths.forEach((mObj) => {
        const monthName = new Date(mObj.year, mObj.month, 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        const formattedName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        const isCurrent = (mObj.year === realCurrentYear && mObj.month === realCurrentMonth);

        const percentStr = (mObj.activeSuccessRate * 100).toFixed(2) + '%';
        const successCount = mObj.activeSuccessDays;
        const totalCount = mObj.activeTotalDays;

        // Место в рейтинге (при совпадении результатов более новый месяц оказывается выше)
        const rankByBest = [...monthsArray].sort((a, b) => {
            if (b.activeSuccessRate !== a.activeSuccessRate) return b.activeSuccessRate - a.activeSuccessRate;
            if (b.activeSuccessDays !== a.activeSuccessDays) return b.activeSuccessDays - a.activeSuccessDays;
            return b.dateForSort - a.dateForSort;
        }).findIndex(m => m.monthKey === mObj.monthKey) + 1;

        let rankBadge = '';
        if (rankByBest === 1) {
            rankBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🏆 #1 Лучший</span>`;
        } else if (rankByBest === monthsArray.length && monthsArray.length > 1) {
            rankBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">⚠️ Худший</span>`;
        } else {
            rankBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">Место #${rankByBest}</span>`;
        }

        // Сравнение с текущим месяцем
        let comparisonTag = '';
        if (isCurrent) {
            comparisonTag = `<span class="font-bold text-xs text-primary-700 bg-primary-100 px-2.5 py-1 rounded-lg">Текущий месяц</span>`;
        } else {
            const diffCount = currentSuccessCount - successCount;
            if (diffCount > 0) {
                comparisonTag = `<span class="font-bold text-xs font-mono text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-lg">+${diffCount} ${getNounSuccesses(diffCount)} в тек. мес.</span>`;
            } else if (diffCount < 0) {
                comparisonTag = `<span class="font-bold text-xs font-mono text-rose-600 bg-rose-100/70 px-2.5 py-1 rounded-lg">${diffCount} ${getNounSuccesses(Math.abs(diffCount))} в тек. мес.</span>`;
            } else {
                comparisonTag = `<span class="font-bold text-xs font-mono text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-lg">Равно с тек. мес.</span>`;
            }
        }

        const borderClass = isCurrent 
            ? 'border-primary-400 bg-primary-50/40 shadow-sm' 
            : rankByBest === 1 
                ? 'border-amber-300 bg-amber-50/20' 
                : 'border-slate-100 bg-white';

        const cardHtml = `
            <div class="p-4 rounded-xl border ${borderClass} transition hover:shadow-md">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="font-extrabold text-slate-900 text-sm">${formattedName}</span>
                            ${rankBadge}
                        </div>
                        <p class="text-xs text-slate-500 font-medium">
                            Успехов: <span class="font-bold text-slate-800">${successCount}</span> из <span class="font-bold text-slate-800">${totalCount}</span> ${getNounDays(totalCount)}
                        </p>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end gap-4">
                        <div class="text-left sm:text-right">
                            <span class="text-base font-extrabold text-primary-600 font-mono block">${percentStr}</span>
                            <span class="text-[10px] text-slate-400 font-medium">Успешность</span>
                        </div>
                        <div>
                            ${comparisonTag}
                        </div>
                    </div>
                </div>

                <!-- Progress Bar for success rate -->
                <div class="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-primary-600 h-2 rounded-full transition-all duration-300" style="width: ${percentStr}"></div>
                </div>
            </div>
        `;

        listContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
