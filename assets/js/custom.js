

var baseUrl = custom_data.baseUrl;
var uniqueHash = null;
var remindersLimit = 3;
var reminderLoaderRunning = false;
var noMessagesUnderTemplate = '<p class="mt-2 no-data-msg">Add new messages for this template to list here.</p>';
var deletetemplateId;
var tempTemplate;
var noTemplateMsg = '<p id="default-template-message" class="mt-2 no-data-msg">Add new templates to list here.</p>';
var templatesLoaderRunning = false;
var tempMessage;
var tempMessageId;
var selectedTemplateId;
var selected_tag = 0;
var tagName;
var tagId;
var accountConfig = {};
var is_expired = 0;
var partner_url ='';
var tagColors = ['warning','primary','danger','success','dark','info'];
var requests = [];
var templateRequests = [];
var loggedInFBId = null;
var isFacebookMessagePage = true;
var totalContactsUnderAllTags = 0;
var contactsLoaderRunning = false;
var messagesLoaderRunning = false;
var notesLoaderRunning = false;
var noteId;
var loadedNotesLastIndex = 10;
var reminderId;
var unlink_fb_id;
var FBMessengerisActive = false;
var isBulkRunning = false;
var profile_pic;
var constactCountPerTag = 0;
var searchTemplate='';
var searchTeam='';
var searchMessage='';
var messageRequests=[];
var tagContactRequests=[];
var teamRequests = [];
var adfIsRunning = false;
var adfTabId = false;
var randomMessageField = `<div class="row bulk-text-row">
									<div class="col-11 p-0">
										<form action="#">
										  <div class="form-group" >
											<textarea class="form-control bulk-messge-text" rows="3" id="bulk-messge-text" placeholder="Type your message here"></textarea>
										  </div>
										</form>
									</div> 
									<div class="col-1 tags delete-bulk-textarea" >
									   <i class="fa fa-trash" title="delete"></i>
									</div>
								</div>`;
var randomRequestPreMessageField = `<div class="row tabbed request-message-text-row">
										<div class="col-10 p-0 ">
											<div class="form-group">
											Variables to use : [first_name] [last_name]
												<textarea class="form-control request-messge-text bulk-messge-text" id="message-one" >Hey [first_name] [last_name],\n\nThank you so much for sending me a friend request.\n\nI'm sending you this message to ensure am about to connect to a real person and not bots.\n\nFeel free to reply me here and I will accept your friend request.\n\nTalk soon.\n\nPS: Check out https://upgradeyourfb.com if you would like to automate your Facebook Organic Marketing.
												</textarea>
											</div>
										</div>
										<div class="col-2">
											<img src="assets/images/delete.png" class="mt-4 delete-request-textarea">
										</div>
									</div>`;
var randomRequestMessageField = `<div class="row tabbed request-message-text-row dynamic-row">
										    <div class="col-10 p-0 ">
												<div class="form-group">
												Variables to use : [first_name] [last_name]
													<textarea class="form-control request-messge-text" id="message-four" >[first_name] [last_name]\n\nSounds good.\n\nI have accepted your friend request.\n\nNow, tell me how I can help you today :)\n\nLooking forward to your DM.
													</textarea>
												</div> 
											</div>
											<div class="col-2">
											   <img src="assets/images/delete.png" class="mt-4 delete-request-textarea">
											</div>
										</div>`;

var noTeamMsg = '<p id="default-team-message" class="mt-2 no-data-msg">Add new teams to list here.</p>';

chrome.cookies.get({url: baseUrl,name: "cts_unique_hash"}, function(result) {
    if(result != null){
       uniqueHash = result.value;
    }
});

function handleError() {
	this.src = "/assets/images/default-user.jpg";
}
//////////// also save group settings////////
function startSendFriendRequests() { ///1433
    var limit = $('#adf-limit').val();
    
    if (limit == '') {
        limit = 'allmembers';
    }else {
        limit = parseInt(limit)
    }

	var startat= $('#adf-start-at').val();
	if (startat == '') {
        startat = 0;
    }else {
        startat = parseInt(startat)
	}
	
    var keyword = [];
    var delay = $( "#adf-delay option:selected" ).val();

    $("#adf-keyword option").each(function(){
        keyword.push($(this).val().toLowerCase());
	});
	var messages=[];
	$('.saved_message_friends p').each(function(){
        messages.push($(this).data('message'));
	});

    chrome.tabs.query({
        active: true,
        currentWindow: true
        }, function (tabs) {
            if ( tabs[0].url.indexOf('facebook.com/groups/')>-1 && tabs[0].url.indexOf('/members')>-1 ) {
                chrome.storage.local.get(["ADF_groupSettings","ADF_State"], function(result) {
                    
					temp = {};
					temp.limit = limit;
					temp.startat= startat;
					temp.keyword = keyword;
					temp.delay = delay;
				
					tempTwo = {};
					tempTwo.tabId = tabs[0].id;
					tempTwo.state = 'running';

					var selectedAdfTagIds = [];
					if ( $('#adf-enable-tagging').is(':checked') && $('#adf-tag-list-selected .row').length > 0){
						$('#adf-tag-list-selected .row').each(function (index) {
							selectedAdfTagIds.push($(this).find('.bulk-tag-li').attr('tag-id'));
						});
						temp.isTaggingOn = true;
					}else{
						temp.isTaggingOn = false;
					}

					temp.selectedAdfTagIds = selectedAdfTagIds;
						
					temp.adf_message_texts = messages;

					chrome.storage.local.set({'ADF_groupSettings':temp, "ADF_State":tempTwo}); 
					chrome.tabs.sendMessage(tabs[0].id,{type:'startLoading','tabId':tabs[0].id});
					$('.adf-process-status').hide();
					$('#adf-stop').show();
					$('#adf-pause').show();
					adfIsRunning = true;
                    
                });
            }else if(tabs[0].url.indexOf('facebook.com/groups/')>-1){
              	toastr["error"]('Please open members list of group');
            }else{
                toastr["error"]('Please open members list of group');
            }
        });
    return false;
}

function runADFFunctionality(tabId) {

	//displayUpgradeBtnGroup();

	adfTabId = tabId;
    chrome.storage.local.get(["ADF_groupSettings","ADF_State"], function(result) {
    	displayTagsListForAdf(result.ADF_groupSettings);
	    if (typeof result.ADF_groupSettings != "undefined" && result.ADF_groupSettings != '') {
			
			$('#adf-limit').val(result.ADF_groupSettings.limit);
			$('#adf-delay option[value="'+result.ADF_groupSettings.delay+'"]').prop('selected', true);
			$('#adf-start-at').val(result.ADF_groupSettings.startat);
			if(result.ADF_groupSettings.keyword.length > 0){
			    result.ADF_groupSettings.keyword.forEach(function (item) {
			        $('#adf-keyword').tagsinput('add', item);
			    })
			}

			if (result.ADF_State != '') {
				
				if (result.ADF_State.tabId != 0) {
					$('.adf-process-status').hide();
					chrome.tabs.get(result.ADF_State.tabId, function(tab) {
						
						if (tab == undefined) {
							tempTwo = {};
	                        tempTwo.tabId = 0;
	                        tempTwo.state = '';
	                        chrome.storage.local.set({"ADF_State":tempTwo}); 
	                        $('#add-friends').show();
						}else{
							if(result.ADF_State.tabId == adfTabId){
								if (result.ADF_State.state == 'running') {
									$('#adf-pause, #adf-stop').show();
								}else if(result.ADF_State.state == 'paused'){
									$('#adf-resume, #adf-stop').show();
								}

						
							}else{
								toastr["error"]('Already running ');
							}
						}
					});
				}else{
					
					// $('#adf-limit').val(2);
					// $('#adf-delay option[value="150000"]');
				}
			}
		}
		else
		{
			$('#adf-limit').val(2);
			$('#adf-delay option[value="150000"]');		
			$('#adf-start-at').val(0);	
		}
    }); 
	$('.screens').hide();	
	$('.navbar-dark, .account, #add-friends').show();
}

function displayTagsListForAdf(tagsAndMessageSate=''){
	
	chrome.storage.local.get(["tags","taggedUsers"], function(result) {

			if (result.tags != undefined && result.tags.length > 0) {
				var unselectedLi = '';
				result.tags.forEach(function (item,index) {

					var contactsPerTag = 0;
					result.taggedUsers.forEach(function (tagUser,indexTagUser) {
						searchTagById = '#'+item.value+'#';
						if (tagUser.fb_user_id != null && (tagUser.tag_id.indexOf(searchTagById) > -1)) {
							contactsPerTag++;
						} 

					});


					liStyle = '';
					liclass = '';
					if (item.color == null) {
						liclass = 'bg-'+item.class;
					}else{
						liStyle = 'style = "background-color:'+item.color+' ! important";'
					}
					unselectedLi += `<div class="row mt-3">
										<div class="col-11 p-0">
											<button type="button" class="btn btn1 bulk-tag-li `+liclass+`" tag-id="`+item.value+`" contact-per-tag = "`+contactsPerTag+`" `+liStyle+`>
												   `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
											</button>
										</div>
								</div>`;
				
				});
		
				$('#adf-tag-list').html(unselectedLi);


				 if (tagsAndMessageSate != '' &&  typeof tagsAndMessageSate.isTaggingOn != 'undefined') {

				 	
				 	if( tagsAndMessageSate.adf_message_text != 'undefined' && tagsAndMessageSate.adf_message_text != ''){
				 		$('#adf-messge-text').val(tagsAndMessageSate.adf_message_text);
				 	}

				 	if(tagsAndMessageSate.isTaggingOn){
				 		$('#adf-enable-tagging').prop('checked',true)
				 		$('.adf-bulk-tag-container').show();

				 		if(typeof tagsAndMessageSate.selectedAdfTagIds != 'undefined' && tagsAndMessageSate.selectedAdfTagIds.length > 0){
				 			tagsAndMessageSate.selectedAdfTagIds.forEach(function (itemId) {
				 				$('#adf-tag-list .bulk-tag-li[tag-id="'+itemId+'"]').mclick();
				 			})
				 		}
				 	}else{
						$('#adf-enable-tagging').prop('checked',false)
						$('.adf-bulk-tag-container').hide();
				 	}

				 }
			}
			
		});
}

var reminderIdsArray=[];

$(document).ready(function(){
	$('#new_message_friend').click(function () {

        $('#message_texts').modal(300);

    });
	
    /////* Show Message Texts onLoad */////
    var message_bytes = '';

    function messageBytes(bytes) {
        message_bytes = bytes;
    }
	/////* Show Message Texts onLoad */////
	var message_bytes = '';

    function messageBytes(bytes) {
        message_bytes = bytes;
    }
	
    // gets the number of bytes used in sync storage area
   chrome.storage.sync.getBytesInUse(['messages'], messageBytes);
    chrome.storage.sync.get('messages', items => {

        if (message_bytes != 0) {
            const messages = items.messages;
            Object.keys(messages).forEach(key => {
                var message = messages[key];
				var reg = /'/g;
				var newstr = "";
				var datamessage =  message.replace(reg,newstr);
				
                $(".saved_message_friends").prepend("<p class='btn-outline-rounded  saved_tags'  data-message='"+datamessage+"'>"+
                    message +
                    " <button class='btn btn-sm btn-default float-right remove_message_friend' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            });

            if (!messages.length) {
                $(".saved_message_friends").prepend('<p class="text-center text-danger nothing_text">Please add some messages</p>');

            }
        }else{
            $(".saved_message_friends").prepend('<p class="text-center text-danger nothing_text">Please add some messages</p>');
        }
    });

	 /////* Remove Message Filter */////
     $(document).on('click', '.remove_message_friend', function (e) {

        chrome.storage.sync.getBytesInUse(['messages'], messageBytes);
        chrome.storage.sync.get('messages', items => {
            let messages = [];
            if (message_bytes != 0) {
                messages = items.messages;
                let message = $(this).closest('p');
                messages.splice(messages.indexOf(message.data('message')),1);
                message.remove();
                chrome.storage.sync.set({messages: messages});

                if (!messages.length) {
                    $(".saved_message_friends").prepend('<p class="text-center text-danger nothing_text">No Filter Text added yet</p>');

                }
            }
        });

    });
    $('#remove_message_friend').click(function () {
        chrome.storage.sync.set({messages: []});
		$('.saved_message_friends p').remove();
    });
	 /////* Add New Message Text */////
	 $(document).on('click', '#submit_message', function (e) {
        e.preventDefault();

        chrome.storage.sync.getBytesInUse(['messages'], messageBytes);
        chrome.storage.sync.get('messages', items => {
            let messages = [];
            if (message_bytes != 0) {
                messages = items.messages;
                //console.log(replys);
            }
            let message_input = $('#reply_text');
            if (message_input.val().length > 1) {
                let message = message_input.val().replace(/\r?\n/g, '<br />');
                messages.push(message);
                chrome.storage.sync.set({messages: messages});
                message_input.val('');
                var reg = /'/g;
                var newstr = "";
                var datareply =  message.replace(reg,newstr);
    
                $(".saved_message_friends").find('.nothing_text').remove();
                $(".saved_message_friends").prepend("<p class='btn-outline-rounded saved_tags'  data-message='"+datareply+"'>"+
                message +
                    " <button class='btn btn-sm btn-default float-right remove_message_friend' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            }
        });
    });
	$(document).on('change', '.emoji', function (e) {
		let emoji= $(this).val();
		if(emoji!==''){
			let reply_input = $('#reply_text').val(); 
			//var position = $('#reply_text').prop("selectionStart");
			 chrome.storage.sync.get('emoji_focus', item => {
				 
				if (reply_input.length > 1 && item.emoji_focus!=0) {
					var count = Array.from(reply_input.split(/[\ufe00-\ufe0f]/).join("")).length;
				 
					const usingSpread = [...reply_input]; 
				  
					 var output = usingSpread.slice(0, item.emoji_focus).join('') +  emoji + usingSpread.slice(item.emoji_focus, count).join('');
						  
					 $('#reply_text').val(output);  

				}
				 else if (reply_input.length > 1 && item.emoji_focus==0) {
	 
					 $('#reply_text').val(reply_input + emoji); 
				}else{
					 $('#reply_text').val(emoji); 
				} 
				chrome.storage.sync.set({emoji_focus: parseInt(item.emoji_focus) +1 });
			
			 });
		}
			  
	   
	});
	
	
	$( "#reply_text" ).click(function() { 
	 var position = $('#reply_text').prop("selectionStart"); 
	 var reply_input = $('#reply_text').val().substr(0, position);
	 var minus= ((reply_input.match(/🙂/g) || []).length) + ((reply_input.match(/😀/g) || []).length) + 
	 ((reply_input.match(/😉/g) || []).length)+
	 ((reply_input.match(/😂/g) || []).length)+ 
	 ((reply_input.match(/😥/g) || []).length) + 
	 ((reply_input.match(/😓/g) || []).length)+ 
	 ((reply_input.match(/😍/g) || []).length)+ 
	 ((reply_input.match(/😆/g) || []).length)
				
	  chrome.storage.sync.set({emoji_focus: position-minus });
	});
	
	$( "#reply_text" ).blur(function() { 
	 var position = $('#reply_text').prop("selectionStart"); 
	 var reply_input = $('#reply_text').val().substr(0, position);
	var minus= ((reply_input.match(/🙂/g) || []).length) + ((reply_input.match(/😀/g) || []).length) + 
	 ((reply_input.match(/😉/g) || []).length)+
	 ((reply_input.match(/😂/g) || []).length)+ 
	 ((reply_input.match(/😥/g) || []).length) + 
	 ((reply_input.match(/😓/g) || []).length)+ 
	 ((reply_input.match(/😍/g) || []).length)+ 
	 ((reply_input.match(/😆/g) || []).length)
	   
	 var position = $('#reply_text').prop("selectionStart"); 
	  chrome.storage.sync.set({emoji_focus: position-minus  });
	});
	
	$(document).on('change', '.personalization', function (e) {
		let personalization= $(this).val();
		if(personalization!==''){
			let reply_input = $('#reply_text').val();  
			var length = personalization.length;
			 chrome.storage.sync.get('emoji_focus', item => {
				 
				if (reply_input.length > 1 && item.emoji_focus!=0) {
					var count = Array.from(reply_input.split(/[\ufe00-\ufe0f]/).join("")).length;
				 
					const usingSpread = [...reply_input]; 
				  
					 var output = usingSpread.slice(0, item.emoji_focus).join('') +  personalization + usingSpread.slice(item.emoji_focus, count).join('');
						  
					 $('#reply_text').val(output);  

				}
				 else if (reply_input.length > 1 && item.emoji_focus==0) {
	 
					 $('#reply_text').val(reply_input + personalization); 
				}else{
					 $('#reply_text').val(personalization); 
				} 
				 
				chrome.storage.sync.set({emoji_focus: parseInt(item.emoji_focus) + length });
			
			 });
		} 
	});
	$("#adf-start").on('click', function() {
    	startSendFriendRequests();  
	});

	$(document).on('change','#adf-enable-tagging', function() {
		if(this.checked) {
			$('.adf-bulk-tag-container').show();
		}else{
			$('.adf-bulk-tag-container').hide();
		}
	});

	$("#adf-pause").on('click', function() {
		var tempTwo = {};
		tempTwo.tabId = adfTabId;
		tempTwo.state = 'paused';
		chrome.storage.local.set({"ADF_State":tempTwo});  

		
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
           chrome.tabs.sendMessage(tabs[0].id,{type:'adf-pause'});
			$('.adf-process-status').hide();
			$('#adf-resume, #adf-stop').show();
        });


	});

	$("#adf-resume").on('click', function() {

		var tempTwo = {};
		tempTwo.tabId = adfTabId;
		tempTwo.state = 'running';
		chrome.storage.local.set({"ADF_State":tempTwo});  


        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
           chrome.tabs.sendMessage(tabs[0].id,{type:'adf-resume'});
			$('.adf-process-status').hide();
			$('#adf-pause, #adf-stop').show();
        });



	});


	$("#adf-stop").on('click', function() {
    	var tempTwo = {};
		tempTwo.tabId = 0;
		tempTwo.state = 'running';
		chrome.storage.local.set({"ADF_State":tempTwo});  

		chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
           chrome.tabs.sendMessage(tabs[0].id,{type:'adf-stop'});
			$('.adf-process-status').hide();
			$('#adf-start').show();
			$('#adf-cancel').show();
        });


		
	});
	function destructor() {
	    document.removeEventListener(destructionEvent, destructor);
	}

	var destructionEvent = 'destructmyextension_' + chrome.runtime.id;
	document.dispatchEvent(new CustomEvent(destructionEvent));
	document.addEventListener(destructionEvent, destructor);

	$(document).on('keyup','#search_tag', function(e) {
		var search_tag = $("#search_tag").val().toLowerCase();		
		$(".tag_row").filter(function() {
		  $(this).toggle($(this).find('.tag-name-span').text().toLowerCase().indexOf(search_tag) > -1)
		});
	});

	$('.screens').hide();
	$('#loading_wheel').show();

	chrome.storage.local.set({currentSelTag: undefined});
	chrome.storage.local.get(["friendRequestFlow"], function(result) {
		var setToggle = 'off';
		if (typeof result.friendRequestFlow != "undefined" &&
			result.friendRequestFlow != "") {
			setToggle = result.friendRequestFlow;
		}
		chrome.storage.local.set({friendRequestFlow:setToggle});
		if(setToggle == 'on') {
			$('.toggle-request-flow').removeClass('fa fa-toggle-off');
			$('.toggle-request-flow').addClass('fa fa-toggle-on');
		} else {
			$('.toggle-request-flow').removeClass('fa fa-toggle-on');
			$('.toggle-request-flow').addClass('fa fa-toggle-off');
		}
	});

	chrome.storage.local.get(["ssa_user"], function(result) {
		if(result != null) {
			userId = result.ssa_user.id;
			$('#export_user_id').val(userId);
		}
	});	
	chrome.storage.local.get(["emoji_template_focus"], function(result) {
		if(result != null && typeof result.emoji_template_focus) {
			chrome.storage.sync.set({emoji_template_focus: 0 });
		}
	});	
	chrome.storage.local.get(["emoji_bulk_focus"], function(result) {
		if(result != null && typeof result.emoji_bulk_focus) {
			chrome.storage.sync.set({emoji_bulk_focus: 0 });
		}
	});		
	/*$('#login').show();*/
	//$('.tag-message').hide();
	//$('.header_top').hide();

    /*Handled in Nav itself
    $(".nav-tabs a").click(function(){
		$(this).tab('show');
	});*/

    $('.forgot_password').on('click',function(){
    	$('.screens').hide();
    	$('#forgot_password_screen').show();
    });

    $('.login').on('click',function(){
    	$('.screens').hide();
    	$('#fb_messenger_login_dasboard').show();
    });

    $('.goto-login').on('click',function(){
    	$('.screens').hide();
    	$('#login_screen').show();
    });

	$(".export-contacts").click(function(){
		$(".export-contacts").html("Preparing...");
		var tagId = $('input[name=sel-tag]:checked')[0].value;
		var userId = '';
		chrome.storage.local.get(["ssa_user"], function(result) {
			if(result != null) {
				userId = result.ssa_user.id;
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/export/data",
					data: {userId:userId},
					dataType: 'json',
					beforeSend: function (xhr) {
				  			xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function(response) {
					if(response.result == 'success') {
						$("#export_result").html('<a href="' +
							response.download_link + '" target="_blank">Download Link</a>');	
					}
					var text = '';
					for(var i = 0; i < response.length; i++) {
						text += JSON.stringify(response[i]) + '\n';
					}
					
				});				
			}
		});

	});

	dashboard();

	$('#navbardrop').on('click',function(){
		$('.header-submenu').toggleClass('show');

	});
	
	$(document).on('mouseout','#show-tags',function(){
		$('.toggle-tag-action').css('visibility','hidden');
	});

	$(document).on('mouseover','.tag_row',function(){
		$('.toggle-tag-action').css('visibility','hidden');
		$(this).find('.toggle-tag-action').css('visibility','visible');
	});

	$(document).on('click','.toggle-tag-action',function(){
		$(this).toggleClass('fa-angle-down');
		$(this).toggleClass('fa-angle-up');
		$(this).closest('.tag_row').find('.secondary').slideToggle();
		$(this).closest('.tag_row').find('.secondary-1').slideToggle();
	});
	
	$(document).on('click','.logout', function() {
		var ssaPopupStates = {selected_tag :'' ,selected_template:'',last_screen:''};
		chrome.storage.local.set({ssaPopupStates:ssaPopupStates});
		triggerLogout();
	});
	$(document).on('click','.setting', function() {		
		triggerSettings();
	});

	$("#forgot_password_form").validate({
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            email: {
                required: "Email can not be empty",
                email: "Please enter valid email"
            }
        },
        submitHandler: function() {
            forgot_password();
            return false;
        }
    });

	var simplebar_loading =false;
	
	/*$(".template-list").scroll(function(){
		if(!templatesLoaderRunning){
			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				$("#templates_loader").show();
				$(this).toggleClass('loader-overlay');
				loadMoreTemplates();
			}
		}
	});*/

	$(document).on('click','.edit-template',function(event){
		var edit_template = $(this).closest('.template_name');
		$(edit_template).closest('.row').find('.view-text').hide();
		$(edit_template).closest('.row').find('.edit-text').show().focus();
	});

	$(document).on('blur','.edit-text',function(event){
		selected_template = this;
		var templateVal = $(selected_template).val();
		if(templateVal == '') {
			toastr["error"]("Please enter valid text!");	
			return false;
		} else {
			$(selected_template).hide();
			$(selected_template).closest('.row').find('.view-text').show();
			var attr = $(selected_template).parent().parent().attr('template-id');
			if (typeof attr !== typeof undefined && attr !== false) {
				saveTemplate(templateVal, attr);
			} else {
				saveTemplate(templateVal);
			}
		}
	})

	$(document).on('click','.delete-new-template',function(){
		$(this).parent().parent().parent().parent().remove();
		if($(".show-template-message").length == 0){
			$(".templates").html(noTemplateMsg);
		}
		
	})

	$(document).on('click','.delete-template',function(){
		tempTemplate = $(this).parent().parent().parent().parent();
		deletetemplateId = tempTemplate.attr('template-id');
		$('#deleteTemplateModal').modal("show");
	});

	$('#confirm-template-delete').on('click',function(){
		if (typeof deletetemplateId !== typeof undefined && deletetemplateId !== false) {
				$.ajax({
						type: "POST",
						url: apiBaseUrl + "/templates/delete",
						data: {templateId:deletetemplateId},
						dataType: 'json',
						beforeSend: function (xhr) {
              	  			xhr.setRequestHeader('unique-hash', uniqueHash);
        				}
					}).done(function(response) {
						if(response.status == 401){
							triggerLogout();
							return false;
						}else if (response.status == 200 || response.result == 'success') {
							tempTemplate.parent().parent().remove();	
							toastr["success"]("Template deleted successfully.");	

							if($(".templates").length == 1){
								$(".templates").html(noTemplateMsg);
							}
							verifyUser();							
						}
					});
		}else {
			tempTemplate.parent().parent().remove();
			if($(".templates").length == 0){
				$(".templates").html(noTemplateMsg);
			}
		}
		$('#deleteTemplateModal').modal("hide");
		$(".templates").html('');
		showMessageTemplates();
	});
	$('#confirm-setting-save').on('click',function(){
		chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
			if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
				let location = $("#setting #location-name").val();
				if(!location){
					toastr["error"]("Please fill the input.");	
					return false;
				}
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/fb_accounts/settings/update",
					data: {userId:result.ssa_user.id,fb_account_id:result.fb_id,location:location},
					dataType: 'json',
					beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function(response) {
					if(response.status == 401){
						triggerLogout();
						return false;
					}else if (response.status == 200 || response.result == 'success') {						
						toastr["success"]("Setting updated successfully.");	
						chrome.storage.local.set({'linkedFbAccount':response.linkedFbAccount});					
					}
				});
			}		
		});		
	});
	$('.add_new_template').on('click',function(){

		templateList = `<div class="row raw-template template_name w-100 p-2">
				<div class="col-9 template-view-text">
					<div class="card bg-light template-card view-text" style="display:none;">
						<div class="card-body">
							<div class="card-text"></div>
						</div>
					</div>
					<input type="text" id="add-text" class="form-control edit-text" autocomplete="off" value="">
				</div>
				<div class="col-3 my-auto">
					<div class="row">
						<div class="col-6 my-auto">
							<i class="fa fa-trash delete-new-template p-1 text-icon" title="Delete"></i>
						</div>
					</div>
				</div>
			</div>`;
		if($('.raw-template').length<1){
			$('.templates').prepend(templateList);
			$('.templates #add-text').first().focus();
			$('#default-template-message').hide();
		} else {
			$(".raw-template .view-text").hide();
			$(".raw-template .edit-text").show().focus();
		}
	});

	$(document).on('keyup','#search_template', function() {
		searchTemplate=$(this).val();
		showMessageTemplates(true);
	})

	$(document).on('keyup','#search_message', function() {
		getTemplateMessages();		
	})

	$(document).on('keyup','#search_contact', function() {
		getSearchTagContact();
	});

/*-----------teams------------*/
	$(document).on('click','.edit-team',function(event){
		var edit_team = $(this).closest('.team_name');
		var account_fb_id = $(this).closest('.account-fb-id');
		if(loggedInFBId == account_fb_id){
			$(edit_team).closest('.row').find('.view-text').hide();
			$(edit_team).closest('.row').find('.edit-team-name').show().focus();
		}				
	});

	$(document).on('blur','.edit-team-name',function(event){
		selected_team = this;
		var teamVal = $(selected_team).val();
		if(teamVal == '') {
			toastr["error"]("Please enter valid text!");	
			return false;
		} else {
			$(selected_team).hide();
			$(selected_team).closest('.row').find('.view-text').show();
			var attr = $(selected_team).parent().parent().attr('team-id');
			if (typeof attr !== typeof undefined && attr !== false) {
				saveTeam(teamVal, attr,loggedInFBId);
			} else {
				saveTeam(teamVal,0,loggedInFBId);
			}
		}
	})

	$(document).on('click','.delete-new-team',function(){
		$(this).parent().parent().parent().parent().remove();
		if($(".show-team-message").length == 0){
			$(".teams").html(noTeamMsg);
		}
		
	})

	$(document).on('click','.delete-team',function(){
		tempTeam = $(this).parent().parent().parent().parent();
		deleteteamId = tempTeam.attr('team-id');
		$('#deleteTeamModal').modal("show");
	});

	$('#confirm-team-delete').on('click',function(){
		if (typeof deleteteamId !== typeof undefined && deleteteamId !== false) {
				$.ajax({
						type: "POST",
						url: apiBaseUrl + "/teams/delete",
						data: {teamId:deleteteamId},
						dataType: 'json',
						beforeSend: function (xhr) {
              	  			xhr.setRequestHeader('unique-hash', uniqueHash);
        				}
					}).done(function(response) {
						if(response.status == 401){
							triggerLogout();
							return false;
						}else if (response.status == 200 || response.result == 'success') {
							tempTeam.parent().parent().remove();	
							toastr["success"]("Team deleted successfully.");	

							if($(".teams").length == 1){
								$(".teams").html(noTeamMsg);
							}
							verifyUser();							
						}
					});
		}else {
			tempTeam.parent().parent().remove();
			if($(".teams").length == 0){
				$(".teams").html(noTeamMsg);
			}
		}
		$('#deleteTeamModal').modal("hide");
		$(".teams").html('');
		showTeams();
	});

	$('.add_new_team').on('click',function(){

		teamList = `<div class="row raw-team team_name w-100 p-2">
				<div class="col-9 team-view-text">
					<div class="card bg-light team-card view-text" style="display:none;">
						<div class="card-body">
							<div class="card-text"></div>
						</div>
					</div>
					<input type="text" id="add-text" class="form-control edit-team-name" autocomplete="off" value="">
				</div>
				<div class="col-3 my-auto">
					<div class="row">
						<div class="col-6 my-auto">
							<i class="fa fa-trash delete-new-team p-1 text-icon" title="Delete"></i>
						</div>
					</div>
				</div>
			</div>`;
		if($('.raw-team').length<1){
			$('.teams').prepend(teamList);
			$('.teams #add-text').first().focus();
			$('#default-team-message').hide();
		} else {
			$(".raw-team .view-text").hide();
			$(".raw-team .edit-text").show().focus();
		}
	});

	$(document).on('keyup','#search_team', function() {
		searchTeam=$(this).val();
		showTeams(true);
	})

	$(document).on('click','.team-view-text',function(){
		$('#search_team_member').val('');
		var selectedTeam=$(this);
		$("#team_members_loader").show();

		abortPrevRequests(requests);

		var $teamClick = $(this);
		var teamName = $(this).text();
		if (userId != "") {
			var team = selectedTeamName = $($teamClick).text();
			var teamId = $($teamClick).parent().attr('team-id');
			customSelectedTeamId = selectedTeamId = teamId;
			var team_parent = $($teamClick).parent();
			$(".team-members-list").html('');
			chrome.storage.local.get(["ssa_user","fb_id","ssaPopupStates"], function(result) {
				temp=result.ssaPopupStates;
				temp.selected_team=teamId;
				chrome.storage.local.set({ssaPopupStates:temp});
				loggedInFBId = result.fb_id;
				var postData = {userId:userId, team:team, loggedInFBId:loggedInFBId, teamId: teamId};	
				var buttonLabel = 'Chat';
				requestObj = $.ajax({
					type: "POST",
					url: apiBaseUrl + "/team_members",
					data: postData,
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function(response) {

					if(response.status == 401){
						triggerLogout();
						return false;
					}	
					if(response.teamId == customSelectedTeamId){
						
						var membersList = '';
						if (response.status == 404) {
							$('.message h5').html('There are no members to display. Please add members.');
						} else if(response.hasOwnProperty('data') && response.data.length == 0) {
							toastr["error"]("No members in selected team!");	
							$(".team-members-list").html('Please add members to list here.');
						}
						else {
							chrome.storage.local.set({teamMembers:response.data});
							if(response.data != null) {
								response.data.forEach(function(item){
									if (item.fb_user_id == null) {
										item.fb_user_id = item.fb_image_id;
									}
									membersList+=`<div class="col-12 p-0 pl-1 members team-member-row">
												<div class="row pb-1 pt-1">
													<div class="col-2 text-center p-0">
														<img class="profile-image" src="`+item.profile_pic+`" onerror="this.onerror=null;this.src='`+chrome.extension.getURL('assets/images/profile.jpg')+`';" />
													</div>
													<div class="col-5 p-0 pl-1 pr-1 pt-1">
													   <h5 class="vertical-center-align" title="`+item.fb_name+`">`+item.fb_name+`</h5>
													</div>
													<div class="col-1 p-0 mt-3 show-team-span teams-container" teamged-id = "`+item.id+`" checkedTeamIds = "`+item.team_id+`" clikedFBUserId="`+item.fb_user_id+`" numeric_fb_id="`+item.numeric_fb_id+`" img-url="`+item.profile_pic+`"><i title="Show Teams" class="fa fa-team "></i></div>`;
									membersList+=	`<div class="col-2 p-0 text-right mt-3 header_sec ">
													   <i class="fa fa-ellipsis-v pl-1 pr-3 member-menu" data-toggle="dropdown"></i>
														<div class="dropdown ">
															<div class="dropdown-menu member-drop-down">`;

									membersList+=	`<a class="dropdown-item chat" href="#" fb-id="`+item.fb_user_id+`" img-url="`+item.profile_pic+`" >`+buttonLabel+`</a>
												<a class="dropdown-item notes-btn" href="#">Notes</a>`;
									membersList+=	`</div></div></div></div></div>`;
								});
							}
								
							$('.message h5').html('You have <span class="total_team_member_per_team" id="total_members"> '+response.count+' </span> members in ' +teamName);
							membersCountPerTeam = response.count;
							$(".team-members-list").html(membersList);
							$(".team-members-list img").on("error", handleError);
						}
						$("#team_members_loader").hide();
						$('.team-card').removeClass('selected-template shadow rounded');
						selectedTeam.children().first().addClass('selected-template shadow rounded');						
					}
				});
				requests.push(requestObj);
			});			
		}
	});

	$(document).on('keyup','#search_message', function() {
		getTeamMessages();		
	})

	// $(document).on('keyup','#search_contact', function() {
	// 	getSearchTagContact();
	// });	

/*---------------export-------*/
	
	$(document).on('change','.multi-export-checkbox', function() {
		if(this.checked) {
			$(this).closest('.user-tag-row').addClass('valid-to-export');
		}else{
			$(this).closest('.user-tag-row').removeClass('valid-to-export');
		}
	});

	$(document).on('change','.pre.request_message_interval', function() {
		$('.post.request_message_interval').val($(this).val());	

	});

	$(document).on('change','.post.request_message_interval', function() {
			$('.pre.request_message_interval').val($(this).val());	
	});

	$(document).on('change', 'input:radio[name="sel-tag"]', function (event) {
	    var val = $(this).val();
	    chrome.storage.local.set({currentSelTag:val});
	});

	///////// export feature
	var selectedExportUsers = [];
	$(document).on('click','#startexport-selected', function() {
		
		$('.exportmsg').hide();
		$('.bulk-tags-container').hide();
		var exacttagname = $(this).attr('exacttagname');	
		selectedExportUsers = [];
		$('.valid-to-export').each(function (index) {
			var fullName = $(this).find('h5').text();
			var fb_user_id = $(this).find('a[fb-id]').attr('fb-id');
			var temp = {};
			temp.fb_name = fullName;
			temp.fb_user_id = fb_user_id;
			temp.tagname = exacttagname;
			selectedExportUsers.push(temp);
		});
		if(selectedExportUsers.length > 0){
			var selectedCounterHtml = '<div class="export-counter"><div class="export-left">Selected tag: '+exacttagname+'</div> <div class="export-left">Total Contacts: '+selectedExportUsers.length+'</div> </div>';
			$('.bulk-tags-container').after(selectedCounterHtml);
			$('#startexport').addClass('only-selected-users');
			verifyGoogleSheet();
			$('.tab').hide();
			$('#tagged_user').show();
		}else{
			toastr["error"]('Please select contact.');
			return false;
		}
	});

	$(document).on('click','#startexport', function() {
		googleSheet=$('#google_sheet_url').val();
		if(googleSheet!=''){
			if ($(this).hasClass('only-selected-users')) {
				$('#startexport').prop('disabled', true).text('Please wait');
				writeToGoogleSheet(selectedExportUsers);
			}else{
				selectedExportTagIds = [];
				
				if ($('#export-tag-list-selected .exportTagRow').length > 0){
					$('#export-tag-list-selected .exportTagRow').each(function (index) {
						temp = {};
						temp.tagname = $(this).find('.btn').attr('exactTagName');
						temp.tagid = $(this).find('.btn').attr('tag-id');
						selectedExportTagIds.push(temp);
					});
					$('#startexport').prop('disabled', true).text('Please wait');
					startExport(selectedExportTagIds);
				}else{
					toastr["error"]("Select atleast one tag.");
					return false;
				}
			}
		}else{
			toastr["error"]("Add google sheet.");
			return false;
		}

		
	});

	$(document).on('click','#startexport-all', function() {
		$('.multi-export-checkbox').prop('checked',false);
		$('.export-counter').hide();
		$('.exportmsg').hide();
		$('.bulk-tags-container').show();
		var tagId = $(this).attr('active-tag-id');	
		if (tagId == undefined) {
		}
		
		chrome.storage.local.get(["tags","taggedUsers"], function(result) {
			if (result.tags != undefined && result.tags.length > 0) {
				var unselectedLi = '';
				var selectedLi='';
				result.tags.forEach(function (item,index) {

					var contactsPerTag = 0;
					result.taggedUsers.forEach(function (tagUser,indexTagUser) {
						searchTagById = '#'+item.value+'#';
						//if (tagUser.fb_user_id != null && (tagUser.tag_id.indexOf(searchTagById) > -1)) {
						if (tagUser.fb_user_id != null && tagUser.tag_id == item.value) {
							contactsPerTag++;
						} 

					});

					liStyle = '';
					liclass = '';
					if (item.color == null) {
						liclass = 'bg-'+item.class;
					}else{
						liStyle = 'style = "background-color:'+item.color+'!important;"'
					}
					
					if (item.value == tagId) {
						totalContactsUnderAllTags = contactsPerTag;
						checked='checked';
						//  updateTotalContactsUnderAllTags(totalContactsUnderAllTags);
						selectedLi += `<div class="row mt-3 exportTagRow">
											<div class="col-11 p-0">
												<button type="button" class="btn btn1 `+liclass+`" `+liStyle+` tag-id="`+item.value+`" exactTagName = "`+item.text+`" contact-per-tag = "`+contactsPerTag+`"> `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
												</button>
											</div>
										</div>`; 	
					}else{
						unselectedLi +=	`<div class="row mt-3 exportTagRow">
											<div class="col-11 p-0">
												<button type="button" class="btn btn1 `+liclass+`" `+liStyle+`tag-id="`+item.value+`" exactTagName = "`+item.text+`" contact-per-tag = "`+contactsPerTag+`">
													   `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
												</button>
											</div>
									    </div>`;
					}
				});
				$('#export-tag-list').html(unselectedLi);
				$('#export-tag-list-selected').html(selectedLi);

			}
			verifyGoogleSheet();
		});
		$('.tab').hide();
		$('#tagged_user').show();
	});

	$("#google_sheet_url").on('keyup', function() {
            document.getElementById('is_verified_sheet_url').textContent = 'Verify';            
    });

	$(document).on('click','#export-tag-list .exportTagRow', function() {
		totalContactsUnderAllTags = totalContactsUnderAllTags + parseInt($(this).attr('contact-per-tag'));
		row = $('#export-tag-list .exportTagRow').get($(this).index());
		$(this).remove();
		$('#export-tag-list-selected').append(row);
			// updateTotalContactsUnderAllTags(totalContactsUnderAllTags);
	});

	$(document).on('click','#export-tag-list-selected .exportTagRow', function() {
		totalContactsUnderAllTags = totalContactsUnderAllTags - parseInt($(this).attr('contact-per-tag'));
		row = $('#export-tag-list-selected .exportTagRow').get($(this).index());
		$(this).remove();
		$('#export-tag-list').append(row);
	});

	$(document).on('click','#friend_messages_nav', function(event) {
		chrome.storage.local.get(["ssa_user","fb_id","ssaPopupStates","selectedFriendMsg"], function(result) {
			temp.last_screen = 'send_message';
			temp.selected_tag = '';
			temp.selected_template = '';
			chrome.storage.local.set({ssaPopupStates:temp});
			if (typeof result.fb_id != "undefined" && result.fb_id != "") {					
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/friend_requests/settings",
					data: {userId:result.ssa_user.id,fb_id:result.fb_id},
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function(response) {
					if (response.status == 200 || response.result == 'success') {
						$("#outgoing-message-status").prop( "checked", (response.data.outgoing_message_status ==1) ? true : false);               
						$("#outgoing-random-status").prop( "checked", (response.data.outgoing_random_status ==1) ? true : false);               
	
						$("#comming-message-status").prop( "checked", (response.data.comming_message_status ==1) ? true : false);               
						$("#comming-random-status").prop( "checked", (response.data.comming_random_status ==1) ? true : false);               
	
						$('.request_message_interval').val(response.data.request_message_interval);
						$('#message-one').val(response.data.message_one);
	
						if (response.data.message_one != null) {
							$('#message-one').val(response.data.message_one); 
						}
						if (response.data.message_one != null) {
							$('#message-two').val(response.data.message_two); 
						}
						if (response.data.message_three != null) {
							$('#message-three').val(response.data.message_three); 
						}
						
						if (parseInt(response.data.outgoing_random_status) == 1) {
							
							$('.randomize-container-request-outgoing .request-message-text-row').show();
						 }else{
							$('.randomize-container-request-outgoing .request-message-text-row').hide();
							$('.randomize-container-request-outgoing .request-message-text-row').eq(0).show();
						 }
	
						$('#message-four').val(response.data.message_four); /////// comming message
	
						if (response.data.message_four != null) {
							$('#message-four').val(response.data.message_four); 
						}
						if (response.data.message_four != null) {
							$('#message-five').val(response.data.message_five); 
						}
						if (response.data.message_four != null) {
							$('#message-six').val(response.data.message_six); 
						}
	
						if (parseInt(response.data.comming_random_status) == 1) {
							$('.randomize-container-request-comming .request-message-text-row').show();
						 }else{
							$('.randomize-container-request-comming .request-message-text-row').hide();
							$('.randomize-container-request-comming .request-message-text-row').eq(0).show();
						 }
	
					}else{
						
					}
					if(result.selectedFriendMsg == null) {
						$('.friend-message-option').removeClass('draw-border');
						$(document).find('div[type="pre_accept"]')
						chrome.storage.local.set({selectedFriendMsg:'pre_accept'});
						
						$('#pre_accept_content').show();
						$('#post_accept_content').hide();				
					} else {
						$('.friend-message-option').removeClass('draw-border');
						$(document).find('div[type="'+result.selectedFriendMsg+'"]').addClass('draw-border');
						if(result.selectedFriendMsg == 'pre_accept') {
							$('#pre_accept_content').show();
							$('#post_accept_content').hide();
							
						} else if(result.selectedFriendMsg == 'post_accept') {
							
							$('#pre_accept_content').hide();
							$('#post_accept_content').show();
						} else {
							//alert('something wrong');
						}
					}
				});
			}
		});
		
	});

	$(document).on('click','.friend-message-option', function(event) {
		var selectedType = $(this).attr('type');
		chrome.storage.local.set({selectedFriendMsg:selectedType});
		$('.friend-message-option').removeClass('draw-border');
		$(this).addClass('draw-border');
		if(selectedType == 'pre_accept') {
			$('#pre_accept_content').show();
			$('#post_accept_content').hide();
			// $('#outgoing-message-status').prop("checked", true);
			// $('#comming-message-status').prop("checked", false);
		} else if(selectedType == 'post_accept') {
			// $('#outgoing-message-status').prop("checked", false);
			// $('#comming-message-status').prop("checked", true);
			$('#pre_accept_content').hide();
			$('#post_accept_content').show();
		} else {
			//alert('something wrong');
		}
	});

	$(document).on('click','.export_tags', function() {
		$('.tab').hide();
		$('#tagged_user').show();


		$('.exportmsg').hide();
		$('.bulk-tags-container').show();
		var tagId = $(this).attr('active-tag-id');	
		if (tagId == undefined) {
		}
		
		chrome.storage.local.get(["tags","taggedUsers","ssaPopupStates"], function(result) {
			temp=result.ssaPopupStates;
			temp.last_screen = 'tagged_user';
			temp.selected_tag = '';
			temp.selected_template = '';
			chrome.storage.local.set({ssaPopupStates:temp});
			if (result.tags != undefined && result.tags.length > 0) {
				var unselectedLi = '';
				result.tags.forEach(function (item,index) {

					var contactsPerTag = 0;
					result.taggedUsers.forEach(function (tagUser,indexTagUser) {
						searchTagById = '#'+item.value+'#';
						//if (tagUser.fb_user_id != null && (tagUser.tag_id.indexOf(searchTagById) > -1)) {
						if (tagUser.fb_user_id != null && tagUser.tag_id == item.value) {	
							contactsPerTag++;
						} 

					});


					liStyle = '';
					liclass = '';
					if (item.color == null) {
						liclass = 'bg-'+item.class;
					}else{
						liStyle = 'style = "background-color:'+item.color+';"'
					}

					if (item.value == tagId) {
						totalContactsUnderAllTags = contactsPerTag;
						checked='checked';
						//  updateTotalContactsUnderAllTags(totalContactsUnderAllTags);
						selectedLi += `<div class="row mt-3 exportTagRow">
											<div class="col-11 p-0">
												<button type="button" class="btn btn1 `+liclass+`" `+liStyle+` tag-id="`+item.value+`" exactTagName = "`+item.text+`" contact-per-tag = "`+contactsPerTag+`"> `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
												</button>
											</div>
										</div>`; 	
					}else{
						unselectedLi +=	`<div class="row mt-3 exportTagRow">
											<div class="col-11 p-0">
												<button type="button" class="btn btn1 `+liclass+`" `+liStyle+`tag-id="`+item.value+`" exactTagName = "`+item.text+`" contact-per-tag = "`+contactsPerTag+`">
													   `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
												</button>
											</div>
									    </div>`;
					}

				});

				$('#export-tag-list').html(unselectedLi);
			}
			verifyGoogleSheet();
		});
		$('#createExportEventModal').modal('show').removeClass('in').addClass('show');
	});


/*----------------------send-bulk-message---------------*/

	$('#randomize-toggle').change(function() {
        if(this.checked) {
          	$('.bulk-text-row').show();
          	$('#add-random-msg').show();
          	$('.delete-bulk-textarea').show();
        }else{
        	$('.delete-bulk-textarea').hide();
			$('.bulk-text-row').hide();
			$('.bulk-text-row').eq(0).show();
			$('#add-random-msg').hide();
        }      
    });

    $(document).on('click','#add-random-msg', function() {
		
		if($('.bulk-text-row').length < 4 && $('#randomize-toggle').is(':checked')){
			$('.randomize-container').append(randomMessageField);
		}						
	});

	$(document).on('click','.delete-bulk-textarea', function() {
		noOfBulkTextArea = $('.bulk-text-row').length;
		if (noOfBulkTextArea > 1) {
			$(this).closest('.bulk-text-row').remove();	
		}				
	});

	$(document).on('click',"#pausebulk", function(){
		$('.bulk-process-status').hide();
		$('#resumebulk').showInlineBlock();
		$('#stopbulk').showInlineBlock();
	
		chrome.runtime.sendMessage({action: 'pause-bulk'});		
		
    });

    $(document).on('click',"#resumebulk", function(){		
		
		$('.bulk-process-status').hide();
		$('#pausebulk').showInlineBlock();
		$('#stopbulk').showInlineBlock();
		var sendLimitOnResume = $('#bulk-send-limit').val();

		chrome.runtime.sendMessage({action: 'resume-bulk', 'sendLimitOnResume':sendLimitOnResume});
    });

    $(document).on('click',"#stopbulk", function(){		
		$('.bulk-process-status').hide();
		$('#startbulk').showInlineBlock();
		$('#bulk-back-btn').show();
	
		if($('#randomize-toggle').is(':checked')){
			$('.delete-bulk-textarea').show();
			$('#add-random-msg').show();
		}else{
			$('.delete-bulk-textarea').hide();
			$('#add-random-msg').hide();
		}

	
		updateTotalContactsUnderAllTags(totalContactsUnderAllTags,true);

		$('#randomize-toggle').prop('disabled',false);
		$('#randomize-toggle-delay').prop('disabled',false);
		$('#send-to-all-tagged-user').prop('disabled',false);

		isBulkRunning = false;
		chrome.storage.local.set({"bulkMessageSettings":""});		
		chrome.storage.local.set({"bulkTaggedUserArray":[]});	
		chrome.runtime.sendMessage({action: 'stop-bulk'});
		$('.arrow_icon').show()
    });

	$(document).on('click','.send-bulk-message', function() {
		$('#randomize-toggle').prop('checked',false);
		$('.tab').hide();
		$('#bulk_message').show();

		$('.bulk-message-error').hide();
		var tagId = $(this).attr('tag-id');	
		chrome.storage.local.get(["currentSelTag"], function(result) {
			if(result.currentSelTag != undefined) {
				tagId =result.currentSelTag;
			}
		});

		if (tagId == undefined) {
			$('#bulk-messge-text').val($(this).closest('.row.message-item').find('textarea').val());
		}
		
		chrome.storage.local.get(["tags","bulkMessageSettings","taggedUsers","ssaPopupStates"], function(result) {

			temp=result.ssaPopupStates;
			temp.last_screen = 'bulk_message';
			temp.selected_tag = '';
			temp.selected_template = '';
			chrome.storage.local.set({ssaPopupStates:temp});
			

			if (result.tags != undefined && result.tags.length > 0) {
				var unselectedLi = '';
				result.tags.forEach(function (item,index) {

					var contactsPerTag = 0;
					result.taggedUsers.forEach(function (tagUser,indexTagUser) {
						searchTagById = '#'+item.value+'#';
						//if (tagUser.fb_user_id != null && (tagUser.tag_id.indexOf(searchTagById) > -1)) {
						if (tagUser.fb_user_id != null && tagUser.tag_id == item.value) {	
							contactsPerTag++;
						}
					});
					liStyle = '';
					liclass = '';
					if (item.color == null) {
						liclass = 'bg-'+item.class;
					}else{
						liStyle = 'style = "background-color:'+item.color+' ! important";'
					}
					
					if (item.value == tagId) {
						  totalContactsUnderAllTags = contactsPerTag;
						  updateTotalContactsUnderAllTags(totalContactsUnderAllTags);
  						  $('#bulk-tag-list-selected').html(`<div class="row mt-3" >
													<div class="col-11 p-0" >
														<button type="button" class="btn btn1 bulk-tag-li `+liclass+`" tag-id="`+item.value+`" contact-per-tag = "`+contactsPerTag+`" `+liStyle+`>
															   `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
														</button>
													</div>
												</div>`);	
					}else{


						unselectedLi += `<div class="row mt-3">
											<div class="col-11 p-0">
												<button type="button" class="btn btn1 bulk-tag-li `+liclass+`" tag-id="`+item.value+`" contact-per-tag = "`+contactsPerTag+`" `+liStyle+`>
													   `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
												</button>
											</div>
									</div>`;
					}
				});
				$('#bulk-tag-list').html(unselectedLi);	

				// $('.randomize-container').html(randomMessageFields);
			}
			displayRandomizeMessge(result);
		});
		$('.bulk-process-status').hide();
		$('#startbulk').showInlineBlock();
	});

	$(document).on('click','#bulk-tag-list .row', function() {
		if (!isBulkRunning) {
			totalContactsUnderAllTags = totalContactsUnderAllTags + parseInt($(this).find('.bulk-tag-li ').attr('contact-per-tag'));
			li = $('#bulk-tag-list .row').get($(this).index());
			$(this).remove();
			$('#bulk-tag-list-selected').append(li);
			updateTotalContactsUnderAllTags(totalContactsUnderAllTags);
		}
	});

	$(document).on('click','#bulk-tag-list-selected .row', function() {
		if (!isBulkRunning) {
			totalContactsUnderAllTags = totalContactsUnderAllTags - parseInt($(this).find('.bulk-tag-li').attr('contact-per-tag'));
			li = $('#bulk-tag-list-selected bulk-tag-li').get($(this).index());
			$(this).remove();
			$('#bulk-tag-list').append(li);
			updateTotalContactsUnderAllTags(totalContactsUnderAllTags);
		}
	});

	$(document).on('mouseover','#bulk-tag-list-selected .bulk-tag-li', function() {
		$(this).attr('title','Click to unselect');
	});

	$(document).on('mouseover','#bulk-tag-list .bulk-tag-li', function() {
		$(this).attr('title','Click to select');
	});
	////////////adf start//////////////

	$(document).on('click','#adf-tag-list .row', function() {
		if (!adfIsRunning) {
			totalContactsUnderAllTags = totalContactsUnderAllTags + parseInt($(this).find('.bulk-tag-li ').attr('contact-per-tag'));
			li = $('#adf-tag-list .row').get($(this).index());
			$(this).remove();
			$('#adf-tag-list-selected').append(li);
		}
	});

	$(document).on('click','#adf-tag-list-selected .row', function() {
		if (!adfIsRunning) {
			totalContactsUnderAllTags = totalContactsUnderAllTags - parseInt($(this).find('.bulk-tag-li').attr('contact-per-tag'));
			li = $('#adf-tag-list-selected .bulk-tag-li').get($(this).index());
			$(this).remove();
			$('#adf-tag-list').append(li);
		}
	});
	////////////adf end//////////////

	$('#send-to-all-tagged-user').change(function() {
        if(this.checked) {
          	$('.bulk-tags-container').hide();
          	$('#select-tag').hide();
          	var i = 0;
          	chrome.storage.local.get(["taggedUsers"], function(result) {
				result.taggedUsers.forEach(function (item,index) {
					if( item.fb_user_id != null ){
						i++;
					}			
				});
			    updateTotalContactsUnderAllTags(i);
			});
        }else{
        	$('.bulk-message-total').hide();
        	$('#select-tag').show();
			$('.bulk-tags-container').show();
        }      
    });

	$(document).on('click','#startbulk', function() {
		$('.bulk-message-error').hide();
		var bulkMessageTextArray = [];
		var sendRandomMessage = false;
		var useRandomDelay = false;
		var removeFromTag = false;
		var sendLimit = $('#bulk-send-limit').val();
		var useSendLimit = true;
		if ($('#bulk-send-limit').val() != '' && parseInt($('#bulk-send-limit').val()) < 1) {
			$('.bulk-message-limit-error').show();
			toastr['error']('Please select limit to send bulk');
			return false;
		}else{
			useSendLimit = false;
			$('.bulk-message-limit-error').hide();
		}

		if ($('#bulk-send-limit').val() != '') {
			useSendLimit = true;
		}

		if ($('#randomize-toggle').is(':checked')) {
			sendRandomMessage = true;
		} 

		if ($('#randomize-toggle-delay').is(':checked')) {
			useRandomDelay = true;
		} 
		if ($('#remove-from-tag').is(':checked')) {
			removeFromTag = true;
		} 

		isValueInMessageText = true;
		let templateId = $( "#bulk-templates" ).val();
		if( typeof templateId != typeof undefined && templateId >0){
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/template_messages",
				data: {templateId:templateId},
				dataType: 'json',
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function(response) {
				//$('.new_template_sec').hide();
				//$('#new_template_messages').show();
				
				if(response.status == 401){
					triggerLogout();					
					return false;
				}
				if (response.status == 200 || response.result == 'success') {
					response.data.forEach(function(message){							
						isValueInMessageText = false;
						bulkMessageTextArray.push(message.message);
					});
				}
				
			});		
		}else{
			$('.bulk-messge-text').each(function (index) {
				if ($.trim($(this).val()) != '') {
					isValueInMessageText = false;
					bulkMessageTextArray.push($.trim($(this).val()));
				}
			});
		}	
		if (isValueInMessageText) {
			$('.bulk-message-random-error').show();
			toastr['error']('Please enter message to send bulk');
			return false;
		}

		if (isValueInMessageText) {
			$('.bulk-message-random-error').show();
			toastr['error']('Please enter message to send bulk');
			return false;
		}

		var bulkDelay = $('#bulk-delay option:selected').val();
		sendToAll = false;
		selectedBulkTagIds = [];
		if ($('#send-to-all-tagged-user').prop('checked')) {
			sendToAll = true;
			sendBulkMessage(selectedBulkTagIds,bulkMessageTextArray,bulkDelay, sendToAll,sendRandomMessage,sendLimit,useRandomDelay,useSendLimit,removeFromTag);
		}else{
			selectedBulkTagIds = [];
			
			chrome.storage.local.get(["currentSelTag"], function(result) {
				if(result.currentSelTag != undefined) {
					temp = {};
					temp.tagname = result.currentSelTag;
					temp.tagid = result.currentSelTag;
					selectedBulkTagIds.push(temp);
					sendBulkMessage(selectedBulkTagIds,bulkMessageTextArray,bulkDelay,sendToAll,sendRandomMessage,sendLimit,useRandomDelay,useSendLimit,removeFromTag);
				} else {
					toastr['error']('Please select tag to send bulk');
				}
			});
			/*if ($('#bulk-tag-list .selected').length > 0){
				$('#bulk-tag-list-selected .row').each(function (index) {
					
					temp = {};
					temp.tagname = $(this).find('.bulk-tag-li').text();
					temp.tagid = $(this).find('.bulk-tag-li').attr('tag-id');
					selectedBulkTagIds.push(temp);
				});
				sendBulkMessage(selectedBulkTagIds,bulkMessageTextArray,bulkDelay,sendToAll,sendRandomMessage,sendLimit,useRandomDelay,useSendLimit);
			}else{
				$('.bulkmsg').addClass('alert alert-danger').text('Select atleast one tag').show().fadeOut(2000);;
				return false;
			}*/
		}

		
	});


	$(".msg-template").scroll(function(){
		if(!messagesLoaderRunning){
			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				$("#messages_loader").show();
				$(this).toggleClass('loader-overlay');
				loadMoreMessages();
			}
		}
	});

	$(document).on('click','.show-template-message', function(event) {
		if(event.target.tagName != "I") {
			$('#messages_loader').show();
			$('.message-list').hide();
			var attr = $(this).closest('.template_name').attr('template-id');
			var selected_template_name=$(this).closest('.template_name').find('.view-text').text();
			selectedTemplateId=$(this).closest('.template_name').attr('template-id');

			chrome.storage.local.get(["ssaPopupStates"], function(result) {
				if(result.ssaPopupStates.selected_template != null) {
					$('.template_name[template-id="'+result.ssaPopupStates.selected_template+'"]').find('.view-text').removeClass('selected-template shadow rounded"');
				}
				$('.template_name[template-id="'+selectedTemplateId+'"]').find('.view-text').addClass('selected-template shadow rounded"');
				temp=result.ssaPopupStates;
				temp.selected_template=selectedTemplateId;
				chrome.storage.local.set({ssaPopupStates:temp});
			});


			if (typeof attr !== typeof undefined && attr !== false) {				
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/template_messages",
					data: {templateId:$(this).closest('.template_name').attr('template-id')},
					dataType: 'json',
					beforeSend: function (xhr) {
	              	  xhr.setRequestHeader('unique-hash', uniqueHash);
	        		}
				}).done(function(response) {
					//$('.new_template_sec').hide();
					//$('#new_template_messages').show();

					if(response.status == 401){
						triggerLogout();
						$('#messages_loader').hide();
						return false;
					}

					var messageList = '';
					if (response.status == 200 || response.result == 'success') {
						$('.btn-load-more-message').show();
						response.data.forEach(function(message){
							//console.log(message.id);
							messageList += `<div message-id="`+message.id+`" class="row message_name w-100 show-message">
								<div class="col-10 pl-2 pt-1 message-view-text">
									<div class="card bg-light template-message-card view-message">
										<div class="card-body">
											<div class="card-text">`+message.message+`</div>
										</div>
									</div>
									<textarea class="form-control edit-message-text" style="display: none;" id="template_edit_text" placeholder="write message... ">`+message.message+`</textarea>
								</div>
								<div class="col-2 my-auto">
									<div class="row">`
								if (message.message.indexOf('--template--') <0) {	
									messageList +=`<div class="col-4 my-auto">
													<i class="fa fa-pencil edit-message p-1 text-icon" title="Edit"></i>
												</div>`;												
								}
								messageList+=`<div class="col-4 my-auto">
												<i class="fa fa-send send-message p-1 text-icon" title="Share"></i>
											</div>		
											<div class="col-4 my-auto">
												<i class="fa fa-save save-message p-1 text-icon" title="Save"></i>
											</div>				
											<div class="col-4 my-auto">
												<i class="fa fa-trash delete-message p-1 text-icon" title="Delete"></i>
											</div>
										</div>
									</div>
								</div>`;
										
						});						
					} else {
						messageList = noMessagesUnderTemplate;
					}
					$('.selected-template-name').text('( '+selected_template_name+' )');
					$(".message-list").html(messageList);
					$('#messages_loader').hide();
					$('.message-list').show();
				});		
			}
		}
	});
	$(document).on('click','.send-multi-message', function(event) {
		if(event.target.tagName == "I") {
			$('#messages_loader').show();
			$('.message-list').hide();
			var attr = $(this).closest('.template_name').attr('template-id');
			var selected_template_name=$(this).closest('.template_name').find('.view-text').text();
			selectedTemplateId=$(this).closest('.template_name').attr('template-id');

			chrome.storage.local.get(["ssaPopupStates"], function(result) {
				if(result.ssaPopupStates.selected_template != null) {
					$('.template_name[template-id="'+result.ssaPopupStates.selected_template+'"]').find('.view-text').removeClass('selected-template shadow rounded"');
				}
				$('.template_name[template-id="'+selectedTemplateId+'"]').find('.view-text').addClass('selected-template shadow rounded"');
				temp=result.ssaPopupStates;
				temp.selected_template=selectedTemplateId;
				chrome.storage.local.set({ssaPopupStates:temp});
			});


			if (typeof attr !== typeof undefined && attr !== false) {				
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/template_messages",
					data: {templateId:$(this).closest('.template_name').attr('template-id')},
					dataType: 'json',
					beforeSend: function (xhr) {
	              	  xhr.setRequestHeader('unique-hash', uniqueHash);
	        		}
				}).done(function(response) {
					//$('.new_template_sec').hide();
					//$('#new_template_messages').show();

					if(response.status == 401){
						triggerLogout();
						$('#messages_loader').hide();
						return false;
					}

					var messageList = '';
					if (response.status == 200 || response.result == 'success') {
						$('.btn-load-more-message').show();
						response.data.forEach(function(message){
							//console.log(message.id);
							messageList += `<div message-id="`+message.id+`" class="row message_name w-100 show-message">
								<div class="col-10 pl-2 pt-1 message-view-text">
									<div class="card bg-light template-message-card view-message">
										<div class="card-body">
											<div class="card-text">`+message.message+`</div>
										</div>
									</div>
									<textarea class="form-control edit-message-text" style="display: none;" id="template_edit_text" placeholder="write message... ">`+message.message+`</textarea>
								</div>
								<div class="col-2 my-auto">
									<div class="row">
										<div class="col-4 my-auto">
											<i class="fa fa-pencil edit-message p-1 text-icon" title="Edit"></i>
										</div>
										<div class="col-4 my-auto">
											<i class="fa fa-send send-message p-1 text-icon" title="Share"></i>
										</div>		
										<div class="col-4 my-auto">
											<i class="fa fa-save save-message p-1 text-icon" title="Save"></i>
										</div>				
										<div class="col-4 my-auto">
											<i class="fa fa-trash delete-message p-1 text-icon" title="Delete"></i>
										</div>
									</div>
								</div>
							</div>`;
						});						
					} else {
						messageList = noMessagesUnderTemplate;
					}
					$('.selected-template-name').text('( '+selected_template_name+' )');
					$(".message-list").html(messageList);					
					$('.message-list').show();

					if(messageList != noMessagesUnderTemplate){
						
						[...$(messageList).find('.send-message')].forEach(function(send,index){							
							setTimeout(function(){
								$(".message-list").find('.send-message')[index].click()},10000*index);							
						});		
									
					}					
					$('#messages_loader').hide();
				});		
			}
		}
	});
	$(document).on('click','.save-new-message', function(){
		selected_message = $(this).parent().parent().parent().parent().find('.add-message-text');
		var attr = $(this).parent().parent().attr('message-id');
		if (typeof attr !== typeof undefined && attr !== false) {
			saveMessage($(selected_message).val(), attr);
		} else {
			saveMessage($(selected_message).val());
		}	
    });
	$(document).on('click','.save-new-bdtl-message', function(){
		selected_message = $(this).parent().parent().parent().parent().find('.add-message-text');
		var attr = $(this).parent().parent().attr('message-id');
		if (typeof attr !== typeof undefined && attr !== false) {
			saveBdtlMessage($(selected_message).val(), attr);
		} else {
			saveBdtlMessage($(selected_message).val());
		}	
	});
	$(document).on('click','.save-new-bddm-message', function(){
		selected_message = $(this).parent().parent().parent().parent().find('.add-message-text');
		var attr = $(this).parent().parent().attr('message-id');
		if (typeof attr !== typeof undefined && attr !== false) {
			saveBddmMessage($(selected_message).val(), attr);
		} else {
			saveBddmMessage($(selected_message).val());
		}	
	});
	$(document).on('click','.save-bdtl-message', function(){
		var edit_message = $(this).closest('.message_name');	
		selected_message=	$(edit_message).find('.edit-bdtl-message-text');
		bdtlMessage = $(this).parent().parent().parent().parent();
		bdtlMessageId = bdtlMessage.attr('message-id');	
		if (typeof bdtlMessageId !== typeof undefined && bdtlMessageId !== false) {
			saveBdtlMessage($(selected_message).val(), bdtlMessageId);
		} else {
			saveBdtlMessage($(selected_message).val());
		}
	});
	$(document).on('click','.save-bddm-message', function(){
		var edit_message = $(this).closest('.message_name');	
		selected_message=	$(edit_message).find('.edit-bddm-message-text');
		bddmMessage = $(this).parent().parent().parent().parent();
		bddmMessageId = bddmMessage.attr('message-id');	
		if (typeof bddmMessageId !== typeof undefined && bddmMessageId !== false) {
			saveBddmMessage($(selected_message).val(), bddmMessageId);
		} else {
			saveBddmMessage($(selected_message).val());
		}
    });
	$(document).on('click','.delete-new-message', function(){
		$(this).parent().parent().parent().parent().remove();	
		if($("#message-list").length == 0){
			$("#message-list").html(noMessagesUnderTemplate);
		}
    });
	$(document).on('click','.save-message', function(){
		var edit_message = $(this).closest('.message_name');	
		selected_message=	$(edit_message).find('.edit-message-text');
		tempMessage = $(this).parent().parent().parent().parent();
		tempMessageId = tempMessage.attr('message-id');	
		if (typeof tempMessageId !== typeof undefined && tempMessageId !== false) {
			saveMessage($(selected_message).val(), tempMessageId);
		} else {
			saveMessage($(selected_message).val());
		}
    });
	$(document).on('click','.delete-message', function(){
		tempMessage = $(this).parent().parent().parent().parent();
		tempMessageId = tempMessage.attr('message-id');	
		$("#deleteMessageModal").modal("show");	
	});
	$(document).on('click','.delete-bdtl-message', function(){
		tempMessage = $(this).parent().parent().parent().parent();
		tempMessageId = tempMessage.attr('message-id');	
		$("#deleteBDTLMessageModal").modal("show");	
    });
	$(document).on('click','.delete-bddm-message', function(){
		tempMessage = $(this).parent().parent().parent().parent();
		tempMessageId = tempMessage.attr('message-id');	
		$("#deleteBDDMMessageModal").modal("show");	
    });
    $('#confirm-message-delete').on('click',function(){
    	$('#messages_loader').show();
    	if (typeof tempMessageId !== typeof undefined) {		
			$.ajax({
					type: "POST",
					url: apiBaseUrl + "/template_messages/delete",
					data: {messageId:tempMessageId},
					dataType: 'json',
					beforeSend: function (xhr) {
          	  			xhr.setRequestHeader('unique-hash', uniqueHash);
    				}
				}).done(function(response) {
					if(response.status == 401){
						triggerLogout();
						return false;
					}else if (response.status == 200 || response.result == 'success') {
						tempMessage.remove();
						toastr["success"]("Message deleted successfully.");
						messages = $("#message-list").length;
						if(messages == 0){
							$("#message-list").html(noMessagesUnderTemplate);
						}
					}
				});
		} else {
			tempMessage.remove();
			toastr["success"]("Message not deleted.");
			messages = $("#message-list").length;
			if(messages == 0){
				$("#message-list").html(noMessagesUnderTemplate);
			}
		}
		$('#deleteMessageModal').modal("hide");
		$(".message-list").html('');
		showMessageTemplates();
	});
	$('#confirm-bdtl-delete').on('click',function(){
    	$('#messages_loader').show();
    	if (typeof tempMessageId !== typeof undefined) {		
			$.ajax({
					type: "POST",
					url: apiBaseUrl + "/birthdays/DeleteTLMessage",
					data: {msgId:tempMessageId},
					dataType: 'json',
					beforeSend: function (xhr) {
          	  			xhr.setRequestHeader('unique-hash', uniqueHash);
    				}
				}).done(function(response) {
					if(response.status == 401){
						triggerLogout();
						return false;
					}else if (response.status == 200 || response.result == 'success') {
						tempMessage.remove();
						toastr["success"]("Message deleted successfully.");
						messages = $("#message-list").length;
						if(messages == 0){
							$("#message-list").html(noMessagesUnderTemplate);
						}
					}
				});
		} else {
			tempMessage.remove();
			toastr["success"]("Message not deleted.");
			messages = $("#message-list").length;
			if(messages == 0){
				$("#message-list").html(noMessagesUnderTemplate);
			}
		}
		$('#deleteBDTLMessageModal').modal("hide");
		$(".message-list").html('');
		getBdtlMessages();
	});
	$('#confirm-bddm-delete').on('click',function(){
    	$('#messages_loader').show();
    	if (typeof tempMessageId !== typeof undefined) {		
			$.ajax({
					type: "POST",
					url: apiBaseUrl + "/birthdays/DeleteDMMessage",
					data: {msgId:tempMessageId},
					dataType: 'json',
					beforeSend: function (xhr) {
          	  			xhr.setRequestHeader('unique-hash', uniqueHash);
    				}
				}).done(function(response) {
					if(response.status == 401){
						triggerLogout();
						return false;
					}else if (response.status == 200 || response.result == 'success') {
						tempMessage.remove();
						toastr["success"]("Message deleted successfully.");
						messages = $("#message-list").length;
						if(messages == 0){
							$("#message-list").html(noMessagesUnderTemplate);
						}
					}
				});
		} else {
			tempMessage.remove();
			toastr["success"]("Message not deleted.");
			messages = $("#message-list").length;
			if(messages == 0){
				$("#message-list").html(noMessagesUnderTemplate);
			}
		}
		$('#deleteBDDMMessageModal').modal("hide");
		$(".message-list").html('');
		getBddmMessages();
	});
	
    $(document).on('click','.send-message', function() {
		var myLocation='';
		let thisme= this;
		chrome.storage.local.get(["linkedFbAccount"], function(result) {
			if (typeof result.linkedFbAccount.location != "undefined" && result.linkedFbAccount.location != "") {
				myLocation = result.linkedFbAccount.location;
			}
			var templateMessage = $(thisme).parent().parent().parent().prev().find('textarea').val();
		
			if (templateMessage == null || templateMessage.indexOf('--template--') >= 0) {
				templateMessage = $(thisme).parent().parent().parent().prev().find('img').attr('src');
				window.close();
			}
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'sendTemplateMessage', templateMessage: templateMessage, myLocation: myLocation});
			});
		});		
	});
	$(".add_bdtl_message").on('click', function() {

		message_field=`<div class="row raw-message message-item w-100 p-1">
				<div class="col-10">
					<div class="card bg-light template-card view-text" style="display:none;">
						<div class="card-body">
							<div class="card-text"></div>
						</div>
					</div>
					<div class="input-container">						
						<textarea class="form-control add-message-text" id="template_text" placeholder="write message...."></textarea>				
					</div>
				</div>
				<div class="col-2 my-auto">
					<div class="row">
						<div class="col-6 my-auto">
							<i class="fa fa-save save-new-bdtl-message p-1 
							text-icon" title="Save"></i>
						</div>
						<div class="col-6 my-auto">
							<i class="fa fa-trash delete-new-message p-1 
							text-icon" title="Delete"></i>
						</div>
					</div>
				</div>
			</div>`;
		var messages = $(".bdtl-message-list").length;
		if(messages == 0){
			$(".bdtl-message-list").html('');
			$(".bdtl-message-list").append(message_field);
		} else {
			$(".bdtl-message-list").prepend(message_field);
		}
		$('.raw-message textarea').focus();
	});
	$(".add_bddm_message").on('click', function() {

		message_field=`<div class="row raw-message message-item w-100 p-1">
				<div class="col-10">
					<div class="card bg-light template-card view-text" style="display:none;">
						<div class="card-body">
							<div class="card-text"></div>
						</div>
					</div>
					<div class="input-container">						
						<textarea class="form-control add-message-text" id="template_text" placeholder="write message...."></textarea>				
					</div>
				</div>
				<div class="col-2 my-auto">
					<div class="row">
						<div class="col-6 my-auto">
							<i class="fa fa-save save-new-bddm-message p-1 
							text-icon" title="Save"></i>
						</div>
						<div class="col-6 my-auto">
							<i class="fa fa-trash delete-new-message p-1 
							text-icon" title="Delete"></i>
						</div>
					</div>
				</div>
			</div>`;
		var messages = $(".bddm-message-list").length;
		if(messages == 0){
			$(".bddm-message-list").html('');
			$(".bddm-message-list").append(message_field);
		} else {
			$(".bddm-message-list").prepend(message_field);
		}
		$('.raw-message textarea').focus();
    });

	$(".add_message").on('click', function() {

		message_field=`<div class="row raw-message message-item w-100 p-1">
				<div class="col-10">
					<div class="card bg-light template-card view-text" style="display:none;">
						<div class="card-body">
							<div class="card-text"></div>
						</div>
					</div>
					<div class="input-container">
						<input id="upload-image" type="file" name="upload-image" class="hide-element" />
						<i class="fa fa-upload icon-example"></i>
						<textarea class="form-control add-message-text" id="template_text" placeholder="write message...."></textarea>				
					</div>
				</div>
				<div class="col-2 my-auto">
					<div class="row">
						<div class="col-6 my-auto">
							<i class="fa fa-save save-new-message p-1 
							text-icon" title="Save"></i>
						</div>
						<div class="col-6 my-auto">
							<i class="fa fa-trash delete-new-message p-1 
							text-icon" title="Delete"></i>
						</div>
					</div>
				</div>
			</div>`;
		var messages = $(".message-list").length;
		if(messages == 0){
			$(".message-list").html('');
			$(".message-list").append(message_field);
		} else {
			$(".message-list").prepend(message_field);
		}
		$('.raw-message textarea').focus();
    });

	$(document).on('click','.edit-message',function(event){
		var edit_message = $(this).closest('.message_name');
		$(edit_message).find('.view-message').hide();
		$(edit_message).find('.edit-message-text').show().focus();
	});
	$(document).on('click','.edit-bdtl-message',function(event){
		var edit_message = $(this).closest('.message_name');
		$(edit_message).find('.view-message').hide();
		$(edit_message).find('.edit-bdtl-message-text').show().focus();
	});
	$(document).on('click','.edit-bddm-message',function(event){
		var edit_message = $(this).closest('.message_name');
		$(edit_message).find('.view-message').hide();
		$(edit_message).find('.edit-bddm-message-text').show().focus();
	});
	$(document).on('click','.icon-example',function(event){
		$('#upload-image')[0].value='';
		$('#upload-image').mclick();
	});
	$(document).on('change', '#upload-image', function(){
		if(document.getElementById("upload-image").files[0] == null)
		{
			return false;
		}
		var name = document.getElementById("upload-image").files[0].name;
		
		var ext = name.split('.').pop().toLowerCase();
		if(jQuery.inArray(ext, ['gif','png','jpg','jpeg']) == -1) 
		{
			alert("Invalid Image File");
		}		
		var oFReader = new FileReader();
		oFReader.readAsDataURL(document.getElementById("upload-image").files[0]);
		var f = document.getElementById("upload-image").files[0];
		var fsize = f.size||f.fileSize;
		if(fsize > 2048000)
		{
		 	alert("Image File Size is very big");
		}
		else
		{
			chrome.storage.local.get(["ssa_user", "fb_id"], function(result) {
			
				if( typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "" ){
					
					var form_data = new FormData();
					form_data.append("upload-image", document.getElementById('upload-image').files[0]);
					form_data.append("user_id", result.ssa_user.id);
					form_data.append("fb_user_id", result.fb_id);
					// form_data.append("upload-image", $('input[type=file]')[0].files[0]);
					$.ajax({
						url:apiBaseUrl + "/uploads/images",
						method:"POST",
						data: form_data,
						contentType: false,
						cache: false,
						processData: false,
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						},  
						success:function(response)
						{
							if(response.status == 401){
								triggerLogout();
								return false;
							} else if(response.status == 200 || response.result == 'success') {
								let imageTemplate= response.file_path;
								imageTemplate='<img src="' + imageTemplate +'" width="400" height="auto">';
								if(imageTemplate!==''){
									let template_text = $('#template_text').val(); 
									if(typeof template_text !="undefined"){ 
										$('#template_text').val(imageTemplate);
										$(".save-new-message").mclick();
									} 
								}
							}
							else{
								toastr["error"](response.msg);
							}
						},
						error: function(error) {
							console.log(error);
						}
					});
				} 
			});	
			
		}
	});
	$(document).on('click','.icon-bulk-example',function(event){
		$('#upload-bulk-image')[0].value='';
		$('#upload-bulk-image').mclick();
	});
	$(document).on('change', '#upload-bulk-image', function(){
		if(document.getElementById("upload-bulk-image").files[0] == null)
		{
			return false;
		}
		var name = document.getElementById("upload-bulk-image").files[0].name;
		
		var ext = name.split('.').pop().toLowerCase();
		if(jQuery.inArray(ext, ['gif','png','jpg','jpeg']) == -1) 
		{
			alert("Invalid Image File");
		}		
		var oFReader = new FileReader();
		oFReader.readAsDataURL(document.getElementById("upload-bulk-image").files[0]);
		var f = document.getElementById("upload-bulk-image").files[0];
		var fsize = f.size||f.fileSize;
		if(fsize > 2048000)
		{
		 	alert("Image File Size is very big");
		}
		else
		{
			chrome.storage.local.get(["ssa_user", "fb_id"], function(result) {
				if( typeof result.ssa_user != "undefined" && result.ssa_user != "" && typeof result.fb_id != "undefined" && result.fb_id != "" ){
					var form_data = new FormData();
					form_data.append("upload-image", document.getElementById('upload-bulk-image').files[0]);
					form_data.append("user_id", result.ssa_user.id);
					form_data.append("fb_user_id", result.fb_id);
					// form_data.append("upload-image", $('input[type=file]')[0].files[0]);
					$.ajax({
						url:apiBaseUrl + "/uploads/images",
						method:"POST",
						data: form_data,
						contentType: false,
						cache: false,
						processData: false,
						beforeSend: function (xhr) {
							xhr.setRequestHeader('unique-hash', uniqueHash);
						},  
						success:function(response)
						{
							if(response.status == 401){
								triggerLogout();
								return false;
							} else if(response.status == 200 || response.result == 'success') {
								let imageBulk= response.file_path;
								imageBulk='<img src="' + imageBulk +'" width="400" height="auto">';
								if(imageBulk!==''){
									let bulk_text = $('#bulk_text').val(); 
									if(typeof bulk_text !="undefined"){ 
										var length = imageBulk.length;
										chrome.storage.sync.get('emoji_bulk_focus', item => {
										
										if (bulk_text.length > 1 && item.emoji_bulk_focus!=0) {
											var count = Array.from(bulk_text.split(/[\ufe00-\ufe0f]/).join("")).length;
										
											const usingSpread = [...bulk_text]; 
										
											var output = usingSpread.slice(0, item.emoji_bulk_focus).join('') +  imageBulk + usingSpread.slice(item.emoji_bulk_focus, count).join('');
												
											$('#bulk_text').val(output);  

										}
										else if (bulk_text.length > 1 && item.emoji_bulk_focus==0) {
							
											$('#bulk_text').val(bulk_text + imageBulk); 
										}else{
											$('#bulk_text').val(imageBulk); 
										} 
										
										chrome.storage.sync.set({emoji_bulk_focus: parseInt(item.emoji_bulk_focus) + length });
									
									});
									} 
								}
							}
							else{
								toastr["error"](response.msg);
							}
						},
						error: function(error) {
							console.log(error);
						}
					});
				}
			});			
		}
	   });
	// $(document).on('blur','.edit-message-text', function() {
	// 	selected_message = this;
	// 	var attr = $(this).parent().parent().attr('message-id');
	// 	if (typeof attr !== typeof undefined && attr !== false) {
	// 		saveMessage($(this).val(), attr);
	// 	} else {
	// 		saveMessage($(this).val());
	// 	}	
	// });	

/*----------------tag-------------------*/

    $(document).on('click','.edit-tag', function() {
    	$('.tag-name').show();
    	$('.tag-name-span').hide();
		var tagId = $(this).attr('tag-id');	
		tagName =$(this).parent().parent().parent().parent().prev().find('.tag-name').val();
		$(this).parent().parent().parent().parent().prev().find('.tag-name').focus();
		if (userId != "") {
			selected_tag = tagId;
		}
	});
	$(document).on('click','.duplicate-tag', function() {    
		var tagId = $(this).attr('tag-id');		
		if (userId != "") {
			selected_tag = tagId;
			duplicateUserTag();
		}
	});
	
	$(document).on('click','.remove-new-tag', function() {	
		$(this).closest('.secondary-1').parent().parent().remove();
		if($('.tag_row').length > 0){
			$('.search-img').hide();
			$('#tag-container').show();
		}else{
			$('.search-img').show();
			$('#tag-container').hide();
		}		
	});

	$(document).on('click','.remove-tag', function() {
		tagId = $(this).attr('tag-id');
		if (userId != "") {
			$('#deleteTagModal').modal("show");
		}
	});

	$('#confirm-tag-delete').on('click',function(){
		if (userId != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tags/delete",
				data: {userId:userId, tagId:tagId },
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				$('#deleteTagModal').modal("hide");
				if(response.status == 401){
						triggerLogout();
						return false;
				} else if(response.status == 200 || response.result == 'success') {

					$('.remove-tag[tag-id="'+tagId+'"]').parent().parent().parent().parent().parent().parent().remove();
					toastr["success"]("Tag removed successfully.");
					chrome.storage.local.get(["tags"], function(result) {
						var temp = [];			
						temp = result.tags;
						let filteredTags = temp.filter((item) => item.value !== tagId);
						chrome.storage.local.set({"tags":filteredTags});	
						chrome.tabs.query({
							active: true,
							currentWindow: true
						}, function (tabs) {
							chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'refresh'});
							refreshTagsOnActions();
						});
					});
					verifyUser();
				} else {
					toastr["error"]("Something went wrong.");
				}
			});
		}
	})

	$(document).on('blur','.tag-name',function(){
		tagName=$(this).val();
		var tagId = $(this).attr('tag-id');
		if (userId != "") {
			selected_tag = tagId;
		}	
		if($('.tag-name').length > 0){
			$(".tag-name").each(function(i, obj) {
				if( $(this).val() == tagName && $(this).attr('tag-id') != tagId) {
					toastr["error"]("Tag already exist.")
					/*$(this).val(tagName);*/
					/*tagProcessing = false;*/					
					return false;
				} else if(i == ($(".tag-name").length - 1)){
					editUserTag();
				}
			});
		}else{
			editUserTag();
		}

	})

	$('.add_new_tag').on('click',function(){
		$('.search-img').hide();
		$('#tag-container').show();
		var taghtml=`<div class="container tag_row p-0 mb-2  new-tag-div" tag-id="" style="background-color: #ac264f">
			<div class="w-75 mx-auto">
			   <div class="row primary p-2">
			      <div class="col-8 pl-0 pr-0">
			      	<span class="tag-name-span" tag-id=""></span>
			      	<input type="text" tag-id="" class="form-control  addtag" placeholder="enter tag..."></div>
			      <div class="col-4 p-0"><span class="contacts-count" tag-id="">0</span> <i class="ml-2 fa fa-angle-up toggle-tag-action"></i></div>
			   </div>
			   <div class="row secondary-1 p-2">
					<div class="col-12 p-0">
					  <ul class="m-0 p-0">`
						+ `<li class="pr-3"><i class="fa fa-trash remove-new-tag" tag-id=""></i></li>` +
					  `</ul>
					</div>
			   </div>
			   </div>
			</div>`;	
			if($('.new-tag-div').length<1){
				$('#show-tags').prepend(taghtml);
				colorPicker = $('.change-color');
				colorPicker.colorpickerplus({});
				$('#tag-container').scrollTop();
			}

				
	})

	$(document).on('blur','.addtag',function(){
		
		var container=$(this);
		tagName = $(this).val();
		chrome.storage.local.get(["tags"], function(result) {
			if(accountConfig.tags == null){
				if(userId != '' && tagName != ''){
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/tags/create",
						data: {tag:tagName, userId:userId, class:tagColors[Math.floor(Math.random()*tagColors.length)]},
						dataType: 'json',
						beforeSend: function (xhr) {
		              	  xhr.setRequestHeader('unique-hash', uniqueHash);
		        		}
					}).done(function(response) {
						
						if(response.status == 401){
							triggerLogout();
							return false;
						}else if (response.status == 404) {
							toastr["error"]('Tag already exist.');
							$('.new-tag-div').find('.form-control.addtag').val('').focus();
						} else {
							toastr["success"](response.msg);
							container.parent().parent().parent().parent().removeClass('new-tag-div');
							container.parent().parent().next().find('.remove-new-tag').addClass('remove-tag');
							container.parent().parent().next().find('.remove-tag').removeClass('remove-new-tag');
							var tagName = $.trim(response.data.text);
							$('.addtag').val(tagName);
							container.prev('.tag-name-span').text(tagName);
							container.prev('.tag-name-span').attr('tag-id',response.data.value);
							container.parent().next().find('.contacts-count').attr('tag-id',response.data.value);
							container.parent().parent().parent().attr('tag-id',response.data.value);
							container.attr('tag-id',response.data.value)
							container.parent().parent().parent().parent().addClass('bg-'+response.data.class);
							container.parent().parent().next().find('.remove-tag').attr('tag-id',response.data.value);
							container.parent().parent().next().find('.edit-tag').attr('tag-id',response.data.value);
							container.parent().parent().next().find('.send-bulk-message').attr('tag-id',response.data.value);
							
							container.parent().parent().next().find('.change-color').attr('tag-id',response.data.value);
							container.parent().parent().next().find('.change-color').attr('id',response.data.value);
							container.addClass('tag-name');
							container.removeClass('addtag');		
							container.hide();
							container.closest('.tag-name-span').show();						
							syncTags(response.data);
						}
						verifyUser();
						tagProcessing = false;	
					});
				} else {
					tagProcessing = false;	
				}
			} else {

				if(result.tags.length < accountConfig.tags){
					// tagName = tagName == null ? $(this).val() : tagName;
					if(userId != '' && tagName != ''){
						$.ajax({
							type: "POST",
							url: apiBaseUrl + "/tags/create",
							data: {tag:tagName, userId:userId, class:tagColors[Math.floor(Math.random()*tagColors.length)]},
							dataType: 'json',
							beforeSend: function (xhr) {
			              	  xhr.setRequestHeader('unique-hash', uniqueHash);
			        		}
						}).done(function(response) {

							if(response.status == 401){
								triggerLogout();
								return false;
							} else if (response.status == 200  || response.result == 'success') {
								toastr["success"](response.msg);
							container.parent().parent().parent().parent().removeClass('new-tag-div');
							container.parent().parent().next().find('.remove-new-tag').addClass('remove-tag');
							container.parent().parent().next().find('.remove-tag').removeClass('remove-new-tag');
							var tagName = $.trim(response.data.text);
							$('.addtag').val(tagName);
							container.prev('.tag-name-span').text(tagName);
							container.prev('.tag-name-span').attr('tag-id',response.data.value);
							container.parent().next().find('.contacts-count').attr('tag-id',response.data.value);
							container.parent().parent().parent().attr('tag-id',response.data.value);
							container.attr('tag-id',response.data.value)
							container.parent().parent().parent().parent().addClass('bg-'+response.data.class);
							container.parent().parent().next().find('.remove-tag').attr('tag-id',response.data.value);
							container.parent().parent().next().find('.edit-tag').attr('tag-id',response.data.value);
							container.parent().parent().next().find('.send-bulk-message').attr('tag-id',response.data.value);
							
							container.parent().parent().next().find('.change-color').attr('tag-id',response.data.value);
							container.parent().parent().next().find('.change-color').attr('id',response.data.value);
							container.addClass('tag-name');
							container.removeClass('addtag');		
							container.hide();
							container.closest('.tag-name-span').show();	
								syncTags(response.data);
							} else {

							} 
							tagProcessing = false;	
						});
					} else {
						tagProcessing = false;	
					}
				} else {
					toastr["error"]('Please, upgrade to premium version to add more tag')
					tagProcessing = false;						
				}
			}			
		})
	});

/*----------contact---------------------*/

	$(".export_Contact").scroll(function(){
		if(!contactsLoaderRunning){
			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				$("#contacts_loader").show();
				$(".tag-user-list").toggleClass('loader-overlay');
				loadMoreContacts();
			}
		}
	});


    $(document).on('click','.contact-menu',function(){
    	$('.contact-drop-down').removeClass('show');
    	$(this).next().find('.contact-drop-down').addClass('show');
    });

    $(document).on("click", function () {
	    $('.contact-drop-down').removeClass('show');
	});
    

    $(document).on('click','.tag-name-span',function(){
    	$('#search_contact').val('');
		//$('.message h5').html('Please click on any tag to see contact here');
    	$('.show-tags-field').show();
		$('.tag-message').hide();
    	var selectedTag=$(this);
    	$("#contacts_loader").toggle();
    	
    	$('.exports,.contacts-search').hide();
    	$('.export_btn').hide();
		abortPrevRequests(requests);

		var fb_page_id = false;
		var $tagClick = $(this);
		var tagName = $(this).text();
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		    if(tabs[0].url.indexOf('/inbox') > -1){
		      	fb_page_id = tabs[0].url.split('/inbox')[0].toString().split('/').pop();
		    }

			if (userId != "") {
				var tag = selectedTagName = $($tagClick).text();
				var tagId = $($tagClick).attr('tag-id');
				customSelectedTagId = selectedTagId = tagId;				
				var tag_parent = $($tagClick).parent();
				$(".tag-user-list").html('');
				chrome.storage.local.get(["ssa_user","fb_id","ssaPopupStates"], function(result) {
					temp=result.ssaPopupStates;
					temp.selected_tag=tagId;
					chrome.storage.local.set({ssaPopupStates:temp});
					loggedInFBId = result.fb_id;
					var postData;
					if (fb_page_id == false) {
						postData = {userId:userId, tag:tag, loggedInFBId:loggedInFBId, tagId: tagId};
					} else {

						postData = {userId:userId, tag:tag, loggedInFBId:loggedInFBId, fb_page_id:fb_page_id, tagId: tagId, search:$('#search_contact').val() };
					} 	
					var buttonLabel = 'Chat';
					chrome.tabs.query({active: true,currentWindow: true}, function (tab) {
						if(tab[0].url.indexOf('/inbox') > -1){
							buttonLabel = 'Copy';
						}
					});				
					requestObj = $.ajax({
						type: "POST",
						url: apiBaseUrl + "/tagged_users",
						data: postData,
						dataType: 'json',
						beforeSend: function (xhr) {
		              	  xhr.setRequestHeader('unique-hash', uniqueHash);
		        		}
					}).done(function(response) {
						if(response.count>=1){
							$('.exports,.contacts-search').show(); 
						}
						if(tabs[0].url.indexOf('/inbox') > -1){
					      	$('.exports').hide();
					    }	

						if(response.status == 401){
							triggerLogout();
							return false;
						}	
						if(response.tagId == customSelectedTagId){
							$('.tag_row').removeClass('selected');
							selectedTag.closest('.tag_row').addClass('selected');
							$('.search-tag').show();
							
							var userList = '';
							if (response.status == 404) {
								/* userList += '<div class="container">There are no user to display. Please assign this tag to a user.</div>';
								$(".tag-user-list").html(userList); */
								$('.message h5').html('There are no user to display. Please assign this tag to a user.');
							} else if(response.data == null) {
								toastr["error"]("No contacts in selected tag!");	
								$(".tag-user-list").html('Please add contacts to list here.');
							}
							else {
								exportCheckBox = '';
								if (isFacebookMessagePage && false) {
									exportCheckBox = '<input class = "multi-export-checkbox" type="checkbox">';
								}
								if(response.data != null) {
									response.data.forEach(function(item){
										if (item.fb_user_id == null) {
											item.fb_user_id = item.fb_image_id;
										}
										userList+=`<div class="col-12 p-0 pl-1 contacts user-tag-row">
													<div class="row pb-1 pt-1">
														<div class="col-2 text-center p-0">
															<img class="profile-image" src="`+item.profile_pic+`" onerror="this.onerror=null;this.src='`+chrome.extension.getURL('assets/images/profile.jpg')+`';" />
														</div>
														<div class="col-5 p-0 pl-1 pr-1 pt-1">
														   <h5 class="vertical-center-align" title="`+item.fb_name+`">`+item.fb_name+`</h5>
														</div>
														<div class="col-1 p-0 mt-3 show-tag-span tags-container" tagged-id = "`+item.id+`" checkedTagIds = "`+item.tag_id+`" clikedFBUserId="`+item.fb_user_id+`" numeric_fb_id="`+item.numeric_fb_id+`" img-url="`+item.profile_pic+`"><i title="Show Tags" class="fa fa-tag "></i></div>`;
										userList+=	`<div class="col-2 p-0 text-right mt-3 header_sec ">
														   <i class="fa fa-ellipsis-v pl-1 pr-3 contact-menu" data-toggle="dropdown"></i>
															<div class="dropdown ">
																<div class="dropdown-menu contact-drop-down">`;

									var options = '';
									var setBackGroundColor = '';
									var setBackGroundClass = '';
									var spanText = '';
									if (typeof response.tags != "undefined" && response.tags != "") {
										temp = response.tags;
										for(i=0;i<response.tags.length;i++){
											var $tagIds = item.tag_id.split(',');
											var temp = $tagIds.filter(function (eachTagId) { return eachTagId.replace(/\#/g,'') == response.tags[i].id});
											var checked = '';
											if (temp.length > 0) {
												checked = 'checked';
												spanText += response.tags[i].name+',';
											}
											var style ='';
											if (response.tags[i].custom_color !== null ) {
												style = 'style = "background:'+response.tags[i].custom_color+' !important"';
											}
										}
									}

									userList+=	`<a class="dropdown-item chat" href="#" fb-id="`+item.fb_user_id+`" img-url="`+item.profile_pic+`" >`+buttonLabel+`</a>
													<a class="dropdown-item notes-btn" href="#">Notes</a>`;
													//COMMENT_OUT
													//<a class="dropdown-item createCalendarEventBtn" href="#" title="Get Notified Through Google Calendar">Add to <br>calendar</a>`;			

									userList+=	`</div></div></div></div></div>`;													
								
								});
							}
								
								$('.message h5').html('You have <span class="total_tagged_user_per_tag" id="total_contacts"> '+response.count+' </span> contacts in ' +tagName);
								constactCountPerTag = response.count;
								$(".tag-user-list").html(userList);
								$(".tag-user-list img").on("error", handleError);
								if(accountConfig.calendar_integration == 0){
									$(".createCalendarEventBtn").hide();
								}
								if (isFacebookMessagePage) {
									$('.export-per-tag').attr('active-tag-id', customSelectedTagId);
									$('.export-per-tag').attr('exactTagName', tagName).show();
								}
							}
							$("#contacts_loader").hide();
							$(".tag-user-list").removeClass('loader-overlay');
							//$('.tag-select-container').multiselect();
						}
					});
					requests.push(requestObj);
				});			
			}
		});
		
	});

	$(document).on('click','.show-tag-span', function() {
		$('.user-tag-row').removeClass('lastClickedUser');
		$(this).closest('.user-tag-row').addClass('lastClickedUser');
		$('.update-multi-tag-btn').prop('disabled',false);
		$('.multi-tag-checkbox').prop('disabled',false);
		var taggedId = $(this).closest('.tags-container').attr('tagged-id')
		checkedTagIds = $(this).attr('checkedTagIds');
		var $tagIds = checkedTagIds.split(',');
		clikedFBUserId = $(this).attr('clikedFBUserId');
		var clikedFBNumericUserId = $(this).attr('numeric_fb_id');
		profilePic = $(this).attr('img-url');
		fbName = $(this).prev().find('h5').text();


		$('#createMultiTagModal').modal('show').removeClass('in').addClass('show');
		chrome.storage.local.get(["tags"], function(response) {
			if (typeof response.tags != "undefined" && response.tags != "") {
				var options = '';
				 response.tags.forEach(function(eachTag,index){

					var temp = $tagIds.filter(function (eachTagId) { return eachTagId.replace(/\#/g,'') == eachTag.value});
					var checked = '';
					
					if (temp.length > 0) {
						checked = 'checked';
					}
					var style ='';
									    
					if (eachTag.color !== null ) {
						style = 'style = "background:'+eachTag.color+' !important"';
						if(checked != ''){
							setBackGroundColor = eachTag.color;
							
							options += "<li selected "+style+" color-code= '"+eachTag.color+"' class='tag-text-color mt-2'  tag-id='"+eachTag.value+"'";
							options += "><input "+checked+" class = 'multi-tag-checkbox mr-1' type='checkbox'>"+eachTag.text+"</li>";
						}else{
							options += "<li "+style+"  color-code= '"+eachTag.color+"' class='tag-text-color mt-2'  tag-id='"+eachTag.value+"'";
							options += "><input "+checked+" class = 'multi-tag-checkbox mr-1' type='checkbox'>"+eachTag.text+"</li>";
						}
					}else{
						if(checked != ''){
							setBackGroundClass = 'bg-'+eachTag.class;
							options += "<li selected class='mt-2 bg-"+eachTag.class+" tag-text-color' color-code= '0' li-class='"+eachTag.class+"' tag-id='"+eachTag.value+"'";
							options += "><input "+checked+" class = 'multi-tag-checkbox mr-1' type='checkbox'>"+eachTag.text+"</li>";
						}else{
							options += "<li class='mt-2 bg-"+eachTag.class+ " tag-text-color' color-code= '0' li-class='"+eachTag.class+"' tag-id='"+eachTag.value+"'";
							options += "><input "+checked+" class = 'multi-tag-checkbox mr-1 ' type='checkbox'>"+eachTag.text+"</li>";
						}
					}
				});
				tagDropDown = '<div  id="updateMultiTag" fbName = "'+fbName+'" tagged-id = "'+taggedId+'"><span clikedFBUserId="'+clikedFBUserId+'"  numeric_fb_id = "'+clikedFBNumericUserId+'" img-url="'+profilePic+'" class="li-tag-containder"><ul class="ul-multi-tags p-0">'+options+'</ul></span></div>';
				$('.li-tag-container').html(tagDropDown);					
				$('#multiTagForm').find('h4').text(fbName);					
			}
		})

	});


/*----------change tag from popup---------*/
	$(document).on('click','.multi-tag-checkbox', function() {

		$checkedTags = [];
		 $('.ul-multi-tags li').each(function(index){
			if ($(this).find('.multi-tag-checkbox').is(':checked')) {
				$checkedTags.push($(this).attr('tag-id'));
			}
		})

		var fbUserId = $('.li-tag-containder').attr('clikedfbuserid');
		var temp_numeric_fb_id = $('.li-tag-containder').attr('numeric_fb_id');
		var imageUrl = $('.li-tag-containder').attr('img-url');
		var taggedId = $('#updateMultiTag').attr('tagged-id');
		var fbName = $('#updateMultiTag').attr('fbName');
		$('.update-multi-tag-btn').prop('disabled',true);
		$('.multi-tag-checkbox').prop('disabled',true);

	
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
			if(tabs[0].url.indexOf('/inbox') > -1){
				var fbPageIdArray = tabs[0].url.split('/inbox')[0].replace("/", "");
				
				fbPageIdArray = fbPageIdArray.split('/');

				fbPageId = fbPageIdArray[fbPageIdArray.length-1];

				$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tags/update",
				data: {taggedId:taggedId,userId:userId,fbPageId:fbPageId, fbName:fbName, fbImageId:fbUserId,  profilePic:imageUrl, loggedInFBId:loggedInFBId, tagIds:JSON.stringify($checkedTags)},
				dataType: 'json',
					beforeSend: function (xhr) {
	              	  xhr.setRequestHeader('unique-hash', uniqueHash);
	        		}
				}).done(function(response) {
					
					if(response.status == 401){
						triggerLogout();
						return false;
					}else if (response.status == 200  || response.result == 'success') {
						if ( typeof response.lastInsertId == 'undefined') {
							var total_contacts = parseInt( $("#total_contacts").text() ) - 1;
							$("#total_contacts").text(total_contacts);
							$('#updateMultiTag').attr('tagged-id', response.lastInsertId);
							$('.lastClickedUser .tags-container ').attr('tagged-id', response.lastInsertId);
						}

						$('.update-multi-tag-btn').prop('disabled',false);
						$('.multi-tag-checkbox').prop('disabled',false);

		                toastr["success"](response.msg);
		                refreshTagsOnActions();
				}
			});
				
			}else if(tabs[0].url.indexOf('/messages/') > -1 || tabs[0].url.indexOf('messenger.com') > -1){
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/tagged_users/update_tags",
					data: {taggedId:taggedId,userId:userId, fbName:fbName, fbUserId:fbUserId, numeric_fb_id:temp_numeric_fb_id, profilePic:imageUrl, loggedInFBId:loggedInFBId, tagIds:JSON.stringify($checkedTags)},
					dataType: 'json',
					beforeSend: function (xhr) {
              	  		xhr.setRequestHeader('unique-hash', uniqueHash);
        			}
				}).done(function(response) {
					
					if(response.status == 401){
						triggerLogout();
						return false;
					}else if (response.status == 200 || response.result == 'success') {
						if ( typeof response.lastInsertId == 'undefined') {
							var total_contacts = parseInt( $("#total_contacts").text() ) - 1;
							
							$("#total_contacts").text(total_contacts);
							$('#updateMultiTag').attr('tagged-id', response.lastInsertId);
							$('.lastClickedUser .tags-container ').attr('tagged-id', response.lastInsertId);
						}
						$('.update-multi-tag-btn').prop('disabled',false);
						$('.multi-tag-checkbox').prop('disabled',false);
		                toastr["success"](response.msg);
		                refreshTagsOnActions();
		                updatePerTagContacts();
					}
				});
			}
		});
	});

	$(document).on('click','.update-multi-tag-btn', function() {
		$('.ul-multi-tags li').each(function(index){
			var stopLoop = true;
			var removeFromTagList = false;
			if (!$(this).find('.multi-tag-checkbox').is(':checked')) {
				if(stopLoop  &&  $(this).text() == selectedTagName){
					stopLoop = false;
					removeFromTagList= true;
				}
			}
			if (removeFromTagList) {
				$(".total_tagged_user_per_tag").text(constactCountPerTag-1);
				$('.lastClickedUser').remove();
			}
		});
	});

	$(document).on('keyup','#search-tag-by-name', function() {
		 var typpedTagName = $(this).val();
		
		 if (typpedTagName != '') {
		 	$('.ul-multi-tags li').hide();
		 	$('.ul-multi-tags li').each(function (oneTag) {
		 	
		 		nnnnn =$(this).text();
		 		
		 		if ($(this).text().toLowerCase().indexOf(typpedTagName.toLowerCase()) > -1) {
		 			$(this).show()
		 		}
		 	})
		 }else{
		 	$('.ul-multi-tags li').show();
		 }
	})


/*------------------chat section-----------------------------*/

    $(document).on('click','.tag-user-list .user-tag-row a.chat', function() {
		var fb_id = $(this).attr('fb-id');
		var $tempUser = $(this);
	 	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
			if(tabs[0].url.indexOf('/inbox') > -1){
				var fName = $tempUser.parent().parent().parent().closest('.user-tag-row').find('h5').text();
				copyToClipboard($tempUser.parent().parent().parent().closest('.user-tag-row').find('h5'));
				toastr["success"]("contact name copied.")
			}else if(tabs[0].url.indexOf('/messages/') > -1 || tabs[0].url.indexOf('messenger.com') > -1){
				chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'openChatThread', fb_id: fb_id});
			}
  		});
	});


/*--------------------notes------------------------*/
	$(document).on('click','.notes-btn', function(){
		$('.show-tags-field').hide();
		$('.tag-message').show();
		$('.load-more-notes').hide();

		var fb_user_id = $(this).parent().find('a').attr('fb-id');
		$('#thread_id').val(fb_user_id);
        $(".inner-sections").hide();
        $(".notes-section").show();		
        		
        $("#notes-listing, .add-note-fields").hide();
        $('.tag-fb-id').text(fb_user_id);

		getUserNotes(fb_user_id);
	});

	
	$(document).on('click','.note-new-delete', function(){
		$(this).parent().parent().remove();
	});

	$(document).on('click','.note-delete', function(){	
		noteId = $(this).parent().parent().attr('note-id');
		$('#myModal-note').modal('show');

	});

	$(document).on('click',".delete-note-conformation", function(){	
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/notes/delete",
			data: {noteId:noteId},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
				toastr["error"](response.msg);
			} else {
				$('div.notes[note-id = "'+noteId+'"]').remove();
				$('#myModal-note').modal('hide');	
				verifyUser();					
			}
		});
		
    });

	$(document).on('blur',".notes-description", function(){				
		var description = $(this).val();

		if(description == ""){
			toastr["error"]('Field can not be empty');
		} else {
			var noteId = $(this).parent().parent().parent().attr('note-id');
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/notes/update",
				data: {noteId:noteId, description: description},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					toastr["error"](response.msg);
				} else {
					toastr["success"]('Your note has been saved');
				}
			});
		}
    });


    $('.note-arrow').on('click',function(){
    	$('.show-tags-field').show();
		$('.tag-message').hide();
    })

    $('.add_note').on('click',function(){
    	$(".default-note").text('');
    	notes =`<div class="col-12 notes mt-3 raw-note p-0">
					<div class="row tab-msg messages " >
						<div class="col-12 p-0">
							<textarea class="form-control add-notes-description" placeholder="write note....."></textarea> 
						</div>
					</div>
					<div class="row pt-2">
						<div class="col-10 note-timing p-0 text-left">
							<span class="note-updatedate text-muted"></span>
							
						</div>
						<div class="col-2 note-new-delete p-0 pr-1 text-right">
							<img src="assets/images/delete.png" title="Delete">
						</div>
					</div>
				</div>`;
		if($('.raw-note').length<1){
			$('#notes-listing').prepend(notes);			
		}				
		$("#notes-more").scrollTop(0);	
		$(".raw-note textarea").focus();
    });
    
    $(document).on('blur','.add-notes-description',function(){
    	var fb_user_id=$('#thread_id').val();
    	var user_id=$('.userId').val();
    	var tagDescription = $(this).val();
    	if(tagDescription){
    		saveNote(tagDescription,fb_user_id,user_id);
    	}else{
    		$(this).focus();
    	}
    	
    })

    $("#notes-more").scroll(function(){
		if(!notesLoaderRunning){
			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				$("#notes_loader").show();
				$(this).toggleClass('loader-overlay');
				loadMoreNotes();
			}
		}
	});
   
/*----------------reminder section-------------------*/
	/*$('.reminder-pagination').hide();

	$(document).on('click','.reminder-pagination', function() {
		remindersLimit += remindersLimit;
		showTab4();
	});*/

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  		var target = $(e.target).attr("href");
  		if(target == '#reminders') {
  			getReminders();
  		} else if(target == '#teams') {
  			showTeams();
		} else if(target == '#birthday') {
			getDoBDate();
			getBdtlMessages();		
			getBddmMessages();	
	  	} 
	});


	$(document).on('click','#reminder_link', function() {
		$('.screens').hide();
		$('#reminders').show();
		getReminders();
		
		chrome.storage.local.get(["ssaPopupStates"], function(result) {
			temp=result.ssaPopupStates;
			temp.last_screen = 'reminders';
			temp.selected_tag = '';
			temp.selected_template = '';
			chrome.storage.local.set({ssaPopupStates:temp});
		})
	});

	$(document).on('click','.add-friends', function() {
		
	    chrome.tabs.query({
        active: true,
        currentWindow: true
        }, function (tabs) {
            if ( tabs[0].url.indexOf('facebook.com/groups/')>-1 && tabs[0].url.indexOf('/members')>-1 ) {
				$('.tab').hide();
				$('#add-friends').show();
            }else{
               $('#open-group-members').modal('show');
            }
        });


		// chrome.storage.local.get(["ssaPopupStates"], function(result) {
		// 	temp=result.ssaPopupStates;
		// 	temp.last_screen = 'add-friends';
		// 	temp.selected_tag = '';
		// 	temp.selected_template = '';
		// 	chrome.storage.local.set({ssaPopupStates:temp});
		// })
	});
	
	$('.add_reminder').on('click',function(){
		$('#reminderForm')[0].reset();
		var activeReminders = $("#all-reminders tbody tr.active").length;

		if(accountConfig.reminders == null || activeReminders < accountConfig.reminders ){
			$('#datetimepicker2').datetimepicker({
                sideBySide: true,
                showClose: true,
				minDate: new Date(),
                format: 'MMMM Do YYYY, h:mm:ss a'
            });
			$('#createReminderModal').modal('show');
		} else {
			toastr["error"]('Please, upgrade to premium version to add more reminders');		
		}
	})

	$("#saveReminder").click(function(){		
    	$("#reminderForm").submit();
    });

    $("#reminderForm").validate({
        rules: {
			title: 'required',
			reminder_time: 'required',
			content: "required"
        },
		errorPlacement: function(error, element) {
			if (element.attr("id") == "date") {				
				error.insertAfter($(element).parent());
			} else {
				error.insertAfter(element);
			}
	    },
        submitHandler: function() {
            saveReminder();
            return false;
        }
    });

    $(document).on('click','.reminder-check',function(){
    	if(this.checked) {
    		reminderId = $(this).attr('reminder-id');
    	}
    	
    });
    
    $(document).on('click','.reminder-delete', function() {
    	reminderIdsArray = $(this).attr('reminder-id');
    	if(reminderIdsArray!=undefined){
			$('#deleteReminderModal').modal('show');
		} else {
			toastr["error"]("Something went wrong!");
		}
	});

	$('.delete-reminder-confirmation').on('click', function() {
		if(reminderIdsArray != [] && reminderIdsArray != ''){
			$('#reminder_loader').show();
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/reminders/delete",
				data: {reminderId:reminderIdsArray},
				dataType: 'json',
				beforeSend: function (xhr) {
	              	xhr.setRequestHeader('unique-hash', uniqueHash);
	        	}
			}).done(function(response) {
				$('#reminder_loader').hide();
				reminderIdsArray = [];
				$('#deleteReminderModal').modal('hide');
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 200 || response.result == 'success') {
	                toastr["success"](response.msg);
					getReminders();
				}
			}).error(function (err) {
				$('#reminder_loader').hide();
			});
		}
		
	});

	/////////// edit-reminder/////////
	$(document).on('click','.reminder-edit', function() {
		var reminderId = $(this).attr('reminder-id');
		$('#new_edit').val(reminderId);
		var reminderTitle = $(this).closest('tr').find('td').eq(1).text();
		var reminderDescription = $(this).closest('tr').find('td').eq(2).text();
		var reminderTime = $(this).closest('tr').find('td').eq(3).text();
		var reminderDate = $(this).closest('tr').find('td').eq(4).text();
		  $('#datetimepicker2').datetimepicker({
                sideBySide: true,
                showClose: true,
                format: 'MMMM Do YYYY, HH:mm:ss',
                pick12HourFormat: false  
            });
		$('#reminderForm, #title').val(reminderTitle);
		$('#reminderForm, #date').val(reminderDate+`,`+reminderTime);
		$('#reminderForm, #content').val(reminderDescription);
	
		$('#createReminderModal').modal('show').removeClass('in').addClass('show');
	});

/*-----------------------------send request to become friend----------*/

	$('.request-cancel-btn').on('click',function(){
		$('.tab').hide();
		$('#dashboard').show();
	});

	$('#send-request-screen').on('click',function(){
		$(this).addClass('active');
		$('#accept-request-screen').removeClass('active');
		$('#menu1').hide();
		$('#home').show();
	});

	$('#accept-request-screen').on('click',function(){
		$(this).addClass('active');
		$('#send-request-screen').removeClass('active');
		$('#home').hide();
		$('#menu1').show();
	});

	$('.friend-request-message').on('click', function() {
		getRequestMessages();
	});

	$('#add-random-msg-outgoing').on('click',function() {

		if($('.randomize-container-request-outgoing .request-message-text-row').length < 3 && $('#outgoing-random-status').is(':checked')){
			$('.randomize-container-request-outgoing').append(randomRequestPreMessageField);
		}	

		if($('.randomize-container-request-outgoing .request-message-text-row').length == 3 ){
			$(this).hide();
		}					
	});

	$('#add-random-msg-comming').on('click', function() {
		
		if($('.randomize-container-request-comming .request-message-text-row').length < 3 && $('#comming-random-status').is(':checked')){
			$('.randomize-container-request-comming').append(randomRequestMessageField);
		}

		if($('.randomize-container-request-comming .request-message-text-row').length == 3 ){
			$(this).hide();
		}						
	});

	$('#outgoing-random-status').change(function() {
        if(this.checked) {
          	$('.randomize-container-request-outgoing .request-message-text-row').show();
          	$('#add-random-msg-outgoing').show();
          	$('.delete-request-textarea').show();
        }else{
        	$('.randomize-container-request-outgoing .delete-request-textarea').hide();
			$('.randomize-container-request-outgoing .request-message-text-row').hide();
			$('.randomize-container-request-outgoing .request-message-text-row').eq(0).show();
			$('#add-random-msg-outgoing').hide();
        }      
    });

    $(document).on('click','.randomize-container-request-outgoing .col-2 .delete-request-textarea', function() {
		noOfBulkTextArea = $('.randomize-container-request-outgoing .request-message-text-row').length;
		if (noOfBulkTextArea > 1) {
			$(this).closest('.request-message-text-row').remove();	
		}

		if($('.randomize-container-request-outgoing .request-message-text-row').length < 3 ){
			$('#add-random-msg-outgoing').show();
		}	

	});

	$(document).on('click','.randomize-container-request-comming .col-2 .delete-request-textarea', function() {
		noOfBulkTextArea = $('.randomize-container-request-comming .request-message-text-row').length;
		if (noOfBulkTextArea > 1) {
			$(this).closest('.request-message-text-row').remove();	
		}

		if($('.randomize-container-request-comming .request-message-text-row').length < 3 ){
			$('#add-random-msg-comming').show();
		}				
	});

	$('#comming-random-status').change(function() {
        if(this.checked) {
          	$('.randomize-container-request-comming .request-message-text-row').show();
          	$('#add-random-msg-comming').show();
          	$('randomize-container-request-comming .delete-request-textarea').show();
        }else{
        	$('.randomize-container-request-comming .delete-request-textarea').hide();
			$('.randomize-container-request-comming .request-message-text-row').hide();
			$('.randomize-container-request-comming .request-message-text-row').eq(0).show();
			$('#add-random-msg-comming').hide();
        }      
    });

    $('.save-request-message').on('click', function() {
    	if($('.save-request-message').is(':disabled') == false) {
			chrome.storage.local.set({friendRequestFlow:'on'});
			$('.toggle-request-flow').removeClass('fa fa-toggle-off');
			$('.toggle-request-flow').addClass('fa fa-toggle-on');    		
    		updateRequestMessages();
    	} else {
    		toastr["error"]("Previous request in progress or failed!");
    	}
	});

	$('.toggle-request-flow').on('click', function() {
		chrome.storage.local.get(["friendRequestFlow"], function(result) {
			var setToggle = 'on';
			if (typeof result.friendRequestFlow != "undefined" &&
				result.friendRequestFlow != "") {
				var toggle = result.friendRequestFlow;
				setToggle = toggle == 'on' ? 'off' : 
								(toggle == 'off' ? 'on' : 'off' );
			}
			chrome.storage.local.set({friendRequestFlow:setToggle});
			if(setToggle == 'on') {
				$('.toggle-request-flow').removeClass('fa fa-toggle-off');
				$('.toggle-request-flow').addClass('fa fa-toggle-on');
			} else {
				$('.toggle-request-flow').removeClass('fa fa-toggle-on');
				$('.toggle-request-flow').addClass('fa fa-toggle-off');
			}
		});
	});

/*--------------------accounts--------------------------------*/
	$(".sign_accounts").click(function(){
		$('.screens').hide();
		$('#accounts').show();
		$('.active .select_btn').hide();
		$('.active .acc_name').css('color','white');
		chrome.storage.local.get(["ssa_user","fb_id","ssaPopupStates"], function(result) {
			temp=result.ssaPopupStates;
			temp.last_screen="accounts";
			temp.selected_tag="";
			temp.selected_template="";
			chrome.storage.local.set({ssaPopupStates:temp});
		})

    });

    //******** unlink fb account***********/
	$(document).on('click','.fb-unlink', function() {
		unlink_fb_id = $(this).attr('fb-id');
		$('#unlinkFBAccountModal').modal('show');
	
    });

    $(document).on('click','.fb-unlink-conformation', function(){
    	$(this).toggleClass('loader-overlay');
    	$.ajax({
				type: "POST",
				url: apiBaseUrl + "/fb_accounts/delete",
				data: {userId:userId, fb_account_id:unlink_fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
	                xhr.setRequestHeader('unique-hash', uniqueHash);
	            }
			}).done(function(response) {
				$('#unlinkFBAccountModal').modal('hide');
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 200 || response.result == 'success') {
					$(this).toggleClass('loader-overlay');
					if(unlink_fb_id == fb_id){
						chrome.storage.local.set({'isCurrentFBLinked':false});
					}
					getUserData();
					chrome.tabs.query({
						active: true,
						currentWindow: true
					}, function (tabs) {
						chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'refresh'});
					});
					$(".screens").hide();
					$('.header-submenu').hide();
					$('.remind_link').hide();
					$('.upgraded').show();
					$('.arrow_icon').hide();
					$("#accounts, .account").show();
				}
			});
    });
	
	//******make primary*******/
	$(document).on('click','.fb-primary', function() {
		var fb_id = $(this).attr('fb-id');
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/fb_accounts/make_primary",
			data: {fb_account_id:fb_id,userId:userId},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {

			if(response.status == 401){
				triggerLogout();
				return false;
			}
		
			if (response.status == 200 || response.result == 'success') {
				showTab3(response);
			}
		});	
	});


	$("#account_integrate").click(function() {
		$('.screens').hide();
		$('#loading-wheel').show();
		chrome.storage.local.get(["fb_id"], function(result) {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/fb_accounts/create",
				data: {userId:userId,fb_account_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
	                xhr.setRequestHeader('unique-hash', uniqueHash);
	            }
			}).done(function(response) {
				//console.log(response);
				if(response.status == 401){
					$('#loading-wheel').hide();
					triggerLogout();
					return false;
				}else if (response.status == 200 || response.result == 'success') {
					chrome.storage.local.set({'isCurrentFBLinked':true});
					chrome.tabs.query({
						active: true,
						currentWindow: true
					}, function (tabs) {
						chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'refresh'});
					});
					location.reload();
					$('#loading-wheel').hide();
					$('#all_tabs').show();
					toastr["success"]('Integration successful.');
				}
			});
		});
	});

/*-----------------------------------login-------------------------*/

	$("#login_screen_form").validate({
        rules: {
            user_email: {
                required: true
            },
            user_password: {
                required: true
            }
        },
        messages: {
            user_email: {
                required: "Please enter email"
            },
            user_password: {
                required: "Please enter password"
            }         
        },
        submitHandler: function() {
            $("#login_screen_form button[type='submit']").attr('disabled',true).text('Validating..');
            login();
            return false;
        }
    });
	/*************** Latest Reminder Scripts ******************/
	$(document).on('click','.reminder-all-check',function(){
    	reminderIdsArray=[];
    	$(".reminder-check").prop('checked',$(this).prop('checked'));
    	if(this.checked){
    		$('.reminder-check').prop('checked',true).each(function(result){
    			reminder=$(this).attr('reminder-id');
    			reminderIdsArray.push(reminder);
    		});
    	}
    });
	
	$(document).on('click','.reminder-check',function(){
    	$('.reminder-check').each(function(){
    		if($(this.check==false)){
    			$(".reminder-all-check").prop('checked', false);	
    		}
    	})
    	if(this.checked==false){
    		reminder=$(this).attr('reminder-id');
    		reminderIdsArray=reminderIdsArray.filter((item)=>item !== reminder);	
    	}else{
    		reminder=$(this).attr('reminder-id');
    		reminderIdsArray.push(reminder);
    	}
    })
	
	/*$(document).on('click','.reminder-delete', function() {
    	if(reminderIdsArray.length>0){
			$('#deleteReminderModal').modal('show');
		}else{
			toastr["error"]('Please select reminder.');
		}
	});*/
	
	$(".reminder-scroll").scroll(function(){
		if(!reminderLoaderRunning){
			if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				$("#reminder_loader").show();
				$(this).toggleClass('loader-overlay');
				loadMoreReminder();
			}
		}
	});
	$('.send_hb_btn').click(function() {
		let reqArr = Object.values(HB_DATA);
		chrome.storage.local.get(reqArr, (result) => {
			if (result[HB_DATA.CAN_SEND] === "0") {
				toastr["info"]("You must set HB to active before sending");
			} else {
				chrome.runtime.sendMessage({action: 'startHBProcess'});
			}
		});
	});
	$('#chkDoBDay').change(function() {
		console.log('Toggle: ' + $(this).prop('checked'));		
		// Save do bday
		var do_bday =  $(this).prop('checked') === true? "1":"0";
		chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
			if( typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user != "undefined" && result.ssa_user != ""  ){
				$.ajax({
					type: "POST",
					url: apiBaseUrl + "/birthdays/toggle",
					data: {userId:result.ssa_user.id,do_bday:do_bday},
					dataType: 'json',
					beforeSend: function (xhr) {
						xhr.setRequestHeader('unique-hash', uniqueHash);
					}
				}).done(function(response) {
					if(response.status == 401){
						chrome.storage.local.set({'ssa_user':''});	
					}else if (response.status == 404) {
						//port.postMessage({'false': true});
					} else {
						const storageObj = {};					
						storageObj[HB_DATA.CAN_SEND] = response.do_bday;
						chrome.storage.local.set(storageObj);						            
					}				  
				});	
			}
		})
	});
});

function loadMoreReminder(){
	reminderLoaderRunning = true;
	loadedReminderLastIndex = $('#all-reminders tbody tr').length;
	chrome.storage.local.get(["fb_id"], function(result) {
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/reminders/load",
			data: {fb_account_id:result.fb_id,lastIndex:loadedReminderLastIndex},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if(response.status == 404){

			}else if (response.status == 200 || response.result == 'success') {
				reminderDataArray =  response.data;
				showTab4(true);			
			}
			reminderLoaderRunning = false;
			$("#reminder_loader").toggle();
			$(".reminder-scroll").toggleClass('loader-overlay');
		});
	});
}

/********* LOGIN  *******/
function login() {

	$('.screens').hide();
	$('#loading_wheel').show();
    $.ajax({
        type: "POST",
       	url: apiBaseUrl + "/users/login",
        data: { user_email: $("#user_email").val(), user_password: $("#user_password").val() },
        dataType: 'json',
		beforeSend: function (xhr) {
      	  xhr.setRequestHeader('unique-hash', uniqueHash);
		}
    }).done(function(response) {
        $('#loading_wheel').hide();
        $("#login_screen_form button[type='submit']").removeAttr('disabled').text('Login');
		if (response.status == 404) {
			$('#login_screen').show();
			toastr["error"](response.msg);
		} else if(response.hasOwnProperty('apiToken')) {
			toastr["success"]('You’ve logged in successfully.');
			reloadAllTabsOnLogout();
			userId = response.user.id;

			uniqueHash = response.apiToken;
            chrome.cookies.set({ url: baseUrl, name: "cts_unique_hash", value:  response.apiToken, expirationDate: (new Date().getTime()/1000) + (3600 * 1000*87660)  });
           
			chrome.cookies.set({ url: custom_data.baseUrl, name: "ssa_user", value:  userId, expirationDate: (new Date().getTime()/1000) + (3600 * 1000*87660)  });
			 chrome.runtime.sendMessage({'randomHashForBackgroundCTS': 'randomHashForBackgroundCTS',uniqueHash:uniqueHash})
			chrome.storage.local.set({'ssa_user': response.user});
			dashboard();
				
		} else {
			$('#login_screen').show();
			toastr["error"](response.msg);
		}
    });
}

/********* To update the extension popup pages *******/
function dashboard() {
	chrome.storage.local.get(["ssa_user"], function(result) {
        if (typeof result.ssa_user != "undefined" && result.ssa_user != "") {		
            checkFBMessengerIsActive();   
        }else if(typeof result.ssa_user != "undefined" && result.ssa_user == ""){
        	$('.screens').hide();
        	$('#loading-wheel').hide();
        	$('#login_screen').show();
        } else {
			$('#loading-wheel').hide();
			triggerLogout();
		}
    }); 
}

function reloadAllTabsOnLogout() {
 	chrome.windows.getAll(function(windows) {
		windows.forEach(function (eachWindow) {
			if (eachWindow.type == "normal") {
				chrome.tabs.getAllInWindow(eachWindow.id, function(tabs) {
						for (var i = 0, tab; tab = tabs[i]; i++) {
						if (tab.url && ( tab.url.indexOf('/inbox') != -1 || tab.url.indexOf('facebook.com/messages') != -1 || tab.url.indexOf('messenger.com') != -1 || tab.url.indexOf('facebook.com') != -1) ) {
							chrome.tabs.reload(tab.id);
						}
					}
				});
			}
		});
	});
}

 /********* To Check Web Facebook Messenger is active or not *******/
function checkFBMessengerIsActive(){

	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {

			if (tab.url && ( tab.url.indexOf('/inbox') != -1 || tab.url.indexOf('facebook.com/messages') != -1 || tab.url.indexOf('messenger.com') != -1) && tab.active) {
				
				chrome.tabs.sendMessage(tab.id,{from: 'popup', subject: 'setFbId'});
				
				
				FBMessengerisActive = true;

				refreshTagsOnActions();
				getUserData();

				chrome.runtime.sendMessage({getBlukMessageState: "getBlukMessageState"});
				if (tab.url.indexOf('/inbox') != -1) {
					setInterval(()=>{
						$('.send-bulk-message').prop('disabled', true);
						$('.export_tags').prop('disabled', true);
						$('a.send-bulk-message').hide();
						$('a.export-tag-users').hide();
						isFacebookMessagePage = false;
					},100);
				}
				$('.remind_link,.account').show();
				return;			
			}
			else if (tab.url && ( tab.url.indexOf('/groups/') != -1 && tab.url.indexOf('/members') != -1 ) && tab.active) {
					
				runADFFunctionality(tab.id);
				return false;
			}
			else {
				//console.log("out");
				
				$('.remind_link, .account').hide();
				$('.upgraded').show();
				$('.arrow_icon').hide();
				$(".screens").hide();
				$('#fb_messenger_login_dasboard').show();
				$('.messenger').show();
        		$('.facebook').hide();
			}
		}
	});
}

function refreshTagsOnActions() {
	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (tab.url  && ( tab.url.indexOf('/inbox') != -1 || tab.url.indexOf('facebook.com/messages') != -1 || tab.url.indexOf('messenger.com') != -1)) {
				chrome.tabs.sendMessage(tab.id,{from: 'popup'});
			} 
		}
	});
}

function getUserData(){
	
	getAccountProfilePic();
	
	chrome.storage.local.get(["ssa_user","fb_id","ssaPopupStates", "teams", "teamMembers"], function(result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/users/data",
				data: {userId:result.ssa_user.id,fb_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					//port.postMessage({'false': true});
				} else {
					chrome.runtime.sendMessage({action: "taggedUserfromGroupleads", taggedUserfromGroupleads:response.taggedUserfromGroupleads});
					userId = response.data.id;	
					accountConfig = response.planConfig;
					is_expired= response.data.is_expired;
					partner_url= response.data.partner_url;
					if(is_expired == 1){
						$('.screens').hide();
						document.getElementById("partner_url").href = partner_url;
						$('#expired_accounts_screen').show();						
						return;
					}
					/*if(response.planConfig.id == 1){
						$(".createCalendarEventBtn").hide();
					}
					if(response.planConfig.id <= 4){
						$("#upgrade-link-container").show();
					}		*/							
					$(".userId").val(userId);												
					displayTags(response.tags, response.taggedUsers, result.fb_id);
					linkedFbAccount = response.linkedFbAccounts.filter((item) => item.fb_account_id == result.fb_id);	
					if (linkedFbAccount.length > 0 && linkedFbAccount[0].google_sheet_url != null) {
						$('#google_sheet_url').val(linkedFbAccount[0].google_sheet_url);
						if(linkedFbAccount[0].account_image_url){
							$('.current-profile-image').attr('src',linkedFbAccount[0].account_image_url);
						}

					}

					isCurrentFBLinked = (linkedFbAccount.length > 0)?true:false;
					chrome.storage.local.set({'ssa_user': response.data, 'tags': response.tags.reverse(), 'taggedUsers':response.taggedUsers,'linkedFbAccount':(linkedFbAccount.length > 0)?linkedFbAccount[0]:null, 'isCurrentFBLinked':isCurrentFBLinked});
					const storageObj = {};
					storageObj[HB_DATA.IS_WORKING] = response.processbirthdays;
					if(response.birthdays != null)
					{
						storageObj[HB_DATA.BDTLMSG] = response.birthdays['birthdaysdm'];
						storageObj[HB_DATA.BDDMMSG] = response.birthdays['birthdaystl'];
					}
					if(response.lastbdaydate != null){
						storageObj[HB_DATA.LAST_DATE] = response.lastbdaydate;
					}
					if(response.do_bday != null){
						storageObj[HB_DATA.CAN_SEND] = response.do_bday;
					}
					chrome.storage.local.set(storageObj);
					// chrome.storage.local.set({'birthdays': response.birthdays, 'processbirthdays': response.processbirthdays});
					createUpgradeButton(response.data);

					if(!isCurrentFBLinked){
						showTab3(response, true);
					} else {
						if(!isBulkRunning){
							showTab3(response,false);
							$('.screens').hide();
							$('#all_tabs').show();
							setTimeout(function(){
								showMessageTemplates();
							},1000)

							$('#bulk_message').hide();
							if(result.ssaPopupStates.last_screen=="reminders"){
								$('.remind_link').mclick();
							}else if(result.ssaPopupStates.last_screen=="accounts"){
								$('.sign_accounts').mclick();
							}else if(result.ssaPopupStates.last_screen=="send_message"){
								$('.friend-request-message').mclick();
							}else if(result.ssaPopupStates.last_screen=="bulk_message"){
								$('.send-bulk-message').mclick();
							}else if(result.ssaPopupStates.last_screen=="tagged_user"){
								$('.export_tags').mclick();
							}
							else if(result.ssaPopupStates.last_screen=="add-friends"){
								$('.add-friends').mclick();
							}

						}else{
							//console.log('getUserData3');
							$('#dashboard').hide();
							$('#bulk_message').show();
						}
					}
					
				}
			});												
        }else{
        	$('#loading-wheel').hide();
        	$('.navbar').hide();
			$(".screens").hide();
			$('#fb_messenger_login_dasboard').show();
			$('.messenger').hide();
        	$('.facebook').show();
        }
        if (typeof result.teams == "undefined" || result.teams == [] || result.teams.length == 0) {		
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/teams",
				data: {userId:result.ssa_user.id,fb_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				var teamsData = [];
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					//port.postMessage({'false': true});
				} else if (response.status == 200 || response.result == 'success') {
					teamsData = response.data;
				}
				chrome.storage.local.set({teams: teamsData});
			});
		}
		if (typeof result.teamMembers == "undefined" || result.teamMembers == []) {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/team_members",
				data: {userId:result.ssa_user.id,fb_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				var teamMembersData = [];
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					//port.postMessage({'false': true});
				} else if (response.status == 200 || response.result == 'success') {
					teamMembersData = response.data;
				}
				//alert(JSON.stringify(teamMembersData));
				chrome.storage.local.set({teamMembers: teamMembersData});
			});
		}		
    });
}

function getAccountProfilePic(){
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'profile_Pic'});
	});
}

function displayTags(tags , taggedUsers, currentFBUserId){
	tags = tags.reverse();
    var newTags = [];    
	var tagsList = '';
	var current_fb_user_id = '';
	chrome.storage.local.get(["fb_id"], function(result) {
		current_fb_user_id = result.fb_id;
	});	
    tags.forEach(function(tag) {
    	var contactsPerTag = 0;

		taggedUsers.forEach(function (tagUser,indexTagUser) {
			searchTagById = tag.value;
			if(typeof tagUser.tag_id == "string") {
				tagUser.tag_id = tagUser.tag_id.split(",");
			}
			if (tagUser.fb_user_id != null && (tagUser.tag_id.indexOf(searchTagById) > -1) && 
				tagUser.account_fb_id == currentFBUserId) {
				contactsPerTag++;
			} 

		});
		temp = {};
		temp.value=tag.value;
		temp.color=tag.color;
		temp.contactsPerTag=contactsPerTag;
		temp.text = tag.text;
		temp.class = tag.class;
		newTags.push(temp);
		tagsList +=	`<div class="form-check">
				<label class="form-check-label" for="check1">
					<input type="radio" class="form-check-input" id="sel-tag" name="sel-tag" value="`+tag.value+`" checked>
					`+tag.text+`
				</label>
			</div>`;	
	});
	if(tagsList == '') {
		chrome.storage.local.set({currentSelTag: undefined});
		$('.bulk-tags-list').html('Please create tags to list here!');
		$('.export-tags-list').html('Please create tags to list here!');
		$('#show-tags').html('Please create tags to list here!');
		$('#message-listing').html('Please create tags and messages to list here!');
	} else {
		$('.bulk-tags-list').html(tagsList);
		$('.export-tags-list').html(tagsList);
	}
	if(newTags.length>0){
		$('.search-img').hide();
		$('#tag-container').show();
		var tagList='';
		newTags.forEach(function(tag) {
			var tagName = $.trim(tag.text);
			var styleBG = '';
			var bgClass = '';

			if (tag.color != null) {
				styleBG = 'style = "background-color:'+tag.color+'"';
			}else{
				bgClass = "bg-"+tag.class; 
			}
			tagList +=`<div class="container tag_row p-0 mb-2 `+bgClass+`" tag-id="`+tag.value+`"  `+styleBG+`>
					<div class="w-75 mx-auto">
					   <div class="row primary p-2">

					      <div class="col-8 pl-0 pr-0"><span class="tag-name-span"  tag-id="`+tag.value+`">`+tagName+`</span><input type="text" class="form-control tag-name" placeholder="write tag.." tag-id="`+tag.value+`" value="`+tagName+`"></div>
					      <div class="col-4 p-0"><span class="contacts-count" style="border-color:`+tag.color+`" tag-id="`+tag.value+`">`+tag.contactsPerTag+`</span> <i class="ml-2 fa fa-angle-down toggle-tag-action"></i></div>
					   </div>
					   <div class="row secondary p-2">
							<div class="col-12 p-0">
							  <ul class="m-0 p-0">
								 <li class="pr-3"><i class="fa fa-envelope send-bulk-message" tag-id="`+tag.value+`" title="Send Message"></i></li>
								 <li class="pr-3"><i class="fa fa-pencil edit-tag" tag-id="`+tag.value+`" title="Edit"></i></li>
								 <li class="pr-3"><i class="fa fa-clone duplicate-tag" tag-id="`+tag.value+`" title="Duplicate"></i></li>	
								 <li class="pr-3"><i class="fa fa-trash remove-tag" tag-id="`+tag.value+`" title="Delete"></i></li>
								 <li class="pr-3"><i class="fa fa-paint-brush change-color" id="`+tag.value+`" tag-id="`+tag.value+`" title="Change Color"></i></li>
							  </ul>										  
							</div>
					   </div>
					</div>
					</div>`;

		});
		$('#show-tags').html(tagList);
		
		$(".createCalendarEventBtn").show();
		if(accountConfig.calendar_integration == 0){
			$(".createCalendarEventBtn").hide();
		}								
		if(accountConfig.id <= 4){
			$("#upgrade-link-container").show();
		}
		/*if(accountConfig.tags != null){
			$(".bootstrap-tagsinput .tag").each(function(i, obj) {
				if(i > (accountConfig.tags-1)){
					$(this).hide();
				} else {
					$(this).show();
				}
			});
		}*/

		chrome.storage.local.get(["ssaPopupStates"], function(result) {
			if (typeof result.ssaPopupStates != "undefined" && result.ssaPopupStates != "") {
				var selected_tag = result.ssaPopupStates.selected_tag;
				if(selected_tag){
					if($('#show-tags').length > 0){
						$('#show-tags div[tag-id="'+selected_tag+'"] .tag-name-span').mclick();
					}
				}
				
			}
		});


		showOffOnPageTotalContact();
	}else{
		$('.search-img').show();
		$('#tag-container').hide();
	}
}

function showOffOnPageTotalContact() {
	chrome.tabs.getAllInWindow(undefined, function(tabs) {
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (tab.url &&  tab.url.indexOf('/inbox') != -1  && tab.active) {
				// $('.total-contact-per-tag-number').hide();
				$('.contacts-count').hide();
				return;
			}
		}
	});
}

function triggerLogout() {
	$('.screens').hide();
	chrome.storage.local.set({'ssa_user':'','tags':'','fb_id':'','taggedUsers':'','teams':'','teamMembers':''});
	chrome.storage.local.set({'birthdays':'','processbirthdays':''});
	chrome.cookies.remove({url: custom_data.baseUrl, name: "ssa_user"})

	reloadAllTabsOnLogout();
	dashboard();
	toastr["info"]("You have logged out.");
	$("#upgrade-link-container").hide();
}

function triggerSettings() {
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if (typeof result.fb_id != "undefined" && result.fb_id != "" && typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/fb_accounts/settings",
				data: {fb_account_id:result.fb_id, userId: result.ssa_user.id},
				dataType: 'json',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('unique-hash', uniqueHash);
                }
			}).done(function(response) {
			
				if (response.status == 200 || response.result == 'success') {				
					$("#setting #location-name").val(response.linkedFbSetting.location);
					$("#setting").modal('show');
				} 
			});
		}		
	});	
}

function createUpgradeButton(userData){
	$(".upgraded").attr('href','https://ssa.com/plans.php?id='+userData.id);
	if(userData.plan_id < 5){
		$(".upgraded").html('Upgrade').attr('title','Upgrade');
	} else if(userData.plan_id <= 1){
		$(".upgraded").html('Downgrade').attr('title','Downgrade');
	}else if(userData.plan_id == 5){
		$(".upgraded").hide();
	}
}

function showTab3(userData, display){
	
	$("#reminders-screen").show();

	chrome.storage.local.get(["fb_id"], function(result) {

		var linkedFbAccounts =  userData.linkedFbAccounts;
		var isAlreadylinked = false;
		var rows = '';
		$("#existing_linked_accounts").html('');	
		linkedFbAccounts.forEach(function(item, i) {
			if(result.fb_id == item['fb_account_id']){
				isAlreadylinked = true;
			}
			active="";
			is_primary = (item['is_primary']==1) ? 'Yes' : 'No';
			if(item['is_primary']==1){
				active="active";
			}
			if(item.account_image_url){
				image_url=item.account_image_url;
			}else{
				image_url="assets/images/default_account.png";
			}
			rows +=`<div class="p-1 col-3 h-50 `+active+`">
				<div class="card">
					<img class="card-img-top linked-profile-image  rounded-circle p-2" src="`+image_url+`" alt="Card image cap">
						<div class="card-body">
							<h5 class="card-title h-25 mb-3 acc_name" primary=`+is_primary+` >`+item['fb_account_id']+`</h5>`;

			if(item['is_primary']==0){
				rows += `<i class="fa fa-trash fa-2x p-2 float-right fb-unlink text-icon" title="Unlink Account" class="delete_icon select_btn setting-action fb-unlink" fb-id=`+item['fb_account_id']+`></i>`;
			}
			
			if(item['is_primary']==0){
				rows +=`<a href="#" class="btn btn-primary fb-primary select_btn action-button float-left" title="Set default" fb-id=`+item['fb_account_id']+`>Set Default</a>`;
			} else {
				rows +=`<a class="btn btn-secondary fb-primary select_btn action-button float-left">Current Default</a>`;
			}
			rows +=`</div></div></div> `;


			/*rows +=`<div class="parent text-center ">
					<div class="profile pt-3 pb-3 `+active+`">
						<img src="`+image_url+`" class="mb-3">`;

			if(item['is_primary']==0){
				rows += `<img src="assets/images/delete_icon.png" title="Unlink Account" class="delete_icon select_btn setting-action fb-unlink" fb-id=`+item['fb_account_id']+`>`;
			}
			rows +=`<h4 class="mb-3 acc_name" primary=`+is_primary+` >`+item['fb_account_id']+`</h4>`;
			if(item['is_primary']==0){
				rows +=`<a href="#" class="btn btn-primary fb-primary select_btn" title="Make Primary" fb-id=`+item['fb_account_id']+`>Select</a>`;
			}
			rows +=`</div></div> `;
			*/
		});
		$("#existing_linked_accounts").append(rows);		
		//$("#current_fb_id").text(result.fb_id);		
		fb_id = result.fb_id;
		if (!isAlreadylinked) {
			$('.remind_link').hide();
			$('.upgraded .account').show();
			$('#arrow_icon_account').hide();
			if(accountConfig.fb_accounts == null || linkedFbAccounts.length < accountConfig.fb_accounts){
		 		$("#linked_accounts").show();
		 		$("#account_integrate").show();
		 		$("#account_upgrade").hide();
		 	} else {
		 		$("#linked_accounts").show();
		 		$("#account_integrate").hide();
		 		$("#account_upgrade").show();
		 	}
		}
	});
	if(display){
		$("#linked_accounts_screen").show();
	}
}

function showMessageTemplates(isSearch = false) {

	$('#template-list').hide();
	$('#templates_loader').show();
	if(isSearch == true) {
		abortPrevRequests(templateRequests);
	}
	var requestObj = $.ajax({
			type: "POST",
			url: apiBaseUrl + "/templates",
			data: {userId:userId,search:searchTemplate},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {

			var templateList = '';
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
				$('#templates_loader').hide();
				$('#template-list').addClass('scroll-vertical');
				toastr["error"](isSearch == true ? "No matches" : noTemplateMsg);
				$(".templates").html('');
				$(".messages").html('');
			} else {
				/*if(response.data.length>7){
					$('.btn-load-more').show();
				}*/
				if(response.data.length == 0) {
					toastr["error"](isSearch == true ? "No matches" : noTemplateMsg);
					$(".templates").html('Please add templates to list here!');
					$(".messages").html('Please add messages to list here!');
					$('#messages_loader').hide();
				} else {			
					response.data.forEach(function(item, index){
					$('#bulk-templates').append($('<option>', { 
						value: item.id,
						text : item.name 
					}));
					templateList += `<div template-id="`+item.id+`" class="row template_name w-100 show-template-message pl-1 pt-2">
						<div class="col-8 template-view-text">
							<div class="card bg-light template-card view-text">
								<div class="card-body card-body-templates">
									<div class="card-text">`+item.name+`</div>
								</div>
							</div>
							<input type="text" class="form-control edit-text" autocomplete="off" value="`+item.name+`" style="display: none;">
						</div>
						<div class="col-3 my-auto">
							<div class="row">
								<div class="col-1 mx-auto my-auto p-1">
									<i class="fa fa-pencil edit-template text-icon" title="Edit"></i>
								</div>
								<div class="col-1 mx-auto my-auto p-1">
									<i class="fa fa-send send-multi-message text-icon" title="Share"></i>
								</div>
								<div class="col-1 mx-auto my-auto p-1">
									<i class="fa fa-trash delete-template text-icon" title="Delete"></i>
								</div>
							</div>
						</div>
					</div>`;						
					});
					$(".templates").html(templateList);
					$(".templates").find('.show-template-message')[0].click();
				}
				$('#templates_loader').hide();
				$('#template-list').addClass('scroll-vertical');
				if(accountConfig.templates != null){
					$(".templates .form-group").each(function(i, obj) {
						if(i > (accountConfig.templates-1)){
							$(this).hide();
						} else {
							$(this).show();
						}
					});
				}
			}
		});
	templateRequests.push(requestObj);
	chrome.storage.local.get(["ssaPopupStates"], function(result) {
			if (typeof result.ssaPopupStates != "undefined" && result.ssaPopupStates != "") {
				var selected_template_reminder = result.ssaPopupStates.selected_template;
				if(selected_template_reminder){
					setTimeout(()=>{
						if($('.template_name').length > 0){
							//$(".template-list").animate({ scrollTop: 1000 }, 2000);
							$('.new_template div[template-id="'+selected_template_reminder+'"] .show-template-message').mclick();	
						}
					},1000);
				}
						
			}
		});

	$('#template-list').show();
}

function saveTemplate(template, template_id = 0) {	
	if(userId != ''){
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/templates/create_update",
			data: {template:template, userId:userId, templateId:template_id},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
			} else {
				$(selected_template).parent().parent().parent().attr('template-id',response.data.id);
				$(selected_template).val(response.data.text);
				$(selected_template).parent().parent().parent().next().find('.delete-new-template').addClass('delete-template');	
				$(selected_template).closest('.row').find('.view-text').text(response.data.text);
				$(selected_template).val(response.data.text);
				$(selected_template).closest('.template_name ').removeClass('raw-template');
				$(selected_template).parent().parent().parent().next().find('.delete-template').removeClass('delete-new-template');	
				var action = template_id == 0 ? "created" : "saved";
 				toastr["success"]("Template " + action + " successfully.");	
			}
		});
	}
	$("#templates_loader").show();
	$(".templates").html('');
	setTimeout(function(){
		showMessageTemplates();
	},1000)
}

/* teams */
function showTeams(isSearch = false) {

	$('#team-list').hide();
	$('#teams_loader').show();
	$(".teams").html('');
	if(isSearch == true) {
		abortPrevRequests(teamRequests);
	}
	chrome.storage.local.get(["fb_id"], function(result) {
		loggedInFBId = result.fb_id;
		var requestObj = $.ajax({
			type: "POST",
			url: apiBaseUrl + "/teams",
			data: {userId:userId,search:searchTeam, fb_id:result.fb_id},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			var teamsData = [];
			var teamList = '';
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
				$('#teams_loader').hide();
				$('#team-list').addClass('scroll-vertical');
				toastr["error"](isSearch == true ? "No matches" : noTemplateMsg);
			} else {				
				/*if(response.data.length>7){
					$('.btn-load-more').show();
				}*/
				if(response.data.length == 0) {
					toastr["error"](isSearch == true ? "No matches" : noTemplateMsg);
					$(".teams").html('Please add teams to list here!');
					//$(".messages").html('Please add messages to list here!');
					//$('#messages_loader').hide();
				} else {	
					teamsData = response.data;
					chrome.storage.local.set({teams: teamsData});		
					response.data.forEach(function(item, index){
					teamList += `<div team-id="`+item.id+`" class="row team_name w-100 show-team-message pl-1 pt-2">
						<div class="col-8 team-view-text">
							<div class="card bg-light team-card view-text">
								<div class="card-body card-body-teams">
									<div class="card-text">`+item.name+`</div>
								</div>
							</div>
							<input type="text" class="form-control account-fb-id" value="`+item.account_fb_id+`" style="display: none;">
							<input type="text" class="form-control edit-team-name" autocomplete="off" value="`+item.name+`" style="display: none;">
						</div>`;
					if(item.account_fb_id == loggedInFBId){
						teamList +=`
							<div class="col-3 my-auto">
								<div class="row">
									<div class="col-1 mx-auto my-auto p-1">
										<i class="fa fa-pencil edit-team text-icon" title="Edit"></i>
									</div>
									<div class="col-1 mx-auto my-auto p-1">
										<i class="fa fa-trash delete-team text-icon" title="Delete"></i>
									</div>
								</div>
							</div>
						</div>`;
					}
					else{
						teamList +=`</div>`;
					}					
					});
					$(".teams").html(teamList);
					if($('.team-view-text').length > 0 && response.data.length > 0) {
						$(".teams").find('.team-view-text')[0].click();
					}
				}
				$('#teams_loader').hide();
				$('#team-list').addClass('scroll-vertical');
				if(accountConfig.teams != null){
					$(".teams .form-group").each(function(i, obj) {
						if(i > (accountConfig.teams-1)){
							$(this).hide();
						} else {
							$(this).show();
						}
					});
				}
			}
			chrome.storage.local.set({teams: teamsData});
		});
		teamRequests.push(requestObj);
	});
	
	chrome.storage.local.get(["ssaPopupStates"], function(result) {
			if (typeof result.ssaPopupStates != "undefined" && result.ssaPopupStates != "") {
				var selected_team_reminder = result.ssaPopupStates.selected_team;
				if(selected_team_reminder){
					setTimeout(()=>{
						if($('.team_name').length > 0){
							//$(".team-list").animate({ scrollTop: 1000 }, 2000);
							$('.new_team div[team-id="'+selected_team_reminder+'"] .show-team-message').mclick();	
						}
					},1000);
				}
						
			}
		});

	$('#team-list').show();
}

function saveTeam(team, team_id = 0,loggedInFbId) {	
	if(userId != ''){
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/teams/create_update",
			data: {team:team, userId:userId, teamId:team_id, loggedInFbId :loggedInFbId},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
			} else {
				$(selected_team).parent().parent().parent().attr('team-id',response.data.id);
				$(selected_team).val(response.data.text);
				$(selected_team).parent().parent().parent().next().find('.delete-new-team').addClass('delete-team');	
				$(selected_team).closest('.row').find('.view-text').text(response.data.text);
				$(selected_team).val(response.data.text);
				$(selected_team).closest('.team_name ').removeClass('raw-team');
				$(selected_team).parent().parent().parent().next().find('.delete-team').removeClass('delete-new-team');	
				var action = team_id == 0 ? "created" : "saved";
 				toastr["success"]("Team " + action + " successfully.");	
			}
		});
	}
	$("#teams_loader").show();
	$(".teams").html('');
	setTimeout(function(){
		showTeams();
	},1000)
}

function getReminders() {
	$('#reminder_loader').show();
	$('#reminders_list').html('');
	chrome.storage.local.get(["fb_id", "ssa_user"], function(result) {
		if (typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/reminders",
				data: {fb_account_id:result.fb_id, userId:result.ssa_user.id},
				dataType: 'json',
					beforeSend: function (xhr) {
	              	  xhr.setRequestHeader('unique-hash', uniqueHash);
	        		}
			}).done(function(response) {
				$('#reminder_loader').hide();
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 200 || response.result == 'success') {
					
					reminderDataArray =  response.data;
					showTab4();
				}
			}).fail(function(error) {
				$('#reminder_loader').hide();
				reminderDataArray = [];
				showTab4();
			});
		}
	});	
}

function showTab4(loadMore = false){
	var isAlreadylinked = false;
	var rows = '';
	var reminderList = '<p>No reminders to display!</p>';
	if (!loadMore) {
		$("#all-reminders tbody").html('');	
	}
	if(reminderDataArray.length > 0) {
		reminderList = `<div class="scroll-vertical"><table class="table table-bordered table-stripedscroll-vertical" id="all-reminders">
				<thead>
				<tr>
				<th>S.No</th>
				<th>Title</th>
				<th>Description</th>
				<th>Date</th>
				<th>Time</th>
				<th>Actions</th>
				</tr>
				</thead>
				<tbody id="reminder_list">`;
		reminderDataArray.forEach(function(item, i) {
			rows = '';
			var descriptionShort = item.description;
			var titleShort = item.title;
			if(descriptionShort.length > 30){
				descriptionShort = jQuery.trim(descriptionShort).substring(0, 30)
							  .trim(this) + "...";
			}
			if(titleShort.length > 30){
				titleShort = jQuery.trim(titleShort).substring(0, 30)
							  .trim(this) + "...";
			}
			
			if(item.status == 1){
				rows += '<tr class="active">';
			} else {
				rows += '<tr>';
			}
			var remindTime = new Date(item.remind_time);
			rows += '<td class="text-center">'+(i+1)+'</td>';
			rows += '<td title="'+item.title+'">'+titleShort+'</td><td title="'+item.description+'">'+descriptionShort+'</td>';
			rows += '<td>'+ remindTime.toLocaleDateString() +'</td>';
			rows += '<td>'+ remindTime.toLocaleTimeString() +'</td>';
			
			if(item.status == 1){
				rows += '<td class="reminder-tab"><a title="Edit" class ="text-icon reminder-action reminder-edit fa fa-pencil" reminder-id="'+item.id+'" href="javascript:void(0)"></a>';
				rows += '<a title="Delete" class ="pl-1 reminder-action text-icon reminder-delete fa fa-trash" reminder-id="'+item.id+'" href="javascript:void(0)"></a>';
				rows +='</td></tr>';
			}else{
				rows += '<td class="reminder-tab"></td>';
				rows +='</td></tr>';
			}
			reminderList += rows;
		});	
		reminderList += '</tbody></table></div>';
	}
	$('#reminders_list').html(reminderList);
}

function saveReminder(){
	reminder_time = $('input[name="reminder_time"]').val();
	var data = {
		title : $('#title').val(),
		description : $('#content').val(),
		reminder_time : moment(reminder_time, "MMMM Do YYYY, h:mm:ss a").format(),
		fb_user_id : fb_id,
		user_id : userId,
		new_edit: $("#new_edit").val()
	}
	$('#createReminderModal').modal('hide');
	$('#reminder_loader').show();
	$.ajax({
			type: "POST",
			url: apiBaseUrl + "/reminders/create_update",
			data: data,
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			$('#reminder_loader').hide();
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 200 || response.result == 'success') {	            
	            toastr["success"](response.msg);
				$('#createReminderEventModal').modal('hide');
				$("#reminderForm")[0].reset();
				$("#new_edit").val(0);
				$('.tabs').hide();
				$('.remind_link').click();
				$('#reminders-screen').click();
				$('#tab4').show();
				getReminders();
			} else{
	            toastr["error"](response.msg);
			}
		}).fail(function(error) {
			$('#reminder_loader').hide();
			toastr["error"]("Something went wrong!");
		});
}

function loadMoreTemplates() {
	templatesLoaderRunning = true;
	loadedTemplatesLastIndex = $("#template-listing div.col-12").length;
	$.ajax({
			type: "POST",
			url: apiBaseUrl + "/templates/load",
			data: {userId:userId, lastIndex:loadedTemplatesLastIndex,search:searchTemplate},
			dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
		}).done(function(response) {
			if(response.status == 401){
				triggerLogout();
				return false;
			}else{
				var templateList = '';					
				response.data.forEach(function(item, index){

					templateList +=`<div class="col-12 mt-3 pl-0 pr-0"><div class="row "><div template-id="`+item.id+`" class="col-10 template_name p-0"><div class="row "><div class="col-1 p-0 show-template-message"><img src="assets/images/envelope.png" class="envelope template-msg"></div><div class="col-11 p-0 template-view-text"><span class="view-text p-1 show-template-message">`+item.name+`</span><input type="text" class="edit-text" autocomplete="off" value="`+item.name+`"></div></div></div><div class="col-2 pr-0 pl-2"><i class="fa fa-pencil edit-template" title="Edit"></i> <img src="assets/images/delete_icon.png"  class="delete-template" title="Delete" ></div></div></div>`;	
				});
				$(".templates").append(templateList);
				
				if(accountConfig.templates != null){
					$(".templates .template-view-text").each(function(i, obj) {
						if(i > (accountConfig.templates-1)){
							$(this).hide();
						} else {
							$(this).show();
						}
					});
				}
				templatesLoaderRunning = false;
				$("#templates_loader").toggle();
				$(".template-list").toggleClass('loader-overlay');
			}
			
		});
}
function saveBdtlMessage(message, message_id = 0){
	if(userId != '' && message != ''){
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/birthdays/addTLmessage",
			data: {message:message, userId:userId,  msgId: message_id},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
			} else {
				$(selected_message).closest('.message-item').attr('message-id',response.data.id);
				var action = message_id == 0 ? "created" : "saved";
				toastr["success"]("Message "+action+" successfully.");
			}
		});
		$("#messages_loader").show();
		$(".bdtl-message-list").html('');
		setTimeout(function(){
			getBdtlMessages();
		},1000)
	}
}
function saveBddmMessage(message, message_id = 0){
	if(userId != '' && message != ''){
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/birthdays/addDMmessage",
			data: {message:message, userId:userId, msgId: message_id},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
			} else {
				$(selected_message).closest('.message-item').attr('message-id',response.data.id);
				var action = message_id == 0 ? "created" : "saved";
				toastr["success"]("Message "+action+" successfully.");
			}
		});
		$("#messages_loader").show();
		$(".bddm-message-list").html('');
		setTimeout(function(){
			getBddmMessages();
		},1000)
	}
}
function saveMessage(message, message_id = 0){
	if(userId != '' && message != ''){
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/template_messages/create_update",
			data: {message:message, userId:userId, templateId:selectedTemplateId, messageId: message_id},
			dataType: 'json',
			beforeSend: function (xhr) {
          	  xhr.setRequestHeader('unique-hash', uniqueHash);
    		}
		}).done(function(response) {
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if (response.status == 404) {
			} else {
				$(selected_message).closest('.message-item').attr('message-id',response.data.id);
				var action = message_id == 0 ? "created" : "saved";
				toastr["success"]("Message "+action+" successfully.");
			}
		});
		$("#messages_loader").show();
		$(".message-list").html('');
		setTimeout(function(){
			getTemplateMessages();
		},1000)
	}
}

function loadMoreMessages() {
	if( selectedTemplateId != ""){
		messagesLoaderRunning = true;
		loadedMessagesLastIndex = $("#messages-listing div.row").length;
		$.ajax({
				type: "POST",
				url: apiBaseUrl + "/template_messages/load",
				data: {templateId:selectedTemplateId, lastIndex:loadedMessagesLastIndex,search:searchMessage},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				var messageList = '';
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if(response.status == 404){

				}else if (response.status == 200 || response.result == 'success') {
					response.data.forEach(function(message){
						messageList +=`<div class="row tabbing message-item" message-id="`+message.id+`">
										<div class="col-10 pl-1">
											Variables to use : [first_name] [last_name]
											<textarea class="form-control edit-message-text" id="template_edit_text" placeholder="write message... ">`+message.message+`</textarea>
										</div>
										<div class="col-2 mt-3">
											<img src="assets/images/delete_icon.png" class="mt-1 delete-msg" title="delete">
											<img src="assets/images/share.png" class="share send-msg" title="Send Message">
										</div>
									</div>`;
					});						
				}
				$("#message-listing").append(messageList);
				messagesLoaderRunning = false;
				$("#messages_loader").toggle();
				$(".msg-template").toggleClass('loader-overlay');
		});	
	} 
}

function loadMoreContacts() {
	abortPrevRequests(requests);
	var fb_page_id = false;
	contactsLoaderRunning = true;
	loadedContactsLastIndex = $(".tag-user-list div.user-tag-row").length;
	var buttonLabel = 'Chat';
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    	if(tabs[0].url.indexOf('/inbox') > -1){
      		fb_page_id = tabs[0].url.split('/inbox')[0].toString().split('/').pop();
      		buttonLabel = 'Copy';
      	}
    });
    var postData;
	if (fb_page_id == false) {
		postData = {userId:userId, tagId:selectedTagId, loggedInFBId:loggedInFBId, lastIndex: loadedContactsLastIndex,search:$('#search_contact').val()};
	} else {
		postData = {userId:userId, tagId:selectedTagId, loggedInFBId:loggedInFBId, lastIndex: loadedContactsLastIndex, fb_page_id:fb_page_id,search:$('#search_contact').val()};
	} 

	requestObj = $.ajax({
			type: "POST",
			url: apiBaseUrl + "/tagged_users",
			data: postData,
			dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
		}).done(function(response) {
			 if(response.status==404){
			 }
			if(customSelectedTagId == response.tagId.replace(/\#/g,'')){
				selectedTagId = response.tagId.replace(/\#/g,'');
				var userList = '';	
				var exportCheckBox = '';
				if (isFacebookMessagePage && false) {
					exportCheckBox = '<input class = "multi-export-checkbox" type="checkbox">';
				}			
				response.data.forEach(function(item){
					if (item.fb_user_id == null) {
						item.fb_user_id = item.fb_image_id;
					}
					userList+=`<div class="col-12 p-0 pl-1 contacts user-tag-row">
									<div class="row pb-2 pt-2">
										<div class="col-3 text-center p-0">
											<img class="p-1" src="`+item.profile_pic+`" />
										</div>
										<div class="col-5 p-0 pl-1 pr-1 pt-1">
										   <h5 class="vertical-center-align" title="`+item.fb_name+`">`+item.fb_name+`</h5>
										</div>
										<div class="col-1 p-0 mt-3 show-tag-span tags-container" tagged-id = "`+item.id+`" checkedTagIds = "`+item.tag_id+`" clikedFBUserId="`+item.fb_user_id+`" numeric_fb_id="`+item.numeric_fb_id+`" img-url="`+item.profile_pic+`"><i title="Show Tags" class="fa fa-tag " ></i></div>`;
					userList+=	`<div class="col-2 p-0 text-right mt-3 header_sec ">
								   <i class="fa fa-ellipsis-v pl-1 pr-3 contact-menu" data-toggle="dropdown"></i>
									<div class="dropdown ">
										<div class="dropdown-menu contact-drop-down">`;



					var options = '';
					var setBackGroundColor = '';
					var setBackGroundClass = '';
					var spanText = '';
					if (typeof response.tags != "undefined" && response.tags != "") { 
						temp = response.tags;
						for(i=0;i<response.tags.length;i++){
							var $tagIds = item.tag_id.split(',');
							var temp = $tagIds.filter(function (eachTagId) { return eachTagId.replace(/\#/g,'') == response.tags[i].id});
							var checked = '';
							
							if (temp.length > 0) {
								checked = 'checked';
								spanText += response.tags[i].name+',';
							}	
						}					
					}
					userList+=	`<a class="dropdown-item chat" href="#" fb-id="`+item.fb_user_id+`" img-url="`+item.profile_pic+`" >`+buttonLabel+`</a>
													<a class="dropdown-item notes-btn" href="#">Notes</a>
													</div></div></div></div></div>`;
													//COMMENT_OUT
													//<a class="dropdown-item createCalendarEventBtn" href="#" title="Get Notified Through Google Calendar">Add to <br>calendar
													//</a></div></div></div></div></div>`;
				});	

				$(".tag-user-list").append(userList);
				$(".tag-user-list img").on("error", handleError);
				if(accountConfig.calendar_integration == 0){
					$(".createCalendarEventBtn").hide();
				}
				contactsLoaderRunning = false;
				$("#contacts_loader").hide();
				$(".tag-user-list").removeClass('loader-overlay');

			}			
		});	
	requests.push(requestObj);
}

function editUserTag(){
	if(selected_tag > 0){
		var tagId = selected_tag;
		selected_tag = 0;
		if(userId != '' && tagName != ''){
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tags/update",
				data: {tag:tagName, tagId:tagId},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				$('.tag-name-span').show();
				$('.tag-name').hide();

				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
				} else {

					$('.tag-name[tag-id="'+tagId+'"').text(tagName);
					$('.tag-name-span[tag-id="'+tagId+'"').text(tagName);
					toastr["success"]("Tag update successfully.");
					/********************/
					chrome.storage.local.get(["tags"], function(result) {
						var temp = [];
						result.tags.forEach(function(item) {
							if(item.value == tagId){
								item.text = tagName;
								temp.push(item);
							} else {
								temp.push(item);
							}
						});						
						chrome.storage.local.set({"tags":temp});	
						chrome.tabs.query({
							active: true,
							currentWindow: true
						}, function (tabs) {
							chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'syncTags'});
							refreshTagsOnActions();
							verifyUser();
						});
					});
					/********************/
				}	
			});
		} 
	}	
}
function duplicateUserTag(){
	if(selected_tag > 0){
		var tagId = selected_tag;
		selected_tag = 0;
		if(userId != ''){
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/tags/duplicate",
				data: {tagId:tagId},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {		

				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
				} else {					
					toastr["success"](response.msg);
					var dupTag= response.data;
					/********************/
					chrome.storage.local.get(["tags"], function(result) {
						var temp = [];
						result.tags.forEach(function(item) {
							temp.push(item);
						});	
						temp.push(dupTag);					
						chrome.storage.local.set({"tags":temp});	
						chrome.tabs.query({
							active: true,
							currentWindow: true
						}, function (tabs) {
							chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'syncTags'});
							refreshTagsOnActions();
							verifyUser();
						});
					});
					/********************/
				}	
			});
		} 
	}	
}
function syncTags(tag){
	chrome.storage.local.get(["tags"], function(result) {
		var temp = [];
		if (typeof result.tags != "undefined" && result.tags != "") { 
			temp = result.tags;
			temp.push(tag);
		} else {
			temp.push(tag);
		}
		chrome.storage.local.set({"tags":temp});	
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'syncTags'});
		});
		colorPicker = $('.change-color');
		colorPicker.colorpickerplus({});
	});
}

function verifyUser(){
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if (typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/users/data",
				data: {userId:result.ssa_user.id,fb_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					$('.screens').hide();
					chrome.storage.local.set({'ssa_user':'','tags':'','fb_id':'','taggedUsers':''});
					reloadAllTabsOnLogout();
					dashboard();
					$("#upgrade-link-container").hide();
					toastr["error"](response.msg);
				} else {		
					chrome.runtime.sendMessage({action: "taggedUserfromGroupleads", taggedUserfromGroupleads:response.taggedUserfromGroupleads});				
					accountConfig = response.planConfig;
					/*if(accountConfig.calendar_integration == 0){
						$(".createCalendarEventBtn").hide();
					}*/						
					if(accountConfig.id <= 4){
						$("#upgrade-link-container").show();
					}
					
					UpgradedDataExistFlag = false;
					
					if(( accountConfig.tags != null && $("#show-tags .tag_row").length > accountConfig.tags) || ( accountConfig.templates != null && $(".templates .template-view-text").length > accountConfig.templates) || (accountConfig.notes != null && $(".notes").length > accountConfig.notes)){
						UpgradedDataExistFlag = true;
					}
						
					$("#show-tags .tag_row").each(function(i, obj) {
						if(accountConfig.tags != null){
							if(i > (accountConfig.tags-1)){
								$(this).hide();
							} else {
								$(this).show();
							}
						} else {
							$(this).show();
						}
						
					});

					/*chrome.storage.local.set({'tags':response.tags});
						chrome.tabs.query({
						active: true,
						currentWindow: true
					}, function (tabs) {
						chrome.tabs.sendMessage(tabs[0].id,{from: 'popup', subject: 'refresh'});
					});
					REDUCE_CALLS
					*/
					displayTags(response.tags, response.taggedUsers, result.fb_id);
					$(".notes").each(function(i, obj) {
						if(accountConfig.notes != null){
							if(i > (accountConfig.notes-1)){
								$(this).hide();
							} else {
								$(this).show();
							}
						} else {
							$(this).show();
						}
					});
					
					$(".templates .template-view-text").each(function(i, obj) {
						if(accountConfig.templates != null){
							if(i > (accountConfig.templates-1)){
								$(this).hide();
							} else {
								$(this).show();
							}
						} else {
							$(this).show();
						}
					});						
				}
			});
        }
    });
}

$(function () {	
	setTimeout(()=>{
		colorPicker = $('.change-color');
		colorPicker.colorpickerplus({});
	}, 2000);	

	$(document).on('click','.change-color', function() {

		var tagId = $(this).attr('tag-id');	
		if (userId != "") {
			var tagId = $(this).attr('tag-id');
			var savingColor = false;
			colorPicker.on('changeColor',function(e,color){		
				if(!savingColor && e.target.id == tagId){

					savingColor = true;	
					$('i[tag-id="'+tagId+'"]').closest('.tag_row').removeClass().addClass('container tag_row p-0 mb-2').css('background-color',color);
					$.ajax({
						type: "POST",
						url: apiBaseUrl + "/tags/change_color",
						data: {userId:userId, tagId:tagId, changedTagColor: color  },
						dataType: 'json',
						beforeSend: function (xhr) {
		              	  xhr.setRequestHeader('unique-hash', uniqueHash);
		        		}
					}).done(function(response) {
						if(response.status == 401){
							triggerLogout();
							return false;
						}

						refreshTagsOnActions();
						verifyUser();
						savingColor = false;
					});
				}
			});	
		}
	});
});

function abortPrevRequests(calls){
	calls.forEach(function(r){
		r.abort();
	});
}

function writeToGoogleSheet(writingData){
	googleSheetDataArray = [];
	writingData.forEach(function (oneItem,oneItemIndex) {
		var tmp = [];
		tmp.push('https://facebook.com/'+oneItem.fb_user_id);
		firstName = oneItem.fb_name.split(' ')[0];
		tmp.push(firstName);
		lastName = oneItem.fb_name.split(' ');
		if (lastName.length > 1) {
			tmp.push(lastName[1]);
		}else{
			tmp.push('');
		}

		tmp.push(oneItem.tagname)
		
		googleSheetDataArray.push(tmp);
	});


	 authorize(function (token) {
        if (token == "undefined" || typeof token == "undefined") {
            notifyClient('bad client id: APP_ID_OR_ORIGIN_NOT_MATCH');
            return;
        }
        AUTH_TOKEN = token;
		if (token) {
			var matches = /\/([\w-_]{15,})\/(.*?gid=(\d+))?/.exec($('#google_sheet_url').val());
			
			if(matches == null){
				//console.log('invalid sheet');
			} else {
				var spreadSheetId = matches[1];
				
				var init = {
					method: 'GET',
					async: true,
					headers: {
						Authorization: 'Bearer ' + token,
						'Content-Type': 'application/json'
					},
					'contentType': 'json'
				};
				var sheetApi = "https://sheets.googleapis.com/v4/spreadsheets/" +spreadSheetId+ "?&includeGridData=false";
				fetch(sheetApi,init).then(function(response) {
					if( response.status == 404){
						//console.log('Invalid google sheet url.');
						
					} else {
						/********* Write to google Sheet******************/
						var init1 = {
							method: 'POST',
							async: true,
							headers: {
								Authorization: 'Bearer ' + token,
								'Content-Type': 'application/json'
							},
							'contentType': 'json',
							body: JSON.stringify({
								range: "Sheet1!A:A",
								"majorDimension": "ROWS",
								values: googleSheetDataArray
							})
						};
						
						var sheetApiUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadSheetId + "/values/Sheet1!A:A:append?valueInputOption=USER_ENTERED";
						
						fetch(sheetApiUrl,init1).then(function(response) {}).then(function(data) {});
						toastr["success"]('Tagged users exported to google sheet.');
						$('#startexport').prop('disabled', false).text('Export');
					}
				}).then(function(data) {});
			}
		}
	})
}

function startExport(selectedExportTagIds, sendAll = false) {
	
	var exportTaggedUserArray = [];
	chrome.storage.local.get(["taggedUsers"], function(result) {

		result.taggedUsers.forEach(function (item,index) {
			
			if (!sendAll) {
				foundTaggedUser = selectedExportTagIds.filter((list) => ((item.tag_id.indexOf('#'+list.tagid+'#') > -1) && item.fb_user_id != null)
				  )
			} 
			
			if( (sendAll || foundTaggedUser.length > 0 ) && item.fb_user_id != null ){
				item.sendBulk = false;	
				exportTaggedUserArray.push(item);
			}			
		});
		

		if (exportTaggedUserArray.length > 0) {
			chrome.tabs.getSelected(null, function (tab){
				if (tab.url.indexOf('/messages/') != -1 || tab.url.indexOf('messenger.com') != -1) {
					
					chrome.storage.local.get(["ssa_user","fb_id", "tags"], function(result) {
						if (typeof result.fb_id != "undefined" && result.fb_id != "") {
							$.ajax({
								type: "POST",
								url: apiBaseUrl + "/tags/export_users",
								data: {userId:result.ssa_user.id,fb_id:result.fb_id, tagIds:selectedExportTagIds},
								dataType: 'json',
								beforeSend: function (xhr) {
							  	  xhr.setRequestHeader('unique-hash', uniqueHash);
								}
							}).done(function(response) {
								if (response.status == 200 || response.result == 'success') {
									newExportTaggedUserArray = [];
									response.data.forEach(function (item,index) {
										foundTaggedUser = selectedExportTagIds.filter((list) => ( (item.tag_id.indexOf('#'+list.tagid+'#') > -1) && item.fb_user_id != null) )
										
										if( foundTaggedUser.length > 0  ){
											tagNameString = [];
											foundTaggedUser.forEach(function (oneTag) {
												tagNameString.push(oneTag.tagname)
											});

											item.tagname = tagNameString.join(',');	
											newExportTaggedUserArray.push(item);
										}			
									});

									writeToGoogleSheet(newExportTaggedUserArray);
								}
							});
						}
					});


				}
			});
		}else{
   			toastr["error"]('No contact found under selected tag.');
   			$('#startexport').prop('disabled', false).text('Export');

		}
	})	
}

function updatePerTagContacts(){
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if (typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/users/data",
				data: {userId:result.ssa_user.id,fb_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					$('.tabs,.navigation').hide();
					chrome.storage.local.set({'ssa_user':'','tags':'','fb_id':'','taggedUsers':''});
					reloadAllTabsOnLogout();
					dashboard();
					$("#upgrade-link-container").hide();
					toastr["error"](response.msg);
				} else {						
						chrome.runtime.sendMessage({action: "taggedUserfromGroupleads", taggedUserfromGroupleads:response.taggedUserfromGroupleads});
					    response.tags.forEach(function(tag) {
				    	var contactsPerTag = 0;

						response.taggedUsers.forEach(function (tagUser,indexTagUser) {
							searchTagById = '#'+tag.value+'#';
							//if (tagUser.fb_user_id != null && (tagUser.tag_id.indexOf(searchTagById) > -1)) {
							if (tagUser.fb_user_id != null && tagUser.tag_id == tag.value) {	
								contactsPerTag++;
							} 

						});
						
						if (selectedTagName == tag.text) {
							$('#total_contacts').text(contactsPerTag);
						}
						$('#show-tags').find('.tag_row[tag-id="'+tag.value+'"]').find('.contacts-count').text(contactsPerTag);
					});

				}
			});
        }
    });
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}

function getUserNotes(fb_user_id){
	$.ajax({
		type: "POST",
		url: apiBaseUrl + "/notes",
		data: {fb_user_id:fb_user_id, user_id:userId},
		dataType: 'json',
		beforeSend: function (xhr) {
      	  xhr.setRequestHeader('unique-hash', uniqueHash);
		}
	}).done(function(response) {
		if(response.status == 401){
			triggerLogout();
			return false;
		}else if (response.status == 404) {
			toastr["error"](response.msg);
		} else {	
			notes = '';
			if(response.data.length>4){
				$('.load-more-notes').show();
			}
			if(response.data.length > 0 ){

				response.data.forEach(function(note,i) {
					var hideNotes = "";				
					if(accountConfig.notes != null && i > (accountConfig.notes-1)){
						hideNotes = "hideNotes";
					}

					var fullDate = new Date(note.updatedDate);
					var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1); 
					var updatedDate = fullDate.getDate() + "/" + twoDigitMonth + "/" + fullDate.getFullYear();					
					notes +=`<div class="col-12 notes mt-3 `+hideNotes+`" note-id="`+note.id+`">
									<div class="row tab-msg messages">
										<div class="col-12 p-0">
											<div class="card">`+note.description+`</div>
										</div>
									</div>
									<div class="row pt-2">
										<div class="col-10 note-timing p-0 pl-1 text-left">
											<span class="note-updatedate text-muted">`+note.updatedDate+`</span>
										</div>
									</div>
								</div>`;
				});
			} else {
				notes = '<p class="default-note">There are no notes to display..</p>';
			}
			$("#notesModalBody").html(notes);
			$("#notesModal").modal("show");
		}
	});
}

function saveNote(tagDescription,fb_user_id,user_id){
	var notesForm = $("#save_note_form").serialize();
	
	if(accountConfig.notes == null || notesForm == ""){
		
		$.ajax({
				type: "POST",
				url: apiBaseUrl + "/notes/create",
				data: {fb_user_id:fb_user_id,user_id:user_id,description:tagDescription},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					toastr["error"](response.msg);
				} else {
					$('.tag').removeClass('raw-note');
					$(".add-notes-description").val('');
					toastr["success"](response.msg);
					getUserNotes($('#thread_id').val());
				}
			});
	} else {
		if($("#notes-listing div.notes").length < accountConfig.notes){
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/notes/create",
				data: $("#save_note_form").serialize(),
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				if(response.status == 401){
					triggerLogout();
					return false;
				}else if (response.status == 404) {
					toastr["error"](response.msg);

				} else {
					$("#description").val('');
					toastr["success"](response.msg);
					getUserNotes($('#thread_id').val());
				}
			});
		} else {
			toastr["danger"]("Please upgrade to premium in order to create unlimited notes per tagged user.");
		}
	}
}

function loadMoreNotes() {	
	var selectedContactFbId = $("#thread_id").val();
	if(selectedContactFbId != ""){
		notesLoaderRunning = true;
		loadedTemplatesLastIndex = $("#notes-listing div.notes").length;
		$.ajax({
			type: "POST",
			url: apiBaseUrl + "/notes/load",
			data: {fb_user_id:selectedContactFbId, user_id:userId, lastIndex: loadedTemplatesLastIndex},
			dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
		}).done(function(response) {
			notes = '';
			if(response.status == 401){
				triggerLogout();
				return false;
			}else if(response.data.length > 0 ){
				response.data.forEach(function(note) {
					var hideNotes = "";				
					if(accountConfig.notes != null && i > (accountConfig.notes-1)){
						hideNotes = "hideNotes";
					}
					
					var fullDate = new Date(note.updatedDate);
					var twoDigitMonth = ((fullDate.getMonth().length+1) === 1)? (fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1); 
					var updatedDate = fullDate.getDate() + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
					
					notes +=`<div class="col-12 notes mt-3 p-0 `+hideNotes+`" note-id="`+note.id+`">
									<div class="row tab-msg messages " >
										<textarea class="col-12 form-control notes-description">`+note.description+`</textarea> 
									</div>
									<div class="row pt-2">
										<div class="col-10 note-timing p-0 pl-1 text-left">
											<span class="note-updatedate text-muted">`+updatedDate+`</span>
											
										</div>
										<div class="col-2 note-delete p-0 pr-1 text-right">
											<img src="assets/images/delete.png" title="Delete">
										</div>
									</div>
								</div>`;
				});
			}
			$("#notes-listing").append(notes);
			notesLoaderRunning = false;
			$("#notes_loader").toggle();
			$("#notes-more").toggleClass('loader-overlay');
			
		});
	} else {
		$("#notes_loader").toggle();
		$("#notes-more").toggleClass('loader-overlay');
	} 
}

function getRequestMessages() {
	chrome.storage.local.get(["ssa_user","fb_id","ssaPopupStates"], function(result) {
		temp.last_screen = 'send_message';
		temp.selected_tag = '';
		temp.selected_template = '';
		chrome.storage.local.set({ssaPopupStates:temp});
		if (typeof result.fb_id != "undefined" && result.fb_id != "") {	
			$('.tab').hide();
			$('#send_message').show();
			$('#send-request-screen').addClass('active');
			$('#accept-request-screen').removeClass('active');
			$('#menu1').hide();
			$('#home').show();
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/friend_requests/settings",
				data: {userId:result.ssa_user.id,fb_id:result.fb_id},
				dataType: 'json',
				beforeSend: function (xhr) {
			  	  xhr.setRequestHeader('unique-hash', uniqueHash);
				}
			}).done(function(response) {
				if (response.status == 200 || response.result == 'success') {
					$("#outgoing-message-status").prop( "checked", (response.data.outgoing_message_status ==1) ? true : false);               
					$("#outgoing-random-status").prop( "checked", (response.data.outgoing_random_status ==1) ? true : false);               

					$("#comming-message-status").prop( "checked", (response.data.comming_message_status ==1) ? true : false);               
					$("#comming-random-status").prop( "checked", (response.data.comming_random_status ==1) ? true : false);               

					$('.request_message_interval').val(response.data.request_message_interval);
					$('#message-one').val(response.data.message_one);

					if (response.data.message_one != null) {
						$('#message-one').val(response.data.message_one); 
					}
					if (response.data.message_one != null) {
						$('#message-two').val(response.data.message_two); 
					}
					if (response.data.message_three != null) {
						$('#message-three').val(response.data.message_three); 
					}
		            if (parseInt(response.data.outgoing_random_status) == 1) {
							
						$('.randomize-container-request-outgoing .request-message-text-row').show();
					 }else{
						$('.randomize-container-request-outgoing .request-message-text-row').hide();
						$('.randomize-container-request-outgoing .request-message-text-row').eq(0).show();
					}

		            $('#message-four').val(response.data.message_four); /////// comming message

					if (response.data.message_four != null) {
						$('#message-four').val(response.data.message_four); 
					}
					
					if (response.data.message_four != null) {
						$('#message-five').val(response.data.message_five); 
					}
					if (response.data.message_four != null) {
						$('#message-six').val(response.data.message_six); 
					}

		            if (parseInt(response.data.comming_random_status) == 1) {
						$('.randomize-container-request-comming .request-message-text-row').show();
					 }else{
						$('.randomize-container-request-comming .request-message-text-row').hide();
						$('.randomize-container-request-comming .request-message-text-row').eq(0).show();
					 }

				}else{
					
				}
			});
		}
	});
}

function updateRequestMessages(){
	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
		if (typeof result.ssa_user.id != "undefined" && result.ssa_user.id != "") {
			var userId = result.ssa_user.id;
			var fb_id = result.fb_id;
			var requestMessageTextArray = [];
			var isValueInMessageText = true;
			var message_one = '';
			var message_two = '';
			var message_three = '';

			var message_four = '';
			var message_five= '';
			var message_six = '';

			$('.randomize-container-request-outgoing .request-messge-text').each(function (index) {
				if ($.trim($(this).val()) != '') {
					isValueInMessageText = false;

					if (index == 0) {
						message_one = $.trim($(this).val())
					} else if(index == 1){
						message_two = $.trim($(this).val())
					}else if(index == 2){
						message_three = $.trim($(this).val())
					}
					
				}
			});

			$('.randomize-container-request-comming .request-messge-text').each(function (index) {
				if ($.trim($(this).val()) != '') {
					isValueInMessageText = false;
					if (index == 0) {
						message_four = $.trim($(this).val())
					} else if(index == 1){
						message_five = $.trim($(this).val())
					}else if(index == 2){
						message_six = $.trim($(this).val())
					}
					
				}
			});

			var request_message_interval = 5;

			if ($('.request_message_interval').val() != '') {
				request_message_interval = $('.request_message_interval').val();
			}else{
				return false;
			}

			if (isValueInMessageText) {
				$('.request-message-random-error').show();
				return false;
			}

			var outgoing_message_status = 0;
			if($('#outgoing-message-status').is(':checked')){
				outgoing_message_status = 1;
			}

			var outgoing_random_status = 0;
			if($('#outgoing-random-status').is(':checked')){
				outgoing_random_status = 1;
			}

			var comming_message_status = 0;
			if($('#comming-message-status').is(':checked')){
				comming_message_status = 1;
			}

			var comming_random_status = 0;
			if($('#comming-random-status').is(':checked')){
				comming_random_status = 1;
			}


			$('.save-request-message').text('  ... ').prop('disabled',true);
			$.ajax({
				type: "POST",
				url: apiBaseUrl + "/friend_requests/settings/update",
				data: {userId:userId,
						fb_id:fb_id,
						outgoing_message_status:outgoing_message_status,
						outgoing_random_status:outgoing_random_status,
						comming_message_status:comming_message_status,
						comming_random_status:comming_random_status,
						message_one:message_one,
						message_two:message_two, 
						message_three:message_three,
						message_four:message_four,
						message_five:message_five,
						message_six:message_six,
						request_message_interval:request_message_interval
					},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {
				$('#createRequestMessageEventModal').scrollTop(0);
				$('.save-request-message').prop('disabled',false);
				if (response.status == 200 || response.result == 'success') {
					chrome.runtime.sendMessage({requestRequestMessageSettingUpdated: "requestRequestMessageSettingUpdated", request_message_interval:request_message_interval});
					toastr["success"](response.msg);
				} else {
					toastr["error"](response.msg);
				}
				$('.save-request-message').text('').prop('disabled',false);
			});
        }
    });
}

function updateTotalContactsUnderAllTags(totalContactsUnderAllTags,flags = false) {
	if (flags) {
		temp = 0;
		$('#bulk-tag-list-selected .row').each(function(index){
			temp = temp + parseInt($(this).find('.bulk-tag-li').attr('contact-per-tag'));
		});

		totalContactsUnderAllTags = temp;
	
	}

	if (totalContactsUnderAllTags < 0) {
		totalContactsUnderAllTags = 0;
	}
	
	$('.bulk-message-total label').text('Contacts:');
	$('.bulk-message-total span').text(totalContactsUnderAllTags);
	$('.bulk-message-total').showInlineBlock();

		// contact-per-tag
}

///////// display randomize message running or not running ///
function displayRandomizeMessge(result,running = false) {
	return false;
	if(result.bulkMessageSettings != '' && result.bulkMessageSettings.messageTextArray.length > 0){
		if (result.bulkMessageSettings.useSendLimit) {
			$('#bulk-send-limit').val(result.bulkMessageSettings.sendLimit);
		}
		
		var randomMessageFields = '';
		if (result.bulkMessageSettings.sendRandomMessage) {
			result.bulkMessageSettings.messageTextArray.forEach(function (item,index) {
				randomMessageFields += `<div class="row bulk-text-row">
									<div class="col-9">
										<form action="#">
										  <div class="form-group" >
											<textarea class="form-control bulk-messge-text" id="bulk-messge-text" placeholder="Type your message here">`+item+`</textarea>
										  </div>
										</form>
									</div> 
									<div class="col-2 tags delete-bulk-textarea" >
									   <i class="fa fa-trash" title="delete"></i>
									</div>
								</div>`;
			})
			$('.randomize-container').html(randomMessageFields);
			$('#randomize-toggle').prop('checked',true);
		}else{
			randomMessageFields += `<div class="row bulk-text-row">
									<div class="col-9">
										<form action="#">
										  <div class="form-group" >
											<textarea class="form-control bulk-messge-text" id="bulk-messge-text" placeholder="Type your message here">`+result.bulkMessageSettings.messageTextArray[0]+`</textarea>
										  </div>
										</form>
									</div> 
									<div class="col-2 tags delete-bulk-textarea" >
									   <i class="fa fa-trash" title="delete"></i>
									</div>
								</div>`;
			$('#randomize-toggle').prop('checked',false);
		    $('#add-random-msg').hide();
			$('.randomize-container').html(randomMessageFields);
			$('.delete-bulk-textarea').hide();
		}

		if (result.bulkMessageSettings.useRandomDelay) {
			$('#randomize-toggle-delay').prop('checked',true);
		} else {
			$('#randomize-toggle-delay').prop('checked',false);
		}
	}else{ ////// when storage is clear
		$('.delete-bulk-textarea').hide();
		$('#add-random-msg').hide();
	}

	if(running){
		$('#randomize-toggle').prop('disabled',true);
		$('#randomize-toggle-delay').prop('disabled',true);
		$('.delete-bulk-textarea').hide();
		$('#add-random-msg').hide();

		chrome.storage.local.get(["bulkTaggedUserArray"], function(result) {
			if (result.bulkTaggedUserArray.length > 0) {
				bulkTaggedUserArray = result.bulkTaggedUserArray;
				findLastProcessedIndex = result.bulkTaggedUserArray.findIndex((item) => (item.sendBulk == false));
				$('.bulk-message-total label').text('Contacts:');
				$('.bulk-message-total').showInlineBlock();

				$('.bulk-message-unique-total label').text('Unique Contacts:');

				$('.bulk-message-counter label').text('Message Sent:');
				if (findLastProcessedIndex == -1) {
					$('.bulk-message-total span').text(0);
					$('.bulk-message-counter span').text((0));
					$('.bulk-message-unique-total').hide();
				}else{
				
					ttemp = 0;
					$('#bulk-tag-list-selected .row').each(function(index){
						ttemp = ttemp + parseInt($(this).find('.bulk-tag-li').attr('contact-per-tag'));
					});

					$('.bulk-message-total span').text(ttemp);
					$('.bulk-message-counter span').text((findLastProcessedIndex));
					$('.bulk-message-unique-total span').text(result.bulkTaggedUserArray.length);

				}
				$('.bulk-message-counter').showInlineBlock();
			}
		});
	}else{
		$('#randomize-toggle').prop('disabled',false);
		$('#randomize-toggle-delay').prop('disabled',false);
	}	
}

function sendBulkMessage(selectedBulkTagIds,bulkMessageTextArray,bulkDelay, sendAll, sendRandomMessage, sendLimit,useRandomDelay, useSendLimit,removeFromTag) {
	var bulkTaggedUserArray = [];
	chrome.storage.local.get(["taggedUsers","ssaPopupStates"], function(result) {
		
		/*reminder screen*/
		var  ssaPopupStates = {selected_tag :'' ,selected_template:'',last_screen:''};
		chrome.storage.local.set({ssaPopupStates:ssaPopupStates});
		/*reminder screen end*/

		
		result.taggedUsers.forEach(function (item,index) {
			if (!sendAll) {
				foundTaggedUser = selectedBulkTagIds.filter((list) => ( (item.tag_id.indexOf(list.tagid) > -1) && item.fb_user_id != null) )
			} 
			
			if( (sendAll || foundTaggedUser.length > 0 ) && item.fb_user_id != null ){
				item.sendBulk = false;	
				bulkTaggedUserArray.push(item);
			}			
		});
		
		if (bulkTaggedUserArray.length > 0) {
			chrome.tabs.getSelected(null, function (tab){
				if (tab.url.indexOf('/messages') != -1 || tab.url.indexOf('messenger.com') != -1) {
					$('.bulk-process-status').hide();
					$('#pausebulk').showInlineBlock();
					$('#stopbulk').showInlineBlock();
					$('#bulk-back-btn').hide();
					$('#startbulk').hide();
					$('#randomize-toggle').prop('disabled',true);
					$('#randomize-toggle-delay').prop('disabled',true);
					$('#send-to-all-tagged-user').prop('disabled',true);
					$('#add-random-msg').hide();
					$('.delete-bulk-textarea').hide();
					isBulkRunning = true;

					if (sendLimit == '') {
						sendLimit = bulkTaggedUserArray.length;
					}

					if (sendAll) {
						updateTotalContactsUnderAllTags(bulkTaggedUserArray.length)
					}

					temp = {};
					temp.sendall = sendAll;
					temp.messageTextArray = bulkMessageTextArray;
					temp.selectedBulkTagIds = selectedBulkTagIds;
					temp.bulkDelay = bulkDelay;
					temp.sendRandomMessage = sendRandomMessage;
					temp.sendLimit = sendLimit;
					temp.useRandomDelay = useRandomDelay;
					temp.removeFromTag = removeFromTag;
					temp.useSendLimit = useSendLimit;
				
					chrome.storage.local.set({"bulkMessageSettings":temp});
					$('.arrow_icon').hide(); 
					chrome.runtime.sendMessage({action: 'startBulkFromBackground',  bulkMessageTabId: tab.id, selectedBulkTagIds: selectedBulkTagIds, bulkMessageTextArray:bulkMessageTextArray, bulkDelay:bulkDelay,sendAll:sendAll,sendRandomMessage:sendRandomMessage,sendLimit:sendLimit,useRandomDelay:useRandomDelay,removeFromTag:removeFromTag});
					// chrome.tabs.sendMessage(tab.id,{from: 'popup', subject: 'openChatThreadBulkMessage',  bulkMessageTabId: tab.id, selectedBulkTagIds: selectedBulkTagIds, bulkMessageTextArray:bulkMessageTextArray, bulkDelay:bulkDelay,sendAll:sendAll,sendRandomMessage:sendRandomMessage,sendLimit:sendLimit,useRandomDelay:useRandomDelay});
				}
			});
		}else{
   			/*$('.bulkmsg').addClass('alert alert-danger').text('No contact found under selected tag.').show().fadeOut(2000);;*/
   			toastr["error"]('No contact found under selected tag.');
		}
	})	
}

/********* To show response messages with animation *******/
function message_animation(addClass) {
    $('.msg').addClass("alert " + addClass);
    setTimeout(function() {
        $('.msg').removeClass("alert alert-danger alert-success");
        $('.msg').text('');
        adjustPopUpHeight();
    }, 2000);
}

function adjustPopUpHeight() {
    /* var height = $("header").outerHeight(true) + $("#tab2").outerHeight(true);
    $('body,html').height(height); */
}

function displayBulkMessgesSettings() {
	chrome.storage.local.get(["bulkMessageSettings","tags","taggedUsers"], function(result) {
		selectedBulkTagIds = result.bulkMessageSettings.selectedBulkTagIds;
		messageText = result.bulkMessageSettings.messageText;
		sendall	= result.bulkMessageSettings.sendall;
		bulkDelay = result.bulkMessageSettings.bulkDelay;
		$('#bulk-delay option[value="'+bulkDelay+'"]').prop('selected', true)
		$('.arrow_icon').hide();
		$('#bulk-messge-text').val(messageText);
		if(!sendall){
			result.tags=result.tags.reverse();	
			result.tags.forEach(function(item,index){
				foundInSelect = selectedBulkTagIds.filter((list)=> list.tagid == item.value)
				var unselectedLi = '';
				liStyle = '';
				liclass = '';

				var contactsPerTag = 0;
				result.taggedUsers.forEach(function (tagUser,indexTagUser) {
					searchTagById = '#'+item.value+'#';

					//if (tagUser.fb_user_id != null  && (tagUser.tag_id.indexOf(searchTagById) > -1)) {
					if (tagUser.fb_user_id != null && tagUser.tag_id == item.value) {	
						contactsPerTag++;
					} 		
				});

				if (item.color == null) {
					liclass = 'bg-'+item.class;
				}else{
					liStyle = 'style = "background-color:'+item.color+'";'
				}


				unselectedLi +=`<div class="row mt-3">
									<div class="col-11 pl-2">
										<button type="button" class="btn btn1 bulk-tag-li `+liclass+`" tag-id="`+item.value+`" contact-per-tag = "`+contactsPerTag+`" `+liStyle+`>
											   `+item.text+` <span class="contacts-count">`+contactsPerTag+`</span>
										</button>
									</div>
								</div>`;
				if (foundInSelect.length > 0) {
					$('#bulk-tag-list-selected').append(unselectedLi);
				} else {
					$('#bulk-tag-list').append(unselectedLi);
				}
			});
		}else{
			//$('#send-to-all-tagged-user').prop('checked',true);
		}
		displayRandomizeMessge(result,true);
	})	
}

function forgot_password() {
    $.ajax({
        type: "POST",
        url: apiBaseUrl + "/users/reset_password",
        data: $("#forgot_password_form").serialize(),
        dataType: 'json'
    }).done(function(response) {
        if (response.status == 404) {
            toastr["error"](response.msg);
        } else {
        	toastr["success"](response.msg);
            $("#forgot_password_form")[0].reset();
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
   	if (request.action == "refresh_reminders") {
		$('#reminders-screen').click();
	}else if(request.action == 'bulkmsgstate'){
		if (request.bulkMessageStatus != true && (request.bulkParentTabId > 0 || request.bulkMessageStatus == 'paused')) {
			isBulkRunning = true;
			chrome.tabs.query({active: true,currentWindow: true}, function (tabs) {
				// if (request.bulkMessageTabId == tabs[0].id) {
					if (request.bulkMessageStatus == 'running') {
						displayBulkMessgesSettings();	
						$('.tab').hide();
						$('#bulk_message').show();
						$('.bulk-process-status').hide();
						$('#pausebulk').showInlineBlock();
						$('#stopbulk').showInlineBlock();
					}else if(request.bulkMessageStatus == 'paused' || request.bulkMessageStatus == 'limit_excedeed'){
						displayBulkMessgesSettings();
						
						$('.tab').hide();
						$('#bulk_message').show();
						$('.bulk-process-status').hide();
						$('#resumebulk').showInlineBlock();
						$('#stopbulk').showInlineBlock();
						return false;
					}else if(request.bulkMessageStatus == 'complete'){
						isBulkRunning = false;
						$('.bulk-process-status').hide();
						$('#startbulk').showInlineBlock();
						$('#bulk-back-btn').show();
						$('#randomize-toggle').prop('disabled',false);
						$('#randomize-toggle-delay').prop('disabled',false);
						$('#send-to-all-tagged-user').prop('disabled',false);

					}
					
				// } else {
				// 	displayBulkMessgesSettings();
				// 	//toastr["info"]('Bulk Message is running in other tab');
				// 	$('.tab').hide();
				// 	$('#bulk_message').show();
				// 	$('.bulk-process-status').hide();
				// }	
			});
			$('#randomize-toggle').prop('disabled',true);
			$('#send-to-all-tagged-user').prop('disabled',true);
			$('.delete-bulk-textarea').hide();
			$('#add-random-msg').hide();
		}else{
			isBulkRunning = false;
			$('#randomize-toggle').prop('disabled',false);
			$('#send-to-all-tagged-user').prop('disabled',false);
			$('.bulk-process-status').hide();
			$('#startbulk').showInlineBlock();
			$('#bulk-back-btn').show();
			$('#randomize-toggle').prop('disabled',false);
			$('#randomize-toggle-delay').prop('disabled',false);
			$('#send-to-all-tagged-user').prop('disabled',false);
			$('.arrow_icon').show();
		}
	}else if(request.action == 'bulkMessageLimitExceed'){
		//displayBulkMessgesSettings();
					
		$('.tab').hide();
		$('#bulk_message').show();
		$('.bulk-process-status').hide();
		$('#resumebulk').showInlineBlock();
		$('#stopbulk').showInlineBlock();
		return false;
	}	else if(request.action == 'finalComplete'){
		isBulkRunning = false;
		$('.bulk-process-status').hide();
		$('#startbulk').showInlineBlock();
		$('#bulk-back-btn').show();
		$('#randomize-toggle').prop('disabled',false);
		$('#randomize-toggle-delay').prop('disabled',false);
		$('#send-to-all-tagged-user').prop('disabled',false);
		$('.arrow_icon').show();
	}
	else if(request.action == 'bulkMessageComplete'){
		isBulkRunning = false;
		$('.bulk-process-status').hide();
		$('#startbulk').showInlineBlock();
		$('#bulk-back-btn').show();
		$('#randomize-toggle').prop('disabled',false);
		$('#randomize-toggle-delay').prop('disabled',false);
		$('#send-to-all-tagged-user').prop('disabled',false);
	}else if(request.action == 'bulkMessageCounter'){
	    $('.bulk-message-total label').text('Contacts:');

	    ttemp = 0;
		$('#bulk-tag-list-selected .row').each(function(index){
			ttemp = ttemp + parseInt($(this).find('.bulk-tag-li').attr('contact-per-tag'));
		});

		$('.bulk-message-total span').text(ttemp);
		$('.bulk-message-total').showInlineBlock();
		$('.bulk-message-counter label').text('Message Sent:');
		$('.bulk-message-counter span').text(request.counter);
		$('.bulk-message-counter').showInlineBlock();

		$('.bulk-message-unique-total label').text('Contacts:');
		$('.bulk-message-unique-total span').text(request.totalContacts);

		$('.bulk-message-unique-total label').text('Unique Contacts:');


	}else if(request.saveBlukMessageState == 'saveBlukMessageState'){
 		if(request.status == 'paused'){
			$('.bulk-process-status').hide();
			$('#resumebulk').showInlineBlock();
			$('#stopbulk').showInlineBlock(); 		
 		}
    }
    else if(request.action == 'accountProfileImage'){
        profile_pic=request.account_image_url;
    }
});
function getDoBDate(){
	let reqArr = Object.values(HB_DATA);
	chrome.storage.local.get(reqArr, (result) => {
		if (result[HB_DATA.CAN_SEND] === "1") {
			$('#chkDoBDay').prop('checked', true).change();
		} else {
			$('#chkDoBDay').prop('checked', false).change();
		}
	});
}
function getBdtlMessages(){
	$('#messages_loader').show();
	$('.bdtl-message-list').hide();
	
	var requestObj = $.ajax({
				type: "POST",
				url: apiBaseUrl + "/birthdays/showTLmessages",
				data: {userId:userId},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {

				if(response.status == 401){
					$('#messages_loader').hide();
					$('.bdtl-message-list').html('');
					triggerLogout();
					return false;
				}

				var messageList = '';
				$('.bdtl-message-list').html('');
				let messages = [];	
				if (response.status == 200 || response.result == 'success') {
							
					response.data.forEach(function(message){
						//console.log(message.id);
						messages.push(message);
						messageList += `<div message-id="`+message.id+`" class="row message_name w-100 show-message">
								<div class="col-10 pl-2 pt-1 message-view-text">
									<div class="card bg-light template-message-card view-message">
										<div class="card-body">
											<div class="card-text">`+message.message+`</div>
										</div>
									</div>
									<textarea class="form-control edit-bdtl-message-text" style="display: none;" id="template_edit_text" placeholder="write message... ">`+message.message+`</textarea>
								</div>
								<div class="col-2 my-auto">
									<div class="row">`
						if (message.message.indexOf('--template--') <0) {	
							messageList +=`<div class="col-4 my-auto">
											<i class="fa fa-pencil edit-bdtl-message p-1 text-icon" title="Edit"></i>
										</div>`;												
						}
						messageList+=`	
									<div class="col-4 my-auto">
										<i class="fa fa-save save-bdtl-message p-1 text-icon" title="Save"></i>
									</div>				
									<div class="col-4 my-auto">
										<i class="fa fa-trash delete-bdtl-message p-1 text-icon" title="Delete"></i>
									</div>
								</div>
							</div>
						</div>`;								
					});		
						
					const storageObj = {};
					 storageObj[HB_DATA.BDTLMSG] = messages;
					 storageObj[HB_DATA.IS_WORKING] = response.processbirthdays;
					 chrome.storage.local.set(storageObj);		
				} else {
					const storageObj = {};
					storageObj[HB_DATA.BDTLMSG] = messages;				
					chrome.storage.local.set(storageObj);
					//console.log('message.id.no');
					$('#messages_loader').hide();
					messageList = noMessagesUnderTemplate;
				}
				$(".bdtl-message-list").html(messageList);
				$('#messages_loader').hide();
				$(".bdtl-message-list").show();
			});	

		// messageRequests.push(requestObj);	
}
function getBddmMessages(){
	$('#messages_loader').show();
	$('.bddm-message-list').hide();
	
	var requestObj = $.ajax({
				type: "POST",
				url: apiBaseUrl + "/birthdays/showDMmessages",
				data: {userId:userId},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {

				if(response.status == 401){
					$('#messages_loader').hide();
					$('.bddm-message-list').html('');
					triggerLogout();
					return false;
				}

				var messageList = '';
				$('.bddm-message-list').html('');
				let messages = [];
				if (response.status == 200 || response.result == 'success') {
							
					response.data.forEach(function(message){
						//console.log(message.id);
						messages.push(message);
						messageList += `<div message-id="`+message.id+`" class="row message_name w-100 show-message">
								<div class="col-10 pl-2 pt-1 message-view-text">
									<div class="card bg-light template-message-card view-message">
										<div class="card-body">
											<div class="card-text">`+message.message+`</div>
										</div>
									</div>
									<textarea class="form-control edit-bddm-message-text" style="display: none;" id="template_edit_text" placeholder="write message... ">`+message.message+`</textarea>
								</div>
								<div class="col-2 my-auto">
									<div class="row">`
						if (message.message.indexOf('--template--') <0) {	
							messageList +=`<div class="col-4 my-auto">
											<i class="fa fa-pencil edit-bddm-message p-1 text-icon" title="Edit"></i>
										</div>`;												
						}
						messageList+=`	
									<div class="col-4 my-auto">
										<i class="fa fa-save save-bddm-message p-1 text-icon" title="Save"></i>
									</div>				
									<div class="col-4 my-auto">
										<i class="fa fa-trash delete-bddm-message p-1 text-icon" title="Delete"></i>
									</div>
								</div>
							</div>
						</div>`;								
					});		
					 const storageObj = {};
					 storageObj[HB_DATA.BDDMMSG] = messages;
					 storageObj[HB_DATA.IS_WORKING] = response.processbirthdays;
					 chrome.storage.local.set(storageObj);					
				} else {
					const storageObj = {};
					storageObj[HB_DATA.BDDMMSG] = messages;					
					chrome.storage.local.set(storageObj);		
					//console.log('message.id.no');
					$('#messages_loader').hide();
					messageList = noMessagesUnderTemplate;
				}
				$(".bddm-message-list").html(messageList);
				$('#messages_loader').hide();
				$(".bddm-message-list").show();
			});	

		// messageRequests.push(requestObj);	
}

function getTemplateMessages(isSearch = false){
	$('#messages_loader').show();
	$('.message-list').hide();
	if(isSearch == true) {
		abortPrevRequests(messageRequests);
	}
	var requestObj = $.ajax({
				type: "POST",
				url: apiBaseUrl + "/template_messages",
				data: {templateId:selectedTemplateId, search:$("#search_message").val()},
				dataType: 'json',
				beforeSend: function (xhr) {
              	  xhr.setRequestHeader('unique-hash', uniqueHash);
        		}
			}).done(function(response) {

				if(response.status == 401){
					$('#messages_loader').hide();
					$('.message-list').html('');
					triggerLogout();
					return false;
				}

				var messageList = '';
				$('.message-list').html('');
				if (response.status == 200 || response.result == 'success') {
					$('.btn-load-more-message').show();
					response.data.forEach(function(message){
						//console.log(message.id);
						messageList += `<div message-id="`+message.id+`" class="row message_name w-100 show-message">
								<div class="col-10 pl-2 pt-1 message-view-text">
									<div class="card bg-light template-message-card view-message">
										<div class="card-body">
											<div class="card-text">`+message.message+`</div>
										</div>
									</div>
									<textarea class="form-control edit-message-text" style="display: none;" id="template_edit_text" placeholder="write message... ">`+message.message+`</textarea>
								</div>
								<div class="col-2 my-auto">
									<div class="row">`
						if (message.message.indexOf('--template--') <0) {	
							messageList +=`<div class="col-4 my-auto">
											<i class="fa fa-pencil edit-message p-1 text-icon" title="Edit"></i>
										</div>`;												
						}
						messageList+=`<div class="col-4 my-auto">
										<i class="fa fa-send send-message p-1 text-icon" title="Share"></i>
									</div>		
									<div class="col-4 my-auto">
										<i class="fa fa-save save-message p-1 text-icon" title="Save"></i>
									</div>				
									<div class="col-4 my-auto">
										<i class="fa fa-trash delete-message p-1 text-icon" title="Delete"></i>
									</div>
								</div>
							</div>
						</div>`;								
					});						
				} else {
					//console.log('message.id.no');
					$('#messages_loader').hide();
					messageList = noMessagesUnderTemplate;
				}
				$(".message-list").html(messageList);
				$('#messages_loader').hide();
				$(".message-list").show();
			});	

		messageRequests.push(requestObj);	
}

function getSearchTagContact(){
	var selectedTag=$(".selected .tag-name-span");
	var tagId=$(".selected .tag-name-span").attr('tag-id');
	var tag=$(".selected .tag-name-span").text();
	abortPrevRequests(tagContactRequests);
	var fb_page_id = false;
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
	    if(tabs[0].url.indexOf('/inbox') > -1){
	      	fb_page_id = tabs[0].url.split('/inbox')[0].toString().split('/').pop();
	    }
	    if (userId != "" && tagId != "") {
	    	$(".tag-user-list").html('');
	    	chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
	    		loggedInFBId = result.fb_id;
	    		var postData;
				if (fb_page_id == false) {
					postData = {userId:userId, tag:tag, loggedInFBId:loggedInFBId, tagId: tagId, search:$('#search_contact').val()};
				} else {
					postData = {userId:userId, tag:tag, loggedInFBId:loggedInFBId, fb_page_id:fb_page_id, tagId: tagId, search:$('#search_contact').val() };
				}
				var buttonLabel = 'Chat';
				chrome.tabs.query({active: true,currentWindow: true}, function (tab) {
					if(tab[0].url.indexOf('/inbox') > -1){
						buttonLabel = 'Copy';
					}
				});
				requestObj = $.ajax({
					type: "POST",
					url: apiBaseUrl + "/tagged_users",
					data: postData,
					dataType: 'json',
					beforeSend: function (xhr) {
	              	  xhr.setRequestHeader('unique-hash', uniqueHash);
	        		}
				}).done(function(response) {
					$("#contacts_loader").toggle();
					$('.export_btn').hide();

					if(response.count>=1){
						$('.exports,.contacts-search').show(); 
					}
					
					if(tabs[0].url.indexOf('/inbox') > -1){
					      	$('.exports').hide();
					    }	
					if(response.status == 401){
						triggerLogout();
						return false;
					}
					if(response.tagId == customSelectedTagId){
						//alert(1)
						$('.tag_row').removeClass('selected');
						selectedTag.closest('.tag_row').addClass('selected');
						$('.search-tag').show();
						
						var userList = '';
						if (response.status == 404) {
							$('.exports').hide();
							$('.message h5').html('There are no user to display. Please assign this tag to a user.');
						} 
						else {
							exportCheckBox = '';
							if (isFacebookMessagePage && false) {
								exportCheckBox = '<input class = "multi-export-checkbox" type="checkbox">';
							}

							if(response.data != null) {
								response.data.forEach(function(item){
									if (item.fb_user_id == null) {
										item.fb_user_id = item.fb_image_id;
									}
										userList+=`<div class="col-12 p-0 pl-1 contacts user-tag-row">
													<div class="row pb-1 pt-1">
														<div class="col-2 text-center p-0">
															<img class="profile-image" src="`+item.profile_pic+`" onerror="this.onerror=null;this.src='`+chrome.extension.getURL('assets/images/profile.jpg')+`';" />
														</div>
														<div class="col-5 p-0 pl-1 pr-1 pt-1">
														   <h5 class="vertical-center-align" title="`+item.fb_name+`">`+item.fb_name+`</h5>
														</div>
														<div class="col-1 p-0 mt-3 show-tag-span tags-container" tagged-id = "`+item.id+`" checkedTagIds = "`+item.tag_id+`" clikedFBUserId="`+item.fb_user_id+`" numeric_fb_id="`+item.numeric_fb_id+`" img-url="`+item.profile_pic+`"><i title="Show Tags" class="fa fa-tag "></i></div>`;
										userList+=	`<div class="col-2 p-0 text-right mt-3 header_sec ">
														   <i class="fa fa-ellipsis-v pl-1 pr-3 contact-menu" data-toggle="dropdown"></i>
															<div class="dropdown ">
																<div class="dropdown-menu contact-drop-down">`;	
									var options = '';
									var setBackGroundColor = '';
									var setBackGroundClass = '';
									var spanText = '';
									if (typeof response.tags != "undefined" && response.tags != "") {
										temp = response.tags;
										for(i=0;i<response.tags.length;i++){
											var $tagIds = item.tag_id.split(',');
											var temp = $tagIds.filter(function (eachTagId) { return eachTagId.replace(/\#/g,'') == response.tags[i].id});
											var checked = '';
											if (temp.length > 0) {
												checked = 'checked';
												spanText += response.tags[i].name+',';
											}
											var style ='';
											if (response.tags[i].custom_color !== null ) {
												style = 'style = "background:'+response.tags[i].custom_color+' !important"';
											}
										}
									}

									userList+=	`<a class="dropdown-item chat" href="#" fb-id="`+item.fb_user_id+`" img-url="`+item.profile_pic+`" >`+buttonLabel+`</a>
													<a class="dropdown-item notes-btn" href="#">Notes</a>`;
													//COMMENT_OUT
													//<a class="dropdown-item createCalendarEventBtn" href="#" title="Get Notified Through Google Calendar">Add to <br>calendar</a>`;			

									userList+=	`</div></div></div></div></div>`;						
								});
							}
							$('.message h5').html('You have <span class="total_tagged_user_per_tag" id="total_contacts"> '+response.count+' </span> contacts in ' +tag);
							constactCountPerTag = response.count;
							
							$(".tag-user-list").html(userList);
							$(".tag-user-list img").on("error", handleError);
							if(accountConfig.calendar_integration == 0){
								$(".createCalendarEventBtn").hide();
							}
							if (isFacebookMessagePage) {
								$('.export-per-tag').attr('active-tag-id', customSelectedTagId);
								$('.export-per-tag').attr('exactTagName', tag).show();
							}
						}
						$("#contacts_loader").toggle();
						$(".tag-user-list").removeClass('loader-overlay');
					}
				}); 
				tagContactRequests.push(requestObj);
	    	})
	    }
	});
}


// gets the number of bytes used in sync storage area
$(document).on('change', '.emojiBulk', function (e) {
	let emoji= $(this).val();
	if(emoji!==''){
		let bulk_text = $('#bulk_text').val(); 
		if(typeof bulk_text !="undefined"){
			//var position = $('#reply_text').prop("selectionStart");
			chrome.storage.sync.get('emoji_bulk_focus', item => {
			 
				if (bulk_text.length > 1 && item.emoji_bulk_focus!=0) {
					var count = Array.from(bulk_text.split(/[\ufe00-\ufe0f]/).join("")).length;
				 
					const usingSpread = [...bulk_text]; 
				  
					 var output = usingSpread.slice(0, item.emoji_bulk_focus).join('') +  emoji + usingSpread.slice(item.emoji_bulk_focus, count).join('');
						  
					 $('#bulk_text').val(output);  
	
				}
				 else if (bulk_text.length > 1 && item.emoji_bulk_focus==0) {
	 
					 $('#bulk_text').val(bulk_text + emoji); 
				}else{
					 $('#bulk_text').val(emoji); 
				} 
				chrome.storage.sync.set({emoji_bulk_focus: parseInt(item.emoji_bulk_focus) +1 });
			
			 });
			
		}
	}
		  
   
});


$( "#bulk_text" ).click(function() { 
 var position = $('#bulk_text').prop("selectionStart"); 
 var bulk_text = $('#bulk_text').val().substr(0, position);
 var minus= ((bulk_text.match(/🙂/g) || []).length) + ((bulk_text.match(/😀/g) || []).length) + 
 ((bulk_text.match(/😉/g) || []).length)+
 ((bulk_text.match(/😂/g) || []).length)+ 
 ((bulk_text.match(/😥/g) || []).length) + 
 ((bulk_text.match(/😓/g) || []).length)+ 
 ((bulk_text.match(/😍/g) || []).length)+ 
 ((bulk_text.match(/😆/g) || []).length)
			
  chrome.storage.sync.set({emoji_bulk_focus: position-minus });
});

$( "#bulk_text" ).blur(function() { 
 var position = $('#bulk_text').prop("selectionStart"); 
 var bulk_text = $('#bulk_text').val().substr(0, position);
var minus= ((bulk_text.match(/🙂/g) || []).length) + ((bulk_text.match(/😀/g) || []).length) + 
 ((bulk_text.match(/😉/g) || []).length)+
 ((bulk_text.match(/😂/g) || []).length)+ 
 ((bulk_text.match(/😥/g) || []).length) + 
 ((bulk_text.match(/😓/g) || []).length)+ 
 ((bulk_text.match(/😍/g) || []).length)+ 
 ((bulk_text.match(/😆/g) || []).length)
   
 var position = $('#bulk_text').prop("selectionStart"); 
  chrome.storage.sync.set({emoji_bulk_focus: position-minus  });
});

$(document).on('change', '.personalizationBulk', function (e) {
	let personalizationBulk= $(this).val();
	if(personalizationBulk!==''){
		let bulk_text = $('#bulk_text').val();  
		if(typeof bulk_text !="undefined"){
			var length = personalizationBulk.length;
			 chrome.storage.sync.get('emoji_bulk_focus', item => {
			 
			if (bulk_text.length > 1 && item.emoji_bulk_focus!=0) {
				var count = Array.from(bulk_text.split(/[\ufe00-\ufe0f]/).join("")).length;
			 
				const usingSpread = [...bulk_text]; 
			  
				 var output = usingSpread.slice(0, item.emoji_bulk_focus).join('') +  personalizationBulk + usingSpread.slice(item.emoji_bulk_focus, count).join('');
					  
				 $('#bulk_text').val(output);  

			}
			 else if (bulk_text.length > 1 && item.emoji_bulk_focus==0) {
 
				 $('#bulk_text').val(bulk_text + personalizationBulk); 
			}else{
				 $('#bulk_text').val(personalizationBulk); 
			} 
			 
			chrome.storage.sync.set({emoji_bulk_focus: parseInt(item.emoji_bulk_focus) + length });
		
		 });
		}
	} 
});

$(document).on('change', '.emojiTemplates', function (e) {
	let emoji= $(this).val();
	if(emoji!==''){
		let template_text = $('#template_text').val(); 
		if(typeof template_text !="undefined"){
		//var position = $('#reply_text').prop("selectionStart");
			chrome.storage.sync.get('emoji_template_focus', item => {
				
			if (template_text.length > 1 && item.emoji_template_focus!=0) {
				var count = Array.from(template_text.split(/[\ufe00-\ufe0f]/).join("")).length;
				
				const usingSpread = [...template_text]; 
				
					var output = usingSpread.slice(0, item.emoji_template_focus).join('') +  emoji + usingSpread.slice(item.emoji_template_focus, count).join('');
						
					$('#template_text').val(output);  

			}
				else if (template_text.length > 1 && item.emoji_template_focus==0) {

					$('#template_text').val(template_text + emoji); 
			}else{
					$('#template_text').val(emoji); 
			} 
			chrome.storage.sync.set({emoji_template_focus: parseInt(item.emoji_template_focus) +1 });

			});
		}
	}
		  
   
});


$( "#template_text" ).click(function() { 
 var position = $('#template_text').prop("selectionStart"); 
 var template_text = $('#template_text').val().substr(0, position);
 var minus= ((template_text.match(/🙂/g) || []).length) + ((template_text.match(/😀/g) || []).length) + 
 ((template_text.match(/😉/g) || []).length)+
 ((template_text.match(/😂/g) || []).length)+ 
 ((template_text.match(/😥/g) || []).length) + 
 ((template_text.match(/😓/g) || []).length)+ 
 ((template_text.match(/😍/g) || []).length)+ 
 ((template_text.match(/😆/g) || []).length)
			
  chrome.storage.sync.set({emoji_template_focus: position-minus });
});

$( "#template_text" ).blur(function() { 
 var position = $('#template_text').prop("selectionStart"); 
 var template_text = $('#template_text').val().substr(0, position);
var minus= ((template_text.match(/🙂/g) || []).length) + ((template_text.match(/😀/g) || []).length) + 
 ((template_text.match(/😉/g) || []).length)+
 ((template_text.match(/😂/g) || []).length)+ 
 ((template_text.match(/😥/g) || []).length) + 
 ((template_text.match(/😓/g) || []).length)+ 
 ((template_text.match(/😍/g) || []).length)+ 
 ((template_text.match(/😆/g) || []).length)
   
 var position = $('#template_text').prop("selectionStart"); 
  chrome.storage.sync.set({emoji_template_focus: position-minus  });
});

$(document).on('change', '.personalizationTemplates', function (e) {
	let personalizationTemplate= $(this).val();
	if(personalizationTemplate!==''){
		let template_text = $('#template_text').val(); 
		if(typeof template_text !="undefined"){ 
			var length = personalizationTemplate.length;
			chrome.storage.sync.get('emoji_template_focus', item => {
			 
			if (template_text.length > 1 && item.emoji_template_focus!=0) {
				var count = Array.from(template_text.split(/[\ufe00-\ufe0f]/).join("")).length;
			 
				const usingSpread = [...template_text]; 
			  
				 var output = usingSpread.slice(0, item.emoji_template_focus).join('') +  personalizationTemplate + usingSpread.slice(item.emoji_template_focus, count).join('');
					  
				 $('#template_text').val(output);  

			}
			 else if (template_text.length > 1 && item.emoji_template_focus==0) {
 
				 $('#template_text').val(template_text + personalizationTemplate); 
			}else{
				 $('#template_text').val(personalizationTemplate); 
			} 
			 
			chrome.storage.sync.set({emoji_template_focus: parseInt(item.emoji_template_focus) + length });
		
		 });
		} 
	}
});
jQuery.fn.extend({
	'showInlineBlock': function () {
		$(this).css('display','inline-block');
	},
	'mclick': function () {
		var click_event = document.createEvent('MouseEvents')
		click_event.initMouseEvent("click", true, true, window,
        0, 0, 0, 0, 0,
        false, false, false, false,
        0, null);
		return $(this).each(function () {
			$(this)[0].dispatchEvent(click_event)
		})
	},	
	'vchange': function () {
		var change_event = document.createEvent('HTMLEvents')
		change_event.initEvent('change', false, true)
		return $(this).each(function () {
			$(this)[0].dispatchEvent(change_event)
		})
	},
	'vclick': function () {
		var click_event = document.createEvent('HTMLEvents')
		click_event.initEvent('click', false, true)
		return $(this).each(function () {
			$(this)[0].dispatchEvent(click_event)
		})
	},
	'vblur': function () {
		var click_event = document.createEvent('HTMLEvents')
		click_event.initEvent('blur', false, true)
		return $(this).each(function () {
			$(this)[0].dispatchEvent(click_event)
		})
	},
	'vkeyup': function () {
		var keyup_event = document.createEvent('HTMLEvents')
		keyup_event.initEvent('keyup', false, true)
		return $(this).each(function () {
			$(this)[0].dispatchEvent(keyup_event)
		})
	},
	'vkeyupWithChar': function (key) {
		var specific_keyup_event = document.createEvent('HTMLEvents')
		specific_keyup_event.initEvent('keyup', false, true)
		specific_keyup_event.which = key;
		specific_keyup_event.keyCode = key;
		return $(this).each(function () {
			$(this)[0].dispatchEvent(specific_keyup_event)
		})
	}
})