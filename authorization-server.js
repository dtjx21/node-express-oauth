const url = require("url")
const fs = require("fs")
const express = require("express")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const {
	randomString,
	containsAll,
	decodeAuthCredentials,
	timeout,
} = require("./utils")

const config = {
	port: 9001,
	privateKey: fs.readFileSync("assets/private_key.pem"),

	clientId: "my-client",
	clientSecret: "zETqHgl0d7ThysUqPnaFuLOmG1E=",
	redirectUri: "http://localhost:9000/callback",

	authorizationEndpoint: "http://localhost:9001/authorize",
}

const clients = {
	"my-client": {
		name: "Sample Client",
		clientSecret: "zETqHgl0d7ThysUqPnaFuLOmG1E=",
		scopes: ["permission:name", "permission:date_of_birth"],
	},
	"test-client": {
		name: "Test Client",
		clientSecret: "TestSecret",
		scopes: ["permission:name"],
	},
}

const users = {
	user1: "password1",
	john: "appleseed",
}

const requests = {}
const authorizationCodes = {}

let state = ""

const app = express()
app.set("view engine", "ejs")
app.set("views", "assets/authorization-server")
app.use(timeout)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/*
Your code here
*/
app.get("/authorize", (req, res) => {
	// gets client ID from req object
	const client_ident = req.query.client_id
	// gets client object from clients array
	const client = clients[client_ident]

	if(!client){
		res.send(401);
		return;
	} else {
		//returns array of strings that are the permissions
		scopes = req.query.scope.split(" ")
			if(! containsAll(client.scopes, scopes)){
				res.send(401);
				return;
			}

			const req_id = randomString()
			requests[req_id] = req.query
			
			res.render("login", {
				client: client,
				scope: req.query.scope,
				requestId : req_id
			})
	}

})

app.post("/approve", (req, res) => {
	// get strings from request body
	const userName = req.body.userName;
	const password = req.body.password;
	const requestId = req.body.requestId;
	const clientReq = requests[requestId]

	if ((!userName || users[userName] !== password) || !requests[requestId]) {
		res.status(401).send("Error: user not authorized")
		return
	} else {
		delete(requests[requestId]);
		code = randomString()

		authorizationCodes[code] = {clientReq, userName}

		const redirectUri = url.parse(clientReq.redirect_uri)
	redirectUri.query = {
		code,
		state: clientReq.state,
	}
	res.redirect(url.format(redirectUri))
	}


});

const server = app.listen(config.port, "localhost", function () {
	var host = server.address().address
	var port = server.address().port
})

// for testing purposes

module.exports = { app, requests, authorizationCodes, server }
