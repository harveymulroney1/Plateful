"use strict";
import * as database from "./database.js"
import {getRecipeURLs} from "./scraper.js"
import {scanReceipt} from "./receiptOCR.js"
import express from 'express';
import cors from 'cors';
import {fetchRecipes} from "./MatchreceiptToRecipes.js";
database.connectToDB();
//database.createTables(); //Create tables for database
getRecipeURLs(); //Add recipes to database

//New Express instance
const app = express();
app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
//Enable cors
app.use(cors());
//Server configurations
const hostname = '127.0.0.1';
const port = 3000;
//Listen on specified port and ip
app.listen(port,hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

//Handle Post request on /createAccount
//This is used to create an account
app.post('/createAccount', (req, res) => {
    //Recieves user data
    const userName = req.body.u;
    const password = req.body.p;
    database.createAccount(userName, password) //Layout: insertingredients("Rebecca", "mypassword")
    res.end('Account created');

})

//Handle Post request on /logIn
//This is used to log into an account
app.post('/logIn', (req, res) => {
    //Recieves user data
    const userName = req.body.u;
    const password = req.body.p;
    database.logIn(userName, password) //Layout: insertingredients("Rebecca", "mypassword")
    // .then(result => {
    //     res.end(result);
    // }) //commented out to stop error
    // .catch(err => {
    //     console.error(err);
    // });
})

//Handle Post request on /insert ingredient
//To insert the ingredients the person has
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
            //res.end(result);
            console.log("RESULT: " + result);
            res.json(result) //maybe this will fix loading the recipe
            })
            .catch(err => {
                console.error(err);
            });
})

app.post('/getRecipesToDisplay',(req,res)=>{
    console.log("Post req Received");
    const ingr = req.body.ingredients;
    fetchRecipes(ingr)
    .then(result=> {
        console.log("GetDisplayRecipes Result: ",result);
        res.json(result)
    })
    .catch(err => {
        console.error(err);
    })
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


