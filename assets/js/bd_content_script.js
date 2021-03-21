const FACEBOOK_PREFIX = '[hb_facebook]';
const FACEBOOK_VERSION = {
    OLD: 'Old',
    NEW: 'New'
}

const parseElement = {
    'Old': {
        'HBBLockPage': '#home_birthdays .fbRemindersStory a span:first',
        'HBBlockPopup': 'body > div > div[role="dialog"] > div > div[style="opacity: 1;"] > div > div:nth-child(2)',
        'HBCards': '> div',
        'HBPlaceOfMessage': 'textarea',
        'HBMessageInput': 'input.mentionsHidden',
        'HBSendMsgBtn': 'button[type="submit"]'
    },
    'New': {
        'HBBLockPage': 'div[role="complementary"] > div > div > div > div.cxgpxx05 > div > div.l9j0dhe7' +
            ' > div.cxgpxx05.sj5x9vvc div.qzhwtbm6.knvmm38d > span > strong',
        'HBBlockPopup': 'div[role="dialog"] > div.sjgh65i0 > div > div > div > div',
        'HBCards': 'div > div.j83agx80.pybr56ya.rz4wbd8a.a8nywdso',
        'HBPlaceOfMessage': 'form div._5rp7 > div._5rpb > div[role="textbox"]',
        'HBSendMsgBtn': 'input[type="submit"]'
    }
}

const getHBCards = (pageElements) => new Promise(resolve => {
    const waitHBCards = setInterval(()=>{
        const HBBlockPopup = $(pageElements['HBBlockPopup']);
        const HBCards = HBBlockPopup.find(pageElements['HBCards']);

        if (HBCards.length) {
            clearInterval(waitHBCards);
            resolve(HBCards);
        }
    }, 1000);
    setTimeout(() => {
        clearInterval(waitHBCards);
        resolve(null);
    }, 20000);
});


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendBDMessages() {
    try {
        console.log('Wait while load page', Date.now());
        await pending(20000);
        console.log('Page loaded', Date.now());
        const facebookVersion = $('#globalContainer').length ? FACEBOOK_VERSION.OLD : FACEBOOK_VERSION.NEW;
        printInfo(facebookVersion + ' version facebook');

    
        const pageElements = parseElement[facebookVersion];
    
        const HBBLockPage = $(pageElements['HBBLockPage']).first();
        if (!HBBLockPage.length) {
            printInfo('There are no birthdays today');
        } else {
            printInfo('There are birthdays today');
    
            HBBLockPage.click();
            const HBCards = await getHBCards(pageElements);
            if (!HBCards) {
                printInfo('Happy Birthday cards not found');
            } else {
                printInfo('Happy Birthday cards were found');            
               
                let i = 1;
                for (const card of HBCards) {
                    const cardPrefix = '[Card ' + i + ']';
                    var url = $(card).find('a').attr("href");
                    var alphaNumericId = '';
                    if (url.indexOf('profile.php') > -1) {
                        alphaNumericArray = url.split('profile.php?id=');
                        alphaNumericId= alphaNumericArray[alphaNumericArray.length-1];
                        if(alphaNumericId.indexOf('&')){
                                alphaNumericId=alphaNumericId.split('&')[0];
                        }
                    } else {    
                        alphaNumericArray= url.split('/');
                        alphaNumericId= alphaNumericArray[alphaNumericArray.length-1];
                        if(alphaNumericId.indexOf('?')){
                            alphaNumericId=alphaNumericId.split('?')[0];
                        }
                    }

                    i++;
                    let can_send = await checkProcessHBFbId(alphaNumericId,'facebook');
                    if(can_send.error){
                        await pending(2000 * i);                   

                        let resp = await getTLMessageToSend('facebook');                   
                        if (resp.error) {	
                            printInfo("Didn't get tl message");                        
                            resp = await getDMMessageToSend('facebook');
                            if (resp.error) {
                                printInfo("Didn't get DM message");
                            } else {                            
                                // Insert message from storage
                                let HBMessage = resp.message;
    
                                // Change name pattern on person name
                                HBMessage = replaceNamePattern(facebookVersion, card, cardPrefix, HBMessage,mylocation);
    
                                console.log(HBMessage); 
    
                                if (typeof(alphaNumericId) == undefined || !alphaNumericId.length) {
                                    printInfo(cardPrefix + 'Place of birthday message not found');
                                } else {
                                    printInfo(cardPrefix + 'Place of birthday message were found');
    
                                    await  sendDMMessage(alphaNumericId,HBMessage).then(async(result) => {
                                        if (result) {
                                            await sleep(10000);
                                            //break;
                                            printInfo(cardPrefix + 'Message has been sent');       
                                        }
                                    });
                                
                                                        
                                }
                            }
                            await sleep(5000);
                        }
                        else {
                            // Insert message from storage
                            let HBMessage = resp.message;
    
                            // Change name pattern on person name
                            HBMessage = replaceNamePattern(facebookVersion, card, cardPrefix, HBMessage,mylocation);
    
                            console.log(HBMessage);
    
                            const HBPlaceOfMessage = $(card).find(pageElements['HBPlaceOfMessage']).first();
                            if (!HBPlaceOfMessage.length) {
                                printInfo(cardPrefix + 'Place of birthday message not found');
                            } else {
                                printInfo(cardPrefix + 'Place of birthday message were found');
    
                                switch (facebookVersion) {
                                    case FACEBOOK_VERSION.OLD: {
                                        // Set the message to the desired location
                                        HBPlaceOfMessage.val(HBMessage);
    
                                        const HBMessageInput = $(card).find(pageElements['HBMessageInput']);
                                        if (!HBMessageInput.length) {
                                            printInfo(cardPrefix + 'Input for birthday message not found');
                                        } else {
                                            printInfo(cardPrefix + 'Input for birthday message were found');
                                        
                                            HBMessageInput.val(HBMessage);
                                        }
    
                                        await sleep(5000);
    
                                        // Sending message
                                        $(card).find($(pageElements['HBSendMsgBtn']))[0].click();
    
                                        break;
                                    }
                                    case FACEBOOK_VERSION.NEW: {
                                        // Set the message to the desired location
                                        //HBPlaceOfMessage[0].dispatchEvent(new InputEvent('textInput', {data: HBMessage, bubbles: true}));
    
                                        //var rx = ;
    
                                        var emojiStringToArray = function (str) {
                                        split = str.split(/(\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83E\uDDD1(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB-\uDFFE])|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83E\uDDD1(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC3B\u200D\u2744|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDF])\u200D[\u2640\u2642])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F?|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD]))/);
                                        arr = [];
                                        for (var i=0; i<split.length; i++) {
                                            char = split[i]
                                            if (char !== "") {
                                            arr.push(char);
                                            }
                                        }
                                        return arr;
                                        };
    
                                        let subMessages = emojiStringToArray(HBMessage);
    
                                        console.log(subMessages);
    
                                        
                                        function timeout() {
                                            return new Promise(function(resolve, reject) {
                                                setTimeout(async function () {
                                                    if (subMessages.length) {
                                                        let mes = subMessages.shift();
                                                        console.log(mes);
                                                        HBPlaceOfMessage[0].dispatchEvent(new InputEvent('textInput', {data: mes, bubbles: true}));
                                                        await timeout();
                                                        resolve();
                                                    } else {
                                                        await sleep(1000);
                                                        $(card).find(pageElements['HBSendMsgBtn']).trigger("click");
                                                        resolve();
                                                        
                                                    }
                                                }, 1000);
                                            })
                                        }      
    
                                        await timeout()   
    
                                        console.log("finished timout");                           
                                        
                                        break;
                                    }
                                }
    
                                //break;
                                printInfo(cardPrefix + 'TL message has been sent');
    
                                // setLastMessage(localData, 'facebook');
                            }
                            
                            resp = await getDMMessageToSend('facebook');
                            if (resp.error) {
                                printInfo("Didn't get DM message");
                            } else {
                                await sleep(30000);
                               
                                // Insert message from storage
                                let HBMessage = resp.message;
    
                                // Change name pattern on person name
                                HBMessage = replaceNamePattern(facebookVersion, card, cardPrefix, HBMessage,mylocation);
    
                                console.log(HBMessage); 
    
                                if (typeof(alphaNumericId) == undefined || !alphaNumericId.length) {
                                    printInfo(cardPrefix + 'Place of birthday message not found');
                                } else {
                                    printInfo(cardPrefix + 'Place of birthday message were found');
                                   
                                    await  sendDMMessage(alphaNumericId,HBMessage).then(async(result) => {
                                        if (result) {
                                            await sleep(10000);
                                            //break;
                                            printInfo(cardPrefix + 'DM message has been sent');       
                                        }
                                    });
                                
                                                        
                                }
                            }
                            await sleep(5000);
                        }   
                    }                                    
                }                
            }
        }
    
        await sleep(5000);
    } catch(err) {
        closeFbTab();
    }
    
}

function printInfo(text) {
    console.log(FACEBOOK_PREFIX + text);
}


// const inFrame = () => {
//     if (window.name === IFRAME_FACEBOOK.name) {
//         console.log('in frame');
//         return true;
//     } else {
//         console.log('not frame')
//         return false;
//     }
// }

// if (inFrame()) {
//     sendHBMessages()
//         .then(()=> {
//             chrome.runtime.sendMessage({"action" : ACTIONS.REMOVE_IFRAME});
//         });
// }
var mylocation='';
$(document).ready(() => {
    chrome.storage.local.get(["linkedFbAccount"], function(result) {        
        if (typeof result.linkedFbAccount.location != "undefined" && result.linkedFbAccount.location != "" && result.linkedFbAccount.location != null){
            mylocation = result.linkedFbAccount.location;
        }
    });
    checkTab()
    .then((resultCheckTab) => {
        if (resultCheckTab === true) {
            sendBDMessages()
            .then(()=>{
                setHBDate('facebook').then((resultSetHBDate)=>{
                    closeFbTab()
                })           
            })            
        }
    });
})

function checkTab() {
    return new Promise (function (resolve, reject) {
        sleep(5000)
        .then(() => {
            let reqArr = Object.values(HB_DATA);            
            chrome.storage.local.get(reqArr, function(result) {
                const work = result[HB_DATA.IS_WORKING];
                chrome.runtime.sendMessage({
                    action: ACTIONS.CHECK_TAB,
                    storageTabId: result[HB_DATA.FB_TAB_ID]
                },
                function(resp) {
                    console.log('check tab id from storage and current tab', resp);
                    if (work === "0" || work === undefined) {
                        resp = false;
                    }
                    resolve(resp);
                })
            })
        })
        
    })
}

function closeFbTab() {
    chrome.runtime.sendMessage({
        action: ACTIONS.CLOSE_LI_TAB,
        fromTab: 'fb'
    })
}
async function checkProcessHBFbId(threadId,from) {
    return new Promise (function (resolve, reject) {
        chrome.runtime.sendMessage({
            action: ACTIONS.CAN_SEND,
            threadId: threadId,
            from: from
        },
        function(resp) {
            console.log('send hb message', resp);                   
            resolve(resp);
        })
    })    
}
async function sendDMMessage(threadId, dmMessage) {
    return new Promise (function (resolve, reject) {
        sleep(5000)
        .then(() => {            
            let reqArr = Object.values(HB_DATA);            
            chrome.storage.local.get(reqArr, function(result) {
                const work = result[HB_DATA.IS_WORKING];
                chrome.runtime.sendMessage({
                    action: ACTIONS.SEND_DM_MESSAGE,
                    threadId: threadId,
                    dmMessage: dmMessage
                },
                function(resp) {
                    console.log('send direct message', resp);                   
                    resolve(resp);
                })
            })
        })
        
    })
}
function triggerDMRequestSendMessage(bulkMsgText) {
	return new Promise(function(resolve, reject) {       
        var delay=1000;
        if(bulkMsgText.includes("|")){
            isNameSet = setInterval(()=>{

                if ($('.mToken').length > 0 && $('.mToken').text().length > 0) {
                    clearInterval(isNameSet)
                    
                    var res = bulkMsgText.split("|");		
                    res.forEach(function(text){			
                        let messId=setTimeout(()=>{
                            $('textarea').val(text);
                            setTimeout(()=>{
                                setTimeout(()=>{
                                    if ($('button[name="Send"]').length > 0) {
                                        $('button[name="Send"]').mclick();
                                    }else if($('input[name="Send"]').length > 0){
                                        $('input[name="Send"]').mclick();
                                    }
                                }, 200)
                                
                            },500);
                            message_total_send = message_total_send + 1;
                        },delay);
                        bulkMessageTimeout.push(messId);
                        delay=delay+1000;
                    });	
                }
            },200)	
        } 
        else{
            isNameSet = setInterval(()=>{

                if ($('.mToken').length > 0 && $('.mToken').text().length > 0) {
                    clearInterval(isNameSet)
                    $('textarea').val(bulkMsgText);
        
                    setTimeout(()=>{
                        chrome.runtime.sendMessage({closeRequestMessageTab: "closeRequestMessageTab"});	
                        setTimeout(()=>{
                            if ($('button[name="Send"]').length > 0) {
                                $('button[name="Send"]').mclick();
                            }else if($('input[name="Send"]').length > 0){
                                $('input[name="Send"]').mclick();
                            }
                        }, 200)
                        
                    },500);
        
                }
            },200)	
        }

        setTimeout(()=>{
            clearTimeOutIntervals();
            chrome.runtime.sendMessage({closeRequestMessageTab: "closeRequestMessageTab"});	
        },30000);             
        resolve();
    })	
}
console.log(window)