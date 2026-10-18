import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AllCommentOnVideo, commentOnVideos,deleteComment, editComment, findYourAllComment } from "../controllers/comment.controller.js";
export const comRouter=Router();

comRouter.route("/new-comment/:id").post(verifyJWT,upload.none(),commentOnVideos);
comRouter.route("/delete/:id").post(verifyJWT,deleteComment);
comRouter.route("/edit/:id").patch(verifyJWT,upload.none(),editComment)
comRouter.route("/all-comment").get(verifyJWT,findYourAllComment)
comRouter.route("/on-video/:id").get(verifyJWT,AllCommentOnVideo)