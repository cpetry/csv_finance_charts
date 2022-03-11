const fs = require("fs");
const path = require("path");
const CSV_File_DKB = require("../source/CSV_File_DKB.js");

const file = path.join(__dirname, "../example_csvs", "example_dkb.csv");
const testCSVString = fs.readFileSync(file, "utf8", function(err, data) {
  return data;
});

test("parse csv file delimiter", () => {
    let csvFile = new CSV_File_DKB(testCSVString);
    let parseResult = csvFile.getParseResult();
    expect(parseResult.meta.delimiter).toBe(";");
});

test("parse csv file", () => {
    let csvFile = new CSV_File_DKB(testCSVString);
    let parseResult = csvFile.getParseResult();
    expect(parseResult.meta.delimiter).toBe(";");
    expect(csvFile.getAccountNumber()).toBe("DE11111111111234512345 / BeispielName");
    expect(csvFile.getCurrentAccountBalance()).toBe(1000);
});