var ADF_add_friend_processing = true;
var ADF_limit = null;
var ADF_startat = null;
var ADF_keyword = [];
var ADF_add_friend_delay = null; 
var ADF_add_friend_totalSend = 0;
var ADF_underLimit = true;
var ADF_add_friend_stopProcess = false;
var ADF_addfriendClick = custom_data.addFriend;
var ADF_profileDelay = 0;


var ADF_limitExceeded = false;

var ADF_processingTabId = 0;
var ADF_add_friend_processingStatus = false;

var limitSetByTotalMembers = false;

var currentADF_groupSettingsObject = '';
var currentLinkedFbAccountObject = '';


var ADF_memberListSelector = '#groupsMemberSection_all_members [data-testid="GroupMemberGrid"] div.clearfix._60rh._gse:not(.adf-processed)';

var ADF_memberListSelectorNew =  'div.obtkqiv7 div[data-visualcompletion="ignore-dynamic"]:not(.adf-processed)';

var ADF_PopUp = `
					<div class="text pt-2" id="sfr-popup"><h3>Sending friend request<br> in progress...</h3>
					</div>
					<div class="text">
					<h2>

						<span id="processed-members">0</span> 
						<span id="subdivision">/</span>
						<span class="total-friends" id="limit">0</span>
						</h2>
					</div>
					<div class="block" id="ssa-msgs">
					Progress
					</div><br>
					
					<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
					  <span class="slider__label sr-only">
					</div><br>
					
					<div class="sendRequestName" >
						<span class="member-name"></span>
					</div>`;


chrome.extension.onMessage.addListener(function(message, sender, send_response) {
    if (message.type == 'startLoading') {
		chrome.storage.local.get(["ADF_groupSettings","linkedFbAccount"], function(result) {
		    if (typeof result.ADF_groupSettings != "undefined") {
					currentADF_groupSettingsObject = result.ADF_groupSettings;
					currentLinkedFbAccountObject = result.linkedFbAccount;
		    		if ($('#bluebarRoot').length == 0) { /// new layout 
						totalGroupMembers = $('h2.gmql0nx0.l94mrbxd span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7:contains(Members):eq(0)').text();

		    			if (result.ADF_groupSettings.limit == 'allmembers') {
		    				totalGroupMembers = totalGroupMembers.replace(/[^\d]/g, '');
			    			ADF_limit = 10000000;// parseInt(totalGroupMembers)
			    			limitSetByTotalMembers = true;
			    			$('#limit').hide();
			    		}else{
			    			ADF_limit = parseInt(result.ADF_groupSettings.limit);
			    			limitSetByTotalMembers = false;
			    			$('#limit').show();
			    			
						}
						ADF_startat = parseInt(result.ADF_groupSettings.startat);

			    		ADF_add_friend_delay = parseInt(result.ADF_groupSettings.delay);
					 	ADF_keyword = result.ADF_groupSettings.keyword;
					 	ADF_add_friend_processing = true;
					 	ADF_add_friend_stopProcess = false;
					 	ADF_add_friend_totalSend = 0;
					 	
					 	ADF_underLimit = true;
						
					 	ADF_limitExceeded = false;					
				
						
						ADF_processingTabId = message.tabId;
						ADF_add_friend_processingStatus = 'running';
					 	
				 		$('#ssa_model_content').html(ADF_PopUp);
				 		$('#friend-convert-action').text('Is sending friend request');
					 	$('#limit').text(ADF_limit);
					 	$('.member-name').text('');
					 	$('#processed-members').text(0);
				 		$(".adf-processed").removeClass('adf-processed');
				 		
				 		AFD_processGroupMembersForNew();
		    		}else{
		    			tempTwo = {};
	                        tempTwo.tabId = 0;
	                        tempTwo.state = '';
	                        chrome.storage.local.set({"ADF_State":tempTwo}); 
		    			alert('Please switch facebook to new layout.')
		    		}
		    }
		});
    }else if(message.type == 'adf-pause'){
    	ADF_add_friend_processingStatus = 'paused';
    	ADF_add_friend_processing = false; 
    	$('#ssa-msgs').text("Paused");
    	$('.member-name').text('');
    	adfClearAutomaticIntervals();
    }else if(message.type == 'adf-resume'){
    	ADF_add_friend_processing = true;
    	ADF_add_friend_stopProcess = false;
    	ADF_profileDelay = 0;
    	ADF_add_friend_processingStatus = 'running';
    	AFD_processGroupMembersForNew();
    }else if(message.type == 'adf-stop'){
    	ADF_add_friend_stopProcess = true;
    	ADF_add_friend_processingStatus = 'stopped';
    	$('.member-name').text('');
    	$('#ssa-msgs').text('Stopped.');
    	ADF_profileDelay = 0;
    	adfClearAutomaticIntervals();
    	ADF_hide_loader();
    }
});


var timeOutIdsArray = [];

function AFD_processGroupMembersForNew(history = 0) {	
	
	if (ADF_limit == 10000000) {
		$('#limit').hide();
		$('.progress').hide();
		$('#subdivision').hide();
	}
	ADF_total = $('h2.gmql0nx0.l94mrbxd span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7:contains(Members):eq(0)').text().replace(/[^\d]/g, '');
	$('.total-friends:not([id])').text(ADF_total);
	$('#ssa-msgs').text("In progress");
	$('#text h2').text("Total Members");
	$('#overlay').show();
	ADF_loadedMembers = $('div.obtkqiv7 div[data-visualcompletion="ignore-dynamic"]').length;
	if(ADF_startat > $(ADF_memberListSelectorNew).length){
		if(  ADF_loadedMembers > history){
			$("html, body").animate({ scrollTop: $(document).height() }, 1000);
			setTimeout(()=>{				
				AFD_processGroupMembersForNew(ADF_loadedMembers);
			}, 2000)
		}
		else  {
								
			ADF_limitExceeded = true;
			ADF_underLimit = false;
			ADF_add_friend_processingStatus = 'limitexceeded';
			ADF_profileDelay = 0;
			chrome.runtime.sendMessage({'action': 'adf-complete'});

			tempTwo = {};
			tempTwo.tabId = 0;
			tempTwo.state = '';
			chrome.storage.local.set({"ADF_State":tempTwo}); 
			adfClearAutomaticIntervals();
			$('#ssa-msgs').text('Limit exceeded..');
			ADF_hide_loader();
		}
	}
	else
	{
		if(  ADF_loadedMembers > history){
		
			var outerTimeOut = setTimeout(function(){		
					
					$(ADF_memberListSelectorNew).slice(ADF_startat).each(function(index) {
		
						timeOutIds = setTimeout(()=>{
							if (ADF_add_friend_totalSend <= ADF_limit-1 && ADF_add_friend_processing && !ADF_add_friend_stopProcess) {
								$(this).addClass('adf-processed');
							
									var validDescription = true;
									var description = $(this).find('.qzhwtbm6.knvmm38d:eq(2) span').text().toLowerCase();

									if (ADF_keyword.length > 0) {
											if (description != '') {
												matched = ADF_keyword.filter((item) => description.indexOf(item.toLowerCase()) > -1);
												if(matched.length == 0){
													validDescription = false;
												}
											}else{
												validDescription = false;
											}
									}

								if (validDescription) {
									btnText = $(this).find('div[aria-label="Add Friend"]:contains("Add Friend")');
									if(btnText.length == 1){
										$('.member-name').text('Sending to '+$(this).find('.qzhwtbm6.knvmm38d:eq(0) a:eq(0)').text()).css('text-align','center');
										if (ADF_addfriendClick) {
											$(this).find('div[aria-label="Add Friend"]:contains("Add Friend")').mclick();
										}

										var memberIdTemp = extractProfileId($(this).find('a:eq(0)').attr('href'))
										$(this).attr('data-adf-numeric-fb-id',memberIdTemp);
										addTagAndSendWelcomeMessage(memberIdTemp);

										ADF_add_friend_totalSend=ADF_add_friend_totalSend+1;										
										$('#processed-members').text(ADF_add_friend_totalSend);
										$('#ssa-msgs').text("Requests sent");
										changeProgressBar(ADF_limit,ADF_add_friend_totalSend);
									}else{
										//console.log($(this).find('.qzhwtbm6.knvmm38d:eq(0) a:eq(0)').text());
									}
								}

							}else if(!(ADF_add_friend_totalSend <= ADF_limit-1)) {
								
								ADF_limitExceeded = true;
								ADF_underLimit = false;
								ADF_add_friend_processingStatus = 'limitexceeded';
								ADF_profileDelay = 0;
								chrome.runtime.sendMessage({'action': 'adf-complete'});

								tempTwo = {};
								tempTwo.tabId = 0;
								tempTwo.state = '';
								chrome.storage.local.set({"ADF_State":tempTwo}); 
								adfClearAutomaticIntervals();
								$('#ssa-msgs').text('Limit exceeded..');
								ADF_hide_loader();
							}
						},ADF_profileDelay);

						timeOutIdsArray.push(timeOutIds)

						ADF_profileDelay = (ADF_profileDelay + parseInt(ADF_add_friend_delay));
					});	

					var callAgain = setTimeout(()=>{
						if (ADF_underLimit) {
							$("html, body").animate({ scrollTop: $(document).height() }, 1000);
							setTimeout(()=>{
								ADF_profileDelay = parseInt(ADF_add_friend_delay);		
								AFD_processGroupMembersForNew(ADF_loadedMembers);
							}, 5000)
						}
					},ADF_profileDelay + 5000);							   
					
					timeOutIdsArray.push(callAgain)
				},3000);

				timeOutIdsArray.push(outerTimeOut)

		}else {
			ADF_limitExceeded = true;
			ADF_underLimit = false;
			ADF_add_friend_processingStatus = 'limitexceeded';
			ADF_profileDelay = 0;
			chrome.runtime.sendMessage({'action': 'adf-complete'});

			tempTwo = {};
			tempTwo.tabId = 0;
			tempTwo.state = '';
			chrome.storage.local.set({"ADF_State":tempTwo}); 
			adfClearAutomaticIntervals();
			ADF_add_friend_processingStatus = 'completed';
			$('#ssa-msgs').text("Completed");
			ADF_hide_loader()
		}	
	}
}


function adfClearAutomaticIntervals() {
	if(timeOutIdsArray.length > 0){
		timeOutIdsArray.forEach(function (item) {
			clearInterval(item);
		});
		timeOutIdsArray = [];
	}
}

function ADF_hide_loader(){
	setTimeout(()=>{
		$('#overlay').hide();
	},5000);
}


function changeProgressBar(ADF_total,ADF_sent_requests){
	progressBarVal = (ADF_sent_requests/ADF_total)*100;
	$('.slider__label').css("width", progressBarVal+"%");
}

function addTagAndSendWelcomeMessage(adfMemberId){	

	if (currentADF_groupSettingsObject.isTaggingOn && currentADF_groupSettingsObject.selectedAdfTagIds.length > 0) {
		var clikedNumericFbId = 0;
		var profilePic = ''
		var fbName = '';		
		var page  = 0;
		var selectedAdfTagIdsTemp = currentADF_groupSettingsObject.selectedAdfTagIds;

		chrome.storage.local.get(["taggedUsers"], function(result) {
			
			var temp = result.taggedUsers.filter(function (item) { return (item.fb_user_id == adfMemberId || item.numeric_fb_id == adfMemberId) });
				
			if( temp.length > 0 ){
				var $tagIds=[];
				if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
					$tagIds = temp[0].tag_id.split(',');
				} else {
					if(temp[0].tag_id.length > 0) {
						$tagIds = temp[0].tag_id;
					}
				}	
				
				$tagIds.forEach(function(tagid){
					eachTagIdOne = tagid.replace(/\#/g,'');

					if (selectedAdfTagIdsTemp.indexOf(eachTagIdOne) == -1) {
						console.log(eachTagIdOne);
						selectedAdfTagIdsTemp.push(eachTagIdOne);
					}
				});	
			}

			if($('.adf-processed[data-adf-numeric-fb-id="'+adfMemberId+'"]').find('svg circle').prev().length > 0){
				profilePic = $('.adf-processed[data-adf-numeric-fb-id="'+adfMemberId+'"]').find('svg circle').prev().attr('xlink:href');
			} 
			fbName = $('.adf-processed[data-adf-numeric-fb-id="'+adfMemberId+'"]').find('a:eq(1)').text();

			updateFBUsertagViaADF(JSON.stringify(selectedAdfTagIdsTemp),adfMemberId,clikedNumericFbId,profilePic, fbName,page);

		});
	}
	var mylocation ='';
	if (typeof currentADF_groupSettingsObject.adf_message_texts != '' && currentADF_groupSettingsObject.adf_message_texts.length > 0) {
		if (typeof currentLinkedFbAccountObject != "undefined" && typeof currentLinkedFbAccountObject.location != '' && currentLinkedFbAccountObject.location != null) {
			mylocation= currentLinkedFbAccountObject.location;
		}
		fbName = $('.adf-processed[data-adf-numeric-fb-id="'+adfMemberId+'"]').find('a:eq(1)').text();
		var adf_message_text = currentADF_groupSettingsObject.adf_message_texts[Math.floor(Math.random()*currentADF_groupSettingsObject.adf_message_texts.length)];
		if( adf_message_text != null && adf_message_text != ''){

			var welcomeMessageTextAdf = getADFWelcomeMessage(adf_message_text, fbName,mylocation);
			chrome.runtime.sendMessage({'action': 'sendWelcomeMessageADF',adfMemberId:adfMemberId, welcomeMessageTextAdf:welcomeMessageTextAdf})

		}		
	}

}

function updateFBUsertagViaADF(tagId, fbUserId, numericFbId, profilePic, fbName='',page){
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			port.postMessage({'type': 'updateFBUsertag','data': {tagId:tagId, userId:result.ssa_user.id, isPage:page, loggedInFBId: currentLoggedInFBId, fbUserId: fbUserId,numericFbId:numericFbId, profilePic:profilePic, fbName: fbName}});		
		}
	});
}


// function getADFWelcomeMessage(welcomeMessageTextAdf, fullName,mylocation) {
// 	if (welcomeMessageTextAdf.indexOf('[full_name]') > -1) {
// 		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[full_name]/g,fullName);
// 	}

// 	if (welcomeMessageTextAdf.indexOf('[first_name]') > -1) {
// 		first_name = fullName.split(' ')[0];
// 		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[first_name]/g,first_name);
// 	}

// 	if (welcomeMessageTextAdf.indexOf('[last_name]') > -1) {
// 		nameArray = fullName.split(' ');
// 		if(nameArray.length > 1){
// 			last_name = nameArray[nameArray.length-1];
// 			welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[last_name]/g,last_name);
// 		}else{
// 			welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[last_name]/g,'');
// 		}
// 	}
// 	if (welcomeMessageTextAdf.indexOf('[mylocation]') > -1) {
// 		if(myLocation.includes("|")){
// 			var locations = myLocation.split("|");		
// 			myLocation = locations[Math.floor(Math.random() * locations.length)];	
// 		}	
// 		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[mylocation]/g,mylocation);
// 	}
// 	return welcomeMessageTextAdf;
// }