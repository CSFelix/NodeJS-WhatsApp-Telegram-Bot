/* 
	***************
	*** Módulos ***
	***************

	********************
	*** Initializing ***
	********************

	- npm init

	****************
	*** Packages ***
	****************

	- Express: npm install express
	- Neo4J: npm install neo4j-driver
	- Venom: npm i --save venom-bot
	- Telegram bot: yarn add node-telegram-bot-api
*/
const express = require('express');
const neo4j = require('neo4j-driver');
const venom = require('venom-bot');
const TelegramBot = require('node-telegram-bot-api');

var app = express();
var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('user', 'password'));
var session = driver.session();

var whatsapp_bot;
var telegram_bot;

/*
	********************
	*** WhatsApp Bot ***
	******************** 
*/
const sessions = ['scanme-whats-bot'];

venom.create(
		sessions[0],
    	(base64Qr, asciiQR, attempts, urlCode) => { console.log("\n" + asciiQR + "\n"); },
   		undefined,
    	{ logQR: false }
	)
	.then((client) => { whatsapp_bot = client; })
	.catch((error) => { console.log(error); });

function sendMessageWhatsApp(client_whats) {

	// Send 'Hello' and Product's Datas
	setTimeout(() => {
		client_whats.sendText(`${comprador.numero_whatsapp}@c.us`, `${mensagens.mensagem1}`);
	}, 3000);

	setTimeout(() => {
		client_whats.sendText(`${comprador.numero_whatsapp}@c.us`, `${mensagens.mensagem2}`); 
	}, 6000);

	// Send Seller's Datas
	setTimeout(() => {
		client_whats.sendText(`${comprador.numero_whatsapp}@c.us`, `${mensagens.mensagem3}`);
		
		// contact view card is send just if the
		// seller has a WhatsApp account inserted
		// in the database
		if (divulgador.numero_whatsapp != '') {
			client_whats.sendContactVcard(`${comprador.numero_whatsapp}@c.us`, `${divulgador.numero_whatsapp}@c.us`, `${divulgador.nickname}`);
		}
	}, 9000);

	// Send "Good Bye"
	setTimeout(() => {
		client_whats.sendText(`${comprador.numero_whatsapp}@c.us`, `${mensagens.mensagem4}`);
	}, 12000);
}

/*
	********************
	*** Telegram Bot ***
	******************** 
*/
const token = 'token';
telegram_bot = new TelegramBot(token, { polling: true });

telegram_bot.on('message', function (msg) {
    const chatId = msg.chat.id;
    
    if (msg.text === 'my id') { 
        telegram_bot.sendMessage(chatId, 'Your id: ' + msg.from.id); 
        console.log(msg, chatId);
        console.log('\n\n\n');
    }
});

function sendMessageTelegram(client_telegram) {
	
	setTimeout(() => {
		client_telegram.sendMessage(comprador.id_telegram, mensagens.mensagem1); 
	}, 3000);

	setTimeout(() => {
		client_telegram.sendMessage(comprador.id_telegram, mensagens.mensagem2); 
	}, 6000);

	setTimeout(() => {
		client_telegram.sendMessage(comprador.id_telegram, mensagens.mensagem3); 
	}, 9000);

	setTimeout(() => {
		client_telegram.sendMessage(comprador.id_telegram, mensagens.mensagem4); 
	}, 12000);
}

/*
	**************
	*** Routes ***
	**************
*/
app.get('/whatsapp_bot', function(req, res) {
	buyer.uuid = req.query.buyer_uuid;
	product.uuid = req.query.product_uuid;
	configurations.language = req.query.language;

	ActiveBots(whatsapp_bot, telegram_bot);
	res.end('Done');
});

/*	
	***************
	*** Objects ***
	***************
*/

var configurations = { language: '' }

var buyer = {
	uuid: '',
	nickname: '',
	telegram_number: '',
	telegram_id: '',
	whatsapp_number: ''
};

var promoter = {
	nickname: '',
	email: '',
	telegram_number: '',
	whatsapp_number: ''
};

var product = {
	uuid: '',
	name: '',
	mainKind: '',
	description: '',
	stock: '',
	coin: '',
	price: '',
	link: ''
};

var messages = {
	message1: '',
	message2: '',
	message3: '',
	message4: ''
}

/*
	******************************
	*** Datas' Transformations ***
	******************************
*/
function NumberTransformer(number) { 
	
	// if the user has an inserted number
	// the 55 (Brazil's code) is inserted
	if (number != '') { return '55' + number; }

	// else, an empty number is returned
	else { return number; }
}

function CoinTransformer(coinCode) { return (coinCode === '1') ? 'R$' : 'U$'; }

function mainKindTransformer(kind) {
	switch (kind) {
		case '1': return 'Candy';
		case '2': return 'Salty';
		case '3': return 'Other Foods';
		case '4': return 'Cellphones';
		case '5': return 'Computing';

		case '6': return 'Games';
		case '7': return 'Books';
		case '8': return 'Mangas';
		case '9': return 'Toys';
		case '10': return 'Decoration';

		case '11': return 'Clothes';
		case '12': return 'Perfumary';
		case '13': return 'Home Appliances';
		case '14': return 'Furnitures';
		case '15': return 'Business';

		case '16': return 'Cars';
		case '17': return 'Motorcycles';
		case '18': return 'Trucks';
		case '19': return 'Pickup Trucks';
		default: return 'Others';
	}
}

function messageTransformer(messages) {

	// language: Portuguese (Brazil)
	if (configurations.language == '1') {
		messages.message1 = `👋 Olá *${buyer.nickname}*, tudo bem? Estamos muito felizes por estar usando o _ScanMe_. Segue as informações do produto escaneado:`;
		messages.message2 = `📦 Produto: *${product.name} - ${product.mainKind}* 📦\nPreço: _${product.coin} ${product.price}_\n${product.description}\nMais detalhes aqui: ${product.link}`;
		messages.message3 = `🏪 Divulgador: *${promoter.nickname}* 🏪\nE-Mail: _${promoter.email}_\nWhatsApp: _${promoter.whatsapp_number}_\nTelegram: _${promoter.telegram_number}_`;
		messages.message4 = `☺️ A equipe _ScanMe_ agrade a preferência!`;
	}

	// language: English (USA)
	else {
		messages.message1 = `👋 What's up *${buyer.nickname}*, how's it going? We are so glad to you be using _ScanMe_. These are the information about the scanned product:`;
		messages.message2 = `📦 Product: *${product.name} - ${product.mainKind}* 📦\nPrice: _${product.coin} ${product.price}_\n${product.description}\nMore infos: ${product.link}`;
		messages.message3 = `🏪 Promoter: *${promoter.nickname}* 🏪\nE-Mail: _${promoter.email}_\nWhatsApp: _${promoter.whatsapp_number}_\nTelegram: _${promoter.telegram_number}_`;
		messages.message4 = `☺️ From _ScanMe_ Team!`;
	}
}

/* 
	**********************
	*** Datas Overview ***
	**********************
*/
function ShowBuyer(user) {
	console.log('Nickname: ', user.nickname);
	console.log('Telegram: ', user.telegram_number);
	console.log('Telegram Id: ', user.telegram_id);
	console.log('WhatsApp: ', user.whatsapp_number);
	console.log('\n');
}

function ShowPromoter(user) {
	console.log('Nickname: ', user.nickname);
	console.log('Email: ', user.email);
	console.log('Telegram: ', user.telegram_number);
	console.log('WhatsApp: ', user.whatsapp_number);
	console.log('\n');
}

function ShowProduct(product) {
	console.log('Name: ', product.name);
	console.log('Description: ', product.description);
	console.log('Main Kind: ', product.mainKind);
	console.log('Stock: ', product.stock);
	console.log('Coin: ', product.coin);
	console.log('Price: ', product.price);
	console.log('\n');
}

/* 
	***************************
	*** Searching the Infos ***
	***************************
*/
function ActiveBots(client_whats, client_telegram) {
	session
		.run('MATCH (n:User {user_uuid: $buyer_uuid})'
	       + ' WITH n'
	       + ' MATCH (o:Product {product_uuid: $product_uuid}) <-[:Inserted]- (m:User)'
		   + ' RETURN n, m, o',
			{buyer_uuid: buyer.uuid, product_uuid: product.uuid})
		.then(function(result) {
			result.records.forEach(function(record) {

				// Buyer's Infos
				buyer.nickname         =   record._fields[0].properties.nickname;
				buyer.telegram_number  =   NumberTransformer(record._fields[0].properties.telegram_number);
				buyer.telegram_id      =   record._fields[0].properties.telegram_id;
				buyer.whatsapp_number  =   NumberTransformer(record._fields[0].properties.whatsapp_number);

				// Promoter's Infos
				promoter.nickname        =   record._fields[1].properties.nickname;
				promoter.email           =   record._fields[1].properties.email;
				promoter.telegram_number =   NumberTransformer(record._fields[1].properties.telegram_number);
				promoter.whatsapp_number =   NumberTransformer(record._fields[1].properties.whatsapp_number);

				// Product's Infos
				product.name               =   record._fields[2].properties.name;
				product.mainKind           =   mainKindTransformer(record._fields[2].properties.mainKind);
				product.description        =   record._fields[2].properties.dedscription;
				product.stock              =   record._fields[2].properties.stock;
				product.coin               =   CoinTransformer(record._fields[2].properties.coin);
				product.price              =   record._fields[2].properties.price;
				product.link               =   'product_url' + '?product-uuid=' + product.uuid + '&idioma=' + configurations.language;

				/* Showing the Infos */
				ShowBuyer(buyer);
				ShowPromoter(promoter);
				ShowProduct(product);
				console.log('\n\n----\n\n');

				/* Choosing Messages' Language */
				messageTransformer(messages);

				/* Checking if Buyer has WhatsApp or Telegram Inserted */
				if (buyer.whatsapp_number != '') { sendMessageWhatsApp(client_whats); }
				else { sendMessageTelegram(client_telegram); }
			});
		})
		.catch(function(error) { console.log(error); });
}

/* 
	***********************
	*** Starting Server ***
	***********************
*/
app.listen(3000);
console.log('Server Started');