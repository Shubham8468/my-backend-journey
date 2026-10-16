import asyncHandeler from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponce } from "../utils/apiResponse.js"
import { Comment } from "../models/comment.model.js"
import mongoose from "mongoose";

export const commentOnVideos = asyncHandeler(async (req, resp) => {
    const { content } = req.body ?? {};
    console.log(`this is comment${content}`)
    if (!content) {
        throw new ApiError(400, "Content is required!");
    }
    const userId = req.user?._id;

    const { id: videoId } = req.params;
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id!")
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })
    return resp.status(200).json(
        new ApiResponce(200, comment, "Comment on Videos successfully.")
    )

})

export const deleteComment = asyncHandeler(async (req, resp) => {
    const { id: commentId } = req.params;
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment Id!")
    }
    const comment = await Comment.findByIdAndDelete({ _id: commentId })
    if (!comment) {
        throw new ApiError(400, "Comment not found!")
    }
    return resp.status(200).json(
        new ApiResponce(200, {}, "Comment Delete Successfully.")
    )
})