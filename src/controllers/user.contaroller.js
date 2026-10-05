import asyncHandeler from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponce } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import { mongo } from "mongoose"
import mongoose from "mongoose"

//Here we create a method for the genetar a accessToken and refreshToken .....

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    // we save our refrash token in Db 
    // and one think when i save in db, someFiled in Db are empty so that i give me error 
    // so that i use "validateBeforSave:true"
    await user.save({ validateBeforeSave: true })

    return { accessToken, refreshToken }


  } catch (error) {
    throw new ApiError(500, "Somthinf went wrong while gererating refresh and access Token!")
  }
}










export const registerUser = asyncHandeler(async (req, res) => {
  // get user details from frontend
  // validation -not empty
  // check if user already exists: username,email
  // check for image , check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token filed from response
  // check for user creation
  // return res
  const { email, fullName, password, userName } = req.body;
  //now check upcoming string is not null??
  if ([fullName, email, password, userName].some((filed) =>
    filed?.trim() === ""
  )) {
    throw new ApiError(400, "All fileds are required!.")
  }
  const foundUser = await User.findOne({
    $or: [
      { email },
      { userName }
    ]
  });
  // console.log(foundUser.userName)
  if (foundUser) {
    throw new ApiError(409, "User with email or userName allready registerd.")
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path; //Deko ye multer se file ko 
  // le rha hai
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avarat files is required!.")
  }
  // Now i go to upload this files on cloudinary.
  const avatarUploadOnCloudinary = await uploadOnCloudinary(avatarLocalPath) // isko await krenge, ki phle ye upload ho jaye tm tum next line pe jao
  const coverImageUploadOncloudinary = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatarUploadOnCloudinary) {
    throw new ApiError(400, "Avatar file is required!")
  }
  const user = await User.create({
    fullName,
    email,
    userName: userName.toLowerCase(),
    avatar: avatarUploadOnCloudinary.url,
    coverImage: coverImageUploadOncloudinary?.url || "", //this files are not required:true, so that i use this if user pass the cover image in case 
    //Image are store otherwise store empthy string 
    password
  })

  //Now i check that user created or not ??
  const createUser = await User.findById(user._id).select( // select user for the hidden some importen data that are return while Db response 
    "-password -refreshToken"
  )
  if (!createUser) {
    throw new ApiError(500, "Internal server Error!.User Not registering.")
  }
  return res.status(201).json(
    new ApiResponce(200, createUser, "User Registed Successfully!")
  )
})

export const loginUser = asyncHandeler(async (req, resp) => {
  // req.body => data 
  // username or email
  // find the user 
  // password check 
  // generate access and referesh token 
  // send cookie
  // respose 
  const { userName, email, password } = req.body ?? {}
  console.log(`user Name is :${userName}`)

  if (!email && !userName) {
    throw new ApiError(400, "UserName or email is required!")
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  //+++++++ Most Importen NOtes regarding to the method use that are create in UserModel +++++++++++++++++++++

  //   if create a methon inside the model and i want to use its in our controller
  //   in this case we need to fetch the user and use the method like :- user.checkPassword
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!")
  }


  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

  // here we call dataBase again for the Fetch new user Data .
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = { // this is for the chookes , we modify our cookes only server side . so we do this 
    httpOnly: true,
    secure: true
  }

  return resp.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(200,
        {
          // ye hm isliye kr raha hai , ki user mere api ko mobile me bhi use kr payega , becouse mobile apps me cookis set nhi hoti 
          // frontend devloper want to save this token in localstorage so we send in response 
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged successfully."
      )
    )
})


// user logged out method.

export const logoutUser = asyncHandeler(async (req, resp) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // This is query , what i want to changes in my Db
      $set: {
        refreshToken: undefined
      }
    },
    // this for the give me updated data 
    {
      new: true
    }
  )

  // that i also clean my all cookes .
  const options = {
    httpOnly: true,
    secure: true
  }
  return resp.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "User logged Out."))

})


// create controller for the refresh the accessToken 

export const refreshAccessToken = asyncHandeler(async (req, resp) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken //maby this req are comeing from the mobile app
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorizes request!")
  }

  // verify the accessToken ...
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  // Find the user .....
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(401, "Invalid RefreshToken!")
  }

  // check fronted accessToken and store token are same or not ...
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh tokne is expires or used!")
  }

  // Now we generate both Token ... by function ..
  const options = {
    httpOnly: true,
    secure: true
  }
  const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

  return resp.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponce(200,
        {
          // ye hm isliye kr raha hai , ki user mere api ko mobile me bhi use kr payega , becouse mobile apps me cookis set nhi hoti 
          // frontend devloper want to save this token in localstorage so we send in response 
          accessToken, refreshToken: newRefreshToken
        },
        "Access token refresh."
      )
    )

})

// change user its current password..

export const changeCurrentPassword = asyncHandeler(async (req, resp) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  // here we check old password is corrent or not with user method ...
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password!")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return resp.status(200).json(
    new ApiResponce(200, {}, "password change successfully!")
  )
})


export const getCurrentUser = asyncHandeler(async (req, resp) => {
  // const userId=req.user?._id;
  // const user=await User.findById(userId).select("-password","-refreshToken");
  // if(!user){
  //   throw new ApiError(400,"Invalid request!")
  // }
  // return resp.status(200).json(new ApiResponce(200,user,"User Profile get successfully."))
  return resp.status(200).json(new ApiResponce(200, req.user, "Current user fetched successfully"))
})


export const updateAccoundDetails = asyncHandeler(async (req, resp) => {
  const { userName, fullName, email } = req.body;
  if (!userName || !fullName || !email) {
    throw new ApiError(400, "All fileds are required!")
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullName,
        userName,
        email
      }
    },
    { // this is use for the give updated values
      new: true
    }
  ).select("-password", "-refreshToken")

  return resp.status(200),
    json(
      new ApiResponce(200, user, "Accound details updates successfully!")
    )

})


// Update user Avatar

export const updateUserAvatar = asyncHandeler(async (req, resp) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing!")
  }
  // upload avatar on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on Avatar!")
  }
  const user = await User.findByIdAndUpdate(user._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password", "-refreshToken")

  return resp.status(200).json(
    new ApiResponce(200, user, "Avatar updated successfully.")
  )
})

// update User Cover Image 

export const updateUserCoverImage = asyncHandeler(async (req, resp) => {
  const coverImage = req.file?.path
  if (!coverImage) {
    throw new ApiError(400, "CoverImage missing!")
  }

  // upload on Cloudinary..
  const updatedCoverImage = await uploadOnCloudinary(coverImage);
  if (!updateAccoundDetails.url) {
    throw new ApiError(400, "Error while uploading on CoverImage!")
  }
  const user = await User.findByIdAndUpdate(user._id,
    {
      $set: {
        coverImage: updatedCoverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password", "-refreshToken")

  return resp.status(200).json(
    new ApiResponce(200, user, "CoverImage updated successfully.")
  )
})

export const getUserChannelProfile = asyncHandeler(async (req, resp) => {
  const { userName } = req.params
  // now we check...
  if (!userName) {
    throw new ApiError(400, "UserName is missing!")
  }
  const channel = await User.aggregate([// Now here we write out aggregation pipleline .
    //First we match the userName ....
    {
      $match: {
        userName: userName?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions", // kis collection pe search krna hai .?
        localField: "_id", // with the help of "_id"
        foreignField: "channel", // us collection ke subscriber vale object ko .
        as: "subscribers"//Store the matching user information in a new array called "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: { // this are use to add object in our Main User Collection .
        subscribersCount: {// which name is ...
          $size: "$subscribers" // this are user to cound the "subscribers"  objects
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscrined: {
          $cond: { // here we check user subscribe this channel or not
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: { // this are use for which data we want to return to channel .
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscrined: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if (!channel?.length) { // becouse aggregation give me in arr formet so we check like this
    throw new ApiError(404, "Channel does not exites!")
  }
  resp.status(200).json(
    new ApiResponce(200, channel[0], "User channel fetch successfully.")
  )
})

export const getWatchHistory = asyncHandeler(async (req, resp) => {
  const user = await User.aggregate([
    {
      $match: {
        // Here we use mongoose.Types becouse Aggregation not supporet mongoose..
        // isme ager _id:req.user._id kre to error ayega to .
        // hm mongooose.Type use kr lete hai
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{
                $project: {
                  fullName:1,
                  userName:1,
                  avatar:1
                }
              }

              ]
            }
          }
        ]
      }
    }
  ])

  if (!user?.length) {
    throw new ApiError(404, "User does not exist")
  }

  return resp.status(200).json(
    new ApiResponce(200, user[0].watchHistory, "Watch history fetched successfully.")
  )
})
