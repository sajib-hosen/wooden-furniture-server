const express = require('express');
const app = express();
const port = process.env.PORT || 7000;
const  cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

//middleware =========================
app.use(cors());
app.use(express.json());

//mongoDB ============================
//user: wooden-furniture
//pass: 19xE3PRwwbJdOadM

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ez4m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
    try{
        // MongoDB connection=================
        await client.connect();
        const woodDB = client.db("wooden-furniture");
        const usersColl = woodDB.collection("users");
        const productsColl = woodDB.collection("products");
        const ordersColl = woodDB.collection("orders");

        // For Add Users ======================
        app.post("/users", async (req, res) =>{
            const newUser = req.body;
            const result = await usersColl.insertOne(newUser);
            res.json(result);
        })

        //
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersColl.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //For UPSERT (Role: admin)============= 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log("/users/admin")
            const filter = { email: user.email};
            const updateDoc = {$set: {role: "admin"}};
            const result = await usersColl.updateOne(filter, updateDoc);
            res.json(result)
   
        });
        
        //get if the user is admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersColl.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // For Add Product ====================
        app.post("/products", async (req, res) =>{
            const newProduct = req.body;
            const result = await productsColl.insertOne(newProduct);
            res.json(result);
        })

        // For Add Order ====================
        app.post("/orders", async (req, res) =>{
            const newOrder = req.body;
            const result = await ordersColl.insertOne(newOrder);
            res.json(result);
        })

        // For GET Orders ====================
        app.get("/orders", async (req, res) =>{
            const allOrders = ordersColl.find({});
            const orders = await allOrders.toArray();
            res.send(orders);
        })

        // For GET Product ====================
        app.get("/products", async (req, res) =>{
            const allProduct = productsColl.find({});
            const products = await allProduct.toArray();
            res.send(products);
        })

        // For GET Product (Single) ====================
        app.get("/products/:id", async (req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const product = await productsColl.findOne( query);
            res.send( product );
        })

        // Delete Products =============================
        app.delete("/products/:id", async(req, res) =>{
            const id = req.params.id;
            const quary = { _id: ObjectId(id)};
            const result = await productsColl.deleteOne(quary);
            res.json(result)
          })
        
        //Cancle Order =================================
        app.delete("/orders/:id", async(req, res) =>{
            const id = req.params.id;
            const quary = { _id: ObjectId(id)};
            const result = await ordersColl.deleteOne(quary);
            res.json(result)
          })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

// DB End ----------------------------

app.get("/",(req, res) =>{
    res.send("The Wooden Furniture Is Runing");
});

app.listen(port, () =>{
    console.log("server is running on:", port)
})