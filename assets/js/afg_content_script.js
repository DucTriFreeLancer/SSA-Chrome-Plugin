var diff = 5 * 1000;
var start_index = 0;
var active_status = false; // to check if commenting is working or stopped
var scheduled_start = null;
var fb_user_id = null;
var tags = null; 
var ADG_limit = null;
var ADG_memberList =  null;
var ADG_memberListSelectorNew =  'div.x1oo3vh0.x1rdy4ex div[data-visualcompletion="ignore-dynamic"]:not(.adf-processed)';
var ADG_limitExceeded = false;
var ADG_add_friend_processingStatus = false;
var ADG_add_friend_processing = true;
var ADG_profileDelay = 0;
var ADG_add_friend_delay = 5000; 
var ADG_add_friend_totalSend = 0;
var ADG_remove_member_delay = 8000; 
var ADG_remove_member_totalSend = 0;
var ADG_underLimit = true;
var ADG_add_friend_stopProcess = false;
const post_url = new URL(window.location);
var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});
chrome.storage.local.get(["fb_id","tags"],function(result){
    if( typeof result.fb_id != "undefined" && result.fb_id != "" ){
        fb_user_id = result.fb_id;
        tags = result.tags.reverse();
    }
});

$(document).ready(function () {
    //console.log('Document is ready now');

    insertControlsHtml();
    $("#cf_controls").draggable();
    $('.cf_stop_btn').hide();
    $('.cf_start_btn').on('click', function () {
        if(isAddExistingMembers()=="1"){       
           startAddExistingMembers();
        }else if(isGroupCleaner()=="1"){
			startRemoveExistingMembers()
		}
    });
    $('.cf_stop_btn').on('click', function () {
        stopTagUsers();
    });
    $('.cf_cancel_btn').on('click', function () {
        cancelAddMembers();
    });
});


function insertControlsHtml() {
    let cont_html =
        `<!--<style>-->
<!--                        #cf_controls{-->
<!--                            position: fixed;-->
<!--                            top: 50px;-->
<!--                            left: 100px;-->
<!--                            background: #eee;-->
<!--                            padding: 10px 15px;-->
<!--                            border-radius: 5px;-->
<!--                            box-shadow: 1px 2px 10px rgba(0,0,0,1);-->
<!--                            width: calc(100vw - 230px);-->
<!--                            z-index: 999;-->
<!--                        }-->
<!--                    </style>-->
<!--                     <div id="cf_controls">-->
<!--                        <div class="header">-->
<!--                            <h3>Comment Blaster Controls</h3>-->
<!--                            <hr>-->
<!--                        </div>-->
<!--                        <div class="body">-->
<!--                            <div class="buttons">-->
<!--                                <button class="cf_btn cf_start_btn">Start</button>-->
<!--                                <button class="cf_btn cf_stop_btn" style="display: none">Stop</button>-->
<!--                                <button class="cf_btn cf_cancel_btn">Cancel</button>-->
<!--                            </div>-->
<!--                            <div><p class="status_string"></p></div>-->
<!--                        </div>-->
<!--                    </div>-->

  <link rel="stylesheet" href="${chrome.extension.getURL("assets/css/cb_main.css")}">
  <div id="cf_controls" class="cf_progressBar">
    <div class="cf_finished">
        <img src="${chrome.extension.getURL("assets/images/welcome.png")}"  style="width:200px"/ >
    </div> 
    <hr style="border-top-color: #ff0000; border-bottom-color: #ff0000;">
    <div class="cf_text">Ready to start? then click "Start" button.</div>`
	option= '<div class="form-group purple-border">'+
    '<label class="col-form-label" for="member_tag">Tag member: </label>' +
    '<select class="form-control" name="member_tag" id="member_tag">';
    option += '<option value=0>Do not tag</option>';
    tags.forEach(function(item) {
        option += '<option value='+item.value+'>' + item.text + '</option>';
    });
    option += '</select> </div>';
    cont_html += option +
	`<div class="text">
		<h2>
		<span id="processed-members">0</span> 
		<span id="subdivision">/</span>
		<span class="total-friends" id="limit" style="font-size: 20px;">0</span>
		</h2>
	</div>
	<div class="block">
		<span id="ssa-msgs"></span>
	</div>
	<div class="sendRequestName" >
		<span class="member-name"></span>
	</div>
    <button class="cf_btn cf_start_btn">Start</button>
    <button class="cf_btn cf_stop_btn">Pause</button>
    <button class="cf_btn cf_cancel_btn">Cancel</button>
  </div>`;

    $(document.body).append(cont_html);
}

//#region "For Add EXisting Members"
async function startRemoveExistingMembers() {
    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    $('.cf_text').text('Group Growth is removing members from group. Please wait...');
    $('.member-name').text('');
	$('#ssa-msgs').text("In progress");
	adgClearAutomaticIntervals();
    // start replying to comments
	ADG_limit=0;
	active_status = true;
	ADG_add_friend_processing = true;
	ADF_add_friend_stopProcess = false;
	ADF_profileDelay = 0;
	ADG_underLimit = true;
	ADG_limitExceeded = false;					
	ADG_add_friend_processingStatus = 'running';
	await startRemoveAction();
}

//#region "For Add EXisting Members"
async function startAddExistingMembers() {
    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    $('.cf_text').text('Group Growth is adding members to group. Please wait...');
    $('.member-name').text('');
	$('#ssa-msgs').text("In progress");
	adgClearAutomaticIntervals();
    // start replying to comments
	active_status = true;
	ADG_add_friend_processing = true;
	ADF_add_friend_stopProcess = false;
	ADF_profileDelay = 0;
	ADG_underLimit = true;
	ADG_limitExceeded = false;					
	ADG_add_friend_processingStatus = 'running';
	await startAction();
}

function stopTagUsers() {
    active_status = false;
    $('.cf_start_btn').text('Paused... Click to Resume').show();
    $('.cf_stop_btn').hide();
	ADG_add_friend_processing = false;
	ADG_add_friend_processingStatus = 'paused';
	$('.member-name').text('');
	ADG_profileDelay = 0;
	adgClearAutomaticIntervals();
}

function cancelAddMembers() {
    adgClearAutomaticIntervals();
	$('.member-name').text('');
	ADF_profileDelay = 0;
    $('.cf_overlay').remove();
    $('#cf_controls').remove();
	ADF_add_friend_stopProcess = true;
	ADG_add_friend_processingStatus = 'stopped';
}


var timeOutIdsArray = [];
async function startAction(history = 0) {
    if (!active_status) {
        return;
    }
    ADG_limit = $('h2.x1heor9g.x1qlqyl8.x1pd3egz.x1a2a7pz.x193iq5w.xeuugli:contains(Members):eq(0)').text().replace(/[^\d]/g, '');
	$('.total-friends').text(ADG_limit);
	$('#text h2').text("Total Members");
	ADF_loadedMembers = $('div.x1oo3vh0.x1rdy4ex div[data-visualcompletion="ignore-dynamic"]').length;
	if(ADF_loadedMembers > history){
		
		var outerTimeOut = setTimeout(function(){		
				
				$(ADG_memberListSelectorNew).each(function(index) {
	
					timeOutIds = setTimeout(()=>{
						if (ADG_add_friend_totalSend <= ADG_limit-1 && ADG_add_friend_processing && !ADF_add_friend_stopProcess) {
							$(this).addClass('adf-processed');
							let name=$(this).find('.xt0psk2 a').text();
							$('.member-name').text('Adding member '+name).css('text-align','center');
							let memberIdTemp = extractProfileId($(this).find('a:eq(0)').attr('href'))
							$(this).attr('data-adf-numeric-fb-id',memberIdTemp);
							let invited_by = "";
							let invited_ele = $(this).find("span:contains('Invited by')");
							if($(invited_ele).length > 0){
								let	spChar = $(invited_ele).text().replace('Invited by','').trim().split(' ');
								invited_by = spChar[0]+ spChar[1];					
							}
							let location= $(this).find('.qzhwtbm6.knvmm38d:last-child').text();
							let tagId = $("#member_tag").val();
							addExistingMembers(memberIdTemp,name,location,invited_by,tagId);

							ADG_add_friend_totalSend=ADG_add_friend_totalSend+1;										
							$('#processed-members').text(ADG_add_friend_totalSend)
							
						}else if(!(ADG_add_friend_totalSend <= ADG_limit-1)) {
							
							ADG_limitExceeded = true;
							ADG_underLimit = false;
							ADG_add_friend_processingStatus = 'limitexceeded';
							ADG_profileDelay = 0;
							$('#ssa-msgs').text('Limit exceeded..');
							$('.member-name').text('');
							adgClearAutomaticIntervals();
						}
					},ADG_profileDelay);

					timeOutIdsArray.push(timeOutIds)

					ADG_profileDelay = (ADG_profileDelay + parseInt(ADG_add_friend_delay));
				});	
				var callAgain = setTimeout(()=>{
					if (ADG_underLimit) {
						$("html, body").animate({ scrollTop: $(document).height() }, 1000);
						setTimeout(()=>{
							ADG_profileDelay = parseInt(ADG_add_friend_delay);		
							startAction(ADF_loadedMembers);
						}, 5000)
					}
				},ADG_profileDelay + 5000);							   
				
				timeOutIdsArray.push(callAgain)
			},3000);

			timeOutIdsArray.push(outerTimeOut)

	}else {
		ADG_limitExceeded = true;
		ADG_underLimit = false;
		ADG_add_friend_processingStatus = 'limitexceeded';
		ADG_profileDelay = 0;
		adgClearAutomaticIntervals();
		$('#ssa-msgs').text("Completed");
		ADG_add_friend_processingStatus = 'completed';
	}	
}
const waitFor = (callback) => new Promise(resolve => {
	let waitTimes = 0;
	let interval = setInterval(() => {
		if (callback() === true || waitTimes == 5) {
			resolve();
			clearInterval(interval);
		}
		else{
			waitTimes += 1;
		}
	}, 1000);
});
async function startRemoveAction(history = 0) {
    if (!active_status) {
        return;
    }
	await getMembersInGroup();
	await waitFor(() => ADG_limit!=null && ADG_limit>0);
	$('.total-friends').text(ADG_limit);
	$('#text h2').text("Total Members");
	if(ADG_limit>0){
		var outerTimeOut = setTimeout(function(){		
				
				$(ADG_memberList).each(function(index) {
	
					timeOutIds = setTimeout(()=>{
						if (ADG_remove_member_totalSend<= ADG_limit-1 && ADG_add_friend_processing && !ADF_add_friend_stopProcess) {
							let numericIdTemp = this.numeric_fb_id;
							let name = this.fb_name
							let tagId = $("#member_tag").val();
							checkMembersIn90days(numericIdTemp,name,tagId);
							ADG_remove_member_totalSend=ADG_remove_member_totalSend+1;										
							$('#processed-members').text(ADG_remove_member_totalSend);

						}else if(!(ADG_remove_member_totalSend <= ADG_limit-1)) {
							
							ADG_limitExceeded = true;
							ADG_underLimit = false;
							ADG_add_friend_processingStatus = 'limitexceeded';
							ADG_profileDelay = 0;
							tempTwo = {};
							tempTwo.tabId = 0;
							tempTwo.state = '';
							chrome.storage.local.set({"AFG_State":tempTwo});	
							$('#ssa-msgs').text('Limit exceeded..');
							$('.member-name').text('');
							adgClearAutomaticIntervals();
						}
					},ADG_profileDelay);

					timeOutIdsArray.push(timeOutIds)

					ADG_profileDelay = (ADG_profileDelay + parseInt(ADG_remove_member_delay));
				});		
				var callAgain = setTimeout(()=>{
					if (ADG_underLimit) {
						setTimeout(()=>{
							ADG_profileDelay = parseInt(ADG_remove_member_delay);		
							startRemoveAction();
						}, 5000)
					}
				},ADG_profileDelay + 5000);							   
				
				timeOutIdsArray.push(callAgain)		
			},3000);

			timeOutIdsArray.push(outerTimeOut)

	}else {
		ADG_limitExceeded = true;
		ADG_underLimit = false;
		ADG_add_friend_processingStatus = 'limitexceeded';
		ADG_profileDelay = 0;
		tempTwo = {};
		tempTwo.tabId = 0;
		tempTwo.state = '';
		chrome.storage.local.set({"AFG_State":tempTwo});
		adgClearAutomaticIntervals();
		$('#ssa-msgs').text("Completed");
		ADG_add_friend_processingStatus = 'completed';
	}	
}
async function getMembersInGroup(){
	chrome.storage.local.get(["ssa_user", "fb_id","ssa_group"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
			memberApproved = {}; 
			memberApproved.userId = result.ssa_user.id;
			memberApproved.fbGroup = result.ssa_group[0].fb_account_name;
			memberApproved.groupid = result.ssa_group[0].fb_account_id;
			memberApproved.tagId = $("#member_tag").val();
			port.postMessage({'type': 'getExistingMemberOnGroupMember','memberApproved': memberApproved});		
		} 
		else {
			toastr["warning"]('Please click on SSA icon to to login');
			return;
		}
	});
}
function isAddExistingMembers() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("existingmember");
}

function isGroupCleaner() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("removemember");
}

function adgClearAutomaticIntervals() {
	if(timeOutIdsArray.length > 0){
		timeOutIdsArray.forEach(function (item) {
			clearInterval(item);
		});
		timeOutIdsArray = [];
	}
}

function extractProfileId(profileUrl=''){
	temp = '';
	tempProfileIdNewFB = $.trim(profileUrl);
	if (tempProfileIdNewFB.indexOf('/user/')>-1) {
		temp = tempProfileIdNewFB.split('/user/')[1];
		temp = temp.replace('/','');
	}else if(tempProfileIdNewFB.indexOf('profile.php?id=') > -1){
		temp = tempProfileIdNewFB.split('profile.php?id=')[1];
	}else{
		tempArray = $.trim(profileUrl).split('/');
	    temp = tempArray[tempArray.length-1];
	}
	return temp;
}

function addExistingMembers(clikedFBUserId,fullName,location,invited_by,tagId){
	chrome.storage.local.get(["ssa_user", "fb_id","ssa_group"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
			memberApproved = {}; 
			memberApproved.userId = result.ssa_user.id;
			memberApproved.fbGroup = result.ssa_group[0].fb_account_name;
			memberApproved.groupid = result.ssa_group[0].fb_account_id;
			memberApproved.numeric_fb_id= "";
			memberApproved.fbUserid = clikedFBUserId;
			memberApproved.name = fullName;
			memberApproved.location = location;
			memberApproved.answer1 = "";
			memberApproved.answer2 = "";
			memberApproved.answer3 = "";
			memberApproved.invited_by = invited_by;
			memberApproved.tagId = tagId;
			port.postMessage({'type': 'addExistingMemberOnGroupMember','memberApproved': memberApproved});		
		} 
		else {
			toastr["warning"]('Please click on SSA icon to to login');
			return;
		}
	});
}
function checkMembersIn90days(memberIdTemp,name,tagId){
	chrome.storage.local.get(["ssa_user", "fb_id","ssa_group"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
			let url =new URL("https://www.facebook.com/groups/"+result.ssa_group[0].fb_account_id+"/user/"+memberIdTemp);
			url.searchParams.set("lets_remove_user",1);
			url.searchParams.set("numeric_fb_id",memberIdTemp);
			url.searchParams.set("fb_name",name);
			url.searchParams.set("group_id",result.ssa_group[0].fb_account_id);
			url.searchParams.set("tagId",tagId);
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
		else {
			toastr["warning"]('Please click on SSA icon to to login');
			reject(false);
			return;
		}
	});
		
}
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.from === 'background' && message.subject === 'add_member'){
		$('#ssa-msgs').text(message.result);
	}
	if(message.from === 'background' && message.subject === 'get_member'){
		ADG_limit = message.result.length;
		ADG_memberList = message.result;
	}
	if (message.from === 'background' && message.subject == "remove_member") {
		$('#ssa-msgs').text(message.result);
	}
})
//#endregion
//TODO:// SAVE_SETTINGS,....
