import Stage from 'telegraf/stage.js'
import WizardScene from 'telegraf/scenes/wizard/index.js'
import {reviewCartOrder, IsCorrect, finalOrder} from "../index/controllers.js"
import {reviewUser} from "../index/mongo_db.js"
import {YesNoKeyboard} from "../index/keyboards.js"
import {changeDataScene} from "./changeDataScene.js"

export const purchaseScene = new WizardScene('purchase-scene',
    async (ctx) =>
    {
        await reviewUser(ctx)
        await IsCorrect(ctx)
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        if(ctx.message.text === 'Да')
        {
            return ctx.wizard.next()
        }
        else if (ctx.message.text === 'Нет')
        {
            const stage = new Stage([changeDataScene])
            await ctx.scene.enter('changeData').finally(() => {IsCorrect(ctx)})
        }
        else
            ctx.reply('Выберите пожалуйста кнопки на клавиатуре',{reply_markup: YesNoKeyboard.reply_markup})
    },
    async (ctx) =>
    {
        await reviewCartOrder(ctx,false)
        await IsCorrect(ctx)
        return ctx.wizard.next()
    },
    async (ctx) =>
    {
        if(ctx.message.text === 'Да')
        {
            return ctx.wizard.next()
        }
        else if (ctx.message.text === 'Нет')
        {
            const stage = new Stage([changeDataScene])
            await ctx.scene.enter('changeData').finally(() => {IsCorrect(ctx)})
        }
        else
            ctx.reply('Выберите пожалуйста кнопки на клавиатуре',{reply_markup: YesNoKeyboard.reply_markup})
    },
    async (ctx) =>
    {
        await finalOrder(ctx)
        return ctx.scene.leave()
    })