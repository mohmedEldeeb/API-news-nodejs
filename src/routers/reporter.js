const express = require('express')
const auth = require('../middelware/auth')
const router = new express.Router()
const User = require('../models/reporter')

const uploads = require('../multer')

router.post('/signUp',async(req,res)=>{
    try{
        const user = new User(req.body)
        const token = await user.generateToken()
        await user.save()
        res.status(200).send({user,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

router.post('/login',async(req,res)=>{                                                                                                                                                          
    try{
        // console.log("start")
        // const user = new User(req.body)
        // console.log("good")
        // const token = await user.generateToken()    
        // console.log("genarat token")
        // await user.save()
        // console.log(user,token)

        // res.status(200).send({user,token})

        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()
        res.status(200).send({user,token})
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/usersProfile',auth,async(req,res)=>{
    try{
        res.status(200).send(req.user)
    }
    catch(e){
        res.status(404).send(e.message)
    }
  })

router.patch('/users/:id',auth,async(req,res)=>{
    const updata = Object.keys(req.body)
    const alloweUpdatas = ['name','age','phone','image','password']

    let isValid = updata.every((el)=>alloweUpdatas.includes(el))
     if(!isValid){
         return res.status(400).send("Can't updata plz, cheack your edit key")
     }

    try{    
        const id = req.params.id
        const user = await User.findById(id)
        if(!user){
            return res.status(404).send('No user is found')
        }
        updata.forEach((el)=>(user[el]=req.body[el]))
        await user.save()
        res.status(200).send(user)
    }
    catch(e){
        console.log(e.message);
    }
})

router.delete('/logout',async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.user.save()
        res.status(200).send('Logout successfully')

    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.delete('/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('Logout all success')
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.delete('/users/:id',auth, async(req,res)=>{
    try{
        const id = req.params.id
        const user = await User.findByIdAndDelete(id)
        if(!user){
            return res.status(404).send("user not found")
        }
        res.status(200).send("Delete Sucssfly")
    }
    catch(e){
        res.status(500).send(e)
    }
})




router.post('/profile/image',auth,uploads.single('avatar'),async(req,res)=>{
    try{
        req.user.avatar = req.file.buffer
        await req.user.save()
        res.status(200).send()
    }
    catch(e){
        res.status(400).send(e)
    }
})



module.exports = router
