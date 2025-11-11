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

