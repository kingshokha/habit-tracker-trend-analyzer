/**
 * HabitTracker Trend Analyzer - Chronology Tab
 */

function toggleHabitTableSort(col) {
    if (col === 'date') {
        currentSortMode = (currentSortMode === 'date-desc') ? 'date-asc' : 'date-desc';
    } else if (col === 'val') {
        currentSortMode = (currentSortMode === 'val-desc') ? 'val-asc' : 'val-desc';
    } else if (col === 'diff') {
        currentSortMode = (currentSortMode === 'succ-diff-desc') ? 'succ-diff-asc' : 'succ-diff-desc';
    } else if (col === 'succDays') {
        currentSortMode = (currentSortMode === 'succ-days-desc') ? 'succ-days-asc' : 'succ-days-desc';
    }
    
    const selector = document.getElementById('sortSelector');
    if (selector) {
        selector.value = currentSortMode;
    }

    renderDashboard();
}

function onSortChange(value) {
    currentSortMode = value;
    renderDashboard();
}

function setGroupingMode(mode) {
    currentGroupingMode = mode;
    showAllChronology = false; 
    
    const modes = ['day', 'week', 'month', 'quarter', 'year'];
    modes.forEach(m => {
        const btn = document.getElementById(`group-${m}-btn`);
        if (btn) {
            if (m === mode) {
                btn.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-primary-600 transition-all";
            } else {
                btn.className = "px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-700 transition-all";
            }
        }
    });

    renderDashboard();
}

function showAllChronologyDays() {
    showAllChronology = true;
    renderDashboard();
}

function renderHabitsTable(filteredData) {
    const tableBody = document.getElementById('habits-table-body');
    const tableHead = document.getElementById('habits-table-head');
    if (!tableBody || !tableHead) return;
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        const rowCountEl = document.getElementById('rendered-rows-count');
        if (rowCountEl) rowCountEl.textContent = 'Отображено записей: 0';
        return;
    }

    const getSortIcon = (col) => {
        if (col === 'date') {
            if (currentSortMode === 'date-desc') return '<span class="text-primary-600 font-bold">↓</span>';
            if (currentSortMode === 'date-asc') return '<span class="text-primary-600 font-bold">↑</span>';
        }
        if (col === 'val') {
            if (currentSortMode === 'val-desc') return '<span class="text-primary-600 font-bold">↓</span>';
            if (currentSortMode === 'val-asc') return '<span class="text-primary-600 font-bold">↑</span>';
        }
        if (col === 'diff') {
            if (currentSortMode === 'succ-diff-desc') return '<span class="text-primary-600 font-bold">↓</span>';
            if (currentSortMode === 'succ-diff-asc') return '<span class="text-primary-600 font-bold">↑</span>';
        }
        if (col === 'succDays') {
            if (currentSortMode === 'succ-days-desc') return '<span class="text-primary-600 font-bold">↓</span>';
            if (currentSortMode === 'succ-days-asc') return '<span class="text-primary-600 font-bold">↑</span>';
        }
        return '<span class="text-slate-300 opacity-40 group-hover:opacity-100 transition-opacity">↕</span>';
    };

    if (currentGroupingMode === 'day') {
        tableHead.innerHTML = `
            <tr class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 select-none">
                <th onclick="toggleHabitTableSort('date')" class="py-3 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по дате">
                    <div class="flex items-center gap-1">
                        <span>Дата</span>
                        ${getSortIcon('date')}
                    </div>
                </th>
                <th onclick="toggleHabitTableSort('val')" class="py-3 px-6 text-center cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по проценту успеха">
                    <div class="flex items-center justify-center gap-1">
                        <span>Процент успеха</span>
                        ${getSortIcon('val')}
                    </div>
                </th>
                <th onclick="toggleHabitTableSort('diff')" class="py-3 px-6 text-center cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по динамике">
                    <div class="flex items-center justify-center gap-1">
                        <span>Динамика</span>
                        ${getSortIcon('diff')}
                    </div>
                </th>
                <th onclick="toggleHabitTableSort('succDays')" class="py-3 px-6 text-right cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по результату">
                    <div class="flex items-center justify-end gap-1">
                        <span>Результат дня</span>
                        ${getSortIcon('succDays')}
                    </div>
                </th>
            </tr>
        `;
    } else {
        tableHead.innerHTML = `
            <tr class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 select-none">
                <th onclick="toggleHabitTableSort('date')" class="py-3 px-6 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по периодам">
                    <div class="flex items-center gap-1">
                        <span>Период</span>
                        ${getSortIcon('date')}
                    </div>
                </th>
                <th onclick="toggleHabitTableSort('val')" class="py-3 px-6 text-center cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по среднему проценту успеха">
                    <div class="flex items-center justify-center gap-1">
                        <span>Средний успех</span>
                        ${getSortIcon('val')}
                    </div>
                </th>
                <th onclick="toggleHabitTableSort('diff')" class="py-3 px-6 text-center cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по количеству успехов">
                    <div class="flex items-center justify-center gap-1">
                        <span>Динамика</span>
                        ${getSortIcon('diff')}
                    </div>
                </th>
                <th onclick="toggleHabitTableSort('succDays')" class="py-3 px-6 text-right cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition group" title="Сортировка по количеству успешных дней">
                    <div class="flex items-center justify-end gap-1">
                        <span>Доля успешных дней</span>
                        ${getSortIcon('succDays')}
                    </div>
                </th>
            </tr>
        `;
    }

    const displayList = getGroupedData(filteredData, currentGroupingMode);

    const displayData = [...displayList];
    displayData.sort((a, b) => {
        const dateA = a.dateForSorting || a.date;
        const dateB = b.dateForSorting || b.date;

        if (currentSortMode === 'date-desc') {
            return dateB - dateA;
        } else if (currentSortMode === 'date-asc') {
            return dateA - dateB;
        } else if (currentSortMode === 'val-desc') {
            if (b.value !== a.value) return b.value - a.value;
            return dateB - dateA;
        } else if (currentSortMode === 'val-asc') {
            if (a.value !== b.value) return a.value - b.value;
            return dateB - dateA;
        } else if (currentSortMode === 'succ-diff-desc') {
            const diffA = a.successDaysDiff !== undefined ? a.successDaysDiff : a.difference;
            const diffB = b.successDaysDiff !== undefined ? b.successDaysDiff : b.difference;
            if (diffB !== diffA) return diffB - diffA;
            return dateB - dateA;
        } else if (currentSortMode === 'succ-diff-asc') {
            const diffA = a.successDaysDiff !== undefined ? a.successDaysDiff : a.difference;
            const diffB = b.successDaysDiff !== undefined ? b.successDaysDiff : b.difference;
            if (diffA !== diffB) return diffA - diffB;
            return dateB - dateA;
        } else if (currentSortMode === 'succ-days-desc') {
            const sA = a.successDays !== undefined ? a.successDays : (a.status === 'Успех' ? 1 : 0);
            const sB = b.successDays !== undefined ? b.successDays : (b.status === 'Успех' ? 1 : 0);
            if (sB !== sA) return sB - sA;
            return dateB - dateA;
        } else if (currentSortMode === 'succ-days-asc') {
            const sA = a.successDays !== undefined ? a.successDays : (a.status === 'Успех' ? 1 : 0);
            const sB = b.successDays !== undefined ? b.successDays : (b.status === 'Успех' ? 1 : 0);
            if (sA !== sB) return sA - sB;
            return dateB - dateA;
        }
        return 0;
    });

    const showMoreBtn = document.getElementById('chronology-show-more-container');
    let dataToRender = displayData;

    if (currentGroupingMode === 'day') {
        if (!showAllChronology && displayData.length > 30) {
            dataToRender = displayData.slice(0, 30);
            if (showMoreBtn) showMoreBtn.classList.remove('hidden');
        } else {
            if (showMoreBtn) showMoreBtn.classList.add('hidden');
        }
    } else {
        if (showMoreBtn) showMoreBtn.classList.add('hidden');
    }

    const rowCountEl = document.getElementById('rendered-rows-count');
    if (rowCountEl) {
        rowCountEl.textContent = currentGroupingMode === 'day' && !showAllChronology && displayData.length > 30
            ? `Показаны последние 30 записей из ${displayData.length}`
            : `Отображено записей: ${displayData.length}`;
    }

    dataToRender.forEach(item => {
        let displayLabel, displayPercent, percentDifference, isSuccessStatus, ratioPercent;
        
        if (currentGroupingMode === 'day') {
            displayLabel = formatDateToString(item.date);
            displayPercent = (item.value * 100).toFixed(2) + '%';
            percentDifference = item.difference * 100;
            isSuccessStatus = item.status === 'Успех';
        } else {
            displayLabel = item.label;
            displayPercent = (item.value * 100).toFixed(2) + '%';
            percentDifference = item.difference * 100;
            ratioPercent = (item.successRate * 100).toFixed(0) + '%';
        }
        
        let diffText = '0.00%';
        let diffColor = 'text-slate-400';
        let diffIcon = '';

        if (item.isFirstGroup) {
            diffText = '—';
            diffColor = 'text-slate-400';
            diffIcon = '';
        } else if (percentDifference > 0) {
            diffText = `+${percentDifference.toFixed(2)}%`;
            diffColor = 'text-emerald-600 font-semibold';
            diffIcon = '↗';
        } else if (percentDifference < 0) {
            diffText = `${percentDifference.toFixed(2)}%`;
            diffColor = 'text-rose-600 font-semibold';
            diffIcon = '↘';
        }

        let dynamicCellContent = '';
        if (currentGroupingMode === 'day') {
            dynamicCellContent = `
                <span class="${diffColor} inline-flex items-center gap-1 font-mono">
                    ${diffIcon} ${diffText}
                </span>
            `;
        } else {
            let succDiffHtml = '';
            if (item.isFirstGroup) {
                succDiffHtml = `<span class="text-slate-400 font-bold block text-xs">—</span>`;
            } else if (item.isLatestPeriod) {
                // Для самой свежей записи в истории скрываем динамику по количеству успехов
                succDiffHtml = `<span class="text-slate-400 font-medium block text-xs">—</span>`;
            } else {
                const sDiff = item.successDaysDiff;
                if (sDiff > 0) {
                    succDiffHtml = `<span class="text-emerald-600 font-bold block text-xs">+${sDiff} ${getNounSuccesses(sDiff)}</span>`;
                } else if (sDiff < 0) {
                    succDiffHtml = `<span class="text-rose-600 font-bold block text-xs">${sDiff} ${getNounSuccesses(Math.abs(sDiff))}</span>`;
                } else {
                    succDiffHtml = `<span class="text-slate-400 font-bold block text-xs">0 успехов</span>`;
                }
            }

            dynamicCellContent = `
                <div class="flex flex-col items-center">
                    ${succDiffHtml}
                    <span class="${diffColor} inline-flex items-center gap-1 font-mono text-[10px] mt-0.5">
                        ${diffIcon} ${diffText}
                    </span>
                </div>
            `;
        }

        let badgeClass = '';
        let statusText = '';
        let statusIcon = '';

        if (currentGroupingMode === 'day') {
            if (isSuccessStatus) {
                badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
                statusText = 'Успех';
                statusIcon = 'check-circle-2';
            } else {
                badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200/50';
                statusText = 'Провал';
                statusIcon = 'x-circle';
            }
        } else if (currentGroupingMode === 'week') {
            const succ = item.successDays;
            if (succ >= 5) {
                badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
            } else if (succ > 2) { 
                badgeClass = 'bg-amber-100/70 text-amber-800 border border-amber-200/50';
            } else { 
                badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200/50';
            }
            statusText = `${item.successDays} из ${item.totalDays} (${ratioPercent})`;
            statusIcon = 'check-circle-2';
        } else if (currentGroupingMode === 'month') {
            const rate = item.successRate;
            if (rate > 0.70) {
                badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
            } else if (rate >= 0.55) { 
                badgeClass = 'bg-amber-100/70 text-amber-800 border border-amber-200/50';
            } else { 
                badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200/50';
            }
            statusText = `${item.successDays} из ${item.totalDays} (${ratioPercent})`;
            statusIcon = 'check-circle-2';
        } else if (currentGroupingMode === 'quarter') {
            const rate = item.successRate;
            if (rate > 0.69) {
                badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
            } else if (rate >= 0.49) {
                badgeClass = 'bg-amber-100/70 text-amber-800 border border-amber-200/50';
            } else {
                badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200/50';
            }
            statusText = `${item.successDays} из ${item.totalDays} (${ratioPercent})`;
            statusIcon = 'check-circle-2';
        } else if (currentGroupingMode === 'year') {
            const rate = item.successRate;
            if (rate >= 0.68) {
                badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
            } else if (rate >= 0.50) {
                badgeClass = 'bg-amber-100/70 text-amber-800 border border-amber-200/50';
            } else {
                badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200/50';
            }
            statusText = `${item.successDays} из ${item.totalDays} (${ratioPercent})`;
            statusIcon = 'check-circle-2';
        }

        const tableRow = `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="py-4 px-6 font-semibold text-slate-950">${displayLabel}</td>
                <td class="py-4 px-6 text-center font-mono text-slate-700">${displayPercent}</td>
                <td class="py-4 px-6 text-center">
                    ${dynamicCellContent}
                </td>
                <td class="py-4 px-6 text-right">
                    <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${badgeClass}">
                        <i data-lucide="${statusIcon}" class="w-3.5 h-3.5"></i> ${statusText}
                    </span>
                </td>
            </tr>
        `;

        tableBody.insertAdjacentHTML('beforeend', tableRow);
    });

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
