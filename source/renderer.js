var _valueSign = ValueSign.NEGATIVE
var _financeDataPool = new FinanceDataPool();
var _table
var _barChart

window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    let cfgFile = new CFG_File(data);

    CreateTabs();
    _barChart = new BarChart(cfgFile);
    _barChart.AddListenerOnSelection(function (barData) { UpdateTable(barData)})
    CreateTable();
    let categories = cfgFile.getCategories()
    CreateExcludeOptions(categories);
});

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received")
    let csvFile = new CSV_File_DKB(data);
    _financeDataPool.Add(csvFile);
    _barChart.UpdateChart(_financeDataPool);
    
    document.getElementById("accountBalance").innerHTML = _financeDataPool.getTotalAccountBalance().toFixed(2)
});

const buttonReload = document.getElementById('buttonReload')
buttonReload.addEventListener('click', () => {
    if (_barChart !== undefined)
        _barChart.Reset();
    if (_financeDataPool !== undefined)
        _financeDataPool.Clear();
    window.electron.onReload()
});

const toggleHoverType = document.getElementById('toggleHoverType')
toggleHoverType.addEventListener('change', () => {
    let type = toggleHoverType.checked ? "single" : "bar"
    if (_barChart !== undefined)
        _barChart.ChangeHoverOption(type)
});

const CreateTabs = () => 
{
    const modeTabs = document.getElementById('modeTabs');
    modeTabs.innerHTML = '';
    for (const [key, valueSign] of Object.entries(ValueSign))
    {
        let btn = document.createElement("button");
        btn.class = "tabButton";
        btn.className = "tabButton";
        btn.id = key
        btn.innerHTML = key;
        btn.onclick = () => 
        { 
            OnTabClicked(key, valueSign);
        }
        modeTabs.appendChild(btn);
    }
}

const OnTabClicked = (tabName, valueSign) => 
{
    // Get all elements with class="tabButtons" and remove the class "active"
    tabButtons = document.getElementsByClassName("tabButton");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    
    const container = document.getElementById('excludeCategoryContainer');
    container.hidden = valueSign != ValueSign.TOTAL;

    const barChart = document.getElementById('barChart');
    barChart.style.display = valueSign != ValueSign.ALL ? "block" : "none";

    const lineChart = document.getElementById('lineChart');
    lineChart.style.display = valueSign == ValueSign.ALL ? "block" : "none";

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).className += " active";
    _barChart.UpdateChart(_financeDataPool, valueSign);
}

const CreateExcludeOptions = (categories) =>
{
    const container = document.getElementById('excludeCategoryContainer');
    container.innerHTML = '';

    for (const [category, entries] of Object.entries(categories))
    {
        let lbl = document.createElement("label");
        var inputCheckbox = document.createElement("input");
        let span = document.createElement("span");
        let textspan = document.createElement("span");

        lbl.className = "switch"
        inputCheckbox.type = "checkbox";
        inputCheckbox.id = "checkBox" + category
        inputCheckbox.onchange = () => OnExcludeOptionChanged(category);
        span.className = "slider round";
        textspan.innerHTML = category;
        
        lbl.appendChild(inputCheckbox)
        lbl.appendChild(span)
        lbl.appendChild(textspan)

        container.appendChild(lbl);


        container.appendChild(document.createElement("br"));
        
    }
}

const OnExcludeOptionChanged = (category) => 
{
    let checkBox = document.getElementById("checkBox" + category)
    let shouldExclude = checkBox.checked
    _barChart.SetExcludeCategory(category, shouldExclude)
    _barChart.UpdateChart(_financeDataPool, _barChart._valueSign);
}


const CreateTable = () => {
    _table = new Tabulator("#detailsTable", {
        height:"100%",
        autoColumns:true
   });
}

const UpdateTable = (barData) => {
    _table.setData(barData) //assign data to table
}