import puppeteer from 'puppeteer';
import {insertRecipes} from './database.js';

//const { insertRecipes } = require('./database.js');

// Launch the browser and open a new blank page
//const browser = await puppeteer.launch();
//const page = await browser.newPage();
//await page.goto("https://www.bbcgoodfood.com/recipes/collection/cheap-eat-recipes")

async function scrapeIngrMethod(url) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url ,{waitUntil: 'domcontentloaded' } )
    await page.waitForSelector('h1');
    const recipeTitle = await page.evaluate(() =>{
        let titleElement =  document.querySelector('#__next > div.default-layout > main > div.post.recipe > section > div > div.post-header__body.oflow-x-hidden > div.headline.post-header__title.post-header__title--masthead-layout > h1')
        return titleElement ? titleElement.innerText.trim(): 'Title Not Found'
    })
    const ingredients = await page.evaluate(() => {
        const ingredientList = document.querySelectorAll('#ingredients-list section ul li'); 
        return Array.from(ingredientList).map(li => {
            const ingredient = Array.from(li.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'DIV'))
            .map(node => node.textContent.trim())
            .join(' ')
            //const ingredient = li.textContent.trim();
            //const quantity = li.childNodes[0]?.textContent.trim();
            //const ingredient = li.querySelector('a')?.textContent.trim();
            //return{quantity,ingredient}
            return {ingredient}
        });
    });
    const recipeImage = await page.evaluate(()=> {
        const imgElement = document.querySelector('#__next > div.default-layout > main > div.post.recipe > section > div > div.post-header__image-container > div > div > div > picture > img');
        return imgElement ? imgElement.src :null ;
    });
    const nutrition = await page.evaluate(()=>{
        const nutritionList = document.querySelectorAll('#__next > div.default-layout > main > div.post.recipe > div > div.layout-md-rail > div.layout-md-rail__primary > div.post__content > div:nth-child(2) > div > div > div.tabbed-list > div.tabbed-list__content > div.d-none > ul >li');
        
        return Array.from(nutritionList).map(li=>li.textContent.trim());
    });
    const method = await page.evaluate(()=> {
        const methodList = document.querySelectorAll('#__next > div.default-layout > main > div.post.recipe > div > div.layout-md-rail > div.layout-md-rail__primary > div.post__content > div:nth-child(2) > div > div > div.js-piano-recipe-method.col-12.pa-reset > section > ul>li')
        return Array.from(methodList).map(li=>li.textContent.trim());
    } )
    const cleanedIngredients = cleanIngredients(ingredients)
    //console.log({nutrition});
    // console.log({ ingredients });
    // //console.log({recipeImage});
    // console.log({ cleanedIngredients });
    // console.log(recipeTitle);
    // console.log(method);
    // console.log(nutrition);
    // console.log(recipeImage);
    insertRecipes(recipeTitle,ingredients, method, recipeImage); //Example: insertRecipes("Salad", ["Lettuce", "Tomato", "Mayo"], "Chop nicely", https://images.immediate.co.uk/production/volatile/sites/30/2020/08/sweetcorn-soup-f432263.jpg?quality=90&resize=440,400)
    browser.close();

}
function cleanIngredients(rawIngredients) {
    
    return rawIngredients.map(item => {
        const ingredient = item?.ingredient || '';

        //console.log({ingredient});
        // Remove quantity and descriptors using regex
        return ingredient
            .replace(/[^a-zA-Z\s]/g, '') // removes quantities
            .replace(/\b(?:tbsp|tsp|hot|cold|g|kg|ml|l|can|juice|frozen|½|¼|stalks|leaves|peeled|diced|halved|chopped|drained|toasted|stoned|peeled|and|cut|into|chunks|vine|on|the|crumbled|extra|virgin|shredded|cup|cups|ounce|ounces|oz|pound|pounds|lb|lbs|pinch|pinches|dash|dashes|handful|handfuls|quart|quarts|pint|pints|stick|sticks|sheet|sheets|slice|slices|wedge|wedges|piece|pieces|bottle|bottles|pack|packs|packet|packets|bag|bags|box|boxes|carton|cartons|tub|tubs|thumb-sized|bite-sized|chunky|thin|thick|whole|fine|finely|roughly|minced|grated|zested|mashed|crushed|sliced|thinly sliced|thickly sliced|julienned|shredded|ribboned|blanched|parboiled|steamed|roasted|grilled|fried|sauteed|boiled|baked|poached|marinated|pickled|toasted|lightly toasted|air-fried|deep-fried|fresh|freshly|dry|damp|moist|wet|soft|firm|optional|extra|as needed|to taste|room temperature|cold|warm|chilled|for dipping|for spreading|for serving|for layering|for brushing|lightly salted|packed in oil|packed in water|with skin|skinless|boneless|seedless|stemless)\b/gi, '')
            .trim();
    });
}

export async function getRecipeURLs()
{
    // Gets X recipes under filters - Dinner , <45min Cook Time , Easy & 4*/5*
    const recipeListPage =  'https://www.bbcgoodfood.com/search?tab=recipe&mealType=dinner&totalTime=lt-2700&difficulty=easy&ratings=gte-4%2Cgte-5'
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(recipeListPage)
    console.log("yep");
    await page.waitForSelector('a.link.d-block');
    const recipeURL = await page.evaluate(()=> {
        /*const recipeHref = document.querySelector('#__next > div.default-layout > main > div.search-page > div > div.fading-overlay > div > div.mb-md > div.layout-md-rail > div.layout-md-rail__primary > div:nth-child(2) > article > div.card__section.card__content > a')
        .getAttribute('href').replace('/','');
        return recipeHref;*/
        let links = Array.from(document.querySelectorAll('a.link.d-block'))
        .map(anchor => anchor.getAttribute('href'))
        .filter(href => href.startsWith('/recipes/')); // Ensure only valid recipe links
        return [...new Set (links)];
        //const firstRecipe = document.querySelector('a.link.d-block');
        //return firstRecipe ? firstRecipe.getAttribute('href') : null;
    }
    )
    console.log("Recipe URLs: "+ recipeURL);
    console.log("Count: "+ recipeURL.length);
    recipeURL.forEach(async url => {
        await scrapeIngrMethod(`https://www.bbcgoodfood.com${url}`,url)
        
    });
    //scrapeIngrMethod()
}
//scrapeIngrMethod("https://www.bbcgoodfood.com/recipes/sticky-chinese-chicken-traybake")
//scrapeIngrMethod("https://www.bbcgoodfood.com/recipes/tuna-avocado-quinoa-salad")
//getRecipeURLs()
//scrapeIngrMethod("https://www.bbcgoodfood.com/recipes/hot-sour-prawn-sweetcorn-soup")