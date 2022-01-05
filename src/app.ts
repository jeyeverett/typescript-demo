/* DRAG AND DROP */
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface Droppable {
  dragOverHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
}

/* APPLICATION STATE MANAGEMENT */
enum ProjectStatus {
  Active = "active",
  Completed = "completed",
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (projects: T[]) => void;

class ProjectState {
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

/* VALIDATION */
interface Validatable {
  value: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
  const { value, required, minLength, maxLength, min, max } = input;
  let isValid = true;

  if (required) {
    isValid = isValid && value.trim().length !== 0;
  }

  if (minLength) {
    isValid = isValid && value.trim().length >= minLength;
  }

  if (maxLength) {
    isValid = isValid && value.trim().length <= maxLength;
  }

  if (min) {
    isValid = isValid && Number(value.trim()) >= min;
  }

  if (max) {
    isValid = isValid && Number(value.trim()) <= max;
  }

  return isValid;
}

function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false, //won't show up in a for loop
    get() {
      return originalMethod.bind(this);
    },
  };
  return newDescriptor;
}

/* COMPONENT BASE CLASS */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    position: InsertPosition,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElementId) as T;

    const element = document.importNode(this.templateElement.content, true);

    this.element = element.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attachElement(position);
  }

  private attachElement(position: InsertPosition) {
    this.hostElement.insertAdjacentElement(position, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

/* PROJECT LIST ITEM CLASS */
class ProjectItem
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

/* PROJECT LIST CLASS */
class ProjectList
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

/* PROJECT INPUT CLASS */
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private getUserInput(): [string, string, string] | void {
    const { value: titleInput } = this.titleInputElement;
    const { value: descInput } = this.descInputElement;
    const { value: peopleInput } = this.peopleInputElement;

    const validTitle: Validatable = {
      value: titleInput,
      required: true,
    };

    const validDesc: Validatable = {
      value: descInput,
      required: true,
      minLength: 10,
      maxLength: 200,
    };

    const validPeople: Validatable = {
      value: peopleInput,
      required: true,
      min: 1,
      max: 10,
    };

    if (validate(validTitle) && validate(validDesc) && validate(validPeople)) {
      return [titleInput, descInput, peopleInput];
    } else {
      alert("Invalid input, please try again");
      return;
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.getUserInput();

    if (Array.isArray(userInput)) {
      const [titleInput, descInput, peopleInput] = userInput;
      ProjectState.addProject(titleInput, descInput, Number(peopleInput));
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList(ProjectStatus.Active);
const completedProjectList = new ProjectList(ProjectStatus.Completed);
