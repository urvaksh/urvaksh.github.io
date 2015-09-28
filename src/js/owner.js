/*jshint esnext: true */
import Project  from './project'

export default class Owner{
  constructor(name, project){
    this.ownerName = name;
    this.project = project;
  }

  toString(){
    return `${this.project} owned by ${this.ownerName}`;
  }

}
