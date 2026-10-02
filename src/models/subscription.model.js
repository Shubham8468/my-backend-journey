import mongoose from "mongoose";

const subscriptionSchema= new mongoose.Schema({
    subscriber:{
        type:mongoose.Types.ObjectId, // one who is subscribing
        ref:"User"
    },
    channel:{
        type:mongoose.Types.ObjectId, // ome to whom "subscriber" is subsribing 
        ref:"User"
    }

},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema);