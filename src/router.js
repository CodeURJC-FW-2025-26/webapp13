import express from 'express';
import multer from 'multer';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

// Index
router.get('/', async (req, res) => {

    // We retrieve the selected genre; if there is no genre, nothing is returned.
    let selectedGenres = req.query.genre;

    //We recovered the search.
    let searchTitle = req.query.title;


    //In query, we combine requests of the same type and the search.
    const query = catalog.buildQuery(selectedGenres, searchTitle);

    //We provide context to the server so that it maintains the filters when changing pages.
    const { series } = await catalog.getSeriesContext(query);

    //We provide context to the server so that it can retrieve the series we need. It also organizes the pages with six elements per page and calculates the number of pages based on the series in the database.
    const filterQueryString = `${selectedGenres ? `&genre=${selectedGenres}` : ''}` + `${searchTitle ? `&title=${searchTitle}` : ''}`;

    //In this loop, we select the color of the age label for each series and the number of the first available episode.
    series.forEach(serie => {
        serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    });

    //We obtain all genres.
    let allGenres = await catalog.getGenres();

    //We assign each genre a selected value if it is selected and the name to appear on the buttons.
    let genreSelected = allGenres.map(genre => ({
        name: genre,
        selected: selectedGenres === genre
    }));

    //NotSelected returns True if no genre is selected and False if there is one selected, so that the “Todos” button is not selected.
    let notSelected = !selectedGenres;

    res.render('index', {
        series, genres: genreSelected, searchTitle, notSelected
    });
});


router.get('/moreSeries', async (req, res) => {


    let from = parseInt(req.query.from);

    // We retrieve the selected genre; if there is no genre, nothing is returned.
    let selectedGenres = req.query.genre;

    //We recovered the search.
    let searchTitle = req.query.title;


    //In query, we combine requests of the same type and the search.
    const query = catalog.buildQuery(selectedGenres, searchTitle);

    //We provide context to the server so that it maintains the filters when changing pages.
    const { series } = await catalog.getSeriesContext(query, from);

    series.forEach(serie => {
        serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    });


    res.render("moreSeries", { series });

});

// End index

router.get('/main_detalle/:id', async (req, res) => {

    let serie = await catalog.getSerie(req.params.id);
    let listEpisode = await catalog.getEpisodes(req.params.id);
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    res.render('main_detalle_notfilm', { serie, listEpisode });

});
router.get('/serie/new', async (req, res) => {

    // Lista de géneros
    const genres = [
        { value: "Acción", label: "Acción" },
        { value: "Anime", label: "Anime" },
        { value: "Policial", label: "Policial" },
        { value: "Comedia", label: "Comedia" },
        { value: "Drama", label: "Drama" },
        { value: "Thriller", label: "Thriller" },
        { value: "Terror", label: "Terror" },
        { value: "Ciencia ficción", label: "Ciencia Ficción" },
        { value: "Documental", label: "Documental" }
    ];

    // Generar opciones del select
    let genreOptions = '<option value="">Selecciona un género</option>';

    genres.forEach(genre => {
        genreOptions += `
            <option value="${genre.value}">
                ${genre.label}
            </option>`;
    });

    res.render('main_nuevo-elem', {
        genreOptions
    });
});
router.get('/serie_action/:id/', async (req, res) => {
    const id = req.params.id;

    //genres
    const genres = [
        { value: "Acción", label: "Acción" },
        { value: "Anime", label: "Anime" },
        { value: "Policial", label: "Policial" },
        { value: "Comedia", label: "Comedia" },
        { value: "Drama", label: "Drama" },
        { value: "Thriller", label: "Thriller" },
        { value: "Terror", label: "Terror" },
        { value: "Ciencia ficción", label: "Ciencia Ficción" },
        { value: "Documental", label: "Documental" }
    ];

    let genreOptions = '<option value="">Selecciona un género</option>';
    const serie = await catalog.getSerie(id);

    //loop through the array
    genres.forEach(genre => {
        //if serie.genre = genre.value (true) then const selected = 'selected') / (false) then const selected = ''
        const selected = serie.genre === genre.value ? 'selected' : '';
        //genreOptions is the lines of the html
        genreOptions += `<option value="${genre.value}" ${selected}>${genre.label}</option>`
    }); //+= means ‘concatenate and assign’

    res.render('update_serie', {
        serie: serie,
        genreOptions: genreOptions, //send the lines of html
    });
});


router.get('/serie/:id/image', async (req, res) => {

    let serie = await catalog.getSerie(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + serie.imageFilename);

});

//main_detalle_notfilm

//set the image of the episode
router.get('/episode/:id/:numEpisode/image', async (req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode);

    res.download(catalog.UPLOADS_FOLDER + '/' + episode.imageFilenamedetalle);
});
//set the video of the episode
router.get('/episode/:id/:numEpisode/video', async (req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode);

    res.download(catalog.UPLOADS_FOLDER + '/' + episode.trailerEpisode);
});

//delete serie
router.get('/deleteSerie/:id', async (req, res) => {
    const idSerie = req.params.id;
    const result = await catalog.getSerie(idSerie);
    if (result) {
        await catalog.deleteSerie(idSerie);
        res.json({ error: false })

    }
    else {
        res.status(404).json({ title: "Error", message: "Ha ocurrido un error. El objeto no existe." })
    }
});

//delete episode
router.get('/deleteEpisode/:id/:numEpisode', async (req, res) => {
    const numEpisode = req.params.numEpisode;
    const idSerie = req.params.id;
    const serie = await catalog.getSerie(idSerie);
    const result = await catalog.getEpisode(serie, numEpisode);
    if (result) {
        await catalog.deleteEpisode(idSerie, numEpisode);
        res.json({ error: false })

    }
    else {
        res.status(404).json({ title: "Error", message: "Ha ocurrido un error. El objeto no existe." })
    }
});

//check title Update Episode
router.get('/checkTitleUpdateEp/:id/:title/:originalNum', async (req, res) => {
    const { id, title, originalNum } = req.params;

    const allEpisodes = await catalog.getEpisodes(id);

    const duplicate = allEpisodes.find(ep => ep.titleEpisode === title && ep.numEpisode !== parseInt(originalNum));

    if (duplicate) {
        res.status(409).json({ error: "El título del episodio ya existe en otro episodio" });
    } else {
        res.json({ error: "Título disponible." });
    }
});
router.get('/checkNumberEpisodeUpdateEp/:id/:numEpisode/:originalNum', async (req, res) => {
    const { id, numEpisode, originalNum } = req.params;
    if (await catalog.checkDuplicatedNumEpisodeUpdate(id, parseInt(numEpisode), parseInt(originalNum))) {
        res.status(409).json({ error: "El número de episodio coincide con otro episodio." });
    } else {
        res.json({ error: "Número de episodio disponible." });
    }
});

//updateEpisode
router.post('/processUpdateEpisode/:id/:originalNum', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {
    const { title, synopsis, timeEpisode, numEpisode } = req.body;
    const { id, originalNum } = req.params;
    const deleteCover = req.query.deleteCover; //String "true" or "false"

    let errorMessage = "";

    if (await catalog.checkDuplicatedTitleEpisodeUpdate(id, title, originalNum)) {
        errorMessage = "El título está duplicado.";
    }

    if (await catalog.checkDuplicatedNumEpisodeUpdate(id, numEpisode, originalNum)) {
        errorMessage += (errorMessage ? "<br>" : "") + "El número de episodio está duplicado.";
    }

    if (errorMessage) {
        return res.status(409).json({ error: true, message: errorMessage });
    }

    else {
        let finalImage = await catalog.getEpisodeImage(id, originalNum);

        //Checks if a new image file was uploaded
        if (req.files['image'] && req.files['image'][0]) {
            //"NEW image: replaces the old one"
            finalImage = req.files['image'][0].filename;
        }
        else if (deleteCover === "true") {
            //delete: Defect Image
            finalImage = "ImageDefect.jpg";
        }


        let updatedEpisode = {
            titleEpisode: title,
            synopsisEpisode: synopsis,
            numEpisode: parseInt(numEpisode),
            timeEpisode: parseInt(timeEpisode),
            imageFilenamedetalle: finalImage,
            trailerEpisode: (req.files['trailerEpisode'] && req.files['trailerEpisode'][0])
                ? req.files['trailerEpisode'][0].filename
                : await catalog.getEpisodeTrailer(id, originalNum)
        };

        await catalog.updateEpisode(id, originalNum, updatedEpisode);
        res.json(updatedEpisode);
    }
});

router.get('/checkSerieTitle/:title', async (req, res) => {
    const { title } = req.params;
    const { id } = req.query;

    const allSeries = await catalog.getSeries();

    const duplicate = allSeries.find(s =>
        s.title.toLowerCase() === title.toLowerCase() &&
        String(s._id) !== String(id)
    );

    if (duplicate) {
        return res.status(400).json({ error: "El título de la serie ya existe" });
    }

    return res.status(200).json({ message: "Título disponible" });
});

//new episode
router.post('/processNewEpisode/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {
    const { title, synopsis, timeEpisode, numEpisode } = req.body;
    const id = req.params.id;
    let epNum = parseInt(numEpisode);
    let epTime = parseInt(timeEpisode);
    let errorMesagge;

    if (await catalog.checkDuplicatedTitleEpisode(id, title)) {
        errorMesagge = "El título está duplicado.";
        if (await catalog.checkDuplicatedNumEpisode(id, epNum))
            errorMesagge += "<br>El número de episodio está duplicado.";
        return res.status(409).json({ error: true, message: errorMesagge });
    }

    if (!errorMesagge) {
        // 1. Lógica para la Imagen (con valor por defecto)
        let imageName = "ImageDefect.jpg";
        if (req.files && req.files['image'] && req.files['image'][0]) {
            imageName = req.files['image'][0].filename;
        }

        let newEpisode = {
            numEpisode: epNum,
            titleEpisode: title,
            synopsisEpisode: synopsis,
            timeEpisode: epTime,
            imageFilenamedetalle: imageName,
            trailerEpisode: req.files['trailerEpisode'][0].filename
        };

        await catalog.addEpisode(id, newEpisode);
        res.json(newEpisode);
    }
});

//Check title
router.get('/checkTitleEpisode/:id/:title', async (req, res) => {

    const id = req.params.id;

    const title = req.params.title;

    // 409 means Conflic
    if (await catalog.checkDuplicatedTitleEpisode(id, title))
        res.status(409).json({ error: "El título del episodio ya existe para esta serie." });
    else
        res.json({ error: "Título disponible." })
})

//Check numEpisode
router.get('/checkNumberEpisode/:id/:numEpisode', async (req, res) => {
    const id = req.params.id;
    const num = req.params.numEpisode;

    if (await catalog.checkDuplicatedNumEpisode(id, parseInt(num))) {
        res.status(409).json({ error: "El número de episodio coincide con otro episodio." })
    }
    else
        res.json({ error: "Número de episodio disponible." })

})

//update episode
router.post('/form_update_episode/:id/:numEpisode', upload.fields([{ name: 'imageFilenamedetalle', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {
    //select params
    const id = req.params.id;
    const { titleEpisode, synopsisEpisode, timeEpisode, numEpisode } = req.body;
    const epTime = parseInt(timeEpisode);
    const newNumEpisode = parseInt(numEpisode);
    const originalNumEpisode = parseInt(req.params.numEpisode);

    const serie = await catalog.getSerie(id);
    const episode = await catalog.getEpisode(serie, originalNumEpisode);

    //not null
    if (!titleEpisode || !synopsisEpisode || isNaN(epTime)) {
        return res.render('error', { message: 'Todos los campos son obligatorios.', boolean_episode2: true, serie, episode });
    }
    // Check if the first character is uppercase
    const firstChar = req.body.titleEpisode.charAt(0);
    if (firstChar !== firstChar.toUpperCase()) {
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.', boolean_episode2: true, serie, episode });
    }

    const allEpisodes = await catalog.getEpisodes(id);
    //not duplicated title
    let duplicate = allEpisodes.find(ep => ep.titleEpisode === titleEpisode && ep.numEpisode !== originalNumEpisode);
    if (duplicate) {
        return res.render('error', { message: 'Título del episodio duplicado.', boolean_episode2: true, serie, episode });
    }

    //not duplicated number
    duplicate = allEpisodes.find(ep => ep.numEpisode === newNumEpisode && ep.numEpisode !== originalNumEpisode);
    if (duplicate) {
        return res.render('error', { message: 'Ese número de episodio ya existe.', boolean_episode2: true, serie, episode });
    }

    //synopsis length
    const characterSynopsis = synopsisEpisode.trim(); //delete spaces between words

    if (characterSynopsis.length > 800) {
        return res.render('error', { message: `La sinopsis no puede exceder los 800 caracteres (actual: ${characterSynopsis.length}).`, boolean_episode2: true, serie, episode });
    }

    //select photo, video and original epsiode(to select the image and video)    
    //if req.file don't exist then imageFile = false. 
    //If req.files exists BUT imageFilenamedetalle does NOT exist → imageFile = undefined
    //If req.files exists AND imageFilenamedetalle exists → imageFile = new image
    const imageFile = req.files?.imageFilenamedetalle?.[0]; //.? = avoid mistakes if req.files or imageFilenamedetalle don't exist
    const trailerFile = req.files?.trailerEpisode?.[0]; //.? = avoid mistakes if req.files or trailerEpisode don't exist
    //get values of episode original(to use in the )
    const originalEp = serie.episodes.find(ep => ep.numEpisode === originalNumEpisode);

    //new_episode
    const update_ep = {
        titleEpisode,
        synopsisEpisode,
        numEpisode: newNumEpisode,
        timeEpisode: epTime,
        //If imageFile exists (uploaded new image) → use imageFile.filename (new image)
        //If imageFile does NOT exist (no image uploaded) → use originalEp.imageFilenamedetalle (original image)
        imageFilenamedetalle: imageFile ? imageFile.filename : originalEp.imageFilenamedetalle,
        trailerEpisode: trailerFile ? trailerFile.filename : originalEp.trailerEpisode // ? is like a "if" (¿imageFile exist?)
    };
    await catalog.updateEpisode(id, originalNumEpisode, update_ep);

    res.render('saved_serie', {
        message: 'Se ha actualizado el episodio correctamente',
        boolean: true,
        serie,
        episode: update_ep,
        originalNumEpisode: originalNumEpisode
    });
})

router.post('/serie/new', upload.single('image'), async (req, res) => {

    const seasons = parseInt(req.body.seasons);
    const ageClasification = parseInt(req.body.ageClasification);
    const premiere = parseInt(req.body.premiere);
    const currentYear = new Date().getFullYear();
    const allSeries = await catalog.getSeries();
    const duplicate = allSeries.find(s => s.title === req.body.title);

    //required fields
    const requiredFields = ['title', 'seasons', 'ageClasification', 'premiere', 'genre', 'synopsis'];

    for (const field of requiredFields) {
        if (!req.body[field]) {

            res.status(409).json({ error: `Todos los campos son obligatorios` });
        }
    }
    //synopsis length
    const characterSynopsis = req.body.synopsis.trim(); //delete spaces between words

    if (characterSynopsis.length > 800) {
        res.status(409).json({ error: `La sinopsis no puede exceder los 800 caracteres (actual: ${characterSynopsis.length}).` });
    }

    // Check if the first character is uppercase
    const firstChar = req.body.title.charAt(0);

    if (firstChar !== firstChar.toUpperCase()) {
        res.status(409).json({ error: 'El título debe comenzar con una letra mayúscula.' });
    }
    //duplicated title
    if (duplicate) {
        res.status(409).json({ error: 'Ya hay un título igual en el catálogo' });
    }
    //validations

    if (isNaN(seasons) || seasons < 1 || seasons > 20) {
        res.status(409).json({ error: 'El número de temporadas debe estar entre 1 y 20.' });
    }

    if (isNaN(ageClasification) || ageClasification < 0 || ageClasification > 18) {
        res.status(409).json({ error: 'La clasificación de edad debe ser un estar entre 0 y 18.' });
    }

    if (isNaN(premiere) || premiere < 1900 || premiere > currentYear + 1) {
        res.status(409).json({ error: `El año de estreno debe estar entre 1900 y 2026.` });
    }

    //get image
    let imageFilename = null;

    if (req.file) {
        imageFilename = req.file.filename;
    }

    const episodios = [];

    let serie = {
        title: req.body.title,
        premiere: premiere,
        ageClassification: ageClasification,
        seasons: seasons,
        genre: req.body.genre,
        synopsis: req.body.synopsis,
        imageFilename: imageFilename,
        episodes: episodios,
    };

    const result = await catalog.addSerie(serie);
    res.json({
        id: result.insertedId
    })
});
//update serie
router.get('/checkTitleSerieUpdate/:id/:title', async (req, res) => {
    const id = req.params.id;

    const title = req.params.title;

    const serie = await catalog.getSerie(id);

    // 409 means Conflic
    if (await catalog.checkDuplicatedTitleSerieUpdate(id, title))
        res.status(409).json({ error: "La serie ya existe." });
    else
        res.json({ error: "Título disponible." })
});


router.post('/processUpdateSerie/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;

    const { title, synopsis, genre, ageClassification, seasons, premiere } = req.body;

    const serie = await catalog.getSerie(id);

    if (await catalog.checkDuplicatedTitleSerieUpdate(id, title))
        res.status(409).json({ error: true, message: "La serie ya existe" });
    else {
        let image = req.file ? req.file.filename : serie.imageFilename;

        let updatedSerie = {
            title: title,
            synopsis: synopsis,
            genre: genre,
            ageClassification: parseInt(ageClassification),
            seasons: parseInt(seasons),
            premiere: parseInt(premiere),
            imageFilename: image,
            episodes: await catalog.getEpisodes(id),
        }
        await catalog.updateSerie(id, updatedSerie);
        res.json(updatedSerie);
    }

})