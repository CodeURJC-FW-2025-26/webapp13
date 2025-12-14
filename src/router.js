import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';
import { title } from 'node:process';

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

router.get('/serie_action/:id/:mode', async (req, res) => {
    const id = req.params.id;
    const mode = req.params.mode;
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

    if (mode === "true") {
        //
        let genreOptions = '<option value="">Selecciona un género</option>';
        const serie = await catalog.getSerie(id);

        //loop through the array
        genres.forEach(genre => {
            //if serie.genre = genre.value (true) then const selected = 'selected') / (false) then const selected = ''
            const selected = serie.genre === genre.value ? 'selected' : '';
            //genreOptions is the lines of the html
            genreOptions += `<option value="${genre.value}" ${selected}>${genre.label}</option>`
        }); //+= means ‘concatenate and assign’

        return res.render('main_nuevo-elem', {
            serie: serie,
            addmode: false,
            updatemode: true, //update true
            genreOptions: genreOptions, //sent the lines of html
        });
    }

    let genreOptions = '<option value="">Selecciona un género</option>';
    genres.forEach(genre => {
        //if serie.genre = genre.value (true) then const selected = 'selected') / (false) then const selected = ''
        genreOptions += `<option value="${genre.value}">${genre.label}</option>`; //+= means ‘concatenate and assign’
    });

    return res.render('main_nuevo-elem', {
        serie: null,
        addmode: true,
        updatemode: false,
        genreOptions: genreOptions //sent the lines of html
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
        res.status(409).json({error: "El número de episodio coincide con otro episodio."});
    } else {
        res.json({error: "Número de episodio disponible."});
    }
});

//updateEpisode
router.post('/processUpdateEpisode/:id/:originalNum', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {

    const { title, synopsis, timeEpisode, numEpisode } = req.body;
    const { id, originalNum } = req.params;
    const epNum = parseInt(numEpisode);
    const epTime = parseInt(timeEpisode);
    
    const serie = await catalog.getSerie(id);

    let errorMessage = "";

    if (await catalog.checkDuplicatedTitleEpisodeUpdate(id, title, epNum)) {
        errorMessage = "El título está duplicado.";
    }

    if (await catalog.checkDuplicatedNumEpisodeUpdate(id, epNum, originalNum)) {
        errorMessage += (errorMessage ? "<br>" : "") + "El número de episodio está duplicado.";
    }
    console.log(errorMessage)
    if (errorMessage) {
        return res.status(409).json({ error: true, message: errorMessage });
    } else if (!errorMessage) {
        
        const episodeIndex = serie.episodes.findIndex(ep => ep.numEpisode === parseInt(originalNum));
    
        let updatedEpisode = {
        titleEpisode: title,
        synopsisEpisode: synopsis,
        timeEpisode: epTime,
        imageFilenamedetalle: serie.episodes[episodeIndex].imageFilenamedetalle,
        trailerEpisode: serie.episodes[episodeIndex].trailerEpisode 
    };
    // If a new image or trailer is uploaded, update them
    if (req.files['image'] && req.files['image'][0]) {
        updatedEpisode.imageFilenamedetalle = req.files['image'][0].filename;
    }

    if (req.files['trailerEpisode'] && req.files['trailerEpisode'][0]) {
        updatedEpisode.trailerEpisode = req.files['trailerEpisode'][0].filename;
    }
    await catalog.updateEpisode(id, numEpisode, updatedEpisode);   
    res.json(updatedEpisode)
    }

});


//new episode
router.post('/processNewEpisode/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {
    const { title, synopsis, timeEpisode, numEpisode } = req.body;
    const id = req.params.id;
    const serie = await catalog.getSerie(id);
    let epNum = parseInt(numEpisode);
    let epTime = parseInt(timeEpisode);

    let errorMesagge = "";

        if (await catalog.checkDuplicatedTitleEpisode(id, title)) {
            errorMesagge = "El título está duplicado.";
        }

        if (await catalog.checkDuplicatedNumEpisode(id, epNum)) {
            errorMesagge += (errorMesagge ? "<br>" : "") + "El número de episodio está duplicado.";
        }

        if (errorMesagge) {
            return res.status(409).json({ error: true, message: errorMesagge });
        } else if (!errorMesagge) {

        let newEpisode = {
            numEpisode: epNum,
            titleEpisode: title,
            synopsisEpisode: synopsis,
            timeEpisode: epTime,
            imageFilenamedetalle: req.files['image'][0].filename,
            trailerEpisode: req.files['trailerEpisode'][0].filename
        };

        await catalog.addEpisode(id, newEpisode);

        res.json(newEpisode)
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


//update serie
router.post('/update_serie/:id', upload.single('image'), async (req, res) => {
    //select params
    const id = req.params.id;
    let serie = await catalog.getSerie(id);
    const { title, genre, synopsis, ageClasification, seasons, premiere } = req.body;
    const age = parseInt(ageClasification);
    const numSeasons = parseInt(seasons);
    const year = parseInt(premiere);

    //not null
    if (!title || !genre || !synopsis || isNaN(age) || isNaN(numSeasons) || isNaN(year)) {
        return res.render('error', { message: 'Todos los campos del formulario son obligatorios .', boolean_serie1: true, serie });
    }

    const allSeries = await catalog.getSeries();
    //duplicated title
    const duplicate = allSeries.find(s => s.title === title && String(s._id) !== String(id));
    if (duplicate) {
        return res.render('error', { message: 'Titulo duplicado.', boolean_serie1: true, serie });
    }

    // Check if the first character is uppercase
    const firstChar = req.body.title.charAt(0);

    if (firstChar !== firstChar.toUpperCase()) {
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.', boolean_serie1: true, serie });
    }
    //synopsis length
    const characterSynopsis = synopsis.trim(); //delete spaces between words

    if (characterSynopsis.length > 800) {
        return res.render('error', { message: `La sinopsis no puede exceder los 600 caracteres (actual: ${characterSynopsis.length}).`, boolean_serie1: true, serie });
    }
    //get the image of the serie
    const current_serie = await catalog.getSerie(id);
    const existingImage = current_serie.imageFilename;

    //get the new image
    let imageFilename;
    //if upload image then new image
    if (req.file) {
        imageFilename = req.file.filename;  //new image
    } else {
        imageFilename = existingImage; //old image remains
    }

    //update serie
    const update_serie = {
        title,
        genre,
        synopsis,
        ageClassification: age,
        seasons: numSeasons,
        premiere: year,
        imageFilename,
        episodes: current_serie.episodes,
    };
    //function updateSerie
    await catalog.updateSerie(id, update_serie);
    res.render('saved_serie', { message: 'Se ha actualizado la serie correctamente', boolean_serie1: true, serie });
});



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

            return res.render('error', { message: `Todos los campos son obligatorios`, boolean_serie2: true });
        }
    }
    //synopsis length
    const characterSynopsis = req.body.synopsis.trim(); //delete spaces between words

    if (characterSynopsis.length > 800) {
        return res.render('error', { message: `La sinopsis no puede exceder los 800 caracteres (actual: ${characterSynopsis.length}).`, boolean_serie2: true });
    }

    // Check if the first character is uppercase
    const firstChar = req.body.title.charAt(0);

    if (firstChar !== firstChar.toUpperCase()) {
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.', boolean_serie2: true });
    }
    //duplicated title
    if (duplicate) {
        return res.render('error', { message: 'Ya hay un título igual en el catálogo', boolean_serie2: true });
    }
    //validations

    if (isNaN(seasons) || seasons < 1 || seasons > 20) {
        return res.render('error', { message: 'El número de temporadas debe estar entre 1 y 20.', boolean_serie2: true });
    }

    if (isNaN(ageClasification) || ageClasification < 0 || ageClasification > 18) {
        return res.render('error', { message: 'La clasificación de edad debe ser un estar entre 0 y 18.', boolean_serie2: true });
    }

    if (isNaN(premiere) || premiere < 1900 || premiere > currentYear + 1) {
        return res.render('error', { message: `El año de estreno debe estar entre 1900 y 2026.`, boolean_serie2: true });
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
    res.render('saved_serie', {
        boolean_serie1: true,
        serie: {
            _id: result.insertedId,
            serie
        }
    })
});
