import Markup from 'telegraf/markup.js'
import emoji from 'node-emoji'
import CryptoJS from 'crypto-js'
import {MerchantLogin,secretMerch1} from "./config.js"

//Клавиатура главного меню
export const mainMenuKeyboard = Markup.keyboard([
    [`${emoji.get('barber')} Личый кабинет`,`${emoji.get('ambulance')} Помощь`],
    [`${emoji.get('shirt')} Каталог`,`${emoji.get('mag')} Поиск`]
], {columns: 2}).resize().extra()

//Клавиатура Личного кабинета
export function myAccountKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(`${emoji.get('memo')} Личные данные`,'personalData'),
            Markup.callbackButton(`${emoji.get('shopping_bags')} Заказы`,'orders'),
        ],
        [
            Markup.callbackButton(`${emoji.get('shopping_trolley')} Корзина`, 'cart'),
            Markup.callbackButton(`${emoji.get('star')} Избранное`,'favourite'),
        ],
        [
            Markup.callbackButton(`${emoji.get('house')} В главное меню`,'mainMenu')
        ]
    ], {columns: 3}).extra()
}

//Клавиатура кнопки "Личные данные"
export function personalDataKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.callbackButton(`${emoji.get('pencil2')} Изменить данные`, 'changeData')],
        [Markup.callbackButton(`${emoji.get('arrow_left')} Назад`, 'back')]
    ], {columns:2}).extra()
}

//Клавиатура кнопки "Эаказы"
export function ordersDataKeyboard(pageCount,currentPage) {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(`${emoji.get('arrow_left')} Назад`, 'back'),
            Markup.callbackButton(`${currentPage} из ${pageCount}`, 'countOD'),
            Markup.callbackButton(`Вперед ${emoji.get('arrow_right')}`, 'forward')
        ]
    ], {columns: 1}).extra()
}

//Клавиатура Корзины
export function cartKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton('Изменить список заказов','changeCart'),
            Markup.callbackButton('Купить','buy')
        ]
    ], {columns: 1}).extra()
}

//Клавиатура кнопки 'Изменить список заказов'
export function changeCartKeyboard(currentMerch,merchCount) {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(`Добавить кол-во`,'addCC'),
            Markup.callbackButton(`Удалить`,'delete')
        ],
        [
            Markup.callbackButton(`${emoji.get('arrow_left')} Назад`,'backC'),
            Markup.callbackButton(`${currentMerch} из ${merchCount}`,'countCC'),
            Markup.callbackButton(`Вперед ${emoji.get('arrow_right')}`, 'forwardC')
        ]
    ], {columns: 2}).extra()
}

//Клавиатура Избранного
export function favouriteKeyboard(currentFav,favCount) {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(`Удалить`,'delete'),
            Markup.callbackButton(`Добавить в корзину`, 'addToCart')
        ],
        [
            Markup.callbackButton(`${emoji.get('arrow_left')} Назад`,'backF'),
            Markup.callbackButton(`${currentFav} из ${favCount}`,'countF'),
            Markup.callbackButton(`Вперед ${emoji.get('arrow_right')}`, 'forwardF')
        ]
    ], {columns: 2}).extra()
}

//Клавиатура Помощи
export function helpKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(`${emoji.get('mailbox_with_mail')} Контакты`,'contacts'),
            Markup.callbackButton(`${emoji.get('rocket')} Условия доставки и оплаты`,'delivery')
        ],
        [
            Markup.callbackButton(`${emoji.get('house')} В главное меню`,'mainMenu')
        ]
    ], {columns: 2}).extra()
}

//Клавиатура кнопки Каталог
export function catalogKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton(`Футболки`,'tshirts'),
            Markup.callbackButton(`Лонгсливы`,'longsleeves'),
            Markup.callbackButton('Все вещи', 'allCloth')
        ],
        [
            Markup.callbackButton(`${emoji.get('house')} В главное меню`,'mainMenu')
        ]
    ], {columns:2}).extra()
}

//Клавиатура для товаров
export function merchKeyboard(currentMerch,merchCount) {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton('Добавить в корзину','addToCart'),
            Markup.callbackButton('Добавить в избранное', 'addToFav')
        ],
        [
            Markup.callbackButton(`${emoji.get('arrow_left')} Назад`,'backM'),
            Markup.callbackButton(`${currentMerch} из ${merchCount}`,'darar'),
            Markup.callbackButton(`Вперед ${emoji.get('arrow_right')}`, 'forward')
        ]
    ],{columns: 2 }).extra()
}

//Контакты
export function contactsKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.urlButton('Телеграм',`https://t.me/cyberjack22`)
        ],
        [
            Markup.urlButton('ВК',`https://vk.com/idkwtfisthat`)
        ],
        [
            Markup.urlButton('Группа ВК','https://vk.com/djordje_brand')
        ],
        [
            Markup.callbackButton('Назад','back')
        ]
    ],{columns: 4}).extra()
}

//Кнопка назад
export function backKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.callbackButton('Назад','back')
        ]
    ],{columns:1}).extra()
}

//Кнопка Да/Нет
export const YesNoKeyboard = Markup.keyboard([
        ['Да', 'Нет']
    ],{columns: 1}).resize().extra()

//Клавиатура для оплаты заказа
export function finalBuy(price,str) {
    const numberOfOrder = Math.random()
    let md5 = CryptoJS.MD5(`${MerchantLogin}:${price}:${numberOfOrder}:${secretMerch1}`)
    return Markup.inlineKeyboard([
        [
            Markup.urlButton('Оплатить',`https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=djordje&InvId=${numberOfOrder}&Culture=ru&Encoding=utf-8&Description=${str}&OutSum=${price}&SignatureValue=${md5}`),
            Markup.callbackButton('Отменить','cancel')
        ]
    ],{columns:1}).extra()
}