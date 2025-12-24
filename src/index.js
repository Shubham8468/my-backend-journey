//   require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
import connectDB from "./db/index.js"


dotenv.config({path : './.env'})
connectDB()


























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