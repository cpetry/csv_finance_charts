const ctx = document.getElementById('myChart');
var cfgFile
window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    cfgFile = new CFG_File(data);
});

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received")
    let csvFile = new CSV_File_DKB(data);
    let financeDataPool = new FinanceDataPool();
    financeDataPool.Add(csvFile);
    
    let categories = cfgFile.getCategories()
    let categorizedSums = financeDataPool.getCategorizedGroupedByMonth(categories);
    let config = {
        type: 'bar',
        data: { datasets: 
            categorizedSums
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            },
            parsing: {
                xAxisKey: 'date',
                yAxisKey: 'sum'
            }
        }
    };
    console.log(config)
    let myChart = new Chart(ctx,
      config
    );
});