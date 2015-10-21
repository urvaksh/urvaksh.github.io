/*jshint esnext: true */
import Project from '../Project';
import marked from '../../../node_modules/marked';

class XMarkdownParserComponent extends HTMLElement {
  createdCallback() {
    this.innerHTML = this.mark(this.innerHTML);
  }

  mark(data){
    this.innerHTML = marked(data);
  }

}

export default document.registerElement('markdown-parse', XMarkdownParserComponent);
