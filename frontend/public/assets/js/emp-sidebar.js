jQuery('#jobMenuId1, #jobMenuId2, #msgMenuId1, #msgMenuId2').parent().parent(".sub-menu, .mega-menu").slideUp(500, function(){
    jQuery(this).parent().removeClass('nav-active');
});