var socket = io.connect(window.location.origin);
var $corner_stamp;
var $wrapper;


var Media = {

    newMediaToggle: false,

    bindNewMediaToggle: function() { 
      newMediaToggle ? this.unbindNewMedia() : this.bindNewMedia();
    },
    bindNewMedia: function() { 
      $(document).bind("newMedia", Media.onNewMedia);
      newMediaToggle = true;
      $corner_stamp_status.prepend("<p>Started listening for new instas</p>");
    },
    unbindNewMedia: function() { 
      $(document).unbind("newMedia");
      newMediaToggle = false;
      $corner_stamp_status.prepend("<p>Stopped listening for new instas</p>");
    },
    onNewMedia: function(ev) {
        //console.log(ev);
        var newMedia = _.reject(ev.media,function(m){
          return _.contains($('.element[data-uid]').map(function(){ return $(this).data('uid')}).get(),m.id);
        });

        $corner_stamp_status.prepend("<p>+ "+newMedia.length+" instas</p>");

        var flat_tags;
        flat_tags = _.reduceRight(newMedia, function(a, b) { 
          return a.concat(b.tags); 
        }, []) 

        $corner_stamp_status.prepend("<pre>"+flat_tags.join('\n')+"</pre>");

        var $extraElems = $wrapper.isotope('getItemElements')
        $extraElems = $extraElems.sort(function(a, b) {
          return $(a).data('created') - $(b).data('created');
        })
        $extraElems = $extraElems.slice(0,-23+newMedia.length);

        var d = new Date();

        var status = "<p class='small'> BEGIN "+d.toLocaleTimeString()+"</p><p class='small'>Removing "+$extraElems.length+" | ";

        $wrapper.isotope( 'remove', $extraElems)
          .isotope('layout'); 

        status += " "+$wrapper.isotope('getItemElements').length+" instas after removal | ";
        $(newMedia).each(function(index, media){
          var caption = (media.caption==null? "": media.caption.text) + " via " + media.user.username;
          var media_img = '<img data-uid="'+media.id+'" src="'+media.images.low_resolution.url+'" alt="'+caption+'" data-adaptive-background="1"/>';
          var $newItems = $('<div class="element" data-created="'+media.created_time+'" data-uid="'+media.id+'"><a target="_blank" href="'+media.link+'" title="'+caption+'">'+media_img+'</a></div>');
          $wrapper.prepend($newItems).isotope('prepended',$newItems );
        });
        $wrapper.imagesLoaded( function(){
          $wrapper.isotope({ sortBy: 'date',sortAscending: false}); 
          var d = new Date();
          $corner_stamp_status.prepend(status+" "+$wrapper.isotope('getItemElements').length+" total</p><p class='small'>END "+d.toLocaleTimeString()+"</p>");
        });


    }
  };

$(function(){

$corner_stamp = $('.stamp');
$corner_stamp_status = $('.stamp .status');

$wrapper = $('#wrapper')


var colorThief = new ColorThief();

$wrapper.imagesLoaded()
.always(function(instance){
  $wrapper.isotope({
    // options
    sortAscending: false,
    getSortData: {
        date: function (el) {
            return Date($(el).data('created'));
        }
    },
    itemSelector : '.element',
    masonry: {
      columnWidth: 4,//'.grid-sizer',
    }

  });
  $wrapper.isotope({ sortBy: 'date',sortAscending: false}); 
})
.progress( function( instance, image ) {
  var result = image.isLoaded ? 'loaded' : 'broken';
  try{
    var palette = colorThief.getPalette(image.img, 8);;
    for(var c in palette){
      $('.icon-loading path:eq('+c+')').css('fill','rgb('+palette[c][0]+','+palette[c][1]+','+palette[c][2]+')');
    }
  }catch(e){
    console.log('error:colorThief')
    console.log(e);
  }

});


socket.on('message', function(update){ 
  var data,tmp;
  try{
    tmp = update;
  }catch(e){
    // console.log('saved from crying due to set');
    // console.log(e);
  }
  //try{
    data = $.parseJSON(tmp);
    // console.log(data);
    $(document).trigger(data);
  // }catch(e){
  //   console.log('saved from crying due to parse');
  //   //console.log(tmp);
  //   console.log(e);
  // }
});

window.addEventListener("keydown", keyControls, false);
 
function keyControls(e) {
    switch(e.keyCode) {
        case 32:
            // spacebar pressed
            Media.bindNewMediaToggle();
            break;
        case 37:
            // left key pressed
            loader.directStream('backward');
            break;
        case 39:
            // right key pressed
            loader.directStream('forward');
            break;
    }   
}



Media.bindNewMedia();

})
