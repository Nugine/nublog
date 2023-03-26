export function validateDateString(date: string) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
        throw new Error("Invalid date string");
    }

    const [year, month, day] = date.split("-").map(Number);
    if (year < 2000) {
        throw new Error("Unsupported year");
    }
    if (month < 1 || month > 12) {
        throw new Error("Invalid month");
    }
    if (day < 1 || day > getDaysInMonth(year, month)) {
        throw new Error("Invalid day");
    }
}

function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getDaysInMonth(year: number, month: number): number {
    if (month == 2 && isLeapYear(year)) {
        return 29;
    }
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month - 1];
}
