var amb
const express = require('express')
const redis = require('ioredis')
const path = require('path')
let cors = require('cors')

const app=express()
const port = 8383
console.log(__dirname);
console.log(path.join(__dirname,"/public"));
const staticPath = path.join(__dirname,"/public")
app.use(express.static(staticPath))

app.use(cors())
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
    next(); 
})


const password = "NZ5CaYKiyD08ITMfToscbcx3sJqQkKXD"
var url = `redis://default:${password}@redis-10983.c299.asia-northeast1-1.gce.cloud.redislabs.com:10983`
const redisClient = redis.createClient({host:'redis-10983.c299.asia-northeast1-1.gce.cloud.redislabs.com',port:10983,username:'default',password:password});

redisClient.on('error',(error) => {
  console.log('Redis connection error :', error);
})

  async function db_get_wp() {
    amb = await redisClient.get("ambulanceOne")
    console.log(amb)
  }
  setInterval(db_get_wp,3000);

app.get('/',(req,res) => {
  // res.status(200).send(wp)
  console.log(amb)
    res.status(200).send(amb)
})




app.listen(port,() => console.log(`Server started on port ${port}`))

