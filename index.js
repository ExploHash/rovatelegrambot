let fetch = require("node-fetch");
let { parse } = require("node-html-parser");
let FormData = require("form-data");

const chatId = process.env.CHAT_ID;
const botToken = process.env.CHAT_BOTTOKEN;
const postcode = process.env.POSTCODE;
const streetnumber = process.env.STREETNUMBER;


async function main(event, context){
  try {
    let response = await fetch(`https://inzamelkalender.rova.nl/nl/${postcode}/${streetnumber}/`);
    let body = await response.text();
  
    const root = parse(body);
    let dateElements = root.querySelectorAll(".firstDate");
    let typeElements = root.querySelectorAll(".firstWasteType");

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if(dateElements.length === 0 || typeElements.length === 0 || dateElements.length !== typeElements.length){
      await sendTelegram(`De site is gewijzigd, kan niet achterhalen wat de datum is :(`);
    }else{
      for(let index = 0; index < dateElements.length; index++){
        let date = dateElements[index].innerText;
        let dateNumber = (date.match(/\d+/) || [])[0];
        let type = typeElements[index].innerText;

        if(date !== "vandaag" && dateNumber == tomorrow.getDate()){
          await sendTelegram(`Dag Bois, vandaag moet het ${type} afval buiten worden gezet :)`);
        }else{
          console.log("Vandaag is niet de dag");
        }
      }
    }
  }catch(err){
    console.log(err);
    await sendTelegram(`Er gaat iets fout met het ophalen of achterhalen :(. Fix it Jimmy`);
  }
}

async function sendTelegram(message){
  var formdata = new FormData();
  formdata.append("chat_id", chatId);
  formdata.append("text", message);

  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  console.log(message);
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, requestOptions);
}

module.exports.handler = main;