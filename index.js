const searchResults = document.getElementById("TickerSearchResults");
var searchResultIDs = [];

const loadData = (fetchindex, dataObj) => {
    if (fetchindex < 500) {
        fetch(`https://api.coinlore.net/api/tickers?start=${fetchindex}&limit=100`)
        .then(rawdata => rawdata.json())
        .then(json => {
            for (coinObj of json.data) {
                dataObj.push({
                    rank: coinObj.rank,
                    name: coinObj.name,
                    symbol: coinObj.symbol,
                    id: coinObj.id,
                    price: coinObj.price_usd
                });
            }
                loadData(fetchindex + 100, dataObj)
        })
        .catch(err => console.log(err))
    }
    else {
        localStorage.setItem("CoinData", JSON.stringify(dataObj))
    }
}

const autoSearch = (eventObj) => {
    let input = eventObj.target.value;
    searchResults.innerHTML = ""
    if (!input) {return}

    for (coin of JSON.parse(localStorage.getItem("CoinData")).filter((elem) => {
        return elem.symbol.indexOf(input) != -1;
    })) {
        let searchItem = document.createElement("li");
        searchItem.innerText = coin.symbol;
        searchResults.appendChild(searchItem);
    }
}

loadData(0, [])
document.addEventListener("input", autoSearch)
