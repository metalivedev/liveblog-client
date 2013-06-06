liveblog-client provides a tool to automatically poll a liveblog.

v.1 Read data from Typepad-style RSS feeds.

Sample Usage:

``` javascript
<script type="text/javascript" src="http://live.ubergizmo.com/us/ajax/dynamic_files/liveblog.js"></script>
<script type="text/javascript">
              liveblog = new classLiveBlog("LiveBlogID", "http://live.ubergizmo.com/us/rss.xml");
	            //liveblog = new classLiveBlog("LiveBlogID", "./rss.xml");


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
	            liveblog.pollingStart(); // start in auto-pool
	            $('#polltoggle').click(visualToggle);
</script>
```
