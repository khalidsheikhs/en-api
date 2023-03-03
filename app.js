const express = require("express")
const cors = require("cors")

let app = express()

let allowedOrigins = [
    'http://localhost:3000',
    'http://yourapp.com'
]

let password = '123';

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
    .use(express.json())
    .use(express.urlencoded({extended:false}))

const PORT = process.env.PORT || 3001

let posts = [
    { "id": "1", "title": "abc abc abc"},
    { "id": "2", "title": "cde cde cde"}
]

let users = [
    { "id": "121", "name": "khalidsheikhs", "roles": ["2001"] },
    { "id": "122", "name": "naveedsheikhs", "roles": ["2004"] },
    { "id": "123", "name": "farhadsheikhs", "roles": ["2003"] }
]

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
})

app.get('/users', (req, res, next) => {
    // req.headers.token = token;
    res.json(users)
})

app.post('/auth', (req, res, next) => {
    let user = users.filter(user => (user.name === req.body.user && password === req.body.pwd))
    // user[0]['token'] = token
    res.json(user)
})

app.get('/posts', (req, res, next) => {
    res.json(posts)
})

app.get('/post', (req, res, next) => {
    let post = posts.filter(post => post.id === req.query.id)
    res.json(post)
})