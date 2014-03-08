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
        $corner_stamp.prepend("<p>+ "+newMedia.length+" instas</p>");
        var $extraElems = $wrapper.data('isotope')
        .$filteredAtoms.filter( function( i,el ) {
          return i%21 >= 21-newMedia.length;
        });

        $corner_stamp.prepend("<p>Removing "+$extraElems.length+"</p>");
        $wrapper
        .isotope( 'remove', $extraElems, function() {
          $corner_stamp.prepend("<p>"+$wrapper.data('isotope').$filteredAtoms.length+" elements after removal</p>");
          $corner_stamp.prepend("<p>Adding "+newMedia.length+" more</p>");
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
            $corner_stamp.prepend("<p>"+$wrapper.data('isotope').$filteredAtoms.length+" elements after prepending</p>");
          });


        });
    }
  };

$(function(){

$corner_stamp = $('.corner-stamp');

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
    $corner_stamp.prepend("Incoming");
    $corner_stamp.prepend("<pre>"+JSON.stringify(data)+"</pre>");
    // console.log(data);
    $(document).trigger(data);
  }catch(e){
    console.log('saved from crying due to parse');
    console.log(tmp);
    console.log(e);
  }
});

$(document).bind("newMedia", Media.onNewMedia)

})
