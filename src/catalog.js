import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

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

    // Get index of the current episode
    const index = serie.episodes.findIndex(e => e.numEpisode === targetEpisodeNum);
    //return to the first episode
    if (index === serie.episodes.length - 1) {
        return serie.episodes[0]; 
    }

    // Return the next episode in the array
    return serie.episodes[index + 1];
}
