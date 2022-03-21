var _cfgFile
var _valueSign = ValueSign.NEGATIVE
var _financeDataPool = new FinanceDataPool();
var _table
var _barChart

window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    _cfgFile = new CFG_File(data);

    CreateTabs();
    _barChart = new BarChart();
    _barChart.AddListenerOnSelection(function (barData) { UpdateTable(barData)})
    CreateTable();
});

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received")
    let csvFile = new CSV_File_DKB(data);
    _financeDataPool.Add(csvFile);
    _barChart.UpdateChart(_financeDataPool);
});

const buttonReload = document.getElementById('buttonReload')
buttonReload.addEventListener('click', () => {
    if (_barChart !== undefined)
        _barChart.Reset();
    if (_financeDataPool !== undefined)
        _financeDataPool.Clear();
    window.electron.onReload()
});

const selectHover = document.getElementById('selectHover')
selectHover.addEventListener('change', () => {
    if (_barChart !== undefined)
        _barChart.ChangeHoverOption(selectHover.value)
});

const CreateTabs = () => 
{
    const modeTabs = document.getElementById('modeTabs');
    for (const [key, valueSign] of Object.entries(ValueSign))
    {
        let btn = document.createElement("button");
        btn.class = "tabButton";
        btn.className = "tabButton";
        btn.id = key
        btn.innerHTML = key;
        btn.onclick = () => 
        { 
            
            // Get all elements with class="tabButtons" and remove the class "active"
            tabButtons = document.getElementsByClassName("tabButton");
            for (i = 0; i < tabButtons.length; i++) {
                tabButtons[i].className = tabButtons[i].className.replace(" active", "");
            }

            // Show the current tab, and add an "active" class to the button that opened the tab
            document.getElementById(key).style.display = "block";
            document.getElementById(key).className += " active";
            _barChart.UpdateChart(_financeDataPool, valueSign);
        }
        modeTabs.appendChild(btn);
    }
}


const CreateTable = () => {
    _table = new Tabulator("#detailsTable", {
        minHeight: 10,
        maxHeight: 500,
        layout:"fitDataStretch",
        autoColumns:true
   });
}

const UpdateTable = (barData) => {
    _table.setData(barData) //assign data to table
}