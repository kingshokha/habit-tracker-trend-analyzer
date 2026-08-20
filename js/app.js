/**
 * HabitTracker Trend Analyzer - Main App Entry Point & Router
 */

function switchTab(tabName) {
    activeTab = tabName;
    
    const overviewTabBtn = document.getElementById('tab-overview-btn');
    const monthCompTabBtn = document.getElementById('tab-month-comp-btn');
    const chronTabBtn = document.getElementById('tab-chronology-btn');
    const streaksTabBtn = document.getElementById('tab-streaks-btn');
    const achievementsTabBtn = document.getElementById('tab-achievements-btn');
    const chartsTabBtn = document.getElementById('tab-charts-btn');
    
    const overviewContent = document.getElementById('overview-view-content');
    const monthCompContent = document.getElementById('month-comp-view-content');
    const chronContent = document.getElementById('chronology-view-content');
    const streaksContent = document.getElementById('streaks-view-content');
    const achievementsContent = document.getElementById('achievements-view-content');
    const chartsContent = document.getElementById('charts-view-content');
    
    const sortContainer = document.getElementById('sort-selector-container');
    const groupingContainer = document.getElementById('grouping-selector-container');
    const dateRangeContainer = document.getElementById('date-range-container');
    const yearContainer = document.getElementById('year-selector-container');

    [overviewTabBtn, monthCompTabBtn, chronTabBtn, streaksTabBtn, achievementsTabBtn, chartsTabBtn].forEach(btn => {
        if (btn) {
            btn.className = "py-3 text-xs font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        }
    });

    [overviewContent, monthCompContent, chronContent, streaksContent, achievementsContent, chartsContent].forEach(c => {
        if (c) {
            c.classList.add('hidden');
            c.classList.remove('block');
        }
    });

    if (tabName === 'overview') {
        if (overviewTabBtn) overviewTabBtn.className = "py-3 text-xs font-bold border-b-2 border-primary-600 text-primary-600 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        if (overviewContent) { overviewContent.classList.remove('hidden'); overviewContent.classList.add('block'); }
        if (sortContainer) sortContainer.classList.add('invisible');
        if (groupingContainer) groupingContainer.classList.add('hidden');
        if (dateRangeContainer) dateRangeContainer.classList.add('invisible');
        if (yearContainer) yearContainer.classList.add('invisible');
    } else if (tabName === 'month-comp') {
        if (monthCompTabBtn) monthCompTabBtn.className = "py-3 text-xs font-bold border-b-2 border-primary-600 text-primary-600 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        if (monthCompContent) { monthCompContent.classList.remove('hidden'); monthCompContent.classList.add('block'); }
        if (sortContainer) sortContainer.classList.add('invisible');
        if (groupingContainer) groupingContainer.classList.add('hidden');
        if (dateRangeContainer) dateRangeContainer.classList.remove('invisible');
        if (yearContainer) yearContainer.classList.remove('invisible');
    } else if (tabName === 'chronology') {
        if (chronTabBtn) chronTabBtn.className = "py-3 text-xs font-bold border-b-2 border-primary-600 text-primary-600 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        if (chronContent) { chronContent.classList.remove('hidden'); chronContent.classList.add('block'); }
        if (sortContainer) sortContainer.classList.remove('invisible');
        if (groupingContainer) groupingContainer.classList.remove('hidden');
        if (dateRangeContainer) dateRangeContainer.classList.remove('invisible');
        if (yearContainer) yearContainer.classList.remove('invisible');
    } else if (tabName === 'streaks') {
        if (streaksTabBtn) streaksTabBtn.className = "py-3 text-xs font-bold border-b-2 border-primary-600 text-primary-600 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        if (streaksContent) { streaksContent.classList.remove('hidden'); streaksContent.classList.add('block'); }
        if (sortContainer) sortContainer.classList.add('invisible');
        if (groupingContainer) groupingContainer.classList.add('hidden');
        if (dateRangeContainer) dateRangeContainer.classList.remove('invisible');
        if (yearContainer) yearContainer.classList.remove('invisible');
    } else if (tabName === 'achievements') {
        if (achievementsTabBtn) achievementsTabBtn.className = "py-3 text-xs font-bold border-b-2 border-primary-600 text-primary-600 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        if (achievementsContent) { achievementsContent.classList.remove('hidden'); achievementsContent.classList.add('block'); }
        if (sortContainer) sortContainer.classList.add('invisible');
        if (groupingContainer) groupingContainer.classList.add('hidden');
        if (dateRangeContainer) dateRangeContainer.classList.add('invisible');
        if (yearContainer) yearContainer.classList.add('invisible');
    } else if (tabName === 'charts') {
        if (chartsTabBtn) chartsTabBtn.className = "py-3 text-xs font-bold border-b-2 border-primary-600 text-primary-600 flex items-center gap-2 transition focus:outline-none whitespace-nowrap";
        if (chartsContent) { chartsContent.classList.remove('hidden'); chartsContent.classList.add('block'); }
        if (sortContainer) sortContainer.classList.add('invisible');
        if (groupingContainer) groupingContainer.classList.add('hidden');
        if (dateRangeContainer) dateRangeContainer.classList.remove('invisible');
        if (yearContainer) yearContainer.classList.remove('invisible');
    }
    
    renderDashboard();
}

function renderDashboard() {
    const filteredData = getFilteredData();
    
    if (activeTab === 'overview') {
        renderOverviewTab();
    } else if (activeTab === 'month-comp') {
        renderMonthCompTab();
    } else if (activeTab === 'chronology') {
        renderHabitsTable(filteredData);
    } else if (activeTab === 'streaks') {
        renderStreaksTable(filteredData);
    } else if (activeTab === 'achievements') {
        renderAchievementsTab();
    } else if (activeTab === 'charts') {
        renderTrendsChart();
    }
}

window.onload = function() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
    
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('excelFile');
    const emptyFileInput = document.getElementById('emptyStateFile');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect, false);
    }

    if (emptyFileInput) {
        emptyFileInput.addEventListener('change', handleFileSelect, false);
    }

    const emptyStateEl = document.getElementById('empty-state');
    if (emptyStateEl) {
        ['dragenter', 'dragover'].forEach(eventName => {
            emptyStateEl.addEventListener(eventName, (e) => {
                e.preventDefault();
                emptyStateEl.classList.add('border-primary-500', 'bg-primary-50/40');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            emptyStateEl.addEventListener(eventName, (e) => {
                e.preventDefault();
                emptyStateEl.classList.remove('border-primary-500', 'bg-primary-50/40');
            }, false);
        });
    }

    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.add('border-primary-500', 'bg-primary-50/50');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.remove('border-primary-500', 'bg-primary-50/50');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt ? dt.files : null;
            if (files && files.length) {
                if (fileInput) fileInput.files = files;
                handleFileSelect({ target: { files: files } });
            }
        }, false);
    }

    window.addEventListener('dragover', (e) => { e.preventDefault(); }, false);
    window.addEventListener('drop', (e) => {
        e.preventDefault();
        const dt = e.dataTransfer;
        const files = dt ? dt.files : null;
        if (files && files.length) {
            handleFileSelect({ target: { files: files } });
        }
    }, false);
};
