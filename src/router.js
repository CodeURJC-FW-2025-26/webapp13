import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })


router.get('/', async (req, res) => {
let series = await catalog.getSeries();

series.forEach(serie => {
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
});

res.render('index', { series });

});

router.get('/main_detalle/:id/:numEpisode', async (req,res) =>{
    
    let serie = await catalog.getSerie(req.params.id);
    
    let episode = await catalog.getEpisode(serie,req.params.numEpisode);

    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);

    res.render('main_detalle_notfilm', {serie, episode});

});

router.get('/new_elem',(req,res)=>{
    res.render('main_nuevo-elem');

});

router.get('/serie/:id/image', async (req, res) => {

    let serie = await catalog.getSerie(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + serie.imageFilename);

});

//main_detalle_notfilm
router.get('/episode/:id/:numEpisode/image', async (req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode); 
    
    res.download(catalog.UPLOADS_FOLDER + '/' + episode.imageFilenamedetalle);
});

router.get('/episode/:id/:numEpisode/video', async (req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode); 
    
    res.download(catalog.UPLOADS_FOLDER + '/' + episode.trailerEpisode);
});

router.get('/borrarserie/:id', async(req,res) => {
    let serie = await catalog.getSerie(req.params.id);
    await catalog.deleteSerie(req.params.id)
    res.render('saved_serie');  //Change html
});

router.get('/borrarepisode/:id/:numEpisode', async(req,res) => {
    console.log("Se ha ejecutado")
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode); 
    await catalog.deleteEpisode(req.params.id, req.params.numEpisode)
    res.render('saved_serie');
});

router.get('/next/:id/:numEpisode', async(req, res) => {
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getNextEpisode(serie, req.params.numEpisode);
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    res.render('main_detalle_notfilm', {serie,episode})
})

router.get('/previus/:id/:numEpisode' , async(req,res) =>{
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getPreviusEpisode(serie, req.params.numEpisode);
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);
    res.render('main_detalle_notfilm', {serie, episode})
});

router.get('/serie_update/:id', async (req,res)=>{
    let serie = await catalog.getSerie(req.params.id);
    res.render('update_serie', {serie});
});

//new episode
router.post('/add_episode/:id', upload.fields([{ name: 'imageFilenamedetalle', maxCount: 1 },{ name: 'trailerEpisode', maxCount: 1 }]), async (req, res) => {
    const id = req.params.id;
    const {numEpisode, titleEpisode, synopsisEpisode, timeEpisode} = req.body;

    const epNum = parseInt(numEpisode);
    const epTime = parseInt(timeEpisode);

    //not null
    if (!titleEpisode || !synopsisEpisode || isNaN(epNum) || isNaN(epTime)) {
        return res.render('error', { message: 'Todos los campos del episodio son obligatorios.' });
    }
    //not duplicated
    const serie = await catalog.getSerie(id);
    let duplicateEp = serie.episodes.find(ep => ep.numEpisode === epNum);
    if (duplicateEp) {
        return res.render('error', { message: 'Ese número de episodio ya existe.' });
    }
    duplicateEp = serie.episodes.find(ep => ep.titleEpisode === titleEpisode);
    if (duplicateEp) {
        return res.render('error', { message: 'Ese titulo de episodio ya existe.' });
    }
    
    if (!req.files['imageFilenamedetalle'] || !req.files['trailerEpisode']) {
        return res.render('error', { message: 'La imagen y el trailer del episodio son obligatorios.' });
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
    
    await catalog.addEpisode(id, new_Episode)
    serie.badgeClass = catalog.getBadgeClass(serie.ageClassification);

    res.render('saved_serie');
});

router.post('/update_serie/:id', upload.single('image'), async (req, res) => {
    
    const id = req.params.id;
    const { title, genre, synopsis, ageClasification, seasons, premiere} = req.body;
    const age = parseInt(ageClasification);
    const numSeasons = parseInt(seasons);
    const year = parseInt(premiere);

    //not null
    if (!title || !genre || !synopsis || isNaN(age) || isNaN(numSeasons) || isNaN(year)) {
        return res.render( 'error', { message: 'Todos los campos del formulario son obligatorios .' });
    }

    const allSeries = await catalog.getSeries();
    //duplicated title
    const duplicate = allSeries.find(s => s.title === title && String(s._id) !== String(id));

    if (duplicate) {
        return res.render( 'error', { message: 'Titulo duplicado' });
    }

    //get the image of the serie
    const current_serie = await catalog.getSerie(id);
    const existingImage = current_serie.imageFilename;

    //get the new image
    let imageFilename;

    if (req.file) {
        imageFilename = req.file.filename;  //new image
    } else {
        imageFilename = existingImage;
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

    await catalog.updateSerie(id, update_serie);
    res.render('saved_serie');
});

router.get('/update_episode/:id/:numEpisode', async (req,res)=>{
    let serie = await catalog.getSerie(req.params.id);
    let episode = await catalog.getEpisode(serie, req.params.numEpisode); 
    res.render('update_episode', {serie, episode});
    
});

    //update episode
router.post('/form_update_episode/:id/:numEpisode',upload.fields([{ name: 'imageFilenamedetalle', maxCount: 1 }, { name: 'trailerEpisode', maxCount: 1 } ]),async (req, res) => {
    const id = req.params.id;
    const { titleEpisode, synopsisEpisode, timeEpisode, numEpisode } = req.body;
    const epTime = parseInt(timeEpisode);
    const newNumEpisode = parseInt(numEpisode);
    const originalNumEpisode = parseInt(req.params.numEpisode);
//not null
    if (!titleEpisode || !synopsisEpisode || isNaN(epTime)) {
        return res.render('error', { message: 'Todos los campos son obligatorios.' });
    }

    const allEpisodes = await catalog.getEpisodes(id);
    //not duplicated title
    let duplicate = allEpisodes.find(ep => ep.titleEpisode === titleEpisode && ep.numEpisode !== originalNumEpisode);
    if (duplicate) {
        return res.render('error', { message: 'Título del episodio duplicado.' });
    }
    //not duplicated number
    duplicate = allEpisodes.find(ep => ep.numEpisode === newNumEpisode && ep.numEpisode !== originalNumEpisode);
    if (duplicate) {
    return res.render('error', { message: 'Ese número de episodio ya existe.' });
    }
    //select photo and video      
    const imageFile = req.files?.imageFilenamedetalle?.[0];
    const trailerFile = req.files?.trailerEpisode?.[0];
    const serie = await catalog.getSerie(id);
    const originalEp = serie.episodes.find(ep => ep.numEpisode === originalNumEpisode);

    //new_episode
    const update_ep = {
        titleEpisode, 
        synopsisEpisode,
        numEpisode: newNumEpisode,
        timeEpisode: epTime,
        imageFilenamedetalle: imageFile ? imageFile.filename : originalEp.imageFilenamedetalle,
        trailerEpisode: trailerFile ? trailerFile.filename : originalEp.trailerEpisode
    };
    await catalog.updateEpisode(id, numEpisode, update_ep);
    res.render('saved_serie');
});

//end main_detalle

router.post('/serie/new', upload.single('image'), async (req, res) => {
    
    const seasons = parseInt(req.body.seasons);
    const ageClasification = parseInt(req.body.ageClasification);
    const premiere = parseInt(req.body.premiere);
    const currentYear = new Date().getFullYear();

    
    if (isNaN(seasons) || seasons < 1 || seasons > 20) {
        return res.status(400).send('Error: El número de temporadas debe estar entre 1 y 20.');
    }

    if (isNaN(ageClasification) || ageClasification < 0 || ageClasification > 18) {
        return res.status(400).send('Error: La clasificación de edad debe ser un estar entre 0 y 18.');
    } 
    
    if (isNaN(premiere) || premiere < 1900 || premiere > currentYear + 1) {
        return res.status(400).send(`Error: El año de estreno debe estar entre 1900 y 2026.`);
    }

    let serie = { 
        title: req.body.title,
        premiere: premiere, 
        ageClasification: ageClasification, 
        seasons: seasons, 
        genre: req.body.genre,
        synopsis: req.body.synopsis,
        image: req.file?.filename,
    };
    
    await catalog.addSerie(serie);
    res.render('saved_serie');
});

/*router.serie('/serie/new', upload.single('image'), async (req, res) => {

    let serie = {
        user: req.body.user,
        title: req.body.title,
        text: req.body.text,
        imageFilename: req.file?.filename
    };

    await catalog.addserie(serie);

    res.render('saved_serie', { _id: serie._id.toString() });

});



router.get('/serie/:id/delete', async (req, res) => {

    let serie = await catalog.deleteSerie(req.params.id);

    if (serie && serie.imageFilename) {
        await fs.rm(catalog.UPLOADS_FOLDER + '/' + serie.imageFilename);
    }

    res.render('deleted_serie');
});

;*/