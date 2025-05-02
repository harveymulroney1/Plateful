import mysql from'mysql2'; //Creates Database
import createhash from 'crypto';
import { json } from 'stream/consumers';

    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"",
    database: "PlatefulDB",
    
    });

    con.on('error', (err) => {
        console.error('MySQL connection error event:', err);
    });
    
    con.on('end', () => {
        console.warn('MySQL connection ended.');
    });
    
    con.on('close', () => {
        console.warn('MySQL connection closed.');
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
        var sql = "CREATE TABLE IF NOT EXISTS Recipe (" +
                  "id INT AUTO_INCREMENT PRIMARY KEY, " +  
                  "RecipeName VARCHAR(255) UNIQUE, " + 
                  "Ingredients VARCHAR(5000), " + 
                  "Method VARCHAR(5000), " + 
                  "Image VARCHAR(1000), " + 
                  "Nutrition VARCHAR(1000), " +
                  "Keywords VARCHAR(1000))";
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

        var sql = "CREATE TABLE IF NOT EXISTS Statistics (UserName VARCHAR(255) PRIMARY KEY, Temp VARCHAR(255), Cooked INT, FOREIGN KEY (UserName) REFERENCES Account(UserName))";
            con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table Statistics created");
            });    
            createUsersTable();
            createUserRecipesTable();
    });
}

export async function insertRecipes (recipeName, ingredients, method, url,Nutrition, Keywords) //Insert recipeName(str), ingredients(str) e.g "Tomato, Basil, Apple" and method(str)
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
    console.log("Keywords:", Keywords, JSON.stringify(Keywords));
    console.log("Cleaned Ingr: ",cleanedIngredients);
    con.query(
        "INSERT INTO Recipe (RecipeName, Ingredients, Method, Image, Nutrition, Keywords) VALUES (?,?,?,?,?,?)",
        [
            recipeName,
            JSON.stringify(cleanedIngredients),
            JSON.stringify(method),
            imgURL,
            JSON.stringify(Nutrition),
            JSON.stringify(Keywords)
        ],        
        function (err, result) {
        if (err) {
            console.log("Error inserting recipe: " + err + " recipe attempted: " + recipeName);
        }
        else {
            console.log("Recipe", recipeName, "inserted");
        }
    });
}

export function logIn(userName, password) {
    return new Promise((resolve, reject) => {
        const sqlSalt = "SELECT Salt FROM Account WHERE UserName = ?";
        con.query(sqlSalt, [userName], (err, saltResult) => {
            if (err) {
                console.error("Error fetching salt:", err);
                return reject(err);
            }

            if (!saltResult || saltResult.length === 0) {
                console.log("No user found");
                return resolve(false);
            }

            const salt = saltResult[0].Salt;
            const hashedPassword = createhash
                .createHash('sha256')
                .update(password + salt)
                .digest('hex');

            const sqlLogin = "SELECT UserName FROM Account WHERE UserName = ? AND Password = ?";
            con.query(sqlLogin, [userName, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error during login check:", err);
                    return reject(err);
                }

                if (result.length > 0 && result[0].UserName === userName) {
                    console.log(" Successful login for", userName);
                    return resolve(true);
                } else {
                    console.log(" Incorrect password for", userName);
                    return resolve(false);
                }
            });
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
export async function bookmarkRecipeByName(userName, recipeName) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id FROM Recipe WHERE RecipeName = ?";
        con.query(sql, [recipeName], function (err, result) {
            if (err) {
                reject(err);
            } else {
                const recipeId = result[0]?.id;
                if (recipeId) {
                    // Find the user_id based on the userName
                    const sqlUser = "SELECT id FROM Users WHERE username = ?";
                    con.query(sqlUser, [userName], function (err, userResult) {
                        if (err) {
                            reject(err);
                        } else {
                            const userId = userResult[0]?.id;
                            if (userId) {
                                // Insert into UserRecipes
                                const sqlInsert = "INSERT INTO UserRecipes (user_id, recipe_id) VALUES (?, ?)";
                                con.query(sqlInsert, [userId, recipeId], function (err, insertResult) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(insertResult);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
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

export function keywordSearch(keyword) {
    console.log("Keyword requested: " + keyword);
    return new Promise((resolve, reject) => {
        // Ensure the database is selected
        con.query("USE PlatefulDB", function (err) {
            if (err) {
                console.error("Error selecting database:", err);
                reject(err);
                return;
            }
            console.log("Database selected successfully");

            // Perform the keyword search
            con.query("SELECT * FROM Recipe WHERE Keywords='" + keyword + "'", function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    if (!result) {
                        console.log("No results found for keyword:", keyword);
                    }
                    resolve(result);
                }
            });
        });
    });
}
<<<<<<< HEAD

export function addCookedStatistic(userName) {
    con.query("SELECT * FROM Statistics WHERE UserName = '" + userName + "'", function (err, result) {
        if (err) {
            console.log("Error updating statistics: ");
            console.log(err);
        }
        else if (result) {
            if (result.length == 0) {
                con.query("INSERT INTO Statistics (UserName, Temp, Cooked) VALUES (?, ?, ?)", [userName, '0', 0]);
            }
            con.query("UPDATE Statistics SET Cooked = Cooked + 1 WHERE UserName = '" + userName + "'");
            console.log("Statistics update run");
        }
    });
}

export function fetchCookedStatistic(userName) {
    return new Promise((resolve, reject) => {
        con.query("SELECT Cooked FROM Statistics WHERE UserName = ?", [userName], function (err, result) {
            if (err) {
                console.log("Error fetching statistics:", err);
                resolve(0); // fallback to 0 if error occurs
            }
            else if (result.length === 0) {
                console.log("No statistics found for user:", userName);
                resolve(0);
            }
            else {
                console.log("Fetched Cooked stat:", result[0].Cooked);
                resolve(result[0].Cooked);
            }
        });
    });
}
// Testing keywordSearch
=======
>>>>>>> e3b66ca (start of the recommendation stuff)

function createUsersTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
    `;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Users table created!");
    });
}

function createUserRecipesTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS UserRecipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recipe_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(id),
        FOREIGN KEY (recipe_id) REFERENCES Recipe(id)
    );
    `;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("UserRecipes table created!");
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
    