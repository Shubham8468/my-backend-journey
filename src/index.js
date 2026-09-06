//   require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from "./db/index.js"
import app from './app.js';


const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({path: envPath})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is runnig ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongo Db connection failed",err)
});

























//  THIS is the first approach fro the connections of  MongosDB 
// import express from "express"
// const app=express();
// ;( async () => { 
//     try {
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
//       app.on('error',(error)=>{
//         console.log("App not eble to take to Db",error);
//         throw error;
//       })
//       app.listen(process.env.PORT,()=>{
//         console.log(`App is listen on port ${process.env.PORT}`);
//       })
//     }
//     catch(error){
//         console.log("ERROR:",error);
//         throw error;
//     }

// }) ()