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

    // const mongoose = require('mongoose');

    // mongoose.connect('mongodb+srv://whiterose:avengers21@micklebrain.uimrt.mongodb.net/?retryWrites=true&w=majority&appName=micklebrain');
    // const database = mongoose.connection

    // database.on('error', (error) => {
    //     console.log(error)
    // })
    
    // database.once('connected', () => {
    //     console.log('Database Connected');
    // })

    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/?retryWrites=true&w=majority";
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        // Send a ping to confirm a successful connection
        // client.db("todo").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        client.close();
    }

    // const { MongoClient } = require('mongodb');
    // const uri = "mongodb+srv://whiterose:avengers21@micklebrain.uimrt.mongodb.net/?retryWrites=true&w=majority&appName=micklebrain";
    // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // client.connect(err => {
    //     console.log("error: " + err);
    //     var resturant = { name: "Obao" };
    //     client.db("test").collection("resturants").insertOne(resturant, function (err, res) {
    //         if (err) throw err;
    //         client.close();
    //     });
    // });
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

r.post('/createCustomer/:email', async (req, res) => {
    const customer = await stripe.customers.create({
        description: 'My First Test Customer (created for API docs)',
        email: req.params.email
    });
    res.json(customer);
});

r.post('/updatePayment/:customerId/:paymentIntent', async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.update(
        req.params.paymentIntent,
        { customer: req.params.customerId }
    );
    res.json(paymentIntent);
});

var nodemailer = require('nodemailer');

r.post('/sendemail', async (req, res) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bordersgone@gmail.com',
            pass: 'Avengers56'
        }
    });

    var mailOptions = {
        from: 'bordersgone@gmail.com',
        to: 'micklebrain@gmail.com',
        subject: 'Day trip order',
        text: 'That was easy!',
        html: "<div > <h1> Day trip in NYC </h1> <ul> <h1>Morning</h1> <h2>Breakfast</h2> <li>7am - Le Pain Quotidien</li><li>9am - Walk highline</li><li>11am - Chelsea Market</li><h1>Afternoon </h1> <h2>Lunch </h2> <li>12pm - Obao</li><li>2pm - Vessel</li><li>4pm - Empire State Building</li><h2>Dinner </h2> <li>6pm - Barn Joo NoMad</li><h2>Dessert </h2> <li>8pm - Venchi</li><h1>Nightlife</h1> <h2>Play </h2> <li>9pm Dave and Buster</li><h2>Drinks - Speakeasy</h2> <li>12am Dear Irving Gramercy</li><h2>Dance</h2> <li>2am Mission nightclub</li></ul> </div>"
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            res.json(new SuccessResponseObject('email sent'));
        }
    });
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

r.post('/test', async (req, res) => {
    const customer = await stripe.customers.create({
        email: 'michael@gmail.com',
        name: 'Michael Scott',
    });

    // const lineItem = await stripe.invoiceItems.create({ 
    //     customer: customer.id, 
    //     amount: 50000, 
    //     currency: 'usd', 
    // });

    const invoice = await stripe.invoices.create({
        // customer: customer.id,
        customer: 'cus_LhfTAOnACcF95C',
        pending_invoice_items_behavior: 'exclude',
        days_until_due: 7,
        collection_method: 'send_invoice'
    });

    const invoice_item = await stripe.invoiceItems.create({
        customer: 'cus_LhfTAOnACcF95C',
        invoice: invoice.id,
        price_data: {
            'currency': 'usd',
            'unit_amount': 5000,
            // 'tax_behavior': 'exclusive',
            'product': 'prod_LhUHNr233iT3nO'
        }
    })

    await stripe.invoices.sendInvoice(invoice.id);

    res.json(new SuccessResponseObject('invoice sent'));
});

r.get('/users/:email', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var email = '' + req.params.email
        client.db("test").collection("users").find({ email: "micklebrain@gmail.com" }).toArray().then(doc => res.json({ doc }));
    });
});

r.get('/userEvents/:email', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var email = '' + req.params.email
        client.db("test").collection("itinerary").find({ email: "nathanthainguyen@gmail.com" }).toArray().then(doc => res.json({ doc }));
        // client.db("test").collection("itinerary").find().toArray().then(doc => res.json({ doc }));
    });
});

r.post('/addEvent', async (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var event = {
            email: req.body.email,
            name: req.body.name,
            date: new Date(req.body.date),
            location: req.body.location
        };
        client.db("test").collection("itinerary").insertOne(event, function (err, res) {
            if (err) throw err;
            client.close();
        });
        res.json({ "happy": "test" });
    });
});

r.post('/addOrder', async (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var event = {
            email: req.body.email,
            venmo: req.body.venmo,
            amount: req.body.amount,
            orderId: req.body.orderId,
            status: 'unfullfilled'
        };
        client.db("test").collection("orders").insertOne(event, function (err, res) {
            if (err) throw err;
            client.close();
        });
        res.json({ "happy": "test" });
    });
});

r.get('/orders/:email', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@cluster0.uimrt.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(err => {
        console.log("error: " + err);
        var email = '' + req.params.email
        client.db("test").collection("orders").find({ email: email }).toArray().then(doc => res.json({ doc }));
    });
});

module.exports = r;
