function getTLMessageToSend(from) {
    let returnValue = {
        error: true
    }
    return new Promise(function(resolve,reject) {

        let reqArr = Object.values(HB_DATA);
        chrome.storage.local.get(reqArr, function(result) {
            chrome.runtime.sendMessage({
                action: ACTIONS.GET_SEND_MESSAGE,
                from: from,
                data: result
            }, function(res) {
                console.log('Result from get message from back:', res);
                returnValue = res;
                resolve(returnValue);
            });
        })

    })
}
function getDMMessageToSend(from) {
    let returnValue = {
        error: true
    }
    return new Promise(function(resolve,reject) {

        let reqArr = Object.values(HB_DATA);
        chrome.storage.local.get(reqArr, function(result) {
            chrome.runtime.sendMessage({
                action: ACTIONS.GET_SEND_DM_MESSAGE,
                from: from,
                data: result
            }, function(res) {
                console.log('Result from get message from back:', res);
                returnValue = res;
                resolve(returnValue);
            });
        })

    })
}
function setLastMessage(localData, from) {
    let returnValue = {
        error: true
    }
    localData.TIME = Date.now();
    return new Promise(function(resolve,reject) {

        chrome.runtime.sendMessage({
            action: ACTIONS.SET_LAST_MESSAGE,
            from: from,
            localData: localData
        });

        pending(1000).then(() => {
            returnValue.error = false;
            resolve(returnValue);
        })

    })
}
function setHBDate(from) {    
    return new Promise(function(resolve,reject) {

        chrome.runtime.sendMessage({
            action: ACTIONS.SET_HB_DATE,
            from: from
        }, function(res) {
            console.log('Result from set hbdate from back:', res);            
            resolve(true);
        });

    })
}

function pending(sleepTime) {
    return new Promise(function(resolve, reject) {
        setTimeout(()=>{
            console.log('end sleep');
            resolve();
        }, sleepTime);
    })
}