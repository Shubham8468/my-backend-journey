import multer from "multer";

// we use diskStorage for that .. 
// In multer then provied many option for the uploading ... like memory , distStorage..etc
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')// In that i enter our files decetory , where i want to store my all files ...
  },
  filename: function (req, file, cb) {
    // this are resposible, when i file are comes on server , with this i chaged file name ..
      cb(null, file.fieldname + '-' + raw.toString('hex'))
  }
})

export const upload = multer({ storage })