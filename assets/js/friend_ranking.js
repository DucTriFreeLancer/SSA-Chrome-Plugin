'use strict';
$(document).ready(function() {
    var userId = void 0;
    var fn = void 0;
    var id = void 0;
    var token = null;
    /** @type {boolean} */
    var uFields = true;
    /** @type {string} */
    var r = "any-time";
    /** @type {null} */
    var me = null;
    /** @type {!Array} */
    var res = [];
    /** @type {!Array} */
    var string = [];
    /** @type {!Array} */
    var params = [];
    /** @type {!Array} */
    var row = [];
    /** @type {number} */
    var y = -1;
    var d3url = "https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed";
    $.ajax({
        type: "GET",
        url: d3url,
        success: function (data, txtStatus, request) {
            $("#ls-friends").fadeIn("slow");
            var obj=JSON.parse(data.replace("for (;;);",""));
            userId = $(obj.payload.actions[0].html).find("input[name='target']").val();
            fn = $(obj.payload.actions[0].html).find("._36e0").text();
            var dtsg_token =  obj.payload.actions[2].code.match(/"dtsg":"(.*?)\"/);//$(obj.payload.actions[0].html).find("input[name='fb_dtsg']").val();
            id = dtsg_token?dtsg_token[1]:"";
            var regexTK = obj.payload.actions[2].code.match(/"accessToken":"(\w+)\"/);
            token= regexTK?regexTK[1]:null;
            if (userId && !isNaN(parseInt(userId)) && fn && 0 < fn.length && id && 0 < id.length && token) {
                init(function(){
                    $("#name").text(fn);
                    $("#group-start-buttons").show();
                    // open();
                });
            }
            else{
                show("Please re-opening Facebook!", "danger", 1, false);
            }
        },
        fail : function(){
            show("Please check your Internet connection.", "danger", 0, false);
        }
    });
    /**
     * @param {!Function} onSuccess
     * @return {undefined}
     */
    function init(onSuccess) {
        var infoUrl= "https://graph.facebook.com/v11.0/me";
        if (infoUrl) {
            /** @type {!FormData} */
            var data = new FormData;
            data.append("fields", "picture");
            data.append("access_token", token);
            fetch(infoUrl, {
            body : data,
            method : "POST"
            }).then(function(e) {
            return e.text();
            }).then(function(c) {    
            if ("function" === typeof onSuccess) {
                var obj = JSON.parse(c);
                if(obj.picture.data.url){
                    $("#avt").attr("src", obj.picture.data.url);
                    $("#avt").attr("width", obj.picture.data.width);
                    $("#avt").attr("height", obj.picture.data.height);
                }
                if(obj.id)
                {
                    userId = obj.id;
                }
                onSuccess();
            }
            })["catch"](function(searchDefinition) {
                show("An error occurred, please try again later.", "danger", 3);
            });
        }
    }
    $("#btn-scan").click(function() {
        $("#result-msg").fadeIn("slow", function() {
        $("#group-start-buttons").hide();
        show("Loading! Please wait ...", "info");
        link();
        });
    });
    /**
     * @return {undefined}
     */
    function link() {
        $("body").addClass("disabled");
        /** @type {!Array} */
        res = [];
        /** @type {!Array} */
        string = [];
        /** @type {!Array} */
        params = [];
        /** @type {!Array} */
        row = [];
        if (me) {
            me.clear().draw();
            /** @type {null} */
            me = null;
        }
        unlockButtons(false);
        if (id) {
            render(`https://graph.facebook.com/v11.0/me/friends?fields=id,name,picture&limit=500&access_token=${token}`, function() {
                run();
                initialize(function() {
                    elapseTimer();
                    test("", function() {
                        $("#btn-group").show("slow", function() {
                            $("[type='number']").keypress(function(event) {
                            event.preventDefault();
                            });
                            $("#select-fr").attr("disabled", false);
                            $("#deselect-fr").attr("disabled", false);
                            $("#unfr-selected").attr("disabled", false);
                            $("body").removeClass("disabled");
                            $("#select-fr").click(function() {
                            /** @type {number} */
                            var whiteRating = parseInt($("#sum-lte").val());
                            me.rows().deselect();
                            var crossfilterable_layers = me.rows().data();
                            /** @type {number} */
                            var layer_i = 0;
                            for (; layer_i < crossfilterable_layers.length; layer_i++) {
                                if (crossfilterable_layers[layer_i][7] <= whiteRating) {
                                me.row("#" + crossfilterable_layers[layer_i][2]).select();
                                }
                            }
                            highlight();
                            });
                            $("#deselect-fr").click(function() {
                            me.rows().deselect();
                            highlight();
                            });
                            unlockButtons(true);
                        });
                        show("Done!", "success");
                    });
                });
            })
        }
    }
    /**
     * @param {string} args
     * @param {!Function} cb
     * @return {undefined}
     */
    function render(args, cb) {
        // /** @type {!FormData} */
        // var form = new FormData;
        // form.append("fields", "id,name,picture");
        // form.append("limit","500");
        // form.append("access_token", token);
        /** @type {null} */
        var e = null;
        fetch(args, {
            // body : form,
            headers : {
                accept : "application/json, text/plain, */*"
            },
            method : "GET"
        }).then(function(rawResp) {
            return rawResp.json();
        }).then(function(obj) {
            /** @type {string} */
            obj.data.forEach(function(l) {
                let fr = {}; 
                fr.i = l.id;
                fr.n = l.name;
                fr.p = l.picture.data.url;
                fr.f = 0;
                fr.r = 0;
                fr.c = 0;
                fr.m = 0;
                res.push(fr);
            });
            var obj_copy = obj.paging.next;       
            if (obj_copy) {
                args = obj.paging.next;
                render(args, cb);
            } else {
                cb();
            }
        })["catch"](function(searchDefinition) {
            show("An error occurred, please try again later.", "danger", 4);
        });
    }
    /**
     * @param {string} dir
     * @param {!Function} fn
     * @return {undefined}
     */
    function test(dir, fn) {
        /** @type {!FormData} */
        var form = new FormData;
        form.append("fb_dtsg", id);
        form.append("q", "node(" + userId + "){timeline_feed_units.first(50).after(" + dir + "){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id,name}},commenters{nodes{id,name}}}}}}}");
        /** @type {null} */
        var e = null;
        fetch("https://www.facebook.com/api/graphql/", {
        body : form,
        headers : {
            accept : "application/json, text/plain, */*"
        },
        method : "POST"
        }).then(function(d) {
            return d.text();
        }).then(function(d) {
            /** @type {!Object} */
            e = d;
            /** @type {*} */
            d = JSON.parse(e);
            d[userId].timeline_feed_units.edges.forEach(function(node) {
                var nodes = node.node.feedback;
                node = node.node.creation_time;
                if (nodes && node > y) {
                if (node = nodes.reactors.nodes) {
                    node.forEach(function(a) {
                    params.push(a.id);
                    });
                }
                if (nodes = nodes.commenters.nodes) {
                    nodes.forEach(function(result) {
                    string.push(result.id);
                    });
                }
                }
            });
            d = d[userId].timeline_feed_units.page_info;
            var name_copy = d.has_next_page;
            dir = d.end_cursor;
            if (name_copy) {
                test(dir, fn);
            } else {
                var item = encode(string);
                var items = encode(params);
                res.forEach(function(o) {
                    o.r = items[o.i] ? items[o.i] : 0;
                    o.c = item[o.i] ? item[o.i] : 0;
                    o.s = o.f + o.r + o.c + o.m;
                    var sRow = me.row("[id=" + o.i + "]").index();
                    me.cell({
                        row : sRow,
                        column : 3
                    }).data(o.r);
                    me.cell({
                        row : sRow,
                        column : 4
                    }).data(o.c);
                    me.cell({
                        row : sRow,
                        column : 6
                    }).data(o.s);
                });
                me.order([6, "desc"]).draw();
                fn();
            }
        })["catch"](function(searchDefinition) {
            show("An error occurred, please try again later.", "danger", 5);
        });
    }
    /**
     * @param {boolean} updatingSelf
     * @return {undefined}
     */
    function unlockButtons(updatingSelf) {
        if (updatingSelf) {
            $("#group-start-buttons").show();
            $(".group-b-control").show();
        } else {
            $("#group-start-buttons").hide();
            $(".group-b-control").hide();
        }
    }
    /**
     * @return {undefined}
     */
    function elapseTimer() {
        /** @type {!Date} */
        var playdate = new Date;
        if (r) {
            switch(r) {
            case "last-month":
                /** @type {number} */
                y = playdate.setMonth(playdate.getMonth() - 1) / 1E3 | 0;
                break;
            case "last-3-months":
                /** @type {number} */
                y = playdate.setMonth(playdate.getMonth() - 3) / 1E3 | 0;
                break;
            case "last-6-months":
                /** @type {number} */
                y = playdate.setMonth(playdate.getMonth() - 6) / 1E3 | 0;
                break;
            case "last-year":
                /** @type {number} */
                y = playdate.setYear(playdate.getFullYear() - 1) / 1E3 | 0;
                break;
            case "last-2-years":
                /** @type {number} */
                y = playdate.setYear(playdate.getFullYear() - 2) / 1E3 | 0;
                break;
            case "last-3-years":
                /** @type {number} */
                y = playdate.setYear(playdate.getFullYear() - 3) / 1E3 | 0;
            }
        }
    }
    /**
     * @param {!Function} SettingsProxy
     * @return {undefined}
     */
    function initialize(SettingsProxy) {
        /** @type {!FormData} */
        var form = new FormData;
        form.append("fb_dtsg", id);
        form.append("q", "viewer(){message_threads{nodes{thread_key{thread_fbid,other_user_id},messages_count,thread_type,updated_time_precise}}}");
        /** @type {null} */
        fetch("https://www.facebook.com/api/graphql/", {
        body : form,
        headers : {
            accept : "application/json, text/plain, */*"
        },
        method : "POST"
        }).then(function(savedC) {
            /** @type {!Object} */
            if(savedC.ok){
                savedC.json().then(function(aj){
                    aj.viewer.message_threads.nodes.forEach(function(params) {
                        if ("ONE_TO_ONE" == params.thread_type) {
                        row[params.thread_key.other_user_id] = params.messages_count;
                        }
                    });
                    res.forEach(function(a) {
                        a.m = row[a.i] ? row[a.i] : 0;
                        a.s = a.f + a.r + a.c + a.m;
                        var sRow = me.row("[id=" + a.i + "]").index();
                        me.cell({
                        row : sRow,
                        column : 5
                        }).data(a.m);
                        me.cell({
                        row : sRow,
                        column : 6
                        }).data(a.s);
                    });
                    me.order([6, "desc"]).draw();
                    SettingsProxy();
                })
            }
            else{
                show("An error occurred, please try again later.", "danger", 4);
            }
        
        })["catch"](function(searchDefinition) {
            show("An error occurred, please try again later.", "danger", 4);
        });
    }
    /**
    * @return {undefined}
    */
    function run() {
        if (!me) {
            me = $("#table-friends").DataTable({
            processing : true,
            destroy : true,
            dom : '<"row"<"col-md-4"l><"col-md-4"B>f>rt<"row"<"col-md-6"i><"col-md-6"p>>',
            buttons : ["copy", "csv", "excel"],
            columns : [{
                title : "Avatar"
            }, {
                title : "Name"
            }, {
                title : "Mutual friends"
            }, {
                title : "Like/React"
            }, {
                title : "Comment"
            }, {
                title : "Message"
            }, {
                title : "Sum"
            }],
            columnDefs : [{
                targets : [2],
                visible : false,
                searchable : false
            }],
            order : [[6, "desc"]],
            language : {
                search : "Search",
                paginate : {
                    first : "First",
                    last : "Last",
                    next : "Next",
                    previous : "Previous"
                },
                info : "Show _START_ to _END_ of _TOTAL_ friends",
                infoEmpty : "Show 0 to 0 of 0 friends",
                lengthMenu : "Show _MENU_ friends",
                loadingRecords : "Loading ...",
                emptyTable : "Nothing to show"
            }
            });
        }
        res.forEach(function(p) {
            p.s = p.f + p.r + p.c + p.m;
            me.row.add(['<a href="https://fb.com/' + p.i + '" target="_blank"><img src="' + p.p + '" width="30" height="30" /></a>', '<a href="https://fb.com/' + p.i + '" target="_blank">' + p.n + "</a>", p.f, p.r, p.c, p.m, p.s]).draw(false).node().id = p.i;
        });
        me.order([6, "desc"]).draw();
    }
    /**
     * @return {undefined}
     */
    function highlight() {
        var number = me.rows(".selected").data().length;
        number = 0 === number ? get("tbl_select_rows_0") : 1 === number ? get("tbl_select_rows_1") : get("tbl_select_rows").replace("%d", number);
        $("#rows-status").text(number);
    }
    /**
     * @param {!Array} src
     * @return {?}
     */
    function encode(src) {
        return src.reduce(function(s, c) {
        s[c] = s[c] + 1 || 1;
        return s;
    }, {});
    }
    /**
     * @param {string} type
     * @param {string} value
     * @param {number} index
     * @param {number} id
     * @return {undefined}
     */
    function show(type, value, index, id) {
        index = void 0 === index ? 0 : index;
        id = void 0 === id ? true : id;

        $("#result-msg").attr("class", "alert alert-" + value);
        if ("info" == value) {
            $("#result-msg").html('<div class="spinner-border text-primary"></div><span> ' + type + "</span>").fadeIn("slow");
        } else {
            if ("success" === value) {
            $("#result-msg").html('<i class="fa fa-check-circle" style="color:green;"></i><span> ' + type + "</span>").fadeIn("slow");
            } else {
            if ("danger" === value) {
                /** @type {string} */
                value = '<i class="fa fa-exclamation-circle" style="color:red;"></i><span> ' + type + " (error code: " + index + ")</span>";
                if (0 == index) {
                /** @type {string} */
                value = '<i class="fa fa-exclamation-circle" style="color:red;"></i><span> ' + type + "</span>";
                }
                if (id) {
                $("#warning-msg").html("\u003Cspan>To fix this error try one of the following:\u003Cbr/>- Make sure network is working fine.\u003Cbr/>- Close other unnecessary tabs.\u003Cbr/>- Log out and re-login facebook.\u003Cbr/>- Close and reopen Friend Ranking.\u003C/span>").fadeIn("slow");
                }
                $("#result-msg").html(value).fadeIn("slow");
            }
            }
        }
    }
})
