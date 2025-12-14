export function validateDateString(date: string) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
        throw new Error("Invalid date string");
    }

    const parts = date.split("-").map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    if (year === undefined || year < 2000) {
        throw new Error("Unsupported year");
    }
    if (month === undefined || month < 1 || month > 12) {
        throw new Error("Invalid month");
    }
    if (day === undefined || day < 1 || day > getDaysInMonth(year, month)) {
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
    return days[month - 1]!;
}
