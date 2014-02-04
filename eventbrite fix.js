// FANCIER VERSION w/ DELEGATED EVENT HANDLING

// add our own styles to fix stuff
var myStyle = 
        "#checkin_table { position: relative; }" +
        "#checkin_table td.loading {" +
            "position: absolute;" +
            "left: 0px;" +
            "width: 90%;" +
            "height: 45px;" +
            "margin-top: 45px;" +
        "}" +
        "#checkin_table tr.expanded > td { " +
            "padding-bottom: 45px;" +
        "}" +
        ".fix_loading_gif { display:block; margin-left: auto; margin-right: auto; }";
if(document.getElementById("fix_styles") == null) {
    jQuery("<style type='text/css' id='fix_styles'>" + myStyle + "</style>").appendTo("head");
} else {
    jQuery("#fix_styles").text(myStyle);
}

// for repasting the same code sometimes
jQuery("#checkin_table").off("click");

jQuery("#checkin_table").click(function(event) {
    // get actual row
    var row = jQuery(event.target).parents("#checkin_table > tbody > tr")[0];
    console.log(row);
    if(row != undefined) {
        var jrow = jQuery(row);
        if(jrow.data("expanded") != undefined)
            return; // don't trigger twice
        jrow.data("expanded", true);
        
        var floatingTD = jQuery("<td class='loading'><img class='fix_loading_gif' src='/static/images/ajax_loader.gif'></img></td>");
        jrow.addClass("expanded");
        jrow.append(floatingTD);

        var email = jrow.find("td:nth-of-type(3)").children().text();

        // need to make not trigger when already querying
        jQuery.get("http://www.eventbrite.com/myevent/8965216203/reports/attendee/?s=1&date=all&attendee_status=attending&column_groups=02349ABJKMad&search=" + email,
            function(data) {
                var table = jQuery(data).find("table.l-block-3.report");

                // remove ugly caption title with broken handlebars script
                table.children("caption").remove();

                floatingTD.html("<table class='report'>" + table.html() + "</table>");

                var attendeeTable = floatingTD.find("table");
                jrow.children("td").css("padding-bottom", attendeeTable.height() + 15);
                attendeeTable.resize(function() {
                    jrow.children("td").css("padding-bottom", attendeeTable.height() + 15);
                });
            });
    }
});

// what if table contents changes while we're fetching

// load table and hide some columns, with button for "show all columns"