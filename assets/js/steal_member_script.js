var diff = 5 * 1000;
var start_index = 0;
var active_status = false; // to check if commenting is working or stopped
var scheduled_start = null;
var ssa_user = null;
var messagetypes = null; 
var ADG_memberListSelectorNew =  'div.obtkqiv7 div[data-visualcompletion="ignore-dynamic"]:not(.adf-processed)';
var ADG_limitExceeded = false;
var ADG_add_friend_processingStatus = false;
var ADG_add_friend_processing = true;
var ADG_profileDelay = 0;
var ADG_add_friend_delay = 5000; 
var ADG_add_friend_totalSend = 0;
var ADG_underLimit = true;
var ADG_add_friend_stopProcess = false;
var group_id =false;
var group_name=false;
const post_url = new URL(window.location);
var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});
chrome.storage.local.get("ssa_user",function(result){
	if (typeof result.ssa_user != "undefined" && result.ssa_user != "") {
        ssa_user = result.ssa_user;
		messagetypes = result.messagetypes;
    }
});

$(document).ready(function () {
    //console.log('Document is ready now');
    group_id = post_url.pathname.split('/')[2];
    group_name = document.title.replace(/ *\([^)]*\) */g, "");
	if(group_name.lastIndexOf('|')>-1){
		group_name = group_name.substring(0, group_name.lastIndexOf('|'));
	}
    insertControlsHtml();
    $("#cf_controls").draggable();
    $('.cf_stop_btn').hide();
    $('.cf_start_btn').on('click', function () {
        if(getLetBlast()=="1"){       
           startAddExistingMembers();
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
  <div id="cf_controls" class="cf_progressBar" style="width: 45%;height:400px;margin-left: 25%;height: 520px;top:10%;  ">
    <div class="cf_finished">
        <img src="${chrome.extension.getURL("assets/images/welcome.png")}"  style="width:200px"/ >
    </div> 
    <hr style="border-top-color: #ff0000; border-bottom-color: #ff0000;">
    <div class="cf_hint" style="margin-top: 5px;">Tweak your pipeline messages before you steal members</div>
	<div class="form-group purple-border">
		<label for="msg1">Pipeline Message 1:</label>
		<textarea class="form-control" id="msg1" placeholder="input message 1">${ssa_user.pipeline_message1}</textarea>
	</div>
	<div class="form-group purple-border">
		<label for="msg2">Pipeline Message 2:</label>
		<textarea class="form-control" id="msg2" placeholder="input message 2">${ssa_user.pipeline_message2}</textarea>
	</div>
	<div class="form-group purple-border">
		<label for="msg3">Pipeline Message 3:</label>
		<textarea class="form-control" id="msg3" placeholder="input message 3">${ssa_user.pipeline_message3}</textarea>
	</div>
	<div class="form-group purple-border">
		<label for="message_type">Label :</label>
		<input type="text" id="message_type" value="${group_name}">
	</div>
	<div class="text">
		<h2>
		<span id="processed-members" style="font-size: 40px !important;">0</span> 
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
async function startAddExistingMembers() {
    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    $('.cf_hint').text('Group Growth is stealing members from group to your message pipeline. Please wait...');
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
    ADF_limit = $('h2.gmql0nx0.l94mrbxd span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7:contains(Members):eq(0)').text().replace(/[^\d]/g, '');
	$('.total-friends').text(ADF_limit);
	$('#text h2').text("Total Members");
	ADF_loadedMembers = $('div.obtkqiv7 div[data-visualcompletion="ignore-dynamic"]').length;
	if(ADF_loadedMembers > history){
		
		var outerTimeOut = setTimeout(function(){		
				
				$(ADG_memberListSelectorNew).each(function(index) {
	
					timeOutIds = setTimeout(()=>{
						if (ADG_add_friend_totalSend <= ADF_limit-1 && ADG_add_friend_processing && !ADF_add_friend_stopProcess) {
							$(this).addClass('adf-processed');
							let name=$(this).find('.qzhwtbm6.knvmm38d:eq(0) a:eq(0)').text();
							$('.member-name').text('Adding member '+name).css('text-align','center');
							let memberIdTemp = extractProfileId($(this).find('a:eq(0)').attr('href'))
							$(this).attr('data-adf-numeric-fb-id',memberIdTemp);
							let location= $(this).find('.qzhwtbm6.knvmm38d:last-child').text();
							stealMemberFromGroup(memberIdTemp,name,location);

							ADG_add_friend_totalSend=ADG_add_friend_totalSend+1;										
							$('#processed-members').text(ADG_add_friend_totalSend);

						}else if(!(ADG_add_friend_totalSend <= ADF_limit-1)) {
							
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

function getLetBlast() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("stealmembers");
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

function stealMemberFromGroup(clikedFBUserId,fullName,location){
	chrome.storage.local.get(["ssa_user", "fb_id","ssa_group"], function (result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
            memberApproved = {}; 
			memberApproved.userId = result.ssa_user.id;
			memberApproved.fbGroup = group_name;
			memberApproved.groupid = group_id;
			memberApproved.numeric_fb_id= "";
			memberApproved.fbUserid = clikedFBUserId;
			memberApproved.name = fullName;
			memberApproved.location = location;
			memberApproved.pipeline_message1= $("#msg1").val();
			memberApproved.pipeline_message2=$("#msg2").val();
			memberApproved.pipeline_message3=$("#msg3").val();
			memberApproved.message_type=$("#message_type").val();
			port.postMessage({'type': 'stealMemberFromGroup','memberApproved': memberApproved});		
		} 
		else {
			toastr["warning"]('Please click on SSA icon to to login');
			return;
		}
	});
}
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.from === 'background' && message.subject === 'add_member'){
		$('#ssa-msgs').text(message.result);
	}
})
//#endregion
//TODO:// SAVE_SETTINGS,....
