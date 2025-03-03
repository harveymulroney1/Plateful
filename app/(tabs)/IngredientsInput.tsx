import { View, StyleSheet,Text,TextInput,FlatList,Button } from 'react-native';
import CustomButton from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { processReceipt } from "../../backend/receiptOCR.js";

const PlaceholderImage = require('@/assets/images/background-image.png');
const receiptIngrList = [];

export default function Index() {
    const [ingrList,setingrList] = useState<string[]>([])
    const [receiptLines, setReceiptLines] = useState<string[]>([]);
    const [inputText, setInputText] = useState("");
    const handleAddItem = () => {
        if (inputText.trim()) {
        setingrList([...ingrList, inputText.trim()]);
        setInputText("");
        }
    }
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality:1
    });
    if (!result.canceled){
      setSelectedImage(result.assets[0].uri);
      console.log(result);
    } else{
      alert('You didnt select an image.');
    }
  }
  async function imageToIngredient()
  {
    if(selectedImage != undefined)
      {
        try {
          const text = await processReceipt(selectedImage);
          const lines = text.split("\n").filter((line) => line.trim() !== ""); // Split text into lines & remove empty ones
          setReceiptLines(lines);
          setingrList([...ingrList, ...lines]);
        } catch (error) {
          console.error("Error processing receipt:", error);
          setReceiptLines(["Failed to process the receipt."]);
        }
      }
  }





  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
      <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
      </View>
      <View style={styles.footerContainer}>
        <CustomButton theme="primary" label="Upload Receipt" onPress={pickImageAsync} />
        <CustomButton theme="primary" label="Use this photo" onPress={imageToIngredient}/>
        </View>
        <View style={styles.manualInputContainer}>
            <Text>Enter your Ingredients Below:</Text>
                <TextInput
                  style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                  }}
                  placeholder="Type Here"
                  defaultValue={inputText}
                  value={inputText}
                  onChangeText={(inputText) => setInputText(inputText)}
                  onSubmitEditing={handleAddItem}
                />
              <FlatList
                data={ingrList}
                keyExtractor={(ingr, index) => index.toString()}
                renderItem={({ item }) => (
                  <View>
                    <Text>{item}</Text>
                  </View>
                )}
              >
                
                
              </FlatList>
              <Button onPress={() => {setingrList([])}} title="Clear Ingredients" color='red' ></Button>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems : 'center',
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  manualInputContainer:{
    alignItems:'flex-start',
    position:'absolute',
    padding:50,

    
  }
});

