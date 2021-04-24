//add_comment_link_placeholder
console.log('comments_script.js Loaded');
//alert('sdf 2');

const comments_container_selector = '._333v._45kb';
const comment_selector = '._2a_i';
const post_url = new URL(window.location);

var diff = 10 * 1000;
var reply_btns = [];
var reply_btns_count = 0;
var people_like = [];
var people_like_count = [];
var sleep_after = 15; // sleep after replying sleep_after comments and wait for sleep_for seconds and start again
var sleep_for = 1* 60 * 1000 ; //
var active_status = false; // to check if commenting is working or stopped
var offer_link = '';
var seconds = 0 ;
var max_reply = 0;
var replys = [];
var reply_filters = [];
var scheduled_start = null;

chrome.storage.sync.get(null, items => {
    console.log('items', items);

    offer_link = items.offer_link;
    sleep_after = eval(items.sleep_after);
    sleep_for = eval(items.sleep_for) * 60 * 1000;
    seconds = eval(items.seconds) * 1000;
    max_reply = eval(items.max_reply);
    replys = items.replys;
    reply_filters = items.reply_filters;
	react_comment = items.react_comment;
    post_type = items.post_type;
    //makeReply(items)
});


$(document).ready(function () {
    //console.log('Document is ready now');

    insertControlsHtml();
    $("#cf_controls").draggable();
    $('.cf_stop_btn').hide();
    $('.cf_start_btn').on('click', function () {
        if(getLetBlast()=="0" && getLetBlastForLike()!= null){            
            startLikes();
        }
        else        
            startComments();
    });
    $('.cf_stop_btn').on('click', function () {
        stopComments();
    });
    $('.cf_cancel_btn').on('click', function () {
        cancelComments();
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
    <div class="cf_text">Ready to start? then click "Start" button.</div>
    <div class="cf_progressInfo">
      <span class="cf_done status_string">0 of 0 Done!</span> 
    </div> 
    <button class="cf_btn cf_start_btn">Start</button>
    <button class="cf_btn cf_stop_btn">Pause</button>
    <button class="cf_btn cf_cancel_btn">Cancel</button>
  </div>`;

    $(document.body).append(cont_html);
}
function startLikes() {
    console.log('startLikes called');

    //clear timeout in case we have set one
    clearTimeout(scheduled_start);

    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    $('.cf_text').text('Lead Sniper is replying to comments. Please wait...');
    people_like=getPeopleLike();
    all_people_likes = getPeopleLike(true);
    
    //console.log('reply_btns', reply_btns);
    //console.log('all_reply_btns', all_reply_btns);
    if (!people_like.length) {
        // click load more if we have
        loadMoreLikes();
    }
    people_like_count = all_people_likes.length;

    // start replying to likers
    if (people_like_count) {
        active_status = true;
        startAction();
    }else{
        active_status = false;
    }
}
function startComments() {
    console.log('startComments called');

    //clear timeout in case we have set one
    clearTimeout(scheduled_start);

    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    if(getLetBlast() =="1"){
        $('.cf_text').text('Comment Blaster is replying to comments. Please wait...');
    }
    else{
        $('.cf_text').text('Lead Sniper is replying to comments. Please wait...');
    }
    reply_btns = getReplyButtons();
    all_reply_btns = getReplyButtons(true);
    //console.log('reply_btns', reply_btns);
    //console.log('all_reply_btns', all_reply_btns);
    if (!reply_btns.length) {
        // click load more if we have
        loadMoreComments();
    }
    reply_btns_count = all_reply_btns.length;

    // start replying to comments
    if (reply_btns_count) {
        active_status = true;
        startAction();
    }else{
        active_status = false;
    }
}

function stopComments() {
    console.log('stopComments called');

    //clear timeout in case we have set one
    clearTimeout(scheduled_start);

    active_status = false;
    $('.cf_start_btn').text('Paused... Click to Resume').show();
    $('.cf_stop_btn').hide();
}

function cancelComments() {
    //console.log('cancelComments called');

    stopComments();
    clearTimeout(scheduled_start);
    $('.cf_overlay').remove();
    $('#cf_controls').remove();

}
function updateStatusStringLikes(newLen) {
    let status_string = '';
    let main_text = '';
    let comment_type = getLetBlast()=="1"? "Comment Blaster" :"Lead Sniper";
    if (newLen === 0) {
        stopComments();
        main_text = `${comment_type} replied to all comments`;
        status_string = "All Done!";
    } else {
        main_text = `${comment_type} is replying to comments. Please wait...`;
        //status_string = (reply_btns_count - newLen) + " of " + reply_btns_count + " Done!";
        status_string = (people_like_count - newLen) + " of " + getMaxLikes() + " Done!";
    }

    $('#cf_controls .status_string').text(status_string);
    $('.cf_text').text(main_text);

}
function updateStatusString(newLen) {
    let status_string = '';
    let main_text = '';
    let comment_type = getLetBlast()=="1"? "Comment Blaster" :"Lead Sniper";
    if (newLen === 0) {
        stopComments();
        main_text = `${comment_type} replied to all comments`;
        status_string = "All Done!";
    } else {
        main_text = `${comment_type} is replying to comments. Please wait...`;
        //status_string = (reply_btns_count - newLen) + " of " + reply_btns_count + " Done!";
        status_string = (reply_btns_count - newLen) + " of " + getMaxReplies() + " Done!";
    }

    $('#cf_controls .status_string').text(status_string);
    $('.cf_text').text(main_text);

}
function getMaxLikes() {
    if (people_like_count > max_reply) {
        return max_reply
    }
    return people_like_count;
}
function getMaxReplies() {
    if (reply_btns_count > max_reply) {
        return max_reply
    }
    return reply_btns_count;
}
function getPeopleLike(all=false){
    let likes = [];
    if (all){
        let all_action_btns = $("#reaction_profile_browser").find("div.item._cs2.acw");
        all_action_btns.each(function (ev) {
            likes.push(this);
        });
        return btns;
    }
   
	let all_action_btns = $("#reaction_profile_browser").find("div.item._cs2.acw:not(.gone_through)"); // Like,Comment and More buttons of all comments
    
	all_action_btns.each(function (ev) {
        likes.push(this);
    });
    return btns;
    
}
function getReplyButtons(all = false) {
    //console.log('getReplyButtons called');

    let btns = [];
    // $('#add_comment_link_placeholder').parent().find('._333v._45kb')
    if (all){
        let all_action_btns = $(comments_container_selector + '>' + comment_selector + '>._2b04>div[data-sigil="ufi-inline-comment-actions"]>a'); // Like,Comment and More buttons of all comments
        all_action_btns.each(function (ev) {
            let filter = filterQuestion(this);
            let replied = alreadyReplied(this);
            if ($(this).text() == 'Reply' && filter && !replied) {
                btns.push(this);
            }else{
                $(this).addClass('gone_through')
            }
        });
        return btns;
    }
   
	let all_action_btns = $(comments_container_selector + '>' + comment_selector + '>._2b04>div[data-sigil="ufi-inline-comment-actions"]>a:not(.gone_through)'); // Like,Comment and More buttons of all comments
    
	all_action_btns.each(function (ev) {

        let filter = filterQuestion(this);
        let replied = alreadyReplied(this);
        if ($(this).text() == 'Reply' && filter && !replied) {
            btns.push(this);
        } else if(!filter){
            $(this).addClass('gone_through')
        }
    });
    return btns;
}

function startAction() {
    //console.log('startAction called');

    let reply_btn = reply_btns[0];

    if (!reply_btns.length) {
        //console.log('All done');
        active_status = false;
        return;
    }
    if (!active_status) {

        //console.log('Stopped');
        return;
    }
    //Filter comments
    //let filtered = filterQuestion(reply_btn);
    //if (filtered){
        loadReplyForm(reply_btn).then((form) => {
            //reply_btns.shift();
            //console.log('Got Form', form);
			let timeBetweenComments = 10000; //Seconds * 1000
			setTimeout(function(){
                let all_action_btns = $(comments_container_selector + '>' + comment_selector + '>._2b04>div[data-sigil="ufi-inline-comment-actions"]>a:not(.gone_through)'); // Like,Comment and More buttons of all comments
                var logid = all_action_btns.parents("._2b04").parents("._2a_i").find("._2a_j").attr("data-sigil");
                if(all_action_btns.parents("._2b04").find("._2a_m").html().search(logid) > -1) { 
                    setTimeout(function () {
                        let remembered_btn = reply_btns.shift();
                        $(remembered_btn).addClass('gone_through');
                        startAction(); //

                    }, randomBetween(seconds - diff, seconds + diff));
                } else{
                    postReply(form);
                }
            },timeBetweenComments);
           
        })
  //  }
}

function filterQuestion(reply_btn) {
    //console.log('filterQuestion called', reply_btn);
    if(!reply_filters || !reply_filters.length){
        return true;
    }
    let comment_text = $(reply_btn).closest(comment_selector).find('[data-sigil="comment-body"]').text().trim().toLowerCase();
    let pass_filter = false;
   // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
   // console.log('Comment Text is >>'+comment_text);

    reply_filters.forEach(function (value, index) {
       // console.log("Reply Filter #"+index, value);

        let filter_text = value.trim().toLowerCase();
      //  console.log('Filter Text is >>'+filter_text);
      //  console.log('Reply Filter Index', comment_text.indexOf(filter_text));

        if (comment_text.indexOf(filter_text) > -1 && !pass_filter){
            pass_filter = true;
            //$(reply_btn).closest(comment_selector).css({'background':'yellow'})
        }
    });

    return pass_filter;
}
function alreadyReplied(reply_btn) {
   // console.log('alreadyReplied called', reply_btn);

    let reply_see_text = $(reply_btn).closest(comment_selector).find('[data-sigil="replies-see-more"]');//
    let already_replied = false;

    if (reply_see_text.length && reply_see_text.text().trim().toLowerCase().indexOf('you replied') > -1){
        //$(reply_btn).closest(comment_selector).css({'background':'green'});
        already_replied = true
    }

    return already_replied;
}

function getLoadMoreButton(like) {
   // console.log('getLoadMoreButton called');
    if(like =="Like"){
        let see_more_like= $('.title.mfsm.fcl')
        if(see_more_like.length){
            return see_more_like;
        }
    }
    else
    {
        let btn_prev_id = 'see_prev_' + getFbStoryId();
        let see_prev_btn = $('#' + btn_prev_id + '>a');
        if (see_prev_btn.length){
            return see_prev_btn;
        }
        let btn_next_id = 'see_next_' + getFbStoryId();
        return $('#' + btn_next_id + '>a');
    }
}
async function loadMoreLikesBtns(load_btn) {
    //console.log('loadMoreComments called', load_btn);

    load_btn.get(0).click();

    return new Promise(function (resolve, reject) {
        let count = 0;
        let interval = setInterval(function () {

            people_like = getPeopleLike();

			//5e7k3t start
			loadMoreLikes();
			//5e7k3t end
			
            if (people_like.length) {
                //reply_btns_count = rep_btns.length;

                //console.log('reply_btns', rep_btns);
                resolve(people_like);
                clearInterval(interval);
            }
            if (count > 60) {
               // console.log('something web wrong ');
                reject('could not load more like');
                clearInterval(interval);
                // try Again
                loadMoreLikes()
            }
            count++
        }, 500);
    });

}

async function loadMoreReplyBtns(load_btn) {
    //console.log('loadMoreComments called', load_btn);

    load_btn.get(0).click();

    return new Promise(function (resolve, reject) {
        let count = 0;
        let interval = setInterval(function () {

            rep_btns = getReplyButtons();

			//5e7k3t start
			loadMoreComments();
			//5e7k3t end
			
            if (rep_btns.length) {
                //reply_btns_count = rep_btns.length;

                //console.log('reply_btns', rep_btns);
                resolve(rep_btns);
                clearInterval(interval);
            }
            if (count > 60) {
               // console.log('something web wrong ');
                reject('could not load more comments');
                clearInterval(interval);
                // try Again
                loadMoreComments()
            }
            count++
        }, 500);
    });

}

function getPostId() {
  //  console.log('getPostId called');
    return post_url.searchParams.get("id");
}

function getLetBlast() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("lets_blast");
}
function getLetBlastForLike() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("ft_ent_identifier");
}
function getFbStoryId() {
    //console.log('getFbStoryId called');

    if (post_url.href.indexOf('/groups/') > -1) {
        return getPostId();
    }
    return post_url.searchParams.get("story_fbid");
}

function getCommentFromReplyButton(btn) {
   // console.log('getCommentFromReplyButton called');

    return $(btn).closest(comment_selector);
}

function rememberComment() {
    //console.log('rememberComment called');

    let remembered_btn = reply_btns.shift();
    $(remembered_btn).addClass('gone_through');

    //console.log('reply_btns popped', reply_btns);
    //console.log('remembered_btn', remembered_btn);

    if (reply_btns.length) {
        updateStatusString(reply_btns.length); 
        // stop comments if react MAX_Reply
        if (reply_btns_count - reply_btns.length >= max_reply){
            console.log('stop reached max',max_reply);

            stopComments();
        }

        // sleep for sleep_for seconds and start again
        if (reply_btns_count - reply_btns.length >= sleep_after){
            sleep_after = sleep_after + sleep_after;
            console.log('sleep for',sleep_for);
            stopComments();
            scheduleStart();
        }

    }else {
        // click load more if we have
        loadMoreComments();
    }

    // run again if we still have comments
    if (reply_btns.length && active_status) {
        setTimeout(function () {

            startAction(); //

        }, randomBetween(seconds - diff, seconds + diff));
    }
}
function scheduleStart() {
    console.log('scheduled for ',sleep_for);
    //$('.cf_stop_btn').text('Paused');
    // chrome.alarms.create('start_again', {
    //     delayInMinutes: 0.1, periodInMinutes: 0.1});

    //clear timeout in case we already have set one
    clearTimeout(scheduled_start);

    scheduled_start = setTimeout(function () {
        //$('.cf_stop_btn').text('Stop');
        if(getLetBlast()=="0" && getLetBlastForLike()!= null)
        {
            startLikes();
        }
        else
            startComments();
    }, sleep_for)
}
function loadMoreLikes() {
    //console.log('loadMoreComments called');
    let load_more_btn = getLoadMoreButton("Like");
    if (load_more_btn.length) {
        loadMoreLikesBtns(load_more_btn).then((res) => {
            //console.log(' Loaded more comments');
          //  console.log(' got new reps ', reply_btns);
            // console.log('reply_btns_count ', reply_btns_count);

          //  reply_btns = getReplyButtons();
            //reply_btns_count += reply_btns.length;
            active_status = true;
            setTimeout(function () {

                startLikes(); //

            }, randomBetween(seconds + diff, seconds - diff));

        });
    }else{
        active_status = false
        updateStatusStringLikes(0);
    }
}
function loadMoreComments() {
    //console.log('loadMoreComments called');
    let load_more_btn = getLoadMoreButton();
    if (load_more_btn.length) {
        loadMoreReplyBtns(load_more_btn).then((res) => {
            //console.log(' Loaded more comments');
          //  console.log(' got new reps ', reply_btns);
            // console.log('reply_btns_count ', reply_btns_count);

          //  reply_btns = getReplyButtons();
            //reply_btns_count += reply_btns.length;
            active_status = true;
            setTimeout(function () {

                startComments(); //

            }, randomBetween(seconds + diff, seconds - diff));

        });
    }else{
        active_status = false
        updateStatusString(0);
    }
}
function getRememberedComments() {
    //console.log('getRememberedComments called');
}

function findRememberedComment() {
    //console.log('findRememberedComment called');
}

function getCommenterId(comment) {
    ////console.log('getCommenterId called');

    // feed_story_ring100014369911062
    let elm = comment.find('div[data-sigil^="feed_story_ring"]');
    let c_id = elm.attr('data-sigil').replace('feed_story_ring', '');

    return c_id;
}

function getCommenterName(comment) {
    ////console.log('getCommenterName called');

    return comment.find('._2b05>a').first().text();
}
function getCommenterFbId(comment) {
    ////console.log('getCommenterFbId called');
    var pathname = comment.find('._2b05>a')[0].href;
    var clikedFBUserId = false;
    if (pathname.indexOf('profile.php') > -1) {
        clikedFBUserId =(new URL(pathname)).searchParams.get('id');

    }else {
        pathname=pathname.substring(pathname.lastIndexOf('/')+1, pathname.length);
        if (pathname.indexOf('?') > -1) {
            clikedFBUserId = pathname.split('?')[0];
        }
    }
    return clikedFBUserId;
}

function getTagString(comment) {
    //console.log('getTagString called', comment);

    return "@[" + getCommenterId(comment).trim() + ":" + getCommenterName(comment).trim() + "]";
}

async function loadReplyForm(btn) {
    console.log('loadReplyForm called', btn);
   // btn.style.background = '#0ff';
   btn.click();

    return new Promise(function (resolve, reject) {
        let count = 0;
        let interval = setInterval(function () {
            let cmnt = getCommentFromReplyButton(btn);
            //console.log('comment', cmnt);
            let reply_form = cmnt.find('form[id^="comment_form_"]');

            if (reply_form.length) {
                //console.log('reply_form', reply_form);
                resolve(reply_form);
                clearInterval(interval);
            }
            if (count > 120) {
                //console.log('something web wrong ');
                clearInterval(interval);
            }
            count++
        }, 500);
    });

}

async function postReply(form) {
    let submit_btn = form.find('button[type="submit"]');
    let textarea = form.find('textarea.mentions-input');
    let input = form.find('input[name="comment_text"]');
    let comment = form.closest(comment_selector);
	let like = form.parents("._2b04").find("a._2b0a:eq(0)");
	
	var style =like.attr("style");
	//console.log('postReply called', form);
    let urlpath = form.closest('._2a_i._2a_l').find('._2b05').find('a')[0].getAttribute('href');
    console.log(urlpath);
    let addFriend = false;
    let messages = [];
    let dm_new_contact=false; 
    let sendMessages=false; 
    chrome.storage.local.get('addPeopleToFriends',function(res1){
        addFriend=res1.addPeopleToFriends;
        chrome.storage.local.get(["cb_custom_dms","cb_custom_dms_new_contact"],function(res2){
            messages = res2.cb_custom_dms;
            dm_new_contact= res2.cb_custom_dms_new_contact;
            if(messages!=undefined && messages.length>0){
                sendMessages= true;
                //For lead sniper only dm people if we have not liked the comment
                if(getLetBlast() == "0" && like.text() == "Like" && style != undefined){
                    sendMessages = false;
                }
            }
            
            if(addFriend || (messages!=null && messages!=undefined && messages.length>0)){
                let url = new URL("https://m.facebook.com"+urlpath);
                url.searchParams.set("lets_blast_user",1);
                url.searchParams.set('addFriend',addFriend?1:0);
                url.searchParams.set('sendMessages',sendMessages?1:0);
                url.searchParams.set('dm_new_contact',dm_new_contact?1:0);
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


        })
    })
	if(like.text() == "Like" && style == undefined) {
		like.get(0).click();
	}

    if(getLetBlast() == "1"){
        let reply_content = await makeReply(form, comment);

        submit_btn.removeAttr('disabled'); // enable button
        //textarea.val(reply_content);
        if(reply_content!=null){
            input.val(reply_content);

            submit_btn.click();
            //submit_btn.css({'background': 'red'});
        }
    }

    //rememberComment
    rememberComment(comment);
    //tag people
    let cb_tag_people ="";
    let $checkedTags = [];
    let $checkedUsersForMessenger = []; 
    chrome.storage.local.get(["ssa_user","fb_id","cb_tag_people"],function(result){        
        if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
            cb_tag_people= result.cb_tag_people;
            if( cb_tag_people!=undefined && cb_tag_people!=null && cb_tag_people !=""){
                $checkedTags.push(cb_tag_people);               
                var fbName = getCommenterName(comment); 
                var fbUserId = getCommenterFbId(comment)               
                tempUser = {}; 
                tempUser.fb_user_id = fbUserId;
                tempUser.numeric_fb_id="";
                tempUser.profilePic = "";
                tempUser.fbName = fbName;
                $checkedUsersForMessenger.push(tempUser);  
                console.log("update fb user tag");              
                port.postMessage({'type': 'updateFBUsertagForMultiUserOnGroupMember','data': {userId:result.ssa_user.id,loggedInFBId: result.fb_id, tagsArray:$checkedTags, checkedUsers: $checkedUsersForMessenger}});
            }
        }
      
    })
}

/*function makeReply(form, comment) {
    //console.log('makeReply called');
	return new Promise(async (resolve, reject) =>{
		var firstName = lastName = reply = '' ;
		//let reply = replys[Math.floor(Math.random() * replys.length)];
		let name = getTagString(comment);
		    var userUrl = getCommenterUrl(comment);
			var clean_uri = userUrl.substring(0, userUrl.indexOf("?"));
		
			var url ="https://m.facebook.com"+clean_uri+"/about";
			 
			var rep = await $.get(url).then((data) => {
			var html = $('#basic-info', data).html();
			$(html).find('._5cdu').each(function(index,item){
				if($(item).find('._52jg').text() == "Gender"){
					var gender = $(item).find('._5cdv.r').text();
					if(gender == "Male"){
						for (var i = 0; i < replys.length; i++) {
							if (replys[i].indexOf("{f-") != -1) {
								console.log(replys[i]);
								replys.splice(i, 1);
							}
						}
						console.log(replys,"replys");
		  
						let reply = replys[Math.floor(Math.random() * replys.length)];
						var gregex = /{m-/gi; 
						reply = reply.replace(gregex, "");
						
						if(reply !=''){
							reply = replaceVariable(reply,comment);
							if (reply[reply.length-1] === "}"){
								reply = reply.slice(0,-1);
							}
							resolve(  reply + ' ' + offer_link);
						} else{
							resolve('');
						}
					} 
					else if(gender == "Female"){
						for (var i = 0; i < reply.length; i++) {
							if (reply[i].indexOf("{m-") == -1) {
								reply.splice(i, 1);
							}
						}
						
						let reply = replys[Math.floor(Math.random() * replys.length)];
						var gregex = /{f-/gi; 
						reply = reply.replace(gregex, "");
						if(reply !=''){
							reply = replaceVariable(reply,comment);
							if (reply[reply.length-1] === "}"){
								reply = reply.slice(0,-1);
							}
							resolve(  reply + ' ' + offer_link);
						} else{
							resolve('');
						}
					} else{
						resolve('');
					}
					 
				
				
				}  
			});	
				
			});
			
		 
	});		 
    
}*/


function makeReply(form, comment) {
    //console.log('makeReply called');
	return new Promise(async (resolve, reject) =>{
        if(replys==undefined || replys==null){
            resolve(null);
            return;
        }
		let reply = replys[Math.floor(Math.random() * replys.length)];
		let name = getTagString(comment);
		var regex = /<br\s*[\/]?>/gi;
		reply = reply.replace(regex, "\n");
		reply = replaceVariable(reply,comment);
		 let names = getTagString(comment);
		resolve(names+ ' ' +reply + ' ' + offer_link);
	});
}

function replaceVariable(reply,comment){
	var fullName = getCommenterName(comment);
	var regex = /<br\s*[\/]?>/gi;
	reply = reply.replace(regex, "\n");
	
	if(fullName){
		firstName = fullName.split(' ').slice(0, -1).join(' ');
		lastName = fullName.split(' ').slice(-1).join(' ');
	}
    //return name + ' ' + reply + ' ' + offer_link; 
    let today = new Date();
    today = today.getDate()+"."+(today.getMonth()+1)+"."+today.getFullYear();

    let month = new Date();
    month = month.getMonth()+1;

	var fullregex = /{full_name}/gi;
	var firstregex = /{first_name}/gi;
    var lastregex = /{last_name}/gi;
    var thisdayregex = /{thisday}/gi;
    var thismonth = /{thismonth}/gi;
	reply = reply.replace(fullregex, fullName).replace(firstregex, firstName).replace(lastregex, lastName).replace(thisdayregex,today).replace(thismonth,month);
	return reply;
	
}

function getCommenterUrl(comment) {
    return comment.find('._2b05>a').first().attr("href");
}

function randomBetween(interval, interval2) {
    //console.log('randomBetween called');

    let sec = Math.floor(Math.random() * (interval2 - interval + 1) + interval);
    console.log(sec);
    return sec

}
function startTyping(comment) {

    let session_id = $('mcomposer-session-id').val();
    let fbstory_id = getFbStoryId();
    let store_data = comment.data('store');
    //console.log('store', store);

    let url = "https://mobile.facebook.com/ufi/typing/" + fbstory_id + "/start/?session_id=" + session_id + "&parent_comment_id=2581004138793547_543157266217454&av=100014369911062"
}



//TODO:// SAVE_SETTINGS,....
