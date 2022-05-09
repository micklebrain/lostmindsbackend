const { Router } = require('express');
const { SuccessResponseObject } = require('../common/http');
const demo = require('./demo.route');
var cors = require('cors')

const r = Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET);

require('dotenv').config();

// Resolve cors
r.use(cors())

r.get('/', (req, res) => {
    res.json(new SuccessResponseObject('express vercel boiler plate'));
});

// r.use('/demo', demo);
r.get('/demo', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var resturant = { name: "Obao" };
        client.db("test").collection("resturants").insertOne(resturant, function (err, res) {
            if (err) throw err;
            client.close();
        });
    });
});

r.get('/resturants/:city', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var city = '' + req.params.city
        client.db("test").collection("resturants").find({ city: city }).toArray().then(doc => res.json({ doc }));
    });
});

r.get('/neighborhoodresturants/:city', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var city = '' + req.params.city
        client.db("test").collection("topneighborhoodresturants").find({ city: city }).toArray().then(doc => res.json({ doc }));
    });
});

r.get('/events/:city', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var city = '' + req.params.city
        client.db("test").collection("events").find({ city: city }).toArray().then(doc => res.json({ doc }));
    });
});

r.get('/payment/:paymentintent', async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(
        req.params.paymentintent
    );
    // const paymentIntentJson = JSON.parse(paymentIntent)
    // console.log(paymentIntentJson['paid']);
    res.json(paymentIntent);
});

const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 100;
};

r.post('/create-payment-intent', async (req, res) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});



module.exports = r;
