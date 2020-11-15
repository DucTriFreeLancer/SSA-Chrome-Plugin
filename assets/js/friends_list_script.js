
var spanTagfriendList = '<div style="position: absolute;margin-top: 35px; float: left !important; z-index: 999999;" class="validlogin tags-container chatsilo-tags-container"><span class="bg-muted chatsilo-selected-tag">+</span>';
spanTagfriendList += '</div>';

var searchHtml = `<div class="row custom-row"> 

					<div class= "row-levels">
						<div class="chatsilo-cols chatsilo-col-md-9"> 
							<input placeholder="Search tag" type="text" id="search-tag-by-name" > 
						</div> 

						<div class="chatsilo-cols chatsilo-col-md-3" > 
							<button class="add-tag-from-content bg-purple chatsilo-btn">Add Tag</button>
						</div>
					</div>

					<div class= "row-levels save-tag-div">
						<div class="left-col-item chatsilo-cols chatsilo-col-md-12"> 
							<input placeholder="Enter Tag Name" type="text" id="tag-name-from-content" > 
						</div> 

						<div class="right-col-item chatsilo-cols chatsilo-col-md-12 text-center pt-2" > 
							<button class="save-tag-from-content bg-purple chatsilo-btn">Save Tag</button>
							<button class="search-form-content bg-gray chatsilo-btn">Back to Search</button>
						</div>
					</div>
					<div class="row-levels chatsilo-cols chatsilo-col-md-12 text-center error-mgs error p-2 pl-0 pr-0">
					</div>
				</div>`;
$("body").append('<div id="overlay-two"><div id="chatsilo_model_two"><div id="chatsilo_model_content_two" class="custom-row"></div></div></div>');


jQuery.fn.extend({
	'mclick': function () {
		var click_event = document.createEvent('MouseEvents')
		click_event.initMouseEvent("click", true, true, window,
        0, 0, 0, 0, 0,
        false, false, false, false,
        0, null);
		return $(this).each(function () {
			$(this)[0].dispatchEvent(click_event)
		})
	}
})


$(function(){
	setInterval(function(){
		integratetagfriendList();
	},4000);

	$(document).on('click','.chatsilo-tags-container span', function() {

		var pathname = window.location.href.toString();	
		if(pathname.indexOf("/lists") > -1){
			$('.profileBrowserDialog').hide();	
			var clickedFbUserId = $(this).closest('.viewProfile').attr('fb_user_id');
			var clickednumericfbid = $(this).closest('.viewProfile').attr('numeric_fb_id');
			var fbName = $(this).parent().parent().parent().next('span').text();

			chrome.storage.local.get(["tags", "taggedUsers"], function(result) {
				var options = '<div class="row custom-row modal-heading"><div class="leve-1 tagged-name">'+fbName+'</div><div class="leve-1 model-close">X</div></div> '+searchHtml+'<div class="row custom-row"> <div class="tags-container chatsilo-tags-container cts-messenger"><ul class="model-tag-list custom-scroll">';
				if (typeof result.tags != "undefined" && result.tags != "") { 
					temp = result.tags;
					for(i=0;i<result.tags.length;i++){
						var style ='';
						if (result.tags[i].color !== null ) {
							style = 'style = "background:'+result.tags[i].color+' !important"';
							options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color multi-tag-click'  tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.  tags[i].text+"</li>";
						}else{
							options += "<li class='bg-"+result.tags[i].class+" tag-text-color multi-tag-click' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result. tags[i].text+"</li>";
						}
					}					
				}
				options += '</ul><button style="display:none;" fbName = "'+fbName+'" clickedFBUserId ="'+clickedFbUserId+'"  clickednumericfbid ="'+clickednumericfbid+'" type="button" class="update-multi-tag">Update Tag</button></div>';
				$('#chatsilo_model_content_two').html(options);
				$('#overlay-two').show();
				var temp = result.taggedUsers.filter(function (item) { return (item.fb_user_id == clickedFbUserId  || item.numeric_fb_id == clickedFbUserId)});
				if( temp.length > 0 ){
					var $tagIds = temp[0].tag_id.split(',');
					$tagIds.forEach(function(tagid){
						eachTagIdOne = tagid.replace(/\#/g,'');
						$('.model-tag-list li[tag-id="'+eachTagIdOne+'"] .multi-tag-checkbox').prop('checked',true);
					});	
				}
			});
		}
	})
	
	$(document).on('click','.model-close', function() {
		$('#overlay-two').hide();
		if($('a:contains(See all)').length>0){
	 		$('a:contains(See all)').mclick();
	 	}else if($('a[rel="dialog"]:contains(See All)').length>0){
	 		$('a[rel="dialog"]:contains(See All)').mclick();
	 	}
	})

	$(document).on('click','.multi-tag-click', function() {
	 	var pathname = window.location.href.toString();
	 	if(pathname.indexOf("/lists") > -1){
	 		var multiTagChecked = $(this).find('.multi-tag-checkbox').is(':checked');
			if(multiTagChecked){
				$(this).find('.multi-tag-checkbox').prop('checked',false);
			}else{
				$(this).find('.multi-tag-checkbox').prop('checked',true);	
			}
		 	$checkedTags = [];
			$('.model-tag-list li').each(function(index){
				if ($(this).find('.multi-tag-checkbox').is(':checked')) {
					$checkedTags.push($(this).attr('tag-id'));
				}
			});
			clickedFBUserId = $('.update-multi-tag').attr('clickedFBUserId');
			clickedNumericFBId = $('.update-multi-tag').attr('clickednumericfbid');
			fbName = $('.update-multi-tag').attr('fbName');
			isPage = '0';
			updateFBFriendListUsertag(JSON.stringify($checkedTags),clickedFBUserId,clickedNumericFBId,fbName,isPage);
		}
	});
});


function integratetagfriendList(){
	setInterval(function(){
		chrome.storage.local.get(["chatsilo_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
			if ( typeof result.chatsilo_user != "undefined" && result.chatsilo_user != "" && result.chatsilo_user.id > 0) { 
				if(window.location.pathname.indexOf('/lists') > -1 ){
					if($("div.profileBrowserDialog").length > 0){
						
						if($('.editFriendsSelector:contains(On this list)').length > 0 || $('.editFriendsSelector:contains(On This List)').length > 0){	
							
							if($(".listSection .tags-container.chatsilo-tags-container").length == 0){
								
								$("a.viewProfile").each(function() {
									$(this).html(spanTagfriendList);
									numericIdUrl = $(this).attr('href');
									numericIdArray = numericIdUrl.split('id=');
									numericId = numericIdArray[numericIdArray.length-1];
									$(this).attr('fb_user_id',numericId);
									$(this).attr('numeric_fb_id','0');
									$(this).attr('href','javascript:void(0)');
								});
								$('.listSection .viewProfile').css({"bottom":"-20px", "display":"block"});
								$('.listSection .friendListItem').css('margin-top','27px');		
							}
						} 
					}
					if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
						tagFriendListPageUsers(result.taggedUsers, result.tags);
					}
				}
			}

		})
	},4000);	
}

function tagFriendListPageUsers(taggedUsers, tags){
	if($("div.profileBrowserDialog").length > 0){
		$("a.viewProfile").each(function() {
			fbUserId = $(this).attr('fb_user_id');
			chatsiloTag=$(this).closest('.friendListItem');
			var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == fbUserId || item.numeric_fb_id == fbUserId)});
			if(temp.length > 0 ){
				$liClass = '';
				$colorCode = '';
				var $tagIds = temp[0].tag_id.split(',');
				var title = '';
				var spanText = '';
				var numeric= temp[0].numeric_fb_id;
				$tagIds.forEach(function(eachTagId){

					eachTagIdOne = eachTagId.replace(/\#/g,'');
					var foundTag = tags.filter(function (item) { return item.value == eachTagIdOne});
					if (foundTag.length > 0) {
						title += foundTag[0].text+', ';
						$liClass = foundTag[0].class;
						$colorCode = foundTag[0].color;
						spanText = foundTag[0].text;
						
					}
				})
				if (title != '') {
					$(chatsiloTag).find('.tags-container span').text(spanText);
					$(chatsiloTag).find('.tags-container span').prop('title',title.slice(0, -1));
					$(chatsiloTag).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
					if ($colorCode == null) {
						$(chatsiloTag).find('.tags-container span').addClass('bg-'+$liClass);
					}else{
						$(chatsiloTag).find('.tags-container span').removeClass('bg-muted');
						$(chatsiloTag).find('.tags-container span').css('background',$colorCode);
						$(chatsiloTag).find('.tags-container span').addClass('tag-text-color');
					}
				}else{
					if($(chatsiloTag).find('div.tags-container').length > 0 ){
						//$(chatsiloTag).find('div.tags-container').remove();
						if($('.editFriendsSelector:contains(On this list)').length>0){
							$(this).find('div.tags-container').remove();
							$(this).html(spanTagfriendList);
						}
					} else {
						if($('.editFriendsSelector:contains(On this list)').length>0){	
							$(this).html(spanTagfriendList);
						}
					}
				}
			}else{
				$(this).html(spanTagfriendList);
			}
		})
	}
}


function updateFBFriendListUsertag(tagId,fbUserId,numericId,fbName='',isPage){

	chrome.storage.local.get(["chatsilo_user"], function(result) {
		if (typeof result.chatsilo_user != "undefined" && result.chatsilo_user.id != "") {
			port.postMessage({'type': 'updateFBUsertag','data': {tagId:tagId, userId:result.chatsilo_user.id,loggedInFBId: currentLoggedInFBId,fbName: fbName,fbUserId: fbUserId,numericFbId:numericId,isPage:isPage}});		
		}
	});
}
