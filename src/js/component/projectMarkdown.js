/*jshint esnext: true */
import MarkdownComponent from './markdown.js';

export default class XProjectMarkdownParserComponent extends HTMLElement {

  createdCallback() {
    this.mdComponent = new MarkdownComponent();
    this.mdComponent.mark("");
    this.appendChild(this.mdComponent);

    document.body.addEventListener('loadMarkdown', e => {
      e.target.project.getWikiPage(e.detail, md => {
        this.mdComponent.mark(md);
      });
    });
  }

}

document.registerElement('project-markdown', XProjectMarkdownParserComponent);
