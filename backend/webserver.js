"use strict";
import * as database from "./database.js"
import {getRecipeURLs} from "./scraper.js"
import {scanReceipt} from "./receiptOCR.js"
import express from 'express';
import cors from 'cors';
import {fetchRecipes,cleanIngredientsOnly} from "./MatchreceiptToRecipes.js";
import { spawn } from 'child_process';
import jwt from 'jsonwebtoken';
database.connectToDB();
database.createTables(); //Create tables for database
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

//set the JWT secret
const JWT_SECRET = "57e1e7af0d0ad7e2d0f645f85a60abd75decd94700c93786db8ce28d99d35999"

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
app.post('/logIn', async (req, res) => {
    //Recieves user data
    const userName = req.body.u;
    const password = req.body.p;
    try {
    const success = await database.logIn(userName, password);//Layout: insertingredients("Rebecca", "mypassword")
    console.log("Login success:", success);
    if (success) {
        const token = jwt.sign({ userName }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    else {
        res.status(401).json({ error: "Invalid username or password" });
    }
    // .then(result => {
    //     res.end(result);
    // }) //commented out to stop error
    } catch(err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error during login" });
    }
    
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
            console.log("RESULT: " + JSON.stringify(result));
            res.json(result) //maybe this will fix loading the recipe
            })
            .catch(err => {
                console.error(err);
            });
})
app.post('/loadAllRecipeNames',(req,res)=>{
    console.log("Post req to load all received");
    database.getAllRecipeNames()
    .then(result =>{
        console.log("Result - All Recipe Names: ",(result));
        res.json(result);
    })
    .catch(err=> {
        console.error("Error on fetch all names",err);
    })
});
app.post('/getRecipesToDisplay',(req,res)=>{
    console.log("Post req Received");
    const ingr = req.body.ingredients;
    fetchRecipes(ingr)
    .then(result=> {
       // console.log("GetDisplayRecipes Result: ",result);
        res.json(result)
    })
    .catch(err => {
        console.error(err);
    })
})

app.post('/bookmarkRecipe',(req,res)=>{
    console.log("Bookmark req Received");
    const recipeName = req.body.RecipeName;
    const userName = req.body.UserName;
    database.bookmarkRecipeByName(userName,recipeName)
    .then(result=> {
       // console.log("GetDisplayRecipes Result: ",result);
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
        console.log("Trying to scan)");
        const lines = result.split("\n").filter((line) => line.trim() !== ""); // Split text into lines & remove empty ones
        let cleanedIngr =cleanIngredientsOnly(lines)
                //res.end(result);
                //res.end(cleanedIngr);
                res.json(cleanedIngr);
            })
            .catch(err => {
                console.error(err);
            });
})

//Handle Post request on /translate
//This is used to translate any text sent in

app.post('/translate', (req, res) => {
    //Recieves user data
    const input =req.body.i //Input language
    const flang=req.body.f //First langauge (probs english) = 'en'
    const slang=req.body.s //Second language (What we translate to) = 'fr' , 'gr' etc
    new Promise((resolve, reject) => {
        const py = spawn('python3', ['translator_code.py']);
    
        let data=''
        py.stdout.on('data', (chunk) => {
        data += chunk.toString();
        });
    
        py.stderr.on('data', (err) => {
        console.error('Error:', err.toString());
        });
    
        py.on('close', () => {
        const result = JSON.parse(data);
        console.log(result);
        res.json(result);
        resolve(result);
        });
    
        py.stdin.write(JSON.stringify({ input, flang, slang }));
        py.stdin.end();
    });
});

app.post('/checkToken', (req, res) => { //validate a jwt token and return the user's name and statistics
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.log("JWT VERIFICATION ERROR: ");
                console.log(err);
            }
            let recipeCount = await database.fetchCookedStatistic(decoded.userName)
            console.log("WEBSERVER has recieved this for count: " + recipeCount)
            res.json({ userName: decoded.userName, cookedStat: recipeCount });
        })
    }
});

app.post('/addCookedStatistic', (req, res) => { //validate a jwt token and add to that user's recipes cooked total
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log("JWT VERIFICATION ERROR: ");
                console.log(err);
            }
            else {
                database.addCookedStatistic(decoded.userName);
                res.json({ userName: decoded.userName });
            }
        })
    }
});

// Get Recommended Recipes for User based on saved recipes
app.get('/getRecommendations', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).send('Token required');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send('Invalid token');
        }

        const userId = decoded.userId;

        // Fetch recipes saved by the user
        const sql = `
            SELECT r.id, r.RecipeName FROM Recipe r
            JOIN UserRecipes ur ON r.id = ur.recipe_id
            WHERE ur.user_id = ?`;

        con.query(sql, [userId], function (err, result) {
            if (err) throw err;

            // This is a simplified recommendation approach — here we just return saved recipes
            res.json({ recommendations: result });
        });
    });
});