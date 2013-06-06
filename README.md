liveblog-client provides a tool to automatically poll a liveblog.

v.1 Read data from Typepad-style RSS feeds.

Sample Usage:

```javascript
<script type="text/javascript" src="http://example.com/liveblog.js"></script>
<script type="text/javascript">
  liveblog = new classLiveBlog("LiveBlogID", "http://example.com/us/rss.xml");

  function visualToggle(){
    liveblog.pollingToggle();

    if(liveblog.polling()){
      $("#pollingOFF").hide();
      $("#pollingON").show("slow");
    }
    else {
      $("#pollingON").hide();
      $("#pollingOFF").show("slow");
    }
  }
			
  liveblog.poll();
  liveblog.pollingStart(); // start in auto-poll
  $('#polltoggle').click(visualToggle);
</script>
```
