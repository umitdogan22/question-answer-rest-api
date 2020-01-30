const Question = require("../models/Question");

const errorWrapper = require("../helpers/errorWrapper");
const CustomError = require("../helpers/customError");

const getAllQuestions = errorWrapper(async(req,res,next) => {

    const questions = await Question.find()
    .populate({path:"user",select:"name profile_image"});

    return res
    .status(200)
    .json({
        success : true,
        count : questions.length,
        data : questions
    });

});
const askNewQuestion = errorWrapper(async(req,res,next) => {

    const information = req.body;

    const question  = await Question.create({
        ...information,
        user : req.user.id
    });

    res.status(200)
    .json({
        success : true,
        message : question
    });
});
const getSingleQuestion = errorWrapper(async (req,res,next) => {
    const {id} = req.params;
    const question = await Question.findById(id)
    .populate({path : "user",select: "name profile_image"});
    
    return res
    .status(200)
    .json({
        success : true,
        likesCount : question.likesCount,
        data : question
    });

});
const editQuestion = errorWrapper(async(req,res,next) => {
    const {id} = req.params;
    const {title,content} = req.body;
    let question = await Question.findById(id);

    question.title = title;
    question.content = content;

    question = await question.save();
    
    res.status(200)
    .json({
        success : true,
        data :  question
    });

});
const deleteQuestion = errorWrapper(async(req,res,next) => {
    const {id} = req.params;

    await Question.findByIdAndRemove(id);

    
    res.status(200)
    .json({
        success : true,
        data : {}
    });

});
const likeQuestion = errorWrapper(async(req,res,next) => {
    const {id} = req.params;
    
    const question = await Question.findById(id);

    if (question.likes.includes(req.user.id)) {
        return next(new CustomError("You already liked this question",400));
    }
    question.likes.push(req.user.id);

    await question.save();
    
    return res.status(200)
    .json({
        success : true,
        likesCount : question.likesCount,
        data : question
    });

});
const undoLikeQuestion = errorWrapper(async(req,res,next) => {
    const {id} = req.params;
    
    const question = await Question.findById(id);

    if (!question.likes.includes(req.user.id)) {
        return next(new CustomError("You can not undo like operation for this question",400));
    }
    const index = question.likes.indexOf(req.user.id);

    question.likes.splice(index,1);
    
    await question.save();

    res
    .status(200)
    .json({
        success : false,
        likesQuestion : question.likesCount,
        data : question
    });
});

module.exports = {
    askNewQuestion,
    getAllQuestions,
    getSingleQuestion,
    editQuestion,
    deleteQuestion,
    likeQuestion,
    undoLikeQuestion
};
