const weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";
const month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

function getFbIdFromLocation(){
    let loc = window.location.href;
    loc = loc.split('/t/');
    if (typeof loc[1] == "undefined"){
		return '';
	}
    if (loc[1].indexOf('?') > 0) {
        // eslint-disable-next-line prefer-destructuring
        loc[1] = loc[1].split('?')[0];
    }
    if (loc[1].indexOf('/') > 0) {
        // eslint-disable-next-line prefer-destructuring
        loc[1] = loc[1].split('/')[0];
    }
    return loc[1];
}
function getADFWelcomeMessage(welcomeMessageTextAdf, fullName,mylocation) {
    var d = new Date();
	if (welcomeMessageTextAdf.indexOf('[full_name]') > -1) {
		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[full_name]/g,fullName);
	}

	if (welcomeMessageTextAdf.indexOf('[first_name]') > -1) {
		first_name = fullName.split(' ')[0];
		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[first_name]/g,first_name);
	}

	if (welcomeMessageTextAdf.indexOf('[last_name]') > -1) {
		nameArray = fullName.split(' ');
		if(nameArray.length > 1){
			last_name = nameArray[nameArray.length-1];
			welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[last_name]/g,last_name);
		}else{
			welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[last_name]/g,'');
		}
	}
	if (welcomeMessageTextAdf.indexOf('[mylocation]') > -1) {
		if(myLocation.includes("|")){
			var locations = myLocation.split("|");		
			myLocation = locations[Math.floor(Math.random() * locations.length)];	
		}	
		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[mylocation]/g,mylocation);
    }

    if (welcomeMessageTextAdf.indexOf('[thisday]') > -1) {
		let thisday = weekday[d.getDay()];
		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[thisday]/g,thisday);
    }

    if (welcomeMessageTextAdf.indexOf('[thismonth]') > -1) {
		let thismonth = month[d.getMonth()];
		welcomeMessageTextAdf = welcomeMessageTextAdf.replace(/\[thismonth]/g,thismonth);
	}
	return welcomeMessageTextAdf;
}

function getCBDMMessage(welcomeMessageText, fullName,mylocation) {

    var d = new Date();
	if (welcomeMessageText.indexOf('{full_name}') > -1) {
		welcomeMessageText = welcomeMessageText.replace(/\{full_name}/g,fullName);
	}

	if (welcomeMessageText.indexOf('{first_name}') > -1) {
		first_name = fullName.split(' ')[0];
		welcomeMessageText = welcomeMessageText.replace(/\{first_name}/g,first_name);
	}

	if (welcomeMessageText.indexOf('{last_name}') > -1) {
		nameArray = fullName.split(' ');
		if(nameArray.length > 1){
			last_name = nameArray[nameArray.length-1];
			welcomeMessageText = welcomeMessageText.replace(/\{last_name}/g,last_name);
		}else{
			welcomeMessageText = welcomeMessageText.replace(/\{last_name}/g,'');
		}
	}

	if (welcomeMessageText.indexOf('[mylocation]') > -1) {	
		if(mylocation.includes("|")){
			var locations = mylocation.split("|");		
			mylocation = locations[Math.floor(Math.random() * locations.length)];	
		}		
		welcomeMessageText = welcomeMessageText.replace(/\[mylocation]/g,mylocation);
    }
    if (welcomeMessageText.indexOf('{thisday}') > -1) {
		let thisday = weekday[d.getDay()];
		welcomeMessageText = welcomeMessageText.replace(/\{thisday}/g,thisday);
    }

    if (welcomeMessageText.indexOf('{thismonth}') > -1) {
		let thismonth = month[d.getMonth()];
		welcomeMessageText = welcomeMessageText.replace(/\{thismonth}/g,thismonth);
	}
	return welcomeMessageText;
}
function getWelcomeMessage(welcomeMessageText, fullName,mylocation) {

    var d = new Date();
	if (welcomeMessageText.indexOf('[full_name]') > -1) {
		welcomeMessageText = welcomeMessageText.replace(/\[full_name]/g,fullName);
	}

	if (welcomeMessageText.indexOf('[first_name]') > -1) {
		first_name = fullName.split(' ')[0];
		welcomeMessageText = welcomeMessageText.replace(/\[first_name]/g,first_name);
	}

	if (welcomeMessageText.indexOf('[last_name]') > -1) {
		nameArray = fullName.split(' ');
		if(nameArray.length > 1){
			last_name = nameArray[nameArray.length-1];
			welcomeMessageText = welcomeMessageText.replace(/\[last_name]/g,last_name);
		}else{
			welcomeMessageText = welcomeMessageText.replace(/\[last_name]/g,'');
		}
	}

	if (welcomeMessageText.indexOf('[mylocation]') > -1) {	
		if(mylocation.includes("|")){
			var locations = mylocation.split("|");		
			mylocation = locations[Math.floor(Math.random() * locations.length)];	
		}		
		welcomeMessageText = welcomeMessageText.replace(/\[mylocation]/g,mylocation);
    }
    if (welcomeMessageText.indexOf('[thisday]') > -1) {
		let thisday = weekday[d.getDay()];
		welcomeMessageText = welcomeMessageText.replace(/\[thisday]/g,thisday);
    }

    if (welcomeMessageText.indexOf('[thismonth]') > -1) {
		let thismonth = month[d.getMonth()];
		welcomeMessageText = welcomeMessageText.replace(/\[thismonth]/g,thismonth);
	}
	return welcomeMessageText;
}
function getTemplateMessage(message,fullName){
    var d = new Date();
    if (message.templateMessage.indexOf('[mylocation]') > -1) {		
        if(message.myLocation.includes("|")){
            var locations = message.myLocation.split("|");		
            message.myLocation = locations[Math.floor(Math.random() * locations.length)];	
        }				
        message.templateMessage = message.templateMessage.replace(/\[mylocation]/g,message.myLocation);
    }
    if (message.templateMessage.indexOf('[first_name]') > -1) {
        first_name = fullName.split(' ')[0];
        message.templateMessage = message.templateMessage.replace(/\[first_name]/g,first_name);
    }

    if (message.templateMessage.indexOf('[last_name]') > -1) {
        nameArray = fullName.split(' ');
        if(nameArray.length > 1){
            last_name = nameArray[nameArray.length-1];
            message.templateMessage = message.templateMessage.replace(/\[last_name]/g,last_name);
        }else{
            message.templateMessage = message.templateMessage.replace(/\[last_name]/g,'');
        }
    }
    if (message.templateMessage.indexOf('[thisday]') > -1) {
		let thisday = weekday[d.getDay()];
		message.templateMessage = message.templateMessage.replace(/\[thisday]/g,thisday);
    }

    if (message.templateMessage.indexOf('[thismonth]') > -1) {
		let thismonth = month[d.getMonth()];
		message.templateMessage = message.templateMessage.replace(/\[thismonth]/g,thismonth);
	}
    return message.templateMessage;
}
function replaceNamePattern (facebookVersion, card, cardPrefix, HBMessage,mylocation){
    let first_name = '';
    let personFullName;
	var d = new Date();
    switch (facebookVersion) {
        case FACEBOOK_VERSION.OLD: {
            personFullName = $(card).find('a').first().attr('title');
            break;
        }
        case FACEBOOK_VERSION.NEW: {
            personFullName = $(card).find('a').find('h2').text();
            break;
        }
    }

    if (personFullName === undefined) {
        printInfo(cardPrefix + 'Person name not found');
    } else {
        
    
		if (HBMessage.indexOf('[full_name]') > -1) {
			HBMessage = HBMessage.replace(/\[full_name]/g,personFullName);
		}

		if (HBMessage.indexOf('[first_name]') > -1) {
			first_name = personFullName.split(' ')[0];
       		printInfo(cardPrefix + 'Person name: ' + first_name);			
			HBMessage = HBMessage.replace(/\[first_name]/g,first_name);
		}

		if (HBMessage.indexOf('[last_name]') > -1) {
			nameArray = personFullName.split(' ');
			if(nameArray.length > 1){
				last_name = nameArray[nameArray.length-1];
				HBMessage = HBMessage.replace(/\[last_name]/g,last_name);
			}else{
				HBMessage = HBMessage.replace(/\[last_name]/g,'');
			}
		}

		if (HBMessage.indexOf('[mylocation]') > -1) {	
			if(mylocation.includes("|")){
				var locations = mylocation.split("|");		
				mylocation = locations[Math.floor(Math.random() * locations.length)];	
			}		
			HBMessage = HBMessage.replace(/\[mylocation]/g,mylocation);
		}
		if (HBMessage.indexOf('[thisday]') > -1) {
			let thisday = weekday[d.getDay()];
			HBMessage = HBMessage.replace(/\[thisday]/g,thisday);
		}

		if (HBMessage.indexOf('[thismonth]') > -1) {
			let thismonth = month[d.getMonth()];
			HBMessage = HBMessage.replace(/\[thismonth]/g,thismonth);
		}
		return HBMessage;
   
	}
	return HBMessage.replace(/\[full_name]/g,first_name);
    //resolve(HBMessage.replace(new RegExp(NAME_PATTERN, 'g'), personName));
};
