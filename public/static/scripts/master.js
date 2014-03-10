var socket = io.connect(window.location.origin);
var $corner_stamp;
var $wrapper;


$.Isotope.prototype._masonryResizeChanged = function() {
  return true;
};

$.Isotope.prototype._masonryReset = function() {
  // layout-specific props
  this.masonry = {};
  this._getSegments();
  var i = this.masonry.cols;
  this.masonry.colYs = [];
  while (i--) {
    this.masonry.colYs.push( 0 );
  }

  if ( this.options.masonry.cornerStampSelector ) {
    var $cornerStamp = this.element.find( this.options.masonry.cornerStampSelector ),
        stampWidth = $cornerStamp.outerWidth(true) - ( this.element.width() % this.masonry.columnWidth ),
        cornerCols = Math.ceil( stampWidth / this.masonry.columnWidth ),
        cornerStampHeight = $cornerStamp.outerHeight(true);
    for ( i = Math.max( this.masonry.cols - cornerCols, cornerCols ); i < this.masonry.cols; i++ ) {
      this.masonry.colYs[i] = cornerStampHeight;
    }
  }
};

var Media = {
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

        var $extraElems = $wrapper.data('isotope')
        .$filteredAtoms.filter( function( i,el ) {
          return i%23 >= 23-newMedia.length;
        });
        var d = new Date();
        d.toLocaleString();       // -> "2/1/2013 7:37:08 AM"
        d.toLocaleDateString();   // -> "2/1/2013"
        d.toLocaleTimeString();  // -> "7:38:05 AM"
        var status = "<p class='small'> BEGIN "+d.toLocaleTimeString()+"</p><p class='small'>Removing "+$extraElems.length+" | ";
        $wrapper
        .isotope( 'remove', $extraElems, function() {
          status += " "+$wrapper.data('isotope').$filteredAtoms.length+" instas after removal | ";
          //$corner_stamp.prepend("<p> + "+newMedia.length+"</p>");
          $(newMedia).each(function(index, media){
            // $corner_stamp.prepend("<pre>"+JSON.stringify(media)+"</pre>");
            // $corner_stamp.prepend("<img src='"+media.images.low_resolution.url+"'/>");
            var caption = (media.caption==null? "": media.caption.text) + " via " + media.user.username;
            var $newItems = $('<div class="element" data-created="'+media.created_time+'" data-uid="'+media.id+'"><a target="_blank" href="'+media.link+'" title="'+caption+'"><img src="'+media.images.low_resolution.url+'" alt="'+caption+'"/></a></div>');
              $wrapper
              .prepend( $newItems );
          });
          $wrapper.imagesLoaded( function(){
            $wrapper.isotope( 'reloadItems' ).isotope({ sortBy: 'date',sortAscending: true}); 
            var d = new Date();
            $corner_stamp_status.prepend(status+" "+$wrapper.data('isotope').$filteredAtoms.length+" total</p><p class='small'>END "+d.toLocaleTimeString()+"</p>");
          });


        });
    }
  };

$(function(){

$corner_stamp = $('.corner-stamp');
$corner_stamp_status = $('.corner-stamp .status');

$wrapper = $('#wrapper')

$wrapper.imagesLoaded( function(){
  $wrapper.isotope({
    // options
    sortAscending: true,
    getSortData: {
        date: function ($elem) {
            return Date($elem.data('created'));
        }
    },
    itemSelector : '.element',
    masonry: {
      columnWidth: 4,
      cornerStampSelector: '.corner-stamp'
    }

  });
  $wrapper.isotope( 'reloadItems' ).isotope({ sortBy: 'date',sortAscending: true}); 
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
    // console.log(data);
    $(document).trigger(data);
  }catch(e){
    console.log('saved from crying due to parse');
    //console.log(tmp);
    console.log(e);
  }
});

$(document).bind("newMedia", Media.onNewMedia)

})
