// From https://github.com/metalivedev/liveblog-client
function classLiveBlog(id, rss){
    // Target Element where liveblog stream will be inserted.
    this.targetId = id;

    // URL of RSS XML
    this.rssXml = rss;

    // Polling frequency in milliseconds.
    this.pollShort = 5000;
    var _LONGPOLL = 6
    this.pollLong = _LONGPOLL * this.pollShort;

    // Private LBTimeout of outstanding poll, so we can cancel it if necessary.
    var _pollPending = undefined;

    // String from jqXHR header of last modified date. 
    // If undefined, then we've never retrieved the RSS feed.
    this.lastMod = undefined;

    // Last poll start, end. For calculating latency and new pollShort
    var _pollStart = 0, _pollEnd = 0;

    // Private handle for referencing class variables within anonymous functions.
    // Otherwise "this" changes meaning within the anon function.
    var _localLB = this;

    // Log only if there is a console.
    function _log(msg) {
        if(window.console&&window.console.log){
            window.console.log(msg);
        }
    }

    // Calculate polling period based on latency and reschedule.
    // TODO: Calculate average latency over n samples instead.
    function _pollUpdatePeriod(jqXHR, status){
        _log("Poll Status:"+status);

        var latency = _pollEnd - _pollStart;
        if(latency > 0 && latency > _localLB.pollShort){
            _localLB.pollShort = latency;
            if(_localLB.pollLong < latency){
                _localLB.pollLong = _LONGPOLL * latency;
            }
            _log("New Polling: short("+_localLB.pollShort+")");
        }

        // If we're still polling, reschedule for another poll.
        if(_localLB.polling()){
            _localLB.pollingStart();
        }
    }

    function _pollSuccess(data, textStatus, jqXHR) {
        var $xml = $(data),
        lastItemId = _localLB.escapeId(_localLB.targetId);

        // Record last modified time
        _localLB.lastMod = jqXHR.getResponseHeader('Last-Modified');

        _pollEnd = +new Date;

        $xml.find("item").each(
            function() {
                var $this = $(this),
                item = {
                    title: $this.find("title").text(),
                    link: $this.find("link").text(),
                    guid: $this.find("guid").text(),
                    description: $this.find("description").text(),
                    pubDate: $this.find("pubDate").text(),
                    author: $this.find("author").text(),
                    content: $this.find("content\\:encoded").text(),
                },
                newDateContainer = $('<div style="float:right; font-weight:bold;"/>')
                    .append(item.pubDate);

                if(0 >= item.content.length){
                    // Google Chrome and Safari seem to prefer this. 
                    // XML tag is <content:encoded>
                    item.content = $this.find("encoded").text()
                }

                var newContentContainer = $('<div style="margin-left:20px; margin-bottom:0px; margin-top:5px; width:580px"/>')
                    .append(item.content),
                newItemContainer = $("<div/>")
                    .attr("id", item.guid)
                    .hide()
                    .append(newDateContainer, newContentContainer);

                if( ! _localLB.containsId(item.guid)) {
                    newItemContainer.insertAfter(lastItemId);
                    lastItemId = _localLB.escapeId(item.guid);
                    newItemContainer.show("slow");
                }
            }
        );
    }

    function _pollError(data, textStatus, errorThrown){
        _pollEnd = +new Date;
        _log("Poll Error: "+textStatus);
    }

    // Check to see if this id is already in the document/page.
    // id: raw ID as seen in element id.
    this.containsId = function(id){
        var eId = this.escapeId(id);
        return (0 < $(eId).size());
    }

    // Escape metacharacters in an id for use as jQuery selector.
    // See http://api.jquery.com/category/selectors/
    this.escapeId = function(s){
        if (s){
            s = s.replace(/([ !"#$%&'()*+,.\/;<=>?@[\\\]^`{|}~])/g,"\\$1");
            // I don't know why the colon is different, but it is.
            return "#" + s.replace(/(:)/g,'\\3a ');
        }
        else
            return s;
    }
    
    // Get the live blog data once. Loop if we've started polling.
    // Only check if modified if we *think* we've never loaded before.
    // Trick: reloading the page doesn't purge the XML from cache, 
    //        but it does clear lastMod.
    this.poll = function(){
        _pollStart = +new Date;
        $.ajax({
            url: _localLB.rssXml,
            dataType: "xml",
            ifModified: (_localLB.lastMod)?true:false,
            success: _pollSuccess,
            error: _pollError,
            complete: _pollUpdatePeriod
        });
    };

    this.polling = function() {
        return !(typeof _pollPending === 'undefined');
    };

    this.pollingStop = function() {
        if(_pollPending){
            _pollPending.clear();
            _pollPending = undefined;
        }
        _log("Polling stopped.");
    };

    this.pollingStart = function(interval) {
        if(interval){
            _localLB.pollShort = interval;
            _localLB.pollLong = interval * _LONGPOLL;
        }

        _localLB.pollingStop();
        _pollPending = new LBTimeout(_localLB.poll, _localLB.pollShort);
        _log("Polling started: " + _pollPending.id);
    }

    this.pollingToggle = function() {
        if(_localLB.polling()){
            _localLB.pollingStop();
        }
        else {
            _localLB.pollingStart();
        }
    }
}

// From 
// http://stackoverflow.com/questions/5226578/check-if-a-timeout-has-been-cleared
// * auto-clear when the timeout naturally expires
// * optionally set the scope of the timeout function 
//   (rather than just executing in global scope).
// * optionally pass arguments array to the timeout function
function LBTimeout(fn, interval, scope, args) {
    scope = scope || window;
    var self = this;
    var wrap = function(){
        self.clear();
        fn.apply(scope, args || arguments);
    }
    this.id = setTimeout(wrap, interval);
    this.cleared = false;
    this.clear = function () {
        clearTimeout(this.id);
        this.cleared = true;
        this.id = null;
    }
}
