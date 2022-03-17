const ctx = document.getElementById('myChart');
var cfgFile
window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    cfgFile = new CFG_File(data);

    CreateChart();
    CreateTable();
});

const buttonReload = document.getElementById('buttonReload')
buttonReload.addEventListener('click', () => {
    window.electron.onReload()
});

const selectHover = document.getElementById('selectHover')
selectHover.addEventListener('change', () => {
    console.log(selectHover.value)
    ChangeHoverOption(selectHover.value)
});


const toolTipSum = (tooltipItems) => {
    let sum = 0;    
    tooltipItems.forEach(function(tooltipItem) {
        sum += tooltipItem.parsed.y;
    });

    // round to two decimals
    sum = Math.round((sum + Number.EPSILON) * 100) / 100
    return 'Sum: ' + sum;
};

const toolTipContent = (tooltipItems) => {
    let label = tooltipItems.dataset.label;
    let dataOfCategory = tooltipItems.dataset.data[tooltipItems.dataIndex]

    sum = dataOfCategory.sum
    sum = Math.round((sum + Number.EPSILON) * 100) / 100
    let details = []
    details.push(label + ':')

    // sort detail info descending by value
    dataList = dataOfCategory.values
    dataList = dataList.sort(function(a, b) {
        return -(a.value - b.value);
    });
    dataList.forEach((entry) => details.push(entry.client + ': ' + entry.value + '\r'))

    return details;
}


_financeDataPool = new FinanceDataPool();

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received")
    let csvFile = new CSV_File_DKB(data);
    _financeDataPool.Add(csvFile);
    
    let categories = cfgFile.getCategories()
    let categorizedSums = _financeDataPool.getCategorizedGroupedByMonth(categories, ValueSign.NEGATIVE, recreate = true);
    let labels = _financeDataPool.getDateLabels()
    UpdateChart(categorizedSums, labels)
});


var _chart

const CreateChart = () => {
    let config = {
        type: 'bar',
        options: {
            responsive: true,
            interaction: {
                //intersect: false,
                mode: 'x'
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true
                }
            },
            parsing: {
                xAxisKey: 'date',
                yAxisKey: 'sum'
            },
            onClick(e) {
                const activePoints = _chart.getElementsAtEventForMode(e, 'x', {intersect: true}, true)
                const [{ index }] = activePoints;
                console.log(_chart.data.datasets[0])
                const clickedData = _chart.data.datasets[0].data[index]
                UpdateTable(clickedData)
            },
            plugins: {
                tooltip: {
                  callbacks: {
                    afterTitle: toolTipSum
                    //label: toolTipContent
                  }
                }
            }
        }
    };
    _chart = new Chart(ctx, config);
}

const ChangeHoverOption = (option) => {
    let mode = ""
    switch(option){
        case "single":
            _chart.options.interaction.intersect = true
            _chart.options.interaction.mode = "nearest"
            break;
        case "bar":
        default:
            _chart.options.interaction.intersect = false
            _chart.options.interaction.mode = "x"
            break;
    }
    _chart.update();
}

const UpdateChart = (categorizedSums, labels) => {
    _chart.options.scales.x.labels = labels
    _chart.data.datasets = categorizedSums
    _chart.update();
}

var _table
const CreateTable = () => {
    _table = new Tabulator("#detailsTable", {
        height:205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        layout:"fitColumns", //fit columns to width of table (optional)
        autoColumns:true
   });
}

const UpdateTable = (barData) => {
    console.log(barData)
    const data = barData.values;
    console.log(data)
    _table.setData(data) //assign data to table
}