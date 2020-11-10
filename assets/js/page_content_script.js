
var fb_page_div_selector = null;
fb_page_div_selector = $('div._24tx');
var dd = "messenger_thread_list_row";
// var fb_page_div_selector_search = "div._24tx div._4k8w";
var fb_page_div_selector_search = "div._24tx";

var insertTagPosition = "div.clearfix span:first";
$(function(){	
var findPageDiv = setInterval(function(){
		if($("div._24tx").length > 0){
			clearInterval(findPageDiv);	
			integrateSSAPageFeature();
		}
	}, 1000);
});

function integrateSSAPageFeature(){
	setInterval(function(){
		if( $(fb_page_div_selector_search).not('[fb_image_id]').length > 0 || !processing){		
			
			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
					processing = true;

					var spanTagPerChat = '<div class="tags-container ssa-tags-container"><span class="bg-muted ssa-selected-tag">+</span>';
				
					spanTagPerChat += '</div>';
					
					/********** Create Tags Drop Down for each chat thread ********/
					$(fb_page_div_selector_search+'> div').not('[class]').each(function(index) {
						var fbUser = $(this);
						$(this).addClass('page-chat-thread-gr');
						var profilePicArray = $(fbUser).find('img').attr('src').split('?')[0].split('/');
						imageUrl = profilePicArray[profilePicArray.length-1];

						if($(fbUser).find('div.tags-container').length > 0 ){
							$(fbUser).find('div.tags-container').remove();
							$(fbUser).attr('fb_image_id',imageUrl);
							$(fbUser).find(insertTagPosition).after(spanTagPerChat);
						} else {

							$(fbUser).attr('fb_image_id',imageUrl);
							$(fbUser).find(insertTagPosition).after(spanTagPerChat);
						}
					});
															
					if(result.isCurrentFBLinked){
						$(".tags-container").show();
					} else {
						$(".tags-container").hide();
					}

					/********** Tag page Users ********/
					if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
						tagPageUsers(result.taggedUsers, result.tags);
					}
				}
			});
		}
	},2000);
}

function updateFBPageUsertag(tagId, fbImageId, profilePic, fbName='',fbPageId){
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			port.postMessage({'type': 'updateFBPageUsertag','data': {tagId:tagId, userId:result.ssa_user.id,loggedInFBId: currentLoggedInFBId, fbImageId: fbImageId, profilePic:profilePic, fbName: fbName,fbPageId: fbPageId}});		
		}
	});
}

function tagPageUsers(taggedPageUsers, tags){	
	$('.page-chat-thread-gr').each(function() {
		var fb_image_id = $(this).attr('fb_image_id');
		var temp = taggedPageUsers.filter(function (item) { return item.fb_image_id == fb_image_id});
		if( temp.length > 0 ){
			//$(this).find('select').val(temp[0].tag_id).trigger('change');
			$liClass = '';
			$colorCode = '';
			var $tagIds = temp[0].tag_id.split(',');
			var title = '';
			var spanText = '';
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
				$(this).find('.tags-container span').text(spanText);
				$(this).find('.tags-container span').prop('title',title.slice(0, -1));
				if ($colorCode == null) {
					$(this).find('.tags-container span').addClass('bg-'+$liClass);
				}else{
					$(this).find('.tags-container span').removeClass('bg-muted');
					$(this).find('.tags-container span').css('background',$colorCode);
					$(this).find('.tags-container span').addClass('tag-text-color');
				}
			}else{
				var options = '<div class="tags-container ssa-tags-container"><span class="bg-muted ssa-selected-tag">+</span>';
				options += '</div>';
				if($(this).find('div.tags-container').length > 0 ){
					$(this).find('div.tags-container').remove();
					$(this).find(insertTagPosition).after(options);
				} else {
					$(this).find(insertTagPosition).after(options);
				}

			}
		}else{

			var options = '<div class="tags-container ssa-tags-container"><span class="bg-muted ssa-selected-tag">+</span>';
			options += '</div>';
			if($(this).find('div.tags-container').length > 0 ){
				$(this).find('div.tags-container').remove();
				$(this).find(insertTagPosition).after(options);
			} else {
				$(this).find(insertTagPosition).after(options);
			}
		}		
	});
	processing = false;
}


function verifyPageConversationList(){
	var conversationListFound = setInterval(function(){
		if($(fb_page_div_selector).length > 0){
			clearInterval(conversationListFound);				
			createTagDropDownContainer();
		}
	},1000);
}

