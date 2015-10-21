/*jshint esnext: true */

import $  from '../../node_modules/jquery/dist/jquery'
import marked  from '../../node_modules/marked/lib/marked'
import sessionStorage  from './utils/sessionStorage'

export default class Project {
  constructor({name, tagLine, url, build, icon, wiki_links}={}) {
    this.name=name;
    this.tagLine = tagLine;
    this.url=url;
    this.build = build;
    this.icon = icon;
    this.wiki_links = wiki_links;
  }

  getWikiIndex(cb){

    if(this.wiki_links!==""){

      var projectKey = `Projects|${this.name}|wiki|index`;

      var pages = sessionStorage.getObject(projectKey);
      if(pages){
        cb(pages);
      }

      $.get(this.wiki_links+"_Sidebar.md")
      .done(function(markdown){
        var pages = [];
        $(marked(markdown))
        .find("a")
        .map(function(idx, elem){
          return {"name":$(elem).text(),"href":$(elem).attr("href")};
        })
        .each((n,p)=>pages.push(p));
        sessionStorage.setObject(projectKey,pages);
        cb(pages);
      });
    }else{
      cb([]);
    }
  }

  getWikiPage(href, cb){

    var callback = function(markdown){
      cb(marked(markdown));
    };

    var pageKey = `Projects|${this.name}|wiki|page|${href}`;
    var sessionData = sessionStorage.getString(pageKey);
    if(sessionData){
      callback (sessionData);
      return true;
    }

    $.get(this.wiki_links+href+'.md')
    .done(function(markdown){
      sessionStorage.setString(pageKey,markdown);
      callback(markdown);
      return true;
    });
  }

}
