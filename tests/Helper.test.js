const Helper = require("../source/Helper.js");

test("compare date strings greater", () => {
    let result = Helper.compareDateStrings("02.05.2022", "02.05.2021");
    expect(result).toBe(1); // greater
});

test("compare date strings greater month", () => {
    let result = Helper.compareDateStrings("02.06.2022", "02.05.2021");
    expect(result).toBe(1); // greater
});

test("compare date strings greater day", () => {
    let result = Helper.compareDateStrings("03.05.2022", "02.05.2021");
    expect(result).toBe(1); // greater
});

test("compare date strings lesser", () => {
    let result = Helper.compareDateStrings("02.05.2021", "02.05.2022");
    expect(result).toBe(-1); // lesser
});

test("compare date strings lesser month", () => {
    let result = Helper.compareDateStrings("02.04.2022", "02.05.2022");
    expect(result).toBe(-1); // lesser
});

test("compare date strings lesser day", () => {
    let result = Helper.compareDateStrings("01.05.2022", "02.05.2022");
    expect(result).toBe(-1); // lesser
});

test("compare date strings equal", () => {
    let result = Helper.compareDateStrings("02.05.2022", "02.05.2022");
    expect(result).toBe(0); // lesser
});