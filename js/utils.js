/**
 * HabitTracker Trend Analyzer - Utilities & Helpers
 */

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    
    if (isError) {
        toast.classList.remove('bg-emerald-600');
        toast.classList.add('bg-rose-600');
    } else {
        toast.classList.remove('bg-rose-600');
        toast.classList.add('bg-emerald-600');
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 4000);
}

function formatDateToString(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

function formatDateToYYYYMMDD(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

function getNounDays(number) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return 'дней';
    n %= 10;
    if (n === 1) return 'день';
    if (n >= 2 && n <= 4) return 'дня';
    return 'дней';
}

function getNounSuccesses(number) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return 'успехов';
    n %= 10;
    if (n === 1) return 'успех';
    if (n >= 2 && n <= 4) return 'успеха';
    return 'успехов';
}

function getNounHundreds(number) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return 'сотен';
    n %= 10;
    if (n === 1) return 'сотня';
    if (n >= 2 && n <= 4) return 'сотни';
    return 'сотен';
}

function getDaysAgoRussian(days) {
    if (days === 0) return 'сегодня';
    if (days === 1) return 'вчера';
    let n = Math.abs(days);
    n %= 100;
    if (n >= 5 && n <= 20) return `${days} дней назад`;
    n %= 10;
    if (n === 1) return `${days} день назад`;
    if (n >= 2 && n <= 4) return `${days} дня назад`;
    return `${days} дней назад`;
}

function getDaysAgoText(endDate) {
    const now = new Date();
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d2 = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffTime = d1 - d2;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'в будущем';
    return getDaysAgoRussian(diffDays);
}

function lockBodyScroll() {
    document.body.classList.add('overflow-hidden');
}

function unlockBodyScroll() {
    const openModals = document.querySelectorAll('#importModal:not(.hidden), #achievementDetailModal:not(.hidden)');
    if (openModals.length === 0) {
        document.body.classList.remove('overflow-hidden');
    }
}
