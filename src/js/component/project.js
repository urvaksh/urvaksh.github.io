/*jshint esnext: true */
import Project from '../Project';
import Handlebars from '../../../node_modules/handlebars/dist/handlebars';

class XProjectMenuComponent extends HTMLElement {

  constructor(){
    super();
    this.template=null;
    this.project = null;
  }

  createdCallback() {
    var name = this.attributes.projectName.value;
    var templateString = this.attributes.template ?
      document.getElementById(this.attributes.template.value).innerHTML :
        super.innerHTML;

    this.template = Handlebars.compile(templateString);

    document.body.addEventListener('projectData', e => {
      e.detail.filter(p => name === p.name)
      .forEach(project => {
        var projectData = {title : project.name, links : []};
        var p = new Project(project);
        this.project=p;
        p.getWikiIndex((data) => {
          projectData.links = data;
          this.__render(projectData);
        });
      });
    });
  }

  __render(projectData){
    super.innerHTML = this.template(projectData);
    [].forEach.call(this.querySelectorAll("a"),elem=>{
      var markdownDest = elem.attributes["wiki-loc"].value;
      elem.addEventListener('click',(e)=>{
        var event = new CustomEvent('loadMarkdown',{'detail' : markdownDest, 'bubbles': true});
        this.dispatchEvent(event);
      });
    });
  }
}

export default document.registerElement('x-project-index', XProjectMenuComponent);
