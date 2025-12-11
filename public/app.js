
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

//main_detalle

//delete Episode
async function deleteEpisode(idSerie,numEpisode) {
    const response = await fetch(`/deleteEpisode/${idSerie}/${numEpisode}`);
    const data = await response.json();
    let spinner = document.getElementById('spinner-loader_' + numEpisode);
    spinner.style.display = 'block';
    
    setTimeout(async()=>{ 
    if (data.data){ // first data is a JSON object that contains the variable data(second), which is a boolean.
        let element = document.getElementById('episode_' + numEpisode);
        element.style.display = 'none'
        spinner.style.display = 'none';
        console.log(data);
    }
    else{
        spinner.style.display = 'none';
        /*Show modal */
        let container = document.getElementById('modal_page'); 
        const title = "Error"
        const body = "Ha ocurrido un problema al intentar borrar el elemento"
        const content = await fetch(`/modal?title=${title}&body=${body}`);
        const pagePart = await content.text();
        container.innerHTML = pagePart;
        const modalElement = document.getElementById('modal'); 
        const errorModal = new bootstrap.Modal(modalElement);
        errorModal.show();
    }}, 1000);
}

//delete Serie

async function deleteSerie(idSerie) {
    const response = await fetch('/deleteSerie/${idSerie}')
    console.log(response)
}
