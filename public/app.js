const ITEMS_PER_PAGE = 6;

let loadMoreRequest = 1;

let errorStatesSerie = {
    title: { error: true, errorMessage: "El título no puede estar vacío." },
    synopsis: { error: true, errorMessage: "La sinopsis no puede estar vacía." },
    genre: { error: true, errorMessage: "Debe seleccionar un género." },
    age: { error: true, errorMessage: "La edad es obligatoria." },
    seasons: { error: true, errorMessage: "El número de temporadas es obligatorio." },
    premiere: { error: true, errorMessage: "El año de estreno es obligatorio." },
    cover: { error: false, errorMessage: "La imagen es obligatoria." }
};

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
//main_nuevo-elem

async function checkSerieTitle(id) {
    let titleMessage = document.getElementById("messageSerieTitle");
    let titleInput = document.getElementById("title");

    const serieId = id;

    const firstChar = titleInput.value.length > 0 ? titleInput.value[0] : "";

    const validationLogic = async () => {
        if (titleInput.value === "") {
            titleInput.classList.add("is-invalid");
            titleMessage.classList.add("invalid-feedback");
            titleMessage.textContent = "El título no puede estar vacío";
            errorStatesSerie.title.error = true;
        } 
        else if (firstChar !== firstChar.toUpperCase()) {
            titleInput.classList.add("is-invalid");
            titleMessage.classList.add("invalid-feedback");
            titleMessage.textContent = "El título debe empezar por mayúscula";
            errorStatesSerie.title.error = true;
        } 
        else {
            const response = await fetch(`/checkSerieTitle/${titleInput.value}?id=${serieId}`);
            
            if (response.ok) {
                let okMessage = await response.json();
                titleInput.classList.remove("is-invalid");
                titleInput.classList.add("is-valid");
                titleMessage.classList.remove("invalid-feedback");
                titleMessage.classList.add("valid-feedback");
                titleMessage.textContent = okMessage.message;
                errorStatesSerie.title.error = false;
            } else {
                let errorMessage = await response.json();
                titleInput.classList.add("is-invalid");
                titleMessage.classList.add("invalid-feedback");
                titleMessage.textContent = errorMessage.error;
                errorStatesSerie.title.error = true;
            }
        }
    };
    await validationLogic();
}

function checkSerieGenre() {
    let genreMessage = document.getElementById("messageSerieGenre");
    let genreInput = document.getElementById("genre");

    if (genreInput.value === "") {
        genreInput.classList.add("is-invalid");
        genreMessage.classList.add("invalid-feedback");
        genreMessage.textContent = "Selecciona un género";
        errorStatesSerie.genre.error = true;
    } else {
        genreInput.classList.remove("is-invalid");
        genreInput.classList.add("is-valid");
        genreMessage.textContent = "";
        errorStatesSerie.genre.error = false;
    }
}

function checkSerieAge() {
    let ageMessage = document.getElementById("messageSerieAge");
    let ageInput = document.getElementById("age");
    let value = parseInt(ageInput.value);

    if (ageInput.value === "" || isNaN(value)) {
        ageInput.classList.add("is-invalid");
        ageMessage.classList.add("invalid-feedback");
        ageMessage.textContent = "La edad es obligatoria";
        errorStatesSerie.age.error = true;
    } else if (value < 1 || value > 18) {
        ageInput.classList.add("is-invalid");
        ageMessage.classList.add("invalid-feedback");
        ageMessage.textContent = "La edad debe estar entre 0 y 18";
        errorStatesSerie.age.error = true;
    } else {
        ageInput.classList.remove("is-invalid");
        ageInput.classList.add("is-valid");
        ageMessage.textContent = "";
        errorStatesSerie.age.error = false;
    }
}

function checkSerieSeasons() {
    let seasonMessage = document.getElementById("messageSerieSeasons");
    let seasonInput = document.getElementById("seasons");
    let value = parseInt(seasonInput.value);

    if (seasonInput.value === "" || isNaN(value)) {
        seasonInput.classList.add("is-invalid");
        seasonMessage.classList.add("invalid-feedback");
        seasonMessage.textContent = "El campo es obligatorio";
        errorStatesSerie.seasons.error = true;
    } else if (value < 1 || value > 20) {
        seasonInput.classList.add("is-invalid");
        seasonMessage.classList.add("invalid-feedback");
        seasonMessage.textContent = "Temporadas entre 1 y 20";
        errorStatesSerie.seasons.error = true;
    } else {
        seasonInput.classList.remove("is-invalid");
        seasonInput.classList.add("is-valid");
        seasonMessage.textContent = "";
        errorStatesSerie.seasons.error = false;
    }
}

function checkSeriePremiere() {
    let yearMessage = document.getElementById("messageSeriePremiere");
    let yearInput = document.getElementById("year");
    let value = parseInt(yearInput.value);
    const currentYear = new Date().getFullYear();

    if (yearInput.value === "" || isNaN(value)) {
        yearInput.classList.add("is-invalid");
        yearMessage.classList.add("invalid-feedback");
        yearMessage.textContent = "El año es obligatorio";
        errorStatesSerie.premiere.error = true;
    } else if (value < 1900 || value > currentYear + 1) {
        yearInput.classList.add("is-invalid");
        yearMessage.classList.add("invalid-feedback");
        yearMessage.textContent = `Año entre 1900 y ${currentYear + 1}`;
        errorStatesSerie.premiere.error = true;
    } else {
        yearInput.classList.remove("is-invalid");
        yearInput.classList.add("is-valid");
        yearMessage.textContent = "";
        errorStatesSerie.premiere.error = false;
    }
}

function checkSerieSynopsis() {
    let synopsisMessage = document.getElementById("messageSerieSynopsis");
    let synopsisInput = document.getElementById("synopsis");
    const firstChar = synopsisInput.value.length > 0 ? synopsisInput.value[0] : "";

    const validationLogic = () => {
        if (synopsisInput.value === "") {
            synopsisInput.classList.add("is-invalid");
            synopsisMessage.classList.add("invalid-feedback");
            synopsisMessage.textContent = "La sinopsis no puede estar vacía";
            errorStatesSerie.synopsis.error = true;
        } else if (firstChar !== firstChar.toUpperCase()) {
            synopsisInput.classList.add("is-invalid");
            synopsisMessage.classList.add("invalid-feedback");
            synopsisMessage.textContent = "La sinopsis debe empezar por mayúscula";
            errorStatesSerie.synopsis.error = true;
        } else if (synopsisInput.value.length > 500) {
            synopsisInput.classList.add("is-invalid");
            synopsisMessage.classList.add("invalid-feedback");
            synopsisMessage.textContent = "La sinopsis no puede superar los 500 caracteres";
            errorStates.synopsis.error = true;
        } else {
            synopsisInput.classList.remove("is-invalid");
            synopsisInput.classList.add("is-valid");
            synopsisMessage.classList.remove("invalid-feedback");
            synopsisMessage.classList.add("valid-feedback");
            synopsisMessage.textContent = "Sinopsis válida";
            errorStatesSerie.synopsis.error = false;
        }
    };
    validationLogic();
}

function checkSerieCover() {
    let coverInput = document.getElementById("cover");
    let coverMessage = document.getElementById("messageSerieCover");
    
    if (coverInput.hasAttribute('required') && coverInput.files.length === 0) {
        coverInput.classList.add("is-invalid");
        coverMessage.classList.add("invalid-feedback");
        coverMessage.textContent = "La imagen es obligatoria";
        errorStatesSerie.cover.error = true;
    } else {
        coverInput.classList.remove("is-invalid");
        coverInput.classList.add("is-valid");
        coverMessage.classList.remove("invalid-feedback");
        coverMessage.classList.add("valid-feedback");
        coverMessage.textContent = "Imagen válida";
        errorStatesSerie.cover.error = false;
    }
}

const $id = id => document.getElementById(id);

function previewSerieCover() {
    checkSerieCover();
    const input = $id("portada");
    if (!input.files?.[0]) return;
    
    const reader = new FileReader();
    reader.onload = e => {
        $id("serieCoverPreview").src = e.target.result;
        $id("preview-container").style.display = "block";
        $id("upload-text").style.display = "none";
        $id("drop-zone-serie").style.borderStyle = "solid";
    };
    reader.readAsDataURL(input.files[0]);
    $id("imageDeletedFlag").value = "false";
}

function deleteSerieCover() {
    $id("portada").value = "";
    $id("preview-container").style.display = "none";
    $id("upload-text").style.display = "block";
    $id("drop-zone-serie").style.borderStyle = "dashed";
    $id("imageDeletedFlag").value = "true";
    checkSerieCover();
}

function setupDragAndDrop() {
    const zone = $id("drop-zone-serie");
    if (!zone) return;
    
    const evts = (types, fn) => types.forEach(t => zone.addEventListener(t, fn));
    evts(['dragenter', 'dragover', 'dragleave', 'drop'], e => (e.preventDefault(), e.stopPropagation()));
    evts(['dragenter', 'dragover'], () => zone.classList.add('dragover'));
    evts(['dragleave', 'drop'], () => zone.classList.remove('dragover'));
    
    zone.addEventListener('drop', e => {
        if (e.dataTransfer.files[0]) {
            $id("portada").files = e.dataTransfer.files;
            previewSerieCover();
        }
    });
}

async function checkSerieForm(event) {
    
    event.preventDefault();

    let modal = document.getElementById("modal");
    let modalText = document.getElementById("modal-text");
    let modalTitle = document.getElementById("modalHead-text");
    let spinner = document.getElementById("form-spinner");
   
    spinner.style.display = "block";
    modalTitle.textContent = "Errores";
    modalText.textContent = ""; 

    let id = document.getElementById("serieIdInput").value;

    await checkSerieTitle(id);
    checkSerieSynopsis();
    checkSerieGenre();
    checkSerieAge();
    checkSerieSeasons();
    checkSeriePremiere();
    checkSerieCover();

    let hasErrors = Object.values(errorStatesSerie).some(status => status.error === true);

    if (hasErrors) {
        if (errorStatesSerie.title.error) {
            modalText.innerHTML += errorStatesSerie.title.errorMessage + "<br></br>";
        }

        if (errorStatesSerie.synopsis.error) {
            modalText.innerHTML += errorStatesSerie.synopsis.errorMessage + "<br></br>";
        }

        if (errorStatesSerie.genre.error) {
            modalText.innerHTML += errorStatesSerie.genre.errorMessage + "<br></br>";
        }

        if (errorStatesSerie.cover.error) {
            modalText.innerHTML += errorStatesSerie.cover.errorMessage + "<br></br>";
        }

        if (errorStatesSerie.age.error) {
            modalText.innerHTML += errorStatesSerie.age.errorMessage + "<br></br>";
        }

        if (errorStatesSerie.seasons.error) {
            modalText.innerHTML += errorStatesSerie.seasons.errorMessage + "<br></br>";
        }

        if (errorStatesSerie.premiere.error) {
            modalText.innerHTML += errorStatesSerie.premiere.errorMessage + "<br></br>";
        }

        setTimeout(() => {
            spinner.style.display = "none";
        }, 2000)

        let errorModal = new bootstrap.Modal(modal);
        errorModal.show();
    } 
    else {
        document.getElementById("serieForm").submit();
    }
}

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

            const response = await fetch(`/checkTitleEpisode/${id}/${titleInput.value}`);

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

function checkSynopsis(inputID, messageID) {
    let synopsisInput = document.getElementById(inputID);
    let synopsisMessage = document.getElementById(messageID);
    const firstChar = synopsisInput.value[0];




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

function checkTimeEpisode(inputID, messageID) {
    let timeEpisodeInput = document.getElementById(inputID);
    let timeEpisodeMessage = document.getElementById(messageID);



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
//drag

const fileInputs = document.querySelectorAll('input[type="file"]')

fileInputs.forEach(input => {
    input.addEventListener('dragenter', (e) => {
        e.preventDefault();
        input.classList.add('highlighted');
    });

    input.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    input.addEventListener('drop', (e) => {
        e.preventDefault();
        input.classList.remove('highlighted');

        input.files = e.dataTransfer.files;

        if (input.name === 'video') {
            checkTrailer();
        }

        else {
            checkCover();
        }
    });

    input.addEventListener('dragleave', () => {
        input.classList.remove('highlighted');
    })
});

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
                    <button class="btn-action"
                                    onclick="showFormUpdateEpisode(
                                        '${id}',
                                        '${data.numEpisode}',
                                        '${data.titleEpisode}',
                                        '${data.synopsisEpisode}', 
                                        '${data.timeEpisode}'
                                    )">Editar episodio
                                </button>
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
    checkSynopsis('synopsisInput', 'messageSynopsis');
    await checkNumEpisode(id);
    checkTimeEpisode('timeEpisodeInput', 'messageTimeEpisode');
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

//update episode

//show the form in main_detalle
async function showFormUpdateEpisode(serieId, numEpisode, titleEpisode, synopsisEpisode, timeEpisode) {
    let content = document.getElementById("episode_" + numEpisode)
    content.innerHTML = `<div class="form-container">
                <form enctype="multipart/form-data" onsubmit="checkFormUpdateEpisode(event,'${serieId}',${numEpisode})" novalidate>
                    <h3>Editar Episodio</h3>

                    <div class="form-group" id="title">
                        <label for="titulo" class="form-label">Título</label>
                        <input type="text" class="form-control" name="title" placeholder="Nombre del episodio"
                            oninput="checkTitleUpdateEp('${serieId}','${numEpisode}')" id="titleInputUpdateEp" value="${titleEpisode}" required />
                        <div id="messageTitleUpdateEp"></div>
                    </div>

                    <div class="form-group" id="synopsis">
                        <label for="synopsis" class="form-label">Sinopsis</label>
                        <textarea class="form-control" name="synopsis" placeholder="Breve descripción del episodio"
                            rows="3" id="synopsisInputUpdateEp" oninput="checkSynopsis('synopsisInputUpdateEp', 'messageSynopsisUpdateEp')" required>${synopsisEpisode}</textarea>
                        <div id="messageSynopsisUpdateEp"></div>
                    </div>

                    <div class="form-group" id="numEpisode">
                        <label for="numEpisode" class="form-label">Número de episodio</label>
                        <input type="number" class="form-control" name="numEpisode" id="numEpisodeInputUpdateEp"
                            oninput="checkNumEpisodeUpdateEp('${serieId}','${numEpisode}')"value="${numEpisode}" required />
                        <div id="messageNumEpisodeUpdateEp"></div>
                    </div>

                    <div class="form-group" id="timeEpisode">
                        <label for="timeEpisode" class="form-label">Duración del episodio</label>
                        <input type="number" class="form-control" name="timeEpisode" placeholder="Ejemplo: 18 minutos"
                            oninput="checkTimeEpisode('timeEpisodeInputUpdateEp','messageTimeEpisodeUpdateEp');" value="${timeEpisode}" id="timeEpisodeInputUpdateEp" required/>
                        <div id="messageTimeEpisodeUpdateEp"></div>
                    </div>

                    <div class="form-group" id="cover">
                        <label for="cover" class="form-label">Portada</label>
                        <img id="coverPreviewUpdateEp" src="#" alt="..."
                            style="display: none; max-width: 200px; max-height: 200px;">
                        <br>
                        <input type="file" name="image" class="form-control" id="coverInputUpdateEp" oninput="previewCoverUpdateEp()"/>
                        <button class="btn-action" onclick="deleteCoverUpdateEp()" style="display: none;" type="reset"
                            id="deleteCoverButtonUpdateEp" >
                            Borrar imagen
                        </button>
                        <div id="messageCoverUpdateEp"></div>
                    </div>

                    <div class="form-group" id="trailerEpisode">
                        <label for="trailer" class="form-label">Trailer del episodio</label>
                        <video id="trailerPreviewUpdateEp" src="#" style="display: none; max-width: 200px; max-height: 200px;" controls loop></video>
                        <br>
                        <input type="file" name="trailerEpisode" class="form-control" placeholder="Selecciona el trailer del episodio" id="trailerEpisodeInputUpdateEp" onchange="previewTrailerUpdateEp()" />

                        <button class="btn-action" type="reset" onclick="deleteTrailerUpdateEp()" style="display: none;"
                            id="deleteTrailerButtonUpdateEp">
                            Borrar trailer
                        </button>
                        <div id="messageTrailerEpisodeUpdateEp"></div>
                    </div>

                        <div class="form-actions">
                        <button type="submit" class="btn-default">
                            Actualizar Episodio
                        </button>
                    </div>

                    <div class="spinner" id="spinner-loader-UpdateEpisode"></div>
                </form>
            </div>`;

    addDragUpdate();
}
//Drag image and video update
function addDragUpdate() {
const fileInputs = document.querySelectorAll('input[type="file"]')

fileInputs.forEach(input => {
    input.addEventListener('dragenter', (e) => {
        e.preventDefault();
        input.classList.add('highlighted');
    });

    input.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    input.addEventListener('drop', (e) => {
        e.preventDefault();
        input.classList.remove('highlighted');

        input.files = e.dataTransfer.files;

        if (input.name === 'video') {
            previewTrailerUpdateEp();
        }

        else {
            previewCoverUpdateEp();
        }
    });

    input.addEventListener('dragleave', () => {
        input.classList.remove('highlighted');
    })
});
}
function previewCoverUpdateEp() {
    let coverInput = document.getElementById("coverInputUpdateEp");
    let output = document.getElementById("coverPreviewUpdateEp");

    const file = coverInput.files[0];
    const reader = new FileReader();

    if (coverInput.value !== "") {
        reader.onload = function () {
            output.src = reader.result;
            output.style.display = 'block';
        }

        reader.readAsDataURL(file);
    } else {
        output.src = "";
        output.style.display = 'none';
    }
}

function previewTrailerUpdateEp() {
    let trailerInput = document.getElementById("trailerEpisodeInputUpdateEp");
    let output = document.getElementById("trailerPreviewUpdateEp");

    let file = trailerInput.files[0];
    const reader = new FileReader();

    // 💡 CORRECCIÓN: Comprobar la longitud del array 'files'
    if (trailerInput.files.length > 0) {

        reader.onload = function () {
            output.src = reader.result;
            output.style.display = 'block';
        }

        reader.readAsDataURL(file);
    }
    else {
        output.src = "";
        output.style.display = 'none';
    }
}
//VALIDATIONS FOR EDITING AN EPISODE
async function checkTitleUpdateEp(id, numEpisode) {
    let titleInput = document.getElementById("titleInputUpdateEp")
    let titleMessage = document.getElementById("messageTitleUpdateEp")

    const firstChar = titleInput.value[0]


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

        const response = await fetch(`/checkTitleUpdateEp/${id}/${titleInput.value}/${numEpisode}`);

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
}


//check numEpisode UpdateEpisode
async function checkNumEpisodeUpdateEp(id, originalNum) {

    let numEpisodeMessage = document.getElementById("messageNumEpisodeUpdateEp");
    let numEpisodeInput = document.getElementById("numEpisodeInputUpdateEp");


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

        const response = await fetch(`/checkNumberEpisodeUpdateEp/${id}/${numEpisodeInput.value}/${originalNum}`);

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



//check the Update Episode form
async function checkFormUpdateEpisode(event, id, numEpisode) {

    event.preventDefault();
    errorStates.cover.error = false;
    errorStates.trailer.error = false;
    errorStates.title.error = false;
    let modal = document.getElementById("modal");
    let modalText = document.getElementById("modal-text");
    let modalTitle = document.getElementById("modalHead-text");
    let spinner = document.getElementById("spinner-loader-UpdateEpisode");

    spinner.style.display = "block";
    modalTitle.textContent = "Error";
    modalText.textContent = "";
    await checkTitleUpdateEp(id, numEpisode);
    checkSynopsis('synopsisInputUpdateEp', 'messageSynopsisUpdateEp'); //reused function
    await checkNumEpisodeUpdateEp(id, numEpisode)
    checkTimeEpisode('timeEpisodeInputUpdateEp', 'messageTimeEpisodeUpdateEp');//reused function
    previewCoverUpdateEp();
    previewTrailerUpdateEp();

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

        setTimeout(() => {
            spinner.style.display = "none";
        }, 2000)

        let errorModal = new bootstrap.Modal(modal);
        errorModal.show();
    }

    else {
        await updateEpisode(event, id, numEpisode);
        let inputs = document.getElementsByTagName("input");
        document.getElementById("synopsisInput").value = "";

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = "";
        }
        setTimeout(() => {
            spinner.style.display = "none";
        }, 4000)
    }
}
//update_serie
async function updateEpisode(event, id, originalNum) {

    const formData = new FormData(event.target);
    const numEpisodeValue = document.getElementById("numEpisodeInputUpdateEp").value;
    const response = await fetch(`/processUpdateEpisode/${id}/${originalNum}`, {
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
        // Generamos un timestamp único en el momento de la actualización
        const timestamp = Date.now();

        const content = document.getElementById("episode_" + originalNum);

        content.innerHTML = `
        <div class="row episode-row" id="episode_${data.numEpisode}">
        <div class="col-12">
            <h3>${data.numEpisode} ${data.titleEpisode}</h3>
            <p>${data.timeEpisode} minutos</p>
            <h5>Sinopsis:</h5>
            <p class="Text_synopsis">${data.synopsisEpisode}</p>
            
            <img class="visual" src="/episode/${id}/${data.numEpisode}/image?t=${timestamp}"> 
            
            <br></br>
            
            <video class="visual" src="/episode/${id}/${data.numEpisode}/video?t=${timestamp}" controls loop></video>
            
            <div class="spinner" id="spinner-loader_${data.numEpisode}"></div>
            <div class="form-actions">
                <button class="btn-action"
                    onclick="showFormUpdateEpisode('${id}','${data.numEpisode}','${data.titleEpisode}','${data.synopsisEpisode}','${data.timeEpisode}')">Editar episodio
                </button>
                <button class="btn-action" onclick="deleteEpisode('${id}','${data.numEpisode}')">Borrar episodio</button>
            </div>
        </div>
        </div>
        `;
    }
}
//delete image update 
function deleteCoverUpdateEp() {
    let coverInput = document.getElementById("coverInputUpdateEp");
    let output = document.getElementById("coverPreviewUpdateEp");

    coverInput.value = "";
    output.src = "";
    output.style.display = 'none';
}
//delete image update
function deleteTrailer() {
    let trailerInput = document.getElementById("trailerEpisodeInputUpdateEp");
    let output = document.getElementById("trailerPreviewUpdateEp");

    trailerInput.value = "";
    output.src = "";
    output.style.display = 'none';
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


function deleteCoverUpdate() {
    let coverInput = document.getElementById("coverInput");
    let output = document.getElementById("coverPreview");

    coverInput.value = "";
    output.src = "";
    output.style.display = 'none';
    checkCover();
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

function deleteCoverSerie() {
    let coverInput = document.getElementById("inputSerieCover");
    let output = document.getElementById("coverPreview");

    coverInput.value = "";
    output.src = "";
    output.style.display = 'none';
    checkCover();
}
