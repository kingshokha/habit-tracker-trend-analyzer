/**
 * HabitTracker Trend Analyzer - Charts Tab (Статистика)
 */

function updateChartGroupingButtons() {
    const modes = ['day', 'week', 'month', 'quarter', 'year'];
    modes.forEach(m => {
        const btn = document.getElementById(`chart-group-${m}-btn`);
        if (btn) {
            const isHidden = (m === 'day' && chartSubTab === 'count');
            const hiddenClass = isHidden ? ' hidden' : '';
            if (m === chartGroupingMode) {
                btn.className = "flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-primary-600 transition-all" + hiddenClass;
            } else {
                btn.className = "flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-700 transition-all" + hiddenClass;
            }
        }
    });
}

function setChartGroupingMode(mode) {
    chartGroupingMode = mode;
    updateChartGroupingButtons();
    renderTrendsChart();
}

function setChartSubTab(mode) {
    chartSubTab = mode;
    const percentBtn = document.getElementById('chart-subtab-percent-btn');
    const countBtn = document.getElementById('chart-subtab-count-btn');
    
    if (mode === 'percent') {
        if (percentBtn) percentBtn.className = "px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary-600 text-white shadow-sm transition flex items-center gap-1.5";
        if (countBtn) countBtn.className = "px-3.5 py-1.5 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5";
    } else {
        if (percentBtn) percentBtn.className = "px-3.5 py-1.5 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5";
        if (countBtn) countBtn.className = "px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary-600 text-white shadow-sm transition flex items-center gap-1.5";

        if (chartGroupingMode === 'day') {
            chartGroupingMode = 'week';
        }
    }

    updateChartGroupingButtons();
    renderTrendsChart();
}

function renderTrendsChart() {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return;

    const canvas = document.getElementById('trendsChart');
    if (!canvas) return;

    if (chartSubTab === 'count' && chartGroupingMode === 'day') {
        chartGroupingMode = 'week';
        updateChartGroupingButtons();
    }

    const groupedList = getGroupedData(filteredData, chartGroupingMode);

    const labels = groupedList.map(item => {
        if (chartGroupingMode === 'day') {
            return formatDateToString(item.date);
        } else {
            return item.label;
        }
    });

    const maxLabelEl = document.getElementById('chart-stat-max-label');
    const avgLabelEl = document.getElementById('chart-stat-avg-label');
    const sumLabelEl = document.getElementById('chart-stat-sum-label');
    const maxEl = document.getElementById('chart-stat-max');
    const avgEl = document.getElementById('chart-stat-avg');
    const successDaysEl = document.getElementById('chart-stat-success-days');
    const avgSubtextEl = document.getElementById('chart-stat-avg-subtext');

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    const gridColor = 'rgba(226, 232, 240, 0.8)';
    const textColor = '#64748b';

    if (chartSubTab === 'percent') {
        // Проверяем, отфильтровано ли начало истории (есть ли данные до начала выбранного периода)
        const chronAll = [...habitsData].sort((a, b) => a.date - b.date);
        const chronFiltered = [...filteredData].sort((a, b) => a.date - b.date);

        const hasPriorHistory = chronAll.length > 0 && chronFiltered.length > 0 && chronFiltered[0].date > chronAll[0].date;
        
        const fromStartContainer = document.getElementById('chart-from-start-container');
        if (fromStartContainer) {
            if (hasPriorHistory) {
                fromStartContainer.classList.remove('hidden');
            } else {
                fromStartContainer.classList.add('hidden');
            }
        }

        const fromStartCheckbox = document.getElementById('chartFromStartCheckbox');
        const useFromStart = hasPriorHistory && fromStartCheckbox && fromStartCheckbox.checked;

        let priorSuccessDays = 0;
        let priorTotalDays = 0;

        if (useFromStart) {
            const firstFilteredDate = chronFiltered[0].date;
            const priorItems = chronAll.filter(item => item.date < firstFilteredDate);
            priorTotalDays = priorItems.length;
            priorSuccessDays = priorItems.filter(item => item.status === 'Успех').length;
        }

        let runningSuccesses = priorSuccessDays;
        let runningTotalDays = priorTotalDays;

        const successRates = groupedList.map(item => {
            runningTotalDays += item.totalDays;
            runningSuccesses += item.successDays;
            const rate = runningTotalDays > 0 ? (runningSuccesses * 100 / runningTotalDays) : 0;
            return rate.toFixed(2);
        });

        const maxVal = Math.max(...successRates.map(Number));
        
        const displayTotalDays = useFromStart ? (priorTotalDays + filteredData.length) : filteredData.length;
        const displaySuccessDaysCount = useFromStart ? (priorSuccessDays + filteredData.filter(item => item.status === 'Успех').length) : filteredData.filter(item => item.status === 'Успех').length;
        const overallSuccessPercentage = displayTotalDays > 0 ? (displaySuccessDaysCount * 100 / displayTotalDays) : 0;

        if (maxLabelEl) maxLabelEl.textContent = 'Максимальный успех в шаге';
        if (avgLabelEl) avgLabelEl.textContent = 'Общий процент успеха';
        if (sumLabelEl) sumLabelEl.textContent = 'Всего успешных закрытий';
        if (avgSubtextEl) avgSubtextEl.classList.remove('hidden');

        if (maxEl) maxEl.textContent = maxVal.toFixed(2) + '%';
        if (avgEl) avgEl.textContent = overallSuccessPercentage.toFixed(2) + '%';
        if (successDaysEl) successDaysEl.textContent = displaySuccessDaysCount;

        const datasetLabel = useFromStart 
            ? 'Общий процент успеха (накопительно с 1-го дня истории)' 
            : 'Общий процент успеха (%) с начала периода';

        trendChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: datasetLabel,
                        data: successRates,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#8b5cf6',
                        pointHoverRadius: 6,
                        pointRadius: chartGroupingMode === 'day' && labels.length > 40 ? 0 : 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { family: 'Inter', size: 11, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#0f172a',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: function(value) { return value + '%'; },
                            font: { family: 'Inter', size: 10 }
                        }
                    }
                }
            }
        });
    } else {
        // Скрываем плашку "Учитывать с начала истории" для графика количества успехов
        const fromStartContainer = document.getElementById('chart-from-start-container');
        if (fromStartContainer) {
            fromStartContainer.classList.add('hidden');
        }

        const counts = groupedList.map(item => item.successDays);
        const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
        const sumCount = counts.reduce((a, b) => a + b, 0);
        const avgCount = counts.length > 0 ? (sumCount / counts.length) : 0;

        if (maxLabelEl) maxLabelEl.textContent = 'Максимум успехов за шаг';
        if (avgLabelEl) avgLabelEl.textContent = 'Среднее успехов за шаг';
        if (sumLabelEl) sumLabelEl.textContent = 'Сумма успехов за период';
        if (avgSubtextEl) avgSubtextEl.classList.add('hidden');

        if (maxEl) maxEl.textContent = `${maxCount} ${getNounSuccesses(maxCount)}`;
        if (avgEl) avgEl.textContent = `${avgCount.toFixed(1)} ${getNounSuccesses(Math.round(avgCount))}`;
        if (successDaysEl) successDaysEl.textContent = `${sumCount} ${getNounSuccesses(sumCount)}`;

        trendChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Количество успехов (дней)',
                        data: counts,
                        borderColor: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderWidth: 1,
                        borderRadius: 6,
                        hoverBackgroundColor: '#10b981'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                            font: { family: 'Inter', size: 11, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#0f172a',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.raw} ${getNounSuccesses(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            precision: 0,
                            font: { family: 'Inter', size: 10 }
                        }
                    }
                }
            }
        });
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
