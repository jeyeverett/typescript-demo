namespace App {
  /* APPLICATION STATE MANAGEMENT */
  type Listener<T> = (projects: T[]) => void;

  export class ProjectState {
    private static listeners: Listener<Project>[] = [];
    private static projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {}

    static getInstance() {
      if (this.instance) {
        return this.instance;
      } else {
        this.instance = new ProjectState();
        return this.instance;
      }
    }

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

  ProjectState.getInstance();
}
