console.log('content.js Lodaed');
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
        attachClickEvent();
        processed_posts_count = posts_count;
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
                    box.find('._54nf').prepend('<li class="funnel-comment __MenuItem">' +
                        '<a href="#" class="_54nc" target="_blank">' +
                        '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;">' +
                        '<span style="font-size:15px !important;">' +
                        ' Use Social Sales Accelerator' + '&trade;' + 
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




 $('body').on('click', '.oajrlxb2', function() {
var out= $(this);
var myVar = setInterval(function(){ 
      var href= out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find("._6coi.oygrvhab.ozuftl9m.l66bhrea.linoseic a.oajrlxb2").attr("href");

          if(out.hasClass("custom")==true && $('.nqmvxvec.j83agx80.jnigpg78').find(".custom-link").text().trim() != " Use Social Sales Accelerator™" && out.hasClass("clicked") ==false){  
                      out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".custom").trigger("click");
                      out.removeClass("custom");
                      out.addClass("clicked");
        }  
 if(href == undefined){
        if( out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".j83agx80.fv0vnmcu.hpfvmrgz:eq(0)").text().includes("View ") == true){
            if(out.hasClass("custom")==false){
                    out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".j83agx80.fv0vnmcu.hpfvmrgz").trigger("click");
                    out.addClass("clickking custom");

            }
            
        } 
}
    

 $('.q5bimw55').each(function(i, obj) {
 var self=$(this);
 var find =$(this).find(".qzhwtbm6.knvmm38d");
 $(find).each(function(i, obj) {
 
  if(  ($(this).find("span").text() == "Delete post" || $(this).find("span").text() == "Remove post") &&  href !== undefined) {
  if(href.includes("/permalink/")== true){
         var pid=href.split("facebook.com")[1].split("permalink/")[1].split("&")[0].split("?")[0];
 } 
else if(href.includes("/posts/")== true){
         var pid=href.split("facebook.com")[1].split("posts/")[1].split("&")[0].split("?")[0];
 } 
 else if(href.includes("?story_fbid=")== true){
         var pid=href.split("facebook.com")[1].split("?story_fbid=")[1].split("&")[0];
 } 
 else if(href.includes("/videos/")== true){
         var pid=href.split("facebook.com")[1].split("/videos/")[1].split("&")[0].split("?")[0];
 } 
       $('.custom-link').remove();
           // out.parents(".du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0").find(".oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.n05y2jgg").trigger("click");
    var url = chrome.extension.getURL("comment_blaster.html?post_id=https://m.facebook.com/" + pid);
   self.prepend('<div class="custom-link" style="margin-left:8px;padding-left:8px;margin-bottom: 8px;font-weight: 600;font-size: 13px;"><a href="'+url+'" class="_54n" target="_blank" style="color: var(--primary-text);">' +
                        '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;margin-right:5px;">' +
                        '<span style="font-size:15px !important;">' + 
                        ' Use Social Sales Accelerator' + '&trade;' + 
                        '</span>' + 
                        '</a></div>'); 
                                 out.removeClass("clickking");
                          if($('.nqmvxvec.j83agx80.jnigpg78').find(".custom-link").text()!=='' && out.hasClass("custom")==false){
                            clearInterval(myVar);
                        }
 
 }
 });
 });

     }, 500);
});


 



document.addEventListener("click", function(e){
  
 var myVar = setInterval(function(){  
 
 $('.q5bimw55').each(function(i, obj) {
     
 if($(this).find('a').attr("href") && $(this).find("a").text() == "Embed" && $(this).find("a").text() == "Delete post") {
      var ahref = decodeURIComponent($(this).find('a').attr("href"));
        var pid=ahref.split("facebook.com")[2].split("posts/")[1].split("&")[0];
       var appel = $(this);

   $('.custom-link').remove();

   var url = chrome.extension.getURL("comment_blaster.html?post_id=https://m.facebook.com/" + pid);
   appel.prepend('<div class="custom-link" style="margin-left:8px;padding-left:8px;margin-bottom: 8px;font-weight: 600;font-size: 13px;"><a href="'+url+'" class="_54n" target="_blank" style="color: var(--primary-text);">' +
                        '<img class="_2yaw img" aria-hidden="true" src="'+chrome.extension.getURL("assets/images/64.png")+'" alt="" style=" max-height: 22px;max-width: 22px;margin-right:5px;">' +
                        '<span style="font-size:15px !important;">' + 
                        ' Use Social Sales Accelerator' + '&trade;' + 
                        '</span>' + 
                        '</a></div>'); 
                        if($('.nqmvxvec.j83agx80.jnigpg78').find(".custom-link").text()!==''){
                            clearInterval(myVar);
                        }
 

 }

 });

     }, 500);
     
}); 
