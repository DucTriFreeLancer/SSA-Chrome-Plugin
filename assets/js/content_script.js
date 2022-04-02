

var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});

chrome.runtime.sendMessage({setFbIdForAll: "setFbIdForAll"});

var processing = false;
var currentLoggedInFBId = '';

var friendRequestHistory = [];
var $checkedUsersForMessenger = []; 
///////////bulk code/////////
var bulkProcessing = true;

var bulkTaggedUserArray = [];
var bulkMessageTimeout = [];
var selectedBulkTagIds
var bulkUserDelay = 0;
var	bulkSendMessageLimit = null;
var RebulkMessageTabId = 0;

var bulkMessageTextArray = null;
var sendRandomMessage = null;
var useRandomDelay = null;

var addUserBulkSendLimit = true;

var fbNameForNotes = '';

var isFBNewLayout = false;
var isIframeLoaded = false;
var imageToBeSend;

var bulkMessagePopUp = `
					<div class="text"><h3>Message sent</h3>
					</div>
					<div class="text">
					    <h2><span id="processed-members">0</span> <i>of</i> <span class="total-friends" id="limit">0</span></h2>
					</div>
					<div class="block" id="ssa-msgs">
						Processing
					</div>`;

$("body").append('<div id="overlay"><div id="ssa_model"><div id="ssa_model_content">'+bulkMessagePopUp+'</div></div></div>');
$("body").append('<div id="overlay-two"><div id="ssa_model_two"><div id="ssa_model_content_two" class="custom-row"></div></div></div>');
$("body").append('<div id="overlay-three"><div id="ssa_model_three" class ="fb_user_id_to_add_note"><div id="ssa_model_content_three" class="custom-row"></div></div></div>');

//var searchHtml = '<div class="row custom-row"> <input placeholder="Search tag" type="text" id="search-tag-by-name" > </div> ';
var searchHtml = `<div class="row custom-row"> 

					<div class= "row-levels">
						<div class="ssa-cols ssa-col-md-9"> 
							<input placeholder="Search tag" type="text" id="search-tag-by-name" > 
						</div> 

						<div class="ssa-cols ssa-col-md-3" > 
							<button class="add-tag-from-content bg-purple ssa-btn">Add Tag</button>
						</div>
					</div>

					<div class= "row-levels save-tag-div">
						<div class="left-col-item ssa-cols ssa-col-md-12"> 
							<input placeholder="Enter Tag Name" type="text" id="tag-name-from-content" > 
						</div> 

						<div class="right-col-item ssa-cols ssa-col-md-12 text-center pt-2" > 
							<button class="save-tag-from-content bg-purple ssa-btn">Save Tag</button>
							<button class="search-form-content bg-gray ssa-btn">Back to Search</button>
						</div>
					</div>
					<div class="row-levels ssa-cols ssa-col-md-12 text-center error-mgs error p-2 pl-0 pr-0">
					</div>
				</div>`;

var tagColors = ['warning','primary','danger','success','dark','info'];

////////// bulk code /////////

var conversionListText = "Conversation list";

var fb_ul_selector = "ul[aria-label='"+conversionListText+"']";
var fb_ul_li_selector = "ul[aria-label='"+conversionListText+"'] li";
var fb_list_selectors = "ul[aria-label='"+conversionListText+"'] li:not([fb_user_id]";

// Add native 'click' and 'change' events to be triggered using jQuery
	jQuery.fn.extend({
		'mclick': function () {
			var click_event = document.createEvent('MouseEvents')
			click_event.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            0, null);
			return $(this).each(function () {
				$(this)[0].dispatchEvent(click_event)
			})
		},	
		'vchange': function () {
			var change_event = document.createEvent('HTMLEvents')
			change_event.initEvent('change', false, true)
			return $(this).each(function () {
				$(this)[0].dispatchEvent(change_event)
			})
		},
		'vclick': function () {
			var click_event = document.createEvent('HTMLEvents')
			click_event.initEvent('click', false, true)
			return $(this).each(function () {
				$(this)[0].dispatchEvent(click_event)
			})
		},
		'vblur': function () {
			var click_event = document.createEvent('HTMLEvents')
			click_event.initEvent('blur', false, true)
			return $(this).each(function () {
				$(this)[0].dispatchEvent(click_event)
			})
		},
		'vkeyup': function () {
			var keyup_event = document.createEvent('HTMLEvents')
			keyup_event.initEvent('keyup', false, true)
			return $(this).each(function () {
				$(this)[0].dispatchEvent(keyup_event)
			})
		},
		'vkeyupWithChar': function (key) {
			var specific_keyup_event = document.createEvent('HTMLEvents')
			specific_keyup_event.initEvent('keyup', false, true)
			specific_keyup_event.which = key;
			specific_keyup_event.keyCode = key;
			return $(this).each(function () {
				$(this)[0].dispatchEvent(specific_keyup_event)
			})
		}
	})

var rejectedProfiles = [];
processRejectedProfiles();


$(function () {
	if (window.location.origin.indexOf('messenger') > -1) {
		setInterval(()=>{			
			$('div[contenteditable="true"]').parent().prev().find('div').text('')
		}, 1)
		$('div[contenteditable="true"]').parent().prev().find('div').text('')
		setInterval(()=>{
			$('span.total-selected-messenger-member').text('Selected: '+$('.select-multi-user-messenger:checked').length);
		},200);
	}
});



chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.cmd == "profileRejected") {
		//add to the end of queue
		rejectedProfiles.push({url: request.url, other: request.parameters});
	}
	sendResponse({});
});

function processRejectedProfiles() {
	if(rejectedProfiles.length > 0) {
		//get the oldest element in queue
		var profile = rejectedProfiles.shift();

		//process profile
		//...
	}

	//process next entry in the queue in 3 seconds
	setTimeout(processRejectedProfiles, 3000);
}
/* global ClipboardItem */
async function pasteImage(blob) {
	const clipboardItemInput = new ClipboardItem({ 'image/png': blob });
	await navigator.clipboard.write([clipboardItemInput])
	  .then(() => {
		console.log('Copied to the clipboard successfully!');
	  }, (error) => {		
		console.log(error);
	  });
	document.execCommand('paste');
	chrome.runtime.sendMessage({triggerChatImage: "triggerChatImage"});
  }
  function sendImage(canvasData) {
	setTimeout(async () => {
	  const blobObj = canvasData.toBlob(async (blob) => {
		console.log(blob);
		if (blob == null || blob.size < 50000) {
		  const canvasElement = document.createElement('canvas');
		  const imgWidth = imageToBeSend.naturalWidth;
		  const imgHeight = imageToBeSend.naturalHeight;
		  canvasElement.width = imgWidth;
		  canvasElement.height = imgHeight;
		  const ctx = canvasElement.getContext('2d');
		  ctx.drawImage(imageToBeSend, 0, 0, imgWidth, imgHeight);
		  canvasElement.toBlob(async (blobObj) => {
			console.log(blobObj);
			pasteImage(blobObj);
		  });
		} else {
		  console.log('___');
		  pasteImage(blob);
		}
	  }, 'image/png', 1);
	}, 50);
  }
async function clickOnElements(element) {
    console.log(element);
    let MouseEvent = document.createEvent("MouseEvents");
    MouseEvent.initEvent("mouseover", true, true);
    const over = document.querySelector(element).dispatchEvent(MouseEvent);
    //await sleep(50);
    MouseEvent.initEvent("mousedown", true, true);
    const down = document.querySelector(element).dispatchEvent(MouseEvent);
    MouseEvent.initEvent("mouseup", true, true);
    const up = document.querySelector(element).dispatchEvent(MouseEvent);
    MouseEvent.initEvent("click", true, true);
    const click = document.querySelector(element).dispatchEvent(MouseEvent);
    console.log(over, down, up, click);

    if (over) {
        return new Promise((resolve) => {
            resolve();
        });
    } else {
        return await clickOnElements(element);
    }
}
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {	
	
	if(message.from === 'popup' && message.subject === 'sendTemplateMessage') {	
		sendMessageFromPopup(message);
	} else if(message.from === 'popup' && message.subject === 'openChatThread') {
		if($(fb_ul_selector+" li[fb_user_id='"+message.fb_id+"']").length > 0){
			$(fb_ul_selector+" li[fb_user_id='"+message.fb_id+"']").find('a').mclick();
		} else {
			var loc = getFbIdFromLocation();
			//str.replace("Microsoft", "W3Schools");
			window.location.replace(window.location.href.replace(loc, message.fb_id));
		}
		
	} else if(message.from === 'popup' && message.subject === 'refresh'){
			createTagDropDownContainer();
		// chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	 //      if(tabs[0].url.indexOf('/inbox/') > -1){
	 //      	createTagDropDownContainer();
	 //      }else{
	 //      	createTagDropDownContainer();
	 //      }
	 //  	});  

	}else if(message.from === 'background' && message.subject === 'triggerClickToSendChat'){
		findBTN = setInterval(function () {
			if ($('div[aria-label="Press Enter to send"').length > 0 ) {
				clearInterval(findBTN);
				$('div[aria-label="Press Enter to send"').mclick();		
				location.reload();		
			}
		},200)
	}else if(message.from === 'background' && message.subject === 'triggerClickToSendImage'){
		findBTN = setInterval(function () {
			if ($('div[aria-label="Press Enter to send"').length > 0 ) {
				clearInterval(findBTN);
				$('div[aria-label="Press Enter to send"').mclick();
				// chrome.runtime.sendMessage({url:"index.html",action: "triggerShowPopup"});
			}
		},200)
	}else if(message.from === 'background' && message.subject === 'unSelectCheckBox'){
		$('.select-multi-user-messenger').prop('checked',false);
		
	}  else if(message.from === 'popup') {
		verifyUserLogin();
	}
});
async function sendMessage(message){
	var pathname = window.location.pathname.toString();
	if (pathname.indexOf('/inbox') > -1) {		

		// selector = '._1p7p._5id1._4dv_._58al.uiTextareaAutogrow';
		// fullName = $('div[data-pagelet]').find('a[aria-haspopup]').parent().prev().text();
		selector = 'div textarea.uiTextareaAutogrow';
		fullName = $('.hqkabbkj').text();
		if(fullName != ''){
			var fullNameArray = fullName.split(' ');
			var firstName = fullNameArray[0];
			var lastName = fullNameArray[fullNameArray.length-1];
			var str = message.templateMessage;
			var templateMessage = str.replace("[first_name]", firstName);
			templateMessage = templateMessage.replace("[last_name]", lastName);
			templateMessage = templateMessage.replace("[full_name]", fullName);
		}

		if($(selector).length > 0){
			var evt = new Event('input', {
						bubbles: true  
					});
			var input = document.querySelector(selector);
			input.innerHTML = templateMessage;
			input.dispatchEvent(evt);
		}
		$('._4jy0._4jy3._4jy1._51sy.selected').mclick();
	} else {
		selector = 'div[aria-label="New message"] div[contenteditable="true"] span br';
		if (message.templateMessage.indexOf('--template--') >= 0) {			
			 if(typeof imageToBeSend == "undefined"){
				 return;
			 }
			    selector =  'div[contenteditable="true"]';

				imageToBeSend.onload = function() {					
					try {
						const canvasElement = document.createElement('canvas');
						const imgWidth = imageToBeSend.naturalWidth;
						const imgHeight = imageToBeSend.naturalHeight;
						// console.log(':::::::imgWidth::::', imgWidth, ':::::imgHeight::::::', imgHeight);
						canvasElement.width = imgWidth;
						canvasElement.height = imgHeight;
						const ctx = canvasElement.getContext('2d');
						ctx.drawImage(imageToBeSend, 0, 0, imgWidth, imgHeight);
						if($(selector).length > 0){
							$(fb_ul_selector+" li[fb_user_id]:first-child").find('a').mclick();
							let loc = getFbIdFromLocation();
							// chrome.runtime.sendMessage({triggerChatMessage: "triggerChatMessage"});
							// location.replace(loc[0]+'/t/'+loc[1]);	
							const $next = $(`${fb_ul_selector} li[fb_user_id='${loc}']`).next('li').find('a');
							const $prev = $(`${fb_ul_selector} li[fb_user_id='${loc}']`).prev('li').find('a');
							// console.log(':::::$next::::::', $next);
							// console.log(':::::$prev::::::', $prev);
							let flag = true;

							if ($next.length > 0) {
								$next.mclick();
								flag = true;
							} else if ($prev.length > 0) {
								$prev.mclick();
								flag = false;
							} else {
								location.reload();
							}
							setTimeout(() => {
								let loc1 = getFbIdFromLocation();
								const $nextUser = $(`${fb_ul_selector} li[fb_user_id='${loc1}']`).next('li').find('a');
								const $prevUser = $(`${fb_ul_selector} li[fb_user_id='${loc1}']`).prev('li').find('a');
								if (flag) {
									$prevUser.mclick();
								} else {
									$nextUser.mclick();
								}					
								sendImage(canvasElement);			
							}, 100);
						}	
						else{
							// $(`div[data-testid='mwthreadlist-item']`).first().find('a').mclick();
							// let loc =getFbIdFromLocation();
							// // chrome.runtime.sendMessage({triggerChatMessage: "triggerChatMessage"});
							// // location.replace(loc[0]+'/t/'+loc[1]);	
							// const $next = $(`div[data-testid='mwthreadlist-item'][fb_user_id='${loc}']`).next('div').find('a');
							// const $prev = $(`div[data-testid='mwthreadlist-item'][fb_user_id='${loc}']`).prev('div').find('a');
							// // console.log(':::::$next::::::', $next);
							// // console.log(':::::$prev::::::', $prev);
							// let flag = true;

							// if ($next.length > 0) {
							// 	$next.mclick();
							// 	flag = true;
							// } else if ($prev.length > 0) {
							// 	$prev.mclick();
							// 	flag = false;
							// } else {
							// 	location.reload();
							// }
							setTimeout(() => {
								// let loc1 = getFbIdFromLocation();
								// const $nextUser = $(`div[data-testid='mwthreadlist-item'][fb_user_id='${loc1}']`).next('div').find('a');
								// const $prevUser = $(`div[data-testid='mwthreadlist-item'][fb_user_id='${loc1}']`).prev('div').find('a');
													
								// if (flag) {
								// 	$prevUser.mclick();
								// } else {
								// 	$nextUser.mclick();
								// }					
								sendImage(canvasElement);			
							}, 100);
							// setTimeout(() => {
							// 	let loc1 = window.location.href;
							// 	loc1 = loc1.split('/t/');
							// 	if (loc1[1].indexOf('?') > 0) {
							// 	// eslint-disable-next-line prefer-destructuring
							// 		loc1[1] = loc1[1].split('?')[0];
							// 	}
							// 	// $('div[role="main"]').find('.qzhwtbm6.knvmm38d a[target="_blank"][role="link"]:eq(0)').mclick();
							// 	$(`div[data-testid='mwthreadlist-item'][fb_user_id='${loc1[1]}']`).find('a').mclick();
								
							// 	sendImage(canvasElement);
							// },100);							
						}
										
					} catch (e) {
						error(e, ":", name);
					}					
			  	};
			
		} else {
			var fullName = '';							
			if($(selector).length > 0){
				fullName = $('div.buofh1pr.qx9c56kf').find('h2').find('span.ltmttdrg').text();

				message.templateMessage= getTemplateMessage(message, fullName);			
				var evt = new Event('input', {
							bubbles: true  
						});
				var input = document.querySelector(selector);
				input.innerHTML = message.templateMessage ;
				input.dispatchEvent(evt);
				$(selector).after('<span data-text="true">'+message.templateMessage +'</span>');
						
				// var loc = window.location.href;
				// loc = loc.split("/t/");
				// $(fb_ul_selector+" li[fb_user_id]:first-child").find('a').mclick();
				let loc = getFbIdFromLocation();
				// chrome.runtime.sendMessage({triggerChatMessage: "triggerChatMessage"});
				// location.replace(loc[0]+'/t/'+loc[1]);	
				const $next = $(`${fb_ul_selector} li[fb_user_id='${loc}']`).next('li').find('a');
     			const $prev = $(`${fb_ul_selector} li[fb_user_id='${loc}']`).prev('li').find('a');
      			// console.log(':::::$next::::::', $next);
      			// console.log(':::::$prev::::::', $prev);
				let flag = true;

				if ($next.length > 0) {
					$next.mclick();
					flag = true;
				} else if ($prev.length > 0) {
					$prev.mclick();
					flag = false;
				} else {
					location.reload();
				}
				setTimeout(() => {
					let loc1 = getFbIdFromLocation();
					const $nextUser = $(`${fb_ul_selector} li[fb_user_id='${loc1}']`).next('li').find('a');
					const $prevUser = $(`${fb_ul_selector} li[fb_user_id='${loc1}']`).prev('li').find('a');
					if (flag) {
						$prevUser.mclick();
					} else {
						$nextUser.mclick();
					}					
					setTimeout(() => {
						$('div[aria-label="Press Enter to send"').mclick();
					}, 500);	

					setTimeout(()=>{
						location.reload();
					},500)		
				}, 100);			
			}
			else{
				// selector = 'div[contenteditable="true"] div[data-contents="true"] span br';
				selector =  'div[contenteditable="true"]';

				fullName = $('div.buofh1pr.qx9c56kf').find('h2').find('span.ltmttdrg').text();
				// if (message.templateMessage.indexOf('[mylocation]') > -1) {		
				// 	if(message.myLocation.includes("|")){
				// 		var locations = message.myLocation.split("|");		
				// 		message.myLocation = locations[Math.floor(Math.random() * locations.length)];	
				// 	}				
				// 	message.templateMessage = message.templateMessage.replace(/\[mylocation]/g,message.myLocation);
				// }				

				// if(fullName != ''){
				// 	if (message.templateMessage.indexOf('[first_name]') > -1) {
				// 		first_name = fullName.split(' ')[0];
				// 		message.templateMessage = message.templateMessage.replace(/\[first_name]/g,first_name);
				// 	}
	
				// 	if (message.templateMessage.indexOf('[last_name]') > -1) {
				// 		nameArray = fullName.split(' ');
				// 		if(nameArray.length > 1){
				// 			last_name = nameArray[nameArray.length-1];
				// 			message.templateMessage = message.templateMessage.replace(/\[last_name]/g,last_name);
				// 		}else{
				// 			message.templateMessage = message.templateMessage.replace(/\[last_name]/g,'');
				// 		}
				// 	}
						
				// }
				
				message.templateMessage = getTemplateMessage(message, fullName);	
				
				if($(selector).length > 0){
					
					var evt = new Event('input', {
								bubbles: true  
							});
					var input = document.querySelector(selector);
					input.innerHTML = message.templateMessage;
					if(!input.dispatchEvent(evt)){
						console.log("dispatchEvent");
					};
			
					$(selector).after('<span data-text="true">'+message.templateMessage+'</span>');	
					var findEnterButton = setInterval(()=>{
						if ($('div[aria-label="Press Enter to send"').length > 0 || $('div[aria-label="Press enter to send"').length > 0) {
							clearInterval(findEnterButton);
							$('div[aria-label="Press enter to send"').mclick();
							$('div[aria-label="Press Enter to send"').mclick();
							setTimeout(()=>{
								location.reload();
							},500); 
						}
					},100)    					
					setTimeout(()=>{
						
						location.reload();
					},500)
					
				}
				// else{
				// 	console.log('else if not get ');
				// 	selector10 =  'div[contenteditable="true"]';
				// 	setTimeout(()=>{					
				// 		 clickOnElements(selector10);
				// 		navigator.clipboard.writeText(message.templateMessage).then(() => {
				// 			console.log(" Text Copied!!!!");
				// 			document.execCommand("paste", null, null);
				// 		});
				// 		var findEnterButton = setInterval(()=>{
				// 			if ($('div[aria-label="Press Enter to send"').length > 0 || $('div[aria-label="Press enter to send"').length > 0) {
				// 				clearInterval(findEnterButton);
				// 				$('div[aria-label="Press enter to send"').mclick();
				// 				$('div[aria-label="Press Enter to send"').mclick();
				// 				setTimeout(()=>{
				// 					//location.reload();
				// 				},500); 
				// 			}
				// 		},100)
				// 	},5000);
				// }
			}
		}
	}	
}
async function sendMessageFromPopup(message){
	if (message.templateMessage.indexOf('--template--') >= 0) {
		$('.temp_image_box').html(`
			<img class="temp_image" src="${message.templateMessage}" style="width:250px;display:none" crossorigin="anonymous">
		`);
		imageToBeSend = $('.temp_image').get(0);
		// imageToBeSend = new Image();
		// imageToBeSend.crossOrigin = "anonymous";
		// imageToBeSend.src = message.templateMessage;
		// console.log(imageToBeSend);
	}
	sendMessage(message);
	
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
 	if(request.from === 'background' && request.subject === 'tagadded'){
		var newTagLi = '<li class="bg-info tag-text-color bg-'+request.newTagData.class+'" color-code="0" li-class="info" tag-id="'+request.newTagData.value+'"><input class="multi-tag-checkbox" type="checkbox"> '+request.newTagData.text+'</li>';
		$('ul.model-tag-list').prepend(newTagLi);
		$('#tag-name-from-content').val('');
		$('.save-tag-from-content').prop('disabled', false).text('Save Tag');
		verifyUserLogin();
	}else if(request.from === 'background' && request.subject === 'displayNotes'){
		displayNotes(request.notes);
	}else if(request.from === 'background' && request.subject === 'displayTeamNotes'){
		displayTeamNotes(request.notes);
	}else if(request.from === 'background' && request.subject === 'noteUpdated'){
		$('.msg-for-notes').addClass('success').text('Your note has been updated successfully.').show();
		hideNoteMessagesAlerts();
	}else if(request.from === 'background' && request.subject === 'noteSaved'){
		$('.msg-for-notes').addClass('success').text('Your note has been added successfully.').show();
		$('.note-scope-list').remove();
		$('.add-new-note').attr('note-id',request.noteId).removeClass('add-new-note');
		hideNoteMessagesAlerts();
	}else if(request.from === 'background' && request.subject === 'noteDelete'){
		$('.msg-for-notes').addClass('success').text('Your note has been deleted successfully.').show();
		hideNoteMessagesAlerts();
	}else if(request.from === 'background' && request.subject === 'teamNoteUpdated'){
		$('.msg-for-notes').addClass('success').text('Your note has been updated successfully.').show();
		hideNoteMessagesAlerts();
	}else if(request.from === 'background' && request.subject === 'teamNoteSaved'){
		$('.msg-for-notes').addClass('success').text('Your note has been added successfully.').show();
		$('.add-new-note').attr('note-id',request.noteId).removeClass('add-new-note');
		hideNoteMessagesAlerts();
	}else if(request.from === 'background' && request.subject === 'teamNoteDelete'){
		$('.msg-for-notes').addClass('success').text('Your note has been deleted successfully.').show();
		hideNoteMessagesAlerts();
	}else if(request.from === 'background' && request.subject === 'checkFriendRequestForPostMessage'){
		 friendRequestHistory = request.friendRequestHistory;
		setTimeout(()=>{
			if ($('#bluebarRoot').length > 0) {
				checkFriendRequestForPostMessage();
			} else if($('#bluebarRoot').length == 0){
				checkFriendRequestForPostMessageNew();
			}
		},1000)
	}else if(request.from === 'background' && request.subject === 'triggerRequestMessage'){
		triggerRequestSendMessage(request.welcomeMessageText);
	}else if(request.from === 'background' && request.subject === 'readFriendRequestsConfirmPage'){
		
		friendRequestHistory = request.friendRequestHistory;
		if ($('#friends_center_main header').text().replace(/[^0-9]/g, "") != '') {
		 totalComingRequests = $('#friends_center_main header').text().replace(/[^0-9]/g, "");
		}
		loadComingRequests();

	}else if(request.from === 'background' && request.subject === 'facebookLoggedInUser'){
		currentLoggedInFBId = request.currentLoggedInFBId;
		///////////////////////
		chrome.storage.local.get(["numeric_fb_id"], function(result) {
			if(result.numeric_fb_id!=getCookieValue("c_user")){
				if ($('div[aria-label="Settings, help and more"]').length > 0) {
					$('div[aria-label="Settings, help and more"]').mclick();

					setTimeout(()=>{
						$('div[data-pagelet="root"] .qzhwtbm6.knvmm38d span:contains(Log Out)').mclick();
						$('div[data-pagelet="root"] .qzhwtbm6.knvmm38d span:contains(Log out)').mclick();
					},300);	

				}

				$('a[aria-label="Settings, help and more"]').mclick();
				setTimeout(()=>{
					$('div.uiContextualLayer li span:contains(Log Out)').mclick();
				},300);				
			}
		});


		//////////////////////////
		var findULText = setInterval(function(){
			// console.log('integrateSSAFeature');
			if($("div[aria-label='Conversations']").length > 0){
				clearInterval(findULText);			
				conversionListText = $("div[aria-label='Conversations']").find('ul').attr('aria-label');
				fb_ul_selector = "ul[aria-label='"+conversionListText+"']";
				fb_ul_li_selector = "ul[aria-label='"+conversionListText+"'] li";
				fb_list_selectors = "ul[aria-label='"+conversionListText+"'] li:not([fb_user_id]";
				integrateSSAFeature();					
				var li_fb_user_id = getFbIdFromLocation();
				chrome.runtime.sendMessage({getUserNotes: "getUserNotes", fb_user_id: li_fb_user_id,integrateSSAFeature: true});
			}
		}, 1000);
		var findULText = setInterval(function(){

			if($("div[data-testid='mwthreadlist-item']").length > 0){
				clearInterval(findULText);			
				integrateSSAFeatureWM();							
				var li_fb_user_id = getFbIdFromLocation();
				chrome.runtime.sendMessage({getUserNotes: "getUserNotes", fb_user_id: li_fb_user_id,integrateSSAFeature: true});
			}
		}, 1000);
	}else if(request.from === 'popup' && request.subject === 'profile_Pic'){
		
		profilePic=$('._94wq').find('._87v3').attr('src');
		chrome.runtime.sendMessage({action: "content_script", profilePic: profilePic});
	}else if(request.from === 'background' && request.subject === 'bulkCounter'){ //Re
		//console.log(request)
		bulkProcessing = true;
		$('#overlay').show();
		$('#processed-members').text(request.current);
		$('.total-friends').text(request.totalBulkMessages);		
		$('#ssa-msgs').text('Running');
		chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'running'});
		if (request.current >= request.totalBulkMessages) {
			bulkProcessing = false;
			chrome.runtime.sendMessage({action:'bulk-complete'})
			$('#processed-members').text(request.totalBulkMessages);
			$('#ssa-msgs').text('Completed');
			hide_loader();
		}
	}//else if(request.from === 'popup' && request.subject === 'openChatThreadBulkMessage') {
		
	// 	$('#overlay').show();
	// 	if (window.location.href.indexOf('filter=') > -1) {
	// 		$('a[aria-label="Settings, help and more"]').mclick();
	// 		setTimeout(()=>{
	// 			$('div.uiContextualLayer li span:contains(All Chats)').mclick();
	// 		},300);

	// 		setTimeout(()=>{
	// 			bulkProcessing = true;
	// 			bulkDelay = 0;
	// 			totalSend = 0;
	// 			totalSendLimit = 0;
	// 			addUserBulkSendLimit = true;
	// 			$('#ssa-msgs').text('Running');
	// 			chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'running'});
	// 			sendBulkMessage(request);
	// 		},500)

	// 	}else{
	// 		bulkProcessing = true;
	// 		bulkDelay = 0;
	// 		totalSend = 0;
	// 		totalSendLimit = 0;
	// 		addUserBulkSendLimit = true;
	// 		$('#ssa-msgs').text('Running');
	// 		chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'running'});
	// 		sendBulkMessage(request);
	// 	}
		
	// }
	// else if(request.from === 'popup' && request.subject === 'pause'){
	// 	$('#overlay').show();
	// 	bulkProcessing = false;
	// 	addUserBulkSendLimit = false;
	// 	$('#ssa-msgs').text('Paused');
	// 	chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'paused'});
	// }else if(request.from === 'popup' && request.subject === 'resume'){
	// 	$('#overlay').show();
	// 	bulkProcessing = true;
	// 	$('#ssa-msgs').text('Running');
	// 	chrome.storage.local.get(["bulkTaggedUserArray","bulkMessageSettings"], function(result) {
	// 		bulkUserDelay = result.bulkMessageSettings.bulkDelay;
	// 		bulkMessageTextArray = result.bulkMessageSettings.messageTextArray;
	// 		sendRandomMessage = result.bulkMessageSettings.sendRandomMessage;
	// 		useRandomDelay = result.bulkMessageSettings.useRandomDelay; //true|false
	// 		selectedBulkTagIds = result.bulkMessageSettings.selectedBulkTagIds;
			
	// 		if (result.bulkMessageSettings.useSendLimit && addUserBulkSendLimit) {
	// 			bulkSendMessageLimit = parseInt(result.bulkMessageSettings.sendLimit) + findLastProcessedIndex;
	// 		}else{
	// 			bulkSendMessageLimit = parseInt(result.bulkMessageSettings.sendLimit);
	// 		}
	// 	});
	// 	readLastStateOfTaggedUserArray();
	// 	chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'running'});
	// } else if(request.from === 'popup' && request.subject === 'stop'){
	// 	$('#overlay').show();
	// 	bulkProcessing = false;
	// 	$('#ssa-msgs').text('Stopped');
	// 	chrome.storage.local.set({'bulkTaggedUserArray':[]});
	// 	chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'stop'});
	// 	hide_loader();
	// }
	else if(request.from === 'background' && request.subject === 'bulkStateMsg'){ //Re
		$('#ssa-msgs').text(request.msg);
		if (request.msg == 'Stopped') {
			hide_loader();
		}
	}else if(request.from === 'background' && request.subject === 'limit_excedeed'){ //Re
		$('#ssa-msgs').text('Limit exceeded');
		chrome.runtime.sendMessage({'action':'bulkMessageLimitExceed'})
		
	}


});


function hideNoteMessagesAlerts() {
	setTimeout(()=>{
		$('.msg-for-notes').hide();
	}, 3000)
}


function sendBulkMessage(message) {
	bulkTaggedUserArray = [];
	bulkUserDelay = message.bulkDelay;
	bulkMessageTextArray = message.bulkMessageTextArray;
	sendRandomMessage = message.sendRandomMessage;
	useRandomDelay = message.useRandomDelay; //true|false
	selectedBulkTagIds = message.selectedBulkTagIds;
	bulkSendMessageLimit = parseInt(message.sendLimit);
	chrome.storage.local.get(["taggedUsers"], function(result) {
		result.taggedUsers.forEach(function (item,index) {
			if (!message.sendAll) {
				foundTaggedUser = selectedBulkTagIds.filter((list) => ( (item.tag_id.indexOf(list.tagid) > -1) && item.fb_user_id != null) )
			} 
			
			if( (message.sendAll || foundTaggedUser.length > 0 ) && item.fb_user_id != null ){
				item.sendBulk = false;	
				bulkTaggedUserArray.push(item);
			}			
		});

		chrome.storage.local.set({'bulkTaggedUserArray':bulkTaggedUserArray});
		$('.total-friends').text(bulkTaggedUserArray.length);
		readLastStateOfTaggedUserArray();
	})
}

function readLastStateOfTaggedUserArray() {
	bulkTaggedUserArray = [];	
	chrome.storage.local.get(["bulkTaggedUserArray","linkedFbAccount"], function(result) {		
	
		var mylocation='';
		if (typeof result.linkedFbAccount.location != "undefined" && result.linkedFbAccount.location != ""){
			mylocation= result.linkedFbAccount.location;
		}
		bulkTaggedUserArray = result.bulkTaggedUserArray;
		$('.total-friends').text(bulkTaggedUserArray.length);
		findLastProcessedIndex = result.bulkTaggedUserArray.findIndex((item) => (item.sendBulk == false));
		if (findLastProcessedIndex != -1) {		
		    $('#processed-members').text(findLastProcessedIndex);	
			startBulkFromIndex(result.bulkTaggedUserArray[findLastProcessedIndex],findLastProcessedIndex,mylocation);
		}else{
			$('#ssa-msgs').text('Completed');
			chrome.storage.local.set({'bulkTaggedUserArray':[]});
			chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'completed'});
			hide_loader();
			$('#limit').text(bulkTaggedUserArray.length);
		}
	});
}

// var bulkRandomDelayArray = [10000,15000,20000,25000,30000,35000,40000,45000];
// var sendRandomMessageDealy = 0;
// var loadedMessageListLi = $(fb_ul_selector+" li[fb_user_id]").length;
// var historyIteration = 0;
// function findUserInMessageList(receiver,currentIndex,myLocation) {
// 	if (bulkProcessing){
// 		if((currentIndex+1) <= bulkSendMessageLimit ) {
// 			var loadedThreadsHistory = loadedMessageListLi;
// 			if($(fb_ul_selector+" li[fb_user_id='"+receiver.fb_user_id+"']").length > 0){
// 				$(fb_ul_selector+" li[fb_user_id='"+receiver.fb_user_id+"']").find('a').mclick();
// 				if(parseBulkTaggedUserArray(receiver,currentIndex,myLocation) > -1){
// 					$('#processed-members').text(currentIndex+1);
// 					chrome.runtime.sendMessage({action: "bulkMessageCounter", counter: currentIndex+1, totalContacts:bulkTaggedUserArray.length});
// 					if(useRandomDelay){
// 						sendRandomMessageDealy =  bulkRandomDelayArray[Math.floor(Math.random()*bulkRandomDelayArray.length)];
// 						bulkUserDelay = 0;
// 					} else {
// 						sendRandomMessageDealy = 0;
// 					}					
					
// 					/******* Iterate Next Thread *******/
// 					if((currentIndex+1) < bulkSendMessageLimit ) {						
// 						setTimeout(()=>{	
// 							readLastStateOfTaggedUserArray();	
// 						},parseInt(bulkUserDelay) + sendRandomMessageDealy);
// 					} else {
// 						bulkProcessing = false;
// 						if ((currentIndex+1) == bulkTaggedUserArray.length) {
// 							$('#ssa-msgs').text('Completed');
// 							hide_loader();
// 						 	chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'completed'});
// 						}else{
// 							$('#ssa-msgs').text('Limit exceeded');
// 							chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'paused'});
// 						}
// 					}
// 				}
// 			} else {
// 				$('._2xhi .uiScrollableAreaWrap.scrollable').addClass('ssa-scroll').animate({ scrollTop: $('._2xhi .uiScrollableAreaWrap.scrollable').prop("scrollHeight")}, 1000);
// 				setTimeout(()=>{
// 					loadedMessageListLi = $(fb_ul_selector+" li[fb_user_id]").length;//40
// 					if (loadedThreadsHistory == loadedMessageListLi) {
// 						if(historyIteration < 2){
// 							historyIteration++;
// 							findUserInMessageList(receiver,currentIndex,myLocation);
// 						} else {
// 							historyIteration = 0;
// 							bulkTaggedUserArray[currentIndex].sendBulk = true;
// 							chrome.storage.local.set({'bulkTaggedUserArray':bulkTaggedUserArray});
// 							readLastStateOfTaggedUserArray();
// 						}
// 					}else{				
// 						findUserInMessageList(receiver,currentIndex,myLocation);
// 					}	
// 				},3000)
// 			}
// 		}else{
// 			bulkProcessing = false;
// 			$('#ssa-msgs').text('Limit exceeded');
// 			chrome.runtime.sendMessage({saveBlukMessageState: "saveBlukMessageState", status: 'paused'});
// 		}
// 	}
// }

// function parseBulkTaggedUserArray(receiver,currentIndex,myLocation) {
// 	$(fb_ul_selector+" li[fb_user_id='"+receiver.fb_user_id+"']").find('a').mclick();
// 	bulkTaggedUserArray[currentIndex].sendBulk = true;
// 	chrome.storage.local.set({'bulkTaggedUserArray':bulkTaggedUserArray});
// 	var bulkMessageText = '';
	
// 	if(sendRandomMessage){
// 		bulkMessageText = bulkMessageTextArray[Math.floor(Math.random()*bulkMessageTextArray.length)];
// 	}else{
// 		bulkMessageText = bulkMessageTextArray[0];
// 	}
	
// 	full_Name = $('#js_5 span').text();

// 	var isMarket = false;

// 	if(full_Name.indexOf(' · ') > -1){
// 		isMarket = true;
// 	}

// 	if (bulkMessageText.indexOf('[mylocation]') > -1) {
// 		if(myLocation.includes("|")){
// 			var myLocations = myLocation.split("|");		
// 			myLocation = myLocations[Math.floor(Math.random() * myLocations.length)];	
// 		}
// 		bulkMessageText = bulkMessageText.replace(/\[mylocation]/g,myLocation);
// 	}

// 	if (bulkMessageText.indexOf('[full_name]') > -1) {
// 		bulkMessageText = bulkMessageText.replace(/\[full_name]/g,full_Name);
// 	}

// 	if (bulkMessageText.indexOf('[first_name]') > -1) {
// 		first_name = full_Name.split(' ')[0];
// 		bulkMessageText = bulkMessageText.replace(/\[first_name]/g,first_name);
// 	}

// 	if (bulkMessageText.indexOf('[last_name]') > -1) {
// 		nameArray = full_Name.split(' ');
// 		if(nameArray.length > 1){
// 			last_name = nameArray[nameArray.length-1];
// 			bulkMessageText = bulkMessageText.replace(/\[last_name]/g,last_name);
// 		}else{
// 			bulkMessageText = bulkMessageText.replace(/\[last_name]/g,'');
// 		}
// 	}

// 	if (custom_data.sendBulkMessageEnable && !isMarket) {		
// 		var delay=0;
// 		if(bulkMessageText.includes("|")){
// 			var res = bulkMessageText.split("|");		
// 			res.forEach(function(text){			
// 				let messId=setTimeout(()=>{
// 					triggerBulkSendMessage(text);					
// 				},delay);
// 				bulkMessageTimeout.push(messId);
// 				delay=delay+3000;
// 			});		
// 		} 
// 		else{
// 			let messId=setTimeout(()=>{
// 				triggerBulkSendMessage(bulkMessageText);					
// 			},delay);
// 			bulkMessageTimeout.push(messId);
// 		}
// 		var clearId=setTimeout(function(){			
// 			clearTimeOutIntervals();			
// 		},delay);
// 		bulkMessageTimeout.push(clearId);	
// 	}
// 	return currentIndex;
// }

// function triggerBulkSendMessage(bulkMsgText) {
// 	selector = 'div[aria-label="New message"] div[contenteditable="true"] span br';
// 	if($(selector).length > 0){
// 		var evt = new Event('input', {
// 					bubbles: true  
// 				});
// 		var input = document.querySelector(selector);
// 		input.innerHTML = bulkMsgText;
// 		input.dispatchEvent(evt);
// 		$(selector).after('<span data-text="true">'+bulkMsgText+'</span>');
// 		// var loc = window.location.href;
// 		// loc = loc.split("/t/");
// 		// $(fb_ul_selector+" li[fb_user_id='"+loc[1]+"']").next('li').find('a').mclick();
// 		// setTimeout(function(){
// 		// 	var loc1 = window.location.href;
// 		// 	loc1 = loc1.split("/t/");
// 		// 	$(fb_ul_selector+" li[fb_user_id='"+loc1[1]+"']").prev('li').find('a').mclick();
// 		// 	setTimeout(function(){
// 		// 		$('div[aria-label="New message"]').find('a[role="button"]').mclick();
// 		// 		/*******************/
// 		// 		var loc = window.location.href;
// 		// 		loc = loc.split("/t/");
// 		// 		$(fb_ul_selector+" li[fb_user_id='"+loc[1]+"']").next('li').find('a').mclick();
// 		// 		setTimeout(function(){
// 		// 			var loc1 = window.location.href;
// 		// 			loc1 = loc1.split("/t/");
// 		// 			$(fb_ul_selector+" li[fb_user_id='"+loc1[1]+"']").prev('li').find('a').mclick();
// 		// 		},200);
// 		// 		/*******************/
// 		// 	},200);
// 		// },200);
// 		let loc = window.location.href;
// 		loc = loc.split('/t/');
// 		if (loc[1].indexOf('?') > 0) {
// 			// eslint-disable-next-line prefer-destructuring
// 			loc[1] = loc[1].split('?')[0];
// 		}
// 		// chrome.runtime.sendMessage({triggerChatMessage: "triggerChatMessage"});
// 		// location.replace(loc[0]+'/t/'+loc[1]);	
// 		const $next = $(`${fb_ul_selector} li[fb_user_id='${loc[1]}']`).next('li').find('a');
// 		const $prev = $(`${fb_ul_selector} li[fb_user_id='${loc[1]}']`).prev('li').find('a');
// 		// console.log(':::::$next::::::', $next);
// 		// console.log(':::::$prev::::::', $prev);
// 		let flag = true;

// 		if ($next.length > 0) {
// 			$next.mclick();
// 			flag = true;
// 		} else if ($prev.length > 0) {
// 			$prev.mclick();
// 			flag = false;
// 		}
// 		setTimeout(() => {
// 			let loc1 = window.location.href;
// 			loc1 = loc1.split('/t/');
// 			if (loc1[1].indexOf('?') > 0) {
// 			// eslint-disable-next-line prefer-destructuring
// 				loc1[1] = loc1[1].split('?')[0];
// 			}
// 			const $nextUser = $(`${fb_ul_selector} li[fb_user_id='${loc1[1]}']`).next('li').find('a');
// 			const $prevUser = $(`${fb_ul_selector} li[fb_user_id='${loc1[1]}']`).prev('li').find('a');
// 			if (flag) {
// 				$prevUser.mclick();
// 			} else {
// 				$nextUser.mclick();
// 			}					
// 			findBTN = setInterval(function () {
// 				if ($('a[aria-label="Send"]').length > 0 ) {
// 					clearInterval(findBTN);
// 					$('a[aria-label="Send"]').mclick();
// 					// chrome.runtime.sendMessage({url:"index.html",action: "triggerShowPopup"});
// 				}
// 			},200)						
// 		}, 100);
// 	} else {
// 		selector = 'div[contenteditable="true"] div[data-contents="true"] span br';
// 		if($(selector).length > 0){
					
// 			var evt = new Event('input', {
// 						bubbles: true  
// 					});
// 			var input = document.querySelector(selector);
// 			input.innerHTML = message.templateMessage;
// 			input.dispatchEvent(evt);
	
// 			$(selector).after('<span data-text="true">'+message.templateMessage+'</span>');
			
// 			chrome.runtime.sendMessage({triggerChatMessage: "triggerChatMessage"});
// 		}
// 	}
// }

$(function(){

	if ($('#bluebarRoot').length == 0) {
		isFBNewLayout = true;
		$("body").addClass('cts-new-layout');

		if ($("div[data-testid='Keycommand_wrapper']")) {
			isIframeLoaded = true; 
		}
	}

	$(document).on('keyup','#tag-name-from-content', function() {
		var newTagName =  $.trim($('#tag-name-from-content').val());

		if (newTagName != '') {
			var alreadyExistTag = false;
			$('.model-tag-list li').each(function(index){
				if( !alreadyExistTag && $.trim($(this).text().toLowerCase()) == newTagName.toLowerCase() ){
					alreadyExistTag = true;
				}
			});

			if (alreadyExistTag) {
				$('.error-mgs').text('Tag name already exists').show();
			}else{
				$('.error-mgs').hide();
			}
		} else {
			return false;
		}
	});

	$(document).on('click','.add-tag-from-content', function() {
		$(this).closest('.row-levels').hide().next().show();
	});

	$(document).on('click','.search-form-content', function() {
		$(this).closest('.row-levels').hide().prev().show();
		$('.error-mgs').hide();
	});

	$(document).on('click','.save-tag-from-content', function() {
		var newTagName =  $.trim($('#tag-name-from-content').val());

		if (newTagName != '') {
			var alreadyExistTag = false;
			$('.model-tag-list li').each(function(index){
				if( !alreadyExistTag && $.trim($(this).text().toLowerCase()) == newTagName.toLowerCase() ){
					alreadyExistTag = true;
				}
			});

			if (alreadyExistTag) {
				$('.error-mgs').text('Tag name already exists').show();
			}else{
				$(this).prop('disabled', true).text('Saving');
				addUserTagFromContent(newTagName);
			}

		} else {
			return false;
		}

	});

	//////// user notes////
	$(document).on('click','.get-gl-notes', function() {
		var cliked_Fb_Id =''
		if($(this).closest('div[data-testid="mwthreadlist-item"]').length >0){
			if(!$(this).closest('div[data-testid="mwthreadlist-item"]').hasClass('l9j0dhe7')){
				return false;
			}
			cliked_Fb_Id=$(this).closest('div[data-testid="mwthreadlist-item"]').attr('fb_user_id');
			fbNameForNotes=$(this).closest('div[data-testid="mwthreadlist-item"]').find('a[role="link"]:eq(0)').find('span').first().text();
		}else{
			cliked_Fb_Id = $(this).closest('li[fb_user_id]').attr('fb_user_id');
			fbNameForNotes = $(this).closest('li[fb_user_id]').find('._1ht6._7st9').text();
		}
		
		$('#ssa_model_two').addClass('notes-modal');
		$('#overlay-two #ssa_model_content_two').text('loading notes for '+fbNameForNotes).show();
		chrome.runtime.sendMessage({getUserNotes: "getUserNotes", fb_user_id: cliked_Fb_Id});
		return false;
	});
	//////// user notes////
	$(document).on('click','.get-gl-right-notes', function() {		
		var cliked_Fb_Id =$(this).parent().attr('fb_user_id');
		fbNameForNotes = $(this).parent().parent().find('a[target="_blank"]').first().text();
		
		$('#ssa_model_two').addClass('notes-modal');
		$('#overlay-two #ssa_model_content_two').text('loading notes for '+fbNameForNotes).show();
		chrome.runtime.sendMessage({getUserNotes: "getUserNotes", fb_user_id: cliked_Fb_Id});
		return false;
	});
	$(document).on('click','.add-notes-from-content', function() {
		var options = [{id: 0, name: 'Private'}];
		var fb_user_id = window.location.pathname.split('/t/')[1];
		var team_ids = [];
		chrome.storage.local.get(["teams", "teamMembers"], function(result) {
			if (typeof result.teamMembers != "undefined" && result.teamMembers != "") {
				for(var i = 0; i < result.teamMembers.length; i++) {
					if(result.teamMembers[i].fb_user_id == fb_user_id) {
						team_ids = result.teamMembers[i].team_id;
						break;
					}
				}
			}
			if(typeof team_ids == 'string') {
				team_ids = team_ids.split(",");
			}
			if (typeof result.teams != "undefined" && result.teams != "") {
				result.teams.forEach(function(item) {
					/*if(team_ids.includes(item.id.toString())) {
						options.push({id: item.id, name: item.name});
					}*/
					options.push({id: item.id, name: item.name});
				});
			}

			var optionSelect= '<label class="note-scope-list" for="noteScope">Scope: </label>' +
				'<select class="note-scope-list" name="noteScope" id="noteScope">';
			options.forEach(function(item) {
				optionSelect += '<option value='+item.id+'>' + item.name + '</option>';
			});
			optionSelect += '</select>';

			notesHtml = `<div class="ssa-cols ssa-col-md-12 notes add-new-note" note-id="0">
						<select class="emoji">
							<option value=''>Emoji</option>
							<option>&#128578;</option>
							<option>&#128512;</option>
							<option>&#128521;</option>
							<option>&#128514;</option>
							<option>&#128549;</option>
							<option>&#128531;</option> 
							<option>&#128525;</option>
							<option>&#128518;</option>
						</select>									
						<select class="personalization">
							<option>Personalization </option>
							<option>[first_name]</option>
							<option>[last_name]</option>							
						</select>
						<textarea id="reply_text" rows="2" placeholder="Please Enter Note" class="notes-description ssa-teaxtarea"></textarea>` +
				optionSelect +
				`<div class="right-col-item ssa-cols ssa-col-md-8" > <button class="note-edit bg-purple ssa-btn title="Save"">Save</button><button class="note-delete bg-gray ssa-btn" title="Delete">Delete</button></div><div class="ssa-cols ssa-col-md-4 note-timing text-right" ></div></div>`;
			if ($('.add-new-note').length == 0) {
				$('.content-user-notes-container .row-container').prepend(notesHtml);
			}
			return false;
		});
	});


	$(document).on('keyup','.content-user-notes-container .notes-description', function() {
		$('.msg-for-notes').hide();
	})
	$(document).on('click','.content-user-notes-container .note-edit', function() {
		var description = $(this).closest('.notes').find('textarea').val();
		var noteId = $(this).closest('.notes').attr('note-id');
		var teamId = $('#noteScope').val();
		var temp = {};
		if (description == '') {
			$('.msg-for-notes').removeClass('success').addClass('error').text('Message can not be blank.').show();
			hideNoteMessagesAlerts();
			return false;
		}else{
			temp.noteId = noteId;
			temp.teamId = teamId;
			temp.description = description;
			var fb_user_id_to_add_note = window.location.pathname.split('/t/'); //$('#ssa_model_three').attr('fb_user_id_to_add_note')
			temp.fb_user_id_to_add_note = fb_user_id_to_add_note[fb_user_id_to_add_note.length-1];
			chrome.runtime.sendMessage({saveNoteFromContent: "saveNoteFromContent", data: temp});
			return false;
		}
	});

	$(document).on('click','.note-delete', function() {
		var noteId = $(this).closest('.notes').attr('note-id');
		$(this).closest('.notes').remove();
		if (noteId == 0) {
			return false;
		}else{
			chrome.runtime.sendMessage({deleteNoteFromContent: "deleteNoteFromContent", noteId: noteId});
		}
		return false;
	});

	$(document).on('click','.close', function() {
		$('#overlay-three').hide();
		return false;
	});


	$(document).on('click','.close-model', function() {
		$('#overlay-two').hide();
		$('#ssa_model_two').removeClass('notes-modal')

	});

	$(document).on('click','.ssa-tags-container span', function() {
		var pathname = window.location.href.toString();	
	 	if(pathname.indexOf("/messages") > -1 ||  pathname.indexOf("messenger") > -1 ){
			
			var clikedFBUserId = ''
			var clickedNumericFbId=''
			var profilePic = '';
			var fbName = '';

			var newThreadMessenger = 0;
			var newMThreadId  = 0;
			
			if ($(fb_ul_li_selector).length > 0) {

				clikedFBUserId = $(this).closest('li').attr('fb_user_id');
				clickedNumericFbId=$(this).closest('li').attr('numeric_fb_id');
				profilePic = '';
				page = 0;
				if($('._3xb9').find('a').find('i').length>0){
					page = 1;
				}

				if($(this).closest('li').find('img').length > 0){
					profilePic = $(this).closest('li').find('img').attr('src');
				} else {
					profilePic = $(this).closest('li').find('div[data-tooltip-content] div').css('background-image').replace('url(','').replace(')','').replace(/\"/gi, "");
				}
				fbName = $(this).parent().prev().text();

			}else{
				newThreadMessenger = 1;
				clikedFBUserId = $(this).closest('.cts-message-list-item').attr('fb_user_id');
				clickedNumericFbId = $(this).closest('.cts-message-list-item').attr('numeric_fb_id');
				newMThreadId  = $(this).closest('.cts-message-list-item').attr('thread_fb_id');
				page = 0;

				if($(this).closest('.cts-message-list-item').find('svg.pzggbiyp image').length > 0){
					profilePic = $(this).closest('.cts-message-list-item').find('svg.pzggbiyp image').attr('xlink:href');
				} 
				fbName = $(this).closest('.cts-message-list-item').find('span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5:eq(0)').text();

			}
			chrome.storage.local.get(["tags", "taggedUsers", "teams", "teamMembers","search_tag"], function(result) {

				var options = '<div class="row custom-row modal-heading"><div class="leve-1 tagged-name">'+fbName+'</div><div class="leve-1 close-model">X</div></div> '+searchHtml+'<div class="row custom-row"> <div class="tags-container ssa-tags-container cts-messenger"><ul class="model-tag-list custom-scroll">';
				if (typeof result.tags != "undefined" && result.tags != "") {
					result.tags = result.tags.reverse();
					for(i=0;i<result.tags.length;i++){
						var style ='';
						if (result.tags[i].color !== null ) {
							style = 'style = "background:'+result.tags[i].color+' !important"';
							options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color'  tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.  tags[i].text+"</li>";
						}else{
							options += "<li class='bg-"+result.tags[i].class+" tag-text-color' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result. tags[i].text+"</li>";
						}
					}					
				}
				// options += '</ul><button style="display:none;" profilePic = "'+profilePic+'" fbName = "'+fbName+'" clikedFBUserId ="'+clikedFBUserId+'" page="'+page+'" clickedNumericFbId = "'+clickedNumericFbId+'" type="button" class="update-multi-tag">Update Tag</button></div></div>';
				options += '</ul><button style="display:none;" profilePic = "'+profilePic+'" fbName = "'+fbName+'" clikedFBUserId ="'+clikedFBUserId+'" page="'+page+'" clickedNumericFbId = "'+clickedNumericFbId+'"  newThreadMessenger = "'+newThreadMessenger+'" newMThreadId = "'+newMThreadId+'" type="button" class="update-multi-tag">Update Tag</button></div>';
		
				options += '<div class="row custom-row modal-heading"><div class="leve-1 tagged-name">Teams</div></div><div class="row custom-row"><div class="ssa-tags-container"><ul class="model-teams-list custom-scroll">';
				if (typeof result.teams != "undefined" && result.teams != "") {
					for(i=0;i<result.teams.length;i++) {
						options += "<li class='bg-teams' team-id='"+result.teams[i].id+"'>";
						options += "<input class='multi-team-checkbox' type='checkbox'>"+result.teams[i].name+"</li>";
					}
					if(result.teams.length == 0){
						options += "<div>No teams created!</div></div>";
					}
				}
				options += '</ul><button style="display:none;" profilePic = "'+profilePic+'" fbName = "'+fbName+'" clikedFBUserId ="'+clikedFBUserId+'" page="'+page+'" clickedNumericFbId = "'+clickedNumericFbId+'"  newThreadMessenger = "'+newThreadMessenger+'" newMThreadId = "'+newMThreadId+'" type="button" class="update-multi-team">Update Team</button></div>';
				
				$('#ssa_model_content_two').html(options);				
				$('#overlay-two').show();
				if (typeof result.search_tag != "undefined" && result.search_tag != "") {
					$("#search-tag-by-name").val(result.search_tag);
					$('#search-tag-by-name').keyup();
				}				
				if (newThreadMessenger == 1 && clickedNumericFbId != '0') {
					clikedFBUserId = clickedNumericFbId;
					

				}
				var temp = result.taggedUsers.filter(function (item) { return (item.fb_user_id == clikedFBUserId  || item.numeric_fb_id == clikedFBUserId)});
				
				if( temp.length > 0 ){
					var $tagIds = [];
					if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
						$tagIds = temp[0].tag_id.split(',');
					} else {
						$tagIds = temp[0].tag_id;
					}
					$tagIds.forEach(function(tagid){
						eachTagIdOne = tagid.replace(/\#/g,'');
						$('.model-tag-list li[tag-id="'+eachTagIdOne+'"] .multi-tag-checkbox').prop('checked',true);
					});	
				}

				temp = result.teamMembers.filter(function (item) { return (item.fb_user_id == clikedFBUserId  || item.numeric_fb_id == clikedFBUserId)});
				
				if( temp.length > 0 ){
					var $teamIds = [];
					if(temp[0].team_id != null && typeof temp[0].team_id == 'string') {
						$teamIds = temp[0].team_id.split(',');
					} else {
						$teamIds = temp[0].team_id;
					}
					$teamIds.forEach(function(teamid){
						$('.model-teams-list li[team-id="'+teamid+'"] .multi-team-checkbox').prop('checked',true);
					});	
				}

			});
		} else if(pathname.indexOf("/inbox") > -1){

			var fbImageId = $(this).closest('div.page-chat-thread-gr').attr('fb_image_id');
			var userDiv = $(this).closest('div.page-chat-thread-gr');
			var profilePic = $(userDiv).find('img').attr('src');
			var fbName = $(userDiv).find('._4k8x span:first').text();
			var fbPageId = pathname.split('/inbox')[0].replace("/", "");
			chrome.storage.local.get(["tags", "taggedUsers"], function(result) {
				var options = '<div class="row custom-row"><div class="leve-1 tagged-name">'+fbName+'</div><div class="leve-1 close-model">X</div></div>'+searchHtml+'<div class="row custom-row"><div class="tags-container ssa-tags-container cts-messenger"><ul class="model-tag-list custom-scroll">';
				if (typeof result.tags != "undefined" && result.tags != "") { 
					result.tags = result.tags.reverse();
					for(i=0;i<result.tags.length;i++){
						var style ='';
						if (result.tags[i].color !== null ) {
							style = 'style = "background:'+result.tags[i].color+' !important"';
							options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color'  tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.  tags[i].text+"</li>";
						}else{
							options += "<li class='bg-"+result.tags[i].class+" tag-text-color' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result. tags[i].text+"</li>";
						}
					}					
				}
				options += '</ul><button style="display:none;" fbPageId="'+fbPageId+'" clickedFbImageId = "'+fbImageId+'" profilePic = "'+profilePic+'" fbName = "'+fbName+'"  type="button" class="update-multi-tag">Update Tag</button></div>';
				$('#ssa_model_content_two').html(options);
				$('#overlay-two').show();

				var temp = result.taggedUsers.filter(function (item) { return item.fb_image_id == fbImageId});
				
				if( temp.length > 0 ){
					var $tagIds = [];
					if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
						$tagIds = temp[0].tag_id.split(',');
					} else {
						$tagIds = temp[0].tag_id;
					}
					$tagIds.forEach(function(tagid){
						eachTagIdOne = tagid.replace(/\#/g,'');
						$('.model-tag-list li[tag-id="'+eachTagIdOne+'"] .multi-tag-checkbox').prop('checked',true);
					});	
				}

			});


		}

	});
	$(document).on('click','.assign-tag-btn-messenger', function() { // all tag group member page
		if ($('.select-multi-user-messenger:checkbox:checked').length <= 10 ) {
			$checkedUsersForMessenger = [];

			$('.select-multi-user-messenger').each(function(index){
				if ($(this).is(':checked')) {

					var oneMesseangerUser = $(this).closest('.cts-message-list-item');
					tempUser = {};
					var profilePic = '';

			
					tempUser.fb_user_id = oneMesseangerUser.attr('fb_user_id');
					tempUser.numeric_fb_id = oneMesseangerUser.attr('numeric_fb_id');
					

					if(oneMesseangerUser.find('img.a8c37x1j.d2edcug0.sn7ne77z.bixrwtb6').length > 0){
						profilePic = oneMesseangerUser.find('img.a8c37x1j.d2edcug0.sn7ne77z.bixrwtb6').attr('src');
					}
					fbName = $.trim(oneMesseangerUser.find('.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5:eq(0)').text());
	
					fbName = fbName.replace("'", " ");
					
					tempUser.profilePic = profilePic
					tempUser.fbName = fbName;
					$checkedUsersForMessenger.push(tempUser);
				}
			});

			//console.log($checkedUsersForMessenger); 
			if ($checkedUsersForMessenger.length > 0) {
				showMultiTagListForMassTagging();
			}else{
				toastr["warning"]('Please select atleast one user');
			}


		}else{
			toastr["warning"]('You can add maximum of 10 contacts at once.');
		}
	});
	$(document).on('click','.unfriend-user-messenger',function(){
		
		var fbName = $(this).closest('.cts-message-list-item').find('span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5:eq(0)').text();
		var cliked_Fb_Id=$(this).closest('div[data-testid="mwthreadlist-item"]').attr('fb_user_id');
		if(cliked_Fb_Id != undefined){
			let confirmAction = confirm(`Are you sure you want to block ${fbName}?\n\nCaution: If you're friends, blocking ${fbName} will also unfriend him(her).\nPress CANCEL if you just want to unfriend`);
			if (confirmAction) {
				let url = new URL("https://m.facebook.com/privacy/touch/block/confirm/?bid="+cliked_Fb_Id +"&ret_cancel&source=profile");
                url.searchParams.set("lets_block_user",1);
                url.searchParams.set('block',1);
				url.searchParams.set('close',1);
                url = url.href;
                window.open(url,'currentUserBlaster',
                `toolbar=no,
                location=no,
                status=no,
                menubar=no,
                scrollbars=yes,
                resizable=yes,
                width=500px,
                height=500px`);
			} else {
				let url = new URL("https://m.facebook.com/"+cliked_Fb_Id);
                url.searchParams.set("lets_unfriend_user",1);
                url.searchParams.set('unFriend',1);
				url.searchParams.set('close',1);
                url = url.href;
                window.open(url,'currentUserBlaster',
                `toolbar=no,
                location=no,
                status=no,
                menubar=no,
                scrollbars=yes,
                resizable=yes,
                width=500px,
                height=500px`);
			}
			chrome.runtime.sendMessage({removeTagsFromUser: "removeTagsFromUser",fbUserId: cliked_Fb_Id});
		}
	});
	$(document).on('click','.multi-tag-checkbox-multi-user', function() {
	 
		if(window.location.origin.indexOf("messenger") > -1 ){
			var multiTagChecked = $(this).find('.multi-tag-checkbox-multi-user').is(':checked');
		   if(multiTagChecked){
			   
			   $(this).find('.multi-tag-checkbox-multi-user').prop('checked',false);
		   }else{
			   
			   $(this).find('.multi-tag-checkbox-multi-user').prop('checked',true);	
		   }


			$checkedTagsTemp = [];
		   $('.model-tag-list li').each(function(index){
			   if ($(this).find('.multi-tag-checkbox-multi-user').is(':checked')) {
				   $checkedTagsTemp.push($(this).attr('tag-id'));
			   }
		   });

		   
		   if ($checkedTagsTemp.length == 0) {
			   $('.save-multi-tag-user').prop('disabled',true);
		   }else{
			   $('.save-multi-tag-user').prop('disabled',false);
		   }
	   }
   });

   $(document).on('click','.tag-n-c-multi-user', function() {

		if(window.location.origin.indexOf("messenger") > -1 ){

			var multiTagChecked = $(this).parent().find('.multi-tag-checkbox-multi-user').is(':checked');
		   if(multiTagChecked){
			   $(this).parent().find('.multi-tag-checkbox-multi-user').prop('checked',false);
		   }else{
			   $(this).parent().find('.multi-tag-checkbox-multi-user').prop('checked',true);

		   }

			$checkedTagsTemp = [];
		   $('.model-tag-list li').each(function(index){
			   if ($(this).find('.multi-tag-checkbox-multi-user').is(':checked')) {
				   $checkedTagsTemp.push($(this).attr('tag-id'));
			   }
		   });
		   
		   if ($checkedTagsTemp.length == 0) {
			   $('.save-multi-tag-user').prop('disabled',true);
		   }else{
			   $('.save-multi-tag-user').prop('disabled',false);
		   }
	   }
   });


   $(document).on('click','.save-multi-tag-user', function() {
	   if(window.origin.indexOf("messenger") > -1 ){
		   $(this).text('Saving...').attr('disabled',true);
		   $checkedTags = [];
		   $('.model-tag-list li').each(function(index){
			   if ($(this).find('.multi-tag-checkbox-multi-user').is(':checked')) {
				   $checkedTags.push($(this).attr('tag-id'));
			   }
		   });

		   if ($checkedTags.length > 0) {
				updateFBUsertagForMultiUserOnMessenger($checkedTags);
				setTimeout(()=>{
					$(".save-multi-tag-user").text('Save').attr('disabled',false);
				},2000)
		   }
	   }
   });

   $(document).on('click','.select-all-friends-members', function() { // all tag messenger page
	   selectAllCheck = true;
	   if ($(this).is(':checked')){
		   selectAllCheck = true;
	   }else{
		   selectAllCheck = false;
	   }
	   if ($('.select-multi-user-messenger:checkbox:checked').length <= 9) {
		   $('div[data-testid="mwthreadlist-item"]').each(function(index){
			   if ($(this).hasClass('l9j0dhe7'))
			   {
					if ($('.select-multi-user-messenger:checkbox:checked').length <= 9 ) {
						$(this).find('.select-multi-user-messenger').prop('checked',selectAllCheck);
					}
			   }
			  
		   });
	   }
	   else{
		   $('div[data-testid="mwthreadlist-item"]').each(function(index){
				if ($(this).hasClass('l9j0dhe7'))
				{
					$(this).find('.select-multi-user-messenger').prop('checked',selectAllCheck);
				}
		   });
	   }
   });
   
    $(document).on('click','.ssa-tags-right',function(){	
		var fb_user_id = $(this).attr('fb_user_id');
		
		if($(fb_ul_selector+" li[fb_user_id='"+fb_user_id+"']").length > 0){
			$(fb_ul_selector+" li[fb_user_id='"+fb_user_id+"']").find('.ssa-tags-container span').mclick();
		}else{
			$(".cts-message-list-item[fb_user_id='"+fb_user_id+"']").find('.ssa-tags-container span').mclick();
			
		}		
	});
	$(document).on('keyup','#search-tag-by-name', function() {
		 var typpedTagName = $(this).val();
		
		 if (typpedTagName != '') {
		 	$('.model-tag-list li').hide();
		 	$('.model-tag-list li').each(function (oneTag) {
		 		
		 		nnnnn =$(this).text();
		 		
     	 		if ($(this).text().toLowerCase().indexOf(typpedTagName.toLowerCase()) > -1) {
		 			$(this).show()
		 		}
		 	})
		 }else{
		 	$('.model-tag-list li').show();
		 }
	});


	$(document).on('click','.multi-tag-checkbox', function() {
	 	var pathname = window.location.href.toString();	

	 	if(pathname.indexOf("/messages") > -1 || pathname.indexOf("messenger") > -1){	
		 	$checkedTags = [];
			$('.model-tag-list li').each(function(index){
				if ($(this).find('.multi-tag-checkbox').is(':checked')) {
					$checkedTags.push($(this).attr('tag-id'));
				}
			});
			clikedFBUserId = $('.update-multi-tag').attr('clikedFBUserId');
			clikedNumericFbId = $('.update-multi-tag').attr('clickednumericfbid');
			newThreadMessenger = $('.update-multi-tag').attr('newThreadMessenger');
			newMThreadId = $('.update-multi-tag').attr('newMThreadId');
			page = $('.update-multi-tag').attr('page');
			profilePic = $('.update-multi-tag').attr('profilePic');
			fbName = $('.update-multi-tag').attr('fbName');
			fromPage='messanger';
			updateFBUsertag(JSON.stringify($checkedTags),clikedFBUserId,clikedNumericFbId,profilePic, fbName,fromPage,page, newThreadMessenger, newMThreadId);
		}

		if(pathname.indexOf("/inbox") > -1){	
		
		 	$checkedTags = [];
			$('.model-tag-list li').each(function(index){
				if ($(this).find('.multi-tag-checkbox').is(':checked')) {
					$checkedTags.push($(this).attr('tag-id'));
				}
			});
			clickedFbImageId = $('.update-multi-tag').attr('clickedFbImageId');
			profilePic = $('.update-multi-tag').attr('profilePic');
			fbName = $('.update-multi-tag').attr('fbName');
			fbPageId =  $('.update-multi-tag').attr('fbPageId'); 
			
			//alert(2);
			
			updateFBPageUsertag(JSON.stringify($checkedTags),clickedFbImageId,profilePic, fbName, fbPageId);
		}
	});

	$(document).on('click','.multi-team-checkbox', function() {
	 	var pathname = window.location.href.toString();	
	 	if(pathname.indexOf("/messages") > -1 || pathname.indexOf("messenger") > -1){	
		 	$checkedTeams = [];
			$('.model-teams-list li').each(function(index){
				if ($(this).find('.multi-team-checkbox').is(':checked')) {
					$checkedTeams.push($(this).attr('team-id'));
				}
			});
			clikedFBUserId = $('.update-multi-team').attr('clikedFBUserId');
			clikedNumericFbId = $('.update-multi-team').attr('clickednumericfbid');
			page=$('.update-multi-team').attr('page');
			profilePic = $('.update-multi-team').attr('profilePic');
			fbName = $('.update-multi-team').attr('fbName');
			fromPage='messanger';
			updateFBUserTeam(JSON.stringify($checkedTeams),clikedFBUserId,clikedNumericFbId,profilePic, fbName,fromPage,page);
		}
	});
})
addCheckBoxMessenger();

function addCheckBoxMessenger() {
	if (window.location.origin.indexOf('messenger') > -1) {
		var mCHeckBoxHtml = '<div class="add-tag-from-messenger"><input class="select-multi-user-messenger" type="checkbox" ></div></div>';
		var mBtnUnfriend = `<div class="btn unfriend-from-messenger"><img src="${chrome.extension.getURL("assets/images/delete_icon.png")}" class="unfriend-user-messenger"/><span></span></div>`;
		
		setInterval(()=>{

			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
					if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0 && result.isCurrentFBLinked) { 

						$('div[data-testid="mwthreadlist-item"]').each(function(index) {
							if($(this).hasClass('l9j0dhe7')){
								if ($(this).find('.add-tag-from-messenger').length == 0 && window.location.origin.indexOf('messenger') >-1) {
									$(this).prepend(mCHeckBoxHtml); 
								}
								if ($(this).find('.unfriend-from-messenger').length == 0 && window.location.origin.indexOf('messenger') >-1) {
									$(this).append(mBtnUnfriend); 
								}
							}
						});


						if( window.location.origin.indexOf('messenger') >-1 && $('div[data-testid="mwthreadlist-item"]').length > 0 ){
							var showTagBtnGroupMessenger = '<span class="assign-tag-btn-select-all-messenger validlogin"><input class="select-all-friends-members" type="checkbox"><span class="checkmark"></span><span class="total-selected-messenger-member"></span></span><span class="assign-tag-btn-messenger validlogin">Tag All</span>';
					
							if(!$('.assign-tag-btn-select-all-messenger').length)
							$("body").append(showTagBtnGroupMessenger);
							$('.assign-tag-btn-messenger').addClass('assign-tag-btn-new-layout-group');

						}else{
							$('.assign-tag-btn-select-all-messenger, .total-selected-messenger-member').remove();
						}


				}else{
					$('.add-tag-from-messenger').remove();
					$('.assign-tag-btn-select-all-messenger, .total-selected-messenger-member').remove();
					$('.unfriend-from-messenger').remove();
				}
			})
		}, 2000);
	}
}
function integrateSSAFeatureWM(){
	
	setInterval(function(){
		
		if($('div[data-testid="mwthreadlist-item"]:not(".cts-message-list-item-processed")').length > 0 &&  !processing && window.location.origin.indexOf('messenger') > -1 ){				
			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
			
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
					processing = true;
					var spanTagPerChat = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
				
					spanTagPerChat += '<div class="get-gl-notes">Notes</div></div>';
					
				
					/********** Create Tags Drop Down for each chat thread ********/
					$('div[data-testid="mwthreadlist-item"]').each(function(index) {
						if ($(this).hasClass('l9j0dhe7'))
						{
							$(this).addClass('cts-message-list-item')
							$(this).addClass('cts-message-list-item-processed')
							
							var fbUser =  ''; 
							currentWindowUrl = window.location.origin;
							if (currentWindowUrl.indexOf('messenger') > -1) {
								fbUser = $(this).find('a:eq(0)').attr('href').split('/t/')[1];

								if (fbUser.indexOf('?') > -1) {
									fbUser = fbUser.split('?')[0];
								}
							}

							fbUser = fbUser.replace('/', '')

												
							
							if($(this).find('div.tags-container').length > 0 ){
								$(this).find('div.tags-container').remove();
												
								$(this).attr('fb_user_id',fbUser);
								$(this).attr('numeric_fb_id',fbUser);
								$(this).attr('thread_fb_id',fbUser); 
								$(this).append(spanTagPerChat);
							} else {
								$(this).attr('numeric_fb_id',fbUser);
								$(this).attr('fb_user_id',fbUser);
								$(this).attr('thread_fb_id',fbUser); 
								$(this).append(spanTagPerChat);
							}
							$(this).addClass('cts-message-thread-id-1');
						}
					});
															
					if(result.isCurrentFBLinked){
						$(".tags-container").show();
					} else {
						$(".tags-container").hide();
					}

					/********** Tag Users ********/
					if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
						tagUsersWM(result.taggedUsers,result.tags);
					}
				}
			});
		}
	},500);
}


function tagUsersWM(taggedUsers,tags){
	if (window.location.origin.indexOf('messenger') > -1) {
		$('div[data-testid="mwthreadlist-item"]').each(function() {
			if ($(this).hasClass('l9j0dhe7'))
			{
				var li_fb_user_id = $(this).attr('fb_user_id');
				if ($(this).hasClass('cts-message-thread-id-1')) {
					li_fb_user_id = $(this).attr('numeric_fb_id');
				}
				
				var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id)});
				
				if( temp.length > 0 ){
					$liClass = '';
					$colorCode = '';
					var $tagIds = [];
					if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
						$tagIds = temp[0].tag_id.split(',');
					} else {
						if(temp[0].tag_id.length > 0) {
							$tagIds = temp[0].tag_id;
						}
					}			
					var title = '';
					var spanText = '';
					var numeric= temp[0].numeric_fb_id;
					$tagIds.forEach(function(eachTagId){

						eachTagIdOne = eachTagId.replace(/\#/g,'');
						var foundTag = tags.filter(function (item) { return item.value == eachTagIdOne && item.priority=="1"});
						if (foundTag.length > 0) {
							title += foundTag[0].text+', ';
							$liClass = foundTag[0].class;
							$colorCode = foundTag[0].color;
							spanText = foundTag[0].text;
						}
					})

					if (title != '') {
						$(this).find('.tags-container span').text(spanText);
						$(this).find('.tags-container span').prop('title',title.slice(0, -1));
						$(this).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
						if(numeric == null){
							$(this).attr('numeric_fb_id','0');
						}else{
							$(this).attr('numeric_fb_id',numeric);
						}

						if ($colorCode == null) {
							$(this).find('.tags-container span').addClass('bg-'+$liClass);
						}else{
							$(this).find('.tags-container span').removeClass('bg-muted');
							$(this).find('.tags-container span').css('background',$colorCode);
							$(this).find('.tags-container span').addClass('tag-text-color');
						}
						
					}else{
						
						var options = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
						options += '<div class="get-gl-notes">Add Notes</div>';
						if($(this).find('div.tags-container').length > 0 ){
							$(this).find('div.tags-container').remove();
							$(this).append(options);
							// $(this).find('a[role="link"]:eq(0)').find('.scb9dxdr').append(options);
						} else {
							$(this).append(options);
							// $(this).find('a[role="link"]:eq(0)').find('.scb9dxdr').append(options);
						}
						
					}
				}else{
					var options = '<div class="tags-container ssa-tags-container cts-messenger "><span class="bg-muted ssa-selected-tag">+</span>';
					options += '<div class="get-gl-notes">Add Notes</div> </div> ';

					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
						$(this).append(options);
						
					} else {
						$(this).append(options);
					}		
					// var options = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
					// options += '<div class="get-gl-notes">Notes</div>';
					// if($(this).find('div.tags-container').length > 0 ){
					// 	$(this).find('div.tags-container').remove();
					// 	$(this).prepend(options);
					// 	// $(this).find('a[role="link"]:eq(0)').find('.scb9dxdr').append(options);					
					// } else {
					// 	$(this).prepend(options);
					// 	// $(this).find('a[role="link"]:eq(0)').find('.scb9dxdr').append(options);
					// }
				}	
			}			
		});
	}
	chrome.storage.local.get(["isCurrentFBLinked"], function(result) {
			if(result.isCurrentFBLinked){
				$(".tags-container").show();
			} else {
				$(".tags-container").hide();
			}
	})
	processing = false;
}

function integrateSSAFeature(){
	
	setInterval(function(){
		
		if(conversionListText != '' && $(fb_list_selectors).length > 0 &&  !processing ){			
			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
					processing = true;
					var spanTagPerChat = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
				
					spanTagPerChat += '<div class="get-gl-notes">Notes</div></div>';
					
					
					/********** Create Tags Drop Down for each chat thread ********/
					$(fb_list_selectors).each(function(index) {
						var fbUser =  ''; 
						currentWindowUrl = window.location.origin;
						if (currentWindowUrl.indexOf('messenger') > -1) {
							fbUser = $(this).find('a:eq(0)').attr('data-href').split('/t/')[1];

							if (fbUser.indexOf('?') > -1) {
								fbUser = fbUser.split('?')[0];
							}
						}else if (isFBNewLayout) {
							 fbUser = $(this).find('a').attr('data-href').split('/messages/t/')[1].split('?')[0];
						} else {
							 fbUser = $(this).find('a').attr('data-href').split('/t/')[1];
						}
						if($(this).find('div.tags-container').length > 0 ){
							$(this).find('div.tags-container').remove();
											
							$(this).attr('fb_user_id',fbUser);
							$(this).attr('numeric_fb_id','0');
							$(this).find('span._1ht6').after(spanTagPerChat);
						} else {
							$(this).attr('numeric_fb_id','0');
							$(this).attr('fb_user_id',fbUser);
							$(this).find('span._1ht6').after(spanTagPerChat);
						}
					});
															
					if(result.isCurrentFBLinked){
						$(".tags-container").show();
					} else {
						$(".tags-container").hide();
					}

					/********** Tag Users ********/
					if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
						tagUsers(result.taggedUsers,result.tags);
					}
				}
			});
		}
	},1000);
}


function integrateSSAFeature(){
	setInterval(function(){
		if(conversionListText != '' && $(fb_list_selectors).length > 0 &&  !processing ){			
			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
					processing = true;
					var spanTagPerChat = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
				
					spanTagPerChat += '<div class="get-gl-notes">Notes</div></div>';
					
					
					/********** Create Tags Drop Down for each chat thread ********/
					$(fb_list_selectors).each(function(index) {
						var fbUser =  ''; 
						currentWindowUrl = window.location.origin;
						if (currentWindowUrl.indexOf('messenger') > -1) {
							fbUser = $(this).find('a:eq(0)').attr('data-href').split('/t/')[1];

							if (fbUser.indexOf('?') > -1) {
								fbUser = fbUser.split('?')[0];
							}
						}else if (isFBNewLayout) {
							 fbUser = $(this).find('a').attr('data-href').split('/messages/t/')[1].split('?')[0];
						} else {
							 fbUser = $(this).find('a').attr('data-href').split('/t/')[1];
						}
						if($(this).find('div.tags-container').length > 0 ){
							$(this).find('div.tags-container').remove();
											
							$(this).attr('fb_user_id',fbUser);
							$(this).attr('numeric_fb_id','0');
							$(this).find('span._1ht6').after(spanTagPerChat);
						} else {
							$(this).attr('numeric_fb_id','0');
							$(this).attr('fb_user_id',fbUser);
							$(this).find('span._1ht6').after(spanTagPerChat);
						}
					});
															
					if(result.isCurrentFBLinked){
						$(".tags-container").show();
					} else {
						$(".tags-container").hide();
					}

					/********** Tag Users ********/
					if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
						tagUsers(result.taggedUsers,result.tags);
					}
				}
			});
		}
	},1000);
}

function tagUsers(taggedUsers,tags){
	
	$(fb_ul_li_selector).each(function() {
		var li_fb_user_id = $(this).attr('fb_user_id');
		var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id)});
		
		if( temp.length > 0 ){
			$liClass = '';
			$colorCode = '';
			var $tagIds = [];
			if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
				$tagIds = temp[0].tag_id.split(',');
			} else {
				if(temp[0].tag_id.length > 0) {
					$tagIds = temp[0].tag_id;
				}
			}			
			var title = '';
			var spanText = '';
			var numeric= temp[0].numeric_fb_id;
			$tagIds.forEach(function(eachTagId){

				eachTagIdOne = eachTagId.replace(/\#/g,'');
				var foundTag = tags.filter(function (item) { return item.value == eachTagIdOne});
				if (foundTag.length > 0) {
					title += foundTag[0].text+', ';
					$liClass = foundTag[0].class;
					$colorCode = foundTag[0].color;
					spanText = foundTag[0].text;
				}
			})

			if (title != '') {
				$(this).find('.tags-container span').text(spanText);
				$(this).find('.tags-container span').prop('title',title.slice(0, -1));
				$(this).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
				if(numeric == null){
					$(this).attr('numeric_fb_id','0');
				}else{
					$(this).attr('numeric_fb_id',numeric);
				}

				if ($colorCode == null) {
					$(this).find('.tags-container span').addClass('bg-'+$liClass);
				}else{
					$(this).find('.tags-container span').removeClass('bg-muted');
					$(this).find('.tags-container span').css('background',$colorCode);
					$(this).find('.tags-container span').addClass('tag-text-color');
				}
			}else{
				var options = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
				options += '<div class="get-gl-notes">Add Notes</div>';
				if($(this).find('div.tags-container').length > 0 ){
					$(this).find('div.tags-container').remove();
					$(this).find('span._1ht6').after(options);
				} else {
					$(this).find('span._1ht6').after(options);
				}
			}
		}else{
			var options = '<div class="tags-container ssa-tags-container cts-messenger"><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
				options += '<div class="get-gl-notes">Add Notes</div></div>';

				if($(this).find('div.tags-container').length > 0 ){
					$(this).find('div.tags-container').remove();
					$(this).find('span._1ht6').after(options);
					
				} else {
					$(this).find('span._1ht6').after(options);
					
				}
		}		
	});

	chrome.storage.local.get(["isCurrentFBLinked"], function(result) {
			if(result.isCurrentFBLinked){
				$(".tags-container").show();
			} else {
				$(".tags-container").hide();
			}
	})
	processing = false;
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if( typeof changes.taggedUsers != 'undefined' && typeof changes.taggedUsers.newValue != 'undefined'){
		chrome.storage.local.get(["ssa_user","tags"], function(result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
				 
				var pathname = window.location.pathname.toString();	
			 	if(pathname.indexOf("/messages") > -1 || window.location.origin.indexOf('messenger.com')>-1){	
					//  tagUsers(changes.taggedUsers.newValue,result.tags);
					if ($('.cts-message-list-item').length > 0) {			 		
						tagUsersWM(changes.taggedUsers.newValue,result.tags);
					} else {
						tagUsers(changes.taggedUsers.newValue,result.tags);
					}
			 	}else if(pathname.indexOf("/inbox") > -1){
			 		tagPageUsers(changes.taggedUsers.newValue,result.tags);
			 	}else if(pathname.indexOf("/friends") > -1){
			 		tagUsersForProfileFriends(changes.taggedUsers.newValue,result.tags);
			 	}else if(pathname.indexOf("/groups") > -1 && pathname.indexOf("/members")){
			 		tagUsersForGroupMembers(changes.taggedUsers.newValue,result.tags);
			 	}
			}
		});
	}
	if( typeof changes.tags != 'undefined' && typeof changes.tags.newValue != 'undefined'){
	
		chrome.storage.local.get(["ssa_user","taggedUsers"], function(result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
				 
				var pathname = window.location.pathname.toString();	

			 	if(pathname.indexOf("/messages") > -1 || window.location.origin.indexOf('messenger.com')>-1){	
			 		
			 		if ($('.cts-message-list-item').length > 0) {
			 	
			 			tagUsersWM(result.taggedUsers,changes.tags.newValue);
			 		} else {
			 			tagUsers(result.taggedUsers,changes.tags.newValue);

			 		}

			 	}else if(pathname.indexOf("/inbox") > -1){
			 		tagPageUsers(result.taggedUsers,changes.tags.newValue);
			 	}else if(pathname.indexOf("/friends") > -1){
			 		tagUsersForProfileFriends(result.taggedUsers,changes.tags.newValue);
			 	}else if(pathname.indexOf("/groups") > -1 && pathname.indexOf("/members")){
			 		tagUsersForGroupMembers(result.taggedUsers,changes.tags.newValue);
			 	}
			}
		});
	}

});
	
function verifyConversationList(){
	var conversationListFound = setInterval(function(){
		
		if($(fb_ul_selector).length > 0){
			clearInterval(conversationListFound);				
			createTagDropDownContainer();
		}
	},1000);
}
			
function updateFBUsertag(tagId, fbUserId,numericFbId, profilePic, fbName='',fromPage,page, newThreadMessenger = 0 , newMThreadId = 0){
	
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "" && currentLoggedInFBId != '') {
			port.postMessage({'type': 'updateFBUsertag','fromPage':fromPage,'data': {tagId:tagId, userId:result.ssa_user.id, loggedInFBId: currentLoggedInFBId, fbUserId: fbUserId, numericFbId:numericFbId,profilePic:profilePic, fbName: fbName,isPage:page,newThreadMessenger:newThreadMessenger, newMThreadId: newMThreadId}});		
		}
	});
}

function updateFBUserTeam(teamId, fbUserId,numericFbId, profilePic, fbName='',fromPage,page){
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "" && currentLoggedInFBId != '') {
			port.postMessage({'type': 'updateFBUserTeam','fromPage':fromPage,'data': {teamId:teamId, userId:result.ssa_user.id, loggedInFBId: currentLoggedInFBId, fbUserId: fbUserId, numericFbId:numericFbId,profilePic:profilePic, fbName: fbName,isPage:page}});		
		}
	});
}

function createTagDropDownContainer(){		
	chrome.storage.local.get(["tags", "taggedUsers","isCurrentFBLinked"], function(result) {
		/********** Tag Users ********/
		if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
			var pathname = window.location.pathname.toString();	
		 	if(pathname.indexOf("/inbox") > -1){
		 		tagPageUsers(result.taggedUsers,result.tags);
		 	}else if(window.location.origin.indexOf('messenger.com') > -1){
		 		tagUsers(result.taggedUsers,result.tags);
		 	}
		}

		if(result.isCurrentFBLinked){
			$(".tags-container").show();
		} else {
			$(".tags-container").hide();
		}
		
	});
}
function formatDate(dateFormat){
	var today = new Date(dateFormat);
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var hh = String(today.getHours()).padStart(2, '0'); 
	var min = String(today.getMinutes()).padStart(2, '0'); 
	

	return today = mm + '/' + dd + ' ' + hh + ':'+ min;
}

displaySelectedTagRightSide();
function displaySelectedTagRightSide(){
	setInterval(()=>{
		var pathname = window.location.href.toString();	
	 	if(pathname.indexOf("/messages") > -1 || pathname.indexOf("messenger") > -1){
			chrome.storage.local.get(["ssa_user","tags","taggedUsers", "teams", "teamMembers", "notes", "linkedFbAccount"], function(result) {			
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
					var loc1 = window.location.href;
					loc1 = loc1.split("/t/");
					if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "" && typeof result.tags != "undefined" && result.tags != "") { 

						var taggedUsers = result.taggedUsers != null ? result.taggedUsers : [];
						var li_fb_user_id = loc1[1];
						// GetBothAphaAndNumericId(li_fb_user_id).then(function(fbIDsObject){
						// 	li_fb_user_id = fbIDsObject.fb_user_id.replace('/', '');
						// });		
						var $tagIds = [];
						var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id) });
						if( temp.length > 0 ){
							if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
								$tagIds = temp[0].tag_id.split(',');
							} else {
								$tagIds = temp[0].tag_id;
							}
						}
						var teamInfo = {};
						if( typeof result.teams != "undefined" && result.teams != "" ){
							result.teams.forEach(function (item) {
								teamInfo[item.id] = item.name;
							});
						}
						var teamMembersInfo = {};
						if( typeof result.teamMembers != "undefined" && result.teamMembers != "" ){
							result.teamMembers.forEach(function (item) {
								teamMembersInfo[item.fb_user_id] = item.fb_name;
							});
						}
						var mylocation='';
						if( typeof result.linkedFbAccount != "undefined" && result.linkedFbAccount != "" && result.linkedFbAccount != null  && result.linkedFbAccount.location != null ){
							mylocation= result.linkedFbAccount.location;
						}
						var notesList = '';
						
						if (typeof result.notes != "undefined" && result.notes != "") { 

							var tempNotes = result.notes.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id) });
							if(tempNotes.length > 0) {
								notesList = '<div class="notes-list-container"><div class="notes-list">';
								notesList += '<div class="grid-container">';
								var fullName=''
								if ($('.cts-message-list-item').length > 0) {
									fullName = $('div[role="main"]').find('.qzhwtbm6.knvmm38d a[target="_blank"][role="link"]:eq(0)').text();
								}else
								{
									fullName = $('._3tkv').find('a[target="_blank"]').first().text();
								}								
								tempNotes.forEach(function(eachNote){
									var scope = description = '';
									var sender = '?';
									if(eachNote.team_id != 0) {
									// 	scope = 'private';
									// 	description = eachNote.description;
									// } else {
										scope = typeof teamInfo[eachNote.team_id]!= "undefined"?teamInfo[eachNote.team_id]:"";
										description = '<a target="_blank" href="https://www.facebook.com/'+
											eachNote.sender_fb_user_id+'">'+eachNote.description+'</a>';
									}
									if(eachNote.sender_fb_user_id in teamMembersInfo) {
										var sender_name = teamMembersInfo[eachNote.sender_fb_user_id];
										sender_name = sender_name.split(" ");
										if(sender_name.length >= 2) {
											sender = sender_name[0].charAt(0) + sender_name[1].charAt(0);
										} else if(sender_name.length == 1) {
											sender = sender_name[0].charAt(0) + sender_name[0].charAt(1);
										} else {
											sender = '?';
										}
									} else if(typeof eachNote.sender_fb_user_id != "undefined") {
										sender = eachNote.sender_fb_user_id.split(".");
										if(sender.length >= 2) {
											sender = sender[0].charAt(0) + sender[1].charAt(0);
										} else if(sender.length == 1) {
											sender = sender[0].charAt(0) + sender[0].charAt(1);
										} else {
											sender = '?';
										}
									}
									sender = sender.toUpperCase();
									sender = '<a class="link-to-sender" target="_blank" href="https://www.facebook.com/'+
											eachNote.sender_fb_user_id+'">' + sender + '</a>';
									
									if (eachNote.description.indexOf('[mylocation]') > -1) {	
										if(mylocation.includes("|")){
											var locations = mylocation.split("|");		
											mylocation = locations[Math.floor(Math.random() * locations.length)];	
										}								
										eachNote.description = eachNote.description.replace(/\[mylocation]/g,mylocation);
									}
									if (eachNote.description.indexOf('[first_name]') > -1) {
										first_name = fullName.split(' ')[0];
										eachNote.description = eachNote.description.replace(/\[first_name]/g,first_name);
									}
					
									if (eachNote.description.indexOf('[last_name]') > -1) {
										nameArray = fullName.split(' ');
										if(nameArray.length > 1){
											last_name = nameArray[nameArray.length-1];
											eachNote.description = eachNote.description.replace(/\[last_name]/g,last_name);
										}else{
											eachNote.description = eachNote.description.replace(/\[last_name]/g,'');
										}
									}	
									/*notesList += '<div class="ssa-cols ssa-col-md-12 notes" note-id="'+eachNote.id+'">'+
									'<div class="right-col-item ssa-cols ssa-col-md-4" >'+description+'</div>'+
									'<div class="ssa-cols ssa-col-md-3 text-right">'+ scope +'</div>'+
									'<div class="ssa-cols ssa-col-md-5 note-timing text-right" >'+eachNote.updatedDate+'</div></div>';*/
									
									notesList += '<div class="grid-item"><div class="grid-notes-sender">'+sender
													+ '</div><div class="grid-notes-update">' + formatDate(eachNote.updated_at)+ '</div>';
									if (scope != ''){
										notesList+='<div class="grid-notes-team">' + scope + '</div></div>';
									}
									else 
										notesList+='</div>';
									notesList += '<div class="grid-item custom-scroll">'+eachNote.description+'</div>';
							
								});
								notesList += '</div>';
								notesList += '</div>';
								notesList += '</div>';									
							}
						} else {
								//notesList += '<br>No notes to display!';
						}

						var totalTagLi = '<ul class="right-side-tag-list">';
						$tagIds.forEach(function(eachTagId){
							liclass = '';
							liStyle = '';
							eachTagIdOne = eachTagId.replace(/\#/g,'');
							var foundTag = result.tags.filter(function (item) { return item.value == eachTagIdOne});
							if (foundTag.length > 0) {
								$liClass = foundTag[0].class;
								$colorCode = foundTag[0].color;
								liText = foundTag[0].text;

								if ($colorCode== null) {
									liclass = 'bg-'+$liClass;
								}else{
									liStyle = 'style = "background-color:'+$colorCode +'";'
								}
					
								totalTagLi += '<li '+liStyle+' class="'+liclass+'">'+liText+'</li>';
							}

						})

						totalTagLi += '</ul>';
						
						if(window.location.origin.indexOf('messenger.com') > -1){
							
							// $('._3tkv').find('a[target="_blank"]').first().parent().parent().parent().parent().after(totalTagLi);						
							if ($('.cts-message-list-item').length > 0) {
								$('.right-side-tag-list').remove();
								$('.notes-list-container').remove();
								// _3tkv
								if ($('div[role="main"]').find('.tags-container').length == 0) {
									var options='<div class="temp_image_box" style="width: calc(100%);"></div>'
									options += '<div class="tags-container ssa-tags-right cts-messenger" fb_user_id="'+ li_fb_user_id+'" ><span class="bg-muted ssa-selected-tag"><span class="badge badge-light"><b class="add-tag-border">+</b></span></span>';
									options += '<div class="get-gl-right-notes">Add Notes</div>';
									$('div[role="main"]').find('.qzhwtbm6.knvmm38d a[target="_blank"][role="link"]:eq(0)').first().parent().parent().parent().parent().prepend(options); 					
								}							
								$('div[role="main"]').find('.qzhwtbm6.knvmm38d a[target="_blank"][role="link"]:eq(0)').parent().after(notesList);
								$('div[role="main"]').find('.qzhwtbm6.knvmm38d a[target="_blank"][role="link"]:eq(0)').parent().after(totalTagLi); 
							}
							else{
								
								if ($('._3tkv .right-side-tag-list').length > 0) {
									$('._3tkv .right-side-tag-list').remove();
								}

								if ($('._3tkv .notes-list-container').length > 0) {
									$('._3tkv .notes-list-container').remove();
								}
								//$('._3tkv').find('a[target="_blank"]').first().after(totalTagLi);
								$('._3tkv').find('a[target="_blank"]').first().parent().parent().parent().parent().after(totalTagLi);
								$('._3tkv').find('a[target="_blank"]').first().parent().parent().parent().parent().parent().after(notesList);
								
							}
						}else{

							if ($('._4_j5 .right-side-tag-list').length > 0) {
								$('._4_j5 .right-side-tag-list').remove();
							}

							$('._4_j5').find('a[uid]').after(totalTagLi);
							}					
					}	

				}
			});
		}
	}, 2000);
}

function verifyUserLogin(){
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if( typeof result.fb_id != "undefined" && result.fb_id != "" ){
			 port.postMessage({'type': 'verifyUserLogin','data': {fb_id: result.fb_id}});
			//chrome.runtime.sendMessage({'verifyUserLogin': 'verifyUserLogin','data': {fb_id: result.fb_id}});
		} else {
			//alert('Error: Enable to get your fb account id');
		}
	});	
}

function hide_loader() {
	var timeout=setTimeout(()=>{
		clearTimeout(timeout);
		$('#overlay').hide();
	},2000);
}

function clearTimeOutIntervals(){
  bulkMessageTimeout.forEach(function(item){
    clearTimeout(item);
  });
  bulkMessageTimeout = [];
}

function addUserTagFromContent(tagName) {
	chrome.storage.local.get(["ssa_user"], function(result) {
		if( typeof result.ssa_user != "undefined" && result.ssa_user != "" ){
			var temp = {};
			temp.tag = tagName;
			temp.userId = result.ssa_user.id;
			temp.class = tagColors[Math.floor(Math.random()*tagColors.length)]
			chrome.runtime.sendMessage({saveTagFromContent: "saveTagFromContent", data: temp});
		} 
	});		
}

function displayNotes(notesArray) {
	//if (notesArray.length > 0) {
	chrome.storage.local.get(["teams"], function(result) {
		var teamInfo = {};
		if( typeof result.teams != "teams" && result.teams != "" ){
			result.teams.forEach(function (item) {
				teamInfo[item.id] = item.name;
			});
		}
		var notes = `<div class="row custom-row">
						<div class="leve-1 tagged-name">`+fbNameForNotes+`</div>
						<div class="leve-1 close-model">X</div>
					</div>
					<div class="msg-for-notes ssa-cols ssa-col-md-12 text-center"></div> 
					<div  class ="content-user-notes-container"> 						
						<div class="ssa-cols ssa-col-md-12 text-center" > 
							<button class="add-notes-from-content bg-purple ssa-btn ssa-col-md-12	">Add Note</button>
						</div>
						<div class="ssa-cols ssa-col-md-12" >
							<hr>
						</div>
						<div class="row-container custom-scroll ssa-cols ssa-col-md-12">`; 
		notesArray = notesArray.reverse();
		notesArray.forEach(function (eachNote, index) {
			scope = eachNote.team_id == 0 ? 'private' : "Team: " + teamInfo[eachNote.team_id];
			notes += '<div class="ssa-cols ssa-col-md-12 notes" note-id="'+eachNote.id+'"><textarea rows="2" class="notes-description ssa-teaxtarea">'+eachNote.description+'</textarea>'+
			'<div class="right-col-item ssa-cols ssa-col-md-4" > <button class="note-edit bg-purple ssa-btn" title="Save">Save</button><button class="note-delete bg-gray ssa-btn" title="Delete">Delete</button></div>'+
			'<div class="ssa-cols ssa-col-md-3 text-right">'+ scope+'  '+'</div>'+
			'<div class="ssa-cols ssa-col-md-4 note-timing text-right" >'+eachNote.updatedDate.toString()+'</div></div>';
		});
		notes +='</div></div>';
		$('#ssa_model_content_two').html(notes);
		$('#overlay-two').show();
	//}
	});
}

function triggerRequestSendMessage(bulkMsgText) {
	
	let message_total_send =0;
	var delay=1000;
	if(bulkMsgText.includes("|")){
		isNameSet = setInterval(()=>{

			if ($('.mToken').length > 0 && $('.mToken').text().length > 0) {
				clearInterval(isNameSet)
				
				var res = bulkMsgText.split("|");		
				res.forEach(function(text,index){			
					let messId=setTimeout(()=>{
						$('textarea').val(text);
						setTimeout(()=>{							
							if(index == res.length -1){
								chrome.runtime.sendMessage({closeRequestMessageTab: "closeRequestMessageTab"});	
							}
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
	
	let timeout =setTimeout(function(){
		clearTimeout(timeout);
		clearTimeOutIntervals();
		chrome.runtime.sendMessage({closeRequestMessageTab: "closeRequestMessageTab"});	
	},30000);	

}


function  checkFriendRequestForPostMessageNew(){
	$('div.kd0sc8dh.sl8jk4me.ie5zihkj.i09qtzwb.rm3jng1j.hzruof5a.pmk7jnqg.kr520xx4.c0wkt4kp').prev().animate({ scrollTop:  5000 }, 1000);
	setTimeout(function(){
		
		var logSelector = 'div[aria-label="List of activity log items"]';
		if($(logSelector).length == 0){
			logSelector = 'div[aria-label="List of Activity Log Items"]';
		}

		sendLoadedRequestNew();

		/*if (/[0-9]/.test($(logSelector).find('.kvgmc6g5 h2').text())) { 
			alert();
			 sendLoadedRequestNew();
		}else{
			checkFriendRequestForPostMessageNew();
		}*/

	},1000);
}


function sendLoadedRequestNew() {
	var newRequestidsTEMP = [];

	$('div[aria-label="Activity Log Item"] div[data-visualcompletion="ignore-dynamic"]').addClass('cts-open').each(function (index) {
		profileUrlTemp = $(this).find('a').first().attr('href');
				
		var tempFriendData = {};

		profileUrlTemp = new URL(profileUrlTemp);
		var requestProfileId = profileUrlTemp.pathname.replace('/','');

	 	tempFriendData.requestProfileId = $.trim(requestProfileId);

	 	tempFriendData.fullName = $(this).find('strong:eq(1)').text();
		
	 	if (friendRequestHistory.length > 0) {
	 		
	 		found = friendRequestHistory.filter((his)=>{return his.request_fb_id == requestProfileId })
	 	
	 			if(found.length == 0){
					
				}else{
					if (found[0].is_message_send == 1) {
				 		foundMulti = newRequestidsTEMP.filter((hisTemp)=>{return hisTemp.requestProfileId == requestProfileId })
						
						if (foundMulti.length == 0) {
							newRequestidsTEMP.push(tempFriendData);
						}								
						
					}
				}
	 	}			
		
	});

	chrome.runtime.sendMessage({friendRequestsFromContent: "friendRequestsFromContent", data: newRequestidsTEMP});

}
function sendLoadedRequestNew_BKUP() {
	var newRequestidsTEMP = [];
	var activeLogSelector = 'div[aria-label="List of activity log items"]';
	if($(activeLogSelector).length == 0){
		activeLogSelector = 'div[aria-label="List of Activity Log Items"]';
	}
	$todaysDivElement = $(activeLogSelector).find('.kvgmc6g5 h2:contains(Today)').closest('div.kvgmc6g5');
	$todaysDivElement.find('.l9j0dhe7').each(function (index) {
		$(this).find('div:contains(became friends with)').closest('.l9j0dhe7').find('a:eq(0)').addClass('cts-open');
	});

	dealyToLoad = 0;
	totalTodaysFriend = 0;
	if($('.cts-open').length > 0){
		$('.cts-open').each(function (index) {
			setTimeout(()=>{				
				// profileUrlTemp = $(this).attr('href')	
				// var tempFriendData = {};
				// profileUrlTemp = new URL(profileUrlTemp);
				// var requestProfileId = profileUrlTemp.pathname.replace('/','');
				// tempFriendData.requestProfileId = requestProfileId;
				// tempFriendData.fullName = $(this).find('strong:eq(1)').text()
	
				// if (friendRequestHistory.length > 0) {
				// 	found = friendRequestHistory.filter((his)=>{return his.request_fb_id == requestProfileId })
				// 		if(found.length == 0){
						
				// 		}else{
				// 			if (found[0].is_message_send == 1) {
				// 				newRequestids.push(tempFriendData)
				// 			}
				// 			if (found[0].is_message_send == 1) {
				// 				foundMulti = newRequestidsTEMP.filter((hisTemp)=>{return hisTemp.requestProfileId == requestProfileId })
							   
				// 			   if (foundMulti.length == 0) {
				// 				   newRequestidsTEMP.push(tempFriendData);
				// 			   }								
							   
				// 		   }
				// 		}
				// }
				
				// if($('.cts-open').length == 0){
						
				// 	chrome.runtime.sendMessage({friendRequestsFromContent: "friendRequestsFromContent", data: newRequestidsTEMP});
				// }
				$(this).mclick();
				let thisme = $(this);							
				setTimeout(()=>{

					var LogSelector = 'div[aria-label="Activity log item"]';

					if($(LogSelector).length == 0 ){
						LogSelector = 'div[aria-label="Activity Log Item"]'
					}			

					profileUrlTemp = $(thisme).attr('href')	
					var tempFriendData = {};
					var requestProfileId = '';
					if (profileUrlTemp.indexOf('profile.php') > -1) {
						requestProfileId =(new URL(profileUrlTemp)).searchParams.get('id');				
					}else{
						requestProfileId = (new URL(profileUrlTemp)).pathname.replace('/','');
					}					
					
					tempFriendData.requestProfileId = requestProfileId;
					tempFriendData.fullName = $(thisme).find('strong:eq(1)').text()
					
				 	if (friendRequestHistory.length > 0) {
				 		
				 		found = friendRequestHistory.filter((his)=>{return his.request_fb_id == requestProfileId })
				 	
				 			if(found.length == 0){
								
							}else{
								foundMulti = newRequestidsTEMP.filter((hisTemp)=>{return hisTemp.requestProfileId == requestProfileId })
									
								if (foundMulti.length == 0) {
									newRequestidsTEMP.push(tempFriendData);
								}	
							}
				 	}
					if($('.cts-open').length -1 == index){						
						chrome.runtime.sendMessage({friendRequestsFromContent: "friendRequestsFromContent", data: newRequestidsTEMP});
					}

				},5000)
			}, dealyToLoad);
			dealyToLoad = dealyToLoad + 15000;
		});
		// chrome.runtime.sendMessage({friendRequestsFromContent: "friendRequestsFromContent", data: newRequestidsTEMP});
	}else{		
		chrome.runtime.sendMessage({friendRequestsFromContentClose: "friendRequestsFromContentClose"});
	}	
}

function  checkFriendRequestForPostMessage(){
	$("html, body").animate({ scrollTop: $(document).height() }, 1000);
	setTimeout(function(){
		if (/[0-9]/.test($('#fbTimelineLogBody div.pam._5ep8.uiBoxWhite.bottomborder').text())) { 
				 sendLoadedRequest();
			}else{
				checkFriendRequestForPostMessage();
			}
	},1000);		
}


function sendLoadedRequest() {
	var newRequestids = [];
	$('.uiList li div.clearfix div._42ef div:contains(became friends with)').each(function (index) {
		var tempFriendData = {};
		profileUrlTemp = $(this).find('a:eq(1)').attr('href');
		profileUrlTemp = new URL(profileUrlTemp);
		var requestProfileId = profileUrlTemp.pathname.replace('/','');
	 	tempFriendData.requestProfileId = requestProfileId;
	 	tempFriendData.fullName = $.trim($(this).find('a:eq(1)').text());

	
	 	if (friendRequestHistory.length > 0) {
	 		found = friendRequestHistory.filter((his)=>{return his.request_fb_id == requestProfileId })
	 			if(found.length == 0){
				
				}else{
					if (found[0].is_message_send == 1) {
						newRequestids.push(tempFriendData)
					}
				}
	 	}
	});
	chrome.runtime.sendMessage({friendRequestsFromContent: "friendRequestsFromContent", data: newRequestids});
}

var totalComingRequests = 0;
function loadComingRequests(loadedRequestHistory = 0){
	$("html, body").animate({ scrollTop: $(document).height() }, 1000);
	setTimeout(()=>{
		if (loadedRequestHistory != 0 && loadedRequestHistory == $('button[value="Confirm"]').length) {
			readFriendRequests();
		}else{
			if ($('button[value="Confirm"]').length <= 100 &&  $('button[value="Confirm"]').length < totalComingRequests) {
				loadComingRequests($('button[value="Confirm"]').length);
			}else{
				readFriendRequests();
			}
		}
	}, 3000);
	

}

function readFriendRequests(){
	var newRequestids = [];	
	
	if($('#friends_center_main') != null && $('#friends_center_main') != "undefined") {
		var requests = $('#friends_center_main')[0].getElementsByClassName('_5vbx');	
		for(var index = 0; index < requests.length ; index++) {
	
			var friendRequest = requests[index].getElementsByTagName('a')[1];
			fullName = friendRequest.text;
			mylocation='';
			chrome.storage.local.get(["linkedFbAccount"], function(result) {
				if (typeof result.linkedFbAccount.location != "undefined" && result.linkedFbAccount.location != ""){
					mylocation= result.linkedFbAccount.location;
				}
			});
			
			//console.log("req  " + index + " "  + fullName);
		
			var tempData = {};
			tempData.fullName = fullName;
			tempData.location = mylocation;
			var requestProfileId = '';
			requestProfileUrl = friendRequest.href.replace("https://m.facebook.com","https://facebook.com");
			profileUrlTemp = new URL(requestProfileUrl);
			if (requestProfileUrl.indexOf('.php') > -1) {
				requestProfileId =   profileUrlTemp.searchParams.get('id');
			}else{
				requestProfileId = profileUrlTemp.pathname.replace('/','');
			}

			if (friendRequestHistory.length > 0) {
				found = friendRequestHistory.filter((his)=>{return his.request_fb_id == requestProfileId  });
				if(found.length == 0){
					tempData.requestProfileId = requestProfileId;
					newRequestids.push(tempData)
				}
			}else{
				tempData.requestProfileId = requestProfileId;
				newRequestids.push(tempData)
			}
			//}	
		}
		chrome.runtime.sendMessage({confimFriendRequestsFromContent: "confimFriendRequestsFromContent", data: newRequestids});
	}
			
	
}


function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

var saveBtnHtmlForMessenger = '<div class="row custom-row text-center"> <button disabled="true" class="save-multi-tag-user bg-purple ssa-btn" type="button" value="1">Save</button> </div> ';

function showMultiTagListForMassTagging() {
	chrome.storage.local.get(["tags"], function(result) {
		var options = '<div class="row custom-row"><div class="leve-1 tagged-name">'+' '+'</div><div class="leve-1 close-model">X</div></div> '+searchHtml+saveBtnHtmlForMessenger+'<div class="row custom-row"> <div class="tags-container ssa-tags-container"><ul class="model-tag-list custom-scroll">';
		if (typeof result.tags != "undefined" && result.tags != "") { 
			result.tags = result.tags.reverse();
			for(i=0;i<result.tags.length;i++){
				var style ='';
				if (result.tags[i].color !== null ) {
					style = 'style = "background:'+result.tags[i].color+' !important"';
					options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color multi-tag-multi-user'  tag-id='"+result.tags[i].value+"'";
					options += "><input class = 'multi-tag-checkbox-multi-user' type='checkbox'><div class='tag-n-c-multi-user'>"+result.  tags[i].text+"</div></li>";
				}else{
					options += "<li class='bg-"+result.tags[i].class+" tag-text-color multi-tag-multi-user' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
					options += "><input class = 'multi-tag-checkbox-multi-user' type='checkbox'><div class='tag-n-c-multi-user'>"+result. tags[i].text+"</div></li>";
				}
			}					
		}
		options += '</ul></div>';
		$('#ssa_model_content_two').html(options);
		$('#overlay-two').show();
	});
}


function updateFBUsertagForMultiUserOnMessenger($checkedTags){
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			port.postMessage({'type': 'updateFBUsertagForMultiUserOnGroupMember','data': {userId:result.ssa_user.id,loggedInFBId: currentLoggedInFBId, tagsArray:$checkedTags, checkedUsers: $checkedUsersForMessenger}});		
		}
	});

}



//Handling opened window
handleCB_UserWindow();
function handleCB_UserWindow(){
	setTimeout(() => {
		let cb_current_window = window.location.href;
		let url = new URL(cb_current_window);
		
		
		console.log(url.searchParams.get('lets_blast_user'));
		if(url.searchParams.get('lets_blast_user')!="1"){
			return;
		}

		let addFriendButton = $("[aria-label='Add Friend']").get(0);
		
		if(url.searchParams.get('addFriend')=="1"){
			if(typeof addFriendButton != "undefined" ){
				console.log("send the friend request");
				let path = addFriendButton.getAttribute('href');
				$.ajax({
					type: "GET",
					url: path,
					success: function (data, txtStatus, request) {
						
					}
				});
			}		
		}
		
					
		if(url.searchParams.get('sendMessages')=="1"){
			if(url.searchParams.get('dm_new_contact')=="0"||(url.searchParams.get('dm_new_contact')=="1" && typeof addFriendButton != "undefined")){
				console.log("send dm messge");	
				var alphaNumericId = '';				
				if (cb_current_window.indexOf('profile.php') > -1) {
					alphaNumericId=	url.searchParams.get('id');
				} else {
					alphaNumericId= url.pathname.replace('/','');							
				}
				console.log("Fb user id:" & alphaNumericId);
				chrome.storage.local.get(["cb_custom_dms","cb_custom_dms_contact","linkedFbAccount"],function(res){
					if (typeof res.linkedFbAccount.location != "undefined" && res.linkedFbAccount.location != ""){
						mylocation= res.linkedFbAccount.location;				
					}			
					let messages = res.cb_custom_dms;
					let fullname = $('#cover-name-root')[0].innerText;
					let message = messages[Math.floor(Math.random()*messages.length)];
					message = getCBDMMessage(message, fullname, mylocation);			
					let list = res.cb_custom_dms_contact;
					if(!list){
						list = [];
					}
					if(list.indexOf(alphaNumericId) > -1 ) {
						console.log("user has been sent dm");
					}
					else{
						list.push(alphaNumericId);
						chrome.storage.local.set({'cb_custom_dms_contact':list},function(res){
						});
						chrome.runtime.sendMessage({'action': 'sendCBRequestDMMessage',threadId:alphaNumericId, dmMessage:message})
					}
				});
			}	
		}
		
		if(window.name=="currentUserBlaster"){
			setTimeout(() => {
				window.close();
			}, 3000);		
		}
	}, 1000);
}
handlePL_UserWindow();
function handlePL_UserWindow(){
	setTimeout(() => {
		let cb_current_window = window.location.href;
		let url = new URL(cb_current_window);
		
		
		if(url.searchParams.get('lets_pipe_user') != "1"){
			return;
		}

		let addFriendButton = $('div[aria-label="Add Friend"]:contains("Add Friend")').get(0);
		
		if(url.searchParams.get('addFriend')=="1" && url.searchParams.get('pipeline_option') !="2"){
			if(typeof addFriendButton != "undefined" ){
				$(addFriendButton).mclick();
			}		
		}					
		if((typeof addFriendButton != "undefined" && url.searchParams.get('pipeline_option') =="0") || url.searchParams.get('pipeline_option') =="2"){
			var temp = {};
			temp.numeric_fb_id = url.searchParams.get('numeric_fb_id');
			temp.message1 = url.searchParams.get('message1');
			temp.message2 = url.searchParams.get('message2');
			temp.message3 = url.searchParams.get('message3');
			chrome.runtime.sendMessage({sendPipeMessage: "sendPipeMessage", data: temp});
		}	
		
		if(url.searchParams.get('close')==="1"){
			setTimeout(() => {
				window.close();
			}, 3000);		
		}
	}, 1000);
}
handleUF_UserWindow();
function handleUF_UserWindow(){
	setTimeout(() => {
		let cb_current_window = window.location.href;
		let url = new URL(cb_current_window);
		
		
		if(url.searchParams.get('lets_unfriend_user')!="1"){
			return;
		}

		if(url.searchParams.get('unFriend')=="1"){
			let friendButton = $("[aria-label='Friends']").get(0);

			if(typeof friendButton != "undefined" ){
				$(friendButton).mclick();
				setTimeout(() => {
				   let store= $("._54k8._55i1._58a0.touchable").find("span:contains('Unfriend')").parent().get(0).getAttribute('data-store');
				   let objStore = JSON.parse(store);
				   $.ajax({
						type: "GET",
						url: objStore.unfriendURI.replace("/",""),
						success: function (data, txtStatus, request) {
							
						}
					});
				}, 1000);	
			}		
		}					
		
		if(url.searchParams.get('close')==="1"){
			setTimeout(() => {
				window.close();
			}, 3000);		
		}
	}, 1000);
}
handleBL_UserWindow();
function handleBL_UserWindow(){
	setTimeout(() => {
		let cb_current_window = window.location.href;
		let url = new URL(cb_current_window);
		
		
		if(url.searchParams.get('lets_block_user')!="1"){
			return;
		}

		if(url.searchParams.get('block')=="1"){
			let blockConfirmed = $("button[name='confirmed']").get(0);

			if(typeof blockConfirmed != "undefined" ){
				$(blockConfirmed).mclick();
			}		
		}					
		
		if(url.searchParams.get('close')==="1"){
			setTimeout(() => {
				window.close();
			}, 3000);		
		}
	}, 1000);
}
async function GetBothAphaAndNumericId(numericFBid) {

	if (/[a-zA-Z]/.test(numericFBid)) {   /////// send alpha get numeric////
			return new Promise(function(resolve, reject) {
			$.ajax({
			type: "GET",
			url: 'https://m.facebook.com/'+numericFBid,
			success: function(data, txtStatus, request) {
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
	}else{
		var url='';
	return new Promise(function(resolve, reject) {
		var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
				var alphaNumericId = '';
				var alphaNumeric=xmlHttp.responseURL;
				if (alphaNumeric.indexOf('profile.php') > -1) {
					 alphaNumericArray= alphaNumeric.split('profile.php?id=');
					 alphaNumericId= alphaNumericArray[alphaNumericArray.length-1];
					 if(alphaNumericId.indexOf('&')){
					 	 alphaNumericId=alphaNumericId.split('&')[0];
					 }
				} else {

					alphaNumericArray= alphaNumeric.split('/');
					alphaNumericId= alphaNumericArray[alphaNumericArray.length-1];
					if(alphaNumericId.indexOf('?')){
						 alphaNumericId=alphaNumericId.split('?')[0];
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
	    xmlHttp.open("GET","https://m.facebook.com/"+numericFBid, true); // true for asynchronous 
	    xmlHttp.send(null);
	});

	}	
}
