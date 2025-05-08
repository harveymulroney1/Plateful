const bcrypt = require('bcrypt')
class User{
    constructor(userName,password,level,badges){
        this.userName = userName;
        this.password = hashPassword(password);
        this.level = level;
        this.badges = badges;
        this.savedRecipes = new [];
    }
    levelUp(){
        this.level+=1;
    }
}


const hashPassword = async (password)=>{
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPass = await bcrypt.hash(password,salt);
    return hashedPass;
}

const checkPassword = async (inputPass,hashedPass) =>{
    return await bcrypt.compare(inputPass,hashedPass);
}

const setProfilePic = (imgSrc)=>{
    
}