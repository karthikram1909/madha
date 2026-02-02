// Indian Standard Time (IST) Utility Functions
// IST is UTC+5:30 (Asia/Kolkata)

/**
 * Parse date string safely - handles both date-only strings and full datetime strings
 * For date-only strings (YYYY-MM-DD), treats them as local noon to avoid timezone shifts
 * @param {Date|string} dateInput - Date to parse
 * @returns {Date} Parsed date
 */
const parseDateSafely = (dateInput) => {
    if (dateInput instanceof Date) {
        return dateInput;
    }
    
    const dateStr = String(dateInput);
    
    // Check if it's a date-only string (YYYY-MM-DD format with no time component)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // For date-only strings, parse as local date at noon to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0); // Local noon
    }
    
    // For datetime strings, parse normally
    return new Date(dateStr);
};

/**
 * Get current date and time in IST
 * @returns {Date} Current IST date
 */
export const getCurrentISTDate = () => {
    // Use Intl API to get proper IST time
    const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const getValue = (type) => parts.find(p => p.type === type)?.value;
    
    return new Date(
        `${getValue('year')}-${getValue('month')}-${getValue('day')}T${getValue('hour')}:${getValue('minute')}:${getValue('second')}`
    );
};

/**
 * Convert any date to IST
 * @param {Date|string} date - Date to convert
 * @returns {Date} IST date
 */
export const toISTDate = (date) => {
    const d = parseDateSafely(date);
    
    const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(d);
    const getValue = (type) => parts.find(p => p.type === type)?.value;
    
    return new Date(
        `${getValue('year')}-${getValue('month')}-${getValue('day')}T${getValue('hour')}:${getValue('minute')}:${getValue('second')}`
    );
};

/**
 * Format date in IST (FIXED - handles date-only strings correctly)
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted IST date string
 */
export const formatISTDate = (date, formatString = 'YYYY-MM-DD HH:mm:ss') => {
    // Parse the date safely first
    const parsedDate = parseDateSafely(date);
    
    // For date-only formats (no time component), use simpler local formatting
    if (formatString === 'DD/MM/YYYY' || formatString === 'YYYY-MM-DD') {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        
        if (formatString === 'DD/MM/YYYY') {
            return `${day}/${month}/${year}`;
        } else {
            return `${year}-${month}-${day}`;
        }
    }
    
    // For datetime formats, convert to IST
    const istDate = toISTDate(parsedDate);
    
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');
    
    return formatString
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

/**
 * Get IST date string in YYYY-MM-DD format
 * @param {Date|string} date - Date to convert (optional, defaults to now)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getISTDateString = (date = null) => {
    const istDate = date ? toISTDate(date) : getCurrentISTDate();
    return formatISTDate(istDate, 'YYYY-MM-DD');
};

/**
 * Get IST datetime string in ISO format
 * @param {Date|string} date - Date to convert (optional, defaults to now)
 * @returns {string} ISO datetime string
 */
export const getISTDateTimeString = (date = null) => {
    const istDate = date ? toISTDate(date) : getCurrentISTDate();
    return formatISTDate(istDate, 'YYYY-MM-DD HH:mm:ss');
};

/**
 * Display date in IST with timezone label
 * @param {Date|string} date - Date to display
 * @returns {string} Formatted date with IST label
 */
export const displayISTDate = (date) => {
    const parsedDate = parseDateSafely(date);
    const istDate = toISTDate(parsedDate);
    return `${formatISTDate(istDate, 'DD/MM/YYYY HH:mm')} IST`;
};

/**
 * Format date to IST string using locale
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted IST date string
 */
export const formatDateToIST = (date) => {
    const parsedDate = parseDateSafely(date);
    return parsedDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

/**
 * Format date to IST date only (no time)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted IST date string (DD/MM/YYYY)
 */
export const formatDateOnlyIST = (date) => {
    const parsedDate = parseDateSafely(date);
    return parsedDate.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};