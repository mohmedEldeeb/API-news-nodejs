const express = require('express')
require('dotenv').config()
const userRouter = require('./routers/reporter')
// const newsRouter = require('./routers/news')

require('./db/mongoose')


const app = express()
// midelware
app.use(express.json())

// Use Routes
app.use(userRouter)
// app.use(newsRouter)


const port = process.env.PORT 
app.listen(port,()=>{
    console.log(' Server connected good luck' );
})




