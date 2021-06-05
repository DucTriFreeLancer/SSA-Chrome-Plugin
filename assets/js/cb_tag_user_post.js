//add_comment_link_placeholder
console.log('cb_tag_user_post.js Loaded');
//alert('sdf 2');

const comments_container_selector = '._uwt._45kb._3ioy';
const comment_selector = '._5ru3._3tl8._2pid';
const post_url = new URL(window.location);

var diff = 5 * 1000;
var start_index = 0;
var active_status = false; // to check if commenting is working or stopped
var max_comment = 0;
var delay_seconds = 0 ;
var scheduled_start = null;
var fb_user_id = null;
chrome.storage.sync.get(null, items => {
    max_comment = eval(items.max_comment);
    delay_seconds = eval(items.delay_seconds)* 1000;;
});
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
           startTagUsers();
        }
    });
    $('.cf_stop_btn').on('click', function () {
        stopTagUsers();
    });
    $('.cf_cancel_btn').on('click', function () {
        cancelTagUsers();
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
//#region "For Tag User on post"
async function startTagUsers() {
    $('.cf_start_btn').hide();
    $('.cf_stop_btn').show();
    $('.cf_text').text('Group Growth - Tag Post is tagging users to post. Please wait...');
    
    //clear timeout in case we have set one
    clearTimeout(scheduled_start);
    // start replying to comments
    if (max_comment) {
        active_status = true;
        await  startAction();
    }else{
        active_status = false;
    }
}

function stopTagUsers() {
    //clear timeout in case we have set one
    clearTimeout(scheduled_start);

    active_status = false;
    $('.cf_start_btn').text('Paused... Click to Resume').show();
    $('.cf_stop_btn').hide();
}

function cancelTagUsers() {
    stopTagUsers();
    clearTimeout(scheduled_start);
    $('.cf_overlay').remove();
    $('#cf_controls').remove();

}

function updateStatusString(newIndex) {
    let status_string = '';
    let main_text = '';
    let comment_type = "Group Growth - Tag Post"
    if (newIndex === max_comment) {
        stopTagUsers();
        main_text = `${comment_type} tagged all users to post`;
        status_string = "All Done!";
    } else {
        main_text = `${comment_type} is tagging users to post. Please wait...`;
        //status_string = (reply_btns_count - newLen) + " of " + reply_btns_count + " Done!";
        status_string = (newIndex) + " of " + max_comment + " Done!";
    }

    $('#cf_controls .status_string').text(status_string);
    $('.cf_text').text(main_text);

}


async function startAction() {
    if (!active_status) {
        return;
    }
    scheduled_start =  setInterval(function(){
        let form =  $(comments_container_selector + '>' + comment_selector).find('form[id^="comment_form_"]');
        tagUsers(form);
    },delay_seconds);
}

function getLetBlast() {
    //console.log('getLetBlast called');
    return post_url.searchParams.get("tagusers");
}

function rememberComment() {
    start_index +=1;
    updateStatusString(start_index);
}



async function tagUsers(form) {
    if(start_index < max_comment){
        let resp = await getTaggedUser(); 
        if(resp.result =="success"){
            let submit_btn = form.find('button[type="submit"]');
            let input = form.find('input[name="comment_text"]');
            if(getLetBlast() == "1"){        
                submit_btn.removeAttr('disabled'); // enable button
                //textarea.val(reply_content);
                if(resp.message!=null){
                    input.val(resp.message);
                    submit_btn.click();
                }
            }
        }
        else{
            stopComments();
        }
        //rememberComment
        rememberComment();
    }
   
}
async function getTaggedUser() {
    let returnValue = {
        result: "",
        usersLeft:"",
        message:""
    }
    return new Promise(function(resolve,reject) {
        chrome.storage.local.get(["ssa_group"], function(result) {
            chrome.runtime.sendMessage({
                action: "get_tagged_user",
                from:"facebook",
                data: result.ssa_group[0].fb_account_id
            }, function(res) {
                returnValue = res;
                resolve(returnValue);
            });
        })

    })
}




//#endregion
//TODO:// SAVE_SETTINGS,....
