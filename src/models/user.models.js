import mongoose ,{Schema} from 'mongoose';
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {
      userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true    //optimaze serching space so that use index(isse searching achhi ho jati hai )
      },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
      },
      fullName:{
        type:String,
        required:true,
        trim:true,
        index:ture     
      },
      avatar:{
        type:String, //Cludinary url 
        required:true
      },
      coverImage:{
        type:String,// cludinary url
      },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Viode"
            }
        ],
        password:{
            Type:String,
            required:[true,"password is required!!!"]
        },
        refreshToken:{
            type:String
        }
      },{timestamps:true});

      // pre is method use like a middleware , when i want to save any thing in my DB  use pre , isme arrow function use nhi 
      // krte hai , becouse . this are not refer to the globle in arrow function , so use simple fuction 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")){// here we check password is change or not if change is case if condition is flase and return 
        return next();
    }
  this.password= bcrypt.hash(this.password,10)
  next()
})

// here we create coustom method ....
userSchema.methods.isPasswordCorrect= async function (password){
  return await bcrypt.compare(password, this.password);
}



userSchema.methods.generateAccessToken= function (){
   return  jwt.sign(
        {
          // this is call payload 
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
         process.env.ACCESS_TOKEN_SECRET,
         {
          // jo token the expires hota hai vo object ke inder jata hai 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
         }
    )
}
userSchema.methods.generateRefreshToken =function(){
     return  jwt.sign(
        {
            _id:this._id, 
        },
         process.env.REFRESH_TOKEN_SECRET,
         {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
         }
    )
}
export const User= mongoose.model("User",userSchema);
