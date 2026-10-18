import asyncHandeler from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponce } from "../utils/apiResponse.js"
import mongoose from "mongoose";
import { Like } from "../models/like.model.js"
import { Video } from "../models/videos.models.js"
import {Comment} from "../models/comment.model.js"

export const likeOnVideo = asyncHandeler(async (req, resp) => {
    const likeBy = req.user._id;
    const { id: videoId } = req.params;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id!");
    }
    const findVideo = await Video.findById({
        _id: videoId
    })
    if (!findVideo) {
        throw new ApiError(404, "Video not found!")
    }
    const likeByUserOrNot=await Like.findOne({
        video:videoId,
        likeBy
    })
    if(likeByUserOrNot){
        throw new ApiError(400,"you allready like this video!")
    }
    const like = await Like.create(
        {
            video: videoId,
            likeBy
        })

    return resp.status(200).json(
        new ApiResponce(200, like, "You like this video.")
    )
})
export const disLikeVideo=asyncHandeler(async (req,resp)=>{
    const {id:videoId}=req.params;
    const likeBy=req.user._id;
    console.log(`video id is ${videoId} and the like by ${likeBy}`)
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404,"Invide video Id!");
    }
    const findLike=await Like.findOne({
        likeBy,
        video:videoId
    })
    if(!findLike){
        throw new ApiError(404,"You allready not like this video!")
    }
    const deleteLike =await Like.deleteOne({
        likeBy,
        video:videoId
    })
    return resp.status(200).json(
        new ApiResponce(200,deleteLike,"You dislike this video.")
    )
})


export const findUserLikeThisVideo=asyncHandeler(async (req,resp)=>{
    const {id:videoId}=req.params;
    const likeBy=req.user._id;
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Video id invalid!")
    }
    const findVideo=await Video.findById({_id:videoId})
    if(!findVideo){
        throw new ApiError(404,"video not available because something is wrong with the video file")
    }
    const likeByUserOrNot=await Like.findOne({
        video:videoId,
        likeBy
    })
    if(!likeByUserOrNot){
        return resp.status(200).json(
            new ApiResponce(200,false,"Video not Like by user .")
        )
    }else{
        return resp.status(200).json(
            new ApiResponce(200,true,"Video like by user .")
        )
    }
})

export const totalLikeOnVideo=asyncHandeler(async (req,resp)=>{
    const {id :videoId}=req.params;
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid videos id!")
    }
    const likesOnVideos=await Like.find(
        {
            video:videoId
        }
    )
    console.log(likeOnVideo)
    const totalLikes=likesOnVideos.length;
    return resp.status(200).json(
        new ApiResponce(200,{count:totalLikes},"Total like count fetch successfully.")
    )
})



///


/// Now i move on the comment like ....

export const commentLike=asyncHandeler(async (req,resp)=>{
     const likeBy = req.user._id;
    const { id: commetId } = req.params;
    if (!commetId || !mongoose.Types.ObjectId.isValid(commetId)) {
        throw new ApiError(400, "Invalid Comment Id!");
    }
    const findVideo = await Comment.findById({
        _id: commetId
    })
    if (!findVideo) {
        throw new ApiError(404, "Comment not found!")
    }
    const likeByUserOrNot=await Like.findOne({
        video:commetId,
        likeBy
    })
    if(likeByUserOrNot){
        throw new ApiError(400,"you allready like this Commet!")
    }
    const like = await Like.create(
        {
            video: commetId,
            likeBy
        })
    return resp.status(200).json(
        new ApiResponce(200, like, "You like this comment.")
    )
})

export const dislikeComment=asyncHandeler(async (req,resp)=>{
    const {id:commetId}=req.params;
    const likeBy=req.user._id;
    console.log(`video id is ${commetId} and the like by ${likeBy}`)
    if(!commetId || !mongoose.Types.ObjectId.isValid(commetId)){
        throw new ApiError(404,"Invide video Id!");
    }
    const findLike=await Like.findOne({
        likeBy,
        video:commetId
    })
    if(!findLike){
        throw new ApiError(404,"You allready not like this video!")
    }
    const deleteLike =await Like.deleteOne({
        likeBy,
        video:commetId
    })
    return resp.status(200).json(
        new ApiResponce(200,deleteLike,"You dislike this video.")
    )
})
export const findUserLikeThisComment=asyncHandeler(async (req,resp)=>{
    const {id:commentId}=req.params;
    const likeBy=req.user._id;
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Video id invalid!")
    }
    const FindComment=await Comment.findById({_id:commentId})
    if(!FindComment){
        throw new ApiError(404,"comment not available because something is wrong with the comment file")
    }
    const likeByUserOrNot=await Like.findOne({
        video:commentId,
        likeBy
    })
    if(!likeByUserOrNot){
        return resp.status(200).json(
            new ApiResponce(200,false,"Video not Like by user .")
        )
    }else{
        return resp.status(200).json(
            new ApiResponce(200,true,"Video like by user .")
        )
    }
})

export const totalLikeOnComment=asyncHandeler(async (req,resp)=>{
    const {id :commentId}=req.params;
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid videos id!")
    }
    const likesOnComment=await Like.find(
        {
            video:commentId
        }
    )
    console.log(likeOnVideo)
    const totalLikes=likesOnComment.length;
    return resp.status(200).json(
        new ApiResponce(200,{count:totalLikes},"Total like count fetch successfully.")
    )
})