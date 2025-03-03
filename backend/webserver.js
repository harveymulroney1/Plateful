"use strict";
import * as database from "./database.js"
import {getRecipeURLs} from "./scraper.js"
import {scanReceipt} from "./receiptOCR.js"
import express from 'express';
import cors from 'cors';

database.createTables(); //Create tables for database
getRecipeURLs(); //Add recipes to database

//New Express instance
const app = express();
app.use(express.json());
//Enable cors
app.use(cors());
//Server configurations
const hostname = '127.0.0.1';
const port = 3000;
//Listen on specified port and ip
app.listen(port,hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

//Handle Post request on /insert ingredient
//This is used to create an account/insert the ingredients the person has. When creating account just pass ingredients as ""
app.post('/insert', (req, res) => {
    //Recieves user data
    const ingredients= req.body.i;
    const userName = req.body.u;
    const password = req.body.p;
    database.insertIngredients(userName, ingredients, password) //Layout: insertingredients("Rebecca", ["Lettuce", "Tomato", "Mayo", "Basi"], "mypassword")
    res.end('Ingredients inserted');
})

//Handle Post request on /getName 
//This is used to get the Recipe names for all recipes the user has ingredients for
app.post('/getNames', (req, res) => {
    //Recieves user data
    const userName = req.body.u;
    const password = req.body.p;
    database.getRecipeNames(userName, password)
    .then(result => {
                res.end(result);
            })
            .catch(err => {
                console.error(err);
            });
})

//Handle Post request on /getRecipe
//This is used to get the Recipe method, ingredients and picture
app.post('/getRecipe', (req, res) => {
    //Recieves user data
    const name = req.body.n;
    database.getRecipe(name)
    .then(result => {
                res.end(result);
            })
            .catch(err => {
                console.error(err);
            });
})

//Handle Post request on /scan
//This is used to scan receipt
app.post('/scan', (req, res) => {
    //Recieves user data
    const img = req.body.i;
    scanReceipt(img)
    .then(result => {
                res.end(result);
            })
            .catch(err => {
                console.error(err);
            });
})


