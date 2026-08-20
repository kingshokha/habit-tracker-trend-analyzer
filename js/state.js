/**
 * HabitTracker Trend Analyzer - Global State
 */
let habitsData = []; 
let currentSortMode = 'date-desc'; 
let activeTab = 'overview'; 
let currentGroupingMode = 'day'; 
let chartGroupingMode = 'day'; 
let chartSubTab = 'percent'; // 'percent' или 'count'
let trendChartInstance = null; 
let showAllChronology = false; 
let specialAchievementsData = {};

// Переменные для вкладки "Сравнение месяцев"
let monthCompSortMode = 'best'; // 'best', 'worst', 'date-desc', 'date-asc', 'count-desc'
let monthCompFilterMode = 'full'; // 'full' (весь месяц) или 'mtd' (до X-го числа)
