import asyncHandeler from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import {ApiResponce} from "../utils/apiResponse.js"
export const registerUser=asyncHandeler(async (req,res)=>{
  // get user details from frontend
  // validation -not empty
  // check if user already exists: username,email
  // check for image , check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token filed from response
  // check for user creation
  // return res
  const {email,fullName,password,userName}=req.body;
  //now check upcoming string is not null??
  if([fullName,email,password,userName].some((filed)=>
    filed?.trim()===""
  )){
    throw new ApiError(400,"All fileds are required!.")
  }
  const foundUser=User.findOne({
    $or :[{userName},{email}] // here we check if email, or userName allready exits or not 
  });
  if(foundUser){
    throw new ApiError(409,"User allready registerd.")
  }
  const avatarLocalPath=req.files?.avatar[0]?.path; //Deko ye multer se file ko 
  // le rha hai
  const coverImageLocalPath=req.files?.coverImage[0]?.path
  if(!avatarLocalPath){
    throw new ApiError(400,"Avarat files is required!.")
  }
  // Now i go to upload this files on cloudinary.
  const avatarUploadOnCloudinary= await uploadOnCloudinary(avatarLocalPath) // isko await krenge, ki phle ye upload ho jaye tm tum next line pe jao
  const coverImageUploadOncloudinary=await uploadOnCloudinary(coverImageLocalPath)
  if(!avatarUploadOnCloudinary){
    throw new ApiError(400,"Avatar file is required!")
  }
  const user=await User.create({
    fullName,
    email,
    userName:userName.toLowerCase(),
    avatar:avatarUploadOnCloudinary.url,
    coverImage:coverImageUploadOncloudinary?.url || "", //this files are not required:true, so that i use this if user pass the cover image in case 
    //Image are store otherwise store empthy string 
    password
  })

  //Now i check that user created or not ??
  const createUser=await User.findById(user._id).select( // select user for the hidden some importen data that are return while Db response 
    "-password -refreshToken"
  )
  if(!createUser){
    throw new ApiError(500,"Internal server Error!.User Not registering.")
  }
return res.status(201).json(
  new ApiResponce(200,createUser,"User Registed Successfully!")
)
})
