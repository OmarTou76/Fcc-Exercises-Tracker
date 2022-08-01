const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const mySecret = process.env.MY_DATA
mongoose.connect(mySecret)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const user = new mongoose.Schema({
  'username': {type: String, required: true}
})
const exercise = new mongoose.Schema({
  "userId": String,
  "date": Date,
  "duration": Number,
  "description": String
})

const Users = mongoose.model("Users", user)
const Exo = mongoose.model("Exo", exercise)

app.post("/api/users", (req, res) => {
  const data = {
    username: req.body.username
  }
  const newUser = new Users(data)
  newUser.save((err, result) => {
    if (err) throw err
    res.json(result)
  })
})
app.get("/api/users", (req, res) => {
  Users.find({}, (err, data) => {
    if (err) throw err
    res.json(data)
  })
})

app.post("/api/users/:_id/exercises", (req, res) => {
  Users.findById(req.params._id, (err, data) => {
    if (err) throw err
    console.log(data)
    const exo = {
      userId: req.params._id,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date ? new Date(req.body.date) ? new Date(req.body.date) : new Date() : new Date(),
    }
    console.log(exo)
    const newExo = new Exo(exo)

    newExo.save((err, result) => {
      if (err) throw err
      console.log(result)
      res.json({
        _id: result.userId,
        username: data.username,
        description: result.description,
        duration: result.duration,
        date: result.date.toDateString()
      })
    })
  })
})
//"_id":"62e7de7a1099fe0b9d8f3ed3","username":"a","count":2,"log":[{"description":"f","duration":3,"date":"Thu Mar 31 1994"},{"description":"f","duration":3,"date":"Thu Mar 31 1994"}]}
app.get("/api/users/:_id/logs", (req, res) => {
  const id = req.params._id
  let { from,  to, limit } = req.query

  !from ? from = new Date(1970) : from = new Date(from)
  !to ? to = new Date() : to = new Date(to)


  Users.findById(id, (err, data) => {
    if (err) throw err
    var search = Exo.find({"userId": id, "date": { $gt: from, $lt: to }})
    console.log(limit)
    limit ? search = search.limit(limit) : ""
    search.exec((err, result) => {
      if (err) throw err
      let obj = result.map(x => {
        let objet = {
          "date": new Date(x.date).toDateString(),
          "duration": x.duration,
          "description": x.description
        }
        return objet;
      })
      res.json({
        "_id": id,
        "username": data.username,
        "count": result.length,
        "log": obj
      })
    })
  })
})
/* route_path : '/user/:userId/book/:bookId'
actual_request_URL : '/user/546/book/6754'
req.params : {userId : '546', bookId : '6754'} */
/* You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back. */
/* GET /api/users/:_id/logs?[from][&to][&limit] */
/* app.get('/api/users/:_id/logs', (req, res) => {
  const { _id, from, to, limit } = req.query
  console.log(req.query)
  res.json({
    "id": _id,
    "from": from,
    "to": to,
    "limit": limit
  })
}) */


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
