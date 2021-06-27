const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');

const r = Router();

// r.use('/demo', demo);
r.use('/demo', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(client);
    client.connect(err => {
        console.log("error: " + err);
        console.log("Reading from collection");
        // const collection = client.db("test").collection("resturants");

        var resturant = { name: "Obao"};
        client.db("test").collection("resturants").insertOne(resturant, function(err, res) {
            if (err) throw err;               
            client.close();
        });            
    });
});

r.get('/', (req, res) => {
    res.json(new SuccessResponseObject('express vercel boiler plate'))
});

module.exports = r;
