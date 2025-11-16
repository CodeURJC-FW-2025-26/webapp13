import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { symlink } from 'node:fs';

const router = express.Router();
export default router;

const client = new MongoClient('mongodb://localhost:27017');

const db = client.db('catalog');
const series = db.collection('series');

export const UPLOADS_FOLDER = './uploads';

export async function addSerie(serie) {

    return await series.insertOne(serie);
}

export async function deleteSerie(id){

    return await series.findOneAndDelete({ _id: new ObjectId(id) });
}

export async function deleteSeries(){

    return await series.deleteMany();
}
export async function getSeries(){

    return await series.find().toArray();
}

export async function getSerie(id){

    return await series.findOne({ _id: new ObjectId(id) });
}

export async function getEpisode(serie, numEpisode) {

    //To pass numEpisode to int.
    const targetEpisodeNum = parseInt(numEpisode);

    //Search for the episode number we passed as a parameter.
    return await serie.episodes.find(e => e.numEpisode === targetEpisodeNum);
}
export async function getEpisodes(id) {
    const serie = await series.findOne(
        { _id: new ObjectId(id) },
        { projection: { episodes: 1, _id: 0 } }
    );
    return serie.episodes.sort((a, b) => a.numEpisode - b.numEpisode);
}
export function getBadgeClass(age) {
    if (age >= 18) {
        return "bg-danger";
    } else if (age >= 16) {
        return "bg-orange";
    } else if (age >= 12) {
        return "bg-warning";
    }
    return "bg-info"; //default opcion
}


//delete episode
export async function deleteEpisode(id, numEpisode) {
    const targetEpisodeNum = parseInt(numEpisode);
    
    return await series.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { episodes: { numEpisode: targetEpisodeNum } } }
    );
}

export function getNextEpisode(serie, numEpisode) {

    const targetEpisodeNum = parseInt(numEpisode);

    // Get index of the episode(index = number)
    const index = serie.episodes.findIndex(e => e.numEpisode === targetEpisodeNum);
    //return to the first episode
    if (index === serie.episodes.length - 1) {
        return serie.episodes[0];
    }

    // Return the next episode in the array
    return serie.episodes[index + 1];
}

export function getPreviusEpisode(serie, numEpisode){
    const targetEpisodeNum = parseInt(numEpisode);
    //get index of the episode
    const index = serie.episodes.findIndex(e => e.numEpisode === targetEpisodeNum)
    //return to last episode
    if (index === 0){
        return serie.episodes[serie.episodes.length - 1]
    }
    //return to the previus episode
    return serie.episodes[index-1]

}

export async function updateSerie (id, update_serie){
        await series.replaceOne(
        {_id: new ObjectId(id)}, update_serie);
}


export async function addEpisode(id, new_episode) {
    await series.updateOne(
        { _id: new ObjectId(id) },
        { $push: { episodes: new_episode } }
    );
    serie.episodes.sort((a,b) => a.numEpisode - b.numEpisode)
    return serie
}

export async function updateEpisode(id, numEpisode, update_ep) {
    let serie = await series.findOne({ _id: new ObjectId(id) });

return await series.updateOne(
        { 
            _id: new ObjectId(id),
            "episodes.numEpisode": numEpisode
        },
        { 
            $set: { "episodes.$": update_ep } 
        }
    );
}


