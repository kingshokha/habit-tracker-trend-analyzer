/**
 * HabitTracker Trend Analyzer - File Parsers & Filter Controls
 */

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    // Проверка если загружен ZIP-архив
    if (fileName.endsWith('.zip')) {
        try {
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
            
            let targetFile = null;
            let targetFileName = "";

            // Поиск файла Scores.csv внутри архива
            zipContent.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir && relativePath.toLowerCase().endsWith('scores.csv')) {
                    targetFile = zipEntry;
                    targetFileName = relativePath;
                }
            });

            if (!targetFile) {
                showToast("Файл Scores.csv не найден внутри ZIP-архива!", true);
                return;
            }

            const arrayBuffer = await targetFile.async("arraybuffer");
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            processRaw2DArray(rows, `Скопировано из ZIP: ${targetFileName}`);
        } catch (error) {
            console.error(error);
            showToast("Не удалось прочитать ZIP-архив! Убедитесь, что файл не поврежден.", true);
        }
        return;
    }

    // Прямая загрузка CSV / Excel файлов
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            processRaw2DArray(rows);
        } catch (error) {
            console.error(error);
            showToast("Не удалось прочесть файл! Убедитесь, что это корректная таблица Excel, CSV или ZIP-архив.", true);
        }
    };
    reader.readAsArrayBuffer(file);
}

function processRaw2DArray(rows, customSourceInfo = "") {
    if (!rows || rows.length === 0) {
        showToast("Файл пустой!", true);
        return;
    }

    const cleanRows = rows.filter(row => {
        return row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== "");
    });

    if (cleanRows.length === 0) {
        showToast("Не удалось найти данные в файле!", true);
        return;
    }

    let maxCols = 0;
    cleanRows.forEach(r => { if (r.length > maxCols) maxCols = r.length; });

    const dateScores = Array(maxCols).fill(0);
    const valueScores = Array(maxCols).fill(0);

    cleanRows.forEach(row => {
        row.forEach((cell, c) => {
            if (cell === null || cell === undefined || String(cell).trim() === "") return;
            const cellStr = String(cell).trim();

            if (parseStrictDate(cellStr) !== null) {
                dateScores[c]++;
            }

            const cleanValStr = cellStr.replace(',', '.').replace('%', '');
            const num = parseFloat(cleanValStr);
            if (!isNaN(num)) {
                if (num < 35000 || num > 65000) {
                    if (num <= 1.0 || cellStr.includes('%')) {
                        valueScores[c] += 2;
                    } else {
                        valueScores[c]++;
                    }
                }
            }
        });
    });

    let dateColIdx = -1;
    let maxDateScore = -1;
    for (let c = 0; c < maxCols; c++) {
        if (dateScores[c] > maxDateScore) {
            maxDateScore = dateScores[c];
            dateColIdx = c;
        }
    }

    let valueColIdx = -1;
    let maxValueScore = -1;
    for (let c = 0; c < maxCols; c++) {
        if (c === dateColIdx) continue;
        if (valueScores[c] > maxValueScore) {
            maxValueScore = valueScores[c];
            valueColIdx = c;
        }
    }

    if (dateColIdx === -1) dateColIdx = 0;
    if (valueColIdx === -1) valueColIdx = (dateColIdx === 0 && maxCols > 1) ? 1 : 0;

    const rawParsed = [];
    cleanRows.forEach((row, idx) => {
        if (idx === 0) {
            const testVal = String(row[dateColIdx] || '').toLowerCase();
            if (testVal.includes('дат') || testVal.includes('date') || testVal.includes('time')) {
                return;
            }
        }

        const dateCell = row[dateColIdx];
        const valueCell = row[valueColIdx];

        if (dateCell === undefined || dateCell === null || valueCell === undefined || valueCell === null) return;

        const dateStr = String(dateCell).trim();
        const valStr = String(valueCell).trim();

        if (!dateStr || !valStr) return;

        const dateComponents = parseStrictDate(dateStr);
        if (!dateComponents) return;

        const localMidnightDate = new Date(dateComponents.y, dateComponents.m, dateComponents.d, 0, 0, 0, 0);
        const val = parseSuccessValue(valStr);

        rawParsed.push({ date: localMidnightDate, value: val });
    });

    if (rawParsed.length === 0) {
        showToast("Не удалось извлечь данные! Убедитесь, что в файле есть колонка с датами (ГГГГ-ММ-ДД) и процентами.", true);
        return;
    }

    rawParsed.sort((a, b) => a.date - b.date);

    const uniqueMap = new Map();
    rawParsed.forEach(item => {
        const dateStr = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}-${String(item.date.getDate()).padStart(2, '0')}`;
        uniqueMap.set(dateStr, item);
    });
    const sortedData = Array.from(uniqueMap.values()).sort((a, b) => a.date - b.date);

    const processedData = [];
    for (let i = 0; i < sortedData.length; i++) {
        const current = sortedData[i];
        let status = "Провал";
        let difference = 0;

        if (i === 0) {
            difference = current.value;
            if (current.value > 0) {
                status = "Успех";
            }
        } else {
            const prev = sortedData[i - 1];
            difference = current.value - prev.value;
            if (current.value > prev.value) {
                status = "Успех";
            } else {
                status = "Провал";
            }
        }

        processedData.push({
            date: current.date,
            value: current.value,
            difference: difference,
            status: status
        });
    }

    habitsData = processedData;

    const emptyState = document.getElementById('empty-state');
    const dashboardContainer = document.getElementById('dashboard-container');
    const headerImportBtn = document.getElementById('header-import-btn');

    if (emptyState) emptyState.classList.add('hidden');
    if (dashboardContainer) dashboardContainer.classList.remove('hidden');
    if (headerImportBtn) headerImportBtn.classList.remove('hidden');
    closeImportModal();
    
    if (habitsData.length > 0) {
        const sortedByDate = [...habitsData].sort((a,b) => a.date - b.date);
        const minDateISO = formatDateToYYYYMMDD(sortedByDate[0].date);
        const maxDateISO = formatDateToYYYYMMDD(sortedByDate[sortedByDate.length - 1].date);
        
        const startDateInput = document.getElementById('startDateInput');
        const endDateInput = document.getElementById('endDateInput');
        if (startDateInput) startDateInput.value = minDateISO;
        if (endDateInput) endDateInput.value = maxDateISO;
    }

    showAllChronology = false;

    populateYearSelector();

    renderDashboard();
    const messageExtra = customSourceInfo ? ` (${customSourceInfo})` : '';
    showToast(`Успешно обработано! Записей: ${habitsData.length}${messageExtra}`);
}

function parseStrictDate(cleanStr) {
    if (!cleanStr) return null;

    let clean = String(cleanStr).trim().replace(/["]/g, '');
    if (!clean) return null;

    if (/^\d+(\.\d+)?$/.test(clean)) {
        const num = parseFloat(clean);
        if (num >= 35000 && num <= 65000) {
            const date = new Date((num - 25569) * 86400 * 1000);
            if (!isNaN(date.getTime())) {
                return {
                    y: date.getUTCFullYear(),
                    m: date.getUTCMonth(),
                    d: date.getUTCDate()
                };
            }
        }
    }

    let matchISO = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[\sT]|$)/);
    if (matchISO) {
        let y = parseInt(matchISO[1], 10);
        let m = parseInt(matchISO[2], 10) - 1;
        let d = parseInt(matchISO[3], 10);
        if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
            return { y, m, d };
        }
    }

    let matchRU = clean.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})(?:[\sT]|$)/);
    if (matchRU) {
        let d = parseInt(matchRU[1], 10);
        let m = parseInt(matchRU[2], 10) - 1;
        let y = parseInt(matchRU[3], 10);
        
        if ((m < 0 || m >= 12) && (d >= 1 && d <= 12)) {
            let temp = d;
            d = m + 1;
            m = temp - 1;
        }
        if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
            return { y, m, d };
        }
    }

    let matchRUShort = clean.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2})(?:[\sT]|$)/);
    if (matchRUShort) {
        let d = parseInt(matchRUShort[1], 10);
        let m = parseInt(matchRUShort[2], 10) - 1;
        let y = parseInt(matchRUShort[3], 10);
        y = y < 50 ? 2000 + y : 1900 + y;
        
        if ((m < 0 || m >= 12) && (d >= 1 && d <= 12)) {
            let temp = d;
            d = m + 1;
            m = temp - 1;
        }
        if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
            return { y, m, d };
        }
    }

    return null;
}

function parseSuccessValue(val) {
    if (val === undefined || val === null) return 0;
    const str = String(val).trim().toLowerCase().replace(/["]/g, '');
    if (!str) return 0;

    const cleanStr = str.replace(',', '.').replace('%', '');
    const parsedFloat = parseFloat(cleanStr);
    if (isNaN(parsedFloat)) {
        return 0.0;
    }

    if (str.includes('%') || parsedFloat > 1.0) {
        return parsedFloat / 100;
    }

    return parsedFloat >= 0 ? parsedFloat : 0.0;
}

function getFilteredData() {
    const startDateStr = document.getElementById('startDateInput').value;
    const endDateStr = document.getElementById('endDateInput').value;
    
    let filtered = [...habitsData];

    if (startDateStr) {
        const startDateParts = startDateStr.split('-');
        const startDate = new Date(parseInt(startDateParts[0], 10), parseInt(startDateParts[1], 10) - 1, parseInt(startDateParts[2], 10), 0, 0, 0, 0);
        filtered = filtered.filter(item => item.date >= startDate);
    }

    if (endDateStr) {
        const endDateParts = endDateStr.split('-');
        const endDate = new Date(parseInt(endDateParts[0], 10), parseInt(endDateParts[1], 10) - 1, parseInt(endDateParts[2], 10), 23, 59, 59, 999);
        filtered = filtered.filter(item => item.date <= endDate);
    }

    return filtered;
}

function populateYearSelector() {
    const selector = document.getElementById('yearSelector');
    if (!selector) return;

    const currentVal = selector.value;
    selector.innerHTML = '<option value="all">Год: Все</option>';

    if (habitsData.length === 0) return;

    const yearsSet = new Set();
    habitsData.forEach(item => {
        yearsSet.add(item.date.getFullYear());
    });

    const yearsSorted = Array.from(yearsSet).sort((a, b) => b - a);

    yearsSorted.forEach(year => {
        const opt = document.createElement('option');
        opt.value = String(year);
        opt.textContent = `${year} год`;
        selector.appendChild(opt);
    });

    if (yearsSet.has(parseInt(currentVal, 10))) {
        selector.value = currentVal;
    } else {
        selector.value = 'all';
    }
}

function selectYearRange(val) {
    const startDateInput = document.getElementById('startDateInput');
    const endDateInput = document.getElementById('endDateInput');

    if (val === 'all') {
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        filterHistoryTable();
        return;
    }

    const targetYear = parseInt(val, 10);
    if (isNaN(targetYear)) return;

    const yearItems = habitsData.filter(item => item.date.getFullYear() === targetYear);
    if (yearItems.length === 0) return;

    const sorted = [...yearItems].sort((a, b) => a.date - b.date);
    const minDateStr = formatDateToYYYYMMDD(sorted[0].date);
    const maxDateStr = formatDateToYYYYMMDD(sorted[sorted.length - 1].date);

    if (startDateInput) startDateInput.value = minDateStr;
    if (endDateInput) endDateInput.value = maxDateStr;

    filterHistoryTable();
}

function updateYearSelectorFromInputs() {
    const selector = document.getElementById('yearSelector');
    const startDateStr = document.getElementById('startDateInput').value;
    const endDateStr = document.getElementById('endDateInput').value;
    if (!selector) return;

    if (!startDateStr && !endDateStr) {
        selector.value = 'all';
        return;
    }

    if (startDateStr && endDateStr) {
        const startY = startDateStr.split('-')[0];
        const endY = endDateStr.split('-')[0];
        if (startY === endY) {
            const optExists = Array.from(selector.options).some(o => o.value === startY);
            if (optExists) {
                selector.value = startY;
                return;
            }
        }
    }
    selector.value = 'all';
}

function clearDateRange() {
    const startDateInput = document.getElementById('startDateInput');
    const endDateInput = document.getElementById('endDateInput');
    const yearSelector = document.getElementById('yearSelector');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (yearSelector) yearSelector.value = 'all';
    filterHistoryTable();
}

function filterHistoryTable() {
    updateYearSelectorFromInputs();
    renderDashboard();
}
