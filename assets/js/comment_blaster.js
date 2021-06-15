console.log('content.js Lodaed');
var port = chrome.runtime.connect({'name': 'formfiller'})
port.postMessage({'type': 'get-form-data'});
processed_posts_count = 0;
CBIngerval = null;
$(document).ready(function () {
    console.log('document is ready');
    //chrome.storage.sync.get("user", function (obj) {
    chrome.storage.local.get(["ssa_user"], function (obj) {
        if (obj.ssa_user){
            doInit();

            onElementHeightChange(document.body, function(){
                console.log('Body height changed');
                doInit();
            });
        }
    });

    setInterval(function(){
        postsAddSSAButton();
    },1000);
});

function doInit() {
    let posts_count = $('._6a.uiPopover._5pbi._cmw._b1e').length;

    if (!posts_count) {
        processed_posts_count = 0;
        //console.log('waiting because posts are '+posts_count);
        setTimeout(doInit,1500);
        return;
    }
    if (posts_count > processed_posts_count) {
        //console.log('attaching events because got some posts ==>' + posts_count);
        console.log("Attached click events");
        attachClickEvent();
        processed_posts_count = posts_count;
    }
}

//Adding "Use SSA" button to dropdown options of posts when post is opened.
postsAddSSAButton = () =>{
    let ancestorOfDropdownOptions = document.getElementsByClassName('j34wkznp qp9yad78 pmk7jnqg kr520xx4');
    let post_url = window.location.href.split('facebook.com/')[1];
    if(post_url==undefined || post_url==null || post_url.length<3){
        return;
    }
    if(post_url.includes("/permalink/")== true){
        var pid=post_url.split("permalink/")[1].split("&")[0].split("?")[0];
    } 
    else if(post_url.includes("/posts/")== true){
        var pid=post_url.split("posts/")[1].split("&")[0].split("?")[0];
    } 
    else if(post_url.includes("?story_fbid=")== true){
        var pid=post_url.split("?story_fbid=")[1].split("&")[0];
    } 
    else if(post_url.includes("/videos/")== true){
        var pid=post_url.split("/videos/")[1].split("&")[0].split("?")[0];
    } 
    if(typeof pid == "undefined")
    {
        return;
    }
    for (let dropdownAnc of ancestorOfDropdownOptions) {
        let prependCBElementHTML = '<img class="_2yaw img" src="'+chrome.extension.getURL("assets/images/64.png")+'"/> Use Comment Blaster™ ';
        let prependLSElementHTML = '<img class="_2yaw img" src="'+chrome.extension.getURL("assets/images/64.png")+'"/> Use Leads Sniper™ ';
        let prependGGElementHTML = '<img class="_2yaw img" src="'+chrome.extension.getURL("assets/images/64.png")+'"/> Group Growth - Tag Post ';
        
        let firstItem = dropdownAnc.querySelectorAll('[role="menuitem"]')[0];
        if(firstItem!=undefined && firstItem!=null && firstItem.className!="custom-link"){
            let newCBElement = document.createElement('div');
            newCBElement.innerHTML = prependCBElementHTML;
            
            
            newCBElement.post_url = "https://m.facebook.com/"+pid.replace('/','');
            newCBElement.className="custom-link";
            newCBElement.setAttribute('role','menuitem');
            newCBElement.onclick = function(){
                window.open("chrome-extension://"+chrome.runtime.id+"/comment_blaster.html?post_id="+newCBElement.post_url,"_blank");
            }
            firstItem.parentNode.insertBefore(newCBElement,firstItem);
            let newLSElement = document.createElement('div');
            newLSElement.innerHTML = prependLSElementHTML;
            
            
            newLSElement.post_url = "https://m.facebook.com/"+pid.replace('/','');
            newLSElement.className="custom-link";
            newLSElement.setAttribute('role','menuitem');
            newLSElement.onclick = function(){
                window.open("chrome-extension://"+chrome.runtime.id+"/lead_sniper.html?post_id="+newLSElement.post_url,"_blank");
            }
            firstItem.parentNode.insertBefore(newLSElement,firstItem);
            let admin_group = $(dropdownAnc.querySelectorAll('[role="menuitem"]')).find("span:contains('Mark as announcement')");
            if($(admin_group).length==1){
                let newTPElement = document.createElement('div');
                newTPElement.innerHTML = prependGGElementHTML;
                
                
                newTPElement.post_url = "https://m.facebook.com/"+pid.replace('/','');
                newTPElement.className="custom-link";
                newTPElement.setAttribute('role','menuitem');
                newTPElement.onclick = function(){
                    chrome.storage.local.get(["ssa_user","ssa_group"], function (result) {
                        if (typeof result.ssa_user != "undefined" && result.ssa_user != "") {
                            tagPostLink = {}; 
                            tagPostLink.userId = result.ssa_user.id;
                            tagPostLink.groupid = result.ssa_group[0].fb_account_id;
                            tagPostLink.url = "https://m.facebook.com/"+ post_url;
                            port.postMessage({'type': 'setTagPostLinkForGroup','tagPostLink': tagPostLink});		
                        }
                        else {
                            toastr["warning"]('Please click on SSA icon to to login');
                        }
                    });
                }
                firstItem.parentNode.insertBefore(newTPElement,firstItem);
            }
        }        
    }

}


function attachClickEvent() {
    $('._6a.uiPopover._5pbi._cmw._b1e:not(.cb_event_attached)').click(function () {
        console.log('opened()');

        if (CBIngerval){
            clearInterval(CBIngerval);
        }
        CBIngerval = setInterval(addCFLink, 500);

        function addCFLink() {
            console.log('addCFLink()');

            if ($("._6a.uiPopover._5pbi._cmw._b1e.openToggler.selected").length) {
                console.log('havepopup opened');

                var post_id = 0;
                //var id = $( "._6a.uiPopover._5pbi._cmw._b1e.openToggler.selected").children()[1].id;
                //var postId = $( "._6a.uiPopover._5pbi._cmw._b1e.openToggler.selected").parent().parent().find('._5pcq').attr('href');
                //var box = $('._54nf').parent().parent().parent().parent();
                let box = $('.uiContextualLayerPositioner.uiLayer').not('.hidden_elem');
                let already_inserted = $(box.children().children().children().children().children()[0]).hasClass('funnel-comment');

                let canDelete = box.find('a[data-feed-option-name="FeedDeleteOption"]');
                let canDelete2 = box.find('a[ajaxify^="/ajax/groups/mall/delete"]');
                let lis = box.find('li');
                if (!lis.length) {
                    // if popup is opened but not fully loaded
                    return;
                }
                console.log('canDelete 1,2',canDelete, canDelete2);
                if ((!canDelete.length && !canDelete2.length) || already_inserted){

                    clearInterval(CBIngerval);
                    return;
                }
                let aTag = box.find('a[data-feed-option-name="FeedFollowOption"]');
                if (!aTag.length) {
                    aTag = box.find('a[ajaxify^="/ajax/litestand/follow_group_post"]');
                }
                console.log(aTag, aTag.attr('ajaxify'));
                let uri = aTag.attr('ajaxify');
                let decodedUri = decodeURI(uri);
                let url = new URL('https://www.facebook.com/' + decodedUri);
                let url2 = url.searchParams.get('message_id');
                console.log('post_id', url2)
                // if (url2){
                //     let url2_arr = url2.split('/');
                //     post_id = url2_arr[url2_arr.length-1];
                //     // console.log('post_id', post_id)
                // }
                // if(!box.hasClass('hidden_elem')){
                //var boxid = box.data('ownerid');
                let current_popup = $('._54nf').parent().parent().parent().parent().parent();
                console.log(box.children().children().children().children().children()[0]);
                console.log(box.children().children().children().children().children().get(0));
                if (current_popup.not('.hidden_elem') && !already_inserted && url2) {


                    //
                    box.find('._54nf').prepend('<li class="funnel-comment-ls __MenuItem">' +
                        '<a href="#" class="_54nc" target="_blank">' +
                        '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;">' +
                        '<span style="font-size:15px !important;">' +
                        ' Use Leads Sniper' + '&trade;' + 
                        '</span>' +
                        '</a></li><style>.funnel-comment-ls:hover{' +
                        'background: rgb(255, 170, 0)' +
                        '}</style>').find('.funnel-comment-ls').click(function () {
                       //TODO://
                        console.log('clicked')
                        window.open(chrome.extension.getURL("lead_sniper.html?post_id=https://m.facebook.com/" + url2))
                        // chrome.extension.sendMessage({type: "notification", options: {
                        //         action: "create_tab",
                        //         url: chrome.extension.getURL("index.html?post_id=https://m.facebook.com/" + url2)
                        //     }}, (a,b) =>{
                        //     console.log(a,b);
                        // });
                    });
                    box.find('._54nf').prepend('<li class="funnel-comment __MenuItem">' +
                        '<a href="#" class="_54nc" target="_blank">' +
                        '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;">' +
                        '<span style="font-size:15px !important;">' +
                        ' Use Comment Blaster' + '&trade;' + 
                        '</span>' +
                        '</a></li><style>.funnel-comment:hover{' +
                        'background: rgb(255, 170, 0)' +
                        '}</style>').find('.funnel-comment').click(function () {
                       //TODO://
                        console.log('clicked')
                        window.open(chrome.extension.getURL("comment_blaster.html?post_id=https://m.facebook.com/" + url2))
                        // chrome.extension.sendMessage({type: "notification", options: {
                        //         action: "create_tab",
                        //         url: chrome.extension.getURL("index.html?post_id=https://m.facebook.com/" + url2)
                        //     }}, (a,b) =>{
                        //     console.log(a,b);
                        // });
                    });
                    clearInterval(CBIngerval);

                    //if(post_id) {

                    //}
                }


            }
        }

    })
    $('._6a.uiPopover._5pbi._cmw._b1e').addClass('cb_event_attached');

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
    if(message.from === 'background' && message.subject === 'tag_post_link'){
        if(message.status =='success'){
            toastr["success"]("The tag post link is setted successfully.");
        }
        else{
            toastr["error"]("Something went wrong.");
        }
	}
})


// $('body').on('click', '.oajrlxb2', function() {
//     var out= $(this);
//     var myVar = setInterval(function(){ 
//         var href= out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find("._6coi.oygrvhab.ozuftl9m.l66bhrea.linoseic a.oajrlxb2").attr("href");

//         if(out.hasClass("custom")==true && $('.nqmvxvec.j83agx80.jnigpg78').find(".custom-link").text().trim() != "Use Comment Blaster™" && out.hasClass("clicked") ==false){  
//                     out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".custom").trigger("click");
//                     out.removeClass("custom");
//                     out.addClass("clicked");
//         }  
//         if(href == undefined){
//                 if( out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".j83agx80.fv0vnmcu.hpfvmrgz:eq(0)").text().includes("View ") == true){
//                     if(out.hasClass("custom")==false){
//                             out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".j83agx80.fv0vnmcu.hpfvmrgz").trigger("click");
//                             out.addClass("clickking custom");

//                     }
                    
//                 } 
//         }
            

//         $('.q5bimw55').each(function(i, obj) {
//             var self=$(this);
//             var find =$(this).find(".qzhwtbm6.knvmm38d");
//             $(find).each(function(i, obj) {
            
//             if(($(this).find("span").text() == "Delete post" || $(this).find("span").text() == "Remove post") &&  href !== undefined) {
//                 if(href.includes("/permalink/")== true){
//                         var pid=href.split("facebook.com")[1].split("permalink/")[1].split("&")[0].split("?")[0];
//                 } 
//                 else if(href.includes("/posts/")== true){
//                         var pid=href.split("facebook.com")[1].split("posts/")[1].split("&")[0].split("?")[0];
//                 } 
//                 else if(href.includes("?story_fbid=")== true){
//                         var pid=href.split("facebook.com")[1].split("?story_fbid=")[1].split("&")[0];
//                 } 
//                 else if(href.includes("/videos/")== true){
//                         var pid=href.split("facebook.com")[1].split("/videos/")[1].split("&")[0].split("?")[0];
//                 } 
//                 if(typeof pid != "undefined"){
//                     $('.custom-link').remove();
//                     // out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.n05y2jgg").trigger("click");
//                     var url = chrome.extension.getURL("lead_sniper.html?post_id=https://m.facebook.com/" + pid);
//                     self.prepend('<div class="custom-link" style="margin-left:8px;padding-left:8px;margin-bottom: 8px;font-weight: 600;font-size: 13px;"><a href="'+url+'" class="_54n" target="_blank" style="color: var(--primary-text);">' +
//                                             '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;margin-right:5px;">' +
//                                             '<span style="font-size:15px !important;">' + 
//                                             ' Use Leads Sniper' + '&trade;' + 
//                                             '</span>' + 
//                                             '</a></div>'); 
//                     url = chrome.extension.getURL("comment_blaster.html?post_id=https://m.facebook.com/" + pid);
//                     self.prepend('<div class="custom-link" style="margin-left:8px;padding-left:8px;margin-bottom: 8px;font-weight: 600;font-size: 13px;"><a href="'+url+'" class="_54n" target="_blank" style="color: var(--primary-text);">' +
//                                             '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;margin-right:5px;">' +
//                                             '<span style="font-size:15px !important;">' + 
//                                             ' Use Comment Blaster' + '&trade;' + 
//                                             '</span>' + 
//                                             '</a></div>');                
//                                             out.removeClass("clickking");
//                                             clearInterval(myVar);
//                 }
//             }
//             });
//         });

//     }, 500);
// });


 



// document.addEventListener("click", function(e){
  
//     var myVar = setInterval(function(){   
//         $('.q5bimw55').each(function(i, obj) {
        
//             if($(this).find('a').attr("href") && $(this).find("a").text() == "Embed" && $(this).find("a").text() == "Delete post") {
//                 var ahref = decodeURIComponent($(this).find('a').attr("href"));
//                 var pid=ahref.split("facebook.com")[2].split("posts/")[1].split("&")[0];
//                 var appel = $(this);

//                 $('.custom-link').remove();
//                 var url = chrome.extension.getURL("lead_sniper.html?post_id=https://m.facebook.com/" + pid);
//                 appel.prepend('<div class="custom-link" style="margin-left:8px;padding-left:8px;margin-bottom: 8px;font-weight: 600;font-size: 13px;"><a href="'+url+'" class="_54n" target="_blank" style="color: var(--primary-text);">' +
//                     '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;margin-right:5px;">' +
//                     '<span style="font-size:15px !important;">' + 
//                     ' Use Leads Sniper' + '&trade;' + 
//                     '</span>' + 
//                     '</a></div>'); 
//                 var url = chrome.extension.getURL("comment_blaster.html?post_id=https://m.facebook.com/" + pid);
//                 appel.prepend('<div class="custom-link" style="margin-left:8px;padding-left:8px;margin-bottom: 8px;font-weight: 600;font-size: 13px;"><a href="'+url+'" class="_54n" target="_blank" style="color: var(--primary-text);">' +
//                     '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;margin-right:5px;">' +
//                     '<span style="font-size:15px !important;">' + 
//                     ' Use Comment Blaster' + '&trade;' + 
//                     '</span>' + 
//                     '</a></div>'); 
//                     clearInterval(myVar);
//             }

//         });
//     }, 500);
     
// }); 
