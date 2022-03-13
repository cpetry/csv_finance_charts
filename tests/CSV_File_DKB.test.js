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

test("categorize csv content", () => {
  let csvFile = new CSV_File_DKB(testCSVString);
  let categories = {
    "Overhead": ["Evil landlord", "Insurance"],
    "Orderings": ["Amazon", "Paypal"],
    "Gas": ["Aral", "Esso", "Shell", "Total", "Jet", "OMV", "ELO", "SUPOL"],
    "Income": ["Some Company"]
  }
  let categorizedContent = csvFile.categorizeContent(categories);
  //console.log("categories found: " + Object.keys(categorizedContent))
  expect(csvFile.getParseResult().data.length).toBe(162);
  expect(categorizedContent["Overhead"].length).toBe(24);
  expect(categorizedContent["Orderings"].length).toBe(43);
  expect(categorizedContent["Gas"].length).toBe(11);
  expect(categorizedContent["Income"].length).toBe(12);
  expect(categorizedContent["undefined"].length).toBe(72);
});

test("calculate sum of categorized csv content", () => {
  let csvFile = new CSV_File_DKB(testCSVString);
  let categories = {
    "Overhead": ["Evil landlord", "Insurance"],
    "Orderings": ["Amazon", "Paypal"],
    "Gas": ["Aral", "Esso", "Shell", "Total", "Jet", "OMV", "ELO", "SUPOL"],
    "Income": ["Some Company"]
  }
  let categorizedSums = csvFile.getCategorizedGroupedByMonth(categories);
  expect(categorizedSums["Overhead"]["03.2017"].sum).toBe(-899.98);
  expect(categorizedSums["Overhead"]["04.2017"].sum).toBe(-899.98);
  expect(categorizedSums["Orderings"]["04.2017"].sum).toBe(-95.14);
  expect(categorizedSums["Gas"]["04.2017"].sum).toBe(-47.13);
  expect(categorizedSums["Income"]["04.2017"].sum).toBe(2122);
});