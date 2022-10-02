class Helper
{
    //https://stackoverflow.com/questions/6072590/how-to-match-an-empty-dictionary-in-javascript
    static isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    static onlyUnique(value, index, self){
        return self.indexOf(value) === index;
    }

    static compareGroupByDate(a, b)
    {
        return Helper.compareDateStrings(a.date,b.date)
    }

    static contains(a, b){
        return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
    }

    static getRandomColor(number){
        const hue = number * 137.508; // use golden angle approximation
        return `hsl(${hue},85%,85%)`;
    }

    // to create color palettes : http://vrl.cs.brown.edu/color // awesome!!!
    static getColorFromColorTable(number){
        const colorTable = ["#cefa6e", "#aef375", "#8feb7d",  "#6ee386", "#48da8e", "#00d097", "#00c69e", "#00bca4", "#00b1a9", "#00a6ac", "#009bac", "#008fab", "#0084a8", "#0078a2",
            "#006d9b",
            "#006191",
            "#005687",
            "#074a7a",
            "#1f406d",
            "#28355f"
            ]
        return colorTable[number % colorTable.length]
    }
    
    static getHashcode(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
        h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1>>>0);
    };

    static stringToMonthYearString(dateString)
    {
        const regEx = /(\d{2})\.(\d{2})\.(\d{4})/;
        const [full, day, month, year] = regEx.exec(dateString);
        const monthYearString = month + "." + year
        return monthYearString;
    }

    static compareDateStrings(a, b)
    {
        let aMonthYear = a.substring(6)
        let bMonthYear = b.substring(6)
        if (aMonthYear > bMonthYear) {
            return 1;
        }
        else if (aMonthYear < bMonthYear) {
            return -1;
        }
        else{
            let aMonth = a.substring(3,5);
            let bMonth = b.substring(3,5);
            if (aMonth > bMonth) {
                return 1;
            }
            else if (aMonth < bMonth) {
                return -1;
            }
            else{
                let aDay = a.substring(0,2);
                let bDay = b.substring(0,2);
                if (aDay == bDay)
                    return 0;
                return aDay > bDay ? 1 : -1
            }
        }
    }
    
    //https://gist.github.com/mikaello/06a76bca33e5d79cdd80c162d7774e9c
    static groupBy(keys)
    { 
        return array =>
            array.reduce((objectsByKeyValue, obj) => {
            const value = keys.map(key => obj[key]).join('-');
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
        }, {});
    }
}

if (typeof module !== 'undefined'){
    module.exports = Helper;
}