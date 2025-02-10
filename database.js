    var mysql = require('mysql2'); //Creates Database
    const {createhash} = require('crypto');

    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query("CREATE DATABASE IF NOT EXISTS PlatefulDB", function (err, result) {
        if (err) throw err;
        console.log("Plateful Database created/connected");
        
        });
    });


function createTables() //Creates Recipes, Ingredients and Stats tables
{
    con.query("USE PlatefulDB", function (err, result) {
        if (err) throw err;
        console.log("Using PlatefulDB");
    });

    var sql = "CREATE TABLE IF NOT EXISTS Recipe (RecipeName VARCHAR(255) PRIMARY KEY, Ingredients VARCHAR(1000), Method VARCHAR(5000))";
    con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table Recipe created");
    });

    var sql = "CREATE TABLE IF NOT EXISTS Account (UserName VARCHAR(255) PRIMARY KEY, Password VARCHAR(100), Salt VARCHAR(100))";
    con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table Account created");
    });

    var sql = "CREATE TABLE IF NOT EXISTS Ingredients (UserName VARCHAR(255) FOREIGN KEY, Ingredients VARCHAR(1000), Password VARCHAR(100) REFERENCES Account(AccountName))";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table Ingredients created");
        });

    var sql = "CREATE TABLE IF NOT EXISTS Statistics (UserName VARCHAR(255) PRIMARY KEY, Temp VARCHAR(255), Password VARCHAR(100) REFERENCES Account(AccountName))";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table Statistics created");
        });    
}

async function insertRecipes (recipeName, ingredients, method) //Insert recipeName(str), ingredients(str) e.g "Tomato, Basil, Apple" and method(str)
{    
    ingredients.sort(); //Sorts in alphebetical order

    var sql = "INSERT INTO Recipe (RecipeName, Ingredients, Method) VALUES ('"+recipeName+"', '"+ingredients+"', '"+method+"')";
    con.query(sql, function (err, result) {});
}

function getRecipeNames(userName, password) //Gets all recipes which contain only ingrediants the user has
{
    //Grabs the ingredients the user has.
    con.query("SELECT Ingredients FROM Ingredients WHERE UserName='"+userName+"' AND Password='"+password+"'", function (err, ingredients) {
        if (Array.isArray(ingredients) && ingredients.length!=0)
        {
         ingredients=JSON.stringify(ingredients[0]).replace("{\"Ingredients\":\"", "").replace("\"}",""); //Converts it to str

         ingredientList = ingredients.split(',').map(ingredient => ingredient.trim()); //converts to arr
         replaceQueryStart='';
         replaceQueryEnd='';
         for(let x in ingredientList) //Creates very long replace query layout= REPLACE(REPLACE(REPLACE(Ingredients, 'Tomato', ''), 'Basil', ''), 'Apple', '')
         {
            if (x>1)
            {
                replaceQueryStart=replaceQueryStart+'REPLACE(';
                replaceQueryEnd=replaceQueryEnd+', \','+ingredientList[x]+'\', \'\')';
            }
            else
            {
                replaceQueryStart=replaceQueryStart+'REPLACE(';
                replaceQueryEnd=replaceQueryEnd+', \''+ingredientList[x]+'\', \'\')';
            }
            
         }
         replaceQuery=replaceQueryStart+'Ingredients' + replaceQueryEnd +' AS Ingredients';
         likeQuery = ingredients.split(',').map(ingredient => '\'%' + ingredient.trim() + '%\'').join(' OR Ingredients LIKE '); //Creates Like query layout= '%Tomato%' OR Ingredients LIKE '%BASIL%' OR INGREDIENTS LIKE '%Apple%'
        }
            con.query("SELECT RecipeName, "+replaceQuery+ " FROM Recipe WHERE LENGTH(Ingredients LIKE"+likeQuery+")=1", function (err, result) {                
                return result.map(result => result.RecipeName); //Outputs name of all recipes which user can make
            });
        });

    
}

function getRecipe(recipeName) //Returns the recipes name, ingredients and method
{
    con.query("SELECT * FROM Recipe WHERE RecipeName='"+recipeName+"'", function (err, result) {                
        return result;
    });
}

function insertIngredients(userName, ingredients, password)
{
    ingredients=ingredients.sort();

    var sql ="SELECT Salt FROM Account WHERE UserName='"+userName+"'";
    con.query(sql, function (err, salt) {
        salt=JSON.stringify(result[0]).replace("{\"Salt\":\"", "").replace("\"}","");
        return null, salt;
    });

    password=password+salt//Salting
    password=createhash('sha256').update(password).digest('hex'); //Hashing

    var sql ="SELECT UserName FROM Account WHERE UserName='"+userName+"' AND Password='"+password+"'";
    con.query(sql, function (err, result) {
        
        if (result.length>=1)
        {
            result=JSON.stringify(result[0]).replace("{\"UserName\":\"", "").replace("\"}","");
        }
        if (result==userName)
        {
            var sql = "UPDATE Account SET UserName= '"+userName+"', Password='"+password+"'";
                con.query(sql, function (err, result) {
                if (err) throw err;
                });

            var sql = "UPDATE Ingredients SET UserName= '"+userName+"', Ingredients='"+ingredients+"', Password='"+password+"'";
                con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(userName +" record updated");
                });
        }
        else{
            salt=createhash.randomBytes(16); //Creating Salt
            password=password+salt //Salting
            password=createhash('sha256').update(password).digest('hex'); //Hashing

            var sql = "INSERT INTO Account (UserName, Password, Salt) VALUES ('"+userName+"', '"+password+"', '"+salt+"')";
                con.query(sql, function (err, result) {
                if (err) throw err;
                });

            var sql = "INSERT INTO Ingredients (UserName, Ingredients, Password) VALUES ('"+userName+"', '"+ingredients+"', '"+password+"')";
                con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                });
        }
    });
}

//Testing functions

//createTables();
//insertIngredients("John", ["Lettuce", "Tomato", "Mayo", "Basil"], "password")
//insertRecipes("Salad", ["Lettuce", "Tomato", "Mayo"], "Chop nicely");
//getRecipeNames("John", "password");
//getRecipe("Salad");
