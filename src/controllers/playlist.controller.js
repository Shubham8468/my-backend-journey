import asyncHandeler from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../models/videos.models.js"
import { ApiResponce } from "../utils/apiResponse.js"
import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"

export const createPlyaList=asyncHandeler(async (req, resp)=>{
    const {name,discription}=req.body;
    if(!name || !discription){
        throw new ApiError(400,"Name and Discription are requiured for the create playlist.");
    }
    const {id:videoId}=req.params;
    console.log(videoId);
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid videos id!");
    }
    const userId=req.user._id;
    // first we find the playlist is exite or not 
    // const findPlaylist=await Playlist.find({
    //     owner:userId
    // })
    const playlist=await Playlist.create({
        name,
        discription,
        videos:[
            videoId
        ],
        owner:userId
    })
  
    return resp.status(200).json(
        new ApiResponce(200,playlist,"New playlist create successfully.")
    )
})



export const addVideosInPlaylist=asyncHandeler(async (req,resp)=>{
    // pass videoId
    // then userId
    // find in Db
    // add videos ..
    const {id:vidoeId}=req.params;
    if(!vidoeId || !mongoose.Types.ObjectId.isValid(vidoeId)){
        throw new ApiError(400,"Invalid playlist id!")
    }
    const owner=req.user._id;
    const 

})
