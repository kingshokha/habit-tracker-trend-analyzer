/**
 * HabitTracker Trend Analyzer - Grouping & Streak Calculations
 */

function getGroupedData(filteredData, mode) {
    if (mode === 'day') {
        return filteredData.map(item => ({
            ...item,
            dateForSorting: item.date,
            successRate: item.status === 'Успех' ? 1 : 0,
            successDays: item.status === 'Успех' ? 1 : 0,
            totalDays: 1,
            label: formatDateToString(item.date)
        }));
    }

    if (habitsData.length === 0) return [];

    // 1. Группируем всю историю habitsData для расчёта честной динамики
    const allGroups = {};
    const chronAll = [...habitsData].sort((a, b) => a.date - b.date);

    chronAll.forEach(item => {
        let key, label;
        const d = item.date;
        const year = d.getFullYear();

        if (mode === 'week') {
            const dayOfWeek = (d.getDay() + 6) % 7;
            const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek);
            const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
            const monStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
            key = `week-${monStr}`;
            label = `${formatDateToString(monday)} — ${formatDateToString(sunday)}`;
        } else if (mode === 'month') {
            const month = d.getMonth() + 1;
            key = `${year}-${String(month).padStart(2, '0')}`;
            label = `${String(month).padStart(2, '0')}.${year}`;
        } else if (mode === 'quarter') {
            const quarter = Math.floor(d.getMonth() / 3) + 1;
            const roman = ["I", "II", "III", "IV"][quarter - 1];
            key = `${year}-Q${quarter}`;
            label = `${roman} кв. ${year}`;
        } else if (mode === 'year') {
            key = `${year}`;
            label = `${year} год`;
        }

        if (!allGroups[key]) {
            allGroups[key] = {
                key: key,
                label: label,
                dateForSorting: new Date(d),
                items: []
            };
        }
        allGroups[key].items.push(item);
    });

    const allGroupedList = Object.values(allGroups).sort((a, b) => a.dateForSorting - b.dateForSorting);

    for (let i = 0; i < allGroupedList.length; i++) {
        const group = allGroupedList[i];
        const totalDays = group.items.length;
        const successDays = group.items.filter(item => item.status === 'Успех').length;
        const totalVal = group.items.reduce((sum, item) => sum + item.value, 0);
        const avgValue = totalDays > 0 ? (totalVal / totalDays) : 0;

        let difference = 0;
        let successDaysDiff = 0;
        const isFirstGroup = (i === 0);

        if (i > 0) {
            const prevGroup = allGroupedList[i - 1];
            const prevTotalDays = prevGroup.items.length;
            const prevTotalVal = prevGroup.items.reduce((sum, item) => sum + item.value, 0);
            const prevAvgValue = prevTotalDays > 0 ? (prevTotalVal / prevTotalDays) : 0;
            difference = avgValue - prevAvgValue;

            const prevSuccessDays = prevGroup.items.filter(item => item.status === 'Успех').length;
            successDaysDiff = successDays - prevSuccessDays;
        } else {
            difference = 0;
            successDaysDiff = 0;
        }

        group.value = avgValue;
        group.difference = difference;
        group.successDaysDiff = successDaysDiff;
        group.isFirstGroup = isFirstGroup;
        group.isLatestPeriod = (i === allGroupedList.length - 1);
        group.totalDays = totalDays;
        group.successDays = successDays;
        group.successRate = totalDays > 0 ? (successDays / totalDays) : 0;
    }

    // 2. Отбираем ключи, попавшие под текущий фильтр даты/года
    const filteredKeys = new Set();
    filteredData.forEach(item => {
        const d = item.date;
        const year = d.getFullYear();
        let key;
        if (mode === 'week') {
            const dayOfWeek = (d.getDay() + 6) % 7;
            const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek);
            const monStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
            key = `week-${monStr}`;
        } else if (mode === 'month') {
            const month = d.getMonth() + 1;
            key = `${year}-${String(month).padStart(2, '0')}`;
        } else if (mode === 'quarter') {
            const quarter = Math.floor(d.getMonth() / 3) + 1;
            key = `${year}-Q${quarter}`;
        } else if (mode === 'year') {
            key = `${year}`;
        }
        filteredKeys.add(key);
    });

    return allGroupedList.filter(g => filteredKeys.has(g.key));
}

function getStreakLists(data) {
    if (data.length === 0) return { successes: [], failures: [] };
    let sorted = [...data].sort((a, b) => a.date - b.date);

    let successes = [];
    let failures = [];

    let currentStreak = {
        type: sorted[0].status,
        start: sorted[0].date,
        end: sorted[0].date,
        count: 1
    };

    for (let i = 1; i < sorted.length; i++) {
        let prev = sorted[i - 1];
        let curr = sorted[i];

        let diffTime = Math.abs(curr.date - prev.date);
        let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (curr.status === prev.status && diffDays <= 1) {
            currentStreak.end = curr.date;
            currentStreak.count++;
        } else {
            if (currentStreak.type === 'Успех') {
                successes.push({...currentStreak});
            } else {
                failures.push({...currentStreak});
            }
            currentStreak = {
                type: curr.status,
                start: curr.date,
                end: curr.date,
                count: 1
            };
        }
    }
    
    if (currentStreak.type === 'Успех') {
        successes.push({...currentStreak});
    } else {
        failures.push({...currentStreak});
    }

    const sortStreaksHelper = (a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.end - a.end;
    };

    successes.sort(sortStreaksHelper);
    failures.sort(sortStreaksHelper);

    return { successes, failures };
}
