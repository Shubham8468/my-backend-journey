const asyncHandeler=(requsetHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requsetHandler(req,res,next)).catch((err)=>next(err));
    }
}

export default asyncHandeler;






// this is the another message for the asyncHandeler  , And here we use hight order function concepts 

// const asyncHandeler=(fn)=>async (req,res,next)=>{
//     try{
//          await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.code || 500).json ({
//             success :false,
//             message:err.message
//         })
//     }
// }