import WizardScene from 'telegraf/scenes/wizard/index.js'
import emoji from 'node-emoji'
import {updateUsersInfo,reviewUserInfo} from "../index/mongo_db.js";
import Markup from 'telegraf/markup.js'

//Массив с обновленными данными
export let data

//Сцена изменения личных данных
export const changeDataScene = new WizardScene('changeData',
    async (ctx) =>
    {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id)
        await ctx.reply('Введите ваше имя:')
        ctx.wizard.state.data = {}
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        ctx.wizard.state.data.fname = ctx.message.text
        await ctx.reply('Введите вашу фамилию:')
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        ctx.wizard.state.data.lname = ctx.message.text
        await ctx.reply('Введите ваш email:')
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        ctx.wizard.state.data.email = ctx.message.text
        await ctx.reply('Введите ваш почтовый индекс:')
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        ctx.wizard.state.data.index = ctx.message.text
        await ctx.reply('Введите ваш адрес:')
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        ctx.wizard.state.data.address = ctx.message.text
        await ctx.reply('Введите ваш мобильный телефон:')
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        ctx.wizard.state.data.mobilePhone = ctx.message.text
        data = ctx.wizard.state.data
        await updateUsersInfo(ctx,data)
        await ctx.reply(`Ваши данные успешно изменены! ${emoji.get('smile')}`)
        await reviewUserInfo(ctx)
        return ctx.scene.leave()
    })
