
const express = import('express');

//const router = express.Router();
import Groq from "groq-sdk";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Groq client with your API key


export async function generateMealPlan(cuisine, calories, protein, carbs, fat) {
    try {
        const cuisinePreference = (cuisine?.length)
        ? `This user likes ${cuisine.Join(',')} cuisine, please use that as inspiration.`
        : 'This user has no specific cuisine preferences indicated.';
        const prompt = `Generate a detailed meal prep plan for 3 days with the following requirements:
        - Total daily calories: ${calories}
        - Protein: ${protein}g
        - Carbohydrates: ${carbs}g
        - Fat: ${fat}g
        Please provide 3 meals for each day with ingredients, macronutrients snacks are allowed too if fit well in calories - go for lower calorie options if not.
        Try and reuse meals made on previous days to minimize cooking time so they can batch cook e.g. Dinner is now lunch
        ${cuisinePreference}
        Output the result in **valid JSON** using the exact structure below:

            {
        "summary": {
            "cuisine": string,
            "daily_targets": { "calories": number, "protein": number, "carbs": number, "fat": number },
            "notes": string
        },
        "plan": [
            {
            "day": number,
            "meals": [
                {
                "type": "breakfast" | "lunch" | "dinner" | "snack",
                "name": string,
                "desc": string,
                "ingredients": string[],
                "macros": { "cal": number, "p": number, "c": number, "f": number },
                "reuse": boolean
                }
            ]
            }
        ],
        "shopping_list": string[]
        }

            Return **only** this JSON — no extra text or commentary.
            Return the entire 3-day plan in one response.
            Ensure the JSON is syntactically complete and valid.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: "llama-3.1-70b-versatile",
            temperature: 0.3,
            max_tokens: 8192,
        });

        return completion.choices[0]?.message?.content;
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
}

/*router.post('/generate-meal-plan', async (req, res) => {
    try {
        // Temporary: return dummy example
        const { cuisine, calories, protein, carbs, fat } = req.body;
        if (!cuisine || !calories || !protein || !carbs || !fat) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        res.json({ mealPlan: dummyExample });
        const { cuisine, calories, protein, carbs, fat } = req.body;
        


        const mealPlan = await generateMealPlan(cuisine, calories, protein, carbs, fat);
        res.json({ mealPlan });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate meal plan' });
    }
});*/
export const dummyExample = `{"summary":{"cuisine":"Italian & Asian","daily_targets":{"calories":"
c
a
l
o
r
i
e
s
"
,
"
p
r
o
t
e
i
n
"
:
"
calories","protein":"{protein}","carbs":"
c
a
r
b
s
"
,
"
f
a
t
"
:
"
carbs","fat":"{fat}"},"notes":"Batch cooking recommended. Reuse dinner as lunch."},"plan":[{"day":1,"meals":[{"type":"breakfast","name":"Italian Egg White Omelette","desc":"Egg whites with spinach, tomatoes, mozzarella","ingredients":["egg whites","spinach","cherry tomatoes","mozzarella","olive oil"],"macros":{"cal":"
c
a
l
1
b
"
,
"
p
"
:
"
cal1b","p":"{p1b}","c":"
c
1
b
"
,
"
f
"
:
"
c1b","f":"{f1b}"},"reuse":false},{"type":"lunch","name":"Asian Chicken Stir-Fry","desc":"Chicken breast with mixed veggies, soy sauce, ginger","ingredients":["chicken breast","broccoli","bell pepper","carrot","soy sauce","ginger","garlic"],"macros":{"cal":"
c
a
l
1
l
"
,
"
p
"
:
"
cal1l","p":"{p1l}","c":"
c
1
l
"
,
"
f
"
:
"
c1l","f":"{f1l}"},"reuse":false},{"type":"dinner","name":"Italian Baked Salmon with Pesto","desc":"Salmon fillet with basil pesto and roasted asparagus","ingredients":["salmon","basil pesto","asparagus","olive oil"],"macros":{"cal":"
c
a
l
1
d
"
,
"
p
"
:
"
cal1d","p":"{p1d}","c":"
c
1
d
"
,
"
f
"
:
"
c1d","f":"{f1d}"},"reuse":false}]},{"day":2,"meals":[{"type":"breakfast","name":"Asian Tofu Scramble","desc":"Silken tofu with turmeric, spinach, and mushrooms","ingredients":["silken tofu","turmeric","spinach","mushrooms","olive oil"],"macros":{"cal":"
c
a
l
2
b
"
,
"
p
"
:
"
cal2b","p":"{p2b}","c":"
c
2
b
"
,
"
f
"
:
"
c2b","f":"{f2b}"},"reuse":false},{"type":"lunch","name":"Italian Chicken Stir-Fry","desc":"Same as day1 lunch, reused","ingredients":["chicken breast","broccoli","bell pepper","carrot","soy sauce","ginger","garlic"],"macros":{"cal":"
c
a
l
2
l
"
,
"
p
"
:
"
cal2l","p":"{p2l}","c":"
c
2
l
"
,
"
f
"
:
"
c2l","f":"{f2l}"},"reuse":true},{"type":"dinner","name":"Italian Egg White Omelette","desc":"Same as day1 breakfast, reused","ingredients":["egg whites","spinach","cherry tomatoes","mozzarella","olive oil"],"macros":{"cal":"
c
a
l
2
d
"
,"p":"
cal2d","p":"{p2d}","c":"c2d","f":"
c2d","f":"{f2d}"},"reuse":true}]},{"day":3,"meals":[{"type":"breakfast","name":"Italian Avocado Toast","desc":"Whole grain toast with avocado, tomato, and feta","ingredients":["whole grain bread","avocado","tomato","feta","olive oil"],"macros":{"cal":"cal3b","p":"cal3b","p":"{p3b}","c":"c3b","f":
"c3b","f":"{f3b}"},"reuse":false},{"type":"lunch","name":"Asian Chicken Stir-Fry","desc":"Same as day1 lunch, reused","ingredients":["chicken breast","broccoli","bell pepper","carrot","soy sauce","ginger","garlic"],"macros":{"cal":"cal3l","p":"cal3l","p":"{p3l}","c":"c3l","f":"c3l","f":"{f3l}"},"reuse":true},{"type":"dinner","name":"Italian Baked Salmon with Pesto","desc":"Same as day1 dinner, reused","ingredients":["salmon","basil pesto","asparagus","olive oil"],"macros":{"cal":"cal3d","p":"cal3d","p":"{p3d}","c":"c3d","f":"
c3d","f":"{f3d}"},"reuse":true}]}],"shopping_list":["egg whites","spinach","cherry tomatoes","mozzarella","olive oil","chicken breast","broccoli","bell pepper","carrot","soy sauce","ginger","garlic","salmon","basil pesto","asparagus","silken tofu","turmeric","mushrooms","whole grain bread","avocado","tomato","feta"]}`

