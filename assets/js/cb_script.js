console.log('script.js Lodaed');
const url_expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const url_regex = new RegExp(url_expression);
if(window.location.href.indexOf('lead_sniper.html') > 0 || window.location.href.indexOf('comment_blaster.html') > 0)
{
	//** CLEAN PREVIOUS MESSAGES */
	chrome.storage.local.set({   
		cb_custom_dms : [],
        cb_custom_dms_contact : [],
        cb_custom_dms_new_contact: false
	},function(res){
		console.log('cleanned dm message')
	});

	chrome.storage.local.set({
		addPeopleToFriends : false
	},function(res){
		console.log('cleanned add friend')
	});
    chrome.storage.local.set({
		addPeopleToPipeline : false,
        pipeline_message1:"",
        pipeline_message2:"",
        pipeline_message3:"",
        pipeline_message_type:"",

	},function(res){
		console.log('cleanned add people to pipeline')
	});
	chrome.storage.local.set({   
		cb_tag_people : ""
	},function(res){
		console.log('cleanned tag cb')
	});
}

$(document).ready(function () {
    //login system
    var byte = '';

    function logBytes(bytes) {
        byte = bytes;
    }

    chrome.storage.sync.getBytesInUse(['user'], logBytes);

    function getFormData(data) {
        var unindexed_array = data;
        var indexed_array = {};

        $.map(unindexed_array, function(n, i) {
            indexed_array[n['name']] = n['value'];
        });

        return indexed_array;
    }

    $('.before-login').hide();
    $('.after-login').show();
    var src1 = '../../icons/fb1.jpg';
    $("#profile_image").attr("src", src1);
    $("#profile_image").attr("src", src1);

    $('#user_name').text('Test');
    $('#user_email').text('User');
    $('#first_name').text('FN');
    $('#last_name').text('LN');

        function clearNotes(Items) {
        // CHANGE: array, not a string
            var toRemove = [];
            chrome.storage.sync.get(function (Items) {
                $.each(Items, function (index, value) {
                    // CHANGE: add key to array
                    toRemove.push(index);
                });
                // CHANGE: now inside callback
                chrome.storage.sync.remove(toRemove, function (Items) {

                    chrome.storage.sync.get(function (Items) {
                        $.each(Items, function (index, value) {

                        });
                    });
                });
            });

        }

    //Triggering checkbox events
    $("#sendDirectMessage").on('change',function(){
        $(".saved_dms").parent().toggleClass('hidden');
    });
    $("#new_dm").on('click',function(){
        $("#dm_texts").modal(300);
    });
    $('#new_reply').click(function () {
        $('#reply_texts').modal(300);

    });
	
	$('#remove_reply').click(function () {
        chrome.storage.sync.set({replys: []});
		$('.saved_replys p').remove();
    });
	
	$('#remove_reply_filter').click(function () {

		 chrome.storage.sync.set({reply_filters: []});
		 $('.saved_reply_filters p').remove();
		 
    });
    $('#remove_message').click(function () {

        chrome.storage.sync.set({message_friends: []});
        $('.saved_message_friends p').remove();
        
   });

    $('#new_reply_filter').click(function () {

        $('#reply_filters').modal(300);

    });
    
    $("#addPeopleToPipeLine").on('change',function(){
        $(".saved_pms").toggleClass('hidden');
    });

    $('#post_id').keyup(function (ev) {

        let post_link = $(this).val();

        $('#start_reply').addClass('disabled');

        if (post_link.match(url_regex)){
            $('#start_reply').removeClass('disabled');
        }
    });

    $('#offer_link').keyup(function (ev) {

        let offer_link = $(this).val();

        $(this).parent().find('.preview_link').remove();
        if (offer_link.match(url_regex)){
            $(this).parent().append(`<a class="preview_link" target="_blank" href="${offer_link}">Preview Link</a>`);
        }

    });
    $('#react-tag-comment').on('change', function (e) {
        var valueSelected = this.value;
        chrome.storage.local.set({cb_tag_people:valueSelected},function(res){ console.log(valueSelected)});
    });

    /////* Show Reply Texts onLoad */////
    var reply_bytes = '';

    function replyBytes(bytes) {
        reply_bytes = bytes;
    }

    // gets the number of bytes used in sync storage area
   chrome.storage.sync.getBytesInUse(['replys'], replyBytes);
    chrome.storage.sync.get('replys', items => {

        if (reply_bytes != 0) {
            const replys = items.replys;
            Object.keys(replys).forEach(key => {
                var reply = replys[key];
				var reg = /'/g;
				var newstr = "";
				var datareply =  reply.replace(reg,newstr);
				
                $(".saved_replys").prepend("<p class='btn-outline-rounded  saved_tags'  data-url='"+datareply+"'>"+
                    reply +
                    " <button class='btn btn-sm btn-default float-right remove_reply' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            });

            if (!replys.length) {
                $(".saved_replys").prepend('<p class="text-center text-danger nothing_text">Please add some replies</p>');

            }
        }else{
            $(".saved_replys").prepend('<p class="text-center text-danger nothing_text">Please add some replies</p>');
        }
    });

	
	chrome.storage.sync.get('react_comment', reacts => {
		if(reacts!= undefined){
			$('.react-comment option[value="'+reacts.react_comment+'"]').attr("selected", "selected");
		}
	});
    chrome.storage.sync.get('post_type', reacts => {
		if(reacts!= undefined){
			$('.post_type option[value="'+reacts.post_type+'"]').attr("selected", "selected");
		}
	});

    chrome.storage.local.get(["emoji_focus"], function(result) {
		if(result != null && typeof result.emoji_focus) {
			chrome.storage.sync.set({emoji_focus: 0 });
		}
	});	
    chrome.storage.local.get(["ssa_user"], function(result) {
        if (typeof result.ssa_user != "undefined" && result.ssa_user.id != "") {
			$("#pipeline_msg1").val(result.ssa_user.pipeline_message1);
			$("#pipeline_msg2").val(result.ssa_user.pipeline_message2);
			$("#pipeline_msg3").val(result.ssa_user.pipeline_message3);
			$("#pipeline_msg_type").val(result.ssa_user.pipeline_leadsniper);
        }
	});	
    chrome.storage.local.get(["tags"], function(result) {
		if(result != null && typeof result.tags  != undefined && result.tags != '') {
			result.tags.forEach(function(item, index){
                $('#react-tag-comment').append($('<option>', { 
                    value: item.value,
                    text : item.text 
                }));
		    });
        }
	});	
   /////* Add New Reply Text */////
    $(document).on('click', '#submit_reply', function (e) {
        e.preventDefault();

        chrome.storage.sync.getBytesInUse(['replys'], replyBytes);
        chrome.storage.sync.get('replys', items => {
            let replys = [];
            if (reply_bytes != 0) {
                replys = items.replys;
                //console.log(replys);
            }
            let reply_input = $('#reply_text');
            if (reply_input.val().length > 1) {
                let reply = reply_input.val().replace(/\r?\n/g, '<br />');
                replys.push(reply);
                chrome.storage.sync.set({replys: replys});
                reply_input.val('');
				var reg = /'/g;
				var newstr = "";
				var datareply =  reply.replace(reg,newstr);
 
                $(".saved_replys").find('.nothing_text').remove();
                $(".saved_replys").prepend("<p class='btn-outline-rounded saved_tags'  data-reply='"+datareply+"'>"+
                    reply +
                    " <button class='btn btn-sm btn-default float-right remove_reply' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            }
        });
    });

    //Add to friends btn
    //storage variable : addPeopleToFriends
    $(document).on('click','#addPeopleToFriends',function (e){
        let isChecked = document.getElementById('addPeopleToFriends').checked;
        chrome.storage.local.set({addPeopleToFriends:isChecked},function(res){});
    })

    //Add new DM message
    //Storage variable : cb_custom_dms
    $(document).on('click','#submit_dm',function(e){
        e.preventDefault();
        chrome.storage.local.get('cb_custom_dms',function(res){
           let list = res.cb_custom_dms;
           if(!list){
               list = [];
           }
            if($("#dm_text").val().length>1){
                let dm = $("#dm_text").val().replace(/\r?\n/g, '<br />');
                list.push(dm);
                $(".saved_dms").prepend("<p class='btn-outline-rounded saved_tags'  data-dmIndex='"+list.indexOf(dm)+"'>"+
                        dm +
                        " <button class='btn btn-sm btn-default float-right remove_reply' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                "</p>");
            }
            chrome.storage.local.set({'cb_custom_dms':list},function(res){
            });
        });
    })
    //Remove all DMs
    //Storage variable : cb_custom_dms
    $(document).on('click','#remote_dms',function(e){
        e.preventDefault();
        let DMs = [];
        chrome.storage.local.set({"cb_custom_dms":DMs});
        $(".saved_dms").html(null);
    });
    //Option to only dm new contact
    //storage variable : cb_custom_dms_new_contact
    $(document).on('click','#sendDirectMessageToNewContact',function (e){
        let isChecked = document.getElementById('sendDirectMessageToNewContact').checked;
        chrome.storage.local.set({cb_custom_dms_new_contact:isChecked},function(res){});
    })
    //DM Personalization select
    $(document).on('change','.dm_personalization',function(e){
        let val = $(".dm_personalization").val();
        let msg = $("#dm_text").val();
        $("#dm_text").val(msg+" "+val);
        $(".dm_personalization").val("");
    });
    //DM emoji select
    $(document).on('change','.dm_emoji',function(e){
        let val = $(".dm_emoji").val();
        let msg = $("#dm_text").val();
        $("#dm_text").val(msg+" "+val);
        $(".dm_emoji").val("");
    })





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



    /////* Remove Reply Text */////
    $(document).on('click', '.remove_reply', function (e) {

        chrome.storage.sync.getBytesInUse(['replys'], replyBytes);
        chrome.storage.sync.get('replys', items => {
            let replys = [];
            if (reply_bytes != 0) {
                replys = items.replys;
                let reply = $(this).closest('p');
                replys.splice(replys.indexOf(reply.data('reply')),1);
                reply.remove();
                chrome.storage.sync.set({replys: replys});

                if (!replys.length) {
                    $(".saved_replys").prepend('<p class="text-center text-danger nothing_text">Please add some replies</p>');

                }
            }
        });

    });

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

    /////* Show Reply Filters onLoad */////
    var reply_filter_bytes = '';

    function replyFilterBytes(bytes) {
        reply_filter_bytes = bytes;
    }

    // gets the number of bytes used in sync storage area
    chrome.storage.sync.getBytesInUse(['reply_filters'], replyFilterBytes);
    chrome.storage.sync.get('reply_filters', items => {

        if (reply_filter_bytes != 0) {
            const reply_filters = items.reply_filters;
            Object.keys(reply_filters).forEach(key => {
                console.log(reply_filters);
                var reply_filter = reply_filters[key];
                $(".saved_reply_filters").prepend("<p class='btn saved_tags'  data-reply_filter='"+reply_filter+"'>"+
                    reply_filter +
                    " <button class='btn btn-sm btn-default float-right remove_reply_filter' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            });

            if (!reply_filters.length) {
                $(".saved_reply_filters").prepend('<p class="text-center text-danger nothing_text">No Filter Text added yet</p>');

            }
        }else{
            $(".saved_reply_filters").prepend('<p class="text-center text-danger nothing_text">No Filter Text added yet</p>');
        }
    });


    /////* Add New Reply Filter */////
    $(document).on('click', '#submit_reply_filter', function (e) {
        e.preventDefault();

        chrome.storage.sync.getBytesInUse(['reply_filters'], replyFilterBytes);
        chrome.storage.sync.get('reply_filters', items => {
            let reply_filters = [];
            if (reply_filter_bytes != 0) {
                reply_filters = items.reply_filters;
                // console.log(reply_filters);
            }
            let reply_filter_input = $('#reply_filter');
            if (reply_filter_input.val().length > 1) {
                let reply_filter = reply_filter_input.val();
                reply_filters.push(reply_filter);
                chrome.storage.sync.set({reply_filters: reply_filters});
                reply_filter_input.val('');

                $(".saved_reply_filters").find('.nothing_text').remove();
                $(".saved_reply_filters").prepend("<p class='btn-outline-rounded saved_tags'  data-reply_filter='"+reply_filter+"'>"+
                    reply_filter +
                    " <button class='btn btn-sm btn-default float-right remove_reply_filter' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            }remove_reply_filter
        });
    });
     /////* Remove Reply Filter */////
     $(document).on('click', '.remove_reply_filter', function (e) {

        chrome.storage.sync.getBytesInUse(['reply_filters'], replyFilterBytes);
        chrome.storage.sync.get('reply_filters', items => {
            let reply_filters = [];
            if (reply_filter_bytes != 0) {
                reply_filters = items.reply_filters;
                let reply_filter = $(this).closest('p');
                reply_filters.splice(reply_filters.indexOf(reply_filter.data('reply_filter')),1);
                reply_filter.remove();
                chrome.storage.sync.set({reply_filters: reply_filters});

                if (!reply_filters.length) {
                    $(".saved_reply_filters").prepend('<p class="text-center text-danger nothing_text">No Filter Text added yet</p>');

                }
            }
        });

    });

    /////* Show Message Texts onLoad */////
    var message_bytes = '';

    function messageBytes(bytes) {
        message_bytes = bytes;
    }

    // gets the number of bytes used in sync storage area
   chrome.storage.sync.getBytesInUse(['message_friends'], messageBytes);
    chrome.storage.sync.get('message_friends', items => {

        if (message_bytes != 0) {
            const message_friends = items.message_friends;
            Object.keys(message_friends).forEach(key => {
                var reply = message_friends[key];
				var reg = /'/g;
				var newstr = "";
				var datareply =  reply.replace(reg,newstr);
				
                $(".saved_replys").prepend("<p class='btn-outline-rounded  saved_tags'  data-url='"+datareply+"'>"+
                    reply +
                    " <button class='btn btn-sm btn-default float-right remove_reply' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            });

            if (!message_friends.length) {
                $(".saved_replys").prepend('<p class="text-center text-danger nothing_text">Please add some replies</p>');

            }
        }else{
            $(".saved_replys").prepend('<p class="text-center text-danger nothing_text">Please add some replies</p>');
        }
    });

    /////* Add New Reply Filter */////
    $(document).on('click', '#submit_message_friend', function (e) {
        e.preventDefault();

        chrome.storage.sync.getBytesInUse(['message_friends'], messageBytes);
        chrome.storage.sync.get('message_friends', items => {
            let message_friends = [];
            if (message_bytes != 0) {
                message_friends = items.message_friends;
                // console.log(reply_filters);
            }
            let message_friend_input = $('#message_text');
            if (message_friend_input.val().length > 1) {
                let message_friend = message_friend_input.val();
                message_friends.push(message_friend);
                chrome.storage.sync.set({message_friends: message_friends});
                message_friend_input.val('');

                $(".saved_reply_filters").find('.nothing_text').remove();
                $(".saved_reply_filters").prepend("<p class='btn-outline-rounded saved_tags'  data-reply_filter='"+message_friend+"'>"+
                    message_friend +
                    " <button class='btn btn-sm btn-default float-right remove_reply_filter' style='padding: 1px 4px;'><small style='padding: 2px'>x</small></button>" +
                    "</p>");
            }
        });
    });

     /////* Remove Reply Filter */////
     $(document).on('click', '.remove_message', function (e) {

        chrome.storage.sync.getBytesInUse(['message_friends'], messageBytes);
        chrome.storage.sync.get('message_friends', items => {
            let message_friends = [];
            if (reply_filter_bytes != 0) {
                message_friends = items.message_friends;
                let message_friend = $(this).closest('p');
                message_friends.splice(message_friends.indexOf(message_friend.data('reply_filter')),1);
                message_friend.remove();
                chrome.storage.sync.set({message_friends: message_friends});

                if (!message_friends.length) {
                    $(".saved_reply_filters").prepend('<p class="text-center text-danger nothing_text">No Filter Text added yet</p>');

                }
            }
        });

    });
   


    ////* Populate Post id if we have in URL *////
    var fType = getUrlVars()["post_id"];
    if(fType){
        $('#post_id').focus();
        $('#post_id').val(fType);
        $('#start_reply').removeClass('disabled');

    }
    console.log(fType);
    function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function(m,key,value) {
                vars[key] = value;
            });
        return vars;
    }


    ////*  Save default settings *////
    function saveDefaultSettings(e) {

        var sleep_after = $('#sleep_after').val();
        var sleep_for = $('#sleep_for').val();
        var offer_link = $('#offer_link').val();
        var seconds = $('#seconds').val();
        var max_reply = $('#max_reply').val();
        if($("#addPeopleToPipeLine").is(':checked')){
            chrome.storage.local.set({
                addPeopleToPipeline : true,
                pipeline_message1: $('#pipeline_msg1').val(),
                pipeline_message2: $('#pipeline_msg2').val(),
                pipeline_message3: $('#pipeline_msg3').val(),
                pipeline_message_type: $('#pipeline_msg_type').val()
            },function(res){
                console.log('add people to pipeline')
            });
        }
        chrome.storage.sync.set({
            'offer_link': offer_link,
            'seconds': seconds,
            'sleep_after': sleep_after,
            'sleep_for': sleep_for,
            'max_reply': max_reply
        }, function () {
            console.log('Default Settings saved');
        });
    }


    ////* Populate fields with default values *////
    chrome.storage.sync.get(null, function(items) {

        $('#offer_link').val(items.offer_link);
        $('#seconds').val(items.seconds);
        $('#max_reply').val(items.max_reply);
        $('#sleep_after').val(items.sleep_after);
        $('#sleep_for').val(items.sleep_for);

        console.log(items);
    });


    ////* Handle Start Reply Action *////
    $(document).on('click', '#start_reply', function (e) {

        let save_default = $('#save_default').is(':checked');
        let post_url = $('#post_id').val();

        if(post_url.indexOf('m.facebook.com') < 0) {
            alert('Invalid post url!');
            return;
        }
        let lets_blast ='';
        if(window.location.href.indexOf('lead_sniper.html') > 0) {
            lets_blast ='lets_blast=0';
            if($(".post_type").val() == "Like"){
                post_url= "https://m.facebook.com/ufi/reaction/profile/browser/?ft_ent_identifier="+ (new URL(post_url)).pathname.replace('/', '');
            }
        }
        else{
            lets_blast ='lets_blast=1';
        }        
        if(post_url.indexOf('?') > -1) {            
            post_url = post_url+`&${lets_blast}`;
        }else{
            post_url = post_url+ `?${lets_blast}`;
        }

        //if (save_default){
        saveDefaultSettings();
        // }else{
        //
        // }
        chrome.tabs.create({url: post_url}, function (tab) {
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab2) {
                    if (changeInfo.status === 'complete' && tabId === tab.id) {
                        chrome.tabs.executeScript(tab.id, {file: "assets/js/cb_comments_script.js"},
                            function(result) {
                                // Process |result| here (or maybe do nothing at all).
                                console.log('result', result);
                                chrome.tabs.onUpdated.removeListener((a,b)=>{
                                    //console.log('mana',a,b)
                                });
                            }
                        );
                    }
                });
            // executeScripts(tab.id, [
            //     {file: "js/comments_script.js"},
            // ])
        })

    });
	
	 /////* Select Like reaction */////
    $(document).on('change', '.react-comment', function () {
		var val= jQuery(this).val();
        chrome.storage.sync.set({react_comment: val});
    });
    $(document).on('change', '.post_type', function () {
		var val= jQuery(this).val();
        chrome.storage.sync.set({post_type: val});
    });
	
	$.fn.selectRange = function(start, end) {
    if(!end) end = start; 
    return this.each(function() {
        if (this.setSelectionRange) {
			
            this.setSelectionRange(start, end);
            this.focus();
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};
	
});


function executeScripts(tabId, injectDetailsArray)
{
    console.log('injectDetailsArray', injectDetailsArray);
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}
