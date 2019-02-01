// Section's height
$(window).on('load resize', function(){
    var wHeight = $(window).height();
    $('section').each(function(e){
        $(this).css('height', wHeight - 150);
     });
});

$(document).ready(function(){
    // Menu functions
    $('a.anchor').on('click', function(e){
        var target = $(this).attr('href');

        if($(this).parent().hasClass('list-menu-item')){
            console.log($(this).parent());
            $(this).parent().addClass('active').siblings().removeClass('active');
        } else {
            $('.list-menu-item').removeClass('active');
        }
        smoothScroll(target);

        e.preventDefault();
    });
});

// SmoothScroll
function smoothScroll(target){
    $('html, body').animate({
        'scrollTop' : $(target).offset().top
    }, 300);
}
