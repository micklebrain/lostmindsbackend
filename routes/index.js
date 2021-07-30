const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
var cors = require('cors')

const r = Router();

// Resolve cors
r.use(cors())

// r.use('/demo', demo);
r.get('/demo', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var resturant = { name: "Obao"};
        client.db("test").collection("resturants").insertOne(resturant, function(err, res) {
            if (err) throw err;               
            client.close();
        });            
    });
});

r.get('/resturants', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        client.db("test").collection("resturants").find({ city: 'New York City' }).toArray().then(doc => res.json({doc}));           
    });
});


r.get('/', (req, res) => {
    res.json(new SuccessResponseObject('express vercel boiler plate'));
});

module.exports = r;
