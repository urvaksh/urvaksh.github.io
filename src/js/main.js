/*jshint esnext: true */

import $  from '../../node_modules/jquery/dist/jquery';
import Project  from './Project';

var p = new Project({
  name: "Sheldon",
  tagLine: "A framework that detects changes and complains about them",
  url: "https://github.com/urvaksh/sheldon",
  build: "https://travis-ci.org/urvaksh/sheldon",
  icon: "",
  wiki_links: "https://raw.githubusercontent.com/wiki/urvaksh/Sheldon/"
});



$(function(){
p.getWikiIndex(function(data){
  $.each(data, function(n, elem){
    $("#menu")
    	.append(
    		$("<a></a>").text(elem.name).attr({"href":"#","wiki-loc":elem.href})
    		.click(function(){
				p.getWikiPage($(this).attr("wiki-loc"), function(result){
				$(result).find("a[href]").attr({"href":"#"});
				$("#content").html(result);
				return false;
				})
			})).append($("<br />"));
  	});
});	

})