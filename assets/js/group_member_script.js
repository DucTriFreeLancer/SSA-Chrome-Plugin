var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});

chrome.runtime.sendMessage({setFbIdForAll: "setFbIdForAll"});
CBIngerval = null;
processed_member_request_count = 0;
$(document).ready(function () {
    chrome.storage.local.get(["ssa_group"], function(result) {
		if (typeof result.ssa_group != "undefined" && result.ssa_group != "") {
            doInit();

            onElementHeightChange(document.body, function(){
                doInit();
            });
		    
    
		}
        else{
            toastr.options.timeOut = 0;
            toastr.options.extendedTimeOut = 0;
            toastr["warning"]('Please click SSA to activate');
        }
	});
});
function doInit() {
    let member_request_count = $('div[aria-label="Approve"]').length;

    if (!member_request_count) {
        processed_member_request_count = 0;
        //console.log('waiting because posts are '+posts_count);
        setTimeout(doInit,1500);
        return;
    }
    if (member_request_count > processed_member_request_count) {
        //console.log('attaching events because got some posts ==>' + posts_count);
        console.log("Attached click events");
        if (CBIngerval){
            clearInterval(CBIngerval);
        }
        CBIngerval = setInterval(attachClickEvent, 1000);
        processed_member_request_count = member_request_count;
        toastr.options.timeOut = 0;
        toastr.options.extendedTimeOut = 0;
        toastr["success"]('SSA is Ready');
    }
}
function attachClickEvent() {    
    $('div[aria-label="Approve"]:not(.gm_event_attached)').click(function () {
        var member_request=$(this).parent().parent().parent().parent().parent();
        if(member_request){
            chrome.storage.local.get(["ssa_user", "fb_id","ssa_group"], function (result) {
                if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
                    var fullName = $(member_request).find('span.nc684nl6').first().text();
                    var pathname = $(member_request).find('span.nc684nl6').find("a")[0].getAttribute('href');
                    var clikedFBUserId = false;
                    var lastChar = pathname.substr(pathname.length - 1);
                    if(lastChar =="/"){
                        pathname = pathname.slice(0,-1);
                    }
                    pathname=pathname.substring(pathname.lastIndexOf('/')+1, pathname.length);
                    if (pathname.indexOf('?') > -1) {
                        clikedFBUserId = pathname.split('?')[0];
                    }
                    else
                        clikedFBUserId = pathname;
                    memberApproved = {}; 
                    memberApproved.userId = result.ssa_user.id;
                    memberApproved.fbGroup = result.ssa_group[0].fb_account_name;
                    memberApproved.groupid = result.ssa_group[0].fb_account_id;
                    memberApproved.numeric_fb_id="";
                    memberApproved.fbUserid = clikedFBUserId;
                    memberApproved.name = fullName;
                    memberApproved.location ="";
                    let locations = $(member_request).find("span:contains('Lives in')");
                    if($(locations).length == 1)
                    {
                        memberApproved.location  = $(locations).find('a').text();
                    }
                    memberApproved.answer1 = "";
                    memberApproved.answer2 = "";
                    memberApproved.answer3 = "";
                    memberApproved.invited_by = "";
                    let invited_ele = $(member_request).find("span:contains('Invited by')");
                    if($(invited_ele).length==1){
                        memberApproved.invited_by = $(invited_ele).find('a').text();
                    }
                    let no_anwser = $(member_request).find("span:contains('answered membership questions')");
                    if($(no_anwser).length==0){
                        let anwsers_ele= $(member_request).find('.orn4t191').find("ul li.a8nywdso");
                        $(anwsers_ele).each(function( index ) {
                            switch (index) {
                                case 0:
                                    memberApproved.answer1 = $(this).find('div.aahdfvyu span').text();
                                    break;
                                case 1:
                                    memberApproved.answer2 =  $(this).find('div.aahdfvyu span').text();
                                    break;
                                case 2:
                                    memberApproved.answer3 =  $(this).find('div.aahdfvyu span').text();
                                    break;
                            }
                        });
                    }
                    port.postMessage({'type': 'addUserOnGroupMemberRequest','memberApproved': memberApproved});		

                } else {
                    toastr["warning"]('Please click on SSA icon to to login');
                }
            });
        }
    });
    $('div[aria-label="Approve"]').addClass('gm_event_attached');
    clearInterval(CBIngerval);
}
function onElementHeightChange(elm, callback){
    var lastHeight = elm.clientHeight, newHeight;
    (function run(){
        newHeight = elm.clientHeight;
        if( lastHeight != newHeight )
            callback();
        lastHeight = newHeight;

        if( elm.onElementHeightChangeTimer )
            clearTimeout(elm.onElementHeightChangeTimer);

        elm.onElementHeightChangeTimer = setTimeout(run, 200);
    })();
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.from === 'background' && message.subject === 'add_user'){
        if(message.status =='success'){
            toastr["success"]("The user is added successfully.");
        }
        else{
            toastr["error"]("Something went wrong.");
        }
	}
})
