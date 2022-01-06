import Component from "./base.js";
import Autobind from "../decorators/autobind.js";
import { Project } from "../models/project.js";
import { Draggable } from "../models/drag-drop.js";

export default class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    return `${String(this.project.people)} ${
      this.project.people > 1 ? "people" : "person"
    } assigned.`;
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, "beforeend", project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @Autobind
  dragEndHandler(event: DragEvent): void {
    console.log(event);
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
