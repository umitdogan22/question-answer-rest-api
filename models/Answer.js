const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Question = require("./Question");
const errorWrapper = require("../helpers/errorWrapper");

const AnswerSchema = new Schema({
    content : {
        type : String,
        required : [true,"Please provide a content"],
        minlength : [20,"Please provide content at least 20 characters"]
    },
    vote : {
        type : Number,
        default : 0
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true
    },
    question : {
        type : mongoose.Schema.ObjectId,
        ref : "Question",
        required : true
    }

});
AnswerSchema.pre("save",async function(next){


    if (!this.isModified("user")) return next();

    try {
    
        const question = await Question.findById(this.question);

        question.answers.push(this.id);
        await question.save();
        next();
    }
    catch(err) {
        next(err);
    }
 
});

AnswerSchema.post("remove",async function(){
    
    
    const question = await Question.findById(this.question);

    question.answers.splice(question.answers.indexOf(this._id),1);

    await question.save();
    

});
module.exports = mongoose.model("Answer",AnswerSchema);


