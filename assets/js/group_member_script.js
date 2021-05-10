var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});

chrome.runtime.sendMessage({setFbIdForAll: "setFbIdForAll"});
CBIngerval = null;
$(document).ready(function () {
    chrome.storage.local.get(["ssa_group"], function(result) {
		if (typeof result.ssa_group != "undefined" && result.ssa_group != "") {
		    if (CBIngerval){
                clearInterval(CBIngerval);
            }
            CBIngerval = setInterval(attachClickEvent, 1000);
    
		}
        else{
            toastr["warning"]('Please click on SSA icon to check group');
        }
	});
});
function attachClickEvent() {    
    $('div[aria-label="Approve"]').click(function () {
        var member_request=$(this).parent().parent().parent().parent().parent();
        if(member_request){
            chrome.storage.local.get(["ssa_user", "fb_id","ssa_group"], function (result) {
                if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != "") {
                    var fullName = $(member_request).find('span.nc684nl6').first().text();
                    var pathname = $(member_request).find('span.nc684nl6').find("a")[0].getAttribute('href');
                    var clikedFBUserId = false;
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
    clearInterval(CBIngerval);
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
