import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {addVideoInPlaylist, createPlyaList, deleteMyPlaylist, getAllPlaylistCreaetByUser, getPlaylistById, removeVideo, updateTitleDescription} from "../controllers/playlist.controller.js"


export const playRouter=Router();

playRouter.route("/create").post(verifyJWT,upload.none(),createPlyaList)
playRouter.route("/:playlistId/add/:vidoeId").patch(verifyJWT,addVideoInPlaylist);
playRouter.route("/user/:playlistId").get(verifyJWT,getPlaylistById)
playRouter.route("/:playlistId/remove/:videoId").patch(verifyJWT,removeVideo)
playRouter.route("/all").get(verifyJWT,getAllPlaylistCreaetByUser)
playRouter.route("/update/:playlistId").patch(verifyJWT,upload.none(),updateTitleDescription)
playRouter.route("/delete/:playlistId").delete(verifyJWT,deleteMyPlaylist)