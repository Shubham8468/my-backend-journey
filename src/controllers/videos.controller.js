import asyncHandeler from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../models/videos.models.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponce } from "../utils/apiResponse.js"


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