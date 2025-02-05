const express = require('express')
const morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { rateLimit } = require('express-rate-limit')
const axios = require('axios')

const app = express()

const PORT = 3005

app.use(morgan('combined'))
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).

})

app.use(limiter)

app.get('/home', (req, res) => {
    return res.status(201).json({
        message: "OK"
    })
})

app.use('/bookingservice' ,async(req , res , next)=> {
    
    const token = req.headers['x-axis-token']
    try {
        const response =  await axios.get('http://localhost:3000/api/v1/isAuthenticated' , {
            headers : {
                'x-axis-token' : token
            }
        })
        console.log(response.data)
    } catch (error) {
        return res.status(401).json({
           "message" : "something went wrong"
        })
        
        
    }
    
    next()
}
)

const exampleProxy = createProxyMiddleware({
    target: 'http://localhost:3002/bookingservice/api/v1/booking/39', // target host with the same base path
    changeOrigin: true, // needed for virtual hosted sites
  });

app.use('/bookingservice', exampleProxy)
app.get('/home1' , (req , res) => {
    return res.json({
        "message" : "OK"
    })
})

const SetupAndStartServer = () => {

    app.listen(PORT, async () => {
        console.log(`Server Started on PORT : ${PORT}`)
    })
    
}

SetupAndStartServer()