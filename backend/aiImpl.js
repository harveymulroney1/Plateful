const Groq = require('groq-sdk');
const express = require('express');

const router = express.Router();

// Initialize Groq client with your API key
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function generateMealPlan(cuisine, calories, protein, carbs, fat) {
    try {
        const prompt = `Generate a detailed meal prep plan for 7 days with the following requirements:
        - Total daily calories: ${calories}
        - Protein: ${protein}g
        - Carbohydrates: ${carbs}g
        - Fat: ${fat}g
        Please provide 3 meals for each day with ingredients, macronutrients.
        Try and reuse meals made on previous days to minimize cooking time so they can batch cook e.g. Dinner is now lunch
        This user likes ${cuisine} cuisine please use that as inspiration.
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
                "type": "breakfast" | "lunch" | "dinner",
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
            Return the entire 7-day plan in one response.
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

// API endpoint for meal plan generation
router.post('/generate-meal-plan', async (req, res) => {
    try {
        const { cuisine, calories, protein, carbs, fat } = req.body;
        
        if (!cuisine || !calories || !protein || !carbs || !fat) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const mealPlan = await generateMealPlan(cuisine, calories, protein, carbs, fat);
        res.json({ mealPlan });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate meal plan' });
    }
});

module.exports = router;