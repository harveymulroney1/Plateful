import mysql from'mysql2'; //Creates Database
import createhash from 'crypto';

    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:""
    
    });

export function connectToDB()
{
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query("CREATE DATABASE IF NOT EXISTS PlatefulDB", function (err, result) {
        if (err) {throw err;}
        else {
            console.log("Plateful Database created/connected");
            createTables();
        }
        
        });
    });
}

export function createTables() //Creates Recipes, Ingredients and Stats tables
{
    con.query("USE PlatefulDB", function (err, result) {
        if (err) throw err;
        console.log("Using PlatefulDB");
        var sql = "CREATE TABLE IF NOT EXISTS Recipe (RecipeName VARCHAR(255) PRIMARY KEY, Ingredients VARCHAR(5000), Method VARCHAR(5000), Image Varchar(1000),Nutrition VARCHAR(1000))";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table Recipe created");
        });

        var sql = "CREATE TABLE IF NOT EXISTS Account (UserName VARCHAR(255) PRIMARY KEY, Password VARCHAR(100), Salt VARCHAR(100),Bookmarks VARCHAR(1000))";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table Account created");
        });

        var sql = "CREATE TABLE IF NOT EXISTS Ingredients (UserName VARCHAR(255) , Ingredients VARCHAR(1000), Password VARCHAR(100), FOREIGN KEY (UserName)REFERENCES Account(UserName))";
            con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table Ingredients created");
            });

        var sql = "CREATE TABLE IF NOT EXISTS Statistics (UserName VARCHAR(255) PRIMARY KEY, Temp VARCHAR(255), Password VARCHAR(100), FOREIGN KEY (UserName) REFERENCES Account(UserName))";
            con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table Statistics created");
            });    
    });
}

export async function insertRecipes (recipeName, ingredients, method, url,Nutrition) //Insert recipeName(str), ingredients(str) e.g "Tomato, Basil, Apple" and method(str)
{    
    ingredients.sort(); //Sorts in alphebetical order
    //const cleanedIngredients = ingredients.map(i => typeof i === 'string' ? i : i.name || '');
    //var sql = "INSERT INTO Recipe (RecipeName, Ingredients, Method) VALUES ('"+recipeName+"', '"+ingredients+"', '"+method+"','"+url+"')";
    //var sql = "INSERT INTO Recipe (RecipeName, Ingredients, Method, Image) VALUES (?,?,?,?)",[recipeName,ingredients,method,url]; '"+recipeName+"', '"+ingredients+"', '"+method+"'
    
    const imgURL = url || null;
    const cleanedIngredients = ingredients.map(i => 
        typeof i === 'string' ? i : i.ingredient || i.name || ''
      );
    console.log("Inserting recipe with values:");
    console.log("Name:", recipeName);
    console.log("Ingredients (before stringify):", ingredients);
    console.log("Method:", method);
    console.log("Image URL:", url);
    console.log("Nutrition:",Nutrition);
    console.log("Final Ingredients (stringified):", JSON.stringify(ingredients));
    console.log("Cleaned Ingr: ",cleanedIngredients);
    con.query(
        "INSERT INTO Recipe (RecipeName, Ingredients, Method, Image,Nutrition) VALUES (?,?,?,?,?)",[recipeName,JSON.stringify(cleanedIngredients),JSON.stringify(method),imgURL,JSON.stringify(Nutrition)], 
        function (err, result) {
        if (err) {
            console.log("Error inserting recipe: " + err + " recipe attempted: " + recipeName);
        }
        else {
            console.log("Recipe", recipeName, "inserted");
        }
    });
}

export function logIn(userName, password)
{
    return new Promise((resolve, reject) => {
        var sql = "SELECT Salt FROM Account WHERE UserName='" + userName + "'";
        con.query(sql, function (err, salt) {
            if (err) {
                return reject(err);
            }
            if (salt != undefined && salt.length >= 1) {
                salt = JSON.stringify(salt).replace("[{\"Salt\":\"", "").replace("\"}]", "");
                password = password + salt//Salting
                password = createhash.createHash('sha256').update(password).digest('hex'); //Hashing
                var sql = "SELECT UserName FROM Account WHERE UserName= '" + userName + "' AND Password= '" + password + "'";
                con.query(sql, function (err, result) {
                    if (result.length >= 1) {
                        result = JSON.stringify(result[0]).replace("{\"UserName\":\"", "").replace("\"}", "");
                        if (result == userName) {
                            console.log("Successful log in")
                            resolve(true);
                            return "Successful log in";
                        }
                    }
                    else {
                        console.log("Incorrect password")
                        resolve(false);
                        return "Incorrect password";
                    }
                    if (err) throw err;
                });
            }
        });
    });
}

export function getRecipeNames(userName, password) //Gets all recipes which contain only ingredients the user has
{
    return new Promise((resolve, reject) => {
    var sql ="SELECT Salt FROM Account WHERE UserName='"+userName+"'";
    con.query(sql, function (err, salt) {
            salt=JSON.stringify(salt).replace("[{\"Salt\":\"", "").replace("\"}]","");
            password=password+salt//Salting
            password=createhash.createHash('sha256').update(password).digest('hex'); //Hashing
    //Grabs the ingredients the user has.
    con.query("SELECT Ingredients FROM Ingredients WHERE UserName='"+userName+"' AND Password='"+password+"'", function (err, ingredients) {
        if (Array.isArray(ingredients) && ingredients.length!=0)
        {
         ingredients=JSON.stringify(ingredients[0]).replace("{\"Ingredients\":\"", "").replace("\"}",""); //Converts it to str

         ingredientList = ingredients.split(',').map(ingredient => ingredient.trim()); //converts to arr
         let replaceQueryStart='';
         let replaceQueryEnd='';
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
         let replaceQuery=replaceQueryStart+'Ingredients' + replaceQueryEnd +' AS Ingredients';
         likeQuery = ingredients.split(',').map(ingredient => '\'%' + ingredient.trim() + '%\'').join(' OR Ingredients LIKE '); //Creates Like query layout= '%Tomato%' OR Ingredients LIKE '%BASIL%' OR INGREDIENTS LIKE '%Apple%'
        
            con.query("SELECT RecipeName, "+replaceQuery+ " FROM Recipe WHERE LENGTH(Ingredients LIKE"+likeQuery+")=1", function (err, result) { 
                resolve(result.map(result => result.RecipeName)); //Outputs name of all recipes which user can make
            });
        }
        });
    });
});

}
export function getAllRecipeNames(){
    return new Promise((resolve,reject) => {
    con.query("SELECT RecipeName FROM Recipe",function(err,result){
        if (err){
            console.error("Error on DB fetch getAllName: ",err);
            reject(err);
        }
        else{
            console.log("Fetch all rec names from DB: ",result);
            const recipeNames = result;
            resolve(recipeNames);
        }
    }
    )
    });
}
export function selectBookmarksByName(userName){
    return new Promise((resolve, reject) => {
    con.query(
        "SELECT Bookmarks FROM Account WHERE UserName=(?)",[userName], function (err, result) {
            if (err) {
                reject(err);
            }
            else{
                console.log(`Selecting bookmarks for ${userName}`);
                const bookmarks = result[0]?.Bookmarks ?? "";
                resolve(bookmarks);
            }
        });
    });
}
export async function bookmarkRecipeByName(userName,recipeName)
{
    return new Promise((resolve,reject) => {
    const bookmarkList = [];
    selectBookmarksByName(userName)
        .then(result=>{
            console.log("Select result:",result);
            if(result.length>1){
                bookmarkList = result.split(",").map(b=>b.trim()); // puts into list & trims recipeName - csv it too
            }
            if(!bookmarkList.includes(recipeName)){
                bookmarkList.push(recipeName);
            }
            const updatedBookMarks = bookmarkList.join(", ");
            console.log(updatedBookMarks);
            con.query(
                "UPDATE Account SET Bookmarks = ? WHERE UserName = ?",[updatedBookMarks,userName], function (err, result) 
                {
                    if (err) reject(err);
                    console.log("1 record updated");
                });
        })
    });
}
export function getRecipe(recipeName) //Returns the recipes name, ingredients and method
{   
    console.log("Recipe name requested: " + recipeName)
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM Recipe WHERE RecipeName='"+recipeName+"'", function (err, result) {
            if (err) {
                reject(err);
            } else {
                //console.log("RESULT FROM database.js: " + JSON.stringify(result));
                if (!result) {
                    print("!result");
                }
                resolve(result); 
            }
        });
    });
}

export function insertIngredients(userName, ingredients, password)
{
    ingredients=ingredients.sort();

    var sql ="SELECT Salt FROM Account WHERE UserName='"+userName+"'";
    con.query(sql, function (err, salt) {
        if (salt!=undefined && salt.length>=1)
        {
            salt=JSON.stringify(salt).replace("{\"Salt\":\"", "").replace("\"}","");
            password=password+salt//Salting
            password=createhash.createHash('sha256').update(password).digest('hex'); //Hashing
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
                    });
        }
        });      
}
export function getXRecipes(limit,offset)
{
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM Recipe LIMIT ? OFFSET ?",[limit,offset], function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log("RESULT FROM database.js: " + result);
                if (!result || result.length === 0) {
                    print("No Recipes found");
                }
                resolve(result); 
            }
        });
    });
}
export function createAccount(userName, password)
{
    var ingredients=""
        
            var salt=createhash.randomBytes(16).toString('hex'); //Creating Salt
            password=password+salt //Salting
            password=createhash.createHash('sha256').update(password).digest('hex'); //Hashing
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


//Testing functions

//createAccount("Rebecca", "password");
//logIn("Rebecca", "password");
// insertIngredients("Rebecca", ["Lettuce", "Tomato", "Mayo", "Basi"], "password")
// insertRecipes("Salad", ["Lettuce", "Tomato", "Mayo"], "Chop nicely");

// getRecipeNames("Rebecca", "password")
// .then(result => {
//             console.log(result);
//         })
//         .catch(err => {
//             console.error(err);
//         });

// getRecipe("Salad")
//     .then(result => {
//         console.log(result);
//     })
//     .catch(err => {
//         console.error(err);
//     });
    