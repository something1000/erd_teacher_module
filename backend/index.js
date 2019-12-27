
const express = require('express')
const routes = require('./routes')
const db = require('./db')
const config = require('./config/config.js')
const listEndpoints = require('express-list-endpoints')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser');

app.use(cors({
    origin: global.gConfig.frontend.address,
    credentials: true
}))
app.use(cookieParser())
app.use(routes)
app.use(morgan('short'))

app.use('/erd_images', express.static('erd_images'))
app.get("/test", (req, res) => {
    var xd = {firstName: "Stephen", lastName: "Curry"}
    var xd1 = {firstName: "Stephen", lastName: "Curry"}

    res.json([xd, xd1]);
})

app.listen(global.gConfig.node_port, () => {
    console.log("Server is up");
    console.log(listEndpoints(app))
})