import asyncHandeler from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../models/videos.models.js"
import { destroyFile, uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponce } from "../utils/apiResponse.js"
import mongoose from "mongoose";


export  const uploadVideos=asyncHandeler(async (req,resp)=>{
    const {title,description,isPublished}=req.body;
    if(!title || !description || isPublished === undefined){
        throw new ApiError(400,"All Filleds are required!");
    }
    const videoFilePath=req.files?.videoFile?.[0].path; // here we take one videos , on one time 
    const thumbnailPath=req.files?.thumbnail?.[0].path;
    if(!videoFilePath){
        throw new ApiError(400,"Please upload video file!")
    }
    if(!thumbnailPath){
        throw new ApiError(400,"Please upload Thumbnail.")
    }
    const videoUploadOnCloudinary=await uploadOnCloudinary(videoFilePath)
    const thumbnailUploadOnCloudinary=await uploadOnCloudinary(thumbnailPath);
    if(!videoUploadOnCloudinary){
        throw new ApiError(400,"Video not upload on Cloudinary!")
    }
    if(!thumbnailUploadOnCloudinary){
        throw new ApiError(400,"Thumbnil not upload on Cloudinary!")
    }
    const createVideo=await Video.create({
        videoFile:{
            public_id:videoUploadOnCloudinary.public_id,
            url:videoUploadOnCloudinary.url
        },
        thumbnail:{
            public_id:thumbnailUploadOnCloudinary.public_id,
            url:thumbnailUploadOnCloudinary.url
        },
        title,
        description,
        duration:videoUploadOnCloudinary?.duration,
        isPublished,
        owner:req.user._id // only loggin user ...
    })
    return resp.
    status(200).
    json(
        new ApiResponce(200,createVideo,"Videos upload successfully, On platform.")
    )
})

export const deleteVideos=asyncHandeler(async (req,resp)=>{
    const { id: videoId } = req.params;
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video ID!");
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not Found!")
    }
    // here we delete both thumnail and videos
    const videoPublicId=video?.videoFile?.public_id;
    const thumbnailPublicId=video?.thumbnail?.public_id;
    console.log(`videos public id ${videoPublicId} and thumbnai public Id ${thumbnailPublicId}`)

    await Video.findByIdAndDelete(videoId);

    const videosDistroy= await destroyFile(videoPublicId);
    const thumbnaiDistroy=await destroyFile(thumbnailPublicId)
    if(!videosDistroy){
        throw new ApiError(400,"Faild to Distroy video on Cloudinary!")
    }
    if(!thumbnaiDistroy){
        throw new ApiError(400,"Faild to Distroy Thumbnail on Cloudinary!")
    }
    return resp.status(200).json(
        new ApiResponce(200,{},"delete successfully")
    )
})

