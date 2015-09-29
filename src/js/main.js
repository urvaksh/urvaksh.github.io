/*jshint esnext: true */

import $  from '../../node_modules/jquery/dist/jquery'
import Project  from './Project'
/*
var p = new Project({
  name: "Sheldon",
  tagLine: "A framework that detects changes and complains about them",
  url: "https://github.com/urvaksh/sheldon",
  build: "https://travis-ci.org/urvaksh/sheldon",
  icon: "",
  wiki_links: "https://raw.githubusercontent.com/wiki/urvaksh/Sheldon/"
});
*/

$(function(){
  
  $.get("./data/projects.json", function(projects){

    $.each(projects, function(n, project){

      var p = new Project(project);
      var projectDiv = $("<div></div>").append($("<h2 />").text(p.name));

      p.getWikiIndex(function(data){
        $.each(data, function(n, elem){
          $(projectDiv)
          .append(
            $("<a></a>").text(elem.name).attr({"href":"#","wiki-loc":elem.href})
            .click(function(){
              p.getWikiPage($(this).attr("wiki-loc"), function(result){
                var cover = $("<div></div>").addClass("markdown-body").append($(result));
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
