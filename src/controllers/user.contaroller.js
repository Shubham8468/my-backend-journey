import asyncHandeler from "../utils/asyncHandeler.js"

export const registerUser=asyncHandeler(async (req,res)=>{
  return res.status(200).json({
    message:"User Register successfully."
  })
})
