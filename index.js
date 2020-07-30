import session from 'telegraf/session.js'
import axios from 'axios'
import express from 'express'
import Telegraf from 'telegraf'
import emoji from 'node-emoji'
import {getMerch,addToFavourite,addOneMore,deleteItem,reviewFav,addToCart,reviewCart,reviewСhangeCart,clearCart} from "./controllers.js"
import {mainMenuKeyboard,myAccountKeyboard,helpKeyboard,ordersDataKeyboard,catalogKeyboard,contactsKeyboard,backKeyboard} from "./keyboards.js"
import {BOT_TOKEN,VK_TOKEN,MONGODB_LINK} from "./config.js"
import {mongoConnect,reviewUserInfo} from "./mongo_db.js"
import mongo from 'mongodb'
import Stage from 'telegraf/stage.js'
import {changeDataScene} from "../scenes/changeDataScene.js"
import {searchScene} from "../scenes/searchScene.js"
import {purchaseScene} from "../scenes/purchaseScene.js"

const app = express()
//Айди категории для каталога
let category_id

//Тестовый get запрос
app.get('/', (req, res) => res.send('Hello world'))

//Создаем клиента,для подключения к MongoDB
export const client = mongo.MongoClient(MONGODB_LINK)

//Подключаем токен,создаем бота
const bot = new Telegraf(BOT_TOKEN)
//Создаём сцену
const stage = new Stage([changeDataScene,searchScene,purchaseScene])

//Используем сессии
bot.use(session())
//Ипользуем мидлвэа сцены
bot.use(stage.middleware());
//Реакция на метод /start
bot.start(async (ctx) => {
    try
    {
        // Получаем все категории товаров
        const allCategories = await axios.get(`https://api.vk.com/method/market.getAlbums?access_token=${VK_TOKEN}&v=5.107&owner_id=-171145528`)
        // Парсим все товары из магазина
        const allItems = await axios.get(`https://api.vk.com/method/market.get?access_token=${VK_TOKEN}&v=5.107&owner_id=-171145528&&extended=1`)
        // Глобальное сохранение всех товаров
        ctx.session.allItems = allItems.data.response.items
        // Глобальное сохранение всех категорий
        ctx.session.allCategories = allCategories.data.response.items
        // Глобальное сохранение кол-ва всех товаров
        ctx.session.itemsCount = allItems.data.response.count
        // Глобальное сохранение кол-ва всех категорий
        ctx.session.categoriesCount = allCategories.data.response.count
        // Глобальное хранение текущей страницы (нужно для работы инлайн-кнопок "назад/дальше")
        ctx.session.currentPage = 1
        //Первое сообщение,которое встречается пользователя
        ctx.replyWithMarkdown(
            'Добро пожаловать в *"Джордже"*' +
            `\nРад тебя видеть, _${ctx.from.first_name}_ .`+
            `\nВыбирай всё, что хочешь ${emoji.get('wink')}`,
            {
                reply_markup: mainMenuKeyboard.reply_markup
            })
        //Подсоединяемся к базе MongoDB
        await mongoConnect(ctx,'search')
    }//Ловим ошибочку
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик кнопки Личный кабинет
bot.hears(`${emoji.get('barber')} Личый кабинет`, async (ctx) => {
    try
    {
        await ctx.replyWithMarkdown(
            `Вы в личном кабинете!`,myAccountKeyboard()
        )
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик команды Личные данные
bot.action('personalData',async (ctx) =>{
    try {
        await reviewUserInfo(ctx)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик кнопки Изменить данные
bot.action('changeData',async (ctx) => {
    try{
        await ctx.scene.enter('changeData')
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик

//Обработчик команды Заказы
bot.action('orders',async (ctx) =>{
    try {
        await ctx.reply("История заказов:", ordersDataKeyboard(ctx.session.currentPage, ctx.session.itemsCount))
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик команды Корзина
bot.action('cart', async (ctx) => {
    try {
        await reviewCart(ctx)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик команды назад в корзине
bot.action('backC', async (ctx) => {
    try {
        // Идет проверка: если текущая страница не равна 1
        // тогда отнимает от текущей страницы 1 и изменяет последнее сообщение от бота
        if (ctx.session.currentPage !== 1) {
            ctx.session.currentPage = ctx.session.currentPage - 1

            const data = await reviewСhangeCart(ctx,true)
            // Сообщения с одной фотографией, кратким описанием и инлайн-клавиатурой изменяется
            await ctx.editMessageMedia(
                data.photo,
                {reply_markup: data.keyboard.reply_markup}
            )
        } else {
            ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        }
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Вперёд в корзине
bot.action('forwardC', async (ctx) => {
    try {
        // Логика работы идентична prevPage, только здесь
        // текущая страница увеличивается на 1
        if (ctx.session.currentPage !== ctx.session.itemsCount) {
            ctx.session.currentPage = ctx.session.currentPage + 1

            const data = await reviewСhangeCart(ctx, true)
            console.log(data)
            await ctx.editMessageMedia(
                data.photo,
                {reply_markup: data.keyboard.reply_markup}
            )}
        else {
            alert('Не надо')
        }
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Избранное
bot.action('favourite',async (ctx) => {
    try {
        await reviewFav(ctx,false)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Назал в избранном
bot.action('backF', async (ctx) => {
    try {
        // Идет проверка: если текущая страница не равна 1
        // тогда отнимает от текущей страницы 1 и изменяет последнее сообщение от бота
        if (ctx.session.currentPage !== 1) {
            ctx.session.currentPage = ctx.session.currentPage - 1

            const data = await reviewFav(ctx,true)
            // Сообщения с одной фотографией, кратким описанием и инлайн-клавиатурой изменяется
            await ctx.editMessageMedia(
                data.photo,
                {reply_markup: data.keyboard.reply_markup}
            )
        } else {
            ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        }
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Вперед в избранном
bot.action('forwardF', async (ctx) => {
    try {
        // Логика работы идентична prevPage, только здесь
        // текущая страница увеличивается на 1
        if (ctx.session.currentPage !== ctx.session.itemsCount) {
            ctx.session.currentPage = ctx.session.currentPage + 1

            const data = await reviewFav(ctx, true)
            console.log(data)
            await ctx.editMessageMedia(
                data.photo,
                {reply_markup: data.keyboard.reply_markup}
            )}
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик команды Изменить содержимое корзины
bot.action('changeCart',async (ctx) =>{
    try {
        await reviewСhangeCart(ctx,false)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик команды Добавить ещё одно кол-во
bot.action('addCC',async (ctx) => {
    try {
        await addOneMore(ctx)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Удалить кол-во
bot.action('delete', async (ctx) => {
    try {
        await deleteItem()
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//
bot.action('buy',async (ctx) => {
    try{
        ctx.scene.enter('purchase-scene')
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//
bot.action('cancel', async (ctx) => {
    try{
        await clearCart()
        await ctx.reply('Успешно отмененно!',mainMenuKeyboard)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Добавить в корзину
bot.action('addToCart',async (ctx) => {
    try {
        await addToCart(ctx)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Добавить в избранное
bot.action('addToFav', async(ctx) => {
    try {
        await addToFavourite(ctx)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик кнопки Помощь
bot.hears(`${emoji.get('ambulance')} Помощь`, async ctx => {
    try
    {
        await ctx.replyWithMarkdown(
            `В этом разделе вы можете узнать контакты,а так же условия доставки и оплаты`,helpKeyboard()
        )
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Контакты
bot.action('contacts', async (ctx) => {
    try {
        await ctx.reply('Вы можете написать нашей поддержке или перейти в основную группу вк,нажав кнопки ниже:',contactsKeyboard())
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Подробности доставки
bot.action('delivery', async (ctx) => {
    try {
        await ctx.replyWithHTML(
            '<b><u>Доставка товаров</u></b>\n' +
            'Доставка осуществляется по 100% предоплате. Осуществляется при помощи Почты РФ. В среднем это 300 руб, но в зависимости от региона цена может быть меньше или больше. Среднее время доставки по России 7-10 дней',backKeyboard())
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Главное меню
bot.action('mainMenu',async (ctx) => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        ctx.reply('Вы в главном меню!',{reply_markup: mainMenuKeyboard.reply_markup})
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Назад
bot.action('back',async (ctx) => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Назад при просмотре вещей
bot.action('backM', async (ctx) => {
    try {
        // Идет проверка: если текущая страница не равна 1
        // тогда отнимает от текущей страницы 1 и изменяет последнее сообщение от бота
        if (ctx.session.currentPage !== 1) {
            ctx.session.currentPage = ctx.session.currentPage - 1

            const data = await getMerch(ctx, category_id,true)
            // Сообщения с одной фотографией, кратким описанием и инлайн-клавиатурой изменяется
            await ctx.editMessageMedia(
                data.photo,
                {reply_markup: data.keyboard.reply_markup,parse_mode: 'HTML'}
            )
        } else {
            ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        }
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Вперед при просмотре вещей
bot.action('forward', async (ctx) => {
    try {
        // Логика работы идентична prevPage, только здесь
        // текущая страница увеличивается на 1
        if (ctx.session.currentPage !== ctx.session.itemsCount) {
            ctx.session.currentPage = ctx.session.currentPage + 1

            const data = await getMerch(ctx,category_id, true)
            await ctx.editMessageMedia(
                data.photo,
                {reply_markup: data.keyboard.reply_markup,parse_mode: 'HTML'}
            )}
    } catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик кнопки Каталог
bot.hears(`${emoji.get('shirt')} Каталог`, async ctx => {
    try
    {
        await ctx.reply('Выберите категорию',catalogKeyboard())
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Вещи в категории футболки
bot.action('tshirts', async (ctx) => {
    try {
        for(let i = 0; i < ctx.session.categoriesCount; i++)
        {
            if(ctx.session.allCategories[i].title === 'Футболки')
            {
                category_id = ctx.session.allCategories[i].id
                await getMerch(ctx,category_id,false)
            }
        }
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошиб Очка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Вещи в категории лонгсливы
bot.action('longsleeves', async (ctx) => {
    try {
        for(let i = 0; i < ctx.session.categoriesCount; i++)
        {
            if(ctx.session.allCategories[i].title === 'Лонгсливы')
            {
                category_id = ctx.session.allCategories[i].id
                await getMerch(ctx,category_id,false)
            }
        }
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошиб Очка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Выводит пользователю все вещи
bot.action('allCloth', async (ctx) => {
    try {
        category_id = 0
        await getMerch(ctx,category_id,false)
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошиб Очка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

//Обработчик кнопки поиск
bot.hears(`${emoji.get('mag')} Поиск`, async ctx => {
    try
    {
        ctx.scene.enter('search-scene')
    }
    catch (e) {
        console.log(e)
        ctx.reply(`Возникла ошибочка,вот её код:\n${e}\nОбратитесь к поддержке`)
    }
})

// Стоит в самом конце, чтобы, если пользователь введет любой текст
// не удовлетворяющий условиям выше, обработать его и выдать простой ответ.
bot.on('text', ctx => {
    ctx.reply(`К сожалению,я не знаю такой команды,попробуйте другую ${emoji.get('japanese_ogre')}`)
})

//Запускаем машину
bot.launch().then((res) => {
    console.log("ЗАПУЩЕНА ШАЙТАН МАШИНА")
})
.catch((err) => console.log("АШИБКА"))
//app.listen(3000, () => console.log('Server is running on port 3000'))