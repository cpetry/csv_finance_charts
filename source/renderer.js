const ctx = document.getElementById('myChart');
    
window.electron.onConfigLoaded((data) => {
    console.log("Config data received: " + data)
});

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received: " + data)
});