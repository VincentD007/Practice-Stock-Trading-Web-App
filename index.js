const searchResults = document.getElementById("TickerSearchResults");
const searchDisplayName = document.getElementById("SelectedCoinName");
const searchDisplayPrice = document.getElementById("SelectedCoinPrice");
const searchDisplayBody = document.getElementById("SelectedDisplayBody");
const tickerSearchBar = document.getElementById("TickerSearchBar").childNodes[1];
const topCoins = Array.from(document.querySelectorAll(".TopCoin"));
const UserShares = document.getElementById("SharesList");
const BuyButton = document.getElementById("ActionBuy");
const SellButton = document.getElementById("ActionSell");
const BuySellInput = document.getElementById("AmntBuySell").children[1]
const UsrTotal =  document.getElementById("Monies").children[1].children[1]
const UsrSecurities = document.getElementById("Monies").children[2].children[1]
const UsrLiquid = document.getElementById("Monies").children[3].children[1]
const HoldingsList = document.getElementById("Holdings").children[1]
var initialLoad = false;
let holdingsItem = document.createElement("li");
holdingsItem.innerHTML = "<div><h4></h4><div></div></div>";

const updateTimeFeed = () => {
    let [day, month, monthday, year, time] = Date().split(" ");
    let formattedDate = `${monthday} ${month} ${year}`;
    document.getElementById("Date").innerText = formattedDate;
    document.getElementById("Time").innerText = time;
}   

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
    }
}


const updateMonies = () => {
    let wallet = JSON.parse(localStorage.getItem("Wallet"))
    let liquid = 0.00;
    let securities = 0.00;
    
    liquid += wallet.money
    for (coin in wallet.coins) {
        for (coinData of JSON.parse(localStorage.getItem("CoinData"))) {
            if (coin == coinData.symbol) {
                securities += wallet.coins[coin] * coinData.price;
            }
        }
    }

    securities = Number(securities.toFixed(2))
    UsrTotal.innerText = `$${Math.round(liquid + securities)}`
    UsrSecurities.innerText = `$${securities}`
    UsrLiquid.innerText = `$${liquid}`
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

    updateMonies()
    
    HoldingsList.innerHTML = "";
    let wallet = JSON.parse(localStorage.getItem("Wallet"));
    for (key in wallet.coins) {
        let coinData = JSON.parse(localStorage.getItem("CoinData")).filter((elem) => {
            return elem.symbol == key;
        })[0]

        if(!coinData) {continue;}
        let coinHolding = holdingsItem.cloneNode(true);
        let coinQuantity = `<span>${wallet.coins[key]}</span> or <span>$${Number((coinData.price * wallet.coins[key])).toFixed(2)}</span>`
        coinHolding.children[0].children[0].innerText = key;
        coinHolding.children[0].children[1].innerHTML = coinQuantity;
        UserShares.appendChild(coinHolding);
        coinHolding.addEventListener("click", (eventObj) => {
            let ticker = eventObj.currentTarget.children[0].children[0].innerText
            setSearchInputValue(ticker);
            autoSearch(ticker);
            displayCoin(ticker);
        })
    }

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
        setInterval(() => {updateTimeFeed()}, 1000)
        setInterval(() => {loadData(0, [])}, 8000)
        initialLoad = true;
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

if (localStorage.getItem("Wallet") == null) {
    localStorage.setItem("Wallet", JSON.stringify({
        coins: {
            BTC: 0.05,
            ETH: 3.05
        },
        money: 150000.00
    }))
}

BuyButton.addEventListener("click", eventObj => {
    let wallet = JSON.parse(localStorage.getItem("Wallet"))
    if (!BuySellInput.value) {
        alert("You didint input an amount!")
        return
    }
    else if (wallet.money == 0) {
        alert("You have no money!");
        return;
    }

    let addCoinAmnt;
    let coinToBuy = JSON.parse(localStorage.getItem("CoinData")).filter(elem => {
        return searchDisplayName.innerText === elem.name;
    })[0]

    if (wallet.money <= Number(BuySellInput.value)) {
        addCoinAmnt = Number(wallet.money) / coinToBuy.price;
        wallet.money = 0.00
    }
    else {
        addCoinAmnt = Number(BuySellInput.value) / coinToBuy.price;
        let newBalance = Number((wallet.money - BuySellInput.value).toFixed(2));
        wallet.money = newBalance;
    }

    if (!wallet.coins[coinToBuy.symbol]) {
        wallet.coins[coinToBuy.symbol] = Number(addCoinAmnt.toFixed(5));
    }
    else {
        wallet.coins[coinToBuy.symbol] += addCoinAmnt;
        wallet.coins[coinToBuy.symbol] = Number((wallet.coins[coinToBuy.symbol]).toFixed(5))
    }

    localStorage.setItem("Wallet", JSON.stringify(wallet));
    updatePage()

})

SellButton.addEventListener("click", eventObj => {
    BuySellInput.value = Math.round(BuySellInput.value)
    let wallet = JSON.parse(localStorage.getItem("Wallet"))
    let coinToSell = JSON.parse(localStorage.getItem("CoinData")).filter(elem => {
        return searchDisplayName.innerText === elem.name;
    })[0]

    if (!BuySellInput.value) {
        alert("You didint input an amount!");
        return;
    }
    else if (!wallet.coins[coinToSell.symbol]) {
        alert(`You dont have any ${coinToSell.name} to sell!`);
        return;
    }

    let UsrCoinAmntInDollars = wallet.coins[coinToSell.symbol] * coinToSell.price;
    let UsrSellAmnt = Number(BuySellInput.value);
    let newBalance;

    if (UsrSellAmnt >= UsrCoinAmntInDollars) {
        delete wallet.coins[coinToSell.symbol];
        newBalance = Number((wallet.money + UsrCoinAmntInDollars).toFixed(2));
        wallet.money = newBalance;
    }
    else {
        let newCoinBalance = (wallet.coins[coinToSell.symbol] - (UsrSellAmnt / coinToSell.price)).toFixed(5);
        wallet.coins[coinToSell.symbol] = newCoinBalance;
        newBalance = Number((wallet.money + UsrSellAmnt).toFixed(2));
        wallet.money = newBalance;
    }

    localStorage.setItem("Wallet", JSON.stringify(wallet));
    updatePage();

})
