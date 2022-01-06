import Component from "./base";
import Autobind from "../decorators/autobind";
import ProjectState from "../state/project-state";
import ProjectItem from "./project-item";
import { Droppable } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/project";

export default class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements Droppable
{
  private projects: Project[] = [];

  constructor(private type: ProjectStatus) {
    super("project-list", "app", "beforeend", `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault(); // default is to disallow drop events
      const listElement = this.element.querySelector("ul")!;
      listElement.classList.add("droppable");
    }
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const listElement = this.element.querySelector("ul")!;
    listElement.classList.remove("droppable");
  }

  @Autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    ProjectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Completed
    );
  }

  private renderProjects() {
    const ulElement = document.getElementById(
      `${this.type}-projects-list`
    ) as HTMLUListElement;

    ulElement.replaceChildren();

    for (const project of this.projects) {
      new ProjectItem(this.element.querySelector("ul")!.id, project);
    }
  }

  configure() {
    ProjectState.addListener((projects: Project[]) => {
      const filteredProjects = projects.filter((project) =>
        this.type === "active"
          ? project.status === ProjectStatus.Active
          : project.status === ProjectStatus.Completed
      );
      this.projects = filteredProjects;
      this.renderProjects();
    });

    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    (this.element.querySelector("ul") as HTMLUListElement).id = listId;
    (this.element.querySelector("h2") as HTMLHeadingElement).textContent = `${
      this.type[0].toUpperCase() + this.type.slice(1)
    } Projects`;
  }
}
