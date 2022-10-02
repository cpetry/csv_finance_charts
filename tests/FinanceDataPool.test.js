const fs = require("fs");
const path = require("path");
const CSV_File_DKB = require('../source/CSV_File_DKB.js');
const CSV_Header = require("../source/CSV_Header.js");
const FinanceDataPool = require("../source/FinanceDataPool.js");

const exampleCSVFile = path.join(__dirname, "../example_csvs", "example_dkb.csv");
const testCSVString = fs.readFileSync(exampleCSVFile, "utf8", function(err, data) {
  return data;
});

test("categorize csv content", () => {
    let csvFile = new CSV_File_DKB(testCSVString);
    let financeDataPool = new FinanceDataPool();
    financeDataPool.Add(csvFile);
    let categories = {
      "Overhead": ["Evil landlord", "Insurance"],
      "Orderings": ["Amazon", "Paypal"],
      "Gas": ["Aral", "Esso", "Shell", "Total", "Jet", "OMV", "ELO", "SUPOL"],
      "Income": ["Some Company"]
    }
    let categorizedContent = financeDataPool.categorizeContent(categories);
    //console.log("categories found: " + Object.keys(categorizedContent))
    //console.log(csvFile.getParseResult().data)
    expect(csvFile.getParseResult().data.length).toBe(162);
    expect(categorizedContent["Overhead"].length).toBe(24);
    expect(categorizedContent["Orderings"].length).toBe(43);
    expect(categorizedContent["Gas"].length).toBe(11);
    expect(categorizedContent["Income"].length).toBe(12);
    expect(categorizedContent["undefined"].length).toBe(72);
  });
  
  test("calculate sum of categorized csv content", () => {
    let csvFile = new CSV_File_DKB(testCSVString);
    let financeDataPool = new FinanceDataPool();
    financeDataPool.Add(csvFile);
    let categories = {
      "Overhead": ["Evil landlord", "Insurance"],
      "Orderings": ["Amazon", "Paypal"],
      "Gas": ["Aral", "Esso", "Shell", "Total", "Jet", "OMV", "ELO", "SUPOL"],
      "Income": ["Some Company"]
    }
    let categorizedSums = financeDataPool.getCategorizedGroupedByMonth(categories);
    let overheadData = categorizedSums.find(e => e.label  == "Overhead").data
    expect(overheadData.find(d => d.date == '12.2017').sum).toBe(-899.98);
    expect(overheadData.find(d => d.date == '11.2017').sum).toBe(-899.98);
    let gasData = categorizedSums.find(e => e.label  == "Gas").data
    expect(gasData.find(d => d.date == '04.2017').sum).toBe(-47.13);
    let orderingsData = categorizedSums.find(e => e.label  == "Orderings").data
    expect(orderingsData.find(d => d.date == '04.2017').sum).toBe(-95.14);
  });

  test("getCurrentBalance", () => {
    let csvFile = new CSV_File_DKB(testCSVString);
    let financeDataPool = new FinanceDataPool();
    financeDataPool.Add(csvFile);
    let accountBalance = financeDataPool.getTotalAccountBalance();
    expect(accountBalance).toBe(1000);
  });

  test("createDateSumList", () => {
    let csvFile = new CSV_File_DKB(testCSVString);
    let financeDataPool = new FinanceDataPool();
    financeDataPool.Add(csvFile);
    let dateSumList = financeDataPool.createDateSumList();
    expect(dateSumList[0].date).toBe("01.01.2017");
    expect(dateSumList[0].value).toBe(1922);
  });