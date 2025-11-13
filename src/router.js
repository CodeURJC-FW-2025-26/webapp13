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

router.get('/main_detalle/:id/:numEpisode', async (req,res) =>{
    
    let serie = await catalog.getSerie(req.params.id);
    
    let episode = await catalog.getEpisode(serie,req.params.numEpisode);

    res.render('main_detalle_notfilm', {serie, episode});

});

router.get('/new_elem',(req,res)=>{

    

    res.render('main_nuevo-elem');

});

router.get('/serie/:id/image', async (req, res) => {

    let serie = await catalog.getSerie(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + serie.imageFilename);

})


router.post('/serie/new', async (req, res) => {

    let serie = { 
        title: req.body.title,
        premiere: req.body.premiere,
        genre: req.body.genre,      
        synopsis: req.body.synopsis,  
        image: req.file?.filename
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