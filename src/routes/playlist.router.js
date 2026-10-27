import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {addVideoInPlaylist, createPlyaList, getPlaylistById} from "../controllers/playlist.controller.js"
import router from "./user.router.js";

export const playRouter=Router();

playRouter.route("/create").post(verifyJWT,upload.none(),createPlyaList)
playRouter.route("/:playlistId/add/:vidoeId").patch(verifyJWT,addVideosInPlaylist);
playRouter.route("/user/:playlistId").get(verifyJWT,getPlaylistById)
playRouter,route("/:playlistId/remove/:videoId").patch(verifyJWT,)
