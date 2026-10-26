import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {createPlyaList} from "../controllers/playlist.controller.js"

export const playRouter=Router();

playRouter.route("/new/:id").post(verifyJWT,upload.none(),createPlyaList)
