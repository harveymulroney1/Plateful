import { createWorker } from 'tesseract.js';
import Fuse from 'fuse.js';
import { scrapeIngrMethod } from './scraper.js';

export async function processReceipt(imagePath){
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  await worker.terminate();
  return (ret.data.text);
};
const cleanedProducts = await receiptCleaningTest("../assets/receipts/aldiReceipt.jpeg");

export async function receiptCleaningTest(imagePath){
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  await worker.terminate();
  const lines = ret.data.text.split("\n").filter((line) => line.trim() !== "");
  console.log("Product Names: ", extractProductNames(lines));
  return cleanIngredients(lines);

};

function cleanIngredients(rawIngredients) {

    console.log("Lines: ",rawIngredients);
  return rawIngredients.map(item => {
      const ingredient = item || '';

      //console.log({ingredient});
      // Remove quantity and descriptors using regex
      return ingredient
          .replace(/[^a-zA-Z\s]/g, '') // removes quantities
          .replace(/\b(?:tbsp|tsp|cooked|raw|brown|white|hot|cold|mild|spicy|g|kg|ml|l|can|juice|A|frozen|½|¼|stalks|leaves|peeled|diced|halved|chopped|drained|toasted|stoned|peeled|and|cut|into|chunks|vine|on|the|crumbled|extra|virgin|shredded|cup|cups|ounce|ounces|oz|pound|pounds|lb|lbs|pinch|pinches|dash|dashes|handful|handfuls|quart|quarts|pint|pints|stick|sticks|sheet|sheets|slice|slices|wedge|wedges|piece|pieces|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|carton|cartons|tub|tubs|thumb-sized|bite-sized|chunky|thin|thick|whole|fine|finely|roughly|minced|grated|zested|mashed|crushed|sliced|thinly sliced|thickly sliced|julienned|shredded|ribboned|blanched|parboiled|steamed|roasted|grilled|fried|sauteed|boiled|baked|poached|marinated|pickled|toasted|lightly toasted|air-fried|deep-fried|fresh|freshly|dry|damp|moist|wet|soft|firm|optional|extra|as needed|to taste|room temperature|cold|warm|chilled|for dipping|for spreading|for serving|for layering|for brushing|lightly salted|packed in oil|packed in water|with skin|skinless|boneless|seedless|stemless)\b/gi, '')
          .trim();
  })
  };
  

//const Fuse = require('fuse.js');
function removePantryItems(ingredients){
  const pantryItems = [
    "salt", "black pepper", "pepper", "olive oil", "vegetable oil", "cooking oil",
    "sunflower oil", "rapeseed oil", "oil", "butter", "vinegar", "balsamic vinegar",
    "soy sauce", "sugar", "brown sugar", "caster sugar", "flour", "plain flour",
    "self-raising flour", "baking powder", "baking soda", "cornflour", "yeast",
    "mustard", "ketchup", "mayonnaise", "hot sauce", "chilli flakes", "chili flakes",
    "garlic powder", "onion powder", "herbs", "mixed herbs", "dried herbs",
    "oregano", "basil", "thyme", "cumin", "coriander","chilli powder", "curry powder", "paprika",
    "smoked paprika", "bay leaf", "bay leaves", "stock cube", "stock cubes","honey","garlic","garlic cloves","ginger"
  ];
  return ingredients.map(item => {
    const ingredient = item || '';

    //console.log({ingredient});
    // Remove quantity and descriptors using regex
    return ingredient
        
        .replace(/[^a-zA-Z\s]/g, '') // removes quantities
        .replace(/\b(?:tbsp|tsp|cooked|raw|brown|white|hot|cold|mild|spicy|g|kg|ml|l|can|juice|A|frozen|½|¼|stalks|leaves|peeled|diced|halved|chopped|drained|toasted|stoned|peeled|and|cut|into|chunks|vine|on|the|crumbled|extra|virgin|shredded|cup|cups|ounce|ounces|oz|pound|pounds|lb|lbs|pinch|pinches|dash|dashes|handful|handfuls|quart|quarts|pint|pints|stick|sticks|sheet|sheets|slice|slices|wedge|wedges|piece|pieces|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|carton|cartons|tub|tubs|thumb-sized|bite-sized|chunky|thin|thick|whole|fine|finely|roughly|minced|grated|zested|mashed|crushed|sliced|thinly sliced|thickly sliced|julienned|shredded|ribboned|blanched|parboiled|steamed|roasted|grilled|fried|sauteed|boiled|baked|poached|marinated|pickled|toasted|lightly toasted|air-fried|deep-fried|fresh|freshly|dry|damp|moist|wet|soft|firm|optional|extra|as needed|to taste|room temperature|cold|warm|chilled|for dipping|for spreading|for serving|for layering|for brushing|lightly salted|packed in oil|packed in water|with skin|skinless|boneless|seedless|stemless)\b/gi, '')
        .trim();
})
  .filter(ingredient=>{
    return (
      ingredient.length>2 && !pantryItems.some(pantryItem=> ingredient.includes(pantryItem)) // removes seasoning etc -> checks if inside of this list
    )
  })}

const options = {
  includeScore: true,
  threshold: 0.25, // Adjust for leniency
  keys: ["name"]
};

/*const foodItems = [
  "Beef Mince",
  "Chicken Breast",
  "Granola",
  "Baked Beans",
  "Greek Yogurt",
  "Smoked Salmon",
  "Basmati Rice",
  "Indian Paste",
  "Soft Cheese",
  "Bagels",
  "Bagels",
  "Milk",
  "Eggs",
  "Blueberries",
  "Raspberries",
  "Crispy Squares",
  "Cornflake Squares",
  "Wrigley's Extra Gum"
];*/
/* const foodItems = [
  // Meat & Poultry
  "Beef Mince", "Chicken Breast", "Chicken Thighs", "Whole Chicken", "Pork Chops", "Bacon", "Sausages", "Turkey Mince", "Lamb Mince",
  "Steak", "Duck Breast", "Ground Turkey", "Chicken Wings", "Chicken Drumsticks", "Pork Belly", "Ribs", "Ham", "Salami", "Chorizo",
  "Pepperoni", "Venison", "Goose", "Quail", "Rabbit", "Ox Tail", "Veal", "Lamb Chops", "Pork Shoulder", "Pork Tenderloin", "Liver",
  
  // Fish & Seafood
  "Salmon Fillet", "Tuna Steak", "Cod Fillet", "Haddock", "Sea Bass", "Prawns", "Shrimp", "Scallops", "Mussels", "Lobster", "Crab",
  "Squid", "Oysters", "Anchovies", "Sardines", "Smoked Salmon", "Trout", "Mackerel", "Clams", "Octopus", "Caviar", "Tilapia",
  "Red Snapper", "Herring", "Catfish", "Swordfish", "Eel", "Halibut", "Plaice", "Pollock",

  // Dairy & Eggs
  "Soft Cheese","Milk", "Semi Skimmed Milk", "Full Fat Milk", "Almond Milk", "Oat Milk", "Soy Milk", "Yogurt", "Greek Yogurt", "Butter", "Salted Butter",
  "Unsalted Butter", "Cheddar Cheese", "Mozzarella", "Parmesan", "Feta Cheese", "Brie", "Camembert", "Blue Cheese", "Goat Cheese",
  "Cottage Cheese", "Ricotta", "Mascarpone", "Cream Cheese", "Halloumi", "Double Cream", "Single Cream", "Sour Cream", "Crème Fraîche",
  "Eggs", "Eggs Medium", "Eggs Large", "Free Range Eggs", "Quail Eggs", "Duck Eggs",

  // Fresh Vegetables
  "Carrots", "Broccoli", "Cauliflower", "Cabbage", "Lettuce", "Iceberg Lettuce", "Romaine Lettuce", "Spinach", "Kale", "Rocket",
  "Spring Onions", "Leeks", "Onions", "Red Onions", "Shallots", "Garlic", "Potatoes", "Sweet Potatoes", "Butternut Squash", "Pumpkin",
  "Courgette", "Aubergine", "Cucumber", "Tomatoes", "Cherry Tomatoes", "Bell Peppers", "Chilli Peppers", "Radishes", "Celery",
  "Green Beans", "Peas", "Brussels Sprouts", "Asparagus", "Corn", "Artichokes", "Beetroot", "Fennel", "Okra", "Mushrooms",
  "Chestnut Mushrooms", "Portobello Mushrooms", "Shiitake Mushrooms", "Enoki Mushrooms", "Oyster Mushrooms",

  // Fresh Fruits
  "Apples", "Bananas", "Pears", "Oranges", "Lemons", "Limes", "Grapefruit", "Pineapple", "Mango", "Peaches", "Plums", "Cherries",
  "Strawberries", "Raspberries", "Blueberries", "Blackberries", "Grapes", "Melon", "Watermelon", "Kiwi", "Pomegranate", "Figs",
  "Coconut", "Dates", "Papaya", "Passion Fruit", "Avocado", "Cranberries",

  // Dry Goods & Pantry Staples
  "Rice", "Basmati Rice", "Brown Rice", "Jasmine Rice", "Wild Rice", "Quinoa", "Couscous", "Polenta", "Oats", "Porridge Oats",
  "Flour", "Plain Flour", "Self-Raising Flour", "Corn Flour", "Wholemeal Flour", "Sugar", "Brown Sugar", "Cane Sugar", "Icing Sugar",
  "Honey", "Maple Syrup", "Golden Syrup", "Molasses", "Yeast", "Baking Powder", "Baking Soda", "Cornstarch",

  // Pasta & Noodles
  "Spaghetti", "Penne", "Fusilli", "Tagliatelle", "Lasagne Sheets", "Macaroni", "Ravioli", "Tortellini", "Udon Noodles", "Rice Noodles",
  "Egg Noodles", "Ramen Noodles", "Soba Noodles",

  // Canned & Jarred Foods
  "Chopped Tomatoes", "Tomato Purée", "Baked Beans", "Black Beans", "Kidney Beans", "Chickpeas", "Lentils", "Olives", "Pickles",
  "Gherkins", "Capers", "Sundried Tomatoes", "Pesto", "Soy Sauce", "Fish Sauce", "Coconut Milk", "Canned Tuna", "Canned Salmon",
  "Canned Sardines", "Canned Corn", "Canned Pineapple",

  // Herbs & Spices
  "Salt", "Black Pepper", "Paprika", "Smoked Paprika", "Cumin", "Coriander", "Cinnamon", "Nutmeg", "Cloves", "Allspice", "Ginger",
  "Turmeric", "Chili Powder", "Cayenne Pepper", "Oregano", "Basil", "Rosemary", "Thyme", "Sage", "Bay Leaves", "Dill", "Parsley",
  "Chives", "Tarragon", "Curry Powder", "Garam Masala", "Fennel Seeds", "Caraway Seeds", "Star Anise", "Cardamom",

  // Oils & Condiments
  "Olive Oil", "Extra Virgin Olive Oil", "Vegetable Oil", "Sunflower Oil", "Rapeseed Oil", "Sesame Oil", "Coconut Oil", "Butter",
  "Mayonnaise", "Ketchup", "Mustard", "Soy Sauce", "Fish Sauce", "Worcestershire Sauce", "Vinegar", "Balsamic Vinegar",
  "Apple Cider Vinegar", "Rice Vinegar", "Hot Sauce", "Sriracha", "BBQ Sauce",

  // Breads & Bakery
  "White Bread", "Wholemeal Bread", "Sourdough", "Baguette", "Ciabatta", "Pita Bread", "Naan Bread", "Tortillas", "Crumpets",
  "English Muffins", "Bagels", "Brioche", "Croissants",

  // Snacks & Cereals
  "Cornflakes", "Weetabix", "Granola", "Muesli", "Rice Krispies", "Porridge Oats", "Chocolate", "Dark Chocolate", "Milk Chocolate",
  "Peanut Butter", "Almond Butter", "Hummus", "Popcorn", "Crisps", "Biscuits", "Crackers",

  // Drinks
  "Coffee", "Instant Coffee", "Ground Coffee", "Tea", "Green Tea", "Black Tea", "Herbal Tea", "Hot Chocolate", "Orange Juice",
  "Apple Juice", "Cranberry Juice", "Lemonade", "Cola", "Tonic Water", "Sparkling Water"
]; */


//const fuse = new Fuse(foodItems.map(item=>({name:item})),options);

/*const fuzzyMatches = cleanedProducts.map(product => {
  const result = fuse.search(product);
  //return result[0];
  
  return result.length ? result[0].item.name : product
});*/

function findRecipeMatches(recipeToCheck,cleanedReceiptLines)
{
  console.log("Cleaned Lines: ",cleanedReceiptLines);
  const recipe = removePantryItems(recipeToCheck);
  console.log("Recipe: ",recipe);
  
  const fuse = new Fuse(recipe.map(item=>({name:item})),options); // sets the fuzzy match with the recipe & options set
  const fuzzyMatches = [];
  /*const fuzzyMatches = cleanedReceiptLines.map(product=>{
    const result = fuse.search(product);

    return result.length ? result[0].item.name : null;
  }); */
  const matchedRecipeItems = new Set();
  for (const receiptItem of cleanedReceiptLines) {
    const receiptWords = receiptItem.split(" ").filter(word => word.length > 1); // split into words
    let matched = false;
   
    for (const word of receiptWords) {
      const result = fuse.search(word);
      if(result.length>0)
      {
        console.log(`Checking "${word}" → Matched "${result[0].item.name}" (score: ${result[0].score})`);
      }

      if (result.length > 0 && !matchedRecipeItems.has(result[0].item.name)) {
        fuzzyMatches.push(result[0].item.name); // match found
        matchedRecipeItems.add(result[0].item.name);
        matched = true;
        break; // stop once one word matches
      }
    }

    if (!matched) {
      fuzzyMatches.push(null); // no match
    }
  }
  let matchesCount = fuzzyMatches.filter(match=>match!=null).length
  let ingredientsCount = recipe.length;
  console.log("Matches: ",fuzzyMatches);
  console.log("Matches Count: ",matchesCount);
  console.log(((matchesCount/ingredientsCount) * 100)>20 ? "Suggest Recipe":"Don't suggest recipe");
  console.log("Original Receipt Lines",);

}
function extractProductNames(receiptLines) {
  return receiptLines
      .map(line => line.trim())  // Remove extra spaces
      .filter(line => {
          // Remove lines that contain unwanted information
          return !line.match(/total|subtotal|vat|tax|change|card|cash|transaction|date|time|receipt|store|order|amount|balance|payment|reference|approved|declined/i);
      })
      .map(line => {
          // Extract only the product name
          const match = line.match(/^(.+?)\s+[\d,.]+$/);
          return match ? match[1].trim() : null;
      })
      .filter(product => product !== null); // Remove null values
}
const recipeIngr = await scrapeIngrMethod("https://www.bbcgoodfood.com/recipes/chinese-chicken-curry");
console.log(recipeIngr);
findRecipeMatches(recipeIngr,cleanedProducts);
