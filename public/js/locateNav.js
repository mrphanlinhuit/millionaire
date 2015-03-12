/**
 * Created by linh on 3/12/2015.
 */
$(document).ready(function () {
    var pathName = window.location.pathname.substr(1, window.location.pathname.length);
    $('.nav li').removeClass('active');
    $('.nav li a').each(function () {
        if($(this).attr('href').substr(1, $(this).attr('href').length) === pathName){
            $(this).parent().addClass('active');
        }
    });
});