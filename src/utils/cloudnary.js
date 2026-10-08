import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
// import { ApiError } from "./apiError";

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        configureCloudinary();
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary seccessfull!!!", response.url);
        if (response) {
            fs.unlinkSync(localFilePath);
            console.log(`after uploading files on cloudinary, Files are remove from the server..Successfully!!`)
        }
        return response;
    }
    catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload failed:", error);
        return null;
    }
}

// const uploadVideosONCloudinary=async(localFilePath)=>{
//     try {
//         if(!localFilePath){
//            return null;
//         }

//     } catch (error) {
        
//     }
// }


 const destroyFile=async (publicId)=>{
    try {
        if(!publicId){
            return null
        }
        const deleteResponse=await cloudinary.uploader.destroy(publicId);
        console.log(`File Destroy successfully.`)
        return deleteResponse;
        
    } catch (error) {
        console.log(`Cloudinary not delete image , :${error}`)
        return null;
    }
}
export { uploadOnCloudinary,destroyFile }