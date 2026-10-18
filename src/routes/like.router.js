import {Router} from "express"
import {commentLike, dislikeComment, disLikeVideo, findUserLikeThisComment, findUserLikeThisVideo, likeOnVideo, totalLikeOnComment, totalLikeOnVideo} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"


export const liRouter=Router();
liRouter.route("/on-video/:id").post(verifyJWT,likeOnVideo);
liRouter.route("/dislike-video/:id").delete(verifyJWT,disLikeVideo);
liRouter.route("/video-like-or-not/:id").get(verifyJWT,findUserLikeThisVideo);
liRouter.route("/total/:id").get(verifyJWT,totalLikeOnVideo)


liRouter.route("/on-comment/:id").post(verifyJWT,commentLike);
liRouter.route("/dislike-comment/:id").delete(verifyJWT,dislikeComment);
liRouter.route("/comment-like-or-not/:id").get(verifyJWT,findUserLikeThisComment);
liRouter.route("/total/:id").get(verifyJWT,totalLikeOnComment)