import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { commentOnVideos,deleteComment } from "../controllers/comment.controller.js";
export const comRouter=Router();

comRouter.route("/new-comment/:id").post(verifyJWT,upload.none(),commentOnVideos);
comRouter.route("/delete/:id").post(verifyJWT,deleteComment);
