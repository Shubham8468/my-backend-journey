
import {Router} from "express"
import {deleteVideos, fetchAllUploadedVideos, updateVideoDetails, uploadVideos} from "../controllers/videos.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const viRouter=Router();
viRouter.route("/upload").post(verifyJWT,   
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    uploadVideos
)
viRouter.route("/delete/:id").post(verifyJWT,deleteVideos)
viRouter.route("/update/:id").patch(verifyJWT,updateVideoDetails)
viRouter.route("/all-videos").get(verifyJWT,fetchAllUploadedVideos)
