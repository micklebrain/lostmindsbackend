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
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();

            response = await client.db("todo").collection("todo").find({}).toArray().then(doc => res.json({ doc }));
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

r.get('/todos', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();

            response = await client
                .db("personal")
                .collection("todos")
                .find({})
                .sort({ order: 1, _id: 1 })
                .toArray()
                .then(doc => res.json({ doc }));
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

r.post('/todos', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const name =
                req.body && typeof req.body.name === 'string'
                    ? req.body.name.trim()
                    : '';
            if (!name) {
                res.status(400).json({ error: 'Todo name is required' });
                return;
            }

            const rawTags = Array.isArray(req.body && req.body.tags)
                ? req.body.tags
                : [];
            const tags = rawTags
                .map((tag) => String(tag).trim().toLowerCase())
                .filter((tag) => tag.length > 0);

            const lastTodo = await client
                .db("personal")
                .collection("todos")
                .find({})
                .sort({ order: -1, _id: -1 })
                .limit(1)
                .next();

            const lastOrder =
                lastTodo && Number.isInteger(lastTodo.order)
                    ? lastTodo.order
                    : -1;
            const nextOrder = lastOrder + 1;

            const insertDoc = {
                name,
                isCompleted: false,
                tags,
                order: nextOrder,
            };

            const result = await client
                .db("personal")
                .collection("todos")
                .insertOne(insertDoc);

            res.json({
                id: result.insertedId.toString(),
                todo: {
                    ...insertDoc,
                    _id: result.insertedId.toString(),
                },
            });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to create todo' });
    });
});

r.get('/hourOrder', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const doc = await client
                .db("personal")
                .collection("timehack")
                .findOne({ _id: "hourOrder" });

            res.json({ order: doc && Array.isArray(doc.order) ? doc.order : null });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to load hour order' });
    });
});

r.post('/hourOrder', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const order = Array.isArray(req.body && req.body.order)
                ? req.body.order
                : null;

            if (
                !order ||
                order.length !== 24 ||
                !order.every((h) => Number.isInteger(h) && h >= 0 && h < 24)
            ) {
                res.status(400).json({ error: 'Invalid hour order' });
                return;
            }

            const result = await client
                .db("personal")
                .collection("timehack")
                .updateOne(
                    { _id: "hourOrder" },
                    { $set: { order } },
                    { upsert: true }
                );

            res.json({ updated: result.modifiedCount || result.upsertedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to save hour order' });
    });
});

r.get('/hourTasks', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const doc = await client
                .db("personal")
                .collection("timehack")
                .findOne({ _id: "hourTasks" });

            res.json({ tasks: doc && doc.tasks ? doc.tasks : {} });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to load hour tasks' });
    });
});

r.get('/hourTags', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const doc = await client
                .db("personal")
                .collection("timehack")
                .findOne({ _id: "hourTags" });

            res.json({ tags: doc && doc.tags ? doc.tags : {} });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to load hour tags' });
    });
});

r.post('/hourTasks/:hour', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const hour = Number(req.params.hour);
            if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
                res.status(400).json({ error: 'Invalid hour' });
                return;
            }

            const text =
                req.body && typeof req.body.text === 'string'
                    ? req.body.text
                    : '';

            const update = {
                $set: {
                    [`tasks.${hour}`]: text,
                },
            };

            const result = await client
                .db("personal")
                .collection("timehack")
                .updateOne({ _id: "hourTasks" }, update, { upsert: true });

            res.json({ updated: result.modifiedCount || result.upsertedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to save hour task' });
    });
});

r.post('/hourTags/:hour', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const hour = Number(req.params.hour);
            if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
                res.status(400).json({ error: 'Invalid hour' });
                return;
            }

            const rawTags = Array.isArray(req.body && req.body.tags)
                ? req.body.tags
                : [];
            const tags = rawTags
                .map((tag) => String(tag).trim().toLowerCase())
                .filter((tag) => tag.length > 0);

            const update = {
                $set: {
                    [`tags.${hour}`]: tags,
                },
            };

            const result = await client
                .db("personal")
                .collection("timehack")
                .updateOne({ _id: "hourTags" }, update, { upsert: true });

            res.json({ updated: result.modifiedCount || result.upsertedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to save hour tags' });
    });
});

r.get('/datedTasks', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const doc = await client
                .db("personal")
                .collection("timehack")
                .findOne({ _id: "datedTasks" });

            res.json({ tasks: doc && doc.tasks ? doc.tasks : {} });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to load dated tasks' });
    });
});

r.post('/datedTasks', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const tasks = req.body && req.body.tasks;
            if (!tasks || typeof tasks !== 'object') {
                res.status(400).json({ error: 'Invalid tasks payload' });
                return;
            }

            const result = await client
                .db("personal")
                .collection("timehack")
                .updateOne(
                    { _id: "datedTasks" },
                    { $set: { tasks } },
                    { upsert: true }
                );

            res.json({ updated: result.modifiedCount || result.upsertedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to save dated tasks' });
    });
});

r.post('/datedTasks/:date/:hour', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const date = String(req.params.date || '');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                res.status(400).json({ error: 'Invalid date' });
                return;
            }

            const hour = Number(req.params.hour);
            if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
                res.status(400).json({ error: 'Invalid hour' });
                return;
            }

            const text =
                req.body && typeof req.body.text === 'string'
                    ? req.body.text
                    : '';
            const order =
                req.body && typeof req.body.order === 'number'
                    ? req.body.order
                    : null;
            const rawTags = Array.isArray(req.body && req.body.tags)
                ? req.body.tags
                : [];
            const tags = rawTags
                .map((tag) => String(tag).trim().toLowerCase())
                .filter((tag) => tag.length > 0);

            const task = { text, tags };
            if (order !== null && Number.isFinite(order)) {
                task.order = order;
            }

            const update = {
                $set: {
                    [`tasks.${date}.${hour}`]: task,
                },
            };

            const result = await client
                .db("personal")
                .collection("timehack")
                .updateOne({ _id: "datedTasks" }, update, { upsert: true });

            res.json({ updated: result.modifiedCount || result.upsertedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to save dated task tags' });
    });
});

r.post('/todos/reset', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const updateDoc = {
                $set: { isCompleted: false },
            };

            const result = await client
                .db("personal")
                .collection("todos")
                .updateMany({}, updateDoc);

            res.json({ updatedCount: result.modifiedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to reset todos' });
    });
});

r.post('/todos/:id/complete', (req, res) => {
    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const id = req.params.id;
            let filter;
            try {
                filter = { _id: new ObjectId(id) };
            } catch (e) {
                res.status(400).json({ error: 'Invalid todo id' });
                return;
            }

            const updateDoc = {
                $set: { isCompleted: true },
            };

            const result = await client
                .db("personal")
                .collection("todos")
                .updateOne(filter, updateDoc);

            res.json({ updatedCount: result.modifiedCount });
        } finally {
            await client.close();
        }
    };

	    run().catch((error) => {
	        console.error(error);
	        res.status(500).json({ error: 'Failed to complete todo' });
	    });
	});

r.post('/todos/reorder', (req, res) => {
    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const ids = Array.isArray(req.body && req.body.ids)
                ? req.body.ids
                : null;

            if (!ids || ids.length === 0) {
                res.status(400).json({ error: 'Invalid ids array' });
                return;
            }

            const operations = [];
            ids.forEach((id, index) => {
                try {
                    const objectId = new ObjectId(String(id));
                    operations.push({
                        updateOne: {
                            filter: { _id: objectId },
                            update: { $set: { order: index } },
                        },
                    });
                } catch (e) {
                    // skip invalid ids
                }
            });

            if (operations.length === 0) {
                res.status(400).json({ error: 'No valid todo ids provided' });
                return;
            }

            const result = await client
                .db("personal")
                .collection("todos")
                .bulkWrite(operations);

            res.json({ modifiedCount: result.modifiedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to reorder todos' });
    });
});

r.post('/todos/:id/incomplete', (req, res) => {
    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const id = req.params.id;
            let filter;
            try {
                filter = { _id: new ObjectId(id) };
            } catch (e) {
                res.status(400).json({ error: 'Invalid todo id' });
                return;
            }

            const updateDoc = {
                $set: { isCompleted: false },
            };

            const result = await client
                .db("personal")
                .collection("todos")
                .updateOne(filter, updateDoc);

            res.json({ updatedCount: result.modifiedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to uncomplete todo' });
    });
});

r.post('/todos/:id/tags', (req, res) => {
    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    const run = async () => {
        try {
            await client.connect();

            const id = req.params.id;
            let filter;
            try {
                filter = { _id: new ObjectId(id) };
            } catch (e) {
                res.status(400).json({ error: 'Invalid todo id' });
                return;
            }

            const rawTags = Array.isArray(req.body && req.body.tags)
                ? req.body.tags
                : [];
            const tags = rawTags
                .map((tag) => String(tag).trim().toLowerCase())
                .filter((tag) => tag.length > 0);

            const updateDoc = {
                $set: { tags },
            };

            const result = await client
                .db("personal")
                .collection("todos")
                .updateOne(filter, updateDoc);

            res.json({ updatedCount: result.modifiedCount });
        } finally {
            await client.close();
        }
    };

    run().catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Failed to update todo tags' });
    });
});

r.get('/streaks', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();

            response = await client.db("todo").collection("streaks").find({}).toArray().then(doc => res.json({ doc }));
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

r.get('/restartTasks', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();
            const updateDoc = {
                $set: {                    
                    isCompleted: false
                },
            };
            /* Set the upsert option to insert a document if no documents match
  the filter */
            const options = { upsert: true };
            response = await client.db("todo").collection("todo").updateMany({ isCompleted: true, isDaily: true }, updateDoc, options);
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

r.post('/completeTask/:taskName', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();
            const updateDoc = {
                $set: {
                    isCompleted: true
                },
            };            
            console.log('task name ' + req.params.taskName);
            response = await client.db("todo").collection("todo").updateOne({ task: req.params.taskName }, updateDoc);
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

r.post('/restartStreak/:name', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();
            const updateDoc = {
                $set: {
                    lastFailed: new Date()
                },
            };            
            console.log('task name ' + req.params.taskName);
            response = await client.db("todo").collection("streaks").updateOne({ name: req.params.name }, updateDoc);
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

r.post('/refillHearts/:name/:heartNumber', (req, res) => {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://betarose:avengers21@micklebrain.uimrt.mongodb.net/";
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    var response;

    const run = async () => {
        try {
            await client.connect();
            const updateDoc = {
                $set: {                    
                    hearts: req.params.heartNumber
                },
            };
            /* Set the upsert option to insert a document if no documents match
  the filter */
            const options = { upsert: true };
            response = await client.db("todo").collection("streaks").updateOne({ name: req.params.name }, updateDoc, options);
            console.log(response)
        }
        finally {
            await client.close();
            return response;
        }
    }

    run().catch(error => console.log)
});

// seperate routes for old API

r.get('/resturants/:city', (req, res) => {
    const { MongoClient } = require('mongodb');
    const uri = "mongodb+srv://whiterose:avengers21@micklebrain.uimrt.mongodb.net";
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
