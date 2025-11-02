import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button,Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, ImageBackground, Dimensions, Touchable } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSnackbar } from "./snackbar";
import Recipe from './recipe';
import axios from "axios";
import { MealCard } from '@/components/MealCard';
import { DayPlan } from '@/components/DayPlan';
export default function shoppingList()
{
   type Recipe = {
    recipeName: string;
    img: string;
    ingredients:string[];
    keywords: string[];
  }
  const [caloriesSelected,setCaloriesSelected] = useState("2000");
  const [proteinSelected,setProteinSelected] = useState("");
  const [carbsSelected,setCarbsSelected] = useState("");
  const [fatsSelected,setFatsSelected] = useState("");
  const [cuisinesSelected,setcuisinesSelected] = useState([]);
  const dummyDayPlan = {
    breakfast: {
      mealName: "Oatmeal with Berries",
      calories: 350,
      mealType: "Breakfast",
      protein: 10,
    },
    lunch: {
      mealName: "Grilled Chicken Salad",
      calories: 600, 
      mealType: "Lunch",
      protein: 45,
    },
    dinner: {
      mealName: "Salmon with Quinoa",
      calories: 700,
      mealType: "Dinner",
      protein: 50,
    },
    snacks: {
      mealName: "Greek Yogurt with Honey",
      calories: 200,
      mealType: "Snack",
      protein: 15,
    },
    dayIndex: 1,
  };
  type ItemProps = { title: string; img?:string; keywords?:string[]; onPress: () => void };
  const mealPlan = (()=>{
    axios.post("/getMealPlan",
      // cuisine needs doing but its an array
      {calories:caloriesSelected,protein:proteinSelected,carbs:carbsSelected,fat:fatsSelected}
    )
    .then(response=>{
      // response
      console.log("Meal Plan Received - parsing now");
    })
    .catch(err=>{
      console.error("Error on AI meal Plan",err);
      showError("Failed to create meal plan");
    })
  })
  const [index,setIndex] = useState(0); 
  const Item = ({ title, img, keywords, onPress }: ItemProps) => (
      <TouchableOpacity onPress={onPress} style={styles.item}>
          <ImageBackground
              source={img ? { uri: img } : require('../assets/images/food-image.png')}
              style={styles.foodImage}
              imageStyle={{ borderRadius: 12 }}
          >
              <View style={styles.textContainer}>
                  <Text style={styles.recipeTitle}>{title}</Text>
                  <View style={styles.labelsContainer}>
                      {Array.isArray(keywords) && keywords.slice(0, 10).map((kw, index) => (
                          <TouchableOpacity key={index} style={styles.label}>
                              <Text style={styles.labelText}>{kw}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>
              </View>
          </ImageBackground>
      </TouchableOpacity>
  );
    const [inputText, setInputText] = useState('');
    const { showError } = useSnackbar();
    const [shoppingList,setShoppingList] = useState<string[]>([]); 
    const [recipesToAdd, setRecipesToAdd] = useState<Recipe[]>([]); // list of recipes to add to the shopping list - User Added
    const [selectedFilters,setSelectedFilters] = useState<string[]>([]);
    const [BuildComplete,setBuildComplete] = useState(Boolean);
    //const [filteredRecipes,setFilteredRecipes]= useState<Recipe[]>([]);
    const cuisineFilters = ["Chinese", "Italian", "Indian", "Thai", "Mexican", "American", "Mediterranean"];
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredR, setFilteredR] = useState<Recipe[]>([]);
    const updateIngredient = (text:string, index: number) => {
    const updated = [...shoppingList];
    updated[index] = text;
    setShoppingList(updated);
    
  };
  const [showOverlay, setShowOverlay] = useState(false);
    
  function editFilters(filter:string)
  {
    if(!selectedFilters.includes(filter)) // not already.
    {
      setSelectedFilters([...selectedFilters,filter]);
      
    }
    else
    {
      // remove this new filter
      setSelectedFilters(selectedFilters.filter(i=> i!==filter));
      
    }
  }
  function fetchingDisplayRecipes()
  {
    axios.post<Recipe[]>('http://127.0.0.1:3000/exploreRecipesToDisplay')
      .then( response => {
          const cleaned = response.data.map((recipe: Recipe) => ({
            recipeName:recipe.recipeName,
            img:recipe.img,
            keywords: cleanKeywords(recipe.keywords),
            ingredients:recipe.ingredients
        }));
        console.log("Response from Display Recipes: ",cleaned);
        setRecipes(cleaned);
      }
      
        
      )
      .catch(err=>{
        console.error("Error on getting recipes for shopping list: ",err);
      })
  }
      const cleanKeywords = (keywords: any): string[] => {
        if (Array.isArray(keywords)) {
            return keywords.map((k: any) => (typeof k === "string" ? k.trim() : String(k).trim()));
        } else if (typeof keywords === "string") {
            return keywords
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0);
        } else {
            return [];
        }
    };
    function removeIngredient(index:number)
    {
    const updated = [...shoppingList];
    const x = updated.splice(index,1);
    setShoppingList(updated);
    console.log("Removed elem: ",x);
    }
    const populateShoppingList = () => {
      // loop through recipes selected and add the ingredients to the list
      // Need to connect the ingredients together - multiple recipes using chicken
      
      // FOR NOW JUST BASIC POPULATE
      
      recipesToAdd.forEach(element => {
        
        //setShoppingList([shoppingList,element.ingredients])
        shoppingList.push(...element.ingredients)
        
      });
      console.log(shoppingList);
      setRecipesToAdd([]); // clear recipes to add
    }
    const handleAddItem = () => {
        if (inputText.trim()) {
        setShoppingList([...shoppingList, inputText.trim()]);
        setInputText("");
        }
        else {
            showError("Please enter an ingredient.");
        }
    }
    function nextItem() {
      console.log("index:", index, "recipes.length:", filteredR.length);
        if (index < filteredR.length -1) {
            setIndex(index + 1);
            console.log(index);
        } else {
            // remove overlay and show shopping list
            setBuildComplete(true);

            
        }
    }
    
    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    }
    function addRecipe () {
      console.log("added recipe");
      //setRecipesToAdd([...recipesToAdd,recipes[index]]); // adds the recipe selected at this index
      console.log("Recipe Adding:",filteredR[index]);
      setRecipesToAdd(prev => {
          const updated = [...prev,filteredR[index]]; 
          
          if (index < filteredR.length -1) {
          setIndex(prev=>prev + 1);
          
          } else {
            setBuildComplete(true);
          // remove overlay and show shopping list
            
          }

          return updated;

      });// adds the recipe selected at this index
      

    }
    useEffect(()=>{
      if(BuildComplete){
        populateShoppingList();
        toggleOverlay();
        setBuildComplete(false);
      }

    },[BuildComplete])
/*     useEffect(()=>{
      nextItem();
    },[recipesToAdd]) */
    useEffect(() => {
  if (filteredR[index]) {
    console.log("Now showing:", filteredR[index].recipeName);
  }
}, [index]);
    useEffect(()=> {

      const lowerSelectedFilters = selectedFilters.map(item=>item.toLowerCase());
      console.log("Selected Filters:",lowerSelectedFilters);
      setFilteredR(recipes.filter(rec=>rec.keywords.some(item=>lowerSelectedFilters.includes(item))));
    },[selectedFilters,index] 
    )
    function filterRecipes (){
      const lowerSelectedFilters = selectedFilters.map(item=>item.toLowerCase());
      console.log("Selected Filters:",lowerSelectedFilters);
      setFilteredR(recipes.filter(rec=>rec.keywords.some(item=>lowerSelectedFilters.includes(item))));
    }
    useEffect(()=>
    {
      fetchingDisplayRecipes();
    },[])
    return (
      
        <>
        <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>

        <Text style={styles.header}>Meal Plan Builder</Text>

        {/* <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} /> */}
        {/* <CustomButton theme="primary" label="Upload Receipt" onPress={pickImageAsync} /> */}
        
        <View style={styles.inputContainer}>
            <TouchableOpacity onPress={handleAddItem}>
            <Ionicons name="add" size={20} color="gray" style={styles.inputIcon} />
            </TouchableOpacity>
            <TextInput
            style={styles.inputBox}
            value={inputText}
            onChangeText={(inputText) => setInputText(inputText)}
            onSubmitEditing={handleAddItem}
            placeholder="Enter ingredient"
            placeholderTextColor="#999"
            returnKeyType="done"
            />
        </View>
        <View>      
           {cuisineFilters.map((filter: string, index: number) => ( 
          <TouchableOpacity onPress = {()=>editFilters(filter)} style={selectedFilters.includes(filter) ? styles.selectedFilterBtn : styles.filterNormBtn }>
            <Text style={selectedFilters.includes(filter) ? styles.selectedFilterText : styles.filterNormText}>{filter}</Text>
          </TouchableOpacity>))}
        </View>
        <View>
          <Text>Calories</Text>
          <TextInput
            value={caloriesSelected}
            placeholder='2000'
            defaultValue='2000'
            inputMode='numeric'
            onChangeText={(caloriesSelected)=>setCaloriesSelected(caloriesSelected)}
          />
        </View>
        <Text>Carbohydrates</Text>
        <View style={styles.proteinContainer}>
          
          <TextInput
          value={carbsSelected}
          style={styles.input}
          inputMode='numeric'
          placeholder={String(Math.round(Number(caloriesSelected)*.45 / 4))}
          defaultValue={String(Math.round(Number(caloriesSelected)*.45 / 4))}
          onChangeText={(carbsSelected)=>setCarbsSelected(carbsSelected)}
          />
          <Text style={styles.unit}>g</Text>
        </View>
        <Text>Protein</Text>
        <View style={styles.proteinContainer}>
          
          <TextInput
          value={proteinSelected}
          style={styles.input}
          inputMode='numeric'
          placeholder={String(Math.round(Number(caloriesSelected)*.30 / 4))}
          defaultValue={String(Math.round(Number(caloriesSelected)*.30 / 4))}
          onChangeText={(proteinSelected)=>setProteinSelected(proteinSelected)}
          />
          <Text style={styles.unit}>g</Text>
        </View>
        <Text>Fats</Text>
        <View style={styles.proteinContainer}>
          
          <TextInput
          value={fatsSelected}
          style={styles.input}
          inputMode='numeric'
          placeholder={String(Math.round(Number(caloriesSelected)*.25 / 9))}
          defaultValue={String(Math.round(Number(caloriesSelected)*.25 / 9))}
          onChangeText={(fatsSelected)=>setFatsSelected(fatsSelected)}
          />
          <Text style={styles.unit}>g</Text>
        </View>
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.button, styles.selectedButton]}
                onPress={() => setShoppingList([])} // Clear List
            >
                <Text style={styles.buttonText}>Clear Ingredients</Text>
            </TouchableOpacity>
        </View>
                <TouchableOpacity
            style={styles.selectedButton}
            onPress={toggleOverlay}>
              <Text style={styles.buttonText}>Build Meal Plan!</Text>
            
        </TouchableOpacity>
        
        <FlatList
            data={shoppingList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
            <View style={styles.ingredientItem}>
                <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButton}>
                <Ionicons name="remove" size={20} color="gray" />
                </TouchableOpacity>
                <TextInput
                value={item}
                onChangeText={(item) => updateIngredient(item, index)}
                />
            </View>
            )}
        />
        <View style={styles.dayPlanContainer}>
          <DayPlan {...dummyDayPlan}/>
          {dummyDayPlan.dayIndex = 2}
          <DayPlan {...dummyDayPlan}/>
          {dummyDayPlan.dayIndex = 3}
          <DayPlan {...dummyDayPlan}/>
        </View>

        {/* <MealCard mealName={"Spaghetti Bolognaise"} calories={2400} mealType={"Dinner"} protein={60}/> */}
        

        </ScrollView>
        {showOverlay && (
          
        <View style={styles.overlay}>

                <ScrollView contentContainerStyle={{ paddingBottom: 550 }}>
                  
                  {index < filteredR.length ? (
                    
                    <Item
                    title={filteredR[index].recipeName}
                    img={filteredR[index].img}
                    keywords={filteredR[index].keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1))}
                    onPress={() => {}}
                    />
                  ): <Text>No more recipes to show!</Text>}


                  


                  <View style={styles.confirmationBtnContainer}>
                  <TouchableOpacity style={styles.greenYesButton} onPress={() => addRecipe()}><Ionicons name="checkmark" size={50}/></TouchableOpacity>
                  <TouchableOpacity style={styles.redNoButton} onPress={ ()=> nextItem()}><Ionicons name="close" size={50}/></TouchableOpacity>  {/* move onto next recipe */}
                  </View>
                </ScrollView>
                
              </View>
              )}
        
        
        <View style={styles.footerHeader}>
        <TouchableOpacity onPress={() => router.push("/")} style={styles.footerIconLeft}>
            <Ionicons name="arrow-back" size={20} color="#333333" />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        
        </View>
    </>
    );
    }

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    flex:1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 0,
    zIndex: 1000,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  overlayTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FAFAFC',
  }, 
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFC",
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign:'center',
    marginTop: 10,
    marginBottom: 20,
    color: "#333333",
    fontFamily: "System",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FAFAFC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  inputIcon: {
    marginLeft: 3,
    marginRight: 3,
  },
  inputBox: {
    flex: 1,
    height: 40,
    fontFamily: "System",
    color: "#333333",
    borderWidth: 1,
    borderColor: "#FAFAFC",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  button: {
      backgroundColor: '#FAFAFC',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%',
  },
  selectedButton: {
      backgroundColor: '#FA6163',
  },
  buttonText: {
      fontSize: 14,
      color: 'white',
      fontWeight: 'bold',
      fontFamily: 'System',
  },
  findRecipesButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  findRecipesButton: {
    backgroundColor: '#FA6163',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  findRecipesButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  title: {
    fontSize: 20,
  },
  ingredientItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F0F0F0", // Light gray background
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  
  removeButton: {
    paddingRight: 10,
  },

    // STYLES FOR RECIPE TILES

    item: {
      height: 350,
      marginBottom: 20,
      
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      justifyContent: 'center',
      backgroundColor: "#FAFAFC",
    },
    foodImage: {
        flex: 1,
        justifyContent: 'flex-end',
        
    },
    textContainer: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FAFAFC',
        marginBottom: 8,
    },
    labelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    label: {
        backgroundColor: "#FA6163",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginTop: 4,
    },
    labelText: {
        color: "white",
        fontSize: 10,
    },
    proteinContainer:{
      flexDirection:'row',
      width:'10%',
      justifyContent:'flex-start',
      alignItems:'center',
      paddingHorizontal:5,
      borderRadius:8,
    },
    dayPlanContainer:{
      flexDirection:'column',
      justifyContent:'space-between',
      marginTop:20,
      marginBottom:20,
    },
    input:{
      flex:1,
    },
    unit:{
      marginLeft:2,
    },
    confirmationBtnContainer:{
      position:'absolute',
      bottom:100,
      marginBottom:150,
      flexDirection:'row',
      justifyContent:'space-between',
      
      width:'80%',
      alignSelf:'center'
    },
    greenYesButton:{
      borderRadius:75,
      backgroundColor:"green",
      width:150,
      height:150,
      
      justifyContent: 'center',
      alignItems: 'center',

    },
    redNoButton:{
      borderRadius:75,
      backgroundColor:"red",
      width:150,
      height:150,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 20,
    },
    filterScrollView: {
      paddingVertical: 10, // Optional: Add padding at the top and bottom of the scrollable area
    },
    filterContainer: {
      flexDirection: 'row',  // Stack items horizontally
      paddingHorizontal: 5,  // Optional: Add horizontal padding between items
    },
    filterButton: {
      backgroundColor: "#FAFAFC",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      marginTop: 2,
      marginRight: 15,
      marginBottom: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedFilter: {
      backgroundColor: "#FA6163",
    },
    filterText: {
      fontFamily: "System",
      fontSize: 14,
      color: "#333333",
    },
    filterTextSelected: {
      fontFamily: "System",
      fontSize: 14,
      color: "white",
    },
    // FOOTER

    footerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FAFAFC",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: "#eee",
      elevation: 4, // Android shadow
      shadowColor: "#000", // iOS shadow
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    footerIconLeft: {
      marginLeft: 20,
    },
    footerIconRight: {
      marginRight: 20,
    },


    // filters
    filterNormText:{
      color:'black',
      alignContent:'center',
    },
    filterNormBtn:{
      //backgroundColor:'white', - USE THIS
      borderRadius:50,
      backgroundColor:'#009933', // DEBUG
      shadowOpacity:0.1,
      shadowRadius:4,
    },
    selectedFilterText:{
      color:'white'
    },
    selectedFilterBtn:{
      backgroundColor:'#009933',
      borderRadius:45,
      
    }
});


