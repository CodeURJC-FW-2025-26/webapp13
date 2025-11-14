import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })


router.get('/', async (req, res) => {

    let series = await catalog.getSeries();

    res.render('index', { series });
});

router.get('/main_detalle/:id', async (req,res) =>{

    let serie = await catalog.getSerie(req.params.id);
    res.render('main_detalle_notfilm');

});

router.get('/new_elem',(req,res)=>{

    

    res.render('main_nuevo-elem');

});

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

router.get('/serie/:id', async (req, res) => {

    let serie = await catalog.getSerie(req.params.id);

    res.render('show_serie', { serie });
});

router.get('/serie/:id/delete', async (req, res) => {

    let serie = await catalog.deleteSerie(req.params.id);

    if (serie && serie.imageFilename) {
        await fs.rm(catalog.UPLOADS_FOLDER + '/' + serie.imageFilename);
    }

    res.render('deleted_serie');
});

router.get('/serie/:id/image', async (req, res) => {

    let serie = await catalog.getSerie(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + serie.imageFilename);

});*/