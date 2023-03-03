const express = require("express")
const cors = require("cors")

let app = express()

let allowedOrigins = ['http://localhost:3000',
    'http://yourapp.com']

app.use(cors({
    credentials: true,
    origin: function(origin, callback){
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true)
        if (allowedOrigins.indexOf(origin) === -1) {
            let msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.'
            return callback(new Error(msg), false)
        }
        return callback(null, true)
    }
}))

app.use(express.json())

const PORT = process.env.PORT || 3001

let posts = [{ "id": "1", "title": "abc abc abc"}, { "id": "2", "title": "cde cde cde"}]
let users = [{ "id": "121", "name": "khalidsheikhs", "password": "12345", "accessToken": "12345", "roles": ["2001"] }, { "id": "122", "name": "naveedsheikhs", "password": "12345", "accessToken": "12345", "roles": ["2004"] }]

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
})

app.post('/auth', (req, res, next) => {
    let user = users.filter(user => (user.name === req.body.user && user.password === req.body.pwd))
    res.json(user)
})

app.get('/posts', (req, res, next) => {
    res.json(posts)
})

app.get('/post', (req, res, next) => {
    let post = posts.filter(post => post.id === req.query.id)
    res.json(post)
})