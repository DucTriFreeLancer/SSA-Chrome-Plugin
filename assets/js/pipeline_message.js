var diff = 5 * 1000;
var start_index = 0;
var active_status = false; // to check if commenting is working or stopped
var scheduled_start = null;
var fb_user_id = null;
var ADG_add_friend_processingStatus = false;
var ADG_add_friend_processing = true;
var ADG_profileDelay = 0;
var ADG_add_friend_delay = 5000; 
var ADG_add_friend_totalSend = 0;
var ADG_add_friend_stopProcess = false;
const post_url = new URL(window.location);
var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});
chrome.storage.local.get("fb_id",function(result){
    if( typeof result.fb_id != "undefined" && result.fb_id != "" ){
        fb_user_id = result.fb_id;
    }
});

$(document).ready(function () {
    //console.log('Document is ready now');
    insertControlsHtml();
    $("#cf_controls").draggable();
    $('.cf_stop_btn').hide();
    $('.cf_start_btn').on('click', function () {
        if(getLetBlast()=="1"){       
           startPipeLine();
        }
    });
    $('.cf_stop_btn').on('click', function () {
        stopPipeLine();
    });
    $('.cf_cancel_btn').on('click', function () {
        cancelPipeLine();
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
    <div class="cf_hint">PipeLine allows us to switch on and off a a process that sends a certain amount of DMs per hour.</div>
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
//#region "For Start Pipe Line"
async function startPipeLine() {
    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    $('.cf_hint').text('PipeLine is running. Please wait...');
    $('.member-name').text('');
	$('#ssa-msgs').text("In progress");
    // start replying to comments
	active_status = true;
	ADG_add_friend_processing = true;
	ADF_add_friend_stopProcess = false;
	ADF_profileDelay = 0;
	ADG_add_friend_processingStatus = 'running';
	await startAction();
}

function stopPipeLine() {
    active_status = false;
    $('#ssa-msgs').text("");
    $('.cf_start_btn').text('Paused... Click to Resume').show();
    $('.cf_stop_btn').hide();
	ADG_add_friend_processing = false;
	ADG_add_friend_processingStatus = 'paused';
	$('.member-name').text('');
	ADG_profileDelay = 0;
}

function cancelPipeLine() {
	$('.member-name').text('');
	ADF_profileDelay = 0;
    $('.cf_overlay').remove();
    $('#cf_controls').remove();
	ADF_add_friend_stopProcess = true;
	ADG_add_friend_processingStatus = 'stopped';
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
var timeOutIdsArray = [];
async function startAction() {
    try{
        if (!active_status) {
            return;
        }
        let resp = await getPipeStatus('facebook');   
        if(resp.error){
            $('#ssa-msgs').html(resp.message);
            $('.member-name').text('').css('text-align','center');
            $('.cf_hint').text('All Done!');
            return;          
        }
        else{
            if(resp.add_friend === "1"){
                let url = new URL(resp.add_fbuserid);
                url.searchParams.set("lets_pipe_user",1);
                url.searchParams.set('addFriend',1);
                url = url.href;
                window.open(url,'currentUserPipe',
                `toolbar=no,
                location=no,
                status=no,
                menubar=no,
                scrollbars=yes,
                resizable=yes,
                width=500px,
                height=500px`);
            }
            $('#ssa-msgs').html(resp.message);
            $('.member-name').text('Sent to '+ resp.fb_name).css('text-align','center');
            await sleep(randomInteger(120,300)*1000);
            await startAction();
        }
    }
    catch{
        closeFbTab();
    }
  
}
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function closeFbTab() {
    chrome.runtime.sendMessage({
        action: ACTIONS.CLOSE_LI_TAB,
        fromTab: 'fbPipe'
    })
}
function getPipeStatus(from) {
    let returnValue = {
        error: true
    }
    return new Promise(function(resolve,reject) {
        chrome.storage.local.get(["ssa_user"], function (result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "") {
                chrome.runtime.sendMessage({
                    action: ACTIONS.GET_PIPE_STATUS,
                    from: from,
                    userId: result.ssa_user.id
                }, function(res) {
                    console.log('Result from get pipe status from back:', res);
                    returnValue = res;
                    resolve(returnValue);
                });
            }
            else{
                returnValue.error = false;
                reject(returnValue);
            }
        })

    })
}
function getLetBlast() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("dopipeline");
}


chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.from === 'background' && message.subject === 'add_member'){
		$('#ssa-msgs').text(message.result);
	}
})
//#endregion
//TODO:// SAVE_SETTINGS,....
