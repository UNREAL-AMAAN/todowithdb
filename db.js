const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId
const Schema = mongoose.Schema;


const user  = new Schema( {
    email : {type : String , unique : true},
    password : String,
    name : String,
}) 

const todo = new Schema({
    userId : ObjectId,
    title : String,
    status : Boolean
})

const UserModel = mongoose.model('users' , user)
const TodoModel = mongoose.model('todos' , todo)


module.exports = {
    UserModel : UserModel,
    TodoModel : TodoModel
}





