import { createWorker } from 'tesseract.js';
import Fuse from 'fuse.js';
import { scrapeIngrMethod } from './scraper.js';
import {getXRecipes} from './database.js';

//const cleanedProducts = await receiptCleaningTest("../assets/receipts/aldiReceipt.jpeg");

async function receiptCleaningTest(imagePath){
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  await worker.terminate();
  const lines = ret.data.text.split("\n").filter((line) => line.trim() !== "");
  lines = extractProductNames(lines);
  console.log("Product Names: ", lines);
  return cleanIngredients(lines);

};

function cleanIngredients(rawIngredients) {

    console.log("Lines: ",rawIngredients);
  return rawIngredients.map(item => {
      const ingredient = item || '';

      // Remove quantity and descriptors using regex
      return ingredient
          .replace(/[^a-zA-Z\s]/g, '') // removes quantities
          .replace(/\b(?:tbsp|tsp|cooked|raw|brown|white|hot|cold|mild|spicy|g|kg|ml|l|can|juice|A|frozen|½|¼|stalks|leaves|peeled|diced|halved|chopped|drained|toasted|stoned|peeled|and|cut|into|chunks|vine|on|the|crumbled|extra|virgin|shredded|cup|cups|ounce|ounces|oz|pound|pounds|lb|lbs|pinch|pinches|dash|dashes|handful|handfuls|quart|quarts|pint|pints|stick|sticks|sheet|sheets|slice|slices|wedge|wedges|piece|pieces|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|carton|cartons|tub|tubs|thumb-sized|bite-sized|chunky|thin|thick|whole|fine|finely|roughly|minced|grated|zested|mashed|crushed|sliced|thinly sliced|thickly sliced|julienned|shredded|ribboned|blanched|parboiled|steamed|roasted|grilled|fried|sauteed|boiled|baked|poached|marinated|pickled|toasted|lightly toasted|air-fried|deep-fried|fresh|freshly|dry|damp|moist|wet|soft|firm|optional|extra|as needed|to taste|room temperature|cold|warm|chilled|for dipping|for spreading|for serving|for layering|for brushing|lightly salted|packed in oil|packed in water|with skin|skinless|boneless|seedless|stemless)\b/gi, '')
          .trim();
  })
  };

function removePantryItems(ingredients){
  const pantryItems = [
    "salt", "black pepper", "pepper", "olive oil", "vegetable oil", "cooking oil",
    "sunflower oil", "rapeseed oil", "oil", "butter", "vinegar", "balsamic vinegar",
    "soy sauce", "sugar", "brown sugar", "caster sugar", "flour", "plain flour",
    "self-raising flour", "baking powder", "baking soda", "cornflour", "yeast",
    "mustard", "ketchup", "mayonnaise", "hot sauce", "chilli flakes", "chili flakes",
    "garlic powder", "onion powder", "herbs", "mixed herbs", "dried herbs",
    "oregano", "basil", "thyme", "cumin", "coriander","chilli powder", "curry powder", "paprika",
    "smoked paprika", "bay leaf", "bay leaves", "stock cube", "stock cubes","honey","garlic","garlic cloves","ginger","turmeric"
  ];
  return ingredients.map(item => {
    const ingredient = item || '';

    //console.log({ingredient});
    // Remove quantity and descriptors using regex
    return ingredient
        
        .replace(/[^a-zA-Z\s]/g, '') // removes quantities
        .replace(/\b(?:tbsp|tsp|cooked|raw|spring|brown|white|hot|cold|mild|spicy|g|kg|ml|l|can|juice|A|frozen|½|¼|stalks|leaves|peeled|diced|halved|chopped|drained|toasted|stoned|peeled|and|cut|into|chunks|vine|on|the|crumbled|extra|virgin|shredded|cup|cups|ounce|ounces|oz|pound|pounds|lb|lbs|pinch|pinches|dash|dashes|handful|handfuls|quart|quarts|pint|pints|stick|sticks|sheet|sheets|slice|slices|wedge|wedges|piece|pieces|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|carton|cartons|tub|tubs|thumb-sized|bite-sized|chunky|thin|thick|whole|fine|finely|roughly|minced|grated|zested|mashed|crushed|sliced|thinly sliced|thickly sliced|julienned|shredded|ribboned|blanched|parboiled|steamed|roasted|grilled|fried|sauteed|boiled|baked|poached|marinated|pickled|toasted|lightly toasted|air-fried|deep-fried|fresh|freshly|dry|damp|moist|wet|soft|firm|optional|extra|as needed|to taste|room temperature|cold|warm|chilled|for dipping|for spreading|for serving|for layering|for brushing|lightly salted|packed in oil|packed in water|with skin|skinless|boneless|seedless|stemless)\b/gi, '')
        .trim();
})
  .filter(ingredient=>{
    return (
      ingredient.length>2 && !pantryItems.some(pantryItem=> ingredient.includes(pantryItem)) // removes seasoning etc -> checks if inside of this list
    )
  })}

const options = {
  includeScore: true,
  threshold: 0.25, // Adjust for leniency - should be 0.25
  keys: ["name"]
};


export async function fetchRecipes(receiptLines)
{
  try{

  
    const recipes = await getXRecipes(10,0);
    console.log("Received Recipes: ",recipes);

    const recipeChecks = recipes.map(async element => {
      const name = element.RecipeName;
      const ingredients = JSON.parse(element.Ingredients);
      const method = element.Method;
      const image = element.Image;
      const result = await findRecipeMatches(ingredients,receiptLines);
      console.log("result for: ",name, ": ",result);
      if(result===true){
        console.log("adding to suggestion");
        return [name,ingredients,method,image];
      }
      else{ return null;}

    })
    const resolved = await Promise.all(recipeChecks); // allows parrel processing of recipe matching.
    const recipesToSuggest = resolved.filter(r => r !=null); // removes null
    return recipesToSuggest;
  }
  catch (err){
    console.error("Error fetching recipes: ",err);
    return [];
  }
    /*await getXRecipes(10, 0)
    .then(recipes => {
        console.log("Received recipes:", recipes);
        recipes.forEach(async element => {
            const name = element.RecipeName;
            const ingredients = JSON.parse(element.Ingredients);
            const method = element.Method;
            const image = element.Image;
            const result = await findRecipeMatches(ingredients,receiptLines);
            console.log("result: ",result);

        });
    })
    .catch(err => {
        console.error("Error fetching recipes:", err);
    });
    
    return recipesToSuggest;*/

}

export function cleanIngredientsOnly(receiptLines){
  console.log("cleanIngredientsOnly received:", typeof receiptLines, receiptLines);
  let ingr = extractProductNames(receiptLines);
  const cleaned =  cleanIngredients(ingr); // cleaned ingredients
  return cleaned;
}

export async function findRecipeMatches(recipeToCheck,receiptLines)
{
    receiptLines = extractProductNames(receiptLines);
    console.log("Receipt Lines:",receiptLines);
    let cleanedReceiptLines = cleanIngredients(receiptLines);
  console.log("Cleaned Lines: ",cleanedReceiptLines);
  const recipe = removePantryItems(recipeToCheck);
  console.log("Recipe: ",recipe);
  
  const fuse = new Fuse(recipe.map(item=>({name:item})),options); // sets the fuzzy match with the recipe & options set
  const fuzzyMatches = [];

  const matchedRecipeItems = new Set(); // no duplicates
  for (const receiptItem of cleanedReceiptLines) {
    const receiptWords = receiptItem.split(" ").filter(word => word.length > 1); // split into words - to check e.g. basmati rice - checks basmati then rice
    let matched = false;
   
    for (const word of receiptWords) {
      const result = fuse.search(word);
      console.log("Word checking: ",word);
      if (result.length > 0 && !matchedRecipeItems.has(result[0].item.name) && word.length >= (result[0].item.name.length *0.65)) {
        console.log(`Checking "${word}" → Matched "${result[0].item.name}" (score: ${result[0].score})`); // debug
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
  console.log(((matchesCount/ingredientsCount) * 100)>30 ? "Suggest Recipe":"Don't suggest recipe");
  if (ingredientsCount === 0) return false;
  
  return ((matchesCount/ingredientsCount) * 100)>30 ;
  

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
          //const match = line.match(/^(.+?)\s+[\d,.]+$/);
          const match = line.match(/^\d*\s*([A-Z\s]+.*?)\s+[\d,.]+\s*[A-Z]?$/i);
          return match ? match[1].trim() : line;
      })
      .filter(product => product !== null); // Remove null values
}
//const recipeIngr = await scrapeIngrMethod("https://www.bbcgoodfood.com/recipes/easy-teriyaki-chicken");
//console.log(recipeIngr);
//findRecipeMatches(recipeIngr,cleanedProducts);
