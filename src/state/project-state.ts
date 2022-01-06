import { Project, ProjectStatus } from "../models/project";

type Listener<T> = (projects: T[]) => void;

export default class ProjectState {
  private static listeners: Listener<Project>[] = [];
  private static projects: Project[] = [];

  private constructor() {}

  static addListener(listenerFunc: Listener<Project>) {
    this.listeners.push(listenerFunc);
  }

  static addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString().slice(2),
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.projects.push(newProject);

    this.updateListeners();
  }

  static moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  static updateListeners() {
    for (const listenerFunc of this.listeners) {
      listenerFunc([...this.projects]);
    }
  }
}
