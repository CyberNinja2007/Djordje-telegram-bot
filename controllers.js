import axios from 'axios'
import {merchKeyboard, favouriteKeyboard, cartKeyboard, changeCartKeyboard, backKeyboard, YesNoKeyboard, finalBuy, mainMenuKeyboard} from "./keyboards.js"
import {VK_TOKEN} from "./config.js"
import emoji from 'node-emoji'

//Массив избранных вещей
let itemsFav = []
//Массив вещей корзины
let cartItems = []
//Создаем финальную цену корзины
export let price

//Получить список вещей
export async function getMerch(ctx,category_id,isChanged) {
    //Все вещи
    let allItems
    //Вещи категории
    let categoryItems
    //Номер текущей страницы(товара +1)
    let currentPage
    //Отдельная вещь
    let oneItem
    //Название товара
    let itemTitle
    //Цена товара
    let itemPrice
    //Описание товара
    let itemDescription
    //Все фотки товара
    let oneItemAllPhotos
    //Главная фотка
    let itemPhoto
    //Все страницы
    let allPages
    //Подцепляем номер текущей страницы(товара +1)
    currentPage = ctx.session.currentPage

    if (category_id !== 0)
    {
        //Парсим все вещи
        allItems = await axios.get(`https://api.vk.com/method/market.get?access_token=${VK_TOKEN}&v=5.107&owner_id=-171145528&album_id=${category_id}&extended=1`)
        //Получаем вещи из категории
        categoryItems = allItems.data.response.items
        //Записываем отдельную вещь в переменную
        oneItem = categoryItems[currentPage-1]
        //Записываем отдельную вещь в сессию
        ctx.session.oneItem = categoryItems[currentPage-1]
        //Записываем название товара
        itemTitle = oneItem.title
        //Получаем цену товара
        itemPrice = oneItem.price.text
        //Получаем описание товара
        itemDescription = oneItem.description
        //Получаем все фотки товара
        oneItemAllPhotos = oneItem.photos[0].sizes
        //Получаем главную фотку
        itemPhoto = oneItemAllPhotos[oneItemAllPhotos.length - 1].url
        //Все страницы
        allPages = allItems.data.response.count
    }
    else
    {
        console.log(ctx.session.allItems)
        //
        allItems = ctx.session.allItems
        //Записываем отдельную вещь в переменную
        oneItem = allItems[currentPage-1]
        //Записываем отдельную вещь в сессию
        ctx.session.oneItem = allItems[currentPage-1]
        console.log(oneItem)
        //Записываем название товара
        itemTitle = oneItem.title
        //Получаем цену товара
        itemPrice = oneItem.price.text
        //Получаем описание товара
        itemDescription = oneItem.description
        //Получаем все фотки товара
        oneItemAllPhotos = oneItem.photos[0].sizes
        //Получаем главную фотку
        itemPhoto = oneItemAllPhotos[oneItemAllPhotos.length - 1].url
        //Кол-во всех товаров
        allPages = allItems.length
    }

    if (isChanged === true)
    {
        return {
            photo : {
                type: 'photo',
                media: itemPhoto,
                caption: `<b>Название:</b> ${itemTitle}\n\n<b>Цена:</b> ${itemPrice}\n\n<b>Описание:</b> ${itemDescription}`
            },
            keyboard: merchKeyboard(ctx.session.currentPage,allPages)
        }
    } else
    {
        await ctx.replyWithPhoto(
            itemPhoto,
            {
                caption: `<b>Название:</b> ${itemTitle}\n\n<b>Цена:</b> ${itemPrice}\n\n<b>Описание:</b> ${itemDescription}`,
                reply_markup: merchKeyboard(ctx.session.currentPage, allPages).reply_markup,
                parse_mode: 'HTML'
            }
        )
    }
}

//Добавляем в избранное
export async function addToFavourite(ctx) {
    // Получить один элемент
    const oneItem = ctx.session.oneItem
    //Добавляем в массив избранного
    itemsFav.push(oneItem)
    //Глобально сохраняем массив
    ctx.session.itemsFav = itemsFav
}

//Функция по выводу избранного
export async function reviewFav(ctx,isChanged) {
    if(itemsFav.length !== 0)
    {
        //Подцепляем номер текущей страницы(товара +1)
        const currentPage = ctx.session.currentPage
        //Записываем отдельную вещь в переменную
        const oneItem = itemsFav[currentPage-1]
        //Записываем отдельную вещь в сессию
        ctx.session.oneItem = itemsFav[currentPage-1]
        //Записываем название товара
        const itemTitle = oneItem.title
        //Получаем цену товара
        const itemPrice = oneItem.price.text
        //Получаем описание товара
        const itemDescription = oneItem.description
        //Получаем все фотки товара
        const oneItemAllPhotos = oneItem.photos[0].sizes
        //Получаем главную фотку
        const itemPhoto = oneItemAllPhotos[oneItemAllPhotos.length - 1].url
        //Все страницы
        const allPages = itemsFav.length
        //Сохраняем кол-во товара глобально
        ctx.session.itemsCount = allPages

        if (isChanged === true)
        {
            return {
                photo : {
                    type: 'photo',
                    media: itemPhoto,
                    caption: `*Название:* ${itemTitle}\n\n*Цена:* ${itemPrice}\n\n*Описание:* ${itemDescription}`,
                },
                keyboard: favouriteKeyboard(ctx.session.currentPage,allPages)
            }
        } else
        {
            await ctx.replyWithPhoto(
                itemPhoto,
                {
                    caption: `*Название:* ${itemTitle}\n\n*Цена:* ${itemPrice}\n\n*Описание:* ${itemDescription}`,
                    reply_markup: favouriteKeyboard(ctx.session.currentPage, allPages).reply_markup
                }
            )
        }
    }
    else {
        ctx.reply('К сожалению здесь ещё нет товаров',backKeyboard())
    }

}

//Функция добавления в корзину
export async function addToCart(ctx) {
    //Записываем отдельную вещь в переменную
    const oneItem = ctx.session.oneItem
    //Ставим его кол-во = 1
    oneItem.count = 1
    //Добавляем в массив товаров корзины
    cartItems.push(oneItem)
}

//Всё ли правильно?
export async function IsCorrect(ctx) {
    //Проверяем,всё ли правильно
    await ctx.reply('Введенные данные верны?',{
        reply_markup: YesNoKeyboard.reply_markup
    })
}

//Функция по просмотру содержимого корзины в общем
export async function reviewCart(ctx) {
    if(cartItems.length !== 0)
    {
        let cartText = `*Вот ваша корзина:*\n`

        for(let i = 0;i<cartItems.length;i++)
        {
            console.log(cartItems[i])
            cartText +=`${cartItems[i].title} кол-во _${cartItems[i].count}_, цена _${cartItems[i].price.text}_\n`
        }
        await ctx.replyWithMarkdown(cartText,cartKeyboard())
    }
    else
        ctx.reply('Ваша корзина пока пуста',backKeyboard())
}

//Функция по просмотру содержимого корзины в заказе
export async function reviewCartOrder(ctx) {
    if(cartItems.length !== 0)
    {
        let cartText = `*Вот ваша корзина:*\n`

        for(let i = 0;i<cartItems.length;i++)
        {
            console.log(cartItems[i])
            cartText +=`${cartItems[i].title} кол-во _${cartItems[i].count}_, цена _${cartItems[i].price.text}_\n`
            price += cartItems[i].count * Number(cartItems[i].price.text)
        }
        await ctx.replyWithMarkdown(cartText)
    }
}

//Функция по просмотру отдельного товара в корзине
export async function reviewСhangeCart(ctx,isChanged) {
    //Подцепляем номер текущей страницы(товара +1)
    const currentPage = ctx.session.currentPage
    //Записываем отдельную вещь в переменную
    const oneItem = cartItems[currentPage-1]
    //Записываем отдельную вещь в сессию
    ctx.session.oneItem = cartItems[currentPage-1]
    //Записываем название товара
    const itemTitle = oneItem.title
    //Получаем цену товара
    const itemPrice = oneItem.price.text
    //Получаем описание товара
    const itemDescription = oneItem.description
    //Получаем все фотки товара
    const oneItemAllPhotos = oneItem.photos[0].sizes
    //Получаем главную фотку
    const itemPhoto = oneItemAllPhotos[oneItemAllPhotos.length - 1].url
    //Все страницы
    const allPages = cartItems.length
    //Глобально сохраняем кол-во вещей
    ctx.session.itemsCount = allPages

    if (isChanged === true)
    {
        return {
            photo : {
                type: 'photo',
                media: itemPhoto,
                caption: `*Название:* ${itemTitle}\n\n*Цена:* ${itemPrice}\n\n*Описание:* ${itemDescription}`,
            },
            keyboard: changeCartKeyboard(ctx.session.currentPage,allPages)
        }
    } else
    {
        await ctx.replyWithPhoto(
            itemPhoto,
            {
                caption: `*Название:* ${itemTitle}\n\n*Цена:* ${itemPrice}\n\n*Описание:* ${itemDescription}`,
                reply_markup: changeCartKeyboard(ctx.session.currentPage, allPages).reply_markup
            }
        )
    }
}


//Функция добавления кол-ва товара в корзине
export async function addOneMore(ctx) {
    //Записываем товар
    const oneItem = ctx.session.oneItem
    //Добавляем кол-во на 1
    ++oneItem.count
    //Глобально это сохраняем
    ctx.session.oneItem.count = oneItem.count
}

//Функция удаления товара
export async function deleteItem(ctx,arr) {
    //Записываем товар
    const oneItem = ctx.session.oneItem
    //Проверяем кол-во
    if(oneItem.count > 1)
    {
        //Сохраняем конкретно кол-во товара
        --oneItem.count
        //Глобально сохраняем кол-во товара
        ctx.session.oneItem.count = oneItem.count
    } else {
        const index = arr.indexOf(oneItem)
        arr.splice(index,1)
    }
}

//Функция для завершающей стадии покупки
export async function finalOrder(ctx) {
    //Формируем описание(состав заказа)
    let cartText
    for(let i = 0;i<cartItems.length;i++)
        cartText +=`${cartItems[i].title} кол-во _${cartItems[i].count}_, цена _${cartItems[i].price.text}_\n`
    //Выдаем пользоваетлю кнопку для оплаты
    ctx.reply(`Все,что вам осталось - только нажать на кнопку ниже,чтобы оплатить ${emoji.get('wink')}`,finalBuy(price,cartText))
}

//Очистка корзины
export async function clearCart(){
    cartItems.splice(0,cartItems.length)
}
