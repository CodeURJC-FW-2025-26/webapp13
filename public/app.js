
const ITEMS_PER_PAGE = 6;

let loadMoreRequest = 1;

const spinner = document.getElementById("spinner-loader")

async function moreSeries() {
    let from = loadMoreRequest * ITEMS_PER_PAGE;

    let currentGenre = document.getElementById("current-genre");

    let searchResult = document.getElementById("search-bar-input").value;

    let query = `from=${from}& count=${ITEMS_PER_PAGE}`;

    if (currentGenre !== null && searchResult !== "") {
        query += `&genre=${currentGenre}&title=${searchResult}`;
    }

    else {
        if (currentGenre !== null)
            query += `&genre=${currentGenre}`;
        if (searchResult !== "")
            query += `&title=${searchResult}`;
    }

    const response = await fetch(`/moreSeries?${query} `);
    let newSeries = await response.text();

    if (newSeries.trim().length > 0) {
        const seriesDiv = document.getElementById("serie");
        seriesDiv.innerHTML += newSeries;
        loadMoreRequest++;
    }

    else {
        spinner.style.display = "none";
    }
}

window.addEventListener('scroll', () => {
    const { scrollHeight, clientHeight, scrollTop } = document.documentElement;

    scrollTop + clientHeight > scrollHeight - 1 && setTimeout(moreSeries, 1000);
})

