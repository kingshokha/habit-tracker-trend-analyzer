/**
 * HabitTracker Trend Analyzer - Achievements Tab (Достижения)
 */

function renderAchievementsTab() {
    if (habitsData.length === 0) return;

    // Сортируем ВСЮ историю habitsData хронологически по дате
    const chronData = [...habitsData].sort((a, b) => a.date - b.date);
    const successItems = chronData.filter(item => item.status === 'Успех');

    const totalSuccesses = successItems.length;
    const completedHundredsCount = Math.floor(totalSuccesses / 100);

    // Элементы суммарной статистики
    const totalSuccEl = document.getElementById('achievements-total-successes');
    const completedHundredsTextEl = document.getElementById('achievements-completed-hundreds-text');
    const summaryBadgeEl = document.getElementById('achievements-summary-badge');
    const fastestEl = document.getElementById('achievements-fastest-hundred');
    const fastestDaysLabelEl = document.getElementById('achievements-fastest-days-label');
    const fastestTitleEl = document.getElementById('achievements-fastest-title');
    const avgDaysEl = document.getElementById('achievements-avg-days-hundred');
    const avgDaysLabelEl = document.getElementById('achievements-avg-days-label');
    const avgRateTextEl = document.getElementById('achievements-avg-rate-text');

    if (totalSuccEl) totalSuccEl.textContent = totalSuccesses;
    if (completedHundredsTextEl) completedHundredsTextEl.textContent = `${completedHundredsCount} ${getNounHundreds(completedHundredsCount)} закрыто`;
    if (summaryBadgeEl) summaryBadgeEl.textContent = `${completedHundredsCount} ${getNounHundreds(completedHundredsCount)} успехов`;

    // Формируем сотни
    const hundredsList = [];
    for (let i = 0; i < completedHundredsCount; i++) {
        const chunk = successItems.slice(i * 100, (i + 1) * 100);
        const firstSuccessDate = chunk[0].date;
        const lastSuccessDate = chunk[99].date;

        // Календарных дней от 1-го успеха в этой сотне до 100-го успеха включительно
        const calendarDays = Math.round((lastSuccessDate - firstSuccessDate) / (1000 * 60 * 60 * 24)) + 1;

        // Всего записей в трекере за этот период
        const trackerItemsInPeriod = chronData.filter(item => item.date >= firstSuccessDate && item.date <= lastSuccessDate);
        const totalTrackerDays = trackerItemsInPeriod.length;
        const successRate = totalTrackerDays > 0 ? (100 / totalTrackerDays) : (100 / calendarDays);

        hundredsList.push({
            index: i + 1,
            startSuccessNum: i * 100 + 1,
            endSuccessNum: (i + 1) * 100,
            startDate: firstSuccessDate,
            endDate: lastSuccessDate,
            calendarDays: calendarDays,
            totalTrackerDays: totalTrackerDays,
            successRate: successRate
        });
    }

    // Рассчитываем рекордную сотню (минимальное число календарных дней)
    let fastestHundred = null;
    if (hundredsList.length > 0) {
        fastestHundred = hundredsList[0];
        hundredsList.forEach(h => {
            if (h.calendarDays < fastestHundred.calendarDays) {
                fastestHundred = h;
            }
        });
    }

    if (fastestHundred) {
        if (fastestEl) fastestEl.textContent = fastestHundred.calendarDays;
        if (fastestDaysLabelEl) fastestDaysLabelEl.textContent = getNounDays(fastestHundred.calendarDays);
        if (fastestTitleEl) fastestTitleEl.textContent = `${fastestHundred.index}-я сотня (${formatDateToString(fastestHundred.startDate)} — ${formatDateToString(fastestHundred.endDate)})`;
    } else {
        if (fastestEl) fastestEl.textContent = '—';
        if (fastestDaysLabelEl) fastestDaysLabelEl.textContent = '';
        if (fastestTitleEl) fastestTitleEl.textContent = 'Нужно 100 успехов для рекорда';
    }

    // Среднее число дней на 100 успехов
    if (hundredsList.length > 0) {
        const sumDays = hundredsList.reduce((acc, h) => acc + h.calendarDays, 0);
        const avgDays = Math.round(sumDays / hundredsList.length);
        if (avgDaysEl) avgDaysEl.textContent = avgDays;
        if (avgDaysLabelEl) avgDaysLabelEl.textContent = getNounDays(avgDays);
        if (avgRateTextEl) avgRateTextEl.textContent = `Средняя скорость по ${hundredsList.length} ${getNounHundreds(hundredsList.length)}`;
    } else {
        if (avgDaysEl) avgDaysEl.textContent = '—';
        if (avgDaysLabelEl) avgDaysLabelEl.textContent = '';
        if (avgRateTextEl) avgRateTextEl.textContent = 'Пока нет ни одной закрытой сотни';
    }

    // Рендеринг особых достижений
    try {
        const specialGridEl = document.getElementById('special-achievements-grid');
        if (specialGridEl) {
            specialGridEl.innerHTML = '';
            
            // 1. Недельный спринт (7+ дней подряд)
            const allSuccessStreaks = getStreakLists(habitsData).successes;
            const weekSprints = allSuccessStreaks.filter(s => s.count >= 7);
            const sprintHistory = weekSprints.map((s, idx) => ({
                title: `#${weekSprints.length - idx} • ${s.count} ${getNounDays(s.count)} подряд`,
                subtext: `${formatDateToString(s.start)} — ${formatDateToString(s.end)} (${getDaysAgoText(s.end)})`,
                valueText: `${s.count} дн.`,
                valueColorClass: 'text-slate-800 font-bold',
                badgeText: s.count >= 14 ? '🔥 Двойная неделя' : ''
            }));

            // 2. Легендарная серия (Каждый новый рекорд длительности)
            const chronSuccessStreaks = [...allSuccessStreaks].sort((a, b) => a.start - b.start);
            let maxStreakSoFar = 0;
            const recordBreaks = [];
            chronSuccessStreaks.forEach(s => {
                if (s.count > maxStreakSoFar) {
                    recordBreaks.push({ streak: s, prevRecord: maxStreakSoFar });
                    maxStreakSoFar = s.count;
                }
            });

            const legendHistory = recordBreaks.map((r, idx) => {
                const diff = r.streak.count - r.prevRecord;
                return {
                    title: `#${idx + 1} • ${r.streak.count} ${getNounDays(r.streak.count)} подряд`,
                    subtext: `${formatDateToString(r.streak.start)} — ${formatDateToString(r.streak.end)} (${getDaysAgoText(r.streak.end)})`,
                    valueText: r.prevRecord > 0 ? `+${diff} ${getNounDays(diff)}` : 'Базовый рекорд',
                    valueColorClass: r.prevRecord > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium',
                    badgeText: idx === recordBreaks.length - 1 ? '🏆 Действующий рекорд' : ''
                };
            }).reverse();

            // 3. Сверхзвуковая сотня (На 10+ дней быстрее среднего темпа за последние 2 года)
            const supersonicHundreds = [];
            hundredsList.forEach((h, idx) => {
                const twoYearsMs = 2 * 365.25 * 24 * 60 * 60 * 1000;
                const minDate = h.endDate - twoYearsMs;
                
                const priorHundredsIn2Years = hundredsList.slice(0, idx).filter(p => p.endDate >= minDate);
                const pool = priorHundredsIn2Years.length > 0 ? priorHundredsIn2Years : hundredsList.slice(0, idx);
                
                if (pool.length > 0) {
                    const priorAvg = pool.reduce((sum, p) => sum + p.calendarDays, 0) / pool.length;
                    if (h.calendarDays <= (priorAvg - 10)) {
                        supersonicHundreds.push({
                            hundred: h,
                            priorAvg: priorAvg,
                            daysFaster: Math.round(priorAvg - h.calendarDays)
                        });
                    }
                }
            });

            const supersonicHistory = supersonicHundreds.map(sh => ({
                title: `<span class="text-slate-400 font-normal">#${sh.hundred.index}</span> • ${sh.hundred.calendarDays} ${getNounDays(sh.hundred.calendarDays)}`,
                subtext: `Период: ${formatDateToString(sh.hundred.startDate)} — ${formatDateToString(sh.hundred.endDate)}`,
                valueText: `-${sh.daysFaster} ${getNounDays(sh.daysFaster)}`,
                valueColorClass: 'text-emerald-600 font-bold',
                badgeText: `Быстрее среднего 2 лет (${Math.round(sh.priorAvg)} дн.)`
            })).reverse();

            // 4. Абсолютный рекорд сотни (Новый рекорд минимального времени на 100 успехов)
            let minDaysSoFar = Infinity;
            const speedRecords = [];
            hundredsList.forEach(h => {
                if (h.calendarDays < minDaysSoFar) {
                    speedRecords.push({ hundred: h, prevRecord: minDaysSoFar === Infinity ? null : minDaysSoFar });
                    minDaysSoFar = h.calendarDays;
                }
            });

            const fastestRecordHistory = speedRecords.map((sr, idx) => {
                let valText = 'Базовый рекорд';
                let valColor = 'text-slate-400 font-medium';
                if (sr.prevRecord) {
                    const diff = sr.hundred.calendarDays - sr.prevRecord;
                    valText = `${diff} ${getNounDays(Math.abs(diff))}`;
                    valColor = 'text-emerald-600 font-bold';
                }
                return {
                    title: `<span class="text-slate-400 font-normal">#${sr.hundred.index}</span> • ${sr.hundred.calendarDays} ${getNounDays(sr.hundred.calendarDays)}`,
                    subtext: `Период: ${formatDateToString(sr.hundred.startDate)} — ${formatDateToString(sr.hundred.endDate)}`,
                    valueText: valText,
                    valueColorClass: valColor,
                    badgeText: idx === speedRecords.length - 1 ? '⚡ Действующий рекорд' : ''
                };
            }).reverse();

            // 5. Успешный месяц (закрыть месяц на 2+ успеха больше среднего показателя за последний год)
            const overallChron = [...habitsData].sort((a, b) => a.date - b.date);
            const groupedMonths = getGroupedData(overallChron, 'month');
            const successfulMonths = [];

            groupedMonths.forEach((m, idx) => {
                const prior12Months = groupedMonths.slice(Math.max(0, idx - 12), idx);
                if (prior12Months.length > 0) {
                    const priorAvgSuccesses = prior12Months.reduce((sum, pm) => sum + pm.successDays, 0) / prior12Months.length;
                    if (m.successDays >= priorAvgSuccesses + 2) {
                        successfulMonths.push({
                            monthObj: m,
                            priorAvg: priorAvgSuccesses
                        });
                    }
                }
            });

            const successfulMonthHistory = successfulMonths.map(sm => {
                const firstDate = (sm.monthObj.items && sm.monthObj.items.length > 0) ? sm.monthObj.items[0].date : null;
                const lastDate = (sm.monthObj.items && sm.monthObj.items.length > 0) ? sm.monthObj.items[sm.monthObj.items.length - 1].date : null;
                const datePeriodText = (firstDate && lastDate) ? `${formatDateToString(firstDate)} — ${formatDateToString(lastDate)}` : sm.monthObj.label;
                
                return {
                    title: `${sm.monthObj.label} • ${sm.monthObj.successDays} ${getNounSuccesses(sm.monthObj.successDays)}`,
                    subtext: `Период: ${datePeriodText}`,
                    valueText: `+${(sm.monthObj.successDays - sm.priorAvg).toFixed(1)} усп.`,
                    valueColorClass: 'text-emerald-600 font-bold',
                    badgeText: `Среднее 12 мес.: ${sm.priorAvg.toFixed(1)} усп.`
                };
            }).reverse();

            // 6. Клуб успехов (100, 300, 500, 800, 1000, 1200 успехов)
            const clubMilestones = [100, 300, 500, 800, 1000, 1200];
            const clubHistory = clubMilestones.map(m => {
                if (totalSuccesses >= m) {
                    const item = successItems[m - 1];
                    const daysToReach = Math.round((item.date - chronData[0].date) / (1000 * 60 * 60 * 24)) + 1;
                    return {
                        title: `Клуб ${m} успехов — Достигнуто!`,
                        subtext: `Достигнуто: ${formatDateToString(item.date)} (${getDaysAgoText(item.date)})`,
                        valueText: `За ${daysToReach} ${getNounDays(daysToReach)}`,
                        valueColorClass: 'text-emerald-600 font-bold',
                        badgeText: `👑 Клуб ${m}`
                    };
                } else {
                    return {
                        title: `Клуб ${m} успехов (в процессе)`,
                        subtext: `Накоплено ${totalSuccesses} из ${m} успехов (осталось ${m - totalSuccesses})`,
                        valueText: `${(totalSuccesses * 100 / m).toFixed(1)}%`,
                        valueColorClass: 'text-slate-400 font-medium',
                        badgeText: ''
                    };
                }
            });

            const reachedClubMilestones = clubMilestones.filter(m => totalSuccesses >= m);
            const highestClub = reachedClubMilestones.length > 0 ? reachedClubMilestones[reachedClubMilestones.length - 1] : 0;

            specialAchievementsData = {
                sprint: {
                    icon: '⚡',
                    title: 'Недельный спринт',
                    desc: 'Каждая серия из 7 и более успешных дней подряд.',
                    statusText: weekSprints.length > 0 ? `Выполнено ${weekSprints.length} раз` : 'Пока не получено',
                    statusBadgeClass: weekSprints.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600',
                    history: sprintHistory
                },
                legend: {
                    icon: '🏆',
                    title: 'Легендарная серия',
                    desc: 'Установка нового рекорда самой длинной серии успехов.',
                    statusText: recordBreaks.length > 0 ? `Установлено ${recordBreaks.length} рекордов` : 'Пока не получено',
                    statusBadgeClass: recordBreaks.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
                    history: legendHistory
                },
                supersonic: {
                    icon: '🚀',
                    title: 'Сверхзвуковая сотня',
                    desc: 'Закрыть 100 успехов на 10+ дней быстрее своего среднего темпа за последние 2 года.',
                    statusText: supersonicHundreds.length > 0 ? `Выполнено ${supersonicHundreds.length} раз` : 'Пока не получено',
                    statusBadgeClass: supersonicHundreds.length > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600',
                    history: supersonicHistory
                },
                fastestRecord: {
                    icon: '⏱️',
                    title: 'Абсолютный рекорд сотни',
                    desc: 'Установка нового рекорда скорости закрытия 100 успехов за историю.',
                    statusText: speedRecords.length > 0 ? `Установлено ${speedRecords.length} рекордов` : 'Пока не получено',
                    statusBadgeClass: speedRecords.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600',
                    history: fastestRecordHistory
                },
                successfulMonth: {
                    icon: '🌟',
                    title: 'Успешный месяц',
                    desc: 'Закрыть месяц на 2+ успеха больше, чем средний показатель за последний год.',
                    statusText: successfulMonths.length > 0 ? `Выполнено ${successfulMonths.length} раз` : 'Пока не получено',
                    statusBadgeClass: successfulMonths.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600',
                    history: successfulMonthHistory
                },
                club: {
                    icon: '👑',
                    title: 'Клуб успехов',
                    desc: 'Накопить 100, 300, 500, 800, 1000 и 1200 успешных дней.',
                    statusText: highestClub > 0 ? `В клубе ${highestClub}!` : `${totalSuccesses} / 100 успехов`,
                    statusBadgeClass: highestClub > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
                    history: clubHistory
                }
            };

            const achKeys = ['sprint', 'legend', 'supersonic', 'fastestRecord', 'successfulMonth', 'club'];
            achKeys.forEach(key => {
                const ach = specialAchievementsData[key];
                const isUnlocked = ach.history.length > 0 && (key !== 'club' || highestClub > 0);

                const borderClass = isUnlocked
                    ? 'border-slate-200 bg-white hover:border-primary-400 hover:shadow-md cursor-pointer'
                    : 'border-slate-150 bg-slate-50/60 opacity-80 cursor-pointer hover:bg-slate-100/60';

                const cardHtml = `
                    <div onclick="openAchievementModal('${key}')" class="p-4 rounded-xl border ${borderClass} transition space-y-3 group">
                        <div class="flex items-start justify-between">
                            <div class="p-2.5 bg-slate-100 rounded-xl text-xl font-bold group-hover:scale-110 transition-transform">
                                ${ach.icon}
                            </div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ach.statusBadgeClass}">
                                ${ach.statusText}
                            </span>
                        </div>

                        <div class="space-y-1">
                            <h5 class="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                                <span>${ach.title}</span>
                                <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all"></i>
                            </h5>
                            <p class="text-[10px] text-slate-500 font-medium leading-relaxed">${ach.desc}</p>
                        </div>

                        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                            <span class="text-primary-600 font-bold group-hover:underline">Посмотреть историю</span>
                            <span>${ach.history.length} ${ach.history.length === 1 ? 'запись' : 'записей'}</span>
                        </div>
                    </div>
                `;
                specialGridEl.insertAdjacentHTML('beforeend', cardHtml);
            });
        }
    } catch (err) {
        console.error("Error rendering special achievements:", err);
    }

    // Рендеринг активной сотни в процессе
    const activeCardEl = document.getElementById('achievements-active-card');
    if (activeCardEl) {
        const currentProgressCount = totalSuccesses % 100;
        const nextHundredIndex = completedHundredsCount + 1;
        const remainingSuccesses = 100 - currentProgressCount;
        const progressPercent = currentProgressCount; // 0..99%

        if (totalSuccesses === 0) {
            activeCardEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-primary-100 text-primary-600 rounded-xl">
                        <i data-lucide="target" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-slate-900">1-я сотня успехов (в процессе)</h4>
                        <p class="text-xs text-slate-500 font-medium">Пока нет зарегистрированных успехов в истории</p>
                    </div>
                </div>
            `;
        } else {
            const currentChunkSuccesses = successItems.slice(completedHundredsCount * 100);
            const firstDateInCurrentChunk = currentChunkSuccesses.length > 0 ? currentChunkSuccesses[0].date : (chronData[0] ? chronData[0].date : new Date());
            const latestDate = chronData[chronData.length - 1].date;
            const daysSoFar = Math.round((latestDate - firstDateInCurrentChunk) / (1000 * 60 * 60 * 24)) + 1;

            activeCardEl.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-600 text-white uppercase tracking-wider">В процессе</span>
                            <h4 class="text-sm font-extrabold text-slate-900">${nextHundredIndex}-я сотня успехов (${completedHundredsCount * 100 + 1}–${nextHundredIndex * 100})</h4>
                        </div>
                        <p class="text-xs text-slate-600 font-medium">
                            Накоплено <span class="font-bold text-primary-700">${currentProgressCount} из 100 успехов</span> 
                            (осталось <span class="font-bold text-primary-700">${remainingSuccesses} ${getNounSuccesses(remainingSuccesses)}</span>)
                        </p>
                    </div>
                    <div class="text-left sm:text-right">
                        <span class="text-lg font-extrabold text-primary-600 font-mono">${daysSoFar} ${getNounDays(daysSoFar)}</span>
                        <span class="text-[10px] text-slate-400 block font-medium">длится эта сотня (с ${formatDateToString(firstDateInCurrentChunk)})</span>
                    </div>
                </div>

                <!-- Progress bar -->
                <div class="space-y-1">
                    <div class="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-primary-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                        <span>${completedHundredsCount * 100} успехов</span>
                        <span>${progressPercent}% заполнено</span>
                        <span>${nextHundredIndex * 100} успехов</span>
                    </div>
                </div>
            `;
        }
    }

    // Рендеринг списка закрытых сотен
    const hundredsListContainer = document.getElementById('achievements-hundreds-list');
    if (hundredsListContainer) {
        hundredsListContainer.innerHTML = '';

        if (hundredsList.length === 0) {
            hundredsListContainer.innerHTML = `
                <div class="text-center py-10 bg-slate-50 border border-slate-150 rounded-xl text-slate-400 text-xs font-medium">
                    Пока не достигнуто 100 успехов. Ваша первая сотня появится здесь после достижения 100 успехов!
                </div>
            `;
        } else {
            const reversedHundreds = [...hundredsList].reverse();

            reversedHundreds.forEach(h => {
                const isFastest = fastestHundred && h.index === fastestHundred.index;
                const prevHundred = hundredsList.find(prev => prev.index === h.index - 1);

                let diffBadgeHtml = '';
                if (prevHundred) {
                    const daysDiff = h.calendarDays - prevHundred.calendarDays;
                    if (daysDiff < 0) {
                        diffBadgeHtml = `
                            <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-emerald-600 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                                ${daysDiff} ${getNounDays(Math.abs(daysDiff))}
                            </span>`;
                    } else if (daysDiff > 0) {
                        diffBadgeHtml = `
                            <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-rose-600 bg-rose-100/70 px-2.5 py-1 rounded-lg">
                                +${daysDiff} ${getNounDays(daysDiff)}
                            </span>`;
                    } else {
                        diffBadgeHtml = `
                            <span class="inline-flex items-center gap-1 font-bold text-xs font-mono text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-lg select-none">
                                0 дней
                            </span>`;
                    }
                } else {
                    diffBadgeHtml = `
                        <span class="inline-flex items-center gap-1 font-bold text-xs text-primary-700 bg-primary-100/70 px-2.5 py-1 rounded-lg select-none">
                            1-я сотня истории
                        </span>`;
                }

                const borderClass = isFastest 
                    ? 'border-amber-300 bg-amber-50/30 shadow-sm' 
                    : 'border-slate-100 bg-white';

                const cardHtml = `
                    <div class="p-4 rounded-xl border ${borderClass} transition hover:shadow-md space-y-2">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-extrabold text-slate-900 text-sm">${h.index}-я сотня успехов (${h.startSuccessNum}–${h.endSuccessNum})</span>
                                    ${isFastest ? '<span class="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm">⚡ Рекорд скорости</span>' : ''}
                                </div>
                                <p class="text-xs text-slate-500 font-medium">
                                    Период: <span class="font-bold text-slate-700">${formatDateToString(h.startDate)} — ${formatDateToString(h.endDate)}</span>
                                </p>
                            </div>

                            <div class="flex items-center justify-between sm:justify-end gap-4">
                                <div class="text-left sm:text-right">
                                    <span class="text-base font-extrabold text-slate-900 font-mono block">${h.calendarDays} ${getNounDays(h.calendarDays)}</span>
                                    <span class="text-[10px] text-slate-400 font-medium">ушло на 100 успехов</span>
                                </div>
                                <div>
                                    ${diffBadgeHtml}
                                </div>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-slate-100 flex items-center justify-end text-[11px] text-slate-500">
                            <span>Доля успехов за период: <strong class="text-primary-600 font-mono">${(h.successRate * 100).toFixed(2)}%</strong></span>
                        </div>
                    </div>
                `;

                hundredsListContainer.insertAdjacentHTML('beforeend', cardHtml);
            });
        }
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
