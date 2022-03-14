const fs = require("fs");
const path = require("path");
const CSV_File_DKB = require("../source/CSV_File_DKB.js");
const CSV_Header = require("../source/CSV_Header.js");

const exampleCSVFile = path.join(__dirname, "../example_csvs", "example_dkb.csv");
const testCSVString = fs.readFileSync(exampleCSVFile, "utf8", function(err, data) {
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
    expect(csvFile.getHeader()[0]).toBe(CSV_Header.date);
    expect(csvFile.getHeader()[3]).toBe(CSV_Header.client);
    expect(csvFile.getHeader()[4]).toBe(CSV_Header.usageType);
    expect(csvFile.getHeader()[5]).toBe(CSV_Header.iban);
    expect(csvFile.getHeader()[7]).toBe(CSV_Header.value);
});