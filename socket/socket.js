const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
require("colors")

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

let ONLINE_USERS = []
let TYPING = []
io.on("connection", socket => {
    console.log(`Client Connected ${socket.id}`.bgBlue);
    socket.on("disconnect", () => {
        console.log(`CLIENT DISCONNECTED ${socket.id}`.bgRed)
        ONLINE_USERS = ONLINE_USERS.filter(item => item.sid !== socket.id)
    })
})


module.exports = { app, server, io, ONLINE_USERS }