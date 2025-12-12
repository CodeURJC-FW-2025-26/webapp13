
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
    if (window.location.pathname === '/') {
        const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
        scrollTop + clientHeight > scrollHeight - 1 && setTimeout(moreSeries, 1000);
    }

})

//main_detalle

// Add more episodes


function checkTitle() {


    const validationLogic = () => {

        let titleMessage = document.getElementById("messageTitle");
        let titleInput = document.getElementById("titleInput");
        const firstChar = titleInput.value[0];

        if (titleInput.value === "") {
            titleMessage.innerHTML = "<p>El título no puede estar vacío</p>"
        }

        else if (firstChar !== firstChar.toUpperCase()) {
            titleMessage.innerHTML = "<p>El título debe empezar por mayuscula</p>"
        }

        else
            titleMessage.innerHTML = "";
    };

    setTimeout(validationLogic, 2000);
}

function checkSynopsis() {


    const validationLogic = () => {

        let synopsisMessage = document.getElementById("messageSynopsis");
        let synopsisInput = document.getElementById("synopsisInput");
        const firstChar = synopsisInput.value[0];

        if (synopsisInput.value === "") {
            synopsisMessage.innerHTML = "<p>La sinopsis no puede estar vacía</p>"
        }

        else if (firstChar !== firstChar.toUpperCase()) {
            synopsisMessage.innerHTML = "<p>La sinopsis debe empezar por mayuscula</p>"
        }

        else if (synopsisInput.value.length > 800)
            synopsisMessage.innerHTML = "<p>La sinopsis no puede superar los 800 caracteres</p>";
        else
            synopsisMessage.innerHTML = "";
    };

    setTimeout(validationLogic, 2000);
}




async function addEpisode(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await fetch(`/processNewEpisode/${id}`, {
        method: "POST",
        body: formData,
    });

    if (response.ok) {

        let data = await response.json();

        const episodes = document.getElementById("episodes");

        episodes.innerHTML += `
        <div class="row episode-row" id="episode_${data.numEpisode}">
                    <div class="col-12">
                        <h3>${data.numEpisode} ${data.titleEpisode}</h3>
                        <p>${data.timeEpisode} minutos</p>
                        <h5>Sinopsis:</h5>
                        <p class="Text_synopsis">${data.synopsisEpisode}</p>

                        <div class="row_button row">
                            <div class="buttons-group1">
                                <!-- botones -->
                            </div>
                        </div>

                        <img class="visual" src="/episode/${id}/${data.numEpisode}/image">
                        <br></br>
                        <video class="visual" src="/episode/${id}/${data.numEpisode}/video" controls loop></video>

                        <div class="spinner" id="spinner-loader_${data.numEpisode}"></div>

                        <div class="form-actions">
                            <a href="/update_episode/${id}/${data.numEpisode}" class="btn-action">Editar
                                episodio</a>
                            <button class="btn-action" onclick="deleteEpisode('${id}','${data.numEpisode}')">Borrar
                                episodio</button>
                        </div>
                    </div>
                </div>
        
        `

        let inputs = document.getElementsByTagName("input");
        document.getElementById("synopsisInput").value = "";

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = "";
        }

    } else {

        const errorData = await response.json();

        let modal = document.getElementById("modal");
        let modalText = document.getElementById("modal-text");

        modalText.textContent = errorData.message;

        const errorModal = new bootstrap.Modal(modal);
        errorModal.show();
    }
}


//delete Episode
async function deleteEpisode(idSerie, numEpisode) {
    const response = await fetch(`/deleteEpisode/${idSerie}/${numEpisode}`);
    const data = await response.json();
    let spinner = document.getElementById('spinner-loader_' + numEpisode);
    spinner.style.display = 'block';

    setTimeout(async () => {
        if (data.data) { // first data is a JSON object that contains the variable data(second), which is a boolean.
            let element = document.getElementById('episode_' + numEpisode);
            element.style.display = 'none'
            spinner.style.display = 'none';
            console.log(data);
        }
        else {
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
        }
    }, 1000);
}

//delete Serie

async function deleteSerie(idSerie) {
    const response = await fetch('/deleteSerie/${idSerie}')
    console.log(response)
}
