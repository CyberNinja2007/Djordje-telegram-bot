import {MONGO_DB} from "./config.js"
import {client} from "./index.js"
import {personalDataKeyboard} from "./keyboards.js";
import {price} from "./controllers.js"

//Переменные база данных,коллекции данных пользователей и их покупок
let db,collectionUsers,collectionPur

//Оформляем коннектинг к базе данных
export async function mongoConnect(ctx){
    client.connect(function(err){
        if(err) {
            console.log('Error occurred while connecting to MongoDB Atlas...\n',err)
        }
        console.log('Connected...')

        //Подцепляем базу данных
        db = client.db(MONGO_DB)
        //Подцепляем коллекцию данных ползователей
        collectionUsers = db.collection("users")
        //Подцепляем коллекцию данных покупок пользователей
        collectionPur = db.collection('usersPurchases')
        searchOrSaveUserData(ctx,(err) => {
                if(err)
                    console.log('Error occurred while searching in usersData...\n',err)
            })
    })
}


//Найти или сохранить пользователя при первом подключении
export async function searchOrSaveUserData(ctx) {
    const query = {user_id: ctx.from.id}
    collectionUsers.findOne(query,function (err,user) {
        if(err)
            console.log(err)
        else
        {
            console.log(user)
            if(user === null)
            {
                let userData = {
                        user_id: ctx.from.id,
                        first_name: ctx.from.first_name,
                        last_name: ctx.from.last_name,
                        email: "",
                        postalCode: "",
                        address: "",
                        mobilePhone: "+7(9..)...-..-.."
                    }
                    console.log(JSON.stringify(userData.first_name))
                    collectionUsers.insertOne(userData)
                }
            }
    })

}

//Показать информацию о пользователе
export async function reviewUserInfo(ctx) {

    collectionUsers.findOne({user_id: ctx.from.id}, function (err,user) {
        if(err)
            console.log(err)
        else {
            let userData = user
            let str = `_Имя:_ ${userData.first_name}\n_Фамилия:_ ${userData.last_name}\n_Почтовый индекс:_ ${userData.postalCode}\n_Адрес:_ ${userData.address}\n_Мобильный телефон:_ ${userData.mobilePhone}`
            ctx.replyWithMarkdown("*Вот ваши данные:*\n"+str,personalDataKeyboard())
        }
    })
}

//Показать информацию личные данные пользователя при заказе
export async function reviewUser(ctx) {

    collectionUsers.findOne({user_id: ctx.from.id}, function (err,user) {
        if(err)
            console.log(err)
        else {
            let userData = user
            let str = `_Имя:_ ${userData.first_name}\n_Фамилия:_ ${userData.last_name}\n_Почтовый индекс:_ ${userData.postalCode}\n_Адрес:_ ${userData.address}\n_Мобильный телефон:_ ${userData.mobilePhone}`
            //
            ctx.replyWithMarkdown("*Вот ваши данные:*\n"+str)
        }
    })
}

//Обновить информацию пользователя в бд
export async function updateUsersInfo(ctx,dictionary) {
    console.log(dictionary)

    collectionUsers.findOneAndUpdate({user_id: ctx.from.id},{$set:
            {
                first_name: dictionary.fname,
                last_name: dictionary.lname,
                email: dictionary.email,
                postalCode: dictionary.index,
                address: dictionary.address,
                mobilePhone: dictionary.mobilePhone
           }},function (err,result){
        if(err)
            console.log(err)
        else
            console.log(result)
    })
}

//Сохранить заказ пользователя в бд
export async function saveUserPurchase(ctx,array) {

    const user = collectionUsers.findOne({user_id: ctx.from.id})

    let purchaseInfo = {
        user_id: user.user_id,
        purchasesArray: array
    }

    await collectionPur.insertOne(purchaseInfo)
}