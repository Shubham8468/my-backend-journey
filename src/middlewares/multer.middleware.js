import multer from "multer";
const storage=multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,"./public/temp")
    },
    filename:function(ref,file,cd){
        const uniqueName=Date.now()+"_"+Math.floor(Math.random()*100)+"_"+file.originalname;
        cd(null,uniqueName);
    }
})
export const upload=multer({
    storage,
})