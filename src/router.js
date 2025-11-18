import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

// Index
router.get('/', async (req, res) => {
    let selectedGenres = req.query.genre;

    let searchTitle = req.query.title;


    let currentPage = parseInt(req.query.page) || 1;

    const query = catalog.buildQuery(selectedGenres,searchTitle);
    const {series, totalItems, totalPages} = await catalog.getSeriesContext(query,currentPage);

    const filterQueryString = `${selectedGenres ? `&genre=${selectedGenres}` : ''}` + `${searchTitle ? `&title=${searchTitle}` : ''}`;

    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    let prevPage = currentPage -1;

    let nextPage = currentPage +1;

    let previousLink = hasPrevious ? `/?page=${prevPage}${filterQueryString}`: '#';
    let nextLink = hasNext ? `/?page=${nextPage}${filterQueryString}`: '#';

    const pages = Array.from({length: totalPages}, (_,i) => ({
        num: i +1,
        current: (i+1) === currentPage,
        link: `/?page=${i+1}${filterQueryString}`
    }));


    series.forEach(serie => {
        serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    });


    let allGenres = await catalog.getGenres();

    res.render('index', { series, genres: allGenres, searchTitle, 
        hasNext, hasPrevious, currentPage, totalItems,previousLink, nextLink,pages});
});


// End index
//
router.get('/main_detalle/:id/:numEpisode', async (req,res) =>{
    
    let serie = await catalog.getSerie(req.params.id);
    
    let episode = await catalog.getEpisode(serie,req.params.numEpisode);

    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);

    res.render('main_detalle_notfilm', {serie, episode});

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

        if (mode === "true"){  
            //
            let genreOptions = '<option value="">Selecciona un género</option>';
            const serie = await catalog.getSerie(id); 
            
            //loop through the array
            genres.forEach(genre => {
            //if serie.genre = genre.value (true) then const selected = 'selected') / (false) then const selected = ''
            const selected = serie.genre === genre.value ? 'selected' : '';
            //genreOptions is the lines of the html
            genreOptions += `<option value="${genre.value}" ${selected}>${genre.label}</option>`}); //+= means ‘concatenate and assign’
                    
            return res.render('main_nuevo-elem', {
                serie: serie,
                addmode: false,
                updatemode: true,
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
router.get('/borrarserie/:id', async(req,res) => {
    let serie = await catalog.getSerie(req.params.id);
    await catalog.deleteSerie(req.params.id)
    res.render('saved_serie', { message: 'Se ha borrado la serie correctamente', boolean_serie2: true,});  
});

//delete episode
router.get('/borrarepisode/:id/:numEpisode', async(req,res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode); 
    let nextepisode = await catalog.getNextEpisode(serie, req.params.numEpisode);
    await catalog.deleteEpisode(req.params.id, req.params.numEpisode)
    res.render('saved_serie',{ message: 'Se ha borrado el episodio correctamente', boolean_episode0: true, serie, episode: nextepisode});
});

//get next episode
router.get('/next/:id/:numEpisode', async(req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getNextEpisode(serie, req.params.numEpisode);
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    res.render('main_detalle_notfilm', {serie,episode})
})
//get previus episode
router.get('/previus/:id/:numEpisode', async(req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getPreviusEpisode(serie, req.params.numEpisode);
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    res.render('main_detalle_notfilm', {serie,episode})
})
//update the episode. Call the html
router.get('/update_episode/:id/:numEpisode', async (req, res) => {
    const id = req.params.id;
    const serie = await catalog.getSerie(id);
    const numEpisode = parseInt(req.params.numEpisode);

    //if numEpisode > 0 then update episode
    if (numEpisode > 0){
        const episode = await catalog.getEpisode(serie, numEpisode);
        return res.render('update_episode', {
            serie: serie,
            episode: episode,
            updatemode: true, //update
            addmode: false, //add
        }); 
    }
    //if not then create episode
    return res.render('update_episode', {
        serie: serie,
        updatemode: false, //update
        addmode: true, //add
    });
});

//new episode
router.post('/add_episode/:id', upload.fields([{ name: 'imageFilenamedetalle', maxCount: 1 },{ name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {
    //select params
    const id = req.params.id;
    const serie = await catalog.getSerie(id);
    const {numEpisode, titleEpisode, synopsisEpisode, timeEpisode} = req.body;
    const epNum = parseInt(numEpisode);
    const epTime = parseInt(timeEpisode);

    //not null
    if (!titleEpisode || !synopsisEpisode || isNaN(epNum) || isNaN(epTime)) {
        return res.render('error', { message: 'Todos los campos del episodio son obligatorios.' , boolean_episode1: true,serie});
    }

    //not duplicated
    let duplicateEp = serie.episodes.find(ep => ep.numEpisode === epNum);
    if (duplicateEp) {
        return res.render('error', { message: 'Ese titulo de episodio ya existe.', boolean_episode1: true,serie});
    }
        // Check if the first character is uppercase
    const firstChar = req.body.titleEpisode.charAt(0);
    if (firstChar !== firstChar.toUpperCase()) { 
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.',boolean_episode1: true ,serie});
    }
    // Error if not image and video in the form 
    if (!req.files['imageFilenamedetalle'] || !req.files['trailerEpisode']) {
        return res.render('error', { message: 'La imagen y el trailer del episodio son obligatorios',boolean_episode1: true,serie });
    }

    //new episode
    const new_Episode = {
        numEpisode: epNum,
        titleEpisode,
        synopsisEpisode,
        timeEpisode: epTime,
        imageFilenamedetalle: req.files['imageFilenamedetalle'][0].filename,
        trailerEpisode: req.files['trailerEpisode'][0].filename
    };
    //function add episode
    await catalog.addEpisode(id, new_Episode)
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);

res.render('saved_serie',{message: 'Se ha creado el episodio correctamente correctamente', boolean_episode1: true,serie,episode: new_Episode});
});

//update serie
router.post('/update_serie/:id', upload.single('image'), async (req, res) => {
    //select params
    const id = req.params.id;
    let serie = await catalog.getSerie(id);
    const { title, genre, synopsis, ageClasification, seasons, premiere} = req.body;
    const age = parseInt(ageClasification);
    const numSeasons = parseInt(seasons);
    const year = parseInt(premiere);

    //not null
    if (!title || !genre || !synopsis || isNaN(age) || isNaN(numSeasons) || isNaN(year)) {
        return res.render( 'error', { message: 'Todos los campos del formulario son obligatorios .' , boolean_serie1: true, serie});
    }

    const allSeries = await catalog.getSeries();
    //duplicated title
    const duplicate = allSeries.find(s => s.title === title && String(s._id) !== String(id));
    if (duplicate) {
        return res.render( 'error', { message: 'Titulo duplicado.', boolean_serie1: true, serie});
    }

    // Check if the first character is uppercase
    const firstChar = req.body.title.charAt(0);

    if (firstChar !== firstChar.toUpperCase()) { 
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.',boolean_serie1: true, serie});
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
    res.render('saved_serie',{ message: 'Se ha actualizado la serie correctamente',boolean_serie1: true, serie});
});

    //update episode
router.post('/form_update_episode/:id/:numEpisode',upload.fields([{ name: 'imageFilenamedetalle', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 } ]),async (req, res) => {
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
        return res.render('error', { message: 'Todos los campos son obligatorios.' , boolean_episode2: true,serie, episode});
    }
        // Check if the first character is uppercase
    const firstChar = req.body.titleEpisode.charAt(0);
    if (firstChar !== firstChar.toUpperCase()) { 
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.', boolean_episode2: true,serie,episode });
    }

    const allEpisodes = await catalog.getEpisodes(id);
    //not duplicated title
    let duplicate = allEpisodes.find(ep => ep.titleEpisode === titleEpisode && ep.numEpisode !== originalNumEpisode);
    if (duplicate) {
        return res.render('error', { message: 'Título del episodio duplicado.' ,boolean_episode2: true, serie, episode});
    }

    //not duplicated number
    duplicate = allEpisodes.find(ep => ep.numEpisode === newNumEpisode && ep.numEpisode !== originalNumEpisode);
    if (duplicate) {
        return res.render('error', { message: 'Ese número de episodio ya existe.' ,boolean_episode2: true, serie, episode});
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
    
    res.render('saved_serie',{
        message: 'Se ha actualizado el episodio correctamente', 
        boolean_episode2: true, 
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
        
            return res.render('error', { message: `Todos los campos son obligatorios`,boolean_serie2: true });
        }
    } 
    //synopsis length
    const characterSynopsis = req.body.synopsis.trim(); //delete spaces between words

    if (characterSynopsis.length > 300) {
        return res.render('error', { message: `La sinopsis no puede exceder los 300 caracteres (actual: ${characterSynopsis.length}).`,boolean_serie2: true });
    }

    // Check if the first character is uppercase
    const firstChar = req.body.title.charAt(0);

    if (firstChar !== firstChar.toUpperCase()) { 
        return res.render('error', { message: 'El título debe comenzar con una letra mayúscula.',boolean_serie2: true });
    }
    //duplicated title
    if (duplicate) {
        return res.render( 'error', { message: 'Ya hay un título igual en el catálogo',boolean_serie2: true });
    }
    //validations
    
    if (isNaN(seasons) || seasons < 1 || seasons > 20) {
        return res.render('error', { message: 'El número de temporadas debe estar entre 1 y 20.', boolean_serie2: true});
    }

    if (isNaN(ageClasification) || ageClasification < 0 || ageClasification > 18) {
        return res.render('error', { message: 'La clasificación de edad debe ser un estar entre 0 y 18.', boolean_serie2: true});
    }
    
    if (isNaN(premiere) || premiere < 1900 || premiere > currentYear + 1) {
        return res.render('error', { message: `El año de estreno debe estar entre 1900 y 2026.`, boolean_serie2: true});
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
})});
