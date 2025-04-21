const searchResults = document.getElementById("TickerSearchResults");
const searchDisplayName = document.getElementById("SelectedCoinName");
const searchDisplayPrice = document.getElementById("SelectedCoinPrice");
const searchDisplayBody = document.getElementById("SelectedDisplayBody");
const tickerSearchBar = document.getElementById("TickerSearchBar").childNodes[1];
const topCoins = Array.from(document.querySelectorAll(".TopCoin"));
var initialLoad = false;


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
                    price: coinObj.price_usd,
                    MarketCap: coinObj.market_cap_usd
                });
            }
                loadData(fetchindex + 100, dataObj)
        })
        .catch(err => console.log(err))
    }
    else {
        localStorage.setItem("CoinData", JSON.stringify(dataObj))
        updatePage()
        if (!initialLoad) {
            'set intervals'
            for (topCoin of topCoins) {
                topCoin.addEventListener("click", (eventObj) => {
                    let ticker = eventObj.currentTarget.children[0].innerHTML;
                    setSearchInputValue(ticker);
                    autoSearch(ticker);
                    displayCoin(ticker);
                })
            }
            setInterval(() => {loadData(0, [])}, 8000)
            initialLoad = true;
        }
    }
}


const updatePage = () => {
    let topCoinsData = JSON.parse(localStorage.getItem("CoinData")).filter(elem => {
        return (0 < elem.rank) && (elem.rank < 4);
    })

    for (coin of topCoinsData) {
        let topcoin = topCoins[coin.rank -1];
        topcoin.children[0].innerText = coin.symbol;
        topcoin.children[1].innerHTML = coin.price;
        topcoin.children[3].innerHTML = coin.MarketCap;
    }

    if (searchDisplayBody.style.visibility == "visible") {
        displayCoin(searchDisplayName.innerHTML);
    }
}


const setSearchInputValue = (coinName) => {
    tickerSearchBar.value = coinName;
    autoSearch(coinName);
}


const displayCoin = (coinName) => {
    let coinInfo; 

    for (coin of JSON.parse(localStorage.getItem("CoinData"))) {
        if (coin.symbol === coinName || coin.name === coinName) {
            coinInfo = coin;
            break;
        }
    }
    if (!coinInfo) {return};

    searchDisplayBody.style.visibility = "visible"
    searchDisplayName.innerHTML = coinInfo.name;
    searchDisplayPrice.innerHTML = coinInfo.price;
}


const autoSearch = (input) => {
    searchResults.innerHTML = ""
    if (!input) {
        searchDisplayBody.style.visibility = "hidden";
        return;
    }

    for (coin of JSON.parse(localStorage.getItem("CoinData")).filter((elem) => {
        return elem.symbol.indexOf(input) != -1;
    })) {
        let searchItem = document.createElement("li");
        searchItem.innerText = coin.symbol;
        searchResults.appendChild(searchItem);
        searchItem.addEventListener("click", eventObject => {
            setSearchInputValue(eventObject.target.innerText);
            displayCoin(eventObject.target.innerText);
        })
    }
}


loadData(0, [])
tickerSearchBar.addEventListener("input", eventObject => {autoSearch(eventObject.target.value)})
