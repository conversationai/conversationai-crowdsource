<iframe
  src="https://crowdsource-demo-dot-wikidetox.appspot.com"
  width="400"
  height="600"
  frameborder="0"
  scrolling="no"
  marginheight="0"
  marginwidth="0"
  ></iframe>

<cml:hidden
  default="test"
  question-label="Sample text field:"
  validates="required"
  value="test"
  name="question_comments">
</cml:hidden>

<cml:text label="Other concerns?"></cml:text>

<script>
  require(['jquery-noconflict'], function($) {
  //Ensure MooTools is where it must be
  Window.implement('$', function(el, nc){
  return document.id(el, nc, this.document);
  });

  var $ = window.jQuery;

  window.onmessage = function(e){
  console.log('got message', e.data);
  var data = JSON.parse(e.data);

  console.log('data from iFrame', data);
  $('.question_comments')[0].value = e.data;

  };
  });
</script>
