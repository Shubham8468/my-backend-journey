import asyncHandeler from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../models/videos.models.js"
import { ApiResponce } from "../utils/apiResponse.js"
import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"

export const createPlyaList = asyncHandeler(async (req, resp) => {
    const { name, discription } = req.body;
    if (!name || !discription) {
        throw new ApiError(400, "Name and Discription are requiured for the create playlist.");
    }
    // // const {id:videoId}=req.params;
    // console.log(videoId);
    // if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
    //     throw new ApiError(400,"Invalid videos id!");
    // }
    const userId = req.user._id;
    // first we find the playlist is exite or not 
    // const findPlaylist=await Playlist.find({
    //     owner:userId
    // })
    const playlist = await Playlist.create({
        name,
        discription,
        videos: [],
        owner: userId
    })

    return resp.status(200).json(
        new ApiResponce(200, playlist, "Your new playlist create successfully.")
    )
})



export const addVideoInPlaylist = asyncHandeler(async (req, resp) => {
    //Find playlist .
    //Check video exists .
    // Then add in playlist.
    const { playlistId, vidoeId } = req.params;
    const userId = user._id;
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId) && !vidoeId || !mongoose.Types.ObjectId.isValid(vidoeId)) {
        throw new ApiError(400, "Invalid PlaylistId or VideoId Id!")
    }

    const playlist = await Playlist.findOne(
        {
            owner: userId,
            _id: playlistId
        }
    )
    if (!playlist) {
        throw new ApiError(400, "Playlist not found!")
    }
    const videoExists = await Video.findOne({
        _id: vidoeId
    })
    if (!videoExists) {
        throw new ApiError(400, "Video not find !");
    }
    await Playlist.updateOne(
        {
            _id: playlistId
        },
        {
            $addToSet: {
                videos: vidoeId
            }
            // $push adds the video ID, even if it already exists.
            // $addToSet adds the ID only if that ID isn't already in the array.
        }
    )
    return resp.status(200).json(
        new ApiResponce(200, {}, "Video added to playlist successfully")
    )
})



// get user playlist ...
// by playlist Id
// 
export const getPlaylistById = asyncHandeler(async (req, resp) => {
    const { playlistId } = req.params;
    const userId = req.user._id;
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist id!")
    }
    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: userId
    }).populate({
        path: "videos",
        select: "title description thumbnail.url duration videoFile.url"
    })
    //check whether the playlist exists or not 
    if (!playlist) {
        throw new ApiError(404, "Playlist not found!")
    }
    return resp.status(200).json(
        new ApiResponce(200, playlist, "Playlist fetched successfully.")
    )
})


//Remove a videos from the playlist 
//  get playlistId
//  and userId

export const removeVideo = asyncHandeler(async (req, resp) => {
    const { playlistId, videoId } = req.params;
    const userId = req.user._id;
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId) && !videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Playlist or Video Id!")
    }
    const removeVideo = await Playlist.updateOne(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $pull: {
                videos: videoId
            }
        }
        // $pull removes matching video IDs from the array.
        //  In your actual controller, also validate the IDs
        //  and check whether the playlist exists and belongs
        //  to the user before returning success.

    )
    if (!removeVideo) {
        throw new ApiError(404, "Faild to remove this video from your Playlist!")
    }
    return resp.status(200).json(
        new ApiResponce(200, {}, "Video remove from playlist, successfully.")
    )
})

// get all playlist , that are created by user .

export const getAllPlaylistCreaetByUser = asyncHandeler(async (req, resp) => {
    const userId = req.user._id;
    const playlist = await Playlist.find({
        owner: userId
    }).sort({
        createdAt: -1
    })

    if (!playlist) {
        throw new ApiError(404, "Not any playlist find.")
    }

    return resp.status(200).json(
        new ApiResponce(200, playlist, "playlist fetced successfully.")
    )
})

export const updateTitleDescription = asyncHandeler(async (req, resp) => {
    const { playlistId } = req.params;
    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist Id!")
    }
    const { name, discription } = req.body;
    if (!name || !discription) {
        throw new ApiResponce(400, "Name and Discription are required!")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: {
                name,
                discription
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
    if (!playlist) {
        throw new ApiError(404, "Playlist not found!")
    }
    return resp.status(200).json(
        new ApiResponce(200, {}, "Playlist updated successfully.")
    )

})