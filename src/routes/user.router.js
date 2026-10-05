import {Router} from "express"
import { 
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getWatchHistory,
    updateAccoundDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    updateUserAvatar
} from "../controllers/user.contaroller.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router =Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

// router.route("/login").post(upload.none(), loginUser)
router.post("/login",upload.none(),loginUser);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/watch-history").get(verifyJWT, getWatchHistory)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccoundDetails)
router.route("/avatar").patch(verifyJWT,upload.single(
    "avatar"
),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:userName").get(verifyJWT,getUserChannelProfile);


export default router;
