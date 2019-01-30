'use strict';

var currentTab = '#ufoa-tab';

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  if (target == '#simulation-tab') {
    $('#controls').css('display', 'inline-block');
    $('#help-btn').css('display', 'inline-block');
    $('#standards-btn').css('display', 'inline-block');
    $('#story-ufob').html('Select a situation to display the applicable standards.');
  } else {
    $('#controls').css('display', 'none');
    $('#help-btn').css('display', 'none');
    $('#standards-btn').css('display', 'none');
  }
  currentTab = target;
});

function gotoModel() {
  $('#model-page').css('display', 'block');
  $('#methodology-page').css('display', 'none');
  $('#about-page').css('display', 'none');
  $('#model-mi').addClass("active");
  $('#methodology-mi').removeClass("active");
  $('#about-mi').removeClass("active");
}

function gotoMethodology() {
  $('#model-page').css('display', 'none');
  $('#methodology-page').css('display', 'block');
  $('#about-page').css('display', 'none');
  $('#model-mi').removeClass("active");
  $('#methodology-mi').addClass("active");
  $('#about-mi').removeClass("active");
}

function gotoAbout() {
  $('#model-page').css('display', 'none');
  $('#methodology-page').css('display', 'none');
  $('#about-page').css('display', 'block');
  $('#model-mi').removeClass("active");
  $('#methodology-mi').removeClass("active");
  $('#about-mi').addClass("active");
}

function gotoEvaluation() {
  $('.nav-tabs a[href="#domain-tab"]').tab('show');
}
