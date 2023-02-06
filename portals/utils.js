const findDaysBetweenDates = (start, end) => {
    console.log("dates", start, end);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

module.exports = {
    findDaysBetweenDates,
};