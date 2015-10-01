/*jshint esnext: true */
/*
System.import('../../node_modules/jquery/dist/jquery').then(function($){
  System.import('../../node_modules/bootstrap/dist/js/bootstrap');
});
*/

import $  from '../../node_modules/jquery/dist/jquery';
//window.jQuery = $;
//import '../../node_modules/bootstrap/dist/js/bootstrap';
//import bootstrap  from './wrappers/bootstrap';
import Project  from './Project';

$(()=>{
  $.get("./data/projects.json", function(projects){

    $.each(projects, (n, project) => {

      var p = new Project(project);
      var projectDiv = $("<div></div>").append($("<h2 />").text(p.name));

      p.getWikiIndex(function(data){
        $.each(data, (n, elem) => {
          $(projectDiv)
          .append(
            $("<a></a>").text(elem.name).attr({"href":"#","wiki-loc":elem.href})
            .click(function(){
              p.getWikiPage($(this).attr("wiki-loc"), function(result){
                var cover = $("<div></div>").addClass("markdown-body").append($(result));
                $(cover).find("a[href]").filter(':not(a[href^=http])').attr("wiki-loc",$(this).attr("href"));
                $("#content").html(cover);
                return false;
              });
            })).append($("<br />"));
          });
          $("#menu").append(projectDiv);
        });
      });
    });
  });
