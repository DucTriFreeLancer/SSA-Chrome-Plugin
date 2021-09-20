
var id = randomId(8);
var opt = {
	type: "basic",
	title: "",
	message: "",
	iconUrl: "assets/images/64.png"
}
Sentry.init({ dsn: 'https://68cd9829dc3944b3a6e0e14f81538821@o916249.ingest.sentry.io/5857548' });
var baseUrl = custom_data.baseUrl;
////////// ADF welcome messages /////////
var friendRequestTabIdsADF = [];
////////// HB direct messages /////////
var dmRequestTabIds = [];
////////// CB direct messages /////////
var dmCBRequestTabIds = [];
////////// MR direct messages /////////
var dmMRMessageTabIds =[];
////// friend request messages////////
var friendRequestSettings = false;
var friendRequestHistory = [];
var friendRequestTabIds = [];
var friendRequestMessageIntervalTime = 10;
var friendRequestsInterval = true;

///////friend request messages ////

var bulkMessageTabId = 0;
var bulkMessageStatus = true;
var uniqueHash = null;
////////////Re bulk message///
var bulkMessageStatus = true;

var bulkTaggedUserArray = [];
var bulkUserDelay = 0;
var bulkMessageTextArray = [];
var sendRandomMessage = false;
var removeFromTag = false;
var bulkSendMessageLimit = 0;
var bulkIntervalIds = [];
var bulkArrayCounter = 0;

var RebulkMessageTabId = 0;

var sendLimitOfBulkMessage = 0;

var bulkParentTabId = 0;

var totalBulkArrayContacts = 0;
///////////end re bulk messages////////////

var ssaPopupStates = { selected_tag: '', selected_template: '', last_screen: '' };

//These make sure that our function is run every time the browser is opened.
chrome.storage.local.get(["ssaPopupStates"], function (result) {

	if (typeof result.ssaPopupStates == "undefined" && result.ssaPopupStates != "") {
		chrome.storage.local.set({ ssaPopupStates: ssaPopupStates });
	}
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (typeof changeInfo.url != "undefined" && changeInfo.url.indexOf('facebook.com/messages/t/') > -1) {
		chrome.tabs.update(tabId, { url: 'https://www.messenger.com' });
	}
});
var extraInfo = ["blocking", "requestHeaders", "extraHeaders"];
if (-1 < navigator.userAgent.indexOf("Firefox")) {
  extraInfo.pop();
}
chrome.webRequest.onBeforeSendHeaders.addListener(function(headers) {
  headers = headers.requestHeaders;
  var c = headers.findIndex(function(engineDiscovery) {
	return "Origin" === engineDiscovery.name;
  });
  if (-1 === c) {
	headers.push({
	  name : "Origin",
	  value : "https://www.facebook.com"
	});
  } else {
	/** @type {string} */
	headers[c].value = "https://www.facebook.com";
  }
  c = headers.findIndex(function(params) {
	return "referer" === params.name;
  });
  if (-1 === c) {
	headers.push({
	  name : "Referer",
	  value : "https://www.facebook.com"
	});
  } else {
	/** @type {string} */
	headers[c].value = "https://www.facebook.com";
  }
  return {
	requestHeaders : headers
  };
}, {
  urls : ["https://*.facebook.com/*"]
}, extraInfo);
// Oninstall though window.open can be blocked by popup blockers
chrome.runtime.onInstalled.addListener(function (details) {
	let reqArr = Object.values(HB_DATA);
	chrome.storage.local.get(reqArr, (result) => {
		const storageObj = {};

		if (details.reason === 'install') {
			console.log('Extension has been installed');

			storageObj[HB_DATA.BDTLMSG] = {};
			storageObj[HB_DATA.BDDMMSG] = {};
			storageObj[HB_DATA.IS_WORKING] = "1";
			storageObj[HB_DATA.LOCAL_FB] = SENDING_DATA;
			storageObj[HB_DATA.CAN_SEND] = true;			
		} else if (details.reason === 'update') {
			if (result[HB_DATA.CAN_SEND] === undefined) {
				storageObj[HB_DATA.CAN_SEND] = true;
			}
			storageObj[HB_DATA.IS_WORKING] = "1";
		}

		chrome.storage.local.set(storageObj);
	})
	chrome.storage.local.set({"ssa_group": ''});
	chrome.storage.local.set({"all_groups": ''});
	installPageUrlLogic();
	initialize();
	reloadAllTabsOnLogout();
});

chrome.runtime.onStartup.addListener(function () {
	initialize();
	reloadAllTabsOnLogout();
});

function installPageUrlLogic() {
	chrome.cookies.get({ url: baseUrl, name: "ssa_user" }, function (result) {
		if (result != null) {

		} else {
			window.open('https://socialsalesaccelerator.app/installed', '_blank');
		}
	});
}

function reloadAllTabsOnLogout() {
	chrome.windows.getAll(function (windows) {
		windows.forEach(function (eachWindow) {
			if (eachWindow.type == "normal") {
				chrome.tabs.getAllInWindow(eachWindow.id, function (tabs) {
					for (var i = 0, tab; tab = tabs[i]; i++) {
						if (tab.url && (tab.url.indexOf('/inbox') != -1 || tab.url.indexOf('facebook.com/messages') != -1 || tab.url.indexOf('messenger.com') != -1 || tab.url.indexOf('facebook.com') != -1)) {
							chrome.tabs.reload(tab.id);
						}
					}
				});
			}
		});
	});
}


function initialize() {
	chrome.cookies.get({ url: baseUrl, name: "cts_unique_hash" }, function (result) {
		if (result != null) {
			uniqueHash = result.value;
		}
	});

	chrome.cookies.get({ url: custom_data.baseUrl, name: "ssa_user" }, function (result) {
		if (result != null) {
			get_subscriber_data(result.value);
		}
	});
}

chrome.storage.local.get(["ssa_user", "tags", "fb_id", "taggedUsers"], function (result) {
	if (typeof result.ssa_user == "undefined") {
		chrome.storage.local.set({ 'ssa_user': '' });
	}

	if (typeof result.tags == "undefined") {
		chrome.storage.local.set({ 'tags': '' });
	}

	if (typeof result.fb_id == "undefined") {
		chrome.storage.local.set({ 'fb_id': '' });
	}

	if (typeof result.taggedUsers == "undefined") {
		chrome.storage.local.set({ 'taggedUsers': '' });
	}

	if (typeof result.ADF_groupSettings == "undefined") {
		chrome.storage.local.set({ 'ADF_groupSettings': '' });
	}

	if (typeof result.ADF_state == "undefined") {
		chrome.storage.local.set({ 'ADF_state': '' });
	}
});


// Uninstall
chrome.runtime.setUninstallURL('https://socialsalesaccelerator.app/uninstalled');

chrome.webRequest.onBeforeRequest.addListener(
	requestHandler,
	{
		urls: ["*://*.facebook.com/*"],
		types: ["main_frame"]
	},
	["blocking"]
);

getUserNotes(null, null);

function getRedirectUrl(currentUrl) {
	if (currentUrl.indexOf('facebook.com/messages/t/') >= 0) {
		return 'https://www.messenger.com';
	} else {
		return currentUrl.replace("?_rdc=1&_rdr", "");
	}
}

function requestHandler(details) {
	return {
		redirectUrl: getRedirectUrl(details.url)
	};
}

// Listen for message to reload current page
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.reloadFbPage == 'yes') {
		custom_data = message;
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
		});
	} else if (message.saveBlukMessageState == 'saveBlukMessageState') {
		if (message.status == 'running') {
			bulkMessageTabId = sender.tab.id;
			bulkMessageStatus = message.status;
		} else if (message.status == 'paused') {
			bulkMessageTabId = sender.tab.id;
			bulkMessageStatus = message.status;
		} else if (message.status == 'stop' || message.status == 'completed') {
			bulkMessageTabId = 0;
			bulkMessageStatus = true;
			if (message.status == 'completed') {
				chrome.runtime.sendMessage({ action: 'bulkMessageComplete' });
			}
		}
	} else if (message.getBlukMessageState == 'getBlukMessageState') {
		if (bulkMessageTabId > 0) {
			chrome.tabs.get(bulkMessageTabId, function (tab) {
				if (tab == undefined) {
					bulkMessageTabId = 0;
					bulkMessageStatus = true;
					chrome.runtime.sendMessage({ action: 'bulkmsgstate', bulkMessageTabId: bulkMessageTabId, bulkMessageStatus: bulkMessageStatus });
				} else {
					chrome.runtime.sendMessage({ action: 'bulkmsgstate', bulkMessageTabId: bulkMessageTabId, bulkMessageStatus: bulkMessageStatus });
				}
			});
		} else {
			chrome.runtime.sendMessage({ action: 'bulkmsgstate', bulkMessageTabId: bulkMessageTabId, bulkMessageStatus: true });
		}
	} else if (message.triggerChatMessage == 'triggerChatMessage') {
		setTimeout(() => {
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: 'triggerClickToSendChat' });
		}, 5000);
	} else if (message.triggerChatImage == 'triggerChatImage') {
		chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: 'triggerClickToSendImage' });
	} else if (message.randomHashForBackgroundCTS == 'randomHashForBackgroundCTS') {
		uniqueHash = message.uniqueHash;
	} else if (message.saveTagFromContent == 'saveTagFromContent') {
		saveTagFromContent(message.data, sender.tab.id);
	} else if (message.getUserNotes == 'getUserNotes') {
		if (message.integrateSSAFeature) {
			getUserNotes(message.fb_user_id, null);
		} else {
			getUserNotes(message.fb_user_id, sender.tab.id);
		}
	} else if (message.saveNoteFromContent == 'saveNoteFromContent') {
		saveNoteFromContent(message.data, sender.tab.id);
	} else if (message.deleteNoteFromContent == 'deleteNoteFromContent') {
		deleteNoteFromContent(message.noteId, sender.tab.id);
	} else if (message.friendRequestsFromContent == 'friendRequestsFromContent') {
		sendPostMessage(message.data);
		chrome.tabs.remove(sender.tab.id);
	} else if (message.closeRequestMessageTab == 'closeRequestMessageTab') {
		foundMessageSendTab = friendRequestTabIds.filter((list) => { return list.tabId == sender.tab.id });
		if (foundMessageSendTab.length > 0) {
			addFriendRequestHistory(foundMessageSendTab[0].currentRequestId);
		}
		setTimeout(() => {
			chrome.tabs.remove(sender.tab.id);
		}, 3000)
	} else if (message.confimFriendRequestsFromContent == 'confimFriendRequestsFromContent') {
		saveSendFriendRequests(message.data);
		chrome.tabs.remove(sender.tab.id);
	} else if (message.requestRequestMessageSettingUpdated == 'requestRequestMessageSettingUpdated') {

		clearInterval(friendRequestsInterval);
		//friendRequestMessageIntervalTime = parseInt(message.request_message_interval);
		startPostMessageInterval();

	} else if (message.setFbIdForAll == 'setFbIdForAll') { //setFbIdForMessenger
		currentFBLogin(sender.tab.id);
	} else if (message.action == 'content_script') {
		profile_pic = message.profilePic;
		// updateAccountImage(profile_pic);

	} else if (message.action == 'taggedUserfromGroupleads') {
		getAllTagsFromGropuleads(message.taggedUserfromGroupleads);
	} else if (message.action == 'create_tab') {
		chrome.tabs.create({
			'url': message.url
		});
	}
	// }else if (message.action == 'triggerShowPopup'){
	//     chrome.tabs.create({
	//     	'url': message.url
	//     });
	// }
	else if (message.action == 'sendWelcomeMessageADF') {

		sendWelcomeMessageADF(message.adfMemberId, message.welcomeMessageTextAdf)
	} else if (message.action == 'startScBulk') {

		scBulkArrayCounter = 0;
		chrome.storage.local.get(["selectedContactsArray", "scBulkSettings"], function (result) {

			selectedContactsArray = result.selectedContactsArray;
			totalScBulkArrayContacts = result.selectedContactsArray.length;
			scBulkParentTabId = parseInt(result.scBulkSettings.tabId);
			scBulkSettings = result.scBulkSettings;
			chrome.tabs.sendMessage(scBulkParentTabId, { from: 'background', subject: 'scBulkCounter', current: 0, totalScBulkArrayContacts: totalScBulkArrayContacts });
			startScBulkMessage();
		})
	} else if (message.action == 'pauseScBulk') {

		clearScBulkIntervals();
		chrome.storage.local.get(["scBulkSettings"], function (result) {
			var scBulkSettingsTemp = result.scBulkSettings
			scBulkSettingsTemp.state = 'paused';
			chrome.storage.local.set({ 'scBulkSettings': scBulkSettingsTemp }, function () { });
		});

		chrome.tabs.sendMessage(scBulkParentTabId, { from: 'background', subject: 'scBulkStateMsg', msg: 'Paused' });

	} else if (message.action == 'resumeScBulk') {
		chrome.storage.local.get(["scBulkSettings"], function (result) {
			var scBulkSettingsTemp = result.scBulkSettings
			scBulkSettingsTemp.state = 'running';
			chrome.storage.local.set({ 'scBulkSettings': scBulkSettingsTemp }, function () { });
		});
		startScBulkMessage();
		chrome.tabs.sendMessage(scBulkParentTabId, { from: 'background', subject: 'scBulkStateMsg', msg: 'Processing' });
	} else if (message.action == 'stopScBulk') {
		chrome.storage.local.get(["scBulkSettings"], function (result) {
			chrome.storage.local.set({ 'scBulkSettings': '' }, function () { });
		});
		chrome.tabs.sendMessage(scBulkParentTabId, { from: 'background', subject: 'scBulkStateMsg', msg: 'Stopped' });
		clearScBulkIntervals();
	} else if (message.action == 'startBulkFromBackground') {  //555

		prepareDataForBulkMessage(message);
	}

	else if (message.action == 'pause-bulk') {

		bulkMessageStatus = 'paused';
		clearBulkIntervals();
		chrome.tabs.sendMessage(bulkParentTabId, { from: 'background', subject: 'bulkStateMsg', msg: 'Paused' });
	} else if (message.action == 'resume-bulk') {

		bulkMessageStatus = 'running';

		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			bulkParentTabId = tabs[0].id;
		})


		if (message.sendLimitOnResume != '') {
			sendLimitOfBulkMessage = parseInt(sendLimitOfBulkMessage) + parseInt(message.sendLimitOnResume);
		} else {
			sendLimitOfBulkMessage = totalBulkArrayContacts;
		}

		chrome.storage.local.get(["bulkMessageSettings"], function (result) {
			result.bulkMessageSettings.sendLimit = parseInt(sendLimitOfBulkMessage);
			chrome.storage.local.set({ "bulkMessageSettings": result.bulkMessageSettings })
		});

		readLastStateOfTaggedUserArray()
		chrome.tabs.sendMessage(bulkParentTabId, { from: 'background', subject: 'bulkStateMsg', msg: 'Processing' });
	} else if (message.action == 'stop-bulk') {

		chrome.tabs.sendMessage(bulkParentTabId, { from: 'background', subject: 'bulkStateMsg', msg: 'Stopped' });
		bulkParentTabId = 0;
		bulkMessageStatus = true;
		clearBulkIntervals();

		setBlankCookies();
	} else if (message.action == 'getUniqueContacts') {
		chrome.runtime.sendMessage({ 'action': 'bulk-popup-counter', uniqueCon: totalBulkArrayContacts, bulkCounter: bulkArrayCounter });
	} else if (message.action == 'saveSuggestionAdfKeyword') {
		saveSuggestionAdfKeyword(message.data);
	} else if (message.friendRequestsFromContentClose == 'friendRequestsFromContentClose') {
		chrome.tabs.remove(sender.tab.id);
	}  else if (message.action == 'startHBProcess') {
		sendMessageFB();
	}	else if (message.action == ACTIONS.GET_SEND_MESSAGE) {
		const { from, data } = message;
		
		getMesResp = getTLMessageToSend(from, data);
		console.log('Response in back from get message', getMesResp);
		sendResponse(getMesResp);

	} else if (message.action == ACTIONS.GET_SEND_DM_MESSAGE) {
		const { from, data } = message;
		
		getMesResp = getDMMessageToSend(from, data);
		console.log('Response in back from get message', getMesResp);
		sendResponse(getMesResp);

	} else if (message.action == ACTIONS.SET_LAST_MESSAGE) {
		const { from, localData } = message;
		storageObj = {};
		if (from === 'facebook') {
			storageObj[HB_DATA.LOCAL_FB] = localData;
		}
		chrome.storage.local.set(storageObj);
	} else if (message.action == ACTIONS.SET_HB_DATE) {
		const { from } = message;
		if (from === 'facebook') {
			updateBdDate().then((getMesResp)=>{
				sendResponse(getMesResp);
			});		
		}
	} else if (message.action == ACTIONS.CHECK_TAB) {
		const tabId = sender.tab.id;
		const { storageTabId } = message;
		let resp = false;
		if (storageTabId === tabId) resp = true;
		sendResponse(resp);	

	} else if (message.action == ACTIONS.SEND_DM_MESSAGE) {
		const tabId = sender.tab.id;
		const { threadId, dmMessage } = message;
		// let resp = false;
		sendRequestDMMessage(threadId,dmMessage);
		sendResponse(true)

	} else if (message.action == ACTIONS.CLOSE_LI_TAB) {
		const tabId = sender.tab.id;
		const { fromTab } = message;
		chrome.tabs.remove(tabId);
		let storageObj = {};
		if (fromTab === 'fb') {
			storageObj[HB_DATA.FB_TAB_ID] = 0;
			chrome.storage.local.set(storageObj);
		}
	} else if (message.action == ACTIONS.CAN_SEND) {
		const tabId = sender.tab.id;
		const { threadId,from } = message;
		if (from === 'facebook') {
			processBdayMessage(threadId).then((getMesResp)=>{
				sendResponse(getMesResp);
			});		
			return true;
		}		
	}else if (message.action == 'sendCBRequestDMMessage') {
		const { threadId, dmMessage } = message;
		sendCBRequestDMMessage(threadId,dmMessage)
	}else if (message.action == "get_tagged_user") {
		const { data,from } = message;
		if (from === 'facebook') {
			getTaggedUsers(data).then((getMesResp)=>{
				sendResponse(getMesResp);
			});		
			return true;
		}
	}		
	else if (message.action == ACTIONS.GET_PIPE_STATUS) {
		const { from, userId,messageType,tagId } = message;		
		if (from === 'facebook') {
			processPipeStatus(userId,messageType,tagId).then((getMesResp)=>{
				sendResponse(getMesResp);
			});		
			return true;
		}	
	}
	else if (message.action == "addSelectedFriendToPipe") {
		addSelectedFriendToPipe(message.data).then((getMesResp)=>{
			sendResponse(getMesResp);
		});		
		return true;
	}
	else if (message.action == "importAllFriend") {
		importAllFriend(message.data).then((getMesResp)=>{
			sendResponse(getMesResp);
		});		
		return true;
	}
	

})
async function updateBdDate(){
	return new Promise(function(resolve,reject) {
		let returnValue = {
			error: true
		};
		// Save new date
		chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		  if( typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != ""  ){
			  $.ajax({
				  type: "POST",
				  url: apiBaseUrl + "/users/updateBday",
				  data: {userId:result.ssa_user.id,bDay: moment(new Date($.now()), "MMMM Do YYYY").format("YYYY-MM-DD")},
				  dataType: 'json',
				  beforeSend: function (xhr) {
					  xhr.setRequestHeader('unique-hash', uniqueHash);
				  }
			  }).done(function(response) {
				  if(response.status == 401){
					  chrome.storage.local.set({'ssa_user':''});	
				  }else if (response.status == 404) {
					  //port.postMessage({'false': true});
				  } else {
					  const storageObj = {};					
					  storageObj[HB_DATA.LAST_DATE] = response.lastbdaydate;
					  chrome.storage.local.set(storageObj); 
					  returnValue.error = false;                   
				  }	
				  resolve(returnValue);		  
			  });	
		  }
		}) 
	});	
}
function getTLMessageToSend(from, data) {
	let localData;
	let tlMessages = data[HB_DATA.BDTLMSG];
	let returnValue;
	if (from === 'facebook') {
		localData = data[HB_DATA.LOCAL_FB];
	}

	returnValue = getOneMessage(localData, tlMessages);
	console.log('response from method', returnValue);
	return returnValue;
}

function getOneMessage(localData, tlMessages) {
	let returnValue = {
		error: true,
		message: '',
		localData: SENDING_DATA
	};
	
	if ( typeof tlMessages != undefined && tlMessages != null && tlMessages.length > 0) {
		let i = Math.floor(Math.random() * tlMessages.length);
		let tlMessage = tlMessages[i];
		returnValue.message = tlMessage.message;
		returnValue.error = false;
		returnValue.localData = {
			LAST_MESSAGE: tlMessage.message,
			LAST_INDEX: i,
			TIME: Date.now()
		};
		console.log('response from method', returnValue);
		return returnValue;
	}
	return returnValue;

}
function getDMMessageToSend(from, data) {
	let returnValue = {
		error: true,
		message: '',
		localData: SENDING_DATA
	};
	let dmMessages = data[HB_DATA.BDDMMSG];
	if (dmMessages != null && dmMessages.length > 0) {
		let i = Math.floor(Math.random() * dmMessages.length);
		let dmMessage = dmMessages[i];
		returnValue.message = dmMessage.message;
		returnValue.error = false;
		returnValue.localData = {
			LAST_MESSAGE: dmMessage.message,
			LAST_INDEX: i,
			TIME: Date.now()
		};
		console.log('response from method', returnValue);
		return returnValue;
	}
	return returnValue;
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tabId === bulkMessageTabId && changeInfo.status === 'loading') {
	}
});

// Listen for port messages
chrome.runtime.onConnect.addListener(function (port) {
	var sender = port.sender
	port.onMessage.addListener(function (message) {

		// get-form-data --- To send form data to script
		if (message.type == 'get-form-data') {
			port.postMessage({ 'data': custom_data })
		}
		if (message.type == 'verifyUserLogin') {
			//verifyUserLogin();
			chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
				if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/users/data",
						data: { userId: result.ssa_user.id, fb_id: result.fb_id },
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {
						if (response.status == 401) {
							chrome.storage.local.set({ 'ssa_user': '' });
						} else if (response.status == 404) {
							//port.postMessage({'false': true});
						} else {
							linkedFbAccount = response.linkedFbAccounts.filter((item) => item.fb_account_id == result.fb_id);
							isCurrentFBLinked = (linkedFbAccount.length > 0) ? true : false;
							linkedFbAccount = (linkedFbAccount.length > 0) ? linkedFbAccount[0] : null;

							chrome.storage.local.set({ 'ssa_user': response.data, 'tags': response.tags.reverse(), 'taggedUsers': response.taggedUsers, 'linkedFbAccount': linkedFbAccount, 'isCurrentFBLinked': isCurrentFBLinked, 'messagetypes': response.messagetypes });
							// chrome.storage.local.set({'birthdays': response.birthdays, 'processbirthdays': response.processbirthdays});
							getAllTagsFromGropuleads(response.taggedUserfromGroupleads);

							port.postMessage({ 'login': true });
						}
					});
				}
			});
		}
		if (message.type == 'updateFBUsertag') {

			var fbUserId = message.data.fbUserId;
			var numericUserFbId = message.data.numericFbId;
			isPage = message.data.isPage;
			if (typeof message.data.newThreadMessenger != 'undefined' && message.data.newThreadMessenger == 1 && message.data.newMThreadId != '0') {

				GetBothAphaAndNumericId(message.data.newMThreadId).then(function (fbIDsObject) {
					message.data.numericFbId = message.data.newMThreadId;
					message.data.fbUserId = fbIDsObject.fb_user_id;
					message.data.thread_fb_id = message.data.newMThreadId;

					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/tagged_users/update",
						data: message.data,
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {

						if (response.status == 401) {
							chrome.storage.local.set({ 'ssa_user': '' });
						} else if (response.status == 200 || response.result == 'success') {
							chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
						}
					});

				});

			} else {

				if (numericUserFbId == '0' || !(/[a-zA-Z]/.test(fbUserId))) {

					GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
						message.data.numericFbId = fbIDsObject.numeric_fb_id;
						message.data.fbUserId = fbIDsObject.fb_user_id;
						$.ajax({
							type: "POST",
							url: apiBaseUrl + "/tagged_users/update",
							data: message.data,
							dataType: 'json',
							beforeSend: function (xhr) {
								xhr.setRequestHeader('unique-hash', uniqueHash);
							}
						}).done(function (response) {

							if (response.status == 401) {
								chrome.storage.local.set({ 'ssa_user': '' });
							} else if (response.status == 200 || response.result == 'success') {
								chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
							}
						});


					});
				} else {

					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/tagged_users/update",
						data: message.data,
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {

						if (response.status == 401) {
							chrome.storage.local.set({ 'ssa_user': '' });
						} else if (response.status == 200 || response.result == 'success') {
							chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
						}
					});
				}

			}
			// if (numericUserFbId == '0' && isPage == 0) {
			// 	GetBothAphaAndNumericId(numericFBid).then(function(fbIDsObject){
			// 		message.data.numericFbId = fbIDsObject.numeric_fb_id;
			// 		message.data.fbUserId = fbIDsObject.fb_user_id;
			// 		$.ajax({
			// 			type: "POST",
			// 			url: apiBaseUrl + "/tagged_users/update",
			// 			data: message.data,
			// 			dataType: 'json',
			// 	        beforeSend: function (xhr) {
			// 	            xhr.setRequestHeader('unique-hash', uniqueHash);
			// 	        }
			// 		}).done(function(response) {

			// 			if(response.status == 401){
			// 	    		chrome.storage.local.set({'ssa_user':''});	
			// 			}else if (response.status == 200  || response.result == 'success') {
			// 				chrome.storage.local.set({'taggedUsers':response.taggedUsers});
			// 			}
			// 		});

			// 	});
			// } else  {

			// 	$.ajax({
			// 		type: "POST",
			// 		url: apiBaseUrl + "/tagged_users/update",
			// 		data: message.data,
			// 		dataType: 'json',
			//         beforeSend: function (xhr) {
			//             xhr.setRequestHeader('unique-hash', uniqueHash);
			//         }
			// 	}).done(function(response) {
			// 		if(response.status == 401){
			//     		chrome.storage.local.set({'ssa_user':''});	
			// 		}else if (response.status == 200 || response.result == 'success') {
			// 			chrome.storage.local.set({'taggedUsers':response.taggedUsers});
			// 		}
			// 	});
			// }
		}
		if (message.type == 'updateFBUserTeam') {

			var numericFBid = message.data.fbUserId;
			var numericUserFbId = message.data.numericFbId;
			isPage = message.data.isPage;

			if (numericUserFbId == '0' && isPage == 0) {
				GetBothAphaAndNumericId(numericFBid).then(function (fbIDsObject) {
					message.data.numericFbId = fbIDsObject.numeric_fb_id;
					message.data.fbUserId = fbIDsObject.fb_user_id;
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/team_members/update",
						data: message.data,
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {
						if (response.status == 401) {
							chrome.storage.local.set({ 'ssa_user': '' });
						} else if (response.status == 200 || response.result == 'success') {
							chrome.storage.local.set({ 'teamMembers': response.data });
						}
					});
				});
			} else {
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/team_members/update",
					data: message.data,
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function (response) {
					if (response.status == 401) {
						chrome.storage.local.set({ 'ssa_user': '' });
					} else if (response.status == 200 || response.result == 'success') {
						chrome.storage.local.set({ 'teamMembers': response.data });
					}
				});
			}
		}

		if (message.type == 'updateFBUsertagForMultiUser') {
			var checkedUsersForFriend = message.data.checkedUsers;
			checkedUsersForFriend.forEach(function (item, i) {
				var fbUserId = item.fb_user_id;
				GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
					item.fb_user_id = fbIDsObject.fb_user_id;
					item.numeric_fb_id = fbIDsObject.numeric_fb_id;

					if (i == checkedUsersForFriend.length - 1) {
						message.data.checkedUsers = checkedUsersForFriend;
						setTimeout(() => {
							$.ajax({
								type: "POST",
								url: apiBaseUrl + "/tags/multi_tag",
								data: message.data,
								dataType: 'json',
								beforeSend: function (xhr) {
									xhr.setRequestHeader('unique-hash', uniqueHash);
								}
							}).done(function (response) {
								if (response.status == 401) {
									chrome.storage.local.set({ 'ssa_user': '' });
								} else if (response.status == 200 || response.result == 'success') {
									chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
								}
							});
						}, 3000);
					}
				});
			})

		}
		if (message.type == 'updateFBUsertagForMultiUserOnGroupMember') {
			var checkedUsersForGroup = message.data.checkedUsers;
			checkedUsersForGroup.forEach(function (item, i) {
				var fbUserId = item.fb_user_id;
				GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
					item.fb_user_id = fbIDsObject.fb_user_id;
					item.numeric_fb_id = fbIDsObject.numeric_fb_id;

					if (i == checkedUsersForGroup.length - 1) {
						message.data.checkedUsers = checkedUsersForGroup;
						setTimeout(() => {
							updateFBUsertagMultiUserForGroupMember(sender, message.data);
						}, 3000);
					}
				});
			})
		}

		if (message.type == 'updateFBPageUsertag') {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tags/update",
				data: message.data,
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {
				if (response.status == 401) {
					chrome.storage.local.set({ 'ssa_user': '' });
				} else if (response.status == 200 || response.result == 'success') {
					chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
				}
			});
		}
		if (message.type == 'deleteFBUsertag') {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tags/delete",
				data: message.data,
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {

			});
		}
		
		if (message.type == 'addUserOnGroupMemberRequest') {
			var memberApproved = message.memberApproved;
			var fbUserId = memberApproved.fbUserid;
			GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
				memberApproved.fbUserid = fbIDsObject.fb_user_id;
				memberApproved.numeric_fb_id = fbIDsObject.numeric_fb_id;

				message.memberApproved = memberApproved;
				setTimeout(() => {
					addFBUserForGroupMember(sender, message.memberApproved);
				}, 3000);
			});
		}
		if (message.type == 'setTagPostLinkForGroup') {
			setTimeout(() => {
				setTagPostLinkForGroup(sender, message.tagPostLink);
			}, 1000);
		}

		if (message.type == 'addExistingMemberOnGroupMember') {
			var memberApproved = message.memberApproved;
			var fbUserId = memberApproved.fbUserid;
			GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
				memberApproved.fbUserid = fbIDsObject.fb_user_id;
				memberApproved.numeric_fb_id = fbIDsObject.numeric_fb_id;

				message.memberApproved = memberApproved;
				setTimeout(() => {
					addExistingFBUserForGroupMember(sender, message.memberApproved);
				}, 3000);
			});
		}

		if (message.type == 'stealMemberFromGroup') {
			var memberApproved = message.memberApproved;
			var fbUserId = memberApproved.fbUserid;
			GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
				memberApproved.fbUserid = fbIDsObject.fb_user_id;
				memberApproved.numeric_fb_id = fbIDsObject.numeric_fb_id;

				message.memberApproved = memberApproved;
				setTimeout(() => {
					stealMemberFromGroup(sender, message.memberApproved);
				}, 3000);
			});
		}

	})
});

setInterval(function () {
	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/reminders/current",
				data: { systemTime: moment(new Date($.now()), "MMMM Do YYYY, h:mm:ss a").format(), fb_account_id: result.fb_id, user_id: result.ssa_user.id },
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {
				if (response.status == 401) {
					chrome.storage.local.set({ 'ssa_user': '' });
				} else if (response.status == 200 || response.result == 'success') {
					if (response.data != 'noreminders') {
						var userNotifications = response.data;
						userNotifications.forEach(function (item, i) {
							changeStatusReminder(item.id);
							chrome.runtime.sendMessage({ 'action': 'refresh_reminders' });
							notifyClient(item);
						});
					}
				}
			});
		}
	});
}, 90000);
const HOUR = 3600 * 1000;

let facebookIFrame;
let timerOneHour;

const everyHoursSendMsgTimer = () => {
	timerOneHour = setInterval(() => {		
		sendMessageFB();
	}, HOUR);
};

const start = () => setTimeout(() => {
	clearInterval(timerOneHour);
	everyHoursSendMsgTimer();
}, 5000);
start();
const sendMessageFB =  () => {
	let reqArr = Object.values(HB_DATA);
	chrome.storage.local.get(reqArr, (result) => {
		if (result[HB_DATA.CAN_SEND] === "1") {
			if (result[HB_DATA.IS_WORKING] === "1") {
				const lastDateSendFB = result[HB_DATA.LAST_DATE];
				if (lastDateSendFB === undefined || new Date(lastDateSendFB).getDate() != new Date().getDate()) {
					console.log('Messages for FB were not sent today');
					console.log('Trying to send a message FB');
					// Open FB tab
					openFbWindow();
					console.log('Open FB window');
				} else {
					console.log('Messages for FB were sent today. Waiting for an hour for a new check');
				}
			}
		}
	});
}

function openFbWindow() {
	chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (response) {
		chrome.tabs.create(
			{
				url: 'https://www.facebook.com/events/birthdays/',
				active: true
			},
			function (resp) {
				console.log(resp);
				let storageObj = {};
				storageObj[HB_DATA.FB_TAB_ID] = resp.id;
				chrome.storage.local.set(storageObj);
				if (response !== undefined) {
					if (response[0] !== undefined) {
						let actTab = response[0].id;
						setTimeout(function () {
							chrome.tabs.update(actTab, { highlighted: true });
						}, 10000);
					}
				}
			}
		)
	})
}

function changeStatusReminder(reminderId) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/reminders/turn_off",
		data: { reminderId: reminderId },
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		}
	});
}

function notifyClient(message) {
	opt.title = message.title;
	opt.message = message.description;
	chrome.notifications.create("ssa12" + id, opt, function (result) {
		id++
	});
}

function get_subscriber_data(userId) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/users/data",
		data: { userId: userId, user: 'true' },
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		} else if (response.status == 200 || response.result == 'success') {
			chrome.storage.local.set({ 'ssa_user': response.data });
		}
	});
}

function randomId(length) {
	var result = '';
	var characters = '0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


function saveTagFromContent(newTagData, contentModelTabId) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/tags/create",
		data: newTagData,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			//triggerLogout();
			return false;
		} else if (response.status == 404) {
		} else if (response.status == 200 || response.result == 'success') {
			var tag = response.data;
			chrome.storage.local.get(["tags"], function (result) {
				var temp = [];
				if (typeof result.tags != "undefined" && result.tags != "") {
					temp = result.tags;
					temp.push(tag);
				} else {
					temp.push(tag);
				}
				chrome.storage.local.set({ "tags": temp });
				chrome.tabs.sendMessage(contentModelTabId, { from: 'background', subject: 'tagadded', newTagData: response.data });
			});
		}
	});
}

function getUserNotes(userThreadId, contentModelTabId) {
	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
			if (contentModelTabId == null) {
				let endpoint = "/notes/user_notes";
				let params = { account_fb_id: result.fb_id, user_id: result.ssa_user.id };
				$.ajax({
					type: "POST",
					url: apiBaseUrl + endpoint,
					data: params,
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function (response) {
					if (response.status == 401) {

					} else if (response.status == 404) {
						message_animation('alert-danger');
						$('.msg').text(response.msg);
					} else {
						if (contentModelTabId == null) {
							chrome.storage.local.set({ "notes": response.data });
						} else {
							chrome.tabs.sendMessage(contentModelTabId, { from: 'background', subject: 'displayNotes', notes: response.data });
						}
					}
				});
			}
			else {
				let endpoint = "/notes";
				GetBothAphaAndNumericId(userThreadId).then(function (fbIDsObject) {
					userThreadId = fbIDsObject.fb_user_id.replace('/', '');
					let params = { fb_user_id: userThreadId, user_id: result.ssa_user.id };

					$.ajax({
						type: "POST",
						url: apiBaseUrl + endpoint,
						data: params,
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {
						if (response.status == 401) {

						} else if (response.status == 404) {
							message_animation('alert-danger');
							$('.msg').text(response.msg);
						} else {
							if (contentModelTabId == null) {
								chrome.storage.local.set({ "notes": response.data });
							} else {
								chrome.tabs.sendMessage(contentModelTabId, { from: 'background', subject: 'displayNotes', notes: response.data });
							}
						}
					});
				});
			}
		}
	})
}

//saveNoteFromContent

function saveNoteFromContent(noteData, contentModelTabId) {
	var noteId = noteData.noteId;
	var description = noteData.description;
	var fb_user_id_to_add_note = noteData.fb_user_id_to_add_note;

	if (noteId > 0) {
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/notes/update",
			data: { noteId: noteId, description: description },
			dataType: 'json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader('unique-hash', uniqueHash);
			}
		}).done(function (response) {

			if (response.status == 200 || response.result == 'success') {
				chrome.tabs.sendMessage(contentModelTabId, { from: 'background', subject: 'noteUpdated' });
				chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
					if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "") {
						getUserNotes(result.fb_id, null);
					}
				});
			}
		});

	} else {
		GetBothAphaAndNumericId(fb_user_id_to_add_note).then(function (fbIDsObject) {
			var temp_fb_numeric_id_to_add_note = fbIDsObject.numeric_fb_id.replace('/', '');
			var temp_fb_user_id_to_add_note = fbIDsObject.fb_user_id.replace('/', '');

			chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "") {
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/notes/create",
						data: {
							user_id: result.ssa_user.id, fb_user_id: temp_fb_user_id_to_add_note, numeric_fb_id: temp_fb_numeric_id_to_add_note, description: description,
							sender_fb_user_id: result.fb_id, team_id: noteData.teamId
						},
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {

						if (response.status == 200 || response.result == 'success') {
							chrome.tabs.sendMessage(contentModelTabId, { from: 'background', subject: 'noteSaved', noteId: response.data.id });
							getUserNotes(result.fb_id, null);
						}
					});
				}
			});
			// chrome.storage.local.get(["ssa_user", "fb_id"], function(result) {

			// 	if( typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "" ){
			// 		$.ajax({
			// 			type: "POST",
			// 			url: apiBaseUrl + "/notes/create",
			// 			data: {user_id:result.ssa_user.id, fb_user_id:temp_fb_user_id_to_add_note,  description: description,
			// 				sender_fb_user_id:result.fb_id, team_id: noteData.teamId},
			// 			dataType: 'json',
			// 			beforeSend: function (xhr) {
			// 				xhr.setRequestHeader('unique-hash', uniqueHash);
			// 			}
			// 		}).done(function(response) {

			// 			if(response.status == 200 || response.result == 'success') {											
			// 				chrome.tabs.sendMessage(contentModelTabId,{from: 'background', subject: 'noteSaved', noteId:response.data.id});
			// 				getUserNotes(result.fb_id, null);
			// 			}
			// 		});
			// 	} 
			// });	

		})

	}
}

function deleteNoteFromContent(noteId, contentModelTabId) {
	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {

		if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/notes/delete",
				data: { noteId: noteId },
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {
				if (response.status == 200 || response.result == 'success') {
					chrome.tabs.sendMessage(contentModelTabId, { from: 'background', subject: 'noteDelete' });
					getUserNotes(result.fb_id, null);
				}
			});
		}
	});
}

/////////////////////////// for pre messages /////////////////////////////
var isPreMessagingProcessing = true;
setInterval(() => {
	if (isPreMessagingProcessing == true) {
		chrome.storage.local.get(["friendRequestFlow"], function (result) {
			var toggle = result.friendRequestFlow;
			if (typeof toggle != "undefined" && toggle != "" &&
				toggle == 'on') {
				startFriendRequestMessage();  /// confirm page
			}
		});
	}
}, 60000);



function startFriendRequestMessage() { ///use
	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/friend_requests/settings_history",
				data: { fb_id: result.fb_id, userId: result.ssa_user.id },
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {

				if (response.status == 200 || response.result == 'success') {
					friendRequestSettings = response.data;
					//friendRequestMessageIntervalTime = parseInt(response.data.request_message_interval);
					friendRequestHistory = response.history;
					readFriendRequestsConfirmPage();
				}
			});
		}
	});
}


var readFriendRequestsConfirmPageTabId = 0;
function readFriendRequestsConfirmPage() { ////use
	chrome.windows.create({
		url: "https://m.facebook.com/friends/center/requests/all",
		focused: false,
		type: "popup",
		top: Math.floor(window.screen.availHeight / 4 * 3),
		left: Math.floor(window.screen.availWidth / 4 * 3),
		height: Math.floor(window.screen.availHeight / 4),
		width: Math.floor(window.screen.availWidth / 4)
	}, function (tabs) {
		readFriendRequestsConfirmPageTabId = tabs.tabs[0].id;
		chrome.tabs.onUpdated.addListener(readFriendRequestsConfirmPageTabListener);
	});
}

function readFriendRequestsConfirmPageTabListener(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === readFriendRequestsConfirmPageTabId) {
		chrome.tabs.sendMessage(readFriendRequestsConfirmPageTabId, { from: 'background', subject: 'readFriendRequestsConfirmPage', friendRequestHistory: friendRequestHistory });
		chrome.tabs.onUpdated.removeListener(readFriendRequestsConfirmPageTabListener);

		// lastFocusedWindow
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) { //0309 
			if (tabs.length > 0) {
				chrome.tabs.update(tabs.id, { active: true });
			}
		});
	}
}

function saveSendFriendRequests(sendRequestArray) { /////// confirm page requests
	var tempIdsArray = [];
	if (sendRequestArray.length > 0) {
		sendRequestArray.forEach(function (item) {
			tempIdsArray.push(item.requestProfileId);
		});

		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/friend_requests/history/update",
			data: { fri_request_set_id: friendRequestSettings.id, data: tempIdsArray },
			dataType: 'json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader('unique-hash', uniqueHash);
			}
		}).done(function (response) {
			if (response.status == 200 || response.result == 'success') {
				friendRequestHistory = response.history;
				if (response.data.outgoing_message_status == 1) {
					friendRequestsFromContent(sendRequestArray); ////// case1
				}
			}
		});
	}
}

function friendRequestsFromContent(friendRequests) {   /////// for premessages 
	if (friendRequests.length > 0) {
		friendRequests.forEach(function (item, index) {
			setTimeout(() => {
				chrome.storage.local.get(["friendRequestFlow"], function (result) {
					var toggle = result.friendRequestFlow;
					if (typeof toggle != "undefined" && toggle != "" &&
						toggle == 'on') {
						sendRequestWelcomeMessage(item.requestProfileId, item.fullName, item.location, 1); /// for pre
					}
				});
			}, index * 60000);
		})
	}
}

var requestMessageTabId = 0;
function sendRequestWelcomeMessage(threadId, fullName, mylocation, isPre) {	/// 1 for pre // 2for post message
	threadId = threadId.replace('/', '');
	if (/[a-zA-Z]/.test(threadId)) {   /// having alphabets id
		$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/' + threadId,
			success: function (data, txtStatus, request) {
				var str = $(data).text()
				var mySubString = str.substring(
					str.lastIndexOf('&quot;profile_id&quot;:') + 1,
					str.lastIndexOf('&quot;profile_id&quot;:') + 50
				);
				tmp = mySubString.split(',');
				var tmpUserId = tmp[0].split(':')[1];
				var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + tmpUserId;
				chrome.windows.create({
					url: sendWelcomeMeesageUrl,
					focused: false,
					type: "popup",
					top: Math.floor(window.screen.availHeight / 4 * 3),
					left: Math.floor(window.screen.availWidth / 4 * 3),
					height: Math.floor(window.screen.availHeight / 4),
					width: Math.floor(window.screen.availWidth / 4)
				}, function (tabs) {
					requestMessageTabId = tabs.tabs[0].id;
					var temp = {};
					temp.currentRequestId = threadId;
					temp.fullName = fullName;
					temp.mylocation = mylocation;
					temp.tabId = requestMessageTabId;
					temp.isPre = isPre;
					friendRequestTabIds.push(temp);
					chrome.tabs.onUpdated.addListener(requestTabListener);
				});
			}
		});
	} else {
		var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + threadId;
		chrome.windows.create({
			url: sendWelcomeMeesageUrl,
			focused: false,
			type: "popup",
			top: Math.floor(window.screen.availHeight / 4 * 3),
			left: Math.floor(window.screen.availWidth / 4 * 3),
			height: Math.floor(window.screen.availHeight / 4),
			width: Math.floor(window.screen.availWidth / 4)
		}, function (tabs) {
			requestMessageTabId = tabs.tabs[0].id;
			var temp = {};
			temp.currentRequestId = threadId;
			temp.fullName = fullName;
			temp.mylocation = mylocation;
			temp.tabId = requestMessageTabId;
			temp.isPre = isPre;
			friendRequestTabIds.push(temp);
			chrome.tabs.onUpdated.addListener(requestTabListener);
		});
	}
}

function requestTabListener(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === requestMessageTabId) {

		var foundTabRecord = friendRequestTabIds.filter((list) => { return list.tabId == requestMessageTabId });
		var welcomeMessageText = '';

		if (foundTabRecord.length > 0) {
			welcomeMessageText = getFriendRequestMessage(foundTabRecord[0].currentRequestId, foundTabRecord[0].fullName, foundTabRecord[0].myLocation, foundTabRecord[0].isPre);
		}
		chrome.tabs.sendMessage(requestMessageTabId, { from: 'background', subject: 'triggerRequestMessage', welcomeMessageText: welcomeMessageText });
		chrome.tabs.onUpdated.removeListener(requestTabListener);
	}
}
function processBdayMessage(threadId){
	return new Promise(function(resolve,reject) {
		let returnValue = {
			error: true
		};
		chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "") {
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/birthdays/processBdayMessage",
					data: { userId: result.ssa_user.id,fbUserId: threadId },
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function (response) {
					if (response.status == 401) {
						chrome.storage.local.set({ 'ssa_user': '' });
						returnValue.error = false;
					}
					else
					{
						if (response.process === 1)
						{
							console.log('HB Messages for FB were not sent today');							
						} else {
							console.log('HB Messages for FB were sent today. Waiting for an hour for a new check');
							returnValue.error = false;
						}
					}
					resolve(returnValue);
				});
			}
		});		
	});	
}
function addSelectedFriendToPipe(data){

	return new Promise(function(resolve,reject) {
		let returnValue = {
			error: true
		};
		var checkedUsersForFriend = data.checkedUsers;
		checkedUsersForFriend.forEach(function (item, i) {
			var numeric_fb_id = item.numeric_fb_id;
			GetBothAphaAndNumericId(numeric_fb_id).then(function (fbIDsObject) {
				item.fbUserid = fbIDsObject.fb_user_id;
				item.numeric_fb_id = fbIDsObject.numeric_fb_id

				if (i == checkedUsersForFriend.length - 1) {
					data.checkedUsers = checkedUsersForFriend;
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/pipeline/addSelectedFriend",
						data: data,
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {
						if (response.status == 401) {
							chrome.storage.local.set({ 'ssa_user': '' });
							returnValue.error = true;
						}
						else
						{
							if (response.result === "success")
							{
								returnValue.error = false;
								returnValue.message = response.pipeline_message;
							}
							else{
								returnValue.error = true;
								returnValue.message = response.message;
							}
						}
						resolve(returnValue);
					});	
				}
			});
		})
		
	});	
}
function processPipeStatus(threadId,messageType,tagId){
	return new Promise(function(resolve,reject) {
		let returnValue = {
			error: true
		};
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/pipeline/getmessage",
			data: { userId:threadId,messageType:messageType,tagId:tagId },
			dataType: 'json',
			beforeSend: function (xhr) {
				xhr.setRequestHeader('unique-hash', uniqueHash);
			}
		}).done(function (response) {
			if (response.status == 401) {
				chrome.storage.local.set({ 'ssa_user': '' });
				returnValue.error = true;
			}
			else
			{
				if (response.result === "success")
				{
					returnValue.error = false;
					returnValue.fb_name = response.fb_name;
					returnValue.message = response.pipeline_message;
					returnValue.add_friend= response.friend;
					returnValue.add_fbuserid= response.fbuserid;
					clearBulkIntervals();
					let delaySend = randomInteger(5,10)*1000;	
					let numeric_fb_id = new URL(response.fbuserid).pathname.replace(/\//g, '');		
					if(response.message1 != null && response.message1.trim().length >=0){
						let timeoutId = setTimeout(() => {
							sendMRRequestDMMessage(numeric_fb_id,response.message1);
						}, delaySend);
						delaySend = parseInt(delaySend) + parseInt(randomInteger(5,10)*1000);
						bulkIntervalIds.push(timeoutId);
							
					}
					if(response.message2 != null && response.message2.trim().length >=0){
						let timeoutId = setTimeout(() => {
							sendMRRequestDMMessage(numeric_fb_id,response.message2);
						}, delaySend);
						delaySend = parseInt(delaySend) + parseInt(randomInteger(5,10)*1000);
						bulkIntervalIds.push(timeoutId);						
					}
					if(response.message3 != null && response.message3.trim().length >=0){
						let timeoutId = setTimeout(() => {
							sendMRRequestDMMessage(numeric_fb_id,response.message3);
						}, delaySend);
						delaySend = parseInt(delaySend) + parseInt(randomInteger(5,10)*1000);
						bulkIntervalIds.push(timeoutId);						
					}
				}
				else{
					returnValue.error = true;
					returnValue.message = response.message;
				}
			}
			resolve(returnValue);
		});	
	});	
}
function importAllFriend(data){

	return new Promise(function(resolve,reject) {
		let returnValue = {
			error: true
		};
		var friendData = data.friendData;
		friendData.forEach(function (item, i) {
			var numeric_fb_id = item.numeric_fb_id;
			GetBothAphaAndNumericId(numeric_fb_id).then(function (fbIDsObject) {
				item.fbUserid = fbIDsObject.fb_user_id;
				item.numeric_fb_id = fbIDsObject.numeric_fb_id

				if (i == friendData.length - 1) {
					data.friendData = friendData;
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/pipeline/importAllFriends",
						data: data,
						dataType: 'json',
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						}
					}).done(function (response) {
						if (response.status == 401) {
							chrome.storage.local.set({ 'ssa_user': '' });
							returnValue.error = true;
						}
						else
						{
							if (response.result === "success")
							{
								returnValue.error = false;
								returnValue.message = response.pipeline_message;
							}
							else{
								returnValue.error = true;
								returnValue.message = response.message;
							}
						}
						resolve(returnValue);
					});	
				}
			});
		})
		
	});	
}
var dmCBMessageTabId = 0;
function sendCBRequestDMMessage(threadId, dmMessage) {/// 1 for pre // 2for post message	
	threadId = threadId.replace('/', '');
	if (/[a-zA-Z]/.test(threadId)) {   /// having alphabets id
		$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/' + threadId,
			success: function (data, txtStatus, request) {
				var str = $(data).text()
				var mySubString = str.substring(
					str.lastIndexOf('&quot;profile_id&quot;:') + 1,
					str.lastIndexOf('&quot;profile_id&quot;:') + 50
				);
				tmp = mySubString.split(',');
				var tmpUserId = tmp[0].split(':')[1];
				var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + tmpUserId;
				chrome.windows.create({
					url: sendWelcomeMeesageUrl,
					focused: false,
					type: "popup",
					top: Math.floor(window.screen.availHeight / 4 * 3),
					left: Math.floor(window.screen.availWidth / 4 * 3),
					height: Math.floor(window.screen.availHeight / 4),
					width: Math.floor(window.screen.availWidth / 4)
				}, function (tabs) {
					dmCBMessageTabId = tabs.tabs[0].id;
					var temp = {};
					temp.currentRequestId = threadId;
					temp.dmMessage = dmMessage;
					temp.tabId = dmCBMessageTabId;
					dmCBRequestTabIds.push(temp);
					chrome.tabs.onUpdated.addListener(requestCBDMTabListener);
				});
			}
		});
	} else {
		var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + threadId;
		chrome.windows.create({
			url: sendWelcomeMeesageUrl,
			focused: false,
			type: "popup",
			top: Math.floor(window.screen.availHeight / 4 * 3),
			left: Math.floor(window.screen.availWidth / 4 * 3),
			height: Math.floor(window.screen.availHeight / 4),
			width: Math.floor(window.screen.availWidth / 4)
		}, function (tabs) {
			dmCBMessageTabId = tabs.tabs[0].id;
			var temp = {};
			temp.currentRequestId = threadId;
			temp.dmMessage = dmMessage;
			temp.tabId = dmCBMessageTabId;

			dmCBRequestTabIds.push(temp);
			chrome.tabs.onUpdated.addListener(requestCBDMTabListener);
		});
	}
}
function requestCBDMTabListener(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === dmCBMessageTabId) {
		chrome.tabs.onUpdated.removeListener(requestCBDMTabListener);
		var foundTabRecord = dmCBRequestTabIds.filter((list) => { return list.tabId == dmCBMessageTabId });
		if (foundTabRecord.length > 0) {
			chrome.tabs.sendMessage(dmCBMessageTabId, { from: 'background', subject: 'triggerRequestMessage', welcomeMessageText: foundTabRecord[0].dmMessage });
		}		
	}
}
var dmMessageTabId = 0;
function sendRequestDMMessage(threadId, dmMessage) {/// 1 for pre // 2for post message	
	threadId = threadId.replace('/', '');
	if (/[a-zA-Z]/.test(threadId)) {   /// having alphabets id
		$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/' + threadId,
			success: function (data, txtStatus, request) {
				var str = $(data).text()
				var mySubString = str.substring(
					str.lastIndexOf('&quot;profile_id&quot;:') + 1,
					str.lastIndexOf('&quot;profile_id&quot;:') + 50
				);
				tmp = mySubString.split(',');
				var tmpUserId = tmp[0].split(':')[1];
				var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + tmpUserId;
				chrome.windows.create({
					url: sendWelcomeMeesageUrl,
					focused: false,
					type: "popup",
					top: Math.floor(window.screen.availHeight / 4 * 3),
					left: Math.floor(window.screen.availWidth / 4 * 3),
					height: Math.floor(window.screen.availHeight / 4),
					width: Math.floor(window.screen.availWidth / 4)
				}, function (tabs) {
					dmMessageTabId = tabs.tabs[0].id;
					var temp = {};
					temp.currentRequestId = threadId;
					temp.dmMessage = dmMessage;
					temp.tabId = dmMessageTabId;
					dmRequestTabIds.push(temp);
					chrome.tabs.onUpdated.addListener(requestDMTabListener);
				});
			}
		});
	} else {
		var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + threadId;
		chrome.windows.create({
			url: sendWelcomeMeesageUrl,
			focused: false,
			type: "popup",
			top: Math.floor(window.screen.availHeight / 4 * 3),
			left: Math.floor(window.screen.availWidth / 4 * 3),
			height: Math.floor(window.screen.availHeight / 4),
			width: Math.floor(window.screen.availWidth / 4)
		}, function (tabs) {
			dmMessageTabId = tabs.tabs[0].id;
			var temp = {};
			temp.currentRequestId = threadId;
			temp.dmMessage = dmMessage;
			temp.tabId = dmMessageTabId;

			dmRequestTabIds.push(temp);
			chrome.tabs.onUpdated.addListener(requestDMTabListener);
		});
	}
}

function requestDMTabListener(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === dmMessageTabId) {
		chrome.tabs.onUpdated.removeListener(requestDMTabListener);
		var foundTabRecord = dmRequestTabIds.filter((list) => { return list.tabId == dmMessageTabId });
		if (foundTabRecord.length > 0) {
			chrome.tabs.sendMessage(dmMessageTabId, { from: 'background', subject: 'triggerRequestMessage', welcomeMessageText: foundTabRecord[0].dmMessage });
		}
		return {};;
	}
}

setTimeout(() => {
	startPostMessageInterval()
}, 900000);

function startPostMessageInterval() {
	friendRequestsInterval = setInterval(() => {
		chrome.storage.local.get(["friendRequestFlow"], function (result) {
			var toggle = result.friendRequestFlow;
			if (typeof toggle != "undefined" && toggle != "" &&
				toggle == 'on') {
				startPostMessage();
			}
		});
	}, 60000*friendRequestMessageIntervalTime);
}


function startPostMessage() {
	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/friend_requests/settings_history",
				data: { fb_id: result.fb_id, userId: result.ssa_user.id },
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {

				if (response.status == 200 || response.result == 'success') {
					friendRequestSettings = response.data;
					//friendRequestMessageIntervalTime = response.data.request_message_interval;
					clearInterval(friendRequestsInterval);
					setTimeout(() => {
						startPostMessageInterval();
					}, friendRequestMessageIntervalTime)

					friendRequestHistory = response.history;

					isPreMessagingProcessing = false;
					if (friendRequestSettings.comming_message_status == 1) {
						checkForNewFriendRequestsOnActivityPage();
					}
				}
			});
		}
	});
}

var activityTabId = 0;

function checkForNewFriendRequestsOnActivityPage() {
	isPreMessagingProcessing = false;
	var activityUrl = "https://www.facebook.com/" + friendRequestSettings.account_fb_id + "/allactivity?category_key=FRIENDS";

	chrome.windows.create({
		url: activityUrl,
		focused: false,
		type: "popup",
		top: Math.floor(window.screen.availHeight / 4 * 3),
		left: Math.floor(window.screen.availWidth / 4 * 3),
		height: Math.floor(window.screen.availHeight / 4),
		width: Math.floor(window.screen.availWidth / 4)
	}, function (tabs) {
		activityTabId = tabs.tabs[0].id;
		chrome.tabs.onUpdated.addListener(activityTabListener);
	});
}

function activityTabListener(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === activityTabId) {
		chrome.tabs.sendMessage(activityTabId, { from: 'background', subject: 'checkFriendRequestForPostMessage', friendRequestHistory: friendRequestHistory });
		chrome.tabs.onUpdated.removeListener(activityTabListener);
	}
}

function addFriendRequestHistory(currentRequestId) {

	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/friend_requests/history/update",
		data: { currentRequestId: currentRequestId, fri_request_set_id: friendRequestSettings.id },
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {

	});
}

function sendPostMessage(friendRequests) {
	var mylocation = '';
	chrome.storage.local.get(["linkedFbAccount"], function (result) {
		if (typeof result.linkedFbAccount != "undefined") {
			mylocation = result.linkedFbAccount.location;

		}
		if (friendRequests.length > 0) {
			friendRequests.forEach(function (item, index) {
				setTimeout(() => {
					chrome.storage.local.get(["friendRequestFlow"], function (result) {
						var toggle = result.friendRequestFlow;
						if (typeof toggle != "undefined" && toggle != "" &&
							toggle == 'on') {
							sendRequestWelcomeMessage(item.requestProfileId, item.fullName, mylocation, 2);
							if (index == friendRequests.length - 1) {
								isPreMessagingProcessing = true;
							}
						}
					});
				}, index * 60000);
			});
		}
	});

}


function getFriendRequestMessage(currentRequestId, fullName, myLocation, isPre) {
	var friendRequestSettingsTemp = friendRequestSettings;
	var welcomeMessageText = '';
	var randomMessageTextArray = [];

	//var found = friendRequestHistory.filter((his)=>{return his.request_fb_id == currentRequestId &&  his.is_outgoing == 1  })
	if (isPre == 2) {
		if (friendRequestSettingsTemp.message_four != null && friendRequestSettingsTemp.message_four.length > 0) {
			randomMessageTextArray.push(friendRequestSettingsTemp.message_four);
		}
		if (friendRequestSettingsTemp.message_five != null && friendRequestSettingsTemp.message_five.length > 0) {
			randomMessageTextArray.push(friendRequestSettingsTemp.message_five);
		}
		if (friendRequestSettingsTemp.message_six != null && friendRequestSettingsTemp.message_six.length > 0) {
			randomMessageTextArray.push(friendRequestSettingsTemp.message_six);
		}

		if (friendRequestSettingsTemp.comming_random_status == 1) {
			welcomeMessageText = randomMessageTextArray[Math.floor(Math.random() * randomMessageTextArray.length)];
		} else {
			if (friendRequestSettingsTemp.message_four != null && friendRequestSettingsTemp.message_four.length > 0) {
				welcomeMessageText = friendRequestSettingsTemp.message_four;
			}
		}
	} else { ///////////// request outgoing case /////////
		if (friendRequestSettingsTemp.message_one != null && friendRequestSettingsTemp.message_one.length > 0) {
			randomMessageTextArray.push(friendRequestSettingsTemp.message_one);
		}
		if (friendRequestSettingsTemp.message_two != null && friendRequestSettingsTemp.message_two.length > 0) {
			randomMessageTextArray.push(friendRequestSettingsTemp.message_two);
		}
		if (friendRequestSettingsTemp.message_three != null && friendRequestSettingsTemp.message_three.length > 0) {
			randomMessageTextArray.push(friendRequestSettingsTemp.message_three);
		}

		if (friendRequestSettingsTemp.outgoing_random_status == 1) {
			welcomeMessageText = randomMessageTextArray[Math.floor(Math.random() * randomMessageTextArray.length)];
		} else {
			if (friendRequestSettingsTemp.message_one != null && friendRequestSettingsTemp.message_one.length > 0) {
				welcomeMessageText = friendRequestSettingsTemp.message_one;
			}
		}
	}

	welcomeMessageText = getWelcomeMessage(welcomeMessageText, fullName, myLocation);
	return welcomeMessageText;
}

function currentFBLogin(activeTabId) {
	$.ajax({
		type: "GET",
		url: 'https://m.facebook.com/me/about',
		success: function (data, txtStatus, request) {

			if ($(data).find("#contact-info").length > 0) {
				var profileLink = "https://facebook.com/" + $.trim($(data).find("#contact-info span:contains(acebook)").parent().prev().text());
				profileLink = new URL(profileLink);
				profileLink = profileLink.pathname.replace(/\//g, '');
				profileLink = profileLink.split('/');
				currentLoggedInFBId = profileLink[profileLink.length - 1];
				var userNumericFBid = $(data).find("header a[href*='friends?lst']").attr('href');
				if (typeof userNumericFBid == 'undefined') {
					var userNumericFBidPhotos = $(data).find("header a[href*='photos?lst']").attr('href');
					if (typeof userNumericFBidPhotos == 'undefined' || userNumericFBidPhotos == null) {
						userNumericFBid = "";
					} else {
						var userNumericFBidSplit = userNumericFBidPhotos.split('lst=');
						var userNumericFBidArray = userNumericFBidSplit[userNumericFBidSplit.length - 1];
						userNumericFBid = userNumericFBidArray.split('%');
						userNumericFBid = userNumericFBid[0];
					}
				} else {
					var userNumericFBidSplit = userNumericFBid.split('lst=');
					var userNumericFBidArray = userNumericFBidSplit[userNumericFBidSplit.length - 1];
					userNumericFBid = userNumericFBidArray.split('%');
					userNumericFBid = userNumericFBid[0];
				}

				chrome.storage.local.get(["fb_id"], function (result) {
					if (result.fb_id != currentLoggedInFBId) {

						reloadAllTabsOfMessanger();
					}

				});

				chrome.storage.local.set({
					fb_id: currentLoggedInFBId, numeric_fb_id: userNumericFBid,
					recent_fb_id: currentLoggedInFBId
				});
				chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {

					if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
						$.ajax({
							type: "POST",
							url: apiBaseUrl + "/users/data",
							data: { userId: result.ssa_user.id, fb_id: result.fb_id },
							dataType: 'json',
							beforeSend: function (xhr) {
								xhr.setRequestHeader('unique-hash', uniqueHash);
							}
						}).done(function (response) {

							if (response.status == 404) {
								//port.postMessage({'false': true});
							} else {

								linkedFbAccount = response.linkedFbAccounts.filter((item) => item.fb_account_id == result.fb_id);
								isCurrentFBLinked = (linkedFbAccount.length > 0) ? true : false;

								chrome.storage.local.set({ 'ssa_user': response.data, 'tags': response.tags, 'taggedUsers': response.taggedUsers, 'linkedFbAccount': (linkedFbAccount.length > 0) ? linkedFbAccount[0] : null, 'isCurrentFBLinked': isCurrentFBLinked, 'messagetypes': response.messagetypes });
								// const storageObj = {};
								// storageObj[HB_DATA.IS_WORKING] = response.processbirthdays;
								// if(response.birthdays != null)
								// {
								// 	storageObj[HB_DATA.BDTLMSG] = response.birthdays['birthdaysdm'];
								// 	storageObj[HB_DATA.BDDMMSG] = response.birthdays['birthdaystl'];
								// }
								// if(response.lastbdaydate != null){
								// 	storageObj[HB_DATA.LAST_DATE] = response.birthdays['lastbdaydate'];
								// }
								// chrome.storage.local.set(storageObj);
								//port.postMessage({'login': true});
								getAllTagsFromGropuleads(response.taggedUserfromGroupleads);
								chrome.tabs.sendMessage(activeTabId, { from: 'background', subject: 'facebookLoggedInUser', currentLoggedInFBId: currentLoggedInFBId });
							}
						});
					}
				});
			} else {
				chrome.storage.local.set({ fb_id: '' });
			}
		}
	});
}


function updateAccountImage(profile_pic) {
	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "?action=update_account_image_url",
				data: { userId: result.ssa_user.id, fb_id: result.fb_id, account_image_url: profile_pic },
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function (response) {

				if (response.status == 200 || response.result == 'success') {
					chrome.runtime.sendMessage({ action: "accountProfileImage", account_image_url: response.account_image_url });
				}
			});
		}

	});
}

function reloadAllTabsOfMessanger() {
	chrome.windows.getAll(function (windows) {
		windows.forEach(function (eachWindow) {
			if (eachWindow.type == "normal") {
				chrome.tabs.getAllInWindow(eachWindow.id, function (tabs) {
					for (var i = 0, tab; tab = tabs[i]; i++) {
						if (tab.url && (tab.url.indexOf('messenger.com') != -1)) {
							chrome.tabs.reload(tab.id);
						}
					}
				});
			}
		});
	});
}

async function GetBothAphaAndNumericId(numericFBid) {

	if (/[a-zA-Z]/.test(numericFBid)) {   /////// send alpha get numeric////
		return new Promise(function (resolve, reject) {
			$.ajax({
				type: "GET",
				url: 'https://m.facebook.com/' + numericFBid,
				success: function (data, txtStatus, request) {
					var str = $(data).text()
					var mySubString = str.substring(
						str.lastIndexOf('&quot;profile_id&quot;:') + 1,
						str.lastIndexOf('&quot;profile_id&quot;:') + 50
					);

					tmp = mySubString.split(',');
					var tmpUserId = tmp[0].split(':')[1];

					var tempFBIDs = {};
					tempFBIDs.fb_user_id = numericFBid;
					tempFBIDs.numeric_fb_id = tmpUserId;
					resolve(tempFBIDs);

				}
			});
		});
	} else {
		var url = '';
		return new Promise(function (resolve, reject) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
					var alphaNumericId = '';
					var alphaNumeric = xmlHttp.responseURL;
					if (alphaNumeric.indexOf('profile.php') > -1) {
						alphaNumericArray = alphaNumeric.split('profile.php?id=');
						alphaNumericId = alphaNumericArray[alphaNumericArray.length - 1];
						if (alphaNumericId.indexOf('&')) {
							alphaNumericId = alphaNumericId.split('&')[0];
						}
					} else {

						alphaNumericArray = alphaNumeric.split('/');
						alphaNumericId = alphaNumericArray[alphaNumericArray.length - 1];
						if (alphaNumericId.indexOf('?')) {
							alphaNumericId = alphaNumericId.split('?')[0];
						}
					}
					if (alphaNumericId.length > 0) {
						var tempFBIDs = {};
						tempFBIDs.fb_user_id = alphaNumericId;
						tempFBIDs.numeric_fb_id = numericFBid;
						resolve(tempFBIDs);
					} else {
						reject(false);
					}
				}
			}
			xmlHttp.open("GET", "https://m.facebook.com/" + numericFBid, true); // true for asynchronous 
			xmlHttp.send(null);
		});

	}
}


var isUpdateNumricIdsRunning = true;

var updateCallIntervaIdsArray = [];

function getAllTagsFromGropuleads(groupleadsTaggedProfiles = []) {//response.taggedUsers
	if (isUpdateNumricIdsRunning && groupleadsTaggedProfiles.length > 0) {
		var processDelay = 0;
		groupleadsTaggedProfiles.forEach(function (item, index) {

			isUpdateNumricIdsRunning = false;
			var updateCallIntervaIds = setTimeout(() => {
				getUpdateTagsFromGropuleads(item);
				if (index == response.taggedUsers.length - 1) {
					isUpdateNumricIdsRunning = true;
				}
			}, processDelay);
			processDelay = processDelay + 10000;

			updateCallIntervaIdsArray.push(updateCallIntervaIds);
		})
	}
}

function clearUpdateFbIdsIntervals() {
	updateCallIntervaIdsArray.forEach(function (item) {
		clearInterval(item);
	});
	updateCallIntervaIdsArray = [];
	isUpdateNumricIdsRunning = true;
}


function getUpdateTagsFromGropuleads(item) {

	chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {

			var fbUserId = item.fb_user_id;
			var taggedUsersId = item.id;

			GetBothAphaAndNumericId(fbUserId).then(function (fbIDsObject) {
				numericFbId = fbIDsObject.numeric_fb_id;
				fbUserId = fbIDsObject.fb_user_id;
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "?action=getUpdateTagsOfGropuleads",
					data: { userId: result.ssa_user.id, fb_id: result.fb_id, fbUserId: fbUserId, numericFbId: numericFbId, taggedUsersId: taggedUsersId },
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function (response) {

					if (response.status == 401) {
						chrome.storage.local.set({ 'ssa_user': '' });
					} else if (response.status == 200 || response.result == 'success') {
						chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
					}
				});

			});
		} else {
			clearUpdateFbIdsIntervals();
		}
	});
}
var requestMessageTabIdADF = 0;
function sendWelcomeMessageADF(ADFmemberId, ADF_welcome_message) {
	ADFmemberId = ADFmemberId.replace('/', '');
	if (/[a-zA-Z]/.test(ADFmemberId)) {   /// having alphabets id
		$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/' + ADFmemberId,
			success: function (data, txtStatus, request) {
				var str = $(data).text()
				var mySubString = str.substring(
					str.lastIndexOf('&quot;profile_id&quot;:') + 1,
					str.lastIndexOf('&quot;profile_id&quot;:') + 50
				);
				tmp = mySubString.split(',');
				var tmpUserId = tmp[0].split(':')[1];
				var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + tmpUserId;
				chrome.windows.create({
					url: sendWelcomeMeesageUrl,
					focused: false,
					type: "popup",
					top: Math.floor(window.screen.availHeight / 4 * 3),
					left: Math.floor(window.screen.availWidth / 4 * 3),
					height: Math.floor(window.screen.availHeight / 4),
					width: Math.floor(window.screen.availWidth / 4)
				}, function (tabs) {
					requestMessageTabIdADF = tabs.tabs[0].id;
					var temp = {};

					temp.tabId = requestMessageTabIdADF;
					temp.ADF_welcome_message = ADF_welcome_message
					friendRequestTabIdsADF.push(temp);
					chrome.tabs.onUpdated.addListener(requestTabListenerADF);
				});
			}
		});
	} else {
		var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + ADFmemberId;
		chrome.windows.create({
			url: sendWelcomeMeesageUrl,
			focused: false,
			type: "popup",
			top: Math.floor(window.screen.availHeight / 4 * 3),
			left: Math.floor(window.screen.availWidth / 4 * 3),
			height: Math.floor(window.screen.availHeight / 4),
			width: Math.floor(window.screen.availWidth / 4)
		}, function (tabs) {
			requestMessageTabIdADF = tabs.tabs[0].id;
			var temp = {};

			temp.tabId = requestMessageTabIdADF;
			temp.ADF_welcome_message = ADF_welcome_message
			friendRequestTabIdsADF.push(temp);
			chrome.tabs.onUpdated.addListener(requestTabListenerADF);
		});
	}
}


function requestTabListenerADF(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === requestMessageTabIdADF) {
		var foundTabRecord = friendRequestTabIdsADF.filter((list) => { return list.tabId == requestMessageTabIdADF });
		var welcomeMessageText = '';

		if (foundTabRecord.length > 0) {
			welcomeMessageText = foundTabRecord[0].ADF_welcome_message;
		}
		chrome.tabs.sendMessage(requestMessageTabIdADF, { from: 'background', subject: 'triggerRequestMessage', welcomeMessageText: welcomeMessageText });
		chrome.tabs.onUpdated.removeListener(requestTabListenerADF);
	}
}
function updateFBUsertagMultiUserForGroupMember(sender, multiTagdata) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/tags/multi_tag",
		data: multiTagdata,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		} else if (response.status == 200 || response.result == 'success') {
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: 'unSelectCheckBox' });
			chrome.storage.local.set({ 'taggedUsers': response.taggedUsers });
		}
	});
}
/////////////////Add user when admin approve a member request////////////
function addFBUserForGroupMember(sender, memberRequest) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/groupgrowth/add_user",
		data: memberRequest,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		} else if (response.status == 200 || response.result == 'success') {
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: "add_user", status: response.result});
			if(response.Message != null && response.Message.trim().length ==0){
				clearBulkIntervals();
				let delaySend = 0;				
				if(response.dmmessage1 != null && response.dmmessage1.trim().length >=0){
					let timeoutId = setTimeout(() => {
						sendMRRequestDMMessage(memberRequest.numeric_fb_id,response.dmmessage1);
					}, delaySend);
					delaySend = parseInt(delaySend) + parseInt(5000);
					bulkIntervalIds.push(timeoutId);
						
				}
				if(response.dmmessage2 != null && response.dmmessage2.trim().length >=0){
					let timeoutId = setTimeout(() => {
						sendMRRequestDMMessage(memberRequest.numeric_fb_id,response.dmmessage2);
					}, delaySend);
					delaySend = parseInt(delaySend) + parseInt(5000);
					bulkIntervalIds.push(timeoutId);						
				}
				if(response.dmmessage3 != null && response.dmmessage3.trim().length >=0){
					let timeoutId = setTimeout(() => {
						sendMRRequestDMMessage(memberRequest.numeric_fb_id,response.dmmessage3);
					}, delaySend);
					delaySend = parseInt(delaySend) + parseInt(5000);
					bulkIntervalIds.push(timeoutId);						
				}
			}
		}
		else{
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: "add_user", status: response.result });
		}
	});
}
/////////////////Set tag post link by admin group////////////
function setTagPostLinkForGroup(sender, tagPostLink) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/groupgrowth/settaggedpost",
		data: tagPostLink,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) { 
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		} else if (response.status == 200 || response.result == 'success') {
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: "tag_post_link", status: response.result});
		}
		else{
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: "tag_post_link", status: response.result });
		}               
	});
}
/////////////////Add existing member in group////////////
function addExistingFBUserForGroupMember(sender, memberRequest) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/groupgrowth/add_member",
		data: memberRequest,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		} else 
		{
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: "add_member", result: response.Message});
		}
	});
}
/////////////////Add member from another group////////////
function stealMemberFromGroup(sender, memberRequest) {
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/groupgrowth/stealmembers",
		data: memberRequest,
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function (response) {
		if (response.status == 401) {
			chrome.storage.local.set({ 'ssa_user': '' });
		} else 
		{
			chrome.tabs.sendMessage(sender.tab.id, { from: 'background', subject: "add_member", result: response.message});
		}
	});
}

var dmMRMessageTabId = 0;
function sendMRRequestDMMessage(threadId, dmMessage) {/// 1 for pre // 2for post message	
	threadId = threadId.replace('/', '');
	if (/[a-zA-Z]/.test(threadId)) {   /// having alphabets id
		$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/' + threadId,
			success: function (data, txtStatus, request) {
				var str = $(data).text()
				var mySubString = str.substring(
					str.lastIndexOf('&quot;profile_id&quot;:') + 1,
					str.lastIndexOf('&quot;profile_id&quot;:') + 50
				);
				tmp = mySubString.split(',');
				var tmpUserId = tmp[0].split(':')[1];
				var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + tmpUserId;
				chrome.windows.create({
					url: sendWelcomeMeesageUrl,
					focused: false,
					type: "popup",
					top: Math.floor(window.screen.availHeight / 4 * 3),
					left: Math.floor(window.screen.availWidth / 4 * 3),
					height: Math.floor(window.screen.availHeight / 4),
					width: Math.floor(window.screen.availWidth / 4)
				}, function (tabs) {
					dmMRMessageTabId = tabs.tabs[0].id;
					var temp = {};
					temp.currentRequestId = threadId;
					temp.dmMessage = dmMessage;
					temp.tabId = dmMRMessageTabId;
					dmMRMessageTabIds.push(temp);
					chrome.tabs.onUpdated.addListener(requestMRDMTabListener);
				});
			}
		});
	} else {
		var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + threadId;
		chrome.windows.create({
			url: sendWelcomeMeesageUrl,
			focused: false,
			type: "popup",
			top: Math.floor(window.screen.availHeight / 4 * 3),
			left: Math.floor(window.screen.availWidth / 4 * 3),
			height: Math.floor(window.screen.availHeight / 4),
			width: Math.floor(window.screen.availWidth / 4)
		}, function (tabs) {
			dmMRMessageTabId = tabs.tabs[0].id;
			var temp = {};
			temp.currentRequestId = threadId;
			temp.dmMessage = dmMessage;
			temp.tabId = dmMRMessageTabId;

			dmMRMessageTabIds.push(temp);
			chrome.tabs.onUpdated.addListener(requestMRDMTabListener);
		});
	}
}
function requestMRDMTabListener(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete" && tabId === dmMRMessageTabId) {
		chrome.tabs.onUpdated.removeListener(requestMRDMTabListener);
		var foundTabRecord = dmMRMessageTabIds.filter((list) => { return list.tabId == dmMRMessageTabId });
		if (foundTabRecord.length > 0) {
			chrome.tabs.sendMessage(dmMRMessageTabId, { from: 'background', subject: 'triggerRequestMessage', welcomeMessageText: foundTabRecord[0].dmMessage });
		}		
	}
}
///////////////// Revamp of sending bulk messages////////////////////////
var collectionOfTabIds = [];
var bulkRandomDelayArray = [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000];


function prepareDataForBulkMessage(bulkMessageSettings) {

	bulkTaggedUserArray = [];
	bulkParentTabId = bulkMessageSettings.bulkMessageTabId;


	chrome.storage.local.get(["taggedUsers"], function (result) {
		// chrome.cookies.set({ url: cookiesBaseUrl, name: "cts_bulkMessageSettings", value:  JSON.stringify(result.bulkMessageSettings), expirationDate: (new Date().getTime()/1000) + (3600 * 1000*87660)  });

		result.taggedUsers.forEach(function (item, index) {
			if (!bulkMessageSettings.sendAll) {
				foundTaggedUser = bulkMessageSettings.selectedBulkTagIds.filter((list) => ((item.tag_id.indexOf(list.tagid) > -1) && item.fb_user_id != null))
			}

			if ((bulkMessageSettings.sendAll || foundTaggedUser.length > 0) && item.fb_user_id != null) {
				item.sendBulk = false;
				bulkTaggedUserArray.push(item);
			}
		});

		totalBulkArrayContacts = bulkTaggedUserArray.length;
		bulkArrayCounter = 0;
		// chrome.runtime.sendMessage({action: "bulkMessageCounter", counter: bulkArrayCounter, totalContacts:totalBulkArrayContacts});        
		// chrome.runtime.sendMessage({'action':'pup-counter', uniqueCon: totalBulkArrayContacts, bulkCounter: bulkArrayCounter});



		chrome.storage.local.set({
			'bulkTaggedUserArray': bulkTaggedUserArray
		}, function () {
			readLastStateOfTaggedUserArray();
		});


		//startBulkMessage();
	})
}
function readLastStateOfTaggedUserArray() {

	chrome.storage.local.get(["bulkTaggedUserArray", "bulkMessageSettings", "linkedFbAccount"], function (result) {
		var mylocation = '';
		if (typeof result.linkedFbAccount.location != "undefined" && result.linkedFbAccount.location != "" && result.linkedFbAccount.location != null) {
			mylocation = result.linkedFbAccount.location;
		}
		bulkMessageSettings = result.bulkMessageSettings;

		bulkTaggedUserArray = [];
		bulkUserDelay = parseInt(bulkMessageSettings.bulkDelay);

		sendLimitOfBulkMessage = parseInt(bulkMessageSettings.sendLimit);

		if (bulkMessageSettings.useRandomDelay) {
			bulkUserDelay = parseInt(bulkRandomDelayArray[Math.floor(Math.random() * bulkRandomDelayArray.length)]);
		}
		removeFromTag = bulkMessageSettings.removeFromTag;
		bulkMessageTextArray = bulkMessageSettings.messageTextArray;
		sendRandomMessage = bulkMessageSettings.sendRandomMessage;

		selectedBulkTagIds = bulkMessageSettings.selectedBulkTagIds;
		bulkSendMessageLimit = parseInt(bulkMessageSettings.sendLimit);

		bulkTaggedUserArray = result.bulkTaggedUserArray;
		totalBulkArrayContacts = bulkTaggedUserArray.length;


		findLastProcessedIndex = bulkTaggedUserArray.findIndex((item) => (item.sendBulk == false));

		currentBulkProcessedIndex = findLastProcessedIndex;
		if (findLastProcessedIndex != -1) {
			// $('#processed-members').text(findLastProcessedIndex);	
			startBulkFromIndex(bulkTaggedUserArray, findLastProcessedIndex, mylocation);
		} else {
			bulkMessageStatus = 'complete';
			chrome.runtime.sendMessage({
				type: 'bulkMessageStatus',
				bulkMessageStatus: bulkMessageStatus
			})

			setBlankCookies();
		}
	});
}
function startBulkFromIndex(bulkTaggedUserArray, startIndex, mylocation) {

	var tempDelay = 0;
	var sentMessagesInCurrentProcess = 0;

	bulkTaggedUserArray.forEach(function (oneBulkMember, currentIndex) {
		if (currentIndex >= startIndex) {
			let outIds = setTimeout(() => {
				if (sentMessagesInCurrentProcess < bulkSendMessageLimit) {
					sentMessagesInCurrentProcess = sentMessagesInCurrentProcess + 1;
					bulkMessageStatus = 'running';

					if (currentIndex == bulkTaggedUserArray.length - 1) {
						// $('#ssa-msgs').text('Completed');
						// chrome.storage.local.set({'bulkTaggedUserArray':[]});
						// chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'completed'});
						// hide_loader();
						// $('#limit').text(bulkTaggedUserArray.length);                      

						bulkMessageStatus = 'complete';
						chrome.runtime.sendMessage({
							action: 'bulkMessageComplete',
							bulkMessageStatus: bulkMessageStatus
						})

						setBlankCookies();
					}
					let delaySend = 0;
					bulkMessageTextArray.forEach(oneMessage => {
						var timeoutId = setTimeout(() => {
							sendBulkMessage(oneBulkMember, oneMessage, mylocation);
							if(removeFromTag){
								if(selectedBulkTagIds != null && selectedBulkTagIds.length ==1){
									removeUserFromTag(oneBulkMember,selectedBulkTagIds[0].tagid);
								}								
							}
						}, delaySend);
						delaySend = parseInt(delaySend) + parseInt(5000);
						bulkIntervalIds.push(timeoutId);
					});

					bulkTaggedUserArray[currentIndex].sendBulk = true;
					currentBulkProcessedIndex = currentBulkProcessedIndex + 1;

					chrome.tabs.sendMessage(bulkParentTabId, { from: 'background', subject: 'bulkCounter', current: currentBulkProcessedIndex, totalBulkMessages: bulkTaggedUserArray.length });
					chrome.runtime.sendMessage({ 'action': 'bulk-popup-counter', uniqueCon: totalBulkArrayContacts, bulkCounter: currentBulkProcessedIndex });

					chrome.storage.local.set({
						'bulkTaggedUserArray': bulkTaggedUserArray
					}, function () {
						// chrome.runtime.sendMessage({
						//     type: 'bulkMessageStatus',
						//     bulkMessageStatus: bulkMessageStatus
						// })
						$('#ssa-msgs').text('Running');
						chrome.runtime.sendMessage({ saveBlukMessageState: "saveBlukMessageState", status: 'running' });
					});
				} else {
					$('#ssa-msgs').text('Limit exceeded');
					chrome.runtime.sendMessage({ saveBlukMessageState: "saveBlukMessageState", status: 'paused' });
					// bulkMessageStatus = 'limit_excedeed';
					// chrome.tabs.sendMessage(bulkParentTabId, {
					// 	from: 'background',
					//     subject: bulkMessageStatus
					// })
					clearBulkIntervals();
				}
			}, tempDelay);

			bulkIntervalIds.push(outIds)

			tempDelay = parseInt(tempDelay) + parseInt(bulkUserDelay);
			// console.log(tempDelay)
		}
	})

}

function clearBulkIntervals() {
	//console.log('clearBulkIntervals')
	bulkIntervalIds.forEach(function (item) {
		clearInterval(item);
	});
	bulkIntervalIds = [];
}
function removeUserFromTag(oneSC, tagId) {

	threadId = oneSC.numeric_fb_id;

	if (threadId == null || threadId == 0) {
		threadId = oneSC.fb_user_id;
	}	
	// Save new date
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if( typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != ""  ){
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tagged_users/removefromtag",
				data: {userId:result.ssa_user.id,fbUserId:threadId,tagId:tagId},
				dataType: 'json',
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function(response) {
				if(response.status == 401){
					chrome.storage.local.set({'ssa_user':''});	
				}else if (response.status == 404) {
					//port.postMessage({'false': true});
				}		  
			});
		}
	});	
}

function sendBulkMessage(oneSC, oneMessage, mylocation) {

	threadId = oneSC.numeric_fb_id;

	if (threadId == null || threadId == 0) {
		threadId = oneSC.fb_user_id;
	}

	fullName = oneSC.fb_name

	if (/[a-zA-Z]/.test(threadId)) {   /// having alphabets id
		$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/' + threadId,
			success: function (data, txtStatus, request) {
				var str = $(data).text()
				var mySubString = str.substring(
					str.lastIndexOf('&quot;profile_id&quot;:') + 1,
					str.lastIndexOf('&quot;profile_id&quot;:') + 50
				);
				tmp = mySubString.split(',');
				var tmpUserId = tmp[0].split(':')[1];
				var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + tmpUserId;
				chrome.windows.create({
					url: sendWelcomeMeesageUrl,
					focused: false,
					type: "popup",
					top: Math.floor(window.screen.availHeight / 4 * 3),
					left: Math.floor(window.screen.availWidth / 4 * 3),
					height: Math.floor(window.screen.availHeight / 4),
					width: Math.floor(window.screen.availWidth / 4)
				}, function (tabs) {
					RebulkMessageTabId = tabs.tabs[0].id;
					var temp = {};
					temp.fullName = fullName;
					temp.tabId = RebulkMessageTabId;
					temp.mylocation = mylocation;
					temp.bulkMessage = oneMessage;
					collectionOfTabIds.push(temp);
					chrome.tabs.onUpdated.addListener(bulkTabListener);
				});
			}
		});
	} else {
		var sendWelcomeMeesageUrl = 'https://m.facebook.com/messages/compose/?ids=' + threadId;
		chrome.windows.create({
			url: sendWelcomeMeesageUrl,
			focused: false,
			type: "popup",
			top: Math.floor(window.screen.availHeight / 4 * 3),
			left: Math.floor(window.screen.availWidth / 4 * 3),
			height: Math.floor(window.screen.availHeight / 4),
			width: Math.floor(window.screen.availWidth / 4)
		}, function (tabs) {
			RebulkMessageTabId = tabs.tabs[0].id;
			var temp = {};
			temp.fullName = fullName;
			temp.tabId = RebulkMessageTabId;
			temp.mylocation = mylocation;
			temp.bulkMessage = oneMessage;
			collectionOfTabIds.push(temp);
			chrome.tabs.onUpdated.addListener(bulkTabListener);
		});
	}
}
function bulkTabListener(tabId, changeInfo, tab) {

	if (changeInfo.status === "complete" && tabId === RebulkMessageTabId) {

		var foundTabRecord = collectionOfTabIds.filter((list) => { return list.tabId == RebulkMessageTabId });
		var welcomeMessageText = '';

		if (foundTabRecord.length > 0) {
			welcomeMessageText = getBulkMessage(foundTabRecord[0].fullName, foundTabRecord[0].mylocation, foundTabRecord[0].bulkMessage);
		}
		setTimeout(() => {
			chrome.tabs.sendMessage(RebulkMessageTabId, { from: 'background', subject: 'triggerRequestMessage', welcomeMessageText: welcomeMessageText });			
		}, 2000)
		
		chrome.tabs.onUpdated.removeListener(bulkTabListener);
	}
}

function getBulkMessage(fullName, myLocation, bulkMessage) {

	var welcomeMessageText = '';


	welcomeMessageText = getWelcomeMessage(bulkMessage, fullName, myLocation);
	return welcomeMessageText;
}

function setBlankCookies() {

	chrome.storage.local.set({ 'bulkMessageSettings': "" });
	chrome.storage.local.set({ 'bulkMessageSettings': "" });
	// 	chrome.cookies.set({ url: cookiesBaseUrl, name: "bulkMessageSettings", value:  "", expirationDate: (new Date().getTime()/1000) + (3600 * 1000*87660)  });          
	//    // chrome.cookies.set({ url: custom_data.baseUrl, name: "fe_bulkStatus", value: "", expirationDate: (new Date().getTime()/1000) + (3600 * 1000*87660)  });
	// 	chrome.cookies.set({ url: cookiesBaseUrl, name: "bulkMessageSettings", value:  "", expirationDate: (new Date().getTime()/1000) + (3600 * 1000*87660)  });

}
function getTaggedUsers(groupId){
	return new Promise(function(resolve,reject) {
		let returnValue = {
			result: "",
			usersLeft:"",
			message:""
		}
		chrome.storage.local.get(["ssa_user", "fb_id"], function (result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "") {
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/groupgrowth/gettaggeduser",
					data: { userId: result.ssa_user.id,groupid: groupId },
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function (response) {
					if (response.status == 401) {
						chrome.storage.local.set({ 'ssa_user': '' });
						returnValue.result = "failure";
					}
					else
					{
						returnValue = response;
					}
					resolve(returnValue);
				});	
			}
		});		
		
	});	
}