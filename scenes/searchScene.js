import WizardScene from 'telegraf/scenes/wizard/index.js'
import {merchKeyboard,mainMenuKeyboard} from "../index/keyboards.js"
import emoji from 'node-emoji'

//Сцена поиска подходящей вещи
export const searchScene = new WizardScene('search-scene',
    async (ctx) =>
    {
        await ctx.reply('Введите название товара,который хотите найти:')
        //создаем массив вещей
        ctx.wizard.state.data = []
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        let searchItems = []
        //Сохраняем текущую страницу
        const currentPage = 1
        //Имя вещи записываем
        ctx.wizard.state.data.item = ctx.message.text
        //Записываем все вещи
        const allItems = ctx.session.allItems
        for(let i = 0;i<allItems.length;i++)
        {
            if(allItems[i].title === ctx.message.text)
                searchItems.push(allItems[i])
        }
        if(searchItems.length !== 0)
        {
            console.log(searchItems)
            //Записываем отдельную вещь в переменную
            const oneItem = searchItems[currentPage-1]
            //Записываем отдельную вещь в сессию
            ctx.session.oneItem = searchItems[currentPage-1]
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
            //Кол-во вещей
            const allPages = allItems.length

            await ctx.replyWithPhoto(
                itemPhoto,
                {
                    caption: `*Название:* ${itemTitle}\n\n*Цена:* ${itemPrice}\n\n*Описание:* ${itemDescription}`,
                    reply_markup: merchKeyboard(ctx.session.currentPage, allPages).reply_markup
                }
            )
        }
        else
            await ctx.replyWithMarkdown(`К сожалению по вашему запросу ничего не найдено,попробуйте ещё раз ${emoji.get('zany_face')}`,mainMenuKeyboard)

        return ctx.scene.leave()
    })