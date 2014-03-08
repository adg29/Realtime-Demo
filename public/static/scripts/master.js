var socket = io.connect(window.location.origin);
var $corner_stamp;
var $wrapper;

var Media = {
    onNewMedia: function(ev) {
        //console.log(ev);
        var $extraElems = $wrapper.data('isotope')
        .$filteredAtoms.filter( function( i ) {
          console.log(i%21);
          console.log('is it more than')
          console.log(21-ev.media.length)
          return i%21 >= 21-ev.media.length;
        });

        $corner_stamp.prepend("<p>Removing "+$extraElems.length+"</p>");
        $wrapper
        .isotope( 'remove', $extraElems, function() {
          $corner_stamp.prepend("<p>"+$wrapper.data('isotope').$filteredAtoms.length+" elements after removal</p>");
          $corner_stamp.prepend("<p>Adding "+ev.media.length+" more</p>");

          $(ev.media).each(function(index, media){
            // $corner_stamp.prepend("<pre>"+JSON.stringify(media)+"</pre>");
            // $corner_stamp.prepend("<img src='"+media.images.low_resolution.url+"'/>");

             var $newItems = $('<div class="element" data-index="'+index+'"><h3 class="user">'+media.user.username+'</h3><img src="'+media.images.low_resolution.url+'"/><div class="info"><div class="cols"></div></div></div>');
             $wrapper
              .prepend( $newItems );
          });
          $wrapper.imagesLoaded( function(){
            $wrapper.isotope( 'reloadItems' ).isotope({ sortBy: 'original-order' }); 
            $corner_stamp.prepend("<p>"+$wrapper.data('isotope').$filteredAtoms.length+" elements after prepending</p>");
          });


        });
    };
};

$(function(){

$corner_stamp = $('.corner-stamp');

$wrapper = $('#wrapper')

$wrapper.imagesLoaded( function(){
  $wrapper.isotope({
    // options
    itemSelector : '.element',
    layoutMode : 'fitRows'
  });
});


socket.on('message', function(update){ 
  var data,tmp;
  try{
    tmp = update;
  }catch(e){
    // console.log('saved from crying due to set');
    // console.log(e);
  }
  try{
    data = $.parseJSON(tmp);
    $corner_stamp.prepend("Incoming");
    $corner_stamp.prepend("<pre>"+JSON.stringify(data)+"</pre>");
    console.log(data);
    $(document).trigger(data);
  }catch(e){
    console.log('saved from crying due to parse');
    console.log(tmp);
    console.log(e);
  }
  try{
    console.log('');
    //console.log('on:message');
  }catch(e){
    // console.log('saved from crying due to trigger e');
    // console.log(data);
    // console.log(e);
  }
});

$(document).bind("newMedia", Media.onNewMedia)

})
