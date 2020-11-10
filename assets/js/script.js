$(document).on("click", ".createCalendarEventBtn", openConsentForm);
$(document).on("click", "#save", save);
var AUTH_TOKEN = null;
function openConsentForm(){
    authorize(function (token) {
      
        if (token == "undefined" || typeof token == "undefined") {
            notifyClient('bad client id: APP_ID_OR_ORIGIN_NOT_MATCH');
            return;
        }
        AUTH_TOKEN = token;
        createCalendarEventModal();
    });
}


function createCalendarEventModal() {
    $('#datetimepicker1').datetimepicker({
        sideBySide: true,
        showClose: true,
        minDate: new Date(),
        format: 'MMMM Do YYYY, h:mm:ss a'
    });
    $('#createCalendarEventModal').modal('show').removeClass('in').addClass('show');
    getEmail(AUTH_TOKEN);
}

function save() {    
    const $calendarForm = $('#calendarForm');
    const req = {};
    $('[name]', $calendarForm).each(function(){
        req[this.name] = $(this).val() || "";
    });
    
    const start = moment(req.start, "MMMM Do YYYY, h:mm:ss a");
    req.start = {
        dateTime: start.format()
    }
    req.end = {
        dateTime: start.clone().add(1, 'day')
    }
    createCalendarEvent(req, AUTH_TOKEN);
}

function getEmail(authToken) {
    $.ajax({
            type: "GET",
            url: "https://www.googleapis.com/oauth2/v1/userinfo?access_token="+authToken,
            dataType: 'json'
        }).done(function(response) {
            if (response.email != undefined) {
                $('#emailSelect').val(response.email);
            }
        });  
}

function createCalendarEvent(reqData, authToken) {
    var calendarId = "primary";
    var init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + authToken,
            'Content-Type': 'application/json'
        },
        'contentType': 'json',
        body: JSON.stringify(reqData)
    };
    var sheetApi = "https://www.googleapis.com/calendar/v3/calendars/" + calendarId + "/events/";
    fetch(sheetApi, init).then(function(response) {

        if (response.status !== 200) {
            alert("Invalid Argument");
        } else {
            return response.json();
        }
    }).then(function(data) {
        if (data) {
            toastr["success"]("Event added on google Calendar.");
            $('#createCalendarEventModal').modal('hide');
            $("#calendarForm")[0].reset();
        }
    });
}

function message_animation(addClass) {
    $('.msg').addClass("alert " + addClass);
    setTimeout(function() {
        $('.msg').removeClass("alert alert-danger alert-success");
        $('.msg').text('');

        adjustPopUpHeight();
    }, 2000);
}


/////////// for new integration //////////

$(document).on("click", "#verify_sheet_url", verifyGoogleSheet);

function verifyGoogleSheet(update=true) {
    authorize(function (token) {
        if (token == "undefined" || typeof token == "undefined") {
            notifyClient('bad client id: APP_ID_OR_ORIGIN_NOT_MATCH');
            return;
        }
        AUTH_TOKEN = token;

      
        var spreadSheetId = getSpreadSheetId($('input[name="google_sheet_url"]').val());
        if(!spreadSheetId){
            toastr["error"]("Invalid sheet.");
        } else {
            if(token) {            
                if ( token == "undefined" || typeof token == "undefined") {
                    toastr["error"]("bad client id: APP_ID_OR_ORIGIN_NOT_MATCH.");
                } else {
                    if (token) {
                        if(update){
                          chrome.storage.local.get(["ssa_user","fb_id"], function(result) {
                                if (typeof result.fb_id != "undefined" && result.fb_id != "") {
                                    $.ajax({
                                        type: "POST",
                                        url: apiBaseUrl + "?action=update_google_sheet_url",
                                        data: {userId:result.ssa_user.id,fb_account_id:result.fb_id,google_sheet_url:$('input[name="google_sheet_url"]').val()},
                                        dataType: 'json',
                                        beforeSend: function (xhr) {
                                          xhr.setRequestHeader('unique-hash', uniqueHash);
                                        }
                                    }).done(function(response) {
                                        if (response.status == 200) {
                                           
                                        }else{

                                        }
                                    });
                                }
                            });
                        }
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
                                    if(response.status == 404){
                                        toastr["error"]("Invalid GoogleSheet Url.");
                                        document.getElementById('is_verified_sheet_url').textContent = 'verify';
                                        $('.view-google-sheet').attr('href','#');
                                    } else {
                                        document.getElementById('is_verified_sheet_url').textContent = 'verified';
                                        $('.view-google-sheet').attr('href',$("#google_sheet_url").val());
                                    }
                                })
                                .then(function(data) {
                                
                                });
                    } else {
                        document.getElementById('verify_sheet_url').style.display = 'block';
                        document.getElementById('verified_sheet_url').style.display = 'none';
                    }
                }
            }
        }

    });
}


// function message_animation(addClass) {
//     $('.msg').addClass("alert " + addClass);
//     setTimeout(function() {
//         $('.msg').removeClass("alert alert-danger alert-success");
//         $('.msg').text('');
//         //adjustPopUpHeight();
//     }, 2000);
// }

function getSpreadSheetId(url) {
    var matches = /\/([\w-_]{15,})\/(.*?gid=(\d+))?/.exec(url);
    if(matches == null){
        return false;
    } else {
        return matches[1];
    }
}
