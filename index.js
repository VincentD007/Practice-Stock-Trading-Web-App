const loadData = (fetchindex, dataObj) => {
    if (fetchindex < 2000) {
        fetch(`https://api.coinlore.net/api/tickers?start=${fetchindex}&limit=100`)
        .then(rawdata => rawdata.json())
        .then(json => {
            for (coinObj of json.data) {
                dataObj[coinObj.symbol] = {
                    name: coinObj.name,
                    id: coinObj.id
                };
            }
            loadData(fetchindex + 100, dataObj)
        })
        .catch(err => console.log(err))
    }
    else {
        localStorage.setItem(CoinData, JSON.stringify(dataObj))
    }
}

loadData(0, {})