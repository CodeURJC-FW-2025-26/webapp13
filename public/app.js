
const ITEMS_PER_PAGE = 6;

let loadMoreRequest = 1;

let errorStates = {
    title: { error: true, errorMessage: "El título no puede estar vacío." },
    synopsis: { error: true, errorMessage: "La sinopsis no puede estar vacía." },
    numEpisode: { error: true, errorMessage: "El número de episodio no puede estar vacío." },
    timeEpisode: { error: true, errorMessage: "El tiempo de episodio no puede estar vacío." },
    cover: { error: true, errorMessage: "La imagen no puede estar vacía." },
    trailer: { error: true, errorMessage: "El video no puede estar vacío." },
}

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


async function checkTitle(id) {

    let titleMessage = document.getElementById("messageTitle");
    let titleInput = document.getElementById("titleInput");

    const firstChar = titleInput.value[0];

    const validationLogic = async () => {

        if (titleInput.value === "") {
            titleInput.classList.add("is-invalid");
            titleMessage.classList.add("invalid-feedback");
            titleMessage.textContent = "El título no puede estar vacío";
            errorStates.title.error = true;
            errorStates.title.errorMessage = titleMessage.textContent;
        }

        else if (firstChar !== firstChar.toUpperCase()) {
            titleInput.classList.add("is-invalid");
            titleMessage.classList.add("invalid-feedback");
            titleMessage.textContent = "El título debe empezar por mayúscula";
            errorStates.title.error = true;
            errorStates.title.errorMessage = titleMessage.textContent;
        }

        else {

            const response = await fetch(`/checkTitle/${id}/${titleInput.value}`);

            if (response.ok) {
                let okMessage = await response.json();
                titleInput.classList.remove("is-invalid");
                titleInput.classList.add("is-valid");
                titleMessage.classList.remove("invalid-feedback")
                titleMessage.classList.add("valid-feedback")
                titleMessage.textContent = okMessage.error
                errorStates.title.errorMessage = titleMessage.textContent;
                errorStates.title.error = false;
            }

            else {
                let errorMessage = await response.json();
                titleInput.classList.add("is-invalid");
                titleMessage.classList.add("invalid-feedback");
                titleMessage.textContent = errorMessage.error;
                errorStates.title.error = true;
                errorStates.title.errorMessage = titleMessage.textContent;
            }
        }
    };

    setTimeout(validationLogic, 2000);
}

function checkSynopsis() {

    let synopsisMessage = document.getElementById("messageSynopsis");
    let synopsisInput = document.getElementById("synopsisInput");
    const firstChar = synopsisInput.value[0];

    const validationLogic = () => {


        if (synopsisInput.value === "") {
            synopsisInput.classList.add("is-invalid");
            synopsisMessage.classList.add("invalid-feedback");
            synopsisMessage.textContent = "La sinopsis no puede estar vacía";
            errorStates.synopsis.errorMessage = synopsisMessage.textContent;
            errorStates.synopsis.error = true;
        }

        else if (firstChar !== firstChar.toUpperCase()) {
            synopsisInput.classList.add("is-invalid");
            synopsisMessage.classList.add("invalid-feedback");
            synopsisMessage.textContent = "La sinopsis debe empezar por mayúscula";
            errorStates.synopsis.error = true;
            errorStates.synopsis.errorMessage = synopsisMessage.textContent;
        }

        else if (synopsisInput.value.length > 800) {
            synopsisInput.classList.add("is-invalid");
            synopsisMessage.classList.add("invalid-feedback");
            synopsisMessage.textContent = "La sinopsis no puede superar los 800 caracteres";
            errorStates.synopsis.error = true;
            errorStates.synopsis.errorMessage = synopsisMessage.textContent;
        }
        else {
            synopsisInput.classList.remove("is-invalid");
            synopsisInput.classList.add("is-valid");
            synopsisMessage.classList.remove("invalid-feedback")
            synopsisMessage.classList.add("valid-feedback")
            synopsisMessage.textContent = "La sinopsis es válida.";
            errorStates.synopsis.error = false;
            errorStates.synopsis.errorMessage = synopsisMessage.textContent;
        }
    };

    setTimeout(validationLogic, 2000);
}


async function checkNumEpisode(id) {

    let numEpisodeMessage = document.getElementById("messageNumEpisode");
    let numEpisodeInput = document.getElementById("numEpisodeInput");
    const validationLogic = async () => {



        if (numEpisodeInput.value === "") {
            numEpisodeInput.classList.add("is-invalid");
            numEpisodeMessage.classList.add("invalid-feedback");
            numEpisodeMessage.textContent = "El número de episodio no puede estar vacío";
            errorStates.numEpisode.error = true;
            errorStates.numEpisode.errorMessage = numEpisodeMessage.textContent;
        }

        else if (isNaN(numEpisodeInput.value)) {
            numEpisodeInput.classList.add("is-invalid");
            numEpisodeMessage.classList.add("invalid-feedback");
            numEpisodeMessage.textContent = "El número de episodio debe ser un número";
            errorStates.numEpisode.error = true;
            errorStates.numEpisode.errorMessage = numEpisodeMessage.textContent;
        }
        else {

            const response = await fetch(`/checkNumberEpisode/${id}/${parseInt(numEpisodeInput.value)}`);

            if (response.ok) {
                let okMessage = await response.json();
                numEpisodeInput.classList.remove("is-invalid");
                numEpisodeInput.classList.add("is-valid");
                numEpisodeMessage.classList.remove("invalid-feedback")
                numEpisodeMessage.classList.add("valid-feedback")
                numEpisodeMessage.textContent = okMessage.error;
                errorStates.numEpisode.error = false;
                errorStates.numEpisode.errorMessage = okMessage.error;
            }
            else {
                let messageError = await response.json();
                numEpisodeInput.classList.add("is-invalid")
                numEpisodeMessage.classList.add("invalid-feedback")
                numEpisodeMessage.textContent = messageError.error;
                errorStates.numEpisode.error = true;
                errorStates.numEpisode.errorMessage = numEpisodeMessage.textContent;
            }
        }
    };

    setTimeout(validationLogic, 2000);
}

function checkTimeEpisode() {

    let timeEpisodeMessage = document.getElementById("messageTimeEpisode");
    let timeEpisodeInput = document.getElementById("timeEpisodeInput");

    const validationLogic = () => {


        if (timeEpisodeInput.value === "") {
            timeEpisodeInput.classList.add("is-invalid");
            timeEpisodeMessage.classList.add("invalid-feedback");
            timeEpisodeMessage.textContent = "El tiempo de episodio no puede estar vacío"
            errorStates.timeEpisode.error = true;
            errorStates.timeEpisode.errorMessage = timeEpisodeMessage.textContent;
        }

        else if (isNaN(timeEpisodeInput.value)) {
            timeEpisodeInput.classList.add("is-invalid");
            timeEpisodeMessage.classList.add("invalid-feedback");
            timeEpisodeMessage.textContent = "El tiempo de episodio debe ser un número";
            errorStates.timeEpisode.error = true;
            errorStates.timeEpisode.errorMessage = timeEpisodeMessage.textContent;
        }

        else {
            timeEpisodeInput.classList.remove("is-invalid");
            timeEpisodeInput.classList.add("is-valid");
            timeEpisodeMessage.classList.remove("invalid-feedback")
            timeEpisodeMessage.classList.add("valid-feedback")
            timeEpisodeMessage.textContent = "El tiempo de episodio es correcto.";
            errorStates.timeEpisode.errorMessage = timeEpisodeMessage.textContent;
            errorStates.timeEpisode.error = false;
        }
    };

    setTimeout(validationLogic, 2000);
}

function checkCover() {

    let coverInput = document.getElementById("coverInput");
    let coverMessage = document.getElementById("messageCover");
    let deleteButton = document.getElementById("deleteCoverButton");
    let output = document.getElementById("coverPreview");


    const file = coverInput.files[0];
    const reader = new FileReader()


    if (coverInput.value !== "") {
        reader.onload = function () {

            output.src = reader.result;
            output.style.display = 'block';
        }

        reader.readAsDataURL(file);

        coverInput.classList.remove("is-invalid");
        coverInput.classList.add("is-valid");
        coverMessage.classList.remove("invalid-feedback")
        coverMessage.classList.add("valid-feedback")
        coverMessage.textContent = "La imagen se ha subido correctamente.";
        deleteButton.style.display = "block";
        errorStates.cover.error = false;
        errorStates.cover.errorMessage = coverMessage.textContent;
    }

    else {
        coverInput.classList.add("is-invalid");
        coverMessage.classList.add("invalid-feedback");
        output.src = "";
        output.style.display = 'none';
        coverMessage.textContent = "La foto no se ha subido correctamente";
        deleteButton.style.display = "none";
        errorStates.cover.error = true;
        errorStates.cover.errorMessage = coverMessage.textContent;
    }

}

function deleteCover() {
    let coverInput = document.getElementById("coverInput");
    let output = document.getElementById("coverPreview");

    coverInput.value = "";
    output.src = "";
    output.style.display = 'none';
    checkCover();
}

function checkTrailer() {

    let trailerInput = document.getElementById("trailerEpisodeInput");
    let trailerMessage = document.getElementById("messageTrailerEpisode");
    let deleteButton = document.getElementById("deleteTrailerButton");
    let output = document.getElementById("trailerPreview");


    let file = trailerInput.files[0];
    const reader = new FileReader()

    if (trailerInput.value !== "") {

        reader.onload = function () {
            output.src = reader.result;
            output.style.display = 'block';
        }

        reader.readAsDataURL(file);

        trailerInput.classList.remove("is-invalid");
        trailerInput.classList.add("is-valid");
        trailerMessage.classList.remove("invalid-feedback");
        trailerMessage.classList.add("valid-feedback");
        trailerMessage.textContent = "El video se ha subido correctamente.";
        deleteButton.style.display = "block";
        errorStates.trailer.error = false;
        errorStates.trailer.errorMessage = trailerMessage.textContent;
    }

    else {
        trailerMessage.classList.add("invalid-feedback");
        trailerInput.classList.add("is-invalid");
        trailerMessage.textContent = "El video no se ha subido correctamente";
        output.src = "";
        output.style.display = 'none';
        deleteButton.style.display = "none";
        errorStates.trailer.error = true;
        errorStates.trailer.errorMessage = trailerMessage.textContent;
    }
}

function deleteTrailer() {
    let trailerInput = document.getElementById("trailerEpisodeInput");
    let output = document.getElementById("trailerPreview");

    trailerInput.value = "";
    output.src = "";
    output.style.display = 'none';
    checkTrailer();
}

async function addEpisode(event, id) {


    const formData = new FormData(event.target);
    const response = await fetch(`/processNewEpisode/${id}`, {
        method: "POST",
        body: formData,
    });

    let data = await response.json();
    if (data.error) {
        let modal = document.getElementById("modal");
        let modalText = document.getElementById("modal-text");
        let modalTitle = document.getElementById("modalHead-text");
        modalTitle.textContent = "Error";
        modalText.innerHTML = `${data.message}`;
        let errorModal = new bootstrap.Modal(modal);
        errorModal.show();
    }

    else {
        const episodes = document.getElementById("episodes");

        episodes.innerHTML += `
        <div class="row episode-row" id="episode_${data.numEpisode}">
            <div class="col-12">
                <h3>${data.numEpisode} ${data.titleEpisode}</h3>
                <p>${data.timeEpisode} minutos</p>
                <h5>Sinopsis:</h5>
                <p class="Text_synopsis">${data.synopsisEpisode}</p>
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
    }
}

async function checkForm(event, id) {

    event.preventDefault();

    let modal = document.getElementById("modal");
    let modalText = document.getElementById("modal-text");
    let modalTitle = document.getElementById("modalHead-text");
    let spinner = document.getElementById("spinner-loader-episode");

    spinner.style.display = "block";
    modalTitle.textContent = "Error";
    modalText.textContent = "";
    await checkTitle(id);
    checkSynopsis();
    await checkNumEpisode(id);
    checkTimeEpisode();
    checkCover();
    checkTrailer();

    let hasErrors = Object.values(errorStates).some(status => status.error === true);

    if (hasErrors) {
        if (errorStates.title.error) {

            modalText.innerHTML += errorStates.title.errorMessage + "<br></br>";
        }

        if (errorStates.synopsis.error) {
            modalText.innerHTML += errorStates.synopsis.errorMessage + "<br></br>";
        }

        if (errorStates.numEpisode.error) {
            modalText.innerHTML += errorStates.numEpisode.errorMessage + "<br></br>";
        }

        if (errorStates.timeEpisode.error) {
            modalText.innerHTML += errorStates.timeEpisode.errorMessage + "<br></br>";
        }

        if (errorStates.cover.error) {
            modalText.innerHTML += errorStates.cover.errorMessage + "<br></br>";
        }

        if (errorStates.trailer.error) {
            modalText.innerHTML += errorStates.trailer.errorMessage + "<br></br>";
        }

        setTimeout(() => {
            spinner.style.display = "none";
        }, 2000)

        let errorModal = new bootstrap.Modal(modal);
        errorModal.show();
    }

    else {
        await addEpisode(event, id);
        let inputs = document.getElementsByTagName("input");
        document.getElementById("synopsisInput").value = "";

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = "";
        }

        checkCover();
        checkTrailer();

        setTimeout(() => {
            spinner.style.display = "none";
        }, 2000)
    }


}

//delete Episode
async function deleteEpisode(idSerie, numEpisode) {
    const response = await fetch(`/deleteEpisode/${idSerie}/${numEpisode}`);
    let spinner = document.getElementById('spinner-loader_' + numEpisode);
    spinner.style.display = 'block';

    setTimeout(async () => {
        if (response.ok) { // response.ok will be true when there is no error(not send.status(400))
            let element = document.getElementById('episode_' + numEpisode);
            element.style.display = 'none'
            spinner.style.display = 'none';
        }
        else {
            spinner.style.display = 'none';
            /*Show modal */
            const error = await response.json();
            let modal = document.getElementById("modal");
            let modalText = document.getElementById("modal-text");
            let modalTitle = document.getElementById("modalHead-text")

            modalTitle.textContent = error.title
            modalText.textContent = error.message;

            const errorModal = new bootstrap.Modal(modal);
            errorModal.show();
        }
    }, 1000);
}

//delete Serie

//Show confirmation modal before deleting 
async function confirmDeleteSerie(idSerie) {
    let modal = document.getElementById("modal");
    let modalText = document.getElementById("modal-text");
    let modalTitle = document.getElementById("modalHead-text");
    let modalButton = document.getElementById("modal-button");

    modalTitle.textContent = "Confirmación";
    modalText.textContent = "¿Está seguro de que desea eliminar esta serie? Esta acción es irreversible y no se puede deshacer.";

    modalButton.innerHTML = `<button class='btn btn-secondary' data-bs-dismiss='modal' onclick='deleteSerie("${idSerie}")'>Confirmar</button>`;

    const confirmModal = new bootstrap.Modal(modal);
    confirmModal.show();
}


async function deleteSerie(idSerie) {
    console.log(idSerie);
    const response = await fetch(`/deleteSerie/${idSerie}`);
    let spinner = document.getElementById('spinner-loader');
    spinner.style.display = 'block';

    setTimeout(async () => {
        if (response.ok) { // response.ok will be true when there is no error(not send.status(400))
            const data = await response.json();
            spinner.style.display = 'none';
            window.location.href = "/";
        }
        else {
            spinner.style.display = 'none';
            /*Show modal */
            const error = await response.json();
            let modal = document.getElementById("modal");
            let modalText = document.getElementById("modal-text");
            let modalTitle = document.getElementById("modalHead-text")
            let modalButton = document.getElementById("modal-button");

            modalTitle.textContent = error.title
            modalText.textContent = error.message;
            modalButton.innerHTML = "";
            const errorModal = new bootstrap.Modal(modal);
            errorModal.show();
        }
    }, 1000);
}
