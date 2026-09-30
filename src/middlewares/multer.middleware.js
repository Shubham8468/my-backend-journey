import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const tempDirectory = path.resolve(currentDirectory, "../../public/temp");
fs.mkdirSync(tempDirectory, { recursive: true });

const storage=multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,tempDirectory)
    },
    filename:function(ref,file,cd){
        const uniqueName=Date.now()+"_"+Math.floor(Math.random()*100)+"_"+file.originalname;
        cd(null,uniqueName);
    }
})
export const upload=multer({
    storage,
})