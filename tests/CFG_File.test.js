const fs = require("fs");
const path = require("path");
const CFG_File = require("../source/CFG_File.js");

const file = path.join(__dirname, "../", "config.cfg");
const testCFGString = fs.readFileSync(file, "utf8", function(err, data) {
  return data;
});

test("load cfg files", () => {
    let cfgFile = new CFG_File(testCFGString);
    let csvFileInfos = cfgFile.getCSVFileInfos();
    expect(csvFileInfos[0].name).toBe("DKB_giro");
    expect(csvFileInfos[1].name).toBe("Consors_giro");
    expect(csvFileInfos[0].path).toBe("/example_csvs/example_dkb.csv");
    expect(csvFileInfos[1].path).toBe("/example_csvs/example_consors.csv");
});

test("load cfg categories", () => {
    let cfgFile = new CFG_File(testCFGString);
    let categories = cfgFile.getCategories();
    let categorieNames = Object.keys(categories)
    expect(categorieNames[0]).toBe("Overhead");
    expect(categorieNames[1]).toBe("Orderings");
    expect(categorieNames[2]).toBe("Housekeeping");
    let categorieValues = Object.values(categories)
    expect(categorieValues[0]).toContain("Evil landlord");
    expect(categorieValues[0]).toContain("Insurance");
    expect(categorieValues[1]).toContain("Paypal");
    expect(categorieValues[1]).toContain("Amazon");
});
