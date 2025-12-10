
const ITEMS_PER_PAGE = 6;

let loadMoreRequest = 0;

async function isEnd() { 

        let from = (loadMoreRequest + 1) * ITEMS_PER_PAGE;
        const response = await fetch(`/moreSeries?from=${from}&to=${ITEMS_PER_PAGE}`);
        let newSeries = await response.text();
        const seriesDiv = document.getElementById("serie");
        seriesDiv.innerHTML += newSeries;
        loadMoreRequest++;
}


