/**
 * HabitTracker Trend Analyzer - Overview Tab
 */

function renderOverviewTab() {
    if (habitsData.length === 0) return;

    const chronData = [...habitsData].sort((a, b) => a.date - b.date);
    const latestItem = chronData[chronData.length - 1];
    const latestDate = latestItem.date;

    const targetDay = latestDate.getDate();
    const targetMonth = latestDate.getMonth();
    const targetYear = latestDate.getFullYear();
    const minDate = chronData[0].date;

    // Расчет данных за текущие полгода (последние 6 месяцев / 182.625 дней)
    const msInDay = 24 * 60 * 60 * 1000;
    const halfYearMs = 182.625 * msInDay;
    const currentHalfYearStartTime = latestDate.getTime() - halfYearMs;
    const prevHalfYearStartTime = currentHalfYearStartTime - halfYearMs;

    const currentHalfYearItems = chronData.filter(item => item.date.getTime() >= currentHalfYearStartTime);
    const totalDaysCurrent = currentHalfYearItems.length;
    const totalSuccessesCurrent = currentHalfYearItems.filter(item => item.status === 'Успех').length;
    const currentPercentage = totalDaysCurrent > 0 ? (totalSuccessesCurrent * 100 / totalDaysCurrent) : 0;
    const currentMonthsCount = totalDaysCurrent > 0 ? (totalDaysCurrent / 30.4375) : 6;
    const currentAvgMonthly = currentMonthsCount > 0 ? (totalSuccessesCurrent / currentMonthsCount) : 0;

    // Расчет данных за предыдущее полугодие (6 месяцев до текущего полугодия)
    const prevHalfYearItems = chronData.filter(item => item.date.getTime() >= prevHalfYearStartTime && item.date.getTime() < currentHalfYearStartTime);
    const totalDaysPrev = prevHalfYearItems.length;
    const totalSuccessesPrev = prevHalfYearItems.filter(item => item.status === 'Успех').length;
    const prevPercentage = totalDaysPrev > 0 ? (totalSuccessesPrev * 100 / totalDaysPrev) : 0;
    const prevMonthsCount = totalDaysPrev > 0 ? (totalDaysPrev / 30.4375) : 6;
    const prevAvgMonthly = prevMonthsCount > 0 ? (totalSuccessesPrev / prevMonthsCount) : 0;

    // Элементы интерфейса
    const halfyearCountEl = document.getElementById('overview-halfyear-count');
    const halfyearComparisonEl = document.getElementById('overview-halfyear-comparison');
    const currentDetailsEl = document.getElementById('overview-current-halfyear-details');
    const prevDetailsEl = document.getElementById('overview-prev-halfyear-details');

    if (halfyearCountEl) {
        halfyearCountEl.textContent = `${currentAvgMonthly.toFixed(1)} ${getNounSuccesses(Math.round(currentAvgMonthly))}/мес`;
    }

    if (currentDetailsEl) {
        currentDetailsEl.textContent = `${totalSuccessesCurrent} ${getNounSuccesses(totalSuccessesCurrent)} из ${totalDaysCurrent} ${getNounDays(totalDaysCurrent)} (${currentPercentage.toFixed(2)}%)`;
    }

    if (prevDetailsEl) {
        if (totalDaysPrev === 0) {
            prevDetailsEl.textContent = 'нет данных в истории';
        } else {
            prevDetailsEl.textContent = `${totalSuccessesPrev} ${getNounSuccesses(totalSuccessesPrev)} из ${totalDaysPrev} ${getNounDays(totalDaysPrev)} (${prevPercentage.toFixed(2)}%)`;
        }
    }

    // Сравнение с прошлым полугодием
    if (halfyearComparisonEl) {
        if (totalDaysPrev === 0) {
            halfyearComparisonEl.className = "text-[11px] text-slate-400 font-semibold mt-0.5 select-none";
            halfyearComparisonEl.textContent = "базовый период (нет прошлого полугодия)";
        } else {
            const diffSuccessesTotal = totalSuccessesCurrent - totalSuccessesPrev;
            const diffMonthly = currentAvgMonthly - prevAvgMonthly;
            const diffSign = diffSuccessesTotal > 0 ? '+' : '';

            if (diffSuccessesTotal > 0) {
                halfyearComparisonEl.className = "text-[11px] font-extrabold text-emerald-600 mt-0.5";
                halfyearComparisonEl.innerHTML = `<span class="inline-block transform scale-90">▲</span> ${diffSign}${diffSuccessesTotal} ${getNounSuccesses(Math.abs(diffSuccessesTotal))} (${diffSign}${diffMonthly.toFixed(1)}/мес)`;
            } else if (diffSuccessesTotal < 0) {
                halfyearComparisonEl.className = "text-[11px] font-extrabold text-rose-600 mt-0.5";
                halfyearComparisonEl.innerHTML = `<span class="inline-block transform scale-90">▼</span> ${diffSuccessesTotal} ${getNounSuccesses(Math.abs(diffSuccessesTotal))} (${diffMonthly.toFixed(1)}/мес)`;
            } else {
                halfyearComparisonEl.className = "text-[11px] font-extrabold text-slate-400 mt-0.5 select-none";
                halfyearComparisonEl.textContent = `0 (равно с прошлым полугодием)`;
            }
        }
    }

    const monthsListContainer = document.getElementById('overview-months-list');
    if (monthsListContainer) {
        monthsListContainer.innerHTML = '';
        const targetDayEl = document.getElementById('overview-target-day');
        if (targetDayEl) targetDayEl.textContent = `${targetDay}-го`;

        const monthsToDisplay = [];
        for (let m = 0; m < 6; m++) {
            let checkMonth = latestDate.getMonth() - m;
            let checkYear = latestDate.getFullYear();
            while (checkMonth < 0) {
                checkMonth += 12;
                checkYear -= 1;
            }

            const lastDayOfCheckMonth = new Date(checkYear, checkMonth + 1, 0);
            if (lastDayOfCheckMonth < minDate) {
                break; 
            }

            const monthItems = chronData.filter(item => 
                item.date.getFullYear() === checkYear &&
                item.date.getMonth() === checkMonth &&
                item.date.getDate() <= targetDay
            );

            monthsToDisplay.push({
                year: checkYear,
                month: checkMonth,
                items: monthItems
            });
        }

        const latestMonthObj = monthsToDisplay[0];
        const latestSuccessCount = latestMonthObj ? latestMonthObj.items.filter(item => item.status === 'Успех').length : 0;

        monthsToDisplay.forEach(mInfo => {
            const monthName = new Date(mInfo.year, mInfo.month, 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
            const total = mInfo.items.length;
            const successCount = mInfo.items.filter(item => item.status === 'Успех').length;
            const avg = total > 0 ? mInfo.items.reduce((s, i) => s + i.value, 0) / total : 0;
            const avgPercent = (avg * 100).toFixed(2) + '%';

            const isCurrent = mInfo.year === targetYear && mInfo.month === targetMonth;
            let diffBadgeHtml = "";

            if (isCurrent) {
                diffBadgeHtml = `
                    <span class="inline-flex items-center gap-1 font-bold text-xs text-primary-700 bg-primary-100 px-2.5 py-1 rounded-lg select-none">
                        Базовый месяц
                    </span>`;
            } else {
                const successDiff = latestSuccessCount - successCount;

                if (successDiff > 0) {
                    diffBadgeHtml = `
                        <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                            +${successDiff} ${getNounSuccesses(successDiff)} к прошл. мес.
                        </span>`;
                } else if (successDiff < 0) {
                    diffBadgeHtml = `
                        <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-rose-600 bg-rose-100/70 px-2.5 py-1 rounded-lg">
                            ${successDiff} ${getNounSuccesses(Math.abs(successDiff))} к прошл. мес.
                        </span>`;
                } else {
                    diffBadgeHtml = `
                        <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-lg select-none">
                            Без изменений
                        </span>`;
                }
            }

            let dataText = '';
            if (total > 0) {
                dataText = `${successCount} ${getNounSuccesses(successCount)} из ${total} дней в сумме (${avgPercent})`;
            } else {
                dataText = 'Нет записей в этот период';
            }

            const highlightClass = isCurrent 
                ? 'border-primary-500/30 bg-primary-50/50' 
                : 'border-slate-100 bg-white';

            const itemHtml = `
                <div class="flex items-center justify-between p-3.5 rounded-xl border ${highlightClass} text-xs shadow-sm transition hover:scale-[1.01]">
                    <div class="space-y-1">
                        <span class="font-bold text-slate-900 capitalize">${monthName} ${isCurrent ? '<span class="text-[9px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded ml-1.5 font-semibold">Текущий</span>' : ''}</span>
                        <span class="block text-[10px] text-slate-400 font-medium">${dataText}</span>
                    </div>
                    <div class="text-right">
                        ${diffBadgeHtml}
                    </div>
                </div>
            `;
            monthsListContainer.insertAdjacentHTML('beforeend', itemHtml);
        });
    }

    const yearsListContainer = document.getElementById('overview-years-list');
    if (yearsListContainer) {
        yearsListContainer.innerHTML = '';
        
        const targetDayStr = String(targetDay).padStart(2, '0');
        const targetMonthStr = String(targetMonth + 1).padStart(2, '0');
        const targetDateEl = document.getElementById('overview-target-date');
        if (targetDateEl) targetDateEl.textContent = `${targetDayStr}.${targetMonthStr}`;

        const yearsToDisplay = [];
        const minYear = minDate.getFullYear();
        const maxYear = latestDate.getFullYear();

        for (let y = maxYear; y >= minYear; y--) {
            const ytdItems = chronData.filter(item => {
                const itemYear = item.date.getFullYear();
                if (itemYear !== y) return false;
                
                const m = item.date.getMonth();
                const d = item.date.getDate();
                if (m < targetMonth) return true;
                if (m === targetMonth && d <= targetDay) return true;
                return false;
            });

            yearsToDisplay.push({
                year: y,
                items: ytdItems
            });
        }

        const latestYearObj = yearsToDisplay[0];
        const latestYearSuccessCount = latestYearObj ? latestYearObj.items.filter(item => item.status === 'Успех').length : 0;
        const latestYearVal = latestYearObj ? latestYearObj.year : maxYear;

        yearsToDisplay.forEach(yInfo => {
            const total = yInfo.items.length;
            const successCount = yInfo.items.filter(item => item.status === 'Успех').length;
            const avg = total > 0 ? yInfo.items.reduce((s, i) => s + i.value, 0) / total : 0;
            const avgPercent = (avg * 100).toFixed(2) + '%';

            const isCurrent = yInfo.year === maxYear;
            let diffBadgeHtml = "";

            if (isCurrent) {
                diffBadgeHtml = `
                    <span class="inline-flex items-center gap-1 font-bold text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg select-none">
                        Базовый год
                    </span>`;
            } else {
                const successDiff = latestYearSuccessCount - successCount;

                if (total > 0 && latestYearObj && latestYearObj.items.length > 0) {
                    if (successDiff > 0) {
                        diffBadgeHtml = `
                            <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                                +${successDiff} ${getNounSuccesses(successDiff)} в ${latestYearVal} г.
                            </span>`;
                    } else if (successDiff < 0) {
                        diffBadgeHtml = `
                            <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-rose-600 bg-rose-100/70 px-2.5 py-1 rounded-lg">
                                ${successDiff} ${getNounSuccesses(Math.abs(successDiff))} в ${latestYearVal} г.
                            </span>`;
                    } else {
                        diffBadgeHtml = `
                            <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-lg select-none">
                                Без изменений
                            </span>`;
                    }
                } else {
                    diffBadgeHtml = `
                        <span class="inline-flex items-center gap-1 font-bold text-[10px] text-slate-400 bg-slate-100/30 px-2.5 py-1 rounded-lg select-none">
                            Нет данных
                        </span>`;
                }
            }

            let dataText = '';
            if (total > 0) {
                dataText = `${successCount} ${getNounSuccesses(successCount)} из ${total} дней в сумме (${avgPercent})`;
            } else {
                dataText = 'Нет записей в этот период';
            }

            const highlightClass = isCurrent 
                ? 'border-emerald-500/30 bg-emerald-50/50' 
                : 'border-slate-100 bg-white';

            const itemHtml = `
                <div class="flex items-center justify-between p-3.5 rounded-xl border ${highlightClass} text-xs shadow-sm transition hover:scale-[1.01]">
                    <div class="space-y-1">
                        <span class="font-bold text-slate-900">${yInfo.year} год ${isCurrent ? '<span class="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1.5 font-semibold">Текущий</span>' : ''}</span>
                        <span class="block text-[10px] text-slate-400 font-medium">Период: 01.01 — ${targetDayStr}.${targetMonthStr} • ${dataText}</span>
                    </div>
                    <div class="text-right">
                        ${diffBadgeHtml}
                    </div>
                </div>
            `;
            yearsListContainer.insertAdjacentHTML('beforeend', itemHtml);
        });
    }

    const rowCountEl = document.getElementById('rendered-rows-count');
    if (rowCountEl) rowCountEl.textContent = `Загружено записей в историю: ${habitsData.length}`;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
