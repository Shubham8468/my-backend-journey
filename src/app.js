import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app=express();


app.use(cors({
    origin :process.env.CORS_ORIGIN,
    // methods:[],
    credentials:true
}))


// This for the set limitation , that are comes from the frontend side ..
app.use(express.json({
    limit:"16kb"
}));

// this are use for the get data from the url so i use urlencoded .. and also i use extended:true for the get nested data 
app.use(express.urlencoded({extended:true,limit:"16kb"}));

// this one is use the store any items in this folder
app.use(express.static("public"));

app.use(cookieParser());


//++++++ Routes ++++++++++++
//Router ko yaha import krna 
//here we cagrigation the file and import the roter here...
import userRouter from "./routes/user.router.js"
import { viRouter } from './routes/videos.router.js';

//Routes declaration..
app.use("/api/v1/user",userRouter);
app.use("/api/v1/video",viRouter);
export default app;