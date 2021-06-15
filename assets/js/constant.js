const ACTIONS = {
    TOGGLE_CHANGE: 'TOGGLE_CHANGE',
    GET_SEND_MESSAGE: "GET_SEND_MESSAGE",
    GET_SEND_DM_MESSAGE:"GET_SEND_DM_MESSAGE",
    SEND_DM_MESSAGE:"SEND_DM_MESSAGE",
    SET_LAST_MESSAGE: "SET_LAST_MESSAGE",
    CLOSE_LI_TAB: 'CLOSE_LI_TAB',
    CHECK_TAB: 'CHECK_TAB',
    SET_HB_DATE:'SET_HB_DATE',
    GET_PIPE_STATUS:'GET_PIPE_STATUS'
};

const IFRAME_FACEBOOK = {
    id: 'Iframe-facebook',
    name: 'ffhe-facebook',
    url: 'https://www.facebook.com/'
};

const HB_DATA = {
    BDTLMSG : 'happy_birthday_tl_of_msg',
    BDDMMSG : 'happy_birthday_dm_of_msg',
    IS_WORKING : 'happy_birthday_ext_is_working',
    LAST_DATE : 'happy_birthday_date_of_last_sent_message',   
    LOCAL_FB: 'local_fb', 
    FB_TAB_ID: 'fb_tab_id',
    CAN_SEND: 'can_send_fb'
};

const SENDING_DATA = {
    LAST_MESSAGE: "",
    LAST_INDEX: false,
    USE: false,
    TIME: Date.now()
}