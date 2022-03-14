const fs = require("fs");
const path = require("path");
import { CFG_File } from "./source/CFG_File.js";

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
    expect(categories[0].key).toBe("Overhead");
    expect(categories[0].values).toContain("Evil landlord");
    expect(categories[0].values).toContain("Insurance");
    expect(categories[1].key).toBe("Orderings");
    expect(categories[1].values).toContain("Paypal");
    expect(categories[1].values).toContain("Amazon");
    expect(categories[2].key).toBe("Housekeeping");
});
