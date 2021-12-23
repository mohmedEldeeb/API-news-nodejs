const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        // lowercasw: true,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error('Email is invalid')
            }
        }
    },
    age:{
        type: Number,
        default: 22,
        validate(age){
            if(age < 0){
                throw new Error('Age must be positive number')
            }
        }
    },
    password:{
        type: String,
        trim: true,
        required: true,
        minlength: 6
    },
    phone:{
        type: String,
        required: true,
        validate(phone){
            if(!validator.isMobilePhone(phone,'ar-EG')){
                throw new Error('phone is invalid')
            }
        }
    },
    tokens:[
        {
            type:String,
            required:true
        }
    ],
    
    avatar:{
        type:Buffer
    }

})

userSchema.virtual('tasks',{
    ref:'Task',   // model build realstionship 
    localField:'_id',   // 
    foreignField:'owner'
})


userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    // console.log(user)
    if(!user){
        throw new Error('No user found')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Password isn't correct")
    }
    return user
}


userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,8)
    }
    // this.password = await bcrypt.hash(this.password,8)
    next()
})

userSchema.methods.generateToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat(token)
    await user.save()

    return token
}

userSchema.methods.toJSON = function(){
    // document
    const user = this

    // Converts this document into a object
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject

}

const User = mongoose.model('User',userSchema)

module.exports = User