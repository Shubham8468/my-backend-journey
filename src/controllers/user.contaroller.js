import asyncHandeler from "../utils/asyncHandeler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { ApiResponce } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

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

export const logoutUser= asyncHandeler( async (req,resp)=>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
        // This is query , what i want to changes in my Db
        $set:{
          refreshToken:undefined
        }
      },
      // this for the give me updated data 
      {
        new:true
      }
    )

    // that i also clean my all cookes .
    const options={
      httpOnly:true,
      secure:true
    }
    return resp.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponce(200,{},"User logged Out."))

})


// create controller for the refresh the accessToken 

export const refreshAccessToken= asyncHandeler(async (req,resp)=>{
    const incomingRefreshToken=req.cookie.refreshToken || req.body.refreshToken //maby this req are comeing from the mobile app
    if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorizes request!")
    }

    // verify the accessToken ...
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    // Find the user .....
    const user= await User.findById(decodedToken._id);
    if(!user){
    throw new ApiError(401,"Invalid RefreshToken!")
    }

    // check fronted accessToken and store token are same or not ...
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh tokne is expires or used!")
    }

    // Now we generate both Token ... by function ..
    const options={
      httpOnly:true,
      secure:true
    }
    const { accessToken, newRefreshToken }= await generateAccessTokenAndRefreshToken(user._id)

    return resp.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponce(200,
        {
          // ye hm isliye kr raha hai , ki user mere api ko mobile me bhi use kr payega , becouse mobile apps me cookis set nhi hoti 
          // frontend devloper want to save this token in localstorage so we send in response 
           accessToken,refreshToken:newRefreshToken
        },
        "Access token refresh."
      )
    )

})
