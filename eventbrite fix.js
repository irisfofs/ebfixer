// LINK EMAILS TO SEARCH
jQuery("#checkin_table td:nth-of-type(3)").each(
    function(i, e) {
        var span = jQuery(e).children();
        var email = span.text();
        var a = document.createElement("a");
        a.href = "http://www.eventbrite.com/myevent/8965216203/reports/attendee/?s=1&date=all&attendee_status=attending&search=" + email;
        span.wrap(a);
    });

// FIRST ATTEMPT WITH EVENT HANDLERS
jQuery("#checkin_table tr").each(
    function(i, e) {
        var row = jQuery(e);
        var email = row.find("td:nth-of-type(3)").children().text();
        row.one( "click", function() { 
            jQuery.get("http://www.eventbrite.com/myevent/8965216203/reports/attendee/?s=1&date=all&attendee_status=attending&column_groups=02349ABJKMad&search=" + email,
                function(data) {
                    var raw = jQuery(data).find("table.l-block-3.report").html();
                    console.log(raw);
                    row.after("<tr><td colspan='4'><table class='l-block-3 report'>" + raw + "</table></td></tr>");
                });
        });
    });
    

// FANCIER VERSION w/ DELEGATED EVENT HANDLING

// add our own styles to fix stuff
var myStyle = 
        "#checkin_table { position: relative; }" +
        "#checkin_table td.loading {" +
            "position: absolute;" +
            "left: 0px;" +
            "width: 90%;" +
            "height: 45px;" +
        "}" +
        "#checkin_table tr.expanded > td { " +
            "padding-bottom: 45px;" +
        "}" +
        ".fix_loading_gif { margin-left: auto; margin-right: auto; }";
if(document.getElementById("fix_styles") == null) {
    jQuery("<style type='text/css' id='fix_styles'>" + myStyle + "</style>").appendTo("head");
} else {
    jQuery("#fix_styles").text(myStyle);
}
jQuery("#checkin_table").off("click")
    .css("position", "relative");
jQuery("#checkin_table").click(function(event) {
    // get actual row
    var row = jQuery(event.target).parents("#checkin_table tbody tr")[0];
    console.log(row);
    if(row != undefined) {
        var jrow = jQuery(row);
        
        var floatingTD = jQuery("<td class='loading'><img class='fix_loading_gif' src='/static/images/ajax_loader.gif'></img></td>");
        jrow.addClass("expanded");
        jrow.append(floatingTD);

        var email = jrow.find("td:nth-of-type(3)").children().text();

        // need to make not trigger when already querying
        jQuery.get("http://www.eventbrite.com/myevent/8965216203/reports/attendee/?s=1&date=all&attendee_status=attending&column_groups=02349ABJKMad&search=" + email,
            function(data) {
                var raw = jQuery(data).find("table.l-block-3.report").html();
                // console.log(raw);
                floatingTD.html("<table class='l-block-3 report'>" + raw + "</table>");
                var attendeeTable = floatingTD.find("table");
                jrow.find("td").css("padding-bottom", attendeeTable.height());
                attendeeTable.resize(function() {
                    jrow.find("td").css("padding-bottom", attendeeTable.height());
                });
            });
    }
});

// what if table contents changes while we're fetching

// load table and hide some columns, with button for "show all columns"