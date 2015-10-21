/*jshint esnext: true */

import jQuery from '../../node_modules/jquery';
//import jQuery from 'jquery';
//import '../../node_modules/bootstrap';
require('bootstrap');
import Project  from './Project';

import './component/project.js';
import './component/projectMarkdown.js';

jQuery(()=>{
  jQuery.get("./data/projects.json", function(projects){
    var event = new CustomEvent('projectData',{'detail' : projects});
    document.body.dispatchEvent(event);

    setTimeout(()=>{
      var autoload = window.location.hash.substring(1).split('/');
      if(autoload[0]==='Projects'){
        document.querySelector('x-project-index[projectName='+autoload[1]+']')
        .querySelector('a[wiki-loc='+autoload[2]+']')
        //.querySelector('a[href = '+window.location.hash+']')
        .click();
      }
    },1000);

  });
});
