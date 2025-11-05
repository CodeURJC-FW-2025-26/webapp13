import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();
export default router;

const client = new MongoClient('mongodb://localhost:27017');

const db = client.db('catalog');
const posts = db.collection('series');

export const UPLOADS_FOLDER = './uploads';

export async function addSerie(post) {

    return await posts.insertOne(post);
}

export async function deleteSerie(id){

    return await posts.findOneAndDelete({ _id: new ObjectId(id) });
}

export async function deleteSerie(){

    return await posts.deleteMany();
}

export async function getSeries(){

    return await posts.find().toArray();
}

export async function getSeries(id){

    return await posts.findOne({ _id: new ObjectId(id) });
}

