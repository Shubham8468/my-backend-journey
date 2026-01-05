import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname) //we user upload file its save on the server  with original name but file on the server 
    //for the very short term 
  }
})

 export const upload = multer({ 
    storage,
 })