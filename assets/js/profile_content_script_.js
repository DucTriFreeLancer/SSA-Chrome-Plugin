var forProfileNumericFbId = 0;
var $checkedUsers = [];
var groupMemberProcessing = false;

var isNewLayoutForGroups = false;
var isNewLayoutForFriendsPage= false;

var spanTagPerChat = '<div class="validlogin tags-container ssa-tags-container"><span class="bg-muted ssa-selected-tag">+</span>';
spanTagPerChat += '</div>';


var spanTagCurrentProfile = '<div class="validlogin current-user-profile-parent tags-container ssa-tags-container"><span class="bg-muted current-user-profile ssa-selected-tag">+</span>';
spanTagCurrentProfile += '</div>';

var spanNoteCurrentProfile = '<div class="get-profile-notes">Notes</div>';
var spanContactInfoCurrentProfile = '<div class="get-profile-contact-info">Contact Info</div>';

var saveBtnHtml = '<div class="row custom-row text-center"> <button disabled="true" class="save-multi-tag-user" type="button" value="1">Save</button> </div> ';


var fb_list_friends_selectors =  "ul.uiList._262m";
					/********** Create Tags for each friends ********/
var fb_group_member_selectors = "div.fbProfileBrowserList ul.uiList";

////////////// for new page layout///////////

var fb_list_friends_selectors_new = "div.i1fnvgqd.lhclo0ds.btwxx1t3.j83agx80"
var fbNameForNotes = '';
$(function(){

	integrateMultiTagsForGroupMembers();

	var groupUrlFound = setInterval(()=>{
		if ($('#fb-timeline-cover-name').length > 0) {
			var pathname = window.location.href.toString();

			var visitingProfileId = false;
			if (pathname.indexOf('profile.php') > -1) {
				 visitingProfileId =(new URL(document.location)).searchParams.get('id');

			}else if(window.location.pathname.indexOf('/friends') == -1){
				 visitingProfileId = window.location.pathname.split('/')[1];
			}


			chrome.storage.local.get(["fb_id"], function(result) {
				if (typeof result.fb_id != 'undefined' && result.fb_id != '' && visitingProfileId && visitingProfileId != result.fb_id ) {
			 		findTagList(visitingProfileId);
				}
			});
		}
	},1000);
	setInterval(()=>{
		if (($('div[role="tablist"] span:contains("About")').length > 0)||($('div[role="tablist"] span:contains("Posts")').length > 0)) {
			var pathname = window.location.href.toString();

			var visitingProfileId = false;
			if (pathname.indexOf('profile.php') > -1) {
				 visitingProfileId =(new URL(document.location)).searchParams.get('id');

			}else if(window.location.pathname.indexOf('/friends') == -1){
				 visitingProfileId = window.location.pathname.split('/')[1];
			}

			chrome.storage.local.get(["fb_id"], function(result) {
				if (typeof result.fb_id != 'undefined' && result.fb_id != '' && visitingProfileId && visitingProfileId != result.fb_id ) {
				 		findTagListNew(visitingProfileId);
				}
			});
		}
	},1000);
	setInterval(()=>{

		var spanElement = $('div[role="tablist"] span:contains("Timeline")');
		var timelineExists = false;
		var fbIdTimelineElement = null;
		if(spanElement != null && spanElement != undefined) {
			fbIdTimelineElement = spanElement.parent().parent();
			timelineExists = true;
		}

		if (timelineExists == true) {
			var pathname = window.location.href.toString();

			var visitingProfileId = false;
			if (pathname.indexOf('profile.php') > -1) {
				 visitingProfileId =(new URL(document.location)).searchParams.get('id');

			}else if(window.location.pathname.indexOf('/friends') == -1){
				 visitingProfileId = window.location.pathname.split('/')[1]
			}else if(fbIdTimelineElement != null && fbIdTimelineElement != undefined){
				visitingProfileId = fbIdTimelineElement.href;
			}

			chrome.storage.local.get(["fb_id"], function(result) {
				if (typeof result.fb_id != 'undefined' && result.fb_id != '' && visitingProfileId && visitingProfileId != result.fb_id ) {
				 		findTagListNew(visitingProfileId);
				}
			});
		}
	},1000);

	var findULText = setInterval(function(){
		if($("div[data-referrer='timeline_collections_section_title']").length > 0 || $(fb_list_friends_selectors_new).length > 0){
			clearInterval(findULText);	
				
			integrateSSAMultiTags();
		}
	}, 1000);

   /////////// open tag list model for profile friends and group members 
	$(document).on('click','.ssa-tags-container span', function() {

		var pathname = window.location.href.toString();	
	 	if(pathname.indexOf("/friends") > -1 || (pathname.indexOf('profile.php') > -1 && window.location.href.indexOf('sk=friends') > -1 ) ){
			
			var clikedFBUserId = '';
			var profilePic = '';
			var fbName = '';
			if($(fb_list_friends_selectors).length == 0){   ///  new layout
				clikedFBUserId = $(this).closest('div.cts-processed').attr('fb_user_id');
				if($(this).closest('div.cts-processed').find('img').length > 0){
					profilePic = $(this).closest('div.cts-processed').find('img').attr('src');
				} 
				fbName = $(this).closest('div.cts-processed').find('a:eq(1)').text();
			}else{
				clikedFBUserId = $(this).closest('li.cts-processed').attr('fb_user_id');
				if($(this).closest('li.cts-processed').find('img').length > 0){
					profilePic = $(this).closest('li.cts-processed').find('img').attr('src');
				} 
				fbName = $(this).closest('li.cts-processed').find('div.fsl a').text();
			}

			chrome.storage.local.get(["tags", "taggedUsers"], function(result) {
				var options = '<div class="row custom-row"><div class="leve-1 tagged-name">'+fbName+'</div><div class="leve-1 close-model">X</div></div> '+searchHtml+'<div class="row custom-row"> <div class="tags-container ssa-tags-container"><ul class="model-tag-list custom-scroll">';
				if (typeof result.tags != "undefined" && result.tags != "") { 
					temp = result.tags;
					for(i=0;i<result.tags.length;i++){
						var style ='';
						if (result.tags[i].color !== null ) {
							style = 'style = "background:'+result.tags[i].color+' !important"';
							options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color'  tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.tags[i].text+"</li>";
						}else{
							options += "<li class='bg-"+result.tags[i].class+" tag-text-color' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.tags[i].text+"</li>";
						}
					}					
				}
				options += '</ul><button style="display:none;" profilePic = "'+profilePic+'" fbName = "'+fbName+'" clikedFBUserId ="'+clikedFBUserId+'" type="button" class="update-multi-tag">Update Tag</button></div>';
				$('#ssa_model_content_two').html(options);
				$('#overlay-two').show();

				var temp = result.taggedUsers.filter(function (item) { return (item.fb_user_id == clikedFBUserId || item.numeric_fb_id == clikedFBUserId)});
				
				if( temp.length > 0 ){
					var $tagIds = temp[0].tag_id.split(',');
					$tagIds.forEach(function(tagid){
						eachTagIdOne = tagid.replace(/\#/g,'');
						$('.model-tag-list li[tag-id="'+eachTagIdOne+'"] .multi-tag-checkbox').prop('checked',true);
					});	
				}

			});
		}else if(pathname.indexOf("/groups") > -1 && pathname.indexOf("/members") > -1){ //group member page

			clikedFBUserId = $(this).closest('div.cts-processed[fb_user_id]').attr('fb_user_id');
			clikedNumericFBId = $(this).closest('div.cts-processed').attr('numeric_fb_id');
			
			var profilePic = '';
			page = 0;
			if($(this).closest('div.cts-processed[fb_user_id]').find('div[aria-label="Like"]').length > 0){
				page = 1;	
			}
			if($(this).closest('div.cts-processed[fb_user_id]').closest('#groupsMemberSection_page_members').length > 0){
				page = 1;	
			}
			

			if($('#bluebarRoot').length > 0){
				if($(this).closest('div.cts-processed').find('img').length > 0){
					profilePic = $(this).closest('div.cts-processed').find('img').attr('src');
				}

			}else{

				if($(this).closest('div.cts-processed').find('image').length > 0){
					profilePic = $(this).closest('div.cts-processed').find('image:eq(0)').attr('xlink:href');
				} 
			}

		
			var fbName = $(this).closest('div.cts-processed').find('div._60ri a:first').text();
			if ($(fb_group_member_selectors).length == 0) {
				fbName = $(this).closest('div.cts-processed').find('a:eq(1)').text();
			}

			chrome.storage.local.get(["tags", "taggedUsers"], function(result) {
				var options = '<div class="row custom-row"><div class="leve-1 tagged-name">'+fbName+'</div><div class="leve-1 close-model">X</div></div> '+searchHtml+'<div class="row custom-row"> <div class="tags-container ssa-tags-container"><ul class="model-tag-list custom-scroll">';
				if (typeof result.tags != "undefined" && result.tags != "") { 
					temp = result.tags;
					for(i=0;i<result.tags.length;i++){
						var style ='';
						if (result.tags[i].color !== null ) {
							style = 'style = "background:'+result.tags[i].color+' !important"';
							options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color'  tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.  tags[i].text+"</li>";
						}else{
							options += "<li class='bg-"+result.tags[i].class+" tag-text-color' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result. tags[i].text+"</li>";
						}
					}					
				}
				options += '</ul><button style="display:none;" profilePic = "'+profilePic+'" fbName = "'+fbName+'" clikedFBUserId ="'+clikedFBUserId+'" clikedNumericFBId = "'+clikedNumericFBId+'" page = "'+page+'" type="button" class="update-multi-tag">Update Tag</button></div>';
				$('#ssa_model_content_two').html(options);
				$('#overlay-two').show();

				var temp = result.taggedUsers.filter(function (item) { return (item.fb_user_id == clikedFBUserId || item.numeric_fb_id == clikedFBUserId) });
				
				if( temp.length > 0 ){
					var $tagIds = temp[0].tag_id.split(',');
					$tagIds.forEach(function(tagid){
						eachTagIdOne = tagid.replace(/\#/g,'');
						$('.model-tag-list li[tag-id="'+eachTagIdOne+'"] .multi-tag-checkbox').prop('checked',true);
					});	
				}

			});

		}

	});

	$(document).on('click','.current-user-profile-parent span', function() {
		//var searchHtml = '<div class="row custom-row"> <input placeholder="Search tag" type="text" id="search-tag-by-name" > </div> ';
		var pathname = window.location.href.toString();
		var clikedFBUserId = false;

		var tempProfileIdNewFBLayout =  $(this).attr('numeric_fb_id');

		if (pathname.indexOf('profile.php') > -1) {
			 clikedFBUserId =(new URL(document.location)).searchParams.get('id');

		}else {
			 clikedFBUserId = window.location.pathname.split('/')[1];
		}

	 	if(clikedFBUserId){

	 		var profilePic = '';
	 		var fbName = '';

			if ($('#bluebarRoot').length == 0) {
				
				if($('div[role="banner"]').length > 0){
					fbName = $.trim($('h1[dir="auto"]:eq(0)').text());
					profilePic = $('svg.pzggbiyp[aria-label="'+fbName+'"]').find('image').attr('xlink:href');
				} 

			} else {
				
				if($('#fbTimelineHeadline').length > 0){
					profilePic = $('#fbTimelineHeadline').find('img').attr('src');
				} 

				fbName = $('#fb-timeline-cover-name a:first').text();
			}

			

			chrome.storage.local.get(["tags", "taggedUsers"], function(result) {
				var options = '<div class="row custom-row"><div class="leve-1 tagged-name">'+fbName+'</div><div class="leve-1 close-model">X</div></div> '+searchHtml+'<div class="row custom-row"> <div class="tags-container ssa-tags-container"><ul class="model-tag-list custom-scroll">';
				if (typeof result.tags != "undefined" && result.tags != "") { 
					temp = result.tags;
					for(i=0;i<result.tags.length;i++){
						var style ='';
						if (result.tags[i].color !== null ) {
							style = 'style = "background:'+result.tags[i].color+' !important"';
							options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color'  tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result.  tags[i].text+"</li>";
						}else{
							options += "<li class='bg-"+result.tags[i].class+" tag-text-color' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
							options += "><input class = 'multi-tag-checkbox' type='checkbox'>"+result. tags[i].text+"</li>";
						}
					}					
				}
				options += '</ul><button style="display:none;" profilePic = "'+profilePic+'" fbName = "'+fbName+'" clikedFBUserId ="'+clikedFBUserId+'" clickNumericFbId = "'+tempProfileIdNewFBLayout+'" type="button" class="update-multi-tag">Update Tag</button></div>';
				$('#ssa_model_content_two').html(options);
				$('#overlay-two').show();

				var temp = result.taggedUsers.filter(function (item) { return (item.fb_user_id == clikedFBUserId || item.numeric_fb_id == clikedFBUserId) });
				
				if( temp.length > 0 ){
					var $tagIds = temp[0].tag_id.split(',');
					$tagIds.forEach(function(tagid){
						eachTagIdOne = tagid.replace(/\#/g,'');
						$('.model-tag-list li[tag-id="'+eachTagIdOne+'"] .multi-tag-checkbox').prop('checked',true);
					});	
				}

			});
		
		}

	});

	$(document).on('click','.multi-tag-checkbox', function() {

	 	var pathname = window.location.href.toString();

	 	if(pathname.indexOf("friends") > -1 || pathname.indexOf("/members") > -1 || $('.current-user-profile-parent').length != 0){	

		 	$checkedTags = [];
			$('.model-tag-list li').each(function(index){
				if ($(this).find('.multi-tag-checkbox').is(':checked')) {
					$checkedTags.push($(this).attr('tag-id'));
				}
			});
			clikedFBUserId = $('.update-multi-tag').attr('clikedFBUserId');

			clikedNumericFbId = $('.update-multi-tag').attr('clikednumericfbid');

			profilePic = $('.update-multi-tag').attr('profilePic');
			fbName = $('.update-multi-tag').attr('fbName');
			page = $('.update-multi-tag').attr('page');
		
			if (clikedFBUserId == 'undefined') {
				alert("Invalid Member to Tag");
			}else{
				fromPage='userGroup';
				if (('.current-user-profile-parent').length > 0) {
					clikedNumericFbId = forProfileNumericFbId;
				}

				updateFBUsertagProfile(JSON.stringify($checkedTags),clikedFBUserId,clikedNumericFbId,profilePic, fbName,fromPage,page);
			}
		}
	});

	$(document).on('click','.select-all-friends', function() { // all tag
		selectAll = true;
		if ($(this).is(':checked')){
			selectAll = true;
		}else{
			selectAll = false;
		}

		//console.log($('.add-mult-tag-user:checkbox:checked').length);
		if ($('.add-mult-tag-user:checkbox:checked').length <= 249 ) {
			$('li.cts-processed, div.cts-processed').each(function(index){
				if ($('.add-mult-tag-user:checkbox:checked').length <= 249 ) {
					$(this).find('.add-mult-tag-user').prop('checked',selectAll)
				}
			});
		}else{
			alert('You can add maximum of 250 contacts at once.');
		}

	});

	setInterval(()=>{
		if($('.add-mult-tag-user:checkbox:not(:checked)').length > 0){
			$('.select-all-friends').prop('checked',false)
		}
		$('span.total-selected').text('Selected: '+$('.add-mult-tag-user:checkbox:checked').length);
	},200);

	$(document).on('click','.assign-tag-btn', function() { // all tag
		if ($('.add-mult-tag-user:checkbox:checked').length <= 250 ) {
			$checkedUsers = [];
			$('li.cts-processed, div.cts-processed').each(function(index){
				if ($(this).find('.add-mult-tag-user').is(':checked')) {
					
					tempUser = {};
					var profilePic = '';

					if($(this).find('img').length > 0){
						profilePic = $(this).find('img').attr('src');
					}

					var fbName = $(this).find('div.fsl a').text();
					if (isNewLayoutForFriendsPage) {
						fbName = $(this).find('a:eq(1)').text();
					} 

					tempUser.fb_user_id = $(this).attr('fb_user_id')
					tempUser.profilePic = profilePic
					tempUser.fbName = fbName;

					$checkedUsers.push(tempUser);

				}
			});

			if ($checkedUsers.length > 0) {
				showMultiTagList();
			}else{
				alert('Please select alteast one user');
			}
		}else{
			alert('You can add maximum of 250 contacts at once.');
		}
	});

	$(document).on('click','.multi-tag-checkbox-multi-user', function() {
	 	var pathname = window.location.href.toString();	
	 	if(pathname.indexOf("/friends") > -1 || (pathname.indexOf('profile.php') > -1 && window.location.href.indexOf('sk=friends') > -1 ) ){	
 			$checkedTagsTemp = [];
			$('.model-tag-list li').each(function(index){
				if ($(this).find('.multi-tag-checkbox-multi-user').is(':checked')) {
					$checkedTagsTemp.push($(this).attr('tag-id'));
				}
			});

			if ($checkedTagsTemp.length == 0) {
				$('.save-multi-tag-user').prop('disabled',true);
			}else{
				$('.save-multi-tag-user').prop('disabled',false);
			}
		}
	});

	$(document).on('click','.save-multi-tag-user', function() {
		$(this).text('Saving...').attr('disabled',true);
		//if ($(this).is(':checked')) {
			
			var pathname = window.location.href.toString();	
			if(pathname.indexOf("/friends") > -1 || (pathname.indexOf('profile.php') > -1 && pathname.indexOf('sk=friends') > -1 ) ){
				$checkedTags = [];
			   $('.model-tag-list li').each(function(index){
				   if ($(this).find('.multi-tag-checkbox-multi-user').is(':checked')) {
					   $checkedTags.push($(this).attr('tag-id'));
				   }
			   });

			   if ($checkedTags.length > 0) {
					updateFBUsertagForMultiUser($checkedTags);
					setTimeout(()=>{
						$(".save-multi-tag-user").text('Save').attr('disabled',false);
					},2000)
			   }
		   }else if(pathname.indexOf("/members") > -1 ){
				$checkedTags = [];
				$('.model-tag-list li').each(function(index){
					if ($(this).find('.multi-tag-checkbox-multi-user').is(':checked')) {
						$checkedTags.push($(this).attr('tag-id'));
					}
				});

				if ($checkedTags.length > 0) {
					updateFBUsertagForMultiUserOnGroupMember($checkedTags);
					setTimeout(()=>{
						$(".save-multi-tag-user").text('Save').attr('disabled',false);
					},2000)
			}

		}
	//	}	
	});
	/*contact-info-profile-page*/
	$(document).on('click','.get-profile-notes', function() {
		// var url = window.location.href;
		// if(url.indexOf('profile.php') > -1){
		// 	var loc = url.split('=');
		// }else{
		// 	var loc = url.split("/");
		// }
	
	
		var pathname = window.location.href.toString();
	
		var cliked_Fb_Id = '';
		if (pathname.indexOf('profile.php') > -1) {
			 cliked_Fb_Id =(new URL(document.location)).searchParams.get('id');
	
		}else if(window.location.pathname.indexOf('/friends') == -1){
			 cliked_Fb_Id = window.location.pathname.split('/')[1];
		}
	
	
	
		$('#ssa_model_two').addClass('notes-modal');
	
		fbNameForNotes = $('h1[dir="auto"]:not(:contains("Notifications"))').text();
		$('#ssa_model_two').removeClass('contact-info-modal');
		$('#ssa_model_two').addClass('notes-modal');
		
		$('#overlay-two #ssa_model_content_two').text('loading notes for '+fbNameForNotes).show()
		var notes = `<div class="row custom-row">
						<input id="fb_id_for_notes" type="hidden" value="`+cliked_Fb_Id+`">
						<div class="leve-1 tagged-name">`+fbNameForNotes+`</div>
						<div class="leve-1 close-model">X</div>
					</div>
					<div class="msg-for-notes ssa-cols ssa-col-md-12 text-center"></div> 
					<div  class ="content-user-notes-container"> 						
						<div class="ssa-cols ssa-col-md-12 text-center" > 
							<button class="add-notes-from-content bg-purple ssa-btn ssa-col-md-12	">Add Note</button>
						</div>
						<div class="ssa-cols ssa-col-md-12" >
							<hr>
						</div>
						<div class="row-container custom-scroll ssa-cols ssa-col-md-12">`; 
		$('#ssa_model_content_two').html(notes);
		//$('#overlay-two').show();				
		chrome.runtime.sendMessage({getUserNotes: "getUserNotes", fb_user_id: cliked_Fb_Id});
		return false;
	});
	
	/*contact-info-profile-page*/
	
	$(document).on('click','.get-profile-contact-info', function() {
			
		var url = window.location.href;
		var loc = '';
	
			var user_Fb_Id ='';
		if(url.indexOf('profile.php') > -1){
			loc = url.split('=');
	
			user_Fb_Id = loc[loc.length-1];
		}else {
			user_Fb_Id = window.location.pathname.split('/')[1];
	
		}
		$('#ssa_model_two').addClass('contact-info-modal');
		
		fbNameForContact = $('h1[dir="auto"]:not(:contains("Notifications"))').text();
	
		$('#overlay-two #ssa_model_content_two').text('loading contact info for '+fbNameForContact).show();
		var contact = `<div class="row custom-row">
						<div class="leve-1 tagged-name">`+fbNameForContact+`</div>
						<div class="leve-1 close-model">X</div>
					</div>
					<div class="msg-for-contact ssa-cols ssa-col-md-12 text-center"></div> 
					<div  class ="content-user-contact-container"> 	
											
						<div class="ssa-cols ssa-col-md-12 text-center" id="contact-info-add-btn" > 
							<button class="add-contact-list-from-content bg-purple ssa-btn ssa-col-md-12">Add info</button>
						</div>
						<div class="ssa-cols ssa-col-md-12" >
							<hr>
						</div>
						
						<input type="hidden"  id="user-fb-id" value="`+user_Fb_Id+`">
						
						<div class="row-container custom-scroll ssa-cols ssa-col-md-12" id="contact-info-modal">
						</div>
						<div id="contact-list-btn-model" class ="col-12 text-center contact-info-footer"> 
							<button type="button" class="save-contact-list" id="contact-info-save-btn">Save</button>
							<button type="button" class="close-model" id="contact-info-cancel-btn">Cancel</button>
						</div>`; 
		$('#ssa_model_content_two').html(contact);	
		$('#overlay-two').show();
		chrome.storage.local.get(["ssa_user"], function(result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
				var userId = result.ssa_user.id;
				chrome.runtime.sendMessage({getUserContactInfoForContent: "getUserContactInfoForContent", data: {fbUserId:user_Fb_Id,userId:userId,loggedInFBId:currentLoggedInFBId}});
			}
		});
	});
	$(document).on('click','.add-contact-list-from-content', function() {
		$('.contact-info-footer').show();
		var contactInfoHtml = `<div class="form-group row contact-info-model-row">
					    <div class="col-4 contact_label">
					      <input type="text"  class="form-control contactfieldLabel"  required placeholder="Label">
					    </div>
					    <div class="col-6 p-0 contact_value">
					      <input type="text"  class="form-control contactfieldValue"  required placeholder="Value">
					    </div>
					    <div class="col-2 pr-0 pl-2 contact-btn-model"> <button title="Delete" class="delete-contact-info">Delete</button></div>
					  </div>`;
		$('#contact-info-modal').append(contactInfoHtml);
		return false;
	});

	$(document).on('click','.delete-contact-info',function(){
		if($('.contact-info-model-row').length == 1){
			if($('.contactfieldLabel').val() == ''){
				$('.contact-info-footer').hide();
			}else{
				$('.contact-info-footer').show();
			}
		}	
		$(this).parent().parent().remove();
	})

	$(document).on('click','.save-contact-list',function(){
		var userFbId = $('#user-fb-id').val();
		var contactsInfo = [];
		$(".contact-info-model-row").each(function(index,item){
			var tempData={};
			index = index + 1;
			label = $(this).find('.contactfieldLabel').val();
			value = $(this).find('.contactfieldValue').val();
			if(label!=''){
				tempData.label = label;
				slug = convertToSlug(label);
				tempData.slug = slug+'-'+index;
			}
			if(value!=''){
				tempData.value = value;
			}

			if(Object.keys(tempData).length>0){
				contactsInfo.push(tempData);
			}
		});
		if(contactsInfo.length == 0){
			var info = null;
		}else{
			var info = JSON.stringify(contactsInfo);
		}

		chrome.storage.local.get(["ssa_user"], function(result) {

			if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
				var userId = result.ssa_user.id;
				chrome.runtime.sendMessage({saveContactInfoFromContent: "saveContactInfoFromContent", data: {fbUserId:userFbId,userId:userId,loggedInFBId:currentLoggedInFBId,contactsInfo:info}});
			}
		});	
	})

	$(document).on('click','.edit-contact-info',function(){
		$(this).parent().parent().find('.contactSpanLabel').hide();
		$(this).parent().parent().find('.contactfieldLabel').show().focus();;
	});
	/*end contact-info-profile-page*/
});


function updateFBUsertagForMultiUser($checkedTags) {  
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			
			port.postMessage({'type': 'updateFBUsertagForMultiUser','data': {userId:result.ssa_user.id,loggedInFBId: result.fb_id, tagsArray:$checkedTags, checkedUsers: $checkedUsers}});		
		}
	});
}
function updateFBUsertagForMultiUserOnGroupMember($checkedTags){
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			port.postMessage({'type': 'updateFBUsertagForMultiUserOnGroupMember','data': {userId:result.ssa_user.id,loggedInFBId: currentLoggedInFBId, tagsArray:$checkedTags, checkedUsersForGroup: $checkedUsersForGroup}});		
		}
	});

}

function showMultiTagList() {
	chrome.storage.local.get(["tags"], function(result) {
		var options = '<div class="row custom-row"><div class="leve-1 tagged-name">'+' '+'</div><div class="leve-1 close-model">X</div></div> '+searchHtml+saveBtnHtml+'<div class="row custom-row"> <div class="tags-container ssa-tags-container"><ul class="model-tag-list custom-scroll">';
		if (typeof result.tags != "undefined" && result.tags != "") { 
			temp = result.tags;
			for(i=0;i<result.tags.length;i++){
				var style ='';
				if (result.tags[i].color !== null ) {
					style = 'style = "background:'+result.tags[i].color+' !important"';
					options += "<li "+style+" color-code= '"+result.tags[i].color+"' class='tag-text-color'  tag-id='"+result.tags[i].value+"'";
					options += "><input class = 'multi-tag-checkbox-multi-user' type='checkbox'>"+result.  tags[i].text+"</li>";
				}else{
					options += "<li class='bg-"+result.tags[i].class+" tag-text-color' color-code= '0' li-class='"+result.tags[i].class+"' tag-id='"+result.tags[i].value+"'";
					options += "><input class = 'multi-tag-checkbox-multi-user' type='checkbox'>"+result. tags[i].text+"</li>";
				}
			}					
		}
		options += '</ul></div>';
		$('#ssa_model_content_two').html(options);
		$('#overlay-two').show();

		

	});
}



function integrateMultiTagsForGroupMembers() {
	setInterval(function(){
			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
				if ( typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0  &&  !groupMemberProcessing) { 
					if(window.location.pathname.indexOf('/groups') > -1 && window.location.pathname.indexOf('/members') > -1){
						/********** Create Tags for each friends ********/
						groupMemberProcessing = true;
						isNewLayoutForGroups = true;
						if ($(fb_group_member_selectors).length > 0) {

							isNewLayoutForGroups = false;
							$(fb_group_member_selectors).children('div.clearfix._60rh._gse:not(".cts-processed")').each(function(index) {
								 //$(this).find('div.uiProfileBlockContent a[data-gt]').addClass('sachin4556');
								var profileUrl = $(this).find('div._60ri a').attr('href');
								memberId = false;
								if(isUrlValid(profileUrl)){
									var url = new URL(profileUrl);
									
									if (url.pathname.indexOf('profile.php') > -1) {
										 memberId = url.searchParams.get("id");
									}else{
										
										memberId = url.pathname.replace("/", "");
										memberId = memberId.replace("/", "");
										
									}
								}
								

								if (memberId) {
									$(this).attr('fb_user_id',memberId);
								}
								$(this).attr('numeric_fb_id','0');
								$(this).find('div.uiProfileBlockContent').before(spanTagPerChat);

								$(this).addClass('cts-processed');
							
							});
						}else { /// iframe for new layout 
							
							$("div.obtkqiv7 div[data-visualcompletion='ignore-dynamic']:not('.cts-processed')").each(function(index) {
								
								var profileUrl = $(this).find('a:eq(0)').attr('href');
								memberId = false;
								// if(isUrlValid(profileUrl)){
								// 	var url = new URL(profileUrl);
								// 	if (url.pathname.indexOf('profile.php') > -1) {
								// 		 memberId = url.searchParams.get("id");
								// 	}else{
								// 		memberId = url.pathname.replace("/", "");;
								// 	}
								// }

								memberId = extractProfileId($(this).find('a:eq(0)').attr('href'))


								if (memberId) {
									$(this).attr('fb_user_id',memberId);
								}
								$(this).attr('numeric_fb_id','0');
								checkBoxHtml = '<span class="validlogin checkbox-container new-fb-group-member-page"><input type="checkbox" class="add-mult-tag-user-group-member" ><span>';
								if($(this).find('div:eq(0)').find('span:contains(Like)').length == 0){
									$(this).find('div:eq(0)').after(checkBoxHtml);
								}
								$(this).append(spanTagPerChat);
								$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-group-member-page-li');
								$(this).addClass('cts-processed');
							
							});

						}
						
						if(result.isCurrentFBLinked){
							
							$(".tags-container").show();
						} else {
							$(".tags-container").hide();
						}

						/********** Tag Users ********/
						if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
							tagUsersForGroupMembers(result.taggedUsers,result.tags);
						}
						if ($('.assign-tag-btn-select-all-group').length == 0) {
							
							selectAllTagShow();
					
						}
						
					}
					else{
					
						$('.assign-tag-btn-group').remove();
					}
				}else{
					$('.validlogin').hide();
				}

				if (window.location.pathname.indexOf('/friends') == -1) {
					$('.assign-tag-btn').remove();
				}

				

			});

	},2000);
}


function integrateSSAMultiTags() { ////////// friends page
	var tt = setInterval(function(){
		//clearInterval();
			chrome.storage.local.get(["ssa_user","tags", "taggedUsers","isCurrentFBLinked"], function(result) {
				if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0  ) { 
					if(window.location.pathname.indexOf('/friends') > -1 || window.location.href.indexOf('sk=friends') > -1){
					/********** Create Tags for each friends ********/
						$('.current-user-profile-parent').remove();
						isNewLayoutForFriendsPage = true;
						if($(fb_list_friends_selectors).length > 0){  // old layout
							isNewLayoutForFriendsPage = false;
							$(fb_list_friends_selectors).children('li:not(".cts-processed")').each(function(index) {
							
								var profileUrl = $(this).find('div.fsl a').attr('href');
								memberId = false;
								if(isUrlValid(profileUrl)){
									var url = new URL(profileUrl);
									if (url.pathname.indexOf('profile.php') > -1) {
										 memberId = url.searchParams.get("id");
									}else{
										memberId = url.pathname.replace("/", "");;
									}
								}

								if (memberId) {
									$(this).attr('fb_user_id',memberId);
								}

								checkBoxHtml = '<span class="validlogin checkbox-container"><input type="checkbox" class="add-mult-tag-user" ><span>';
								$(this).find('div.uiProfileBlockContent').before(checkBoxHtml);
								$(this).find('div.uiProfileBlockContent').after(spanTagPerChat);

								$(this).addClass('cts-processed');
							
							});
						}else{ /// new layout
							$(fb_list_friends_selectors_new+' > div:not(".cts-processed")').each(function(index) {
								
								var profileUrl = $(this).find('a:eq(1)').attr('href');
							
								memberId = false;
								if(isUrlValid(profileUrl)){
									var url = new URL(profileUrl);
									if (url.pathname.indexOf('profile.php') > -1) {
										 memberId = url.searchParams.get("id");
									}else{
										memberId = url.pathname.replace("/", "");;
									}
								}

								if (memberId) {
									$(this).attr('fb_user_id',memberId);
								}

								checkBoxHtml = '<span class="validlogin checkbox-container new-fb-friends-page"><input type="checkbox" class="add-mult-tag-user" ><span>';
								$(this).find('div:eq(0)').after(checkBoxHtml)
								$(this).children().last().after(spanTagPerChat)

								$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-friend-page-li');

								$(this).addClass('cts-processed');
							
							});
						}
																
						if(result.isCurrentFBLinked){
							$(".tags-container").show();
						} else {
							$(".tags-container").hide();
						}

						/********** Tag Users ********/
						if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "") { 
							tagUsersForProfileFriends(result.taggedUsers,result.tags);
						}

						var showTagBtn = '<span class="assign-tag-btn-select-all validlogin"><input class="select-all-friends" type="checkbox"><span class="checkmark"></span><span class="total-selected"></span></span><span class="assign-tag-btn validlogin">Tag All</span>';	
						if ($('.assign-tag-btn').length ==0) {
							if($(fb_list_friends_selectors).length > 0){
								$("div[data-referrer='timeline_collections_section_title'] h3").after(showTagBtn);
							}else{
								$("h2 a[role='link']:contains('Friends')").after(showTagBtn);
								$('.assign-tag-btn').addClass('assign-tag-btn-new-layout');
							}
						}
					}else{
					
						$('.assign-tag-btn').remove();
					}
				}else{
					$('.validlogin').hide();
				}

			});

	},2000);
}



function tagUsersForProfileFriends(taggedUsers,tags){
	if($(fb_list_friends_selectors).length == 0){ /// new layout
		
		$("div.cts-processed").each(function() {
			var li_fb_user_id = $(this).attr('fb_user_id');
			if (typeof li_fb_user_id != 'undefined') {
				taggedUsers = taggedUsers != null ? taggedUsers : [];
				var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id)});
				if( temp.length > 0 ){
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
						$(this).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
						if ($colorCode == null) {
							$(this).find('.tags-container span').addClass('bg-'+$liClass);
						}else{
							$(this).find('.tags-container span').removeClass('bg-muted');
							$(this).find('.tags-container span').css('background',$colorCode);
							$(this).find('.tags-container span').addClass('tag-text-color');
						}
					}else{
						if($(this).find('div.tags-container').length > 0 ){
							$(this).find('div.tags-container').remove();
							//$(this).find('div.uiProfileBlockContent').after(spanTagPerChat);
							$(this).children().last().after(spanTagPerChat)
							$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-friend-page-li');
						} else {
							$(this).find('div:eq(-1)').before(spanTagPerChat)
							$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-friend-page-li');
						}
					}
				}else{
			
						if($(this).find('div.tags-container').length > 0 ){
							$(this).find('div.tags-container').remove();
							$(this).children().last().after(spanTagPerChat)
							$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-friend-page-li');
						} else {
							$(this).children().last().after(spanTagPerChat)
							$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-friend-page-li');
						}
				}
			}		
		});
	}else{
		$("li.cts-processed").each(function() {
			var li_fb_user_id = $(this).attr('fb_user_id');
			var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id)});
			if( temp.length > 0 ){
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
					$(this).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
					if ($colorCode == null) {
						$(this).find('.tags-container span').addClass('bg-'+$liClass);
					}else{
						$(this).find('.tags-container span').removeClass('bg-muted');
						$(this).find('.tags-container span').css('background',$colorCode);
						$(this).find('.tags-container span').addClass('tag-text-color');
					}
				}else{
					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
						$(this).find('div.uiProfileBlockContent').after(spanTagPerChat);
					} else {
						$(this).find('div.uiProfileBlockContent').after(spanTagPerChat);
					}
				}
			}else{
		
					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
					$(this).find('div.uiProfileBlockContent').after(spanTagPerChat);
					} else {
						$(this).find('div.uiProfileBlockContent').after(spanTagPerChat);
					}
			}		
		});
	}

	chrome.storage.local.get(["isCurrentFBLinked"], function(result) {
			if(result.isCurrentFBLinked){
				$(".tags-container").show();
			} else {
				$(".tags-container").hide();
			}
	})

}

function tagUsersForGroupMembers(taggedUsers,tags){
	if ($(fb_group_member_selectors).length == 0) {
		$("div.cts-processed[fb_user_id]").each(function() {
			var li_fb_user_id = $(this).attr('fb_user_id');
			var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id) });
			if( temp.length > 0 ){
				$liClass = '';
				$colorCode = '';
				
				var $tagIds = [];
				if( temp.length > 0 ){
					if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
						$tagIds = temp[0].tag_id.split(',');
					} else {
						$tagIds = temp[0].tag_id;
					}
				}
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
					$(this).find('.tags-container span').text(spanText);
					$(this).find('.tags-container span').prop('title',title.slice(0, -1));
					$(this).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
					if(numeric == null){
						$(this).attr('numeric_fb_id','0');
					}else{
						$(this).attr('numeric_fb_id',numeric);
					}
					if ($colorCode == null) {
						$(this).find('.tags-container span').addClass('bg-'+$liClass);
					}else{
						$(this).find('.tags-container span').removeClass('bg-muted');
						$(this).find('.tags-container span').css('background',$colorCode);
						$(this).find('.tags-container span').addClass('tag-text-color');
					}
				}else{
					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
						//$(this).find('a:eq(1)').parent().after(spanTagPerChat);
						$(this).append(spanTagPerChat);
						$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-group-member-page-li');
					} else {
						//$(this).find('a:eq(1)').parent().after(spanTagPerChat);
						$(this).append(spanTagPerChat);
						$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-group-member-page-li');
					}
				}
			}else{
		
					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
						//$(this).find('a:eq(1)').parent().after(spanTagPerChat);
						$(this).append(spanTagPerChat);
						$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-group-member-page-li');
					} else {
						//$(this).find('a:eq(1)').parent().after(spanTagPerChat);
						$(this).append(spanTagPerChat);
						$(this).find('.validlogin.tags-container.ssa-tags-container').addClass('cts-group-member-page-li');
					}
			}		
		});
	} else { ///////// old layout //////////////

		$("div.cts-processed[fb_user_id]").each(function() {

			var li_fb_user_id = $(this).attr('fb_user_id');
			var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id)});

			if( temp.length > 0 ){
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
					$(this).find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
					if ($colorCode == null) {
						$(this).find('.tags-container span').addClass('bg-'+$liClass);
					}else{
						$(this).find('.tags-container span').removeClass('bg-muted');
						$(this).find('.tags-container span').css('background',$colorCode);
						$(this).find('.tags-container span').addClass('tag-text-color');
					}
				}else{
					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
						$(this).find('div.uiProfileBlockContent').before(spanTagPerChat);
					} else {
						$(this).find('div.uiProfileBlockContent').before(spanTagPerChat);
					}
				}
			}else{
		
					if($(this).find('div.tags-container').length > 0 ){
						$(this).find('div.tags-container').remove();
					$(this).find('div.uiProfileBlockContent').before(spanTagPerChat);
					} else {
						$(this).find('div.uiProfileBlockContent').before(spanTagPerChat);
					}
			}		
		});
	}

	chrome.storage.local.get(["isCurrentFBLinked"], function(result) {
			if(result.isCurrentFBLinked){
				$(".tags-container").show();
			} else {
				$(".tags-container").hide();
			}
	})
	groupMemberProcessing = false;
}



function findTagList(profileId) {
 //	setInterval(()=>{
		chrome.storage.local.get(["ssa_user","tags","taggedUsers"], function(result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
				var loc1 = profileId;
			
				if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "" && typeof result.tags != "undefined" && result.tags != "" && window.location.pathname.indexOf('/friends') == -1 && window.location.href.indexOf('sk=friends') == -1) { 

					var taggedUsers = result.taggedUsers;
					var li_fb_user_id = profileId;
				
					var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id) });
				
					if( temp.length > 0 ){

						forProfileNumericFbId = temp[0].numeric_fb_id; 
						var $tagIds = temp[0].tag_id.split(',');
						var totalTagLi = '<ul class="right-side-tag-list">';
						var title = '';
						var spanText = '';
						$tagIds.forEach(function(eachTagId){
							liclass = '';
							liStyle = '';
							eachTagIdOne = eachTagId.replace(/\#/g,'');
							var foundTag = result.tags.filter(function (item) { return item.value == eachTagIdOne});
							if (foundTag.length > 0) {
								$liClass = foundTag[0].class;
								$colorCode = foundTag[0].color;
								liText = foundTag[0].text;

								title += foundTag[0].text+', ';
		
								spanText = foundTag[0].text;

								if ($colorCode== null) {
									liclass = 'bg-'+$liClass;
								}else{
									liStyle = 'style = "background-color:'+$colorCode +'";'
								}
					
								totalTagLi += '<li '+liStyle+' class="'+liclass+'">'+liText+'</li>';
							}

						})

						totalTagLi += '</ul>';

						if ($('.right-side-tag-list').length > 0) {
							$('.right-side-tag-list').remove();
						}
 						$('#fb-timeline-cover-name').parent().before(totalTagLi);

						$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li .current-user-profile-parent').remove();
						$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').append(spanTagCurrentProfile);
 						if (title != '') {
 							
							$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').text(spanText);
							$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').prop('title',title.slice(0, -1));
							$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
							if ($colorCode == null) {
								$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').addClass('bg-'+$liClass);
							}else{
								$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').removeClass('bg-muted');
								$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').css('background',$colorCode);
								$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').find('.tags-container span').addClass('tag-text-color');
							}
						}
					}else{
						$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li .current-user-profile-parent').remove();
						$('.current-user-profile-parent').attr('numeric_fb_id', '0');
						$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li:last').append(spanTagCurrentProfile);
					}
				}else{

					$('#fbTimelineHeadline ul[data-referrer="timeline_light_nav_top"] li .current-user-profile-parent').remove();
				}	

			}
		});
	//}, 2000);
}

function findTagListNew(profileId) {

		chrome.storage.local.get(["ssa_user","tags","taggedUsers"], function(result) {
			if (typeof result.ssa_user != "undefined" && result.ssa_user != "" && result.ssa_user.id > 0) { 
				var loc1 = profileId;
			
				if (typeof result.taggedUsers != "undefined" && result.taggedUsers != "" && typeof result.tags != "undefined" && result.tags != "" && window.location.pathname.indexOf('/friends') == -1 && window.location.href.indexOf('sk=friends') == -1) { 

					var taggedUsers = result.taggedUsers;
					var li_fb_user_id = profileId;
					var temp = taggedUsers.filter(function (item) { return (item.fb_user_id == li_fb_user_id || item.numeric_fb_id == li_fb_user_id)});
					var $tagIds = [];
					if( temp.length > 0 ){
						forProfileNumericFbId = temp[0].numeric_fb_id; 						
						if( temp.length > 0 ){
							if(temp[0].tag_id != null && typeof temp[0].tag_id == 'string') {
								$tagIds = temp[0].tag_id.split(',');
							} else {
								$tagIds = temp[0].tag_id;
							}
						}
						var totalTagLi = '<ul class="right-side-tag-list visiting-profile-tag-list-new">';
						var title = '';
						var spanText = '';
						$tagIds.forEach(function(eachTagId){
							liclass = '';
							liStyle = '';
							eachTagIdOne = eachTagId.replace(/\#/g,'');
							var foundTag = result.tags.filter(function (item) { return item.value == eachTagIdOne});
							if (foundTag.length > 0) {
								$liClass = foundTag[0].class;
								$colorCode = foundTag[0].color;
								liText = foundTag[0].text;

								title += foundTag[0].text+', ';
		
								spanText = foundTag[0].text;

								if ($colorCode== null) {
									liclass = 'bg-'+$liClass;
								}else{
									liStyle = 'style = "background-color:'+$colorCode +'";'
								}
					
								totalTagLi += '<li '+liStyle+' class="'+liclass+'">'+liText+'</li>';
							}

						})

						totalTagLi += '</ul>';

						if ($('.right-side-tag-list').length > 0) {
							$('.right-side-tag-list').remove();
						}
 						// $('h1[dir="auto"]').parent().parent().parent().parent().parent().parent().after(totalTagLi);

						// $('.current-user-profile-parent').remove();
						if(($('div[aria-label="Page Header and Tools Navigation"]').length == 0) &&( $('div[aria-label="Page header and tools navigation"]').length == 0)){
							$('h1[dir="auto"]:not(:contains("Notifications"))').parent().parent().parent().parent().parent().parent().after(totalTagLi);

							if($('.get-profile-notes').length == 0){
							   $('h1[dir="auto"]').parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().before(spanNoteCurrentProfile);
							   /*$('h1[dir="auto"]').parent().parent().parent().parent().parent().parent().parent().after(spanContactInfoCurrentProfile);*/
							   
						   }

						   if($('.get-profile-contact-info').length == 0){
							   $('h1[dir="auto"]').parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().before(spanContactInfoCurrentProfile);
						   }


						   $('div[role="tablist"] .current-user-profile-parent').remove();
					   
						   $('div[role="tablist"] div[aria-haspopup="menu"]').after(spanTagCurrentProfile);
						}
						// $('div[role="tablist"]').after(spanTagCurrentProfile);
 						if (title != '') {

							$('div[role="tablist"]').find('.tags-container span').text(spanText);
							$('div[role="tablist"]').find('.tags-container span').prop('title',title.slice(0, -1));
							$('div[role="tablist"]').find('.tags-container span').removeClass('bg-primary bg-danger bg-success bg-warning bg-dark bg-info');
							if ($colorCode == null) {
								$('div[role="tablist"]').find('.tags-container span').addClass('bg-'+$liClass);
							}else{
								$('div[role="tablist"]').find('.tags-container span').removeClass('bg-muted');
								$('div[role="tablist"]').find('.tags-container span').css('background',$colorCode);
								$('div[role="tablist"]').find('.tags-container span').addClass('tag-text-color');
							}
						}
					}else{
						$('.current-user-profile-parent').remove();
						$('.get-profile-contact-info').remove();
						$('.get-profile-notes').remove();
						if(window.location.href.indexOf('/groups/') == -1 && $('div[aria-label="Page Header and Tools Navigation"]').length == 0 && $('div[aria-label="Page header and tools navigation"]').length == 0 ){
							$('div[role="tablist"] div[aria-haspopup="menu"]').after(spanTagCurrentProfile);
							if($('.get-profile-notes').length == 0){
								$('h1[dir="auto"]').parent().parent().parent().parent().parent().parent().parent().parent().parent().parent().before(spanNoteCurrentProfile);
							}
						}
					}
				}else{
					$('.get-profile-notes').remove();
					$('.get-profile-contact-info').remove();
					$('.current-user-profile-parent').remove();
				}	

			}
		});
	
}

function updateFBUsertagProfile(tagId, fbUserId, numericFbId, profilePic, fbName='',fromPage,page){
	chrome.storage.local.get(["ssa_user"], function(result) {
		if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			port.postMessage({'type': 'updateFBUsertag','fromPage':fromPage,'data': {tagId:tagId, userId:result.ssa_user.id, isPage:page, loggedInFBId: currentLoggedInFBId, fbUserId: fbUserId,numericFbId:numericFbId, profilePic:profilePic, fbName: fbName}});		
		}
	});
}

function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
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

function selectAllTagShow(){
	setInterval(()=>{

		if( window.location.pathname.indexOf('/members') >-1){
			var showTagBtnGroupPage = '<span class="assign-tag-btn-select-all-group validlogin"><input class="select-all-friends-group" type="checkbox"><span class="checkmark"></span><span class="total-selected-group-member"></span></span><span class="assign-tag-btn-group validlogin">Tag All</span>';

			if(!$('.assign-tag-btn-select-all-group').length)
			$("body").append(showTagBtnGroupPage);
			$('.assign-tag-btn-group').addClass('assign-tag-btn-new-layout-group');

		}else{
			$('.assign-tag-btn-select-all-group, .total-selected-group-member').remove();
		}

	},2000);
}