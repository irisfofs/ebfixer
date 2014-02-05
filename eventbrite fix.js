// The Eventbrite ID of the event. Shows up in http://www.eventbrite.com/checkin?eid=8965216203 for instance.
var EID = 8965216203;

// add our own styles to fix stuff
function restyle() {
    var myStyle = 
        "#promo_banner { display: none; } " +
        "#container_content { width: 1012px; }" +
        ".main { width: 1232px; position: relative; }" +
        "#sidebar_hide {" +
            "position: absolute;" +
            "top: 0px;" +
            "left: 210px;" +
            // border: none;
            // padding: 5px;
        "}" +
        "#checkin_table { position: relative; }" +
        "#checkin_table td.loading {" +
            "position: absolute;" +
            "left: 0px;" +
            // "width: 90%;" +
            "height: 45px;" +
            "margin-top: 45px;" +
            "border: none;" +
        "}" +
        "#checkin_table tr.expanded > td { " +
            "padding-bottom: 45px;" +
        "}" +
        ".fix_loading_gif { display:block; margin-left: auto; margin-right: auto; }";
    if(document.getElementById("fix_styles") == null)
        jQuery("<style type='text/css' id='fix_styles'>" + myStyle + "</style>").appendTo("head");
    else
        jQuery("#fix_styles").text(myStyle);

    if(document.getElementById("sidebar_hide") == null) {
        jQuery("<input type='button' class='btn' id='sidebar_hide' name='sidebar_hide' value='Hide'></input>")
            .appendTo("#col_210")
            .click(function() {
                jQuery("#col_210").toggle({ "duration": 200, "specialEasing": { "width": "swing"} });
            });
    }
}
restyle();

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

        // Extract attendee email for populating attendee report list
        var email = jrow.find("td:nth-of-type(3)").children().text();
        // Plug into the report generation URL
        var reportURL = "http://www.eventbrite.com/myevent/"+EID+"/reports/attendee/?s=1&date=all&attendee_status=attending&column_groups=02349ABJKMad&search=" + email;

        // need to make not trigger when already querying
        jQuery.get(reportURL, function(data) {
            // Extract the report table from report HTML page
            var table = jQuery(data).find("table.l-block-3.report");

            // remove ugly caption title with broken handlebars script
            table.children("caption").remove();

            prettifyColumns(table);

            // Put table into the floating cell
            floatingTD.html("<table class='report'>" + table.html() + "</table>");

            var attendeeTable = floatingTD.find("table");
            jrow.children("td").css("padding-bottom", attendeeTable.height() + 15);
            // I'm not sure this actually ever does anything
            attendeeTable.resize(function() {
                console.log("Resize handler called");
                jrow.children("td").css("padding-bottom", attendeeTable.height() + 15);
            });
        });
    }
});

function prettifyColumns(table) {
    // Columns to hide, 1-indexed because of nth-of-type selector
    // Hide code, order type, and attendee status
    var hideColumns = [6,8,10];
    // Columns to change names of, 0-indexed
    var nameChangeMap = {
        11: "Badge Name",
        12: "Shirt Size",
        13: "Emergency Info"
    };
    table.find("tr td:nth-of-type(16)").hide(); // hide Quick Actions because it's broken.
    for(var i=0; i < hideColumns.length; i++)
        table.find("tr td:nth-of-type("+hideColumns[i]+")").addClass("column_toggle").hide();
    for(var num in nameChangeMap)
        if(nameChangeMap.hasOwnProperty(num))
            table.find("thead > tr > td").eq(num).text(nameChangeMap[num]);
}

// little TODO notes for self:
// what if table contents changes while we're fetching
// load table and hide some columns, with button for "show all columns"
    // Whenever the button is added:
    // table.find("td.column_toggle").toggle({ "duration": 200, "specialEasing": { "width": "swing"} });
// optimize for 1280x1024 screens, inc. hiding the normal EB menus