let historyItems = [];
let addHistoryItem = (item) => {
    if (item == null)
        return;
    if (historyItems.length >= 9) {
        historyItems.pop();
    }
    item.apiLogoName = require('path').basename(item.apiLogoPath);
    historyItems.unshift(item);
    //console.log(historyItems);
}

let getHistoryItems = () => {
    return historyItems;
}
export {
    addHistoryItem,
    getHistoryItems
}